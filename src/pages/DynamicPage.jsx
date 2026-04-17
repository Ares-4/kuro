import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';
import { BlockRenderer } from '@/lib/page-blocks';
import { Button } from '@/components/ui/button';

// Dynamic Page Renderer
const DynamicPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        // 1. Fetch Page Metadata
        const { data: pageData, error: pageError } = await supabase
          .from('dynamic_pages')
          .select('*')
          .eq('slug', slug || '') // handle root if configured later
          .single();

        if (pageError) throw pageError;
        if (!pageData) throw new Error("Not Found");

        // 2. Fetch Sections
        const { data: sectionData, error: sectionError } = await supabase
          .from('page_sections')
          .select('*')
          .eq('page_id', pageData.id)
          .order('order_index');

        if (sectionError) throw sectionError;

        setPage(pageData);
        setSections(sectionData || []);
      } catch (err) {
        console.error(err);
        setError(err.message === "Not Found" ? 404 : 500);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error === 404) {
    // Basic 404
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
        <p className="text-slate-400 mb-8">The page you are looking for does not exist.</p>
        <Button onClick={() => window.location.href = '/'} className="bg-blue-600">Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Helmet>
        <title>{page?.title} - Kuro Educational</title>
        {page?.meta_description && <meta name="description" content={page.meta_description} />}
      </Helmet>
      
      {/* Navigation should be injected here or in a Layout wrapper. 
          For simplicity, we assume dynamic pages are just content blocks 
          and the main App Layout handles Nav/Footer if we used one. 
          But since we don't have a global layout file, we render blocks directly.
          (In a real app, wrap this in <MainLayout>) 
      */}
      
      <main>
        {sections.map(section => (
          <BlockRenderer key={section.id} section={section} />
        ))}
        {sections.length === 0 && (
          <div className="py-20 text-center text-slate-500">
            This page is empty.
          </div>
        )}
      </main>
    </div>
  );
};

export default DynamicPage;