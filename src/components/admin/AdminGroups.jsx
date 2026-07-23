import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AdminGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGroups = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('community_groups')
      .select('*, created_by_student:students(full_name)')
      .order('created_at', { ascending: false });
    setGroups(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleStatus = async (id, status) => {
    const group = groups.find(g => g.id === id);
    const updates = {
      status,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
      ...(status === 'approved' && group?.created_by ? { moderator_id: group.created_by } : {}),
    };

    const { error } = await supabase.from('community_groups').update(updates).eq('id', id);

    if (!error) {
      if (status === 'approved' && group?.created_by) {
        await supabase.from('group_members').upsert(
          { group_id: id, student_id: group.created_by, role: 'moderator' },
          { onConflict: 'group_id,student_id' }
        );
      }
      toast({ title: `Group ${status}`, description: `Group has been ${status}.` });
      fetchGroups();
    } else {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <div className="p-6 space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Manage Groups</h1>
        <Button variant="outline" onClick={fetchGroups}><Loader2 className="w-4 h-4 mr-2" /> Refresh</Button>
      </div>

      <div className="rounded-md border border-slate-800 bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-400">Group Name</TableHead>
              <TableHead className="text-slate-400">Requested By</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400">Date</TableHead>
              <TableHead className="text-right text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="animate-spin inline" /></TableCell></TableRow>
             ) : groups.map(group => (
               <TableRow key={group.id} className="border-slate-800">
                 <TableCell className="font-medium text-white">{group.name}</TableCell>
                 <TableCell className="text-slate-300">{group.created_by_student?.full_name || 'Unknown'}</TableCell>
                 <TableCell>
                   <Badge className={
                     group.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                     group.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                     'bg-yellow-500/20 text-yellow-400'
                   }>{group.status}</Badge>
                 </TableCell>
                 <TableCell className="text-slate-500">{new Date(group.created_at).toLocaleDateString()}</TableCell>
                 <TableCell className="text-right">
                   {group.status === 'pending' && (
                     <div className="flex justify-end gap-2">
                       <Button size="sm" onClick={() => handleStatus(group.id, 'approved')} className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0">
                         <Check className="w-4 h-4" />
                       </Button>
                       <Button size="sm" onClick={() => handleStatus(group.id, 'rejected')} variant="destructive" className="h-8 w-8 p-0">
                         <X className="w-4 h-4" />
                       </Button>
                     </div>
                   )}
                 </TableCell>
               </TableRow>
             ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminGroups;