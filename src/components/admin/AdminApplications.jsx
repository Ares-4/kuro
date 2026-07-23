import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import {
  Search, MoreHorizontal, FileText, CheckCircle, XCircle, Clock,
  RefreshCw, Eye, Trash2, Mail, Phone, Loader2, X, Download,
  Copy, ClipboardCheck, Globe, GraduationCap, MapPin, DollarSign,
  User, Calendar, CreditCard, CheckSquare, Square, ExternalLink,
  ChevronRight, Briefcase, BookOpen, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { AdminTable } from '@/components/admin/ui/AdminTable';

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    reviewing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    submitted: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    accepted: "bg-green-500/10 text-green-500 border-green-500/20",
    rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    incomplete: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };
  return (
    <Badge variant="outline" className={`${styles[status] || styles.pending} capitalize`}>
      {status || 'pending'}
    </Badge>
  );
};

const DocRow = ({ label, path, studentUserId }) => {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!path) return;
    setLoading(true);
    supabase.storage.from('student-documents')
      .createSignedUrl(path, 3600)
      .then(({ data }) => { if (data?.signedUrl) setUrl(data.signedUrl); })
      .finally(() => setLoading(false));
  }, [path]);

  if (!path) return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/40 border border-slate-800">
      <div className="flex items-center gap-2">
        <Square className="w-4 h-4 text-slate-600" />
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <span className="text-xs text-slate-600 italic">Not uploaded</span>
    </div>
  );

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-green-900/10 border border-green-900/30">
      <div className="flex items-center gap-2">
        <CheckSquare className="w-4 h-4 text-green-500" />
        <span className="text-sm text-white">{label}</span>
      </div>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
      ) : url ? (
        <div className="flex gap-1">
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors">
            <Eye className="w-3 h-3" /> View
          </a>
          <a href={url} download
            className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white transition-colors">
            <Download className="w-3 h-3" />
          </a>
        </div>
      ) : (
        <span className="text-xs text-slate-500">URL error</span>
      )}
    </div>
  );
};

const StorageDocRow = ({ name, studentUserId }) => {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const path = `${studentUserId}/${name}`;
  const displayName = name.replace(/^\d+_/, '');

  useEffect(() => {
    setLoading(true);
    supabase.storage.from('student-documents')
      .createSignedUrl(path, 3600)
      .then(({ data }) => { if (data?.signedUrl) setUrl(data.signedUrl); })
      .finally(() => setLoading(false));
  }, [path]);

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-blue-900/10 border border-blue-800/30">
      <div className="flex items-center gap-2 min-w-0">
        <FileText className="w-4 h-4 text-blue-400 shrink-0" />
        <span className="text-sm text-white truncate max-w-[180px]">{displayName}</span>
      </div>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
      ) : url ? (
        <div className="flex gap-1 shrink-0">
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors">
            <Eye className="w-3 h-3" /> View
          </a>
          <a href={url} download={displayName}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white transition-colors">
            <Download className="w-3 h-3" />
          </a>
        </div>
      ) : null}
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] uppercase tracking-wide text-slate-500">{label}</span>
    <span className="text-sm text-white font-medium">{value || <span className="text-slate-600 italic font-normal">Not provided</span>}</span>
  </div>
);

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [storageFiles, setStorageFiles] = useState([]);
  const [storageLoading, setStorageLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('applications')
        .select(`*, students!inner(id, user_id, full_name, email, phone, country), programs(id, program_name, university, country, degree_level, duration, tuition_fee, application_fee, requirements)`)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      const { data, error } = await query;
      if (error) throw error;

      setApplications((data || []).map(app => ({
        ...app,
        student_name: app.students?.full_name || 'Unknown',
        student_email: app.students?.email || '',
        program_name: app.programs?.program_name || 'Unknown',
        university_name: app.programs?.university || '',
      })));
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const openDetail = async (app) => {
    setSelectedApp(app);
    setAdminNotes(app.admin_notes || '');
    setStorageFiles([]);

    // Load files from storage
    if (app.students?.user_id) {
      setStorageLoading(true);
      const { data } = await supabase.storage
        .from('student-documents')
        .list(app.students.user_id, { sortBy: { column: 'created_at', order: 'desc' } });
      setStorageFiles(data || []);
      setStorageLoading(false);
    }
  };

  const closeDetail = () => setSelectedApp(null);

  const handleStatusUpdate = async (appId, newStatus) => {
    const { error } = await supabase.from('applications').update({ status: newStatus }).eq('id', appId);
    if (error) { toast({ variant: 'destructive', title: 'Error', description: error.message }); return; }
    toast({ title: 'Status updated', description: `Marked as ${newStatus}` });
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    setSelectedApp(prev => prev ? { ...prev, status: newStatus } : prev);
  };

  const handleDelete = async (appId) => {
    if (!window.confirm('Delete this application?')) return;
    await supabase.from('applications').delete().eq('id', appId);
    setApplications(prev => prev.filter(a => a.id !== appId));
    closeDetail();
    toast({ title: 'Deleted' });
  };

  const saveNotes = async () => {
    if (!selectedApp) return;
    setSavingNotes(true);
    await supabase.from('applications').update({ admin_notes: adminNotes }).eq('id', selectedApp.id);
    setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, admin_notes: adminNotes } : a));
    setSavingNotes(false);
    toast({ title: 'Notes saved' });
  };

  const copyForPortal = () => {
    if (!selectedApp) return;
    const s = selectedApp.students || {};
    const p = selectedApp.programs || {};
    const text = [
      `=== APPLICATION SUBMISSION INFO ===`,
      ``,
      `STUDENT DETAILS`,
      `Full Name:    ${s.full_name || 'N/A'}`,
      `Email:        ${s.email || 'N/A'}`,
      `Phone:        ${s.phone || 'N/A'}`,
      `Country:      ${s.country || 'N/A'}`,
      ``,
      `PROGRAM`,
      `Program:      ${p.program_name || 'N/A'}`,
      `University:   ${p.university || 'N/A'}`,
      `Country:      ${p.country || 'N/A'}`,
      `Level:        ${p.degree_level || 'N/A'}`,
      `Duration:     ${p.duration || 'N/A'}`,
      `Tuition:      ${p.tuition_fee || 'N/A'}`,
      `App Fee:      ${p.application_fee || 'N/A'}`,
      ``,
      `APPLICATION`,
      `ID:           ${selectedApp.id}`,
      `Submitted:    ${selectedApp.submitted_at ? new Date(selectedApp.submitted_at).toLocaleString() : 'N/A'}`,
      `Payment:      ${selectedApp.payment_status || 'pending'}`,
      `Status:       ${selectedApp.status || 'pending'}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied to clipboard' });
  };

  const filteredApplications = applications.filter(app => {
    const s = searchTerm.toLowerCase();
    return app.student_name.toLowerCase().includes(s) ||
      app.program_name.toLowerCase().includes(s) ||
      app.student_email.toLowerCase().includes(s);
  });

  const renderMobileCard = (app) => (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-white text-lg">{app.student_name}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Mail className="w-3 h-3" /> {app.student_email}
            </div>
          </div>
          <StatusBadge status={app.status} />
        </div>
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
          <p className="text-sm font-medium text-white">{app.program_name}</p>
          <p className="text-xs text-slate-400">{app.university_name}</p>
        </div>
        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => openDetail(app)}>
          View Details
        </Button>
      </CardContent>
    </Card>
  );

  // Required docs from program
  const requiredDocs = selectedApp?.programs?.requirements || [];
  const uploadedDocs = selectedApp?.documents || {};
  const uploadedCount = Object.values(uploadedDocs).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-white">Applications</h2>
        <Button variant="outline" onClick={fetchApplications} className="w-full md:w-auto bg-slate-800 border-slate-700 text-slate-200">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input placeholder="Search students..." className="pl-10 bg-slate-950 border-slate-700"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px] bg-slate-950 border-slate-700">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <AdminTable data={filteredApplications} renderMobileCard={renderMobileCard}>
        <Table>
          <TableHeader className="bg-slate-950/50">
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-400">Student</TableHead>
              <TableHead className="text-slate-400">Program</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400">Progress</TableHead>
              <TableHead className="text-slate-400">Date</TableHead>
              <TableHead className="text-right text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
            ) : filteredApplications.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No applications found.</TableCell></TableRow>
            ) : filteredApplications.map(app => (
              <TableRow key={app.id} className="border-slate-800 hover:bg-slate-800/50 cursor-pointer" onClick={() => openDetail(app)}>
                <TableCell>
                  <div className="font-medium text-white">{app.student_name}</div>
                  <div className="text-xs text-slate-500">{app.student_email}</div>
                </TableCell>
                <TableCell>
                  <div className="text-white">{app.program_name}</div>
                  <div className="text-xs text-slate-500">{app.university_name}</div>
                </TableCell>
                <TableCell><StatusBadge status={app.status} /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${(app.progress_step / 5) * 100}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{app.progress_step}/5</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-400">{format(new Date(app.created_at), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                      <DropdownMenuItem onClick={() => openDetail(app)}><Eye className="w-4 h-4 mr-2" />View Details</DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem onClick={() => handleDelete(app.id)} className="text-red-500"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminTable>

      {/* ── Detail slide-over panel ── */}
      {selectedApp && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={closeDetail} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-slate-900 border-l border-slate-800 z-50 overflow-y-auto shadow-2xl flex flex-col">

            {/* Sticky header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {selectedApp.student_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white leading-none">{selectedApp.student_name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedApp.student_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedApp.status} />
                <button onClick={closeDetail} className="text-slate-400 hover:text-white transition-colors ml-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-7 flex-1">

              {/* ── Status controls ── */}
              <div className="flex flex-wrap gap-2">
                {['reviewing','accepted','rejected','pending'].map(s => (
                  <button key={s} onClick={() => handleStatusUpdate(selectedApp.id, s)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                      selectedApp.status === s
                        ? s === 'accepted' ? 'bg-green-600 border-green-600 text-white'
                          : s === 'rejected' ? 'bg-red-700 border-red-700 text-white'
                          : s === 'reviewing' ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-slate-600 border-slate-600 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                    }`}>
                    {s === 'accepted' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                    {s === 'rejected' && <XCircle className="w-3 h-3 inline mr-1" />}
                    {s}
                  </button>
                ))}
                <button onClick={copyForPortal}
                  className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300 hover:border-blue-500 hover:text-blue-400 transition-colors">
                  {copied ? <ClipboardCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy for portal'}
                </button>
              </div>

              {/* ── Student info ── */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Student Information
                </h3>
                <div className="grid grid-cols-2 gap-3 bg-slate-800/40 border border-slate-800 rounded-xl p-4">
                  <InfoRow label="Full name"    value={selectedApp.students?.full_name} />
                  <InfoRow label="Email"         value={selectedApp.students?.email} />
                  <InfoRow label="Phone / WhatsApp" value={selectedApp.students?.phone} />
                  <InfoRow label="Country"       value={selectedApp.students?.country} />
                  <InfoRow label="Student ID"    value={selectedApp.students?.id?.slice(0,8) + '...'} />
                  <InfoRow label="Payment"       value={selectedApp.payment_status} />
                </div>
              </section>

              {/* ── Program info ── */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Program Details
                </h3>
                <div className="grid grid-cols-2 gap-3 bg-slate-800/40 border border-slate-800 rounded-xl p-4">
                  <InfoRow label="Program"       value={selectedApp.programs?.program_name} />
                  <InfoRow label="University"    value={selectedApp.programs?.university} />
                  <InfoRow label="Country"       value={selectedApp.programs?.country} />
                  <InfoRow label="Degree level"  value={selectedApp.programs?.degree_level} />
                  <InfoRow label="Duration"      value={selectedApp.programs?.duration} />
                  <InfoRow label="Tuition fee"   value={selectedApp.programs?.tuition_fee} />
                  <InfoRow label="Application fee" value={selectedApp.programs?.application_fee} />
                  <InfoRow label="Submitted"     value={selectedApp.submitted_at ? new Date(selectedApp.submitted_at).toLocaleString() : null} />
                </div>
              </section>

              {/* ── Documents from application form ── */}
              {requiredDocs.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Required Documents
                    <span className="ml-auto text-[10px] font-normal normal-case">
                      {uploadedCount}/{requiredDocs.length} uploaded
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {requiredDocs.map(doc => (
                      <DocRow
                        key={doc}
                        label={doc}
                        path={uploadedDocs[doc] || null}
                        studentUserId={selectedApp.students?.user_id}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* ── All storage documents ── */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> All Uploaded Files
                  {storageLoading && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
                </h3>
                {!storageLoading && storageFiles.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-700 rounded-xl text-slate-600 text-sm">
                    No files uploaded to storage yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {storageFiles.map(file => (
                      <StorageDocRow
                        key={file.name}
                        name={file.name}
                        studentUserId={selectedApp.students?.user_id}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* ── Admin notes ── */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Admin Notes & Submission Log
                </h3>
                <Textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Record portal login, reference numbers, submission steps, issues…"
                  className="bg-slate-800 border-slate-700 text-white h-32 resize-none text-sm"
                />
                <Button onClick={saveNotes} disabled={savingNotes} size="sm"
                  className="mt-2 bg-blue-600 hover:bg-blue-700 h-8 text-xs">
                  {savingNotes ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                  Save notes
                </Button>
              </section>

              {/* ── Danger zone ── */}
              <section className="border-t border-slate-800 pt-5">
                <button onClick={() => handleDelete(selectedApp.id)}
                  className="flex items-center gap-2 text-xs text-red-500 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete this application
                </button>
              </section>

            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminApplications;
