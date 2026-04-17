import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { 
  Search, MoreHorizontal, FileText, CheckCircle, XCircle, Clock, 
  RefreshCw, Filter, Eye, Download, Trash2, Mail, Phone, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { AdminTable } from '@/components/admin/ui/AdminTable';
import { Card, CardContent } from '@/components/ui/card';

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    reviewing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
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

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('applications')
        .select(`*, students!inner(id, full_name, email, phone, country), programs(id, program_name, university)`)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') query = query.eq('status', statusFilter);

      const { data, error } = await query;
      if (error) throw error;
      
      const transformedData = (data || []).map(app => ({
        ...app,
        student_name: app.students?.full_name || 'Unknown',
        student_email: app.students?.email || '',
        program_name: app.programs?.program_name || 'Unknown',
        university_name: app.programs?.university || ''
      }));
      setApplications(transformedData);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, [statusFilter]);

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      const { error } = await supabase.from('applications').update({ status: newStatus }).eq('id', appId);
      if (error) throw error;
      toast({ title: "Status Updated", description: `Changed to ${newStatus}` });
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
      if (selectedApp?.id === appId) setSelectedApp(prev => ({ ...prev, status: newStatus }));
    } catch (error) { toast({ variant: "destructive", title: "Error", description: error.message }); }
  };

  const handleDelete = async (appId) => {
    if (!window.confirm("Delete this application?")) return;
    try {
      await supabase.from('applications').delete().eq('id', appId);
      setApplications(prev => prev.filter(app => app.id !== appId));
      setIsDetailOpen(false);
      toast({ title: "Deleted" });
    } catch (e) { toast({ variant: "destructive", title: "Error" }); }
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

        <div className="flex justify-between items-center text-xs text-slate-500">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(app.created_at).toLocaleDateString()}</span>
          <span>Step {app.progress_step}/5</span>
        </div>

        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => { setSelectedApp(app); setIsDetailOpen(true); }}>
           View Details
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-white">Applications</h2>
        <Button variant="outline" onClick={fetchApplications} className="w-full md:w-auto bg-slate-800 border-slate-700 text-slate-200">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search students..." 
            className="pl-10 bg-slate-950 border-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px] bg-slate-950 border-slate-700">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
               <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></TableCell></TableRow>
            ) : filteredApplications.length === 0 ? (
               <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No applications found.</TableCell></TableRow>
            ) : filteredApplications.map((app) => (
              <TableRow key={app.id} className="border-slate-800 hover:bg-slate-800/50">
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
                      <div className="h-full bg-blue-500" style={{ width: `${(app.progress_step/5)*100}%` }}/>
                    </div>
                    <span className="text-xs text-slate-500">{app.progress_step}/5</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-400">{format(new Date(app.created_at), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4"/></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                      <DropdownMenuItem onClick={() => { setSelectedApp(app); setIsDetailOpen(true); }}><Eye className="w-4 h-4 mr-2"/>View Details</DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700"/>
                      <DropdownMenuItem onClick={() => handleDelete(app.id)} className="text-red-500"><Trash2 className="w-4 h-4 mr-2"/>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminTable>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center">
                  <span>Application Details</span>
                  <StatusBadge status={selectedApp.status} />
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                   <h4 className="text-sm font-bold uppercase text-slate-500">Student Info</h4>
                   <div className="bg-slate-950 p-4 rounded-lg space-y-2 text-sm">
                      <p><span className="text-slate-500 block text-xs">Name</span> {selectedApp.student_name}</p>
                      <p><span className="text-slate-500 block text-xs">Email</span> {selectedApp.student_email}</p>
                      <p><span className="text-slate-500 block text-xs">Phone</span> {selectedApp.students?.phone || 'N/A'}</p>
                      <p><span className="text-slate-500 block text-xs">Country</span> {selectedApp.students?.country || 'N/A'}</p>
                   </div>
                </div>
                <div className="space-y-4">
                   <h4 className="text-sm font-bold uppercase text-slate-500">Program</h4>
                   <div className="bg-slate-950 p-4 rounded-lg space-y-2 text-sm">
                      <p><span className="text-slate-500 block text-xs">Program</span> {selectedApp.program_name}</p>
                      <p><span className="text-slate-500 block text-xs">University</span> {selectedApp.university_name}</p>
                      <p><span className="text-slate-500 block text-xs">Submitted</span> {new Date(selectedApp.created_at).toLocaleString()}</p>
                   </div>
                </div>
              </div>

              <div className="space-y-3">
                 <h4 className="text-sm font-bold uppercase text-slate-500">Actions</h4>
                 <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => handleStatusUpdate(selectedApp.id, 'accepted')} className="text-green-500 border-green-900/30 hover:bg-green-950">
                       <CheckCircle className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button variant="outline" onClick={() => handleStatusUpdate(selectedApp.id, 'rejected')} className="text-red-500 border-red-900/30 hover:bg-red-950">
                       <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                 </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApplications;