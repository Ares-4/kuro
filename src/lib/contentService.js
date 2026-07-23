import { supabase } from '@/lib/customSupabaseClient';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';

const sanitizeInput = (text) => {
  if (!text) return '';
  return String(text).replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "");
};

// Helper to determine section and type based on field name
const inferFieldMetadata = (fieldName) => {
  let section = 'General';
  let type = 'text';
  let label = fieldName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  // Categorize by prefix
  if (fieldName.startsWith('hero_')) section = 'Hero Section';
  else if (fieldName.startsWith('featured_')) section = 'Featured Section';
  else if (fieldName.startsWith('why_choose_us_')) section = 'Why Choose Us';
  else if (fieldName.startsWith('testimonials_')) section = 'Testimonials';
  else if (fieldName.startsWith('cta_')) section = 'Call to Action';
  else if (fieldName.startsWith('meta_')) section = 'SEO Metadata';
  else if (fieldName.startsWith('step_')) section = 'Process Steps';
  else if (fieldName.startsWith('benefit_')) section = 'Benefits';
  else if (fieldName.startsWith('form_')) section = 'Form';
  
  // Specific grouping for Student Stories
  else if (fieldName.startsWith('stories_')) section = 'Header';
  else if (fieldName.startsWith('story_1_')) section = 'Story 1';
  else if (fieldName.startsWith('story_2_')) section = 'Story 2';
  else if (fieldName.startsWith('story_3_')) section = 'Story 3';
  
  // Specific grouping for Expert Team
  else if (fieldName.startsWith('team_heading') || fieldName.startsWith('team_intro')) section = 'Header';
  else if (fieldName.startsWith('team_member_1')) section = 'Team Member 1';
  else if (fieldName.startsWith('team_member_2')) section = 'Team Member 2';
  else if (fieldName.startsWith('team_member_3')) section = 'Team Member 3';

  // Determine input type
  if (fieldName.includes('description') || 
      fieldName.includes('intro') || 
      fieldName.includes('body') || 
      fieldName.includes('answer') ||
      fieldName.includes('quote') ||
      fieldName.includes('bio')) {
    type = 'textarea';
  }

  return { section, type, label };
};

export const getPageContent = async (pageName) => {
  try {
    const { data, error } = await supabase
      .from('public_content')
      .select('field_name, content')
      .eq('page', pageName)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching content:', error);
      return DEFAULT_CONTENT[pageName] || {};
    }

    const fetchedContent = data.reduce((acc, item) => {
      acc[item.field_name] = item.content;
      return acc;
    }, {});

    // Merge with default content to ensure all fields exist
    return {
      ...DEFAULT_CONTENT[pageName],
      ...fetchedContent
    };
  } catch (err) {
    console.error('Content service error:', err);
    return DEFAULT_CONTENT[pageName] || {};
  }
};

export const updatePageContent = async (pageName, fieldName, newContent, userId) => {
  const sanitizedContent = sanitizeInput(newContent);
  const { section, type, label } = inferFieldMetadata(fieldName);
  
  try {
    // 1. Get current content for history
    const { data: currentData } = await supabase
      .from('public_content')
      .select('content, id')
      .eq('page', pageName)
      .eq('field_name', fieldName)
      .single();

    let contentId = currentData?.id;
    const oldContent = currentData?.content || DEFAULT_CONTENT[pageName]?.[fieldName] || '';

    // If content hasn't changed, do nothing
    if (oldContent === sanitizedContent && contentId) {
      return { success: true, skipped: true };
    }

    // 2. Upsert new content
    const { data: upsertData, error: upsertError } = await supabase
      .from('public_content')
      .upsert({
        page: pageName,
        field_name: fieldName,
        field_label: label,
        content: sanitizedContent,
        content_type: type,
        section: section,
        updated_by: userId,
        updated_at: new Date().toISOString()
      }, { onConflict: 'page, field_name' })
      .select()
      .single();

    if (upsertError) throw upsertError;
    contentId = upsertData.id;

    // 3. Create history entry
    await supabase
      .from('public_content_history')
      .insert({
        content_id: contentId,
        page: pageName,
        field_name: fieldName,
        old_content: oldContent,
        new_content: sanitizedContent,
        changed_by: userId
      });

    return { success: true, data: upsertData };
  } catch (error) {
    console.error('Error updating content:', error);
    return { success: false, error };
  }
};

export const revertContent = async (contentId, historyId, userId) => {
  try {
    const { data: historyData, error: historyError } = await supabase
      .from('public_content_history')
      .select('new_content, page, field_name')
      .eq('id', historyId)
      .single();

    if (historyError) throw historyError;

    return await updatePageContent(
      historyData.page, 
      historyData.field_name, 
      historyData.new_content, 
      userId
    );
  } catch (error) {
    console.error('Error reverting content:', error);
    return { success: false, error };
  }
};

export const getContentHistory = async (pageName, fieldName) => {
  try {
    // First get the content_id
    const { data: contentData } = await supabase
      .from('public_content')
      .select('id')
      .eq('page', pageName)
      .eq('field_name', fieldName)
      .single();
      
    if (!contentData) return [];

    const { data, error } = await supabase
      .from('public_content_history')
      .select(`
        *,
        changer:changed_by (email)
      `)
      .eq('content_id', contentData.id)
      .order('changed_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
};

export const getAllPages = () => {
  return Object.keys(DEFAULT_CONTENT);
};

export const getPageFields = (pageName) => {
  const pageDefaults = DEFAULT_CONTENT[pageName];
  if (!pageDefaults) return [];

  return Object.keys(pageDefaults).map(key => {
    const { section, type, label } = inferFieldMetadata(key);
    return {
      field_name: key,
      field_label: label,
      section: section,
      content_type: type
    };
  });
};