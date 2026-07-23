import { supabase } from '@/lib/customSupabaseClient';

/**
 * Sends an email using the 'send-email' Edge Function.
 * @param {string} to - Recipient email address
 * @param {string} templateName - Key from email_templates table
 * @param {object} data - Variables to replace in the template (e.g. { name: 'John' })
 * @param {string} [subject] - Optional subject override
 */
export const sendEmail = async ({ to, templateName, data, subject }) => {
  try {
    const { data: responseData, error } = await supabase.functions.invoke('send-email', {
      body: { to, templateName, data, subject }
    });

    if (error) throw error;
    return responseData;
  } catch (error) {
    console.error('Failed to send email:', error);
    // Silent fail or re-throw depending on need, but we usually return error state
    return { success: false, error };
  }
};

/**
 * Pre-defined triggers for consistency
 */
export const emailTriggers = {
  sendGuideDownload: async (email) => {
    return sendEmail({
      to: email,
      templateName: 'guide_download',
      data: { link: 'https://kuroeduconsultancy.com/resources/guide-2025.pdf' }
    });
  },

  sendReadinessResults: async (email, name, destination, score) => {
    return sendEmail({
      to: email,
      templateName: 'readiness_results',
      data: { name, destination, score }
    });
  },

  sendApplicationStatus: async (email, name, program, status) => {
    return sendEmail({
      to: email,
      templateName: 'application_status_update',
      data: { name, program, status }
    });
  },
  
  notifyAdmin: async (message) => {
    // Hardcoded admin email for now, or fetch from settings
    return sendEmail({
      to: 'kuro.agents@kuroeduconsultancy.com', 
      templateName: 'admin_notification', // Ensure this exists or fallback handles it
      subject: 'New Admin Alert 🚨',
      data: { message }
    });
  }
};