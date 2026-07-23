import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Plus, Edit2, Trash2, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

const FaqManager = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, question: '', answer: '', category: '', is_active: true });
  const [submitting, setSubmitting] = useState(false);
  
  // Delete confirmation state
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const { data, error } = await supabase.from('faqs').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      toast({ variant: "destructive", title: "Error fetching FAQs" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (formData.id) {
        await supabase.from('faqs').update(formData).eq('id', formData.id);
      } else {
        const { id, ...newFaq } = formData;
        await supabase.from('faqs').insert([newFaq]);
      }
      toast({ title: "Success", description: "FAQ saved successfully." });
      setIsDialogOpen(false);
      fetchFaqs();
    } catch (error) {
      toast({ variant: "destructive", title: "Error saving FAQ", description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await supabase.from('faqs').delete().eq('id', deleteId);
      toast({ title: "Deleted", description: "FAQ removed." });
      fetchFaqs();
    } catch(e) {
      toast({ variant: "destructive", title: "Error" });
    } finally {
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const openDialog = (faq = null) => {
    if (faq) setFormData(faq);
    else setFormData({ id: null, question: '', answer: '', category: 'General', is_active: true });
    setIsDialogOpen(true);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">FAQs</h3>
        <Button onClick={() => openDialog()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Add FAQ
        </Button>
      </div>

      <div className="grid gap-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${faq.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                <h4 className="font-semibold text-white">{faq.question}</h4>
              </div>
              <p className="text-slate-400 text-sm">{faq.answer}</p>
              <span className="text-xs text-slate-500 px-2 py-0.5 bg-slate-900 rounded border border-slate-700">{faq.category}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => openDialog(faq)}><Edit2 className="w-4 h-4 text-blue-400"/></Button>
              <Button variant="ghost" size="sm" onClick={() => confirmDelete(faq.id)}><Trash2 className="w-4 h-4 text-red-400"/></Button>
            </div>
          </div>
        ))}
        {faqs.length === 0 && <p className="text-slate-500 text-center py-8">No FAQs yet.</p>}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{formData.id ? 'Edit FAQ' : 'New FAQ'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Question</Label>
              <Input required value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Answer</Label>
              <Textarea required value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Admissions" />
            </div>
             <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="faq_active"
                  checked={formData.is_active}
                  onCheckedChange={(c) => setFormData({...formData, is_active: c})}
                />
                <Label htmlFor="faq_active">Is Active</Label>
              </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting} className="bg-blue-600">
                {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save FAQ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the FAQ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FaqManager;