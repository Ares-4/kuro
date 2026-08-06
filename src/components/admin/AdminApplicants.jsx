import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, FileText, X, Mail, Phone, MapPin, Globe, GraduationCap, BookOpen } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';

const AdminApplicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [savingFeedback, setSavingFeedback] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('applicants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching applicants:', error);
    else setApplicants(data || []);
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    setApplicants(applicants.map(a => a.id === id ? { ...a, status: newStatus } : a));
    const { error } = await supabase.from('applicants').update({ status: newStatus }).eq('id', id);
    if (error) {
      console.error('Error updating status:', error);
      fetchApplicants();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-500/10 text-blue-500';
      case 'Contacted': return 'bg-yellow-500/10 text-yellow-500';
      case 'Converted': return 'bg-green-500/10 text-green-500';
      case 'Rejected': return 'bg-red-500/10 text-red-500';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  const openDetail = (applicant) => {
    setSelected(applicant);
    setFeedback(applicant.admin_feedback || '');
  };

  const saveFeedback = async () => {
    if (!selected) return;
    setSavingFeedback(true);
    await supabase.from('applicants').update({ admin_feedback: feedback }).eq('id', selected.id);
    setApplicants(applicants.map(a => a.id === selected.id ? { ...a, admin_feedback: feedback } : a));
    setSavingFeedback(false);
    toast({ title: 'Feedback saved' });
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

  const documents = selected?.documents && typeof selected.documents === 'object' ? selected.documents : {};
  const docEntries = Object.entries(documents).filter(([, doc]) => doc?.url);

  const groups = [];
  for (const applicant of applicants) {
    const monthLabel = new Date(applicant.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    let group = groups.find(g => g.monthLabel === monthLabel);
    if (!group) {
      group = { monthLabel, applicants: [] };
      groups.push(group);
    }
    group.applicants.push(applicant);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Applicants</h1>
          <p className="text-slate-400 text-sm">Submissions from the apply.html candidate form</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchApplicants}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="rounded-md border border-slate-800 bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-950">
            <TableRow>
              <TableHead className="text-slate-400 w-[100px]">Date</TableHead>
              <TableHead className="text-slate-400">Name</TableHead>
              <TableHead className="text-slate-400">Country</TableHead>
              <TableHead className="text-slate-400">Field / University</TableHead>
              <TableHead className="text-slate-400">Intake</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applicants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">No applicants yet.</TableCell>
              </TableRow>
            ) : (
              groups.map((group) => (
                <React.Fragment key={group.monthLabel}>
                  <TableRow className="border-b border-slate-800 bg-slate-950/60 hover:bg-slate-950/60">
                    <TableCell colSpan={6} className="text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
                      {group.monthLabel} <span className="text-slate-600 font-normal">({group.applicants.length})</span>
                    </TableCell>
                  </TableRow>
                  {group.applicants.map((applicant) => (
                    <TableRow key={applicant.id} className="border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer" onClick={() => openDetail(applicant)}>
                      <TableCell className="text-slate-300 text-xs">{new Date(applicant.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium text-white">
                        {applicant.name}
                        <div className="text-xs text-slate-500 font-normal mt-0.5">{applicant.email}</div>
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm">{applicant.country || '-'}</TableCell>
                      <TableCell className="text-slate-300 text-sm">
                        {applicant.field || '-'}
                        <div className="text-xs text-slate-500 mt-0.5">{applicant.university || '-'}</div>
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm">{applicant.intake || '-'}</TableCell>
                      <TableCell onClick={e => e.stopPropagation()}>
                        <Select defaultValue={applicant.status || 'New'} onValueChange={(val) => updateStatus(applicant.id, val)}>
                          <SelectTrigger className={`w-28 h-7 text-xs border-none ${getStatusColor(applicant.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Contacted">Contacted</SelectItem>
                            <SelectItem value="Converted">Converted</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selected && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelected(null)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-slate-900 border-l border-slate-800 z-50 overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Mail, label: 'Email', value: selected.email },
                  { icon: Phone, label: 'WhatsApp', value: selected.whatsapp },
                  { icon: MapPin, label: 'Country', value: selected.country },
                  { icon: Globe, label: 'University', value: selected.university },
                  { icon: GraduationCap, label: 'Education', value: selected.education },
                  { icon: BookOpen, label: 'Field', value: selected.field },
                  { icon: FileText, label: 'Intake', value: selected.intake },
                  { icon: FileText, label: 'Passport No.', value: selected.passport_number },
                  { icon: FileText, label: "Father's name", value: selected.father_name },
                  { icon: FileText, label: "Mother's name", value: selected.mother_name },
                  { icon: FileText, label: 'IELTS status', value: selected.ielts_status },
                  { icon: FileText, label: 'NAWA status', value: selected.nawa_status },
                ].map(({ icon: Icon, label, value }) => value ? (
                  <div key={label} className="bg-slate-800/60 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                      <Icon className="w-3 h-3" /> {label}
                    </div>
                    <p className="text-white text-sm font-medium break-all">{value}</p>
                  </div>
                ) : null)}
              </div>

              <Badge className={getStatusColor(selected.status)}>{selected.status || 'New'}</Badge>

              {selected.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Applicant Notes</h3>
                  <p className="text-sm text-slate-400 bg-slate-800/60 rounded-lg p-3">{selected.notes}</p>
                </div>
              )}

              {docEntries.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Uploaded Documents</h3>
                  <div className="space-y-2">
                    {docEntries.map(([key, doc]) => (
                      <a key={key} href={doc.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg text-sm text-blue-400 hover:text-blue-300 hover:bg-slate-700 transition-colors">
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="truncate">{key} — {doc.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Admin Feedback / Notes</h3>
                <Textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Add notes, feedback, or next steps for this applicant..."
                  className="bg-slate-800 border-slate-700 text-white h-28 resize-none"
                />
                <Button onClick={saveFeedback} disabled={savingFeedback} size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">
                  {savingFeedback ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                  Save notes
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminApplicants;
