import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Plus, Edit2, Trash2, Search, Loader2, Globe, Trophy, ExternalLink, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AdminTable } from '@/components/admin/ui/AdminTable';

const AdminUniversities = () => {
  const [universities, setUniversities] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    id: null, name: '', destination_id: '', description: '', website: '', ranking: '', image_url: '', is_active: true
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uniResult, destResult] = await Promise.all([
        supabase.from('universities').select(`*, destinations(id, name)`).order('name'),
        supabase.from('destinations').select('id, name').order('name')
      ]);
      if (uniResult.error) throw uniResult.error;
      setUniversities(uniResult.data || []);
      setDestinations(destResult.data || []);
    } catch (error) { toast({ variant: "destructive", title: "Error", description: error.message }); }
    finally { setLoading(false); }
  };

  const handleOpenDialog = (uni = null) => {
    if (uni) setFormData({ ...uni, description: uni.description || '', website: uni.website || '', ranking: uni.ranking || '', image_url: uni.image_url || '' });
    else setFormData({ id: null, name: '', destination_id: '', description: '', website: '', ranking: '', image_url: '', is_active: true });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData, ranking: formData.ranking ? parseInt(formData.ranking) : null };
      if (formData.id) await supabase.from('universities').update(payload).eq('id', formData.id);
      else await supabase.from('universities').insert([payload]);
      toast({ title: "Saved successfully" });
      setIsDialogOpen(false);
      fetchData();
    } catch (error) { toast({ variant: "destructive", title: "Error", description: error.message }); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await supabase.from('universities').delete().eq('id', id);
      fetchData();
    } catch (error) { toast({ variant: "destructive", title: "Error", description: error.message }); }
  };

  const filteredUnis = universities.filter(uni => 
    uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.destinations?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderMobileCard = (uni) => (
    <Card className="bg-slate-900 border-slate-800">
       <CardContent className="p-4 space-y-4">
          <div className="flex items-start gap-4">
             <div className="w-16 h-16 rounded bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                {uni.image_url ? <img src={uni.image_url} className="w-full h-full object-cover" /> : <Building className="text-slate-600"/>}
             </div>
             <div className="flex-1">
                <h3 className="font-bold text-white text-lg leading-tight">{uni.name}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                   <Badge variant="outline">{uni.destinations?.name}</Badge>
                   {uni.ranking && <Badge variant="secondary" className="bg-yellow-900/20 text-yellow-500 border-yellow-900/50">Rank #{uni.ranking}</Badge>}
                </div>
             </div>
          </div>
          
          <div className="flex gap-2">
             <Button className="flex-1" variant="outline" onClick={() => handleOpenDialog(uni)}>Edit</Button>
             <Button variant="ghost" size="icon" onClick={() => handleDelete(uni.id)} className="text-red-400"><Trash2 className="w-5 h-5"/></Button>
          </div>
       </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Institutions</h2>
        <div className="flex gap-4 flex-col md:flex-row w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search universities..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Add University
          </Button>
        </div>
      </div>

      <AdminTable data={filteredUnis} renderMobileCard={renderMobileCard}>
        <table className="w-full text-left bg-slate-800/50 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-700">
              <th className="p-4 text-slate-400 font-medium">Institution</th>
              <th className="p-4 text-slate-400 font-medium">Location</th>
              <th className="p-4 text-slate-400 font-medium">Ranking</th>
              <th className="p-4 text-slate-400 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
            ) : filteredUnis.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-500">No universities found.</td></tr>
            ) : (
              filteredUnis.map((uni) => (
                <tr key={uni.id} className="hover:bg-slate-800/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-slate-700 overflow-hidden shrink-0">
                        {uni.image_url ? <img src={uni.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">{uni.name[0]}</div>}
                      </div>
                      <div>
                        <div className="font-bold text-white">{uni.name}</div>
                        {uni.website && <a href={uni.website} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">Visit Website <ExternalLink className="w-3 h-3"/></a>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><Badge variant="outline">{uni.destinations?.name}</Badge></td>
                  <td className="p-4 text-slate-300">{uni.ranking ? <div className="flex items-center gap-1 text-yellow-500"><Trophy className="w-4 h-4"/> #{uni.ranking}</div> : '-'}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(uni)}><Edit2 className="w-4 h-4 text-blue-400" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(uni.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminTable>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{formData.id ? 'Edit' : 'Add'} Institution</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-slate-800 border-slate-600"/></div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={formData.destination_id} onValueChange={(v) => setFormData({...formData, destination_id: v})} required>
                  <SelectTrigger className="bg-slate-800 border-slate-600"><SelectValue placeholder="Select Country" /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">{destinations.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Ranking</Label><Input type="number" value={formData.ranking} onChange={(e) => setFormData({...formData, ranking: e.target.value})} className="bg-slate-800 border-slate-600"/></div>
              <div className="space-y-2"><Label>Website</Label><Input value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} className="bg-slate-800 border-slate-600"/></div>
            </div>
            <div className="space-y-2"><Label>Image URL</Label><Input value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} className="bg-slate-800 border-slate-600"/></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="bg-slate-800 border-slate-600 h-24"/></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600">{isSubmitting ? <Loader2 className="animate-spin w-4 h-4"/> : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUniversities;