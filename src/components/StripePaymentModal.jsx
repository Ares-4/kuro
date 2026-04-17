import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle, Lock, RefreshCw, XCircle } from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe, createPaymentIntent, confirmPaymentIntent } from '@/lib/stripePaymentService';
import { generateEligibilityPDF } from '@/lib/pdfGenerationService';
import { supabase } from '@/lib/customSupabaseClient';
import { ELIGIBILITY_CHECK_FEE } from '@/config/paymentConfig';
import { useToast } from '@/components/ui/use-toast';

const CheckoutForm = ({ leadData, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [isElementReady, setIsElementReady] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.error("Stripe has not initialized yet.");
      return;
    }

    if (!isElementReady) {
       setError("Payment form is not fully loaded. Please wait a moment.");
       return;
    }

    setProcessing(true);
    setError(null);

    try {
      // 1. Submit Elements first (triggers validation)
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      // 2. Confirm Payment
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (confirmError) {
        if (confirmError.type === "card_error" || confirmError.type === "validation_error") {
             throw new Error(confirmError.message);
        } else {
             console.error("Stripe Confirm Error:", confirmError);
             throw new Error("An unexpected error occurred processing your payment.");
        }
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // 3. Validate with backend
        const confirmed = await confirmPaymentIntent(paymentIntent.id);
        
        // 4. Update Database
        await supabase.from('leads').update({
          payment_status: 'paid',
          payment_reference: confirmed.id,
          payment_amount: confirmed.amount,
          // We'll update the PDF URL after generation
        }).eq('id', leadData.id);

        toast({ title: "Payment Successful", description: "Generating your detailed report..." });

        // 5. Generate PDF
        let pdfUrl = null;
        try {
          pdfUrl = await generateEligibilityPDF(leadData);
          
          // Save PDF URL
          await supabase.from('leads').update({
            result_pdf_url: pdfUrl
          }).eq('id', leadData.id);
        } catch (pdfErr) {
          console.error("PDF Generation failed:", pdfErr);
          toast({ 
            variant: "destructive", 
            title: "Report Generation Warning", 
            description: "Payment received but report generation failed. Support has been notified." 
          });
        }

        // 6. Send Email (Backend task)
        try {
          await supabase.functions.invoke('send-eligibility-email', {
            body: { to: leadData.email, name: leadData.name, tier: leadData.tier, pdfUrl }
          });
        } catch (emailErr) {
          console.error("Email sending failed:", emailErr);
        }

        onSuccess(pdfUrl);
      }
    } catch (err) {
      console.error("Payment Submission Error:", err);
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-900 p-4 rounded-md border border-slate-800 relative min-h-[150px]">
         <div className="flex justify-between items-center mb-4">
            <span className="text-slate-400">Assessment Fee</span>
            <span className="text-2xl font-bold text-white">${ELIGIBILITY_CHECK_FEE}.00</span>
         </div>
         
         {!isElementReady && (
           <div className="absolute inset-0 top-16 flex items-center justify-center bg-slate-900/50 z-10 transition-opacity">
             <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
           </div>
         )}
         
         <PaymentElement 
            onReady={() => setIsElementReady(true)}
            options={{
              layout: 'tabs',
              paymentMethodOrder: ['card'],
            }}
            onChange={(event) => {
               // We can track completeness here
            }}
         />
      </div>
      
      {error && (
        <div className="flex items-start gap-2 text-red-400 bg-red-400/10 p-3 rounded-md text-sm border border-red-400/20" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> 
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={processing}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || !elements || !isElementReady || processing} 
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
          {processing ? 'Processing...' : `Pay $${ELIGIBILITY_CHECK_FEE}`}
        </Button>
      </div>
      <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" /> Secure payment powered by Stripe
      </div>
    </form>
  );
};

const StripePaymentModal = ({ isOpen, onClose, leadData }) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [successPdf, setSuccessPdf] = useState(null);
  const [initError, setInitError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const initializePayment = async () => {
      if (!isOpen || !leadData || successPdf) return;

      // Only reset if we are not already successful
      setInitError(null);
      setClientSecret(null);

      try {
        const secret = await createPaymentIntent(ELIGIBILITY_CHECK_FEE, leadData.id, leadData.email);
        if (mounted) setClientSecret(secret);
      } catch (err) {
        console.error("Failed to initialize payment intent:", err);
        if (mounted) setInitError(err.message || "Failed to initialize payment system. Please check your connection.");
      }
    };

    initializePayment();

    return () => { mounted = false; };
  }, [isOpen, leadData, retryCount, successPdf]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleManualClose = () => {
    // Only verify close if user explicitly clicks close button or outside
    if (!successPdf) {
      // Maybe confirm if they want to abandon?
    }
    onClose();
  };

  if (successPdf) {
    return (
      <Dialog open={isOpen} onOpenChange={handleManualClose}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-md">
           <DialogHeader>
             <DialogTitle className="text-center text-2xl font-bold">Payment Successful!</DialogTitle>
             <DialogDescription className="text-center text-slate-400">
               Your eligibility report has been generated.
             </DialogDescription>
           </DialogHeader>
           
           <div className="text-center py-6 space-y-6">
             <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500 animate-in zoom-in duration-300">
               <CheckCircle2 className="w-10 h-10" />
             </div>
             
             <div className="space-y-2">
               <p className="text-slate-300">
                 A copy has been sent to <span className="text-white font-medium">{leadData.email}</span>.
               </p>
               <p className="text-sm text-slate-500">
                 Transaction ID: {leadData.payment_reference || 'Pending...'}
               </p>
             </div>

             <div className="space-y-3 pt-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg" onClick={() => window.open(successPdf, '_blank')}>
                  Download Report PDF
                </Button>
                <Button variant="ghost" onClick={handleManualClose} className="text-slate-500 hover:text-white w-full">
                  Close Window
                </Button>
             </div>
           </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleManualClose()}>
      <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-md" aria-describedby="payment-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Complete Your Assessment</DialogTitle>
          <DialogDescription id="payment-description" className="text-slate-400 text-sm">
             Securely pay the one-time fee to unlock your detailed eligibility tier and download your official report.
          </DialogDescription>
        </DialogHeader>

        {initError ? (
           <div className="text-red-400 text-center py-8 space-y-4">
             <div className="flex justify-center mb-2">
               <XCircle className="w-12 h-12 opacity-80" />
             </div>
             <div className="space-y-1">
                <h3 className="font-semibold text-white">Connection Error</h3>
                <p className="px-4 text-sm opacity-90">{initError}</p>
             </div>
             <div className="flex gap-3 px-4 pt-4">
                <Button variant="outline" onClick={handleManualClose} className="flex-1">Cancel</Button>
                <Button onClick={handleRetry} className="flex-1 bg-slate-800 hover:bg-slate-700">
                  <RefreshCw className="w-4 h-4 mr-2" /> Retry
                </Button>
             </div>
           </div>
        ) : !clientSecret ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="text-slate-500 text-sm">Initializing secure payment...</p>
          </div>
        ) : (
          <Elements stripe={getStripe()} options={{ clientSecret, appearance: { theme: 'night', labels: 'floating' } }}>
            <CheckoutForm 
              leadData={leadData} 
              onSuccess={setSuccessPdf} 
              onCancel={handleManualClose} 
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StripePaymentModal;