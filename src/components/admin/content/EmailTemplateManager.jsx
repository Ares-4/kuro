import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Plus, Edit2, Loader2, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const EmailTemplateManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', subject: '', body: '', variables: '' });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase.from('email_templates').select('*').order('name');
      if (error) throw error;
      setItems(data || []);
    } catch (error) { toast({ variant: "destructive", title: "Error fetching templates" }); } 
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
          name: formData.name,
          subject: formData.subject,
          body: formData.body,
          variables: formData.variables.split(',').map(v => v.trim()).filter(Boolean)
      };

      if (formData.id) {
        await supabase.from('email_templates').update(payload).eq('id', formData.id);
      } else {
        await supabase.from('email_templates').insert([payload]);
      }
      toast({ title: "Success", description: "Template saved." });
      setIsDialogOpen(false);
      fetchItems();
    } catch (error) {
      toast({ variant: "destructive", title: "Error saving", description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const openDialog = (item = null) => {
    if (item) setFormData({ ...item, variables: item.variables ? item.variables.join(', ') : '' });
    else setFormData({ id: null, name: '', subject: '', body: '', variables: '' });
    setIsDialogOpen(true);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Email Templates</h3>
        <Button onClick={() => openDialog()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> New Template
        </Button>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
             <div>
               <div className="font-bold text-white flex items-center gap-2">
                 <Code className="w-4 h-4 text-slate-500" />
                 {item.name}
               </div>
               <div className="text-sm text-slate-400 mt-1">Subject: {item.subject}</div>
             </div>
             <Button variant="outline" size="sm" onClick={() => openDialog(item)} className="border-slate-600 text-slate-300 hover:bg-slate-700">
               <Edit2 className="w-4 h-4 mr-2" /> Edit
             </Button>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{formData.id ? 'Edit Template' : 'New Template'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label>Template Name (System ID)</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. application_received" />
              </div>
               <div className="space-y-2">
                <Label>Subject Line</Label>
                <Input required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Body Content (HTML supported)</Label>
              <Textarea required className="h-40 font-mono text-sm" value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Variables (comma separated)</Label>
              <Input value={formData.variables} onChange={e => setFormData({...formData, variables: e.target.value})} placeholder="{{name}}, {{date}}, {{status}}" />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting} className="bg-blue-600">
                {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailTemplateManager;