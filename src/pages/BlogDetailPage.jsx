import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published') // Ensure we only show published posts
          .single();

        if (error) throw error;
        setPost(data);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center pt-20">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-slate-400">Loading article...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-950 pt-32 px-4 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Article Not Found</h1>
        <p className="text-slate-400 mb-8">The article you are looking for might have been removed or is temporarily unavailable.</p>
        <Link to="/resources">
          <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Resources
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate read time
  const wordCount = post.content ? post.content.replace(/<[^>]+>/g, '').split(' ').length : 0;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <>
      <Helmet>
        <title>{post.title} - Kuro Educational</title>
        <meta name="description" content={post.excerpt || post.title} />
      </Helmet>

      <article className="min-h-screen bg-slate-950 pt-24 pb-16">
        {/* Header / Hero */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/resources" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Resources
          </Link>

          <div className="space-y-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {post.categories?.map((cat, idx) => (
                <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                  {cat}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.published_at || post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readTime} min read</span>
              </div>
              {/* Optional: Add Author if available in data */}
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Kuro Team</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800">
              <img 
                src={post.featured_image} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-primary prose-strong:text-white prose-blockquote:border-l-primary prose-blockquote:bg-slate-900/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
          
          {/* Footer of Article */}
          <div className="mt-12 pt-8 border-t border-slate-800 flex justify-between items-center">
             <div className="text-slate-500 text-sm">
               Tags: {post.tags && post.tags.length > 0 ? post.tags.join(', ') : 'None'}
             </div>
             <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
               <Share2 className="w-4 h-4 mr-2" /> Share Article
             </Button>
          </div>
        </div>
      </article>
    </>
  );
};

export default BlogDetailPage;