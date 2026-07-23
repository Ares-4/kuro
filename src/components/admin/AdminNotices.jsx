import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Megaphone, Plus, Search, Trash2, Edit2, Users, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const AdminNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    id: null, title: '', content: '', target_audience: 'all', student_id: 'none', is_active: true
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: noticesData, error: noticesError } = await supabase.from('notices').select('*, students(full_name, email)').order('created_at', { ascending: false });
      if (noticesError) throw noticesError;
      setNotices(noticesData || []);

      const { data: studentsData } = await supabase.from('students').select('id, full_name, email').order('full_name');
      setStudents(studentsData || []);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load notices." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) return toast({ variant: "destructive", title: "Missing Fields" });
    setSaving(true);
    try {
      const payload = {
        title: formData.title, content: formData.content, target_audience: formData.target_audience,
        is_active: formData.is_active, student_id: formData.target_audience === 'specific' && formData.student_id !== 'none' ? formData.student_id : null,
        updated_at: new Date().toISOString()
      };
      if (formData.id) await supabase.from('notices').update(payload).eq('id', formData.id);
      else await supabase.from('notices').insert([payload]);
      
      toast({ title: "Success", description: "Notice saved." });
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await supabase.from('notices').delete().eq('id', id);
      setNotices(notices.filter(n => n.id !== id));
      toast({ title: "Deleted" });
    } catch (error) { toast({ variant: "destructive", title: "Error" }); }
  };

  const filteredNotices = notices.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Notices</h1>
          <p className="text-slate-400">Announcements for students.</p>
        </div>
        <Button onClick={() => { setFormData({ id: null, title: '', content: '', target_audience: 'all', student_id: 'none', is_active: true }); setIsDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Create Notice
        </Button>
      </div>

      <div className="flex items-center space-x-2 bg-slate-800 p-2 rounded-lg border border-slate-700 w-full md:max-w-md">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <Input 
          placeholder="Search notices..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 bg-transparent focus-visible:ring-0 text-white placeholder:text-slate-500 h-8" 
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />Loading...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotices.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
              <Megaphone className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No notices found.</p>
            </div>
          ) : (
            filteredNotices.map((notice) => (
              <Card key={notice.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-white line-clamp-1">{notice.title}</h3>
                    <Badge className={notice.is_active ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-400"}>{notice.is_active ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <div className="mb-4 flex-1">
                    <p className="text-slate-300 text-sm line-clamp-3">{notice.content}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 flex items-center gap-1 max-w-[140px] truncate">
                      {notice.target_audience === 'all' ? <><Users className="w-3 h-3" /> Everyone</> : <><User className="w-3 h-3" /> {notice.students?.full_name || 'Student'}</>}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setFormData(notice); setIsDialogOpen(true); }} className="h-8 w-8"><Edit2 className="w-4 h-4 text-slate-400"/></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(notice.id)} className="h-8 w-8"><Trash2 className="w-4 h-4 text-red-400"/></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white w-full max-w-[95vw] md:max-w-xl">
          <DialogHeader><DialogTitle>{formData.id ? 'Edit Notice' : 'New Notice'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Title</label>
              <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="bg-slate-800 border-slate-700" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Content</label>
              <Textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="bg-slate-800 border-slate-700 min-h-[120px]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Audience</label>
                <Select value={formData.target_audience} onValueChange={(val) => setFormData({...formData, target_audience: val})}>
                  <SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="specific">Specific Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Status</label>
                <Select value={formData.is_active ? "true" : "false"} onValueChange={(val) => setFormData({...formData, is_active: val === "true"})}>
                  <SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.target_audience === 'specific' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Select Student</label>
                <Select value={formData.student_id} onValueChange={(val) => setFormData({...formData, student_id: val})}>
                  <SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue placeholder="Search student..." /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-[200px]">
                    {students.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-700 text-slate-300 w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNotices;