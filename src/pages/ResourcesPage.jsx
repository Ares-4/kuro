import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, HelpCircle, BookOpen, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import AdUnit from '@/components/AdUnit';

const ResourcesPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Study Abroad Resources | Guides, Tips & Checklists";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "Free study abroad resources: destination guides, visa checklists, university rankings, and expert tips for international students.";
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: blogData } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      const { data: faqData } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      setBlogs(blogData || []);
      setFaqs(faqData || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="text-slate-50 pt-28 pb-16">
      <div style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }}>

        <div className="text-center mb-12">
          <span className="eyebrow">Free resources</span>
          <h1 className="font-display font-bold text-white mt-4 mb-4"
            style={{ fontSize: 'var(--fs-4xl)', letterSpacing: '-0.03em', lineHeight: 1.04 }}>
            Student resources
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto" style={{ fontSize: 'var(--fs-lg)' }}>
            Everything you need to know about studying abroad, visa processes, and student life.
          </p>
        </div>

        <AdUnit slotId="2525252525" />

        <Tabs defaultValue="blog" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-slate-900 border border-slate-800">
              <TabsTrigger value="blog" className="gap-2 px-8"><BookOpen className="w-4 h-4" /> Latest Articles</TabsTrigger>
              <TabsTrigger value="faq" className="gap-2 px-8"><HelpCircle className="w-4 h-4" /> Frequently Asked Questions</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="blog" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loading ? (
              <p className="text-center text-slate-500">Loading articles...</p>
            ) : blogs.length === 0 ? (
                <div className="text-center py-12 bg-slate-900 rounded-lg border border-slate-800">
                  <p className="text-slate-400">No articles published yet.</p>
                </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="group h-full">
                    <Card className="bg-slate-900 border-slate-800 h-full hover:border-primary/50 transition-colors overflow-hidden flex flex-col">
                      <div className="h-48 overflow-hidden bg-slate-800">
                        {post.featured_image ? (
                          <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-800">
                            <BookOpen className="w-12 h-12" />
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <div className="flex gap-2 mb-2">
                          {post.categories?.map((cat, i) => (
                            <Badge key={i} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{cat}</Badge>
                          ))}
                        </div>
                        <CardTitle className="text-white text-xl line-clamp-2 group-hover:text-primary transition-colors">{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow flex flex-col justify-between">
                        <p className="text-slate-400 line-clamp-3 mb-4 text-sm">{post.excerpt}</p>
                        <div className="flex items-center text-xs text-slate-500 gap-4 mt-auto pt-4 border-t border-slate-800">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {Math.ceil((post.content?.length || 500) / 1000)} min read</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="faq" className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loading ? (
              <p className="text-center text-slate-500">Loading FAQs...</p>
            ) : faqs.length === 0 ? (
                <div className="text-center py-12 bg-slate-900 rounded-lg border border-slate-800">
                  <p className="text-slate-400">No FAQs available yet.</p>
                </div>
            ) : (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id} className="border-b border-slate-800 last:border-0 px-2">
                        <AccordionTrigger className="text-white hover:text-primary hover:no-underline text-left font-medium">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-400 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <AdUnit slotId="2626262626" />
        <AdUnit slotId="2727272727" />

      </div>
    </div>
  );
};

export default ResourcesPage;