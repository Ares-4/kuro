import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ShieldAlert, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  AlertTriangle,
  Search,
  MoreVertical,
  Flag,
  UserX
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CommunityModeration = () => {
  const [activeTab, setActiveTab] = useState("reported");
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'posts') {
        const { data, error } = await supabase
          .from('hub_posts')
          .select('*, students(full_name, email)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setPosts(data || []);
      } 
      else if (activeTab === 'comments') {
        const { data, error } = await supabase
          .from('hub_comments')
          .select('*, students(full_name), hub_posts(title)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setComments(data || []);
      }
      else if (activeTab === 'reported') {
        // Fetch flags - joining posts to get context
        const { data, error } = await supabase
          .from('content_flags')
          .select(`
            *,
            hub_posts (
              title,
              content,
              student_id
            ),
            students (
              full_name
            )
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setFlags(data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error loading content",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePost = async (postId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('hub_posts')
        .update({ is_approved: !currentStatus })
        .eq('id', postId);

      if (error) throw error;
      
      setPosts(posts.map(p => p.id === postId ? { ...p, is_approved: !currentStatus } : p));
      toast({ title: currentStatus ? "Post Hidden" : "Post Approved" });
    } catch (error) {
      toast({ variant: "destructive", title: "Action failed", description: error.message });
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    
    try {
      const { error } = await supabase.from('hub_posts').delete().eq('id', postId);
      if (error) throw error;
      
      setPosts(posts.filter(p => p.id !== postId));
      // Also remove any flags associated with this post locally
      setFlags(flags.filter(f => f.post_id !== postId));
      toast({ title: "Post Deleted" });
    } catch (error) {
      toast({ variant: "destructive", title: "Delete failed", description: error.message });
    }
  };

  const handleResolveFlag = async (flagId) => {
    try {
      // In a real system, you might mark flags as 'resolved' instead of deleting
      // For this simplified schema, we'll just delete the flag record to "clear" it
      const { error } = await supabase.from('content_flags').delete().eq('id', flagId);
      if (error) throw error;
      
      setFlags(flags.filter(f => f.id !== flagId));
      toast({ title: "Flag Resolved" });
    } catch (error) {
      toast({ variant: "destructive", title: "Action failed", description: error.message });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Community Moderation</h2>
        <p className="text-slate-400">Manage posts, comments, and reported content.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="reported" className="gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <ShieldAlert className="w-4 h-4" /> Reported Content
          </TabsTrigger>
          <TabsTrigger value="posts" className="gap-2">
            <MessageSquare className="w-4 h-4" /> All Posts
          </TabsTrigger>
          <TabsTrigger value="comments" className="gap-2">
            <MessageSquare className="w-4 h-4" /> All Comments
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center space-x-2 bg-slate-800 p-2 rounded-lg border border-slate-700 max-w-md mb-6">
          <Search className="w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search content or users..." 
            className="border-0 bg-transparent focus-visible:ring-0 text-white placeholder:text-slate-500 h-8" 
          />
        </div>

        <TabsContent value="reported" className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading reports...</div>
          ) : flags.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700 text-center py-12">
              <CardContent>
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white">All Clear!</h3>
                <p className="text-slate-400 mt-2">There are no unresolved content flags at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {flags.map((flag) => (
                <Card key={flag.id} className="bg-slate-800 border-slate-700 border-l-4 border-l-red-500">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2 items-center">
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Reported
                        </Badge>
                        <span className="text-sm text-slate-400">
                          by {flag.students?.full_name || 'Unknown User'} • {new Date(flag.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                         <Button size="sm" variant="outline" className="border-green-600 text-green-400 hover:bg-green-900/20" onClick={() => handleResolveFlag(flag.id)}>
                            Keep Post (Dismiss)
                         </Button>
                         <Button size="sm" variant="destructive" onClick={() => handleDeletePost(flag.post_id)}>
                            Delete Post
                         </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                       <h4 className="font-semibold text-white mb-1">Reason: <span className="text-red-300">{flag.reason}</span></h4>
                    </div>
                    {flag.hub_posts ? (
                      <div className="bg-slate-900 p-4 rounded-md border border-slate-700">
                        <h4 className="font-bold text-white text-lg mb-2">{flag.hub_posts.title}</h4>
                        <p className="text-slate-300 text-sm line-clamp-3">{flag.hub_posts.content}</p>
                      </div>
                    ) : (
                      <div className="text-slate-500 italic">Content has already been deleted.</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
             <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900 text-slate-200">
                  <tr>
                    <th className="p-4 font-medium">Author</th>
                    <th className="p-4 font-medium">Title</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Votes</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-slate-300">
                  {loading ? (
                    <tr><td colSpan="6" className="p-8 text-center">Loading posts...</td></tr>
                  ) : posts.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center">No posts found.</td></tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-700/50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-white">{post.students?.full_name || 'Anonymous'}</div>
                          <div className="text-xs text-slate-500">{post.students?.email}</div>
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="font-medium truncate text-white">{post.title}</div>
                          <div className="text-xs text-slate-500 truncate">{post.content}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                            {post.category || 'General'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {post.is_approved ? (
                             <Badge className="bg-green-900/30 text-green-400 border-green-800">Published</Badge>
                          ) : (
                             <Badge variant="secondary" className="bg-yellow-900/30 text-yellow-400 border-yellow-800">Hidden</Badge>
                          )}
                        </td>
                        <td className="p-4">
                           <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 text-green-400"><ThumbsUp className="w-3 h-3"/> {post.upvotes || 0}</span>
                              <span className="flex items-center gap-1 text-red-400"><ThumbsDown className="w-3 h-3"/> {post.downvotes || 0}</span>
                           </div>
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-slate-200">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-slate-700" />
                              <DropdownMenuItem 
                                className="focus:bg-slate-700 focus:text-white cursor-pointer"
                                onClick={() => handleApprovePost(post.id, post.is_approved)}
                              >
                                {post.is_approved ? <XCircle className="mr-2 h-4 w-4 text-yellow-400" /> : <CheckCircle className="mr-2 h-4 w-4 text-green-400" />}
                                {post.is_approved ? 'Hide Post' : 'Approve Post'}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="focus:bg-slate-700 focus:text-white cursor-pointer">
                                <UserX className="mr-2 h-4 w-4" /> Ban User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-slate-700" />
                              <DropdownMenuItem 
                                className="text-red-400 focus:bg-red-900/20 focus:text-red-400 cursor-pointer"
                                onClick={() => handleDeletePost(post.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
             </div>
          </div>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
             <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900 text-slate-200">
                  <tr>
                    <th className="p-4 font-medium">Author</th>
                    <th className="p-4 font-medium">Comment</th>
                    <th className="p-4 font-medium">Post Context</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-slate-300">
                  {loading ? (
                    <tr><td colSpan="5" className="p-8 text-center">Loading comments...</td></tr>
                  ) : comments.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center">No comments found.</td></tr>
                  ) : (
                    comments.map((comment) => (
                      <tr key={comment.id} className="hover:bg-slate-700/50 transition-colors">
                        <td className="p-4 font-medium text-white">
                          {comment.students?.full_name || 'Anonymous'}
                        </td>
                        <td className="p-4 max-w-sm">
                          <div className="truncate text-slate-300">{comment.content}</div>
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="truncate text-blue-400 text-xs">{comment.hub_posts?.title || 'Deleted Post'}</div>
                        </td>
                        <td className="p-4 text-slate-400 text-xs">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            onClick={() => {
                                if(window.confirm('Delete comment?')) {
                                   // In real app, implement delete logic here
                                   toast({ title: "Comment Deleted (Demo)" }) 
                                }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
             </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityModeration;