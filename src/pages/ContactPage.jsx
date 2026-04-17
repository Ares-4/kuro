import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import SEO from '@/components/SEO';
import { calculateLeadScore } from '@/lib/leadScoringService';
import { getPageContent } from '@/lib/contentService';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';
import AdUnit from '@/components/AdUnit';
import { ADSENSE_SLOTS } from '@/config/adsenseSlots';

const ContactPage = ({ contentOverride }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(true);
  const [content, setContent] = useState(DEFAULT_CONTENT.contact);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    message: ''
  });

  useEffect(() => {
    if (contentOverride) {
      setContent({ ...DEFAULT_CONTENT.contact, ...contentOverride });
      setContentLoading(false);
      return;
    }
    const loadContent = async () => {
      const data = await getPageContent('contact');
      setContent(data);
      setContentLoading(false);
    };
    loadContent();
  }, [contentOverride]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const scoringResult = await calculateLeadScore({
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp,
      });

      const { error } = await supabase
        .from('leads')
        .insert([{
          name: formData.name,
          email: formData.email,
          whatsapp: formData.whatsapp,
          goal: 'contact_form_message',
          intake_form: JSON.stringify({ message: formData.message }),
          source: 'contact',
          status: 'New',
          score: scoringResult.score,
          tier: scoringResult.tier,
          scored_at: scoringResult.scored_at
        }]);

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: content.success_message,
        className: "bg-green-600 text-white border-none"
      });

      setFormData({ name: '', email: '', whatsapp: '', message: '' });

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        variant: "destructive",
        title: "Failed to send",
        description: "Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title={content.meta_title} 
        description={content.meta_description}
      />
      <div className="min-h-screen bg-slate-950 text-slate-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          
          <AdUnit slotId={ADSENSE_SLOTS.contactTop} />

          <div className="grid md:grid-cols-2 gap-12 my-12">
            
            {/* Contact Info */}
            <div>
              <h1 className="text-4xl font-bold mb-6 text-white">{content.page_heading}</h1>
              <p className="text-slate-400 text-lg mb-8">
                {content.page_intro}
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 shrink-0">
                    <Mail className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Email Us</h3>
                    <p className="text-slate-400">info@kuro.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 shrink-0">
                    <Phone className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">WhatsApp / Call</h3>
                    <p className="text-slate-400">+263 77 123 4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 shrink-0">
                    <MapPin className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Visit Us</h3>
                    <p className="text-slate-400">Harare, Zimbabwe</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-2">{content.form_title}</h3>
              <p className="text-slate-400 mb-6">{content.form_subtitle}</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Name</label>
                  <Input 
                    required 
                    name="name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-slate-950 border-slate-700"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Email</label>
                    <Input 
                      required 
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-slate-950 border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">WhatsApp</label>
                    <Input 
                      required 
                      name="whatsapp"
                      placeholder="+263..."
                      value={formData.whatsapp}
                      onChange={handleChange}
                      className="bg-slate-950 border-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Message</label>
                  <Textarea 
                    required 
                    name="message"
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={handleChange}
                    className="bg-slate-950 border-slate-700 min-h-[120px]"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Send Message
                </Button>
              </form>
            </div>
          </div>

          <AdUnit slotId={ADSENSE_SLOTS.contactBottom} />

        </div>
      </div>
    </>
  );
};

export default ContactPage;