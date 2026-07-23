import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const { toast } = useToast();

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*').order('display_order');
    setServices(data || []);
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (payload.id) await supabase.from('services').update(payload).eq('id', payload.id);
    else await supabase.from('services').insert([payload]);
    
    setIsDialogOpen(false);
    fetchServices();
    toast({ title: "Service Saved" });
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete?")) return;
    await supabase.from('services').delete().eq('id', id);
    fetchServices();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Services</h2>
        <Button onClick={() => { setFormData({ is_active: true }); setIsDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 w-auto">
          <Plus className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Add Service</span><span className="sm:hidden">Add</span>
        </Button>
      </div>

      <div className="grid gap-3">
        {services.map((svc) => (
          <div key={svc.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div className="flex items-start sm:items-center gap-4">
               <GripVertical className="text-slate-500 cursor-move mt-1 sm:mt-0 shrink-0" />
               <div>
                 <h4 className="font-bold text-white text-lg">{svc.name}</h4>
                 <p className="text-sm text-slate-400 line-clamp-2">{svc.description}</p>
               </div>
             </div>
             <div className="flex gap-2 self-end sm:self-center">
                <Button variant="ghost" size="sm" onClick={() => { setFormData(svc); setIsDialogOpen(true); }} className="bg-slate-700/50 hover:bg-slate-700"><Edit2 className="w-4 h-4 text-blue-400"/></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(svc.id)} className="bg-slate-700/50 hover:bg-slate-700"><Trash2 className="w-4 h-4 text-red-400"/></Button>
             </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white w-full max-w-[95vw] md:max-w-md">
          <DialogHeader><DialogTitle>Edit Service</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
               <Label>Service Name</Label>
               <Input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-slate-800 border-slate-700"/>
            </div>
            <div className="space-y-2">
               <Label>Description</Label>
               <Textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-slate-800 border-slate-700"/>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.is_active} onCheckedChange={c => setFormData({...formData, is_active: c})} />
              <Label>Active</Label>
            </div>
            <Button type="submit" className="w-full bg-blue-600">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminServices;