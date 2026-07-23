import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Shield, User, Search, MoreVertical, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const UserManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch Students
      const { data: students, error: studentError } = await supabase
        .from('students')
        .select('id, full_name, email, country, created_at, user_id');
      
      // Fetch Admins
      const { data: admins, error: adminError } = await supabase
        .from('admin_users')
        .select('id, full_name, email, created_at, user_id');

      if (studentError) console.error("Error fetching students", studentError);
      if (adminError) console.error("Error fetching admins", adminError);

      const formattedStudents = (students || []).map(s => ({ ...s, role: 'student' }));
      const formattedAdmins = (admins || []).map(a => ({ ...a, role: 'admin' }));

      setUsers([...formattedStudents, ...formattedAdmins]);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load users." });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || u.role === filter;
    return matchesSearch && matchesFilter;
  });

  const performDelete = async () => {
    if (!userToDelete) return;

    try {
      const table = userToDelete.role === 'admin' ? 'admin_users' : 'students';
      const { error } = await supabase.from(table).delete().eq('id', userToDelete.id);
      
      if (error) throw error;

      toast({ title: "User Deleted", description: `${userToDelete.full_name} removed.` });
      fetchUsers();
      
      // Log it
      await supabase.from('activity_logs').insert({
        actor_id: user.id,
        action: 'DELETE_USER',
        details: { target_id: userToDelete.id, role: userToDelete.role }
      });

    } catch (error) {
      toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
    } finally {
      setUserToDelete(null);
    }
  };

  return (
    <>
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-white">User Management</CardTitle>
              <CardDescription className="text-slate-400">View and manage registered users.</CardDescription>
            </div>
            <div className="flex gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-700">
               <Button 
                 variant="ghost" size="sm" onClick={() => setFilter('all')}
                 className={filter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}
               >All</Button>
               <Button 
                 variant="ghost" size="sm" onClick={() => setFilter('student')}
                 className={filter === 'student' ? 'bg-blue-900/30 text-blue-400' : 'text-slate-400 hover:text-white'}
               >Students</Button>
               <Button 
                 variant="ghost" size="sm" onClick={() => setFilter('admin')}
                 className={filter === 'admin' ? 'bg-red-900/30 text-red-400' : 'text-slate-400 hover:text-white'}
               >Admins</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by name..." 
              className="pl-10 bg-slate-900 border-slate-700 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rounded-md border border-slate-700 bg-slate-900 overflow-hidden max-h-[500px] overflow-y-auto">
            {loading ? (
               <div className="p-8 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/>Loading...</div>
            ) : filteredUsers.length === 0 ? (
               <div className="p-8 text-center text-slate-400">No users found.</div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredUsers.map((u, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${u.role === 'admin' ? 'bg-red-900/20 text-red-400 border border-red-900/50' : 'bg-blue-900/20 text-blue-400 border border-blue-900/50'}`}>
                        {u.role === 'admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{u.full_name || 'Unknown User'}</p>
                        <p className="text-sm text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-900/20 cursor-pointer" onClick={() => setUserToDelete(u)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete {userToDelete?.full_name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-slate-700 text-white hover:bg-slate-800">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performDelete} className="bg-red-600 hover:bg-red-700 text-white border-none">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserManagement;