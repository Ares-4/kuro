import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const AdminDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    id: null, name: '', slug: '', description: '', image_url: '', is_active: true, living_cost: '', tuition_cost: ''
  });

  useEffect(() => { fetchDestinations(); }, []);

  const fetchDestinations = async () => {
    const { data, error } = await supabase.from('destinations').select('*').order('name');
    if (!error) setDestinations(data || []);
    setLoading(false);
  };

  const handleOpen = (dest = null) => {
    if (dest) setFormData(dest);
    else setFormData({ id: null, name: '', slug: '', description: '', image_url: '', is_active: true, living_cost: '', tuition_cost: '' });
    setIsDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.slug) payload.slug = payload.name.toLowerCase().replace(/ /g, '-');
      if (payload.id) await supabase.from('destinations').update(payload).eq('id', payload.id);
      else { delete payload.id; await supabase.from('destinations').insert([payload]); }
      toast({ title: "Saved successfully" });
      setIsDialogOpen(false);
      fetchDestinations();
    } catch (error) { toast({ variant: "destructive", title: "Error", description: error.message }); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this destination?")) return;
    await supabase.from('destinations').delete().eq('id', id);
    fetchDestinations();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-white">Destinations</h2>
        <Button onClick={() => handleOpen()} className="bg-blue-600 w-full md:w-auto"><Plus className="w-4 h-4 mr-2" /> Add Destination</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map(dest => (
          <Card key={dest.id} className="bg-slate-800 border-slate-700 overflow-hidden">
            <div className="h-48 bg-slate-700 relative group">
              {dest.image_url && <img src={dest.image_url} alt={dest.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />}
              <div className="absolute top-2 right-2">
                 <span className={`px-2 py-1 rounded text-xs font-bold ${dest.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                   {dest.is_active ? 'Active' : 'Inactive'}
                 </span>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold text-white text-xl mb-2">{dest.name}</h3>
              <p className="text-slate-400 text-sm mb-4 line-clamp-3 min-h-[60px]">{dest.description}</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4 bg-slate-900/50 p-2 rounded">
                 <div>
                    <span className="block font-semibold">Tuition</span>
                    {dest.tuition_cost || '-'}
                 </div>
                 <div>
                    <span className="block font-semibold">Living</span>
                    {dest.living_cost || '-'}
                 </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-slate-600 hover:bg-slate-700" onClick={() => handleOpen(dest)}>Edit</Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(dest.id)} className="text-red-400 hover:bg-red-950/30"><Trash2 className="w-4 h-4"/></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl bg-slate-900 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{formData.id ? 'Edit Destination' : 'New Destination'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-slate-800 border-slate-700"/></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="bg-slate-800 border-slate-700"/></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-slate-800 border-slate-700 h-24"/></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tuition Range</Label><Input value={formData.tuition_cost} onChange={e => setFormData({...formData, tuition_cost: e.target.value})} className="bg-slate-800 border-slate-700"/></div>
              <div className="space-y-2"><Label>Living Cost</Label><Input value={formData.living_cost} onChange={e => setFormData({...formData, living_cost: e.target.value})} className="bg-slate-800 border-slate-700"/></div>
            </div>
            <div className="space-y-2"><Label>Image URL</Label><Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="bg-slate-800 border-slate-700"/></div>
            <div className="flex items-center gap-2"><Switch checked={formData.is_active} onCheckedChange={c => setFormData({...formData, is_active: c})} /><Label>Is Active</Label></div>
            <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700">{submitting ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Save Destination'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDestinations;