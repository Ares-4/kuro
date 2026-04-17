import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Plus, Edit2, Trash2, Loader2, Star, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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

const TestimonialManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null, 
    student_name: '', 
    program: '', 
    university: '', 
    quote: '', 
    image_url: '',
    rating: 5, 
    is_featured: false 
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error) { toast({ variant: "destructive", title: "Error fetching testimonials" }); } 
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (formData.id) {
        await supabase.from('testimonials').update(formData).eq('id', formData.id);
      } else {
        const { id, ...newItem } = formData;
        await supabase.from('testimonials').insert([newItem]);
      }
      toast({ title: "Success", description: "Testimonial saved." });
      setIsDialogOpen(false);
      fetchItems();
    } catch (error) {
      toast({ variant: "destructive", title: "Error saving", description: error.message });
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
      await supabase.from('testimonials').delete().eq('id', deleteId);
      fetchItems();
      toast({ title: "Deleted" });
    } catch(e) { toast({ variant: "destructive", title: "Error" }); }
    finally {
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const openDialog = (item = null) => {
    if (item) setFormData(item);
    else setFormData({ id: null, student_name: '', program: '', university: '', quote: '', image_url: '', rating: 5, is_featured: false });
    setIsDialogOpen(true);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Testimonials</h3>
        <Button onClick={() => openDialog()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Add Story
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 relative">
             <div className="absolute top-4 right-4 flex gap-1 z-10">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-slate-700 hover:bg-slate-600" onClick={() => openDialog(item)}><Edit2 className="w-3 h-3 text-blue-400"/></Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-slate-700 hover:bg-slate-600" onClick={() => confirmDelete(item.id)}><Trash2 className="w-3 h-3 text-red-400"/></Button>
             </div>
             
             <div className="flex items-center gap-3 mb-3">
               <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden shrink-0">
                 {item.image_url ? (
                   <img src={item.image_url} alt="Student" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-500"><ImageIcon className="w-5 h-5" /></div>
                 )}
               </div>
               <div>
                  <div className="font-bold text-white text-sm">{item.student_name}</div>
                  <div className="text-xs text-slate-400">{item.university}</div>
               </div>
             </div>
             
             {item.is_featured && <span className="absolute top-4 left-4 text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/30">Featured</span>}
             
             <p className="text-slate-300 text-sm italic line-clamp-3 mt-2">"{item.quote}"</p>
             <div className="mt-3 flex text-yellow-500">
               {[...Array(item.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
             </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{formData.id ? 'Edit Testimonial' : 'New Testimonial'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label>Student Name</Label>
                <Input required value={formData.student_name} onChange={e => setFormData({...formData, student_name: e.target.value})} />
              </div>
               <div className="space-y-2">
                <Label>Rating (1-5)</Label>
                <Input type="number" min="1" max="5" required value={formData.rating} onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label>Program</Label>
                <Input value={formData.program} onChange={e => setFormData({...formData, program: e.target.value})} />
              </div>
               <div className="space-y-2">
                <Label>University</Label>
                <Input value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
                <Label>Photo URL</Label>
                <div className="flex gap-2">
                    <Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
                </div>
            </div>
            <div className="space-y-2">
              <Label>Quote</Label>
              <Textarea required value={formData.quote} onChange={e => setFormData({...formData, quote: e.target.value})} />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="feat_active"
                checked={formData.is_featured}
                onCheckedChange={(c) => setFormData({...formData, is_featured: c})}
              />
              <Label htmlFor="feat_active">Feature on Homepage</Label>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting} className="bg-blue-600">
                {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Testimonial'}
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
              This action cannot be undone.
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

export default TestimonialManager;