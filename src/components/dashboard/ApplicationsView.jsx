// src/components/dashboard/ApplicationsView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle, Clock, AlertCircle, Loader2, Eye, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { useToast } from '@/components/ui/use-toast';
import { ProgressTracker } from '@/components/ui/progress-tracker';

const DEFAULT_REQUIREMENTS = ['Passport Copy', 'High School Transcript', 'English Proficiency Result'];

const ApplicationsView = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState(null); // `${appId}-${docName}`

  useEffect(() => {
    if (user) fetchMyApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const normalizeApplicationDocs = (app) => {
    // DB may contain:
    // - documents: JSON object { [reqName]: { path, name, uploaded_at, status } }
    // - documents: array (older version) -> treat as empty, because your new ApplicationPage expects object
    const docsObj = app?.documents && !Array.isArray(app.documents) ? app.documents : {};

    const requirements =
      Array.isArray(app?.programs?.requirements) && app.programs.requirements.length > 0
        ? app.programs.requirements
        : DEFAULT_REQUIREMENTS;

    const mergedDocs = requirements.map((reqName) => {
      const existing = docsObj?.[reqName];
      const uploaded = !!existing?.path;

      return {
        name: reqName,
        status: existing?.status || (uploaded ? 'uploaded' : 'pending'),
        path: existing?.path || null, // IMPORTANT: private bucket -> we store path, not a public URL
        uploadedAt: existing?.uploaded_at || null,
        originalName: existing?.name || null,
      };
    });

    return {
      ...app,
      _documentsObj: docsObj, // keep the real object for updates
      documents: mergedDocs, // UI-friendly array
    };
  };

  const fetchMyApplications = async () => {
    try {
      setLoading(true);

      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (studentError) throw studentError;

      if (!studentData) {
        setApplications([]);
        return;
      }

      const { data, error } = await supabase
        .from('applications')
        .select(
          `
          *,
          programs (program_name, university, image_url, requirements, application_fee)
        `
        )
        .eq('student_id', studentData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedApps = (data || []).map(normalizeApplicationDocs);
      setApplications(processedApps);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load applications.' });
    } finally {
      setLoading(false);
    }
  };

  const getNextAction = (app) => {
    const status = (app?.status || '').toLowerCase();
    const paymentStatus = (app?.payment_status || '').toLowerCase();
    const isPaid = status === 'paid' || paymentStatus === 'paid';

    // Draft -> continue documents
    if (status === 'draft') return { label: 'Continue Application', intent: 'continue' };

    // Submitted but not paid -> pay
    if ((status === 'submitted' || status === 'payment_pending') && !isPaid) return { label: 'Continue to Payment', intent: 'pay' };

    // Paid/reviewing/etc
    return { label: 'View Details', intent: 'view' };
  };

  const handleGoToApplication = (appId) => {
    // This solves your “no continue button” problem:
    // the student always has a single path back into the flow.
    window.location.href = `/dashboard/application/${appId}`;
  };

  const handleFileUpload = async (event, app, docName) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user?.id) {
      toast({ variant: 'destructive', title: 'Not signed in', description: 'Please sign in again and retry.' });
      event.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File too large', description: 'Maximum file size is 5MB.' });
      event.target.value = '';
      return;
    }

    setUploadingDoc(`${app.id}-${docName}`);

    try {
      const fileExt = file.name.split('.').pop() || 'bin';
      const safeDocName = docName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const filePath = `${user.id}/${app.id}/${safeDocName}.${fileExt}`;

      // Upload to Supabase Storage (PRIVATE bucket)
      const { error: uploadError } = await supabase.storage
        .from('student-documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Update documents JSON object in DB (matches your ApplicationPage approach)
      const currentObj = app._documentsObj && !Array.isArray(app._documentsObj) ? app._documentsObj : {};
      const updatedObj = {
        ...currentObj,
        [docName]: {
          uploaded_at: new Date().toISOString(),
          name: file.name,
          path: filePath,
          status: 'uploaded',
        },
      };

      const { error: dbError } = await supabase
        .from('applications')
        .update({ documents: updatedObj, updated_at: new Date().toISOString() })
        .eq('id', app.id);

      if (dbError) throw dbError;

      // Update local state
      setApplications((prev) =>
        prev.map((a) => {
          if (a.id !== app.id) return a;
          const next = normalizeApplicationDocs({ ...a, documents: updatedObj }); // normalize expects DB shape
          return next;
        })
      );

      toast({ title: 'Success', description: `${docName} uploaded successfully.` });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ variant: 'destructive', title: 'Upload Failed', description: error?.message || 'Upload failed.' });
    } finally {
      setUploadingDoc(null);
      event.target.value = '';
    }
  };

  const handleViewDocument = useCallback(
    async (doc) => {
      try {
        if (!doc?.path) {
          toast({ variant: 'destructive', title: 'Unavailable', description: 'Document path not found.' });
          return;
        }

        const { data, error } = await supabase.storage.from('student-documents').createSignedUrl(doc.path, 3600);
        if (error) throw error;

        if (data?.signedUrl) {
          window.open(data.signedUrl, '_blank', 'noreferrer');
          return;
        }

        throw new Error('No signed URL returned.');
      } catch (e) {
        console.error('Signed URL error:', e);
        toast({ variant: 'destructive', title: 'Could not open document', description: 'Please try again.' });
      }
    },
    [toast]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <BackButton label="Back to Dashboard" />

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Applications</h1>
        <p className="text-slate-400">Track status and manage documents for your university applications.</p>
      </div>

      <div className="space-y-8">
        {applications.map((app) => {
          const action = getNextAction(app);
          const status = (app.status || '').toLowerCase();

          const statusChipClass =
            status === 'approved' || status === 'accepted'
              ? 'bg-green-500/10 text-green-400'
              : status === 'rejected'
              ? 'bg-red-500/10 text-red-400'
              : status === 'draft'
              ? 'bg-slate-500/10 text-slate-300'
              : 'bg-yellow-500/10 text-yellow-500';

          const statusIcon =
            status === 'approved' || status === 'accepted' ? (
              <CheckCircle className="w-4 h-4" />
            ) : status === 'rejected' ? (
              <AlertCircle className="w-4 h-4" />
            ) : status === 'draft' ? (
              <Clock className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            );

          return (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden shadow-lg"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-white">{app.programs?.program_name || 'Program Name'}</h3>
                  <p className="text-blue-400">{app.programs?.university || 'University Name'}</p>
                  <p className="text-xs text-slate-500 mt-1">Application ID: {app.id.slice(0, 8)}</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusChipClass}`}>
                    {statusIcon}
                    <span className="capitalize">{app.status || 'Pending Review'}</span>
                  </div>

                  {/* THIS IS THE MISSING “CONTINUE” CONTROL */}
                  <Button
                    onClick={() => handleGoToApplication(app.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {action.label} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="p-6 bg-slate-900/50 border-b border-slate-700">
                <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-6">Application Progress</h4>
                <div className="px-2 pb-6">
                  <ProgressTracker currentStep={app.progress_step || 1} />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 grid md:grid-cols-2 gap-8">
                {/* Documents */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Required Documents</h4>
                  <div className="space-y-3">
                    {app.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileText
                            className={`w-4 h-4 flex-shrink-0 ${
                              doc.status === 'uploaded' ? 'text-green-400' : 'text-slate-400'
                            }`}
                          />
                          <div className="min-w-0">
                            <span className="text-sm text-white block truncate">{doc.name}</span>
                            <span
                              className={`text-xs block ${
                                doc.status === 'uploaded' ? 'text-green-500' : 'text-slate-500'
                              }`}
                            >
                              {doc.status === 'uploaded' ? 'Uploaded' : 'Pending Upload'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {doc.status === 'uploaded' && doc.path && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-blue-400 hover:text-blue-300"
                              onClick={() => handleViewDocument(doc)}
                              title="View Document"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          <div className="relative">
                            <input
                              type="file"
                              id={`file-${app.id}-${idx}`}
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, app, doc.name)}
                              disabled={uploadingDoc === `${app.id}-${doc.name}`}
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            />
                            <Button
                              asChild
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 cursor-pointer"
                              disabled={uploadingDoc === `${app.id}-${doc.name}`}
                            >
                              <label htmlFor={`file-${app.id}-${idx}`}>
                                {uploadingDoc === `${app.id}-${doc.name}` ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <>
                                    <Upload className="w-3 h-3 mr-1" />
                                    {doc.status === 'uploaded' ? 'Re-upload' : 'Upload'}
                                  </>
                                )}
                              </label>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {app.documents.length === 0 && (
                      <div className="text-sm text-slate-500 italic">No specific documents required yet.</div>
                    )}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Next Steps</h4>

                  <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-4">
                    <p className="text-blue-200 text-sm leading-relaxed">
                      {(app.progress_step === 1 || status === 'draft') &&
                        'Your application is in progress. Upload all required documents, then submit to proceed to payment.'}
                      {app.progress_step === 2 &&
                        'Your application has been submitted. Please complete the application fee payment to proceed.'}
                      {app.progress_step === 3 &&
                        'Payment received. Our team is verifying your documents. We will contact you if any corrections are needed.'}
                      {app.progress_step >= 4 &&
                        'Your application is moving forward. Keep an eye on messages and updates inside your application.'}
                      {!app.progress_step && 'Please complete your profile to proceed.'}
                    </p>

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        className="border-blue-600 text-blue-300 hover:bg-blue-600/10"
                        onClick={() => handleGoToApplication(app.id)}
                      >
                        Open Application <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2 text-slate-300 text-sm font-medium">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      <span>Need Help?</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      If you are having trouble uploading documents, please contact support via the chat widget or email
                      us at support@kuroedu.com.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {applications.length === 0 && (
          <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-1">No active applications</h3>
            <p className="text-slate-400 text-sm mb-4">You haven't applied to any programs yet.</p>
            <Button
              onClick={() => (window.location.href = '/dashboard/programs')}
              variant="outline"
              className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
            >
              Browse Programs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsView;