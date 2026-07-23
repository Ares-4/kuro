import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const PaymentView = ({ application, onPaymentComplete }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Dynamic fee from database
  const applicationFeeString = application?.programs?.application_fee || "€250";
  const applicationFeeAmount = parseFloat(applicationFeeString.replace(/[^0-9.]/g, '')) || 250;
  
  const isPaid = application?.payment_status === 'paid';

  const handlePayment = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call your payment processor (Stripe)
      // For this demo, we'll simulate a successful payment to the backend
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { error } = await supabase
        .from('applications')
        .update({ 
          payment_status: 'paid',
          progress_step: 4, // Move to next step after payment
          updated_at: new Date()
        })
        .eq('id', application.id);

      if (error) throw error;

      toast({
        title: "Payment Successful",
        description: `Application fee of ${applicationFeeString} received.`,
      });

      if (onPaymentComplete) onPaymentComplete();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-2">Application Fee</h3>
        <p className="text-slate-400 mb-6">
          Securely pay your application fee to finalize your application.
        </p>

        {isPaid ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Payment Complete</h3>
            <p className="text-green-400">
              Your application fee has been paid successfully.
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Transaction ID: {application.payment_intent_id || 'TXN-' + application.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Fee Breakdown */}
            <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 bg-slate-800/30">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  Payment Summary
                </h4>
              </div>
              
              <div className="p-4 space-y-3">
                {/* Application Fee Line Item */}
                <div className="flex justify-between items-center text-white">
                  <span className="font-medium">Application Fee (Non-refundable)</span>
                  <span className="font-bold text-lg">{applicationFeeString}</span>
                </div>
                <p className="text-xs text-slate-500 pb-3 border-b border-slate-700/50">
                  One-time processing fee required to submit your application to the university.
                </p>

                <div className="bg-blue-900/20 rounded p-2 flex items-start gap-2 border border-blue-900/30">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-300">
                    <strong>Note:</strong> Tuition fees will be paid directly to the university after acceptance.
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-between items-center">
                <span className="text-slate-300 font-medium">Total Due Now</span>
                <span className="text-2xl font-bold text-white">{applicationFeeString}</span>
              </div>
            </div>

            {/* Payment Action */}
            <div className="border-t border-dashed border-slate-700 pt-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center gap-2 text-slate-400 bg-slate-900 px-4 py-2 rounded border border-slate-700 mb-2">
                  <Lock className="w-4 h-4 text-green-500" />
                  <span className="text-xs">Payments are processed securely via Stripe. We do not store your card details.</span>
                </div>
                
                <Button 
                  onClick={handlePayment} 
                  disabled={loading}
                  className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg shadow-lg shadow-blue-900/20"
                >
                  {loading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      Pay Application Fee with Stripe
                      <CreditCard className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
                
                <div className="flex items-center gap-4 text-slate-500">
                   <div className="flex gap-1">
                      <div className="w-8 h-5 bg-slate-700 rounded"></div>
                      <div className="w-8 h-5 bg-slate-700 rounded"></div>
                      <div className="w-8 h-5 bg-slate-700 rounded"></div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          Refund Policy
        </h4>
        <p className="text-sm text-slate-400 leading-relaxed">
          The application fee covers administrative costs and document verification services. This fee is generally non-refundable once the application process has started. If your application is rejected due to eligibility criteria that were clearly stated, the fee remains non-refundable. However, if we are unable to process your application due to technical issues on our end, a full refund will be issued.
        </p>
      </div>
    </div>
  );
};

export default PaymentView;