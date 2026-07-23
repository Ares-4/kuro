import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Trash2, Save, MoveUp, MoveDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'richtext', label: 'Text Content' },
  { value: 'features', label: 'Features Grid' },
  { value: 'cta', label: 'Call to Action' }
];

// Small helpers
const slugify = (s) =>
  (s || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const getDefaultContent = (type) => {
  switch (type) {
    case 'hero':
      return { title: 'New Hero', subtitle: 'Subtitle text', ctaText: 'Click Me', ctaLink: '#', image_url: '' };
    case 'richtext':
      return { heading: 'Section Heading', text: 'Enter your content here...' };
    case 'features':
      return { title: 'Features', subtitle: 'Subtitle', features: [{ title: 'Feature 1', description: 'Desc' }] };
    case 'cta':
      return { title: 'Call to Action', subtitle: 'Subtitle', buttonText: 'Action', link: '#' };
    default:
      return {};
  }
};

const DEFAULT_PAGE = { title: '', slug: '', meta_description: '', is_published: false };

const PageEditor = ({ pageId, onBack }) => {
  const { toast } = useToast();
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isNew = useMemo(() => pageId === 'new', [pageId]);

  useEffect(() => {
    if (isNew) {
      setPage(DEFAULT_PAGE);
      setSections([]);
      setLoading(false);
    } else {
      fetchPageData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  const fetchPageData = async () => {
    setLoading(true);
    try {
      const { data: pageData, error: pageError } = await supabase
        .from('dynamic_pages')
        .select('*')
        .eq('id', pageId)
        .single();

      if (pageError) throw pageError;
      setPage({
        title: pageData?.title || '',
        slug: pageData?.slug || '',
        meta_description: pageData?.meta_description || '',
        is_published: !!pageData?.is_published
      });

      const { data: sectionData, error: sectionError } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', pageId)
        .order('order_index', { ascending: true });

      if (sectionError) throw sectionError;

      // Normalize section shape
      const normalized = (sectionData || []).map((s) => ({
        ...s,
        content: typeof s.content === 'object' && s.content !== null ? s.content : {}
      }));

      setSections(normalized);
    } catch (error) {
      console.error('PageEditor fetch error:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading page',
        description: error?.message || 'Failed to load page.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    const title = (page.title || '').trim();
    const slug = slugify(page.slug || page.title);

    if (!title || !slug) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Title and Slug are required.'
      });
      return;
    }

    setSaving(true);
    try {
      // 1) Save Page record (insert/update)
      let currentPageId = pageId;

      const pagePayload = {
        title,
        slug,
        meta_description: (page.meta_description || '').trim(),
        is_published: !!page.is_published
        // NOTE: we removed updated_at because your schema may not have it.
        // If your dynamic_pages table has updated_at, you can add it back.
      };

      if (isNew) {
        const { data: inserted, error } = await supabase
          .from('dynamic_pages')
          .insert([pagePayload])
          .select('id')
          .single();

        if (error) throw error;
        currentPageId = inserted.id;
      } else {
        const { error } = await supabase
          .from('dynamic_pages')
          .update(pagePayload)
          .eq('id', pageId);

        if (error) throw error;
      }

      // 2) Save Sections in a safe way (delete then insert)
      // IMPORTANT: for new pages, there are no old sections, but this works either way.
      const { error: delError } = await supabase
        .from('page_sections')
        .delete()
        .eq('page_id', currentPageId);

      if (delError) throw delError;

      const sectionsToInsert = (sections || []).map((section, index) => ({
        page_id: currentPageId,
        type: section.type,
        content: section.content ?? {},
        order_index: index
      }));

      if (sectionsToInsert.length > 0) {
        const { error: insError } = await supabase
          .from('page_sections')
          .insert(sectionsToInsert);

        if (insError) throw insError;
      }

      toast({ title: 'Success', description: 'Page saved successfully.' });

      // If we created a new page, return to list (so parent can refresh)
      if (isNew) onBack();
      // Otherwise, stay put
    } catch (error) {
      console.error('PageEditor save error:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error?.message || 'Failed to save page.'
      });
    } finally {
      setSaving(false);
    }
  };

  const addSection = (type) => {
    const newSection = {
      type,
      content: getDefaultContent(type),
      tempId: Date.now()
    };
    setSections((prev) => [...prev, newSection]);
  };

  const updateSectionContent = (index, field, value) => {
    setSections((prev) => {
      const copy = [...prev];
      const s = copy[index];
      copy[index] = { ...s, content: { ...(s.content || {}), [field]: value } };
      return copy;
    });
  };

  const removeSection = (index) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const moveSection = (index, direction) => {
    setSections((prev) => {
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;

      const copy = [...prev];
      const swapIndex = index + (direction === 'up' ? -1 : 1);
      const temp = copy[index];
      copy[index] = copy[swapIndex];
      copy[swapIndex] = temp;
      return copy;
    });
  };

  if (loading) return <div>Loading editor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{isNew ? 'Create New Page' : 'Edit Page'}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="border-slate-600 text-slate-300" type="button">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700" type="button">
            {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Page Settings */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-800 border-slate-700 sticky top-6">
            <CardHeader>
              <CardTitle className="text-white">Page Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Page Title</Label>
                <Input
                  value={page.title}
                  onChange={(e) => setPage({ ...page, title: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">URL Slug</Label>
                <Input
                  value={page.slug}
                  onChange={(e) => setPage({ ...page, slug: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white"
                  placeholder="e.g. about-us"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Meta Description</Label>
                <Textarea
                  value={page.meta_description}
                  onChange={(e) => setPage({ ...page, meta_description: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  checked={!!page.is_published}
                  onChange={(e) => setPage({ ...page, is_published: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900"
                  id="pub"
                />
                <Label htmlFor="pub" className="text-slate-200">
                  Published
                </Label>
              </div>
              <div className="text-xs text-slate-500">
                Slug will be normalized on save: <span className="font-mono">{slugify(page.slug || page.title)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section Builder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap gap-2">
            {SECTION_TYPES.map((type) => (
              <Button
                key={type.value}
                variant="secondary"
                onClick={() => addSection(type.value)}
                className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
                type="button"
              >
                <Plus className="w-4 h-4 mr-2" /> Add {type.label}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {sections.length === 0 && (
              <div className="text-center p-12 border-2 border-dashed border-slate-700 rounded-xl text-slate-500">
                Page is empty. Add a section above.
              </div>
            )}

            {sections.map((section, index) => (
              <Card key={section.id || section.tempId} className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between py-3 bg-slate-900/50 border-b border-slate-700">
                  <span className="font-mono text-xs text-blue-400 uppercase font-bold">{section.type}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                      type="button"
                    >
                      <MoveUp className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === sections.length - 1}
                      type="button"
                    >
                      <MoveDown className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(index)}
                      className="hover:bg-red-900/30"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {section.type === 'hero' && (
                    <>
                      <Input
                        placeholder="Title"
                        value={section.content?.title || ''}
                        onChange={(e) => updateSectionContent(index, 'title', e.target.value)}
                        className="bg-slate-900 border-slate-700 text-white font-bold"
                      />
                      <Textarea
                        placeholder="Subtitle"
                        value={section.content?.subtitle || ''}
                        onChange={(e) => updateSectionContent(index, 'subtitle', e.target.value)}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                      <Input
                        placeholder="Image URL"
                        value={section.content?.image_url || ''}
                        onChange={(e) => updateSectionContent(index, 'image_url', e.target.value)}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                      <div className="flex gap-2">
                        <Input
                          placeholder="CTA Text"
                          value={section.content?.ctaText || ''}
                          onChange={(e) => updateSectionContent(index, 'ctaText', e.target.value)}
                          className="bg-slate-900 border-slate-700 text-white"
                        />
                        <Input
                          placeholder="CTA Link"
                          value={section.content?.ctaLink || ''}
                          onChange={(e) => updateSectionContent(index, 'ctaLink', e.target.value)}
                          className="bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                    </>
                  )}

                  {section.type === 'richtext' && (
                    <>
                      <Input
                        placeholder="Heading (Optional)"
                        value={section.content?.heading || ''}
                        onChange={(e) => updateSectionContent(index, 'heading', e.target.value)}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                      <Textarea
                        placeholder="Body Text"
                        value={section.content?.text || ''}
                        onChange={(e) => updateSectionContent(index, 'text', e.target.value)}
                        className="bg-slate-900 border-slate-700 text-white h-32"
                      />
                    </>
                  )}

                  {section.type === 'features' && (
                    <div className="p-4 bg-slate-900 rounded text-center text-slate-400 text-sm">
                      Feature list editor simplified for demo. Title:
                      <Input
                        className="inline-block w-40 ml-2 bg-slate-800"
                        value={section.content?.title || ''}
                        onChange={(e) => updateSectionContent(index, 'title', e.target.value)}
                      />
                    </div>
                  )}

                  {section.type === 'cta' && (
                    <>
                      <Input
                        placeholder="Title"
                        value={section.content?.title || ''}
                        onChange={(e) => updateSectionContent(index, 'title', e.target.value)}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                      <Input
                        placeholder="Subtitle"
                        value={section.content?.subtitle || ''}
                        onChange={(e) => updateSectionContent(index, 'subtitle', e.target.value)}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                      <Input
                        placeholder="Button Text"
                        value={section.content?.buttonText || ''}
                        onChange={(e) => updateSectionContent(index, 'buttonText', e.target.value)}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                      <Input
                        placeholder="Button Link"
                        value={section.content?.link || ''}
                        onChange={(e) => updateSectionContent(index, 'link', e.target.value)}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageEditor;