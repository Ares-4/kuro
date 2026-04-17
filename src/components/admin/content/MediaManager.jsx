import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Video, Mic, Plus, Trash2, ExternalLink, Loader2 } from 'lucide-react';

const MediaManager = () => {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'video',
    url: '',
    category: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    const { data } = await supabase.from('media_library').select('*').order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const { error } = await supabase.from('media_library').insert([formData]);
    
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Success", description: "Media item created." });
      setOpen(false);
      setFormData({ title: '', description: '', type: 'video', url: '', category: '', status: 'draft' });
      fetchMedia();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    const { error } = await supabase.from('media_library').delete().eq('id', id);
    if (!error) {
      toast({ title: "Deleted", description: "Item removed." });
      fetchMedia();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSubmitting(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('media-content')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media-content')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, url: publicUrl }));
      toast({ title: "Uploaded", description: "File uploaded successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Upload Failed", description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Podcast & Video Library</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" /> Add Content</Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Media</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select 
                    className="w-full p-2 rounded bg-slate-800 border border-slate-700"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="video">Video</option>
                    <option value="podcast">Podcast</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select 
                    className="w-full p-2 rounded bg-slate-800 border border-slate-700"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="bg-slate-800 border-slate-700"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Input 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="bg-slate-800 border-slate-700" 
                  placeholder="e.g. Student Life, Tutorials"
                />
              </div>

              <div className="space-y-2">
                <Label>Media Source</Label>
                <div className="flex gap-2">
                  <Input 
                    value={formData.url} 
                    onChange={e => setFormData({...formData, url: e.target.value})}
                    className="bg-slate-800 border-slate-700" 
                    placeholder="https://..."
                  />
                  <div className="relative">
                    <input 
                      type="file" 
                      onChange={handleFileUpload} 
                      className="absolute inset-0 opacity-0 cursor-pointer w-full" 
                      accept="video/*,audio/*"
                    />
                    <Button type="button" variant="outline" className="border-slate-600">Upload</Button>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Content"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="group bg-slate-900 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-500 transition-colors">
              <div className="h-32 bg-slate-800 flex items-center justify-center relative">
                {item.type === 'video' ? <Video className="w-12 h-12 text-slate-600" /> : <Mic className="w-12 h-12 text-slate-600" />}
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold uppercase ${item.status === 'published' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>
                  {item.status}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white truncate">{item.title}</h3>
                <p className="text-sm text-slate-400 capitalize mb-4">{item.category} • {item.type}</p>
                <div className="flex justify-between items-center">
                  <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8 p-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaManager;