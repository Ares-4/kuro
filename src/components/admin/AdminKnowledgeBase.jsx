import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Save, Trash2, Edit2, Loader2, Database, BrainCircuit } from 'lucide-react';

const AdminKnowledgeBase = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState({ id: null, title: '', content: '' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('kb_pages').select('*').order('updated_at', { ascending: false });
    if (!error) setPages(data || []);
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingPage({});
    setFormData({ id: null, title: '', content: '' });
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setFormData({ id: page.id, title: page.title, content: page.content });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this page? This will remove all associated knowledge chunks.")) return;
    
    // Using edge function to ensure vector cleanup
    try {
      const { error } = await supabase.functions.invoke('process-kb', {
        body: { pageId: id, action: 'delete' }
      });

      if (error) throw error;
      
      toast({ title: "Page deleted" });
      fetchPages();
    } catch (error) {
      toast({ variant: "destructive", title: "Error deleting page", description: error.message });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // We send to Edge Function to handle chunking + embedding generation
      // If we just saved to DB, we'd need a trigger, but Supabase triggers for HTTP require pg_net which might be complex to setup via SQL here.
      // Direct invocation is cleaner for this constraint set.
      
      const { data, error } = await supabase.functions.invoke('process-kb', {
        body: {
          pageId: formData.id,
          title: formData.title,
          content: formData.content,
          action: 'upsert'
        }
      });

      if (error) throw error;

      toast({ title: "Knowledge Base Updated", description: "Content saved and embedded for AI." });
      setEditingPage(null);
      fetchPages();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Save failed", description: "Make sure OpenAI API Key is set in Supabase Secrets." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Knowledge Base</h2>
          <p className="text-slate-400">Manage content for the AI Assistant. Updates here are automatically learned by the bot.</p>
        </div>
        {!editingPage && (
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" /> Add Page
          </Button>
        )}
      </div>

      {editingPage ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>{formData.id ? 'Edit Knowledge Page' : 'New Knowledge Page'}</CardTitle>
            <CardDescription>
              Write comprehensive content. The AI will chunk this automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Page Title</Label>
                <Input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. Visa Requirements for China"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})} 
                  placeholder="Enter detailed information here..."
                  className="min-h-[400px] font-mono"
                  required
                />
                <p className="text-xs text-slate-500">
                  Tip: Use clear paragraphs. The AI uses semantic search to find relevant sections.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setEditingPage(null)} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={saving}>
                  {saving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing AI Embeddings...</>
                  ) : (
                    <><BrainCircuit className="w-4 h-4 mr-2" /> Save & Train AI</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-12 text-slate-500">Loading pages...</div>
          ) : pages.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-slate-800/50 rounded-lg border border-slate-800 border-dashed">
              <Database className="w-12 h-12 mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-white">No knowledge yet</h3>
              <p className="text-slate-500 mb-4">Add pages to train your AI assistant.</p>
              <Button onClick={handleCreate} variant="outline">Create First Page</Button>
            </div>
          ) : (
            pages.map(page => (
              <Card key={page.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-white truncate pr-2">{page.title}</CardTitle>
                    <Database className="w-4 h-4 text-slate-500 shrink-0" />
                  </div>
                  <CardDescription className="text-xs">
                    Last updated: {new Date(page.updated_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 line-clamp-3 mb-4 h-15">
                    {page.content}
                  </p>
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(page)}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(page.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminKnowledgeBase;