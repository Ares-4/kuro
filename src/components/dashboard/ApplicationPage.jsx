import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  Building2,
  MapPin,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Upload,
  CreditCard,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Lock,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Sub-component to handle signed URLs for documents
const DocumentLink = ({ path, children, className }) => {
  const [signedUrl, setSignedUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!path) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.storage
          .from('student-documents')
          .createSignedUrl(path, 3600); // 1 hour

        if (!error && data?.signedUrl) {
          setSignedUrl(data.signedUrl);
        }
      } catch (e) {
        console.error('Error signing URL', e);
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUrl();
  }, [path]);

  if (loading)
    return (
      <span className="text-xs text-slate-500 flex items-center gap-1">
        <Loader2 className="w-3 h-3 animate-spin" /> Loading...
      </span>
    );

  if (!signedUrl) return <span className="text-xs text-red-400">Unavailable</span>;

  return (
    <a href={signedUrl} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
};

const ApplicationPage = () => {
  const { applicationId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [adminNotes, setAdminNotes] = useState([]);

  const tabStorageKey = `kuro_app_${applicationId}_last_tab`;

  // Persist active tab per application
  useEffect(() => {
    if (!applicationId) return;
    try {
      localStorage.setItem(tabStorageKey, activeTab);
    } catch (_) {
      // ignore storage failures
    }
  }, [applicationId, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchApplication();
    checkPaymentStatus();
    fetchAdminNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, location.search]);

  const fetchAdminNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('application_notes')
        .select('*')
        .eq('application_id', applicationId)
        .eq('is_visible_to_student', true)
        .order('created_at', { ascending: false });

      if (!error) setAdminNotes(data || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  const checkPaymentStatus = async () => {
    const params = new URLSearchParams(location.search);
    const paymentSuccess = params.get('payment_success');
    const sessionId = params.get('session_id');

    if (paymentSuccess === 'true' && sessionId) {
      try {
        setProcessingPayment(true);

        const { error } = await supabase
          .from('applications')
          .update({
            status: 'paid',
            payment_status: 'paid',
            payment_intent_id: sessionId,
            progress_step: 3,
            updated_at: new Date().toISOString(),
          })
          .eq('id', applicationId);

        if (error) throw error;

        toast({
          title: 'Payment Successful!',
          description: 'Your application fee has been processed. Your application is now moving to the next stage.',
        });

        // Clean URL
        navigate(location.pathname, { replace: true });

        // Refresh data
        fetchApplication();
      } catch (error) {
        console.error('Error updating payment status:', error);
        toast({
          variant: 'destructive',
          title: 'Payment Update Failed',
          description: "Payment was successful but we couldn't update your application status. Please contact support.",
        });
      } finally {
        setProcessingPayment(false);
      }
    }
  };

  const fetchApplication = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('applications')
        .select(
          `
          *,
          programs (
            id,
            program_name,
            university,
            country,
            image_url,
            degree_level,
            duration,
            tuition_fee,
            application_fee,
            requirements
          )
        `
        )
        .eq('id', applicationId)
        .single();

      if (error) throw error;

      if (!data.documents) data.documents = {};

      setApplication(data);

      // Auto-switch tabs based on status (highest priority),
      // otherwise restore last tab from localStorage.
      try {
        const saved = localStorage.getItem(tabStorageKey);
        const allowed = ['overview', 'documents', 'payment'];

        if (data.status === 'draft') {
          setActiveTab('documents');
        } else if (data.status === 'submitted' || data.status === 'payment_pending') {
          setActiveTab('payment');
        } else if (saved && allowed.includes(saved)) {
          setActiveTab(saved);
        } else {
          setActiveTab('overview');
        }
      } catch (_) {
        if (data.status === 'draft') setActiveTab('documents');
        else if (data.status === 'submitted' || data.status === 'payment_pending') setActiveTab('payment');
        else setActiveTab('overview');
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading application',
        description: 'Could not find the requested application details.',
      });
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event, docName) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user?.id) {
      toast({
        variant: 'destructive',
        title: 'Not signed in',
        description: 'Please sign in again and retry the upload.',
      });
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB.',
      });
      event.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop() || 'bin';
      const safeDocName = docName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const filePath = `${user.id}/${applicationId}/${safeDocName}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('student-documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const updatedDocuments = {
        ...(application?.documents || {}),
        [docName]: {
          uploaded_at: new Date().toISOString(),
          name: file.name,
          path: filePath,
          status: 'uploaded',
        },
      };

      const { error: updateError } = await supabase.from('applications').update({ documents: updatedDocuments }).eq('id', applicationId);

      if (updateError) throw updateError;

      setApplication((prev) => ({
        ...(prev || {}),
        documents: updatedDocuments,
      }));

      toast({
        title: 'Document Uploaded',
        description: `${docName} has been successfully uploaded.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'There was an error uploading your document. Please try again.',
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSubmitApplication = async () => {
    if (!application) return;

    const requiredDocs = application.programs?.requirements || [];
    const uploadedDocs = Object.keys(application.documents || {});
    const missingDocs = requiredDocs.filter((req) => !uploadedDocs.includes(req));

    if (missingDocs.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Missing Documents',
        description: `Please upload: ${missingDocs.join(', ')}`,
      });
      setActiveTab('documents');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status: 'submitted',
          progress_step: 2,
          submitted_at: new Date().toISOString(),
          payment_status: 'pending',
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: 'Application Submitted!',
        description: 'Your application is now ready for payment.',
      });

      await fetchApplication();
      setActiveTab('payment');
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Could not submit application. Please try again later.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!application) return;

    setProcessingPayment(true);
    try {
      const feeString = application.programs?.application_fee || '50';
      const amount = parseFloat(String(feeString).replace(/[^0-9.]/g, '')) || 50;

      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: JSON.stringify({
          applicationId: application.id,
          amount,
          currency: 'eur',
          programName: `Application Fee: ${application.programs?.program_name}`,
          successUrl: `${window.location.origin}/dashboard/application/${applicationId}?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/dashboard/application/${applicationId}?payment_cancelled=true`,
        }),
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Connection failed');
      }

      if (data?.error) throw new Error(data.error);

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error('No payment URL returned from server.');
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast({
        variant: 'destructive',
        title: 'Payment Initialization Failed',
        description: "We couldn't reach the payment gateway. Please try again in a few moments.",
      });
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
        <p>Loading application details...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-slate-800 p-6 rounded-full mb-4">
          <FileText className="w-12 h-12 text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Application Not Found</h2>
        <Link to="/dashboard/applications">
          <Button variant="secondary">Back to My Applications</Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'reviewing':
      case 'submitted':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'draft':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    }
  };

  const isDraft = application.status === 'draft';
  const isSubmitted = application.status === 'submitted';
  const isPaid = application.status === 'paid' || application.payment_status === 'paid';

  const requiredDocs = application.programs?.requirements || ['Passport', 'Transcripts', 'Resume'];
  const uploadedDocs = Object.keys(application.documents || {});
  const missingDocs = requiredDocs.filter((req) => !uploadedDocs.includes(req));
  const isReadyToSubmit = missingDocs.length === 0;

  const steps = [
    { label: 'Started', status: 'completed', date: new Date(application.created_at).toLocaleDateString() },
    { label: 'Documents', status: application.progress_step >= 2 ? 'completed' : 'current' },
    {
      label: 'Fee Payment',
      status:
        application.progress_step >= 3 ? 'completed' : application.progress_step === 2 ? 'current' : 'upcoming',
    },
    {
      label: 'Review',
      status:
        application.progress_step >= 4 ? 'completed' : application.progress_step === 3 ? 'current' : 'upcoming',
    },
    {
      label: 'Completion',
      status: application.progress_step >= 6 ? 'completed' : application.progress_step >= 5 ? 'current' : 'upcoming',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div>
          <Link
            to="/dashboard/applications"
            className="inline-flex items-center text-sm text-slate-400 hover:text-blue-400 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Applications
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Application #{application.id.slice(0, 8)}
            <Badge className={cn('capitalize border', getStatusColor(application.status))}>
              {application.status === 'draft' ? 'In Progress' : application.status}
            </Badge>
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-700 text-slate-300">
            Contact Support
          </Button>
          {application.status === 'accepted' && (
            <Button className="bg-green-600 hover:bg-green-700 text-white">Accept Offer</Button>
          )}
        </div>
      </div>

      {/* Admin Notes Display */}
      {adminNotes.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Messages from Admin
          </h3>
          {adminNotes.map((note) => (
            <Alert key={note.id} className="bg-blue-500/10 border-blue-500/20 text-blue-200">
              <AlertDescription className="text-sm">
                <span className="font-semibold block text-blue-100 mb-1">
                  {new Date(note.created_at).toLocaleDateString()}:
                </span>
                {note.note_text}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {isDraft && (
        <Alert className="bg-yellow-500/10 border-yellow-500/20 text-yellow-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            Your application is currently in draft mode. Please upload all required documents below to submit your
            application for review.
          </AlertDescription>
        </Alert>
      )}

      {isSubmitted && !isPaid && (
        <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-200">
          <CreditCard className="h-4 w-4" />
          <AlertTitle>Payment Required</AlertTitle>
          <AlertDescription>
            Your documents have been submitted. Please complete the application fee payment to proceed to the review
            stage.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-800/50 border-slate-700 overflow-x-auto">
            <CardHeader>
              <CardTitle className="text-lg">Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative flex justify-between min-w-[500px]">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center z-10 relative">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 bg-slate-900',
                        step.status === 'completed'
                          ? 'border-green-500 text-green-500'
                          : step.status === 'current'
                          ? 'border-blue-500 text-blue-500'
                          : step.status === 'error'
                          ? 'border-red-500 text-red-500'
                          : 'border-slate-600 text-slate-600'
                      )}
                    >
                      {step.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : step.status === 'error' ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-xs font-bold">{idx + 1}</span>
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs mt-2 font-medium',
                        step.status === 'current' ? 'text-blue-400' : 'text-slate-400'
                      )}
                    >
                      {step.label}
                    </span>
                    {step.date && <span className="text-[10px] text-slate-500 mt-1">{step.date}</span>}
                  </div>
                ))}
                <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-700 -z-0"></div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents" className="relative">
                Documents
                {isDraft && missingDocs.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </TabsTrigger>
              <TabsTrigger value="payment" disabled={isDraft}>
                Payment
                {isSubmitted && !isPaid && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg">Program Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 uppercase tracking-wider">University</span>
                      <p className="font-medium text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        {application.programs?.university}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 uppercase tracking-wider">Location</span>
                      <p className="font-medium text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        {application.programs?.country}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 uppercase tracking-wider">Degree Level</span>
                      <p className="font-medium text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        {application.programs?.degree_level}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 uppercase tracking-wider">Duration</span>
                      <p className="font-medium text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        {application.programs?.duration}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg">Required Documents</CardTitle>
                  <CardDescription className="text-slate-400">
                    {isDraft ? 'Upload all required documents to enable submission.' : 'Review your submitted documents.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {requiredDocs.map((req, idx) => {
                    const isUploaded = uploadedDocs.includes(req);
                    const docData = application.documents?.[req];

                    return (
                      <div
                        key={idx}
                        className={cn(
                          'flex items-center justify-between p-4 rounded-lg border transition-all',
                          isUploaded ? 'bg-slate-900/50 border-green-500/30' : 'bg-slate-900/30 border-slate-700/50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                              isUploaded ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-400'
                            )}
                          >
                            {isUploaded ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-xs">{req}</p>
                            {isUploaded ? (
                              <DocumentLink
                                path={docData?.path}
                                className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                              >
                                View File <ChevronRight className="w-3 h-3" />
                              </DocumentLink>
                            ) : (
                              <p className="text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Required
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {(isDraft || !isUploaded) && (
                            <div className="relative">
                              <input
                                type="file"
                                id={`upload-${idx}`}
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={(e) => handleFileUpload(e, req)}
                                disabled={uploading || isPaid}
                              />
                              <Button
                                variant={isUploaded ? 'ghost' : 'outline'}
                                size="sm"
                                className={cn(
                                  'gap-2',
                                  isUploaded
                                    ? 'text-slate-400 hover:text-white'
                                    : 'border-blue-500/50 text-blue-400 hover:bg-blue-500/10'
                                )}
                                onClick={() => document.getElementById(`upload-${idx}`)?.click()}
                                disabled={uploading || isPaid}
                              >
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                {isUploaded ? 'Replace' : 'Upload'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>

                {isDraft && (
                  <CardFooter className="flex flex-col gap-4 border-t border-slate-700 pt-6">
                    <div className="w-full flex justify-between items-center bg-slate-900/50 p-4 rounded-lg">
                      <span className="text-sm text-slate-400">
                        {uploadedDocs.length} / {requiredDocs.length} Documents Ready
                      </span>
                      {isReadyToSubmit ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Ready to Submit</Badge>
                      ) : (
                        <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                          Incomplete
                        </Badge>
                      )}
                    </div>

                    <Button className="w-full h-12 text-base" onClick={handleSubmitApplication} disabled={!isReadyToSubmit || submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          Submit &amp; Proceed to Payment <ChevronRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>

                    {!isReadyToSubmit && (
                      <p className="text-xs text-center text-red-400">* Please upload all required documents to proceed.</p>
                    )}
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="mt-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg">Application Fee</CardTitle>
                  <CardDescription className="text-slate-400">
                    Securely pay your application fee to finalize your application.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-6 text-center border-2 border-dashed border-slate-700 rounded-lg bg-slate-900/30">
                    <CreditCard className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <h3 className="text-white font-medium mb-1">Application Fee</h3>
                    <p className="text-3xl font-bold text-white mb-6">{application.programs?.application_fee || '€50'}</p>

                    {isPaid ? (
                      <div className="flex flex-col items-center gap-2">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50 px-6 py-2 text-base">
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Payment Complete
                        </Badge>
                        <p className="text-sm text-slate-400 mt-2">
                          Transaction ID:{' '}
                          <span className="font-mono text-slate-300">{application.payment_intent_id?.slice(0, 16)}...</span>
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-w-md mx-auto">
                        {isSubmitted ? (
                          <div className="space-y-3">
                            <Alert className="bg-blue-500/10 border-blue-500/20 text-left">
                              <Lock className="w-4 h-4 text-blue-400" />
                              <AlertDescription className="text-blue-200 text-xs">
                                Payments are processed securely via Stripe. We do not store your card details.
                              </AlertDescription>
                            </Alert>

                            <Button
                              size="lg"
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={handlePayment}
                              disabled={processingPayment}
                            >
                              {processingPayment ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                                </>
                              ) : (
                                <>
                                  Pay Application Fee with Stripe <ChevronRight className="w-4 h-4 ml-2" />
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-800 rounded text-slate-400 text-sm">
                            Please submit your application documents first to enable payment.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-800 border-slate-700 overflow-hidden">
            <div className="h-32 bg-slate-700 relative">
              {application.programs?.image_url && (
                <img src={application.programs.image_url} alt="University" className="w-full h-full object-cover opacity-80" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            </div>

            <CardContent className="-mt-8 relative z-10 pt-0">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg mb-3">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-white text-lg">{application.programs?.program_name}</h3>
              <p className="text-slate-400 text-sm mb-4">{application.programs?.university}</p>

              <div className="space-y-3 pt-4 border-t border-slate-700">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Status</span>
                  <Badge className={cn('text-xs', getStatusColor(application.status))}>{application.status}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Created</span>
                  <span className="text-white">{new Date(application.created_at).toLocaleDateString()}</span>
                </div>
                {application.submitted_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Submitted</span>
                    <span className="text-white">{new Date(application.submitted_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 border-blue-900/50">
            <CardContent className="p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-100 text-sm mb-1">Need Help?</h4>
                <p className="text-xs text-blue-300">Our counselors are available to help you with your application process.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationPage;