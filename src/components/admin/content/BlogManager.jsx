import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit2, Trash2, Image as ImageIcon, Calendar, Save, ArrowLeft } from 'lucide-react';
import RichTextEditor from '@/components/ui/rich-text-editor';

const BlogManager = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [view, setView] = useState('list'); // list, edit
  const [loading, setLoading] = useState(false);
  
  const [currentPost, setCurrentPost] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    categories: '',
    status: 'draft',
    featured_image: ''
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []);
  };

  const handleEdit = (post) => {
    setCurrentPost({
      ...post,
      categories: post.categories?.join(', ') || ''
    });
    setView('edit');
  };

  const handleCreate = () => {
    setCurrentPost({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      categories: '',
      status: 'draft',
      featured_image: ''
    });
    setView('edit');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const postData = {
        ...currentPost,
        categories: currentPost.categories.split(',').map(c => c.trim()).filter(Boolean),
        updated_at: new Date()
      };

      const { error } = await supabase
        .from('blog_posts')
        .upsert(postData)
        .select();

      if (error) throw error;
      
      toast({ title: "Post Saved", description: "Blog post has been updated." });
      setView('list');
      fetchPosts();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this post?")) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    fetchPosts();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fileName = `blog-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('blog-images').upload(fileName, file);
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(fileName);
      setCurrentPost(prev => ({ ...prev, featured_image: publicUrl }));
      toast({ title: "Image Uploaded" });
    } catch (error) {
      toast({ variant: "destructive", title: "Upload Failed", description: error.message });
    }
  };

  if (view === 'edit') {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => setView('list')} className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
          </Button>
          <div className="flex gap-3">
             <select 
              className="bg-slate-900 border border-slate-700 text-white rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={currentPost.status}
              onChange={(e) => setCurrentPost({...currentPost, status: e.target.value})}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
              <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save Post'}
            </Button>
          </div>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300 font-medium">Post Title</Label>
                <Input 
                  value={currentPost.title}
                  onChange={(e) => setCurrentPost({...currentPost, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')})}
                  className="bg-slate-950 border-slate-700 text-lg font-bold py-6"
                  placeholder="Enter an engaging title..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-300 font-medium">URL Slug</Label>
                  <Input 
                    value={currentPost.slug}
                    onChange={(e) => setCurrentPost({...currentPost, slug: e.target.value})}
                    className="bg-slate-950 border-slate-700 text-slate-400 font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 font-medium">Categories</Label>
                  <Input 
                    value={currentPost.categories}
                    onChange={(e) => setCurrentPost({...currentPost, categories: e.target.value})}
                    className="bg-slate-950 border-slate-700"
                    placeholder="Visa Guide, University Life, Tips (comma separated)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 font-medium">Featured Image</Label>
                <div className="flex gap-6 items-start bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                  {currentPost.featured_image ? (
                    <img src={currentPost.featured_image} alt="Preview" className="h-32 w-48 object-cover rounded-md border border-slate-600" />
                  ) : (
                    <div className="h-32 w-48 bg-slate-800 rounded-md border border-slate-700 flex items-center justify-center text-slate-500 text-xs">
                      No Image Selected
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-slate-400">Upload a high-quality image for the post header.</p>
                    <div className="relative inline-block">
                      <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full z-10" accept="image/*" />
                      <Button type="button" variant="outline" className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700">
                        <ImageIcon className="w-4 h-4 mr-2" /> Choose Image
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 font-medium">Short Excerpt</Label>
                <Textarea 
                  value={currentPost.excerpt}
                  onChange={(e) => setCurrentPost({...currentPost, excerpt: e.target.value})}
                  className="bg-slate-950 border-slate-700 h-20 resize-none"
                  placeholder="A brief summary that appears in blog preview cards..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 font-medium">Post Content</Label>
                <RichTextEditor 
                  value={currentPost.content} 
                  onChange={(html) => setCurrentPost({...currentPost, content: html})} 
                />
                <p className="text-xs text-slate-500 mt-1">Use the toolbar to format your text. Images inside the content are not supported in this version.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-white tracking-tight">Blog Posts</h2>
           <p className="text-slate-400">Manage your articles and guides.</p>
        </div>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Create New Post
        </Button>
      </div>

      <div className="grid gap-4">
        {posts.map(post => (
          <div key={post.id} className="flex items-center justify-between bg-slate-800 p-5 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-all group">
            <div className="flex gap-4">
              {post.featured_image && (
                <img src={post.featured_image} alt="" className="w-16 h-16 object-cover rounded bg-slate-900" />
              )}
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{post.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${post.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                    {post.status}
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-slate-400 mt-1">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(post.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{post.views || 0} views</span>
                  {post.categories && post.categories.length > 0 && (
                     <>
                      <span>•</span>
                      <span className="text-slate-500">{post.categories[0]}</span>
                     </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" onClick={() => handleEdit(post)} className="text-slate-400 hover:text-white hover:bg-blue-600/20">
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} className="text-slate-400 hover:text-red-400 hover:bg-red-900/20">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-800 border-dashed">
             <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
               <Edit2 className="w-8 h-8 text-slate-600" />
             </div>
             <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
             <p className="text-slate-400 mb-6">Start writing your first blog post to share knowledge.</p>
             <Button onClick={handleCreate} variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
               Create Post
             </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManager;