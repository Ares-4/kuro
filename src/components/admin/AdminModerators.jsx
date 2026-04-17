import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Trash2, ShieldPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AdminModerators = () => {
  const [moderators, setModerators] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const { data: mods } = await supabase.from('moderators').select('*');
    const { data: admins } = await supabase.from('admin_users').select('*');
    setModerators(mods || []);
    setAdminUsers(admins || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddModerator = async () => {
    if (!selectedAdmin) return;
    const admin = adminUsers.find(a => a.id === selectedAdmin);
    
    const { error } = await supabase.from('moderators').insert({
      admin_id: admin.id,
      name: admin.full_name || 'Admin',
      email: admin.email
    });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Success", description: "Moderator added." });
      setIsDialogOpen(false);
      fetchData();
    }
  };

  const handleRemove = async (id) => {
    const { error } = await supabase.from('moderators').delete().eq('id', id);
    if (!error) {
      setModerators(prev => prev.filter(m => m.id !== id));
      toast({ title: "Removed", description: "Moderator removed." });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Moderators</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ShieldPlus className="w-4 h-4 mr-2" /> Add Moderator
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader><DialogTitle>Add Moderator</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Select onValueChange={setSelectedAdmin}>
                <SelectTrigger className="bg-slate-950 border-slate-700"><SelectValue placeholder="Select Admin User" /></SelectTrigger>
                <SelectContent>
                   {adminUsers.map(a => <SelectItem key={a.id} value={a.id}>{a.email}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handleAddModerator} className="w-full bg-blue-600">Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-slate-800 bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-400">Name</TableHead>
              <TableHead className="text-slate-400">Email</TableHead>
              <TableHead className="text-slate-400">Since</TableHead>
              <TableHead className="text-right text-slate-400">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="animate-spin inline" /></TableCell></TableRow>
            ) : moderators.map(mod => (
              <TableRow key={mod.id} className="border-slate-800">
                <TableCell className="font-medium text-white">{mod.name}</TableCell>
                <TableCell className="text-slate-300">{mod.email}</TableCell>
                <TableCell className="text-slate-500">{new Date(mod.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => handleRemove(mod.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminModerators;