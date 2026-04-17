import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import SEO from '@/components/SEO';
import { calculateLeadScore } from '@/lib/leadScoringService';
import StripePaymentModal from '@/components/StripePaymentModal';
import { getPageContent } from '@/lib/contentService';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';
import AdUnit from '@/components/AdUnit';
import { ADSENSE_SLOTS } from '@/config/adsenseSlots';

const EligibilityPage = ({ contentOverride }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(true);
  const [content, setContent] = useState(DEFAULT_CONTENT.eligibility);
  const [showPayment, setShowPayment] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    origin_country: '',
    target_destination: '',
    study_level: '',
    budget_range: '',
    intake_month: ''
  });

  useEffect(() => {
    if (contentOverride) {
      setContent({ ...DEFAULT_CONTENT.eligibility, ...contentOverride });
      setContentLoading(false);
      return;
    }
    const loadContent = async () => {
      const data = await getPageContent('eligibility');
      setContent(data);
      setContentLoading(false);
    };
    loadContent();
  }, [contentOverride]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const scoringResult = await calculateLeadScore(formData);

      const leadPayload = {
        ...formData,
        source: 'eligibility',
        status: 'New',
        score: scoringResult.score,
        tier: scoringResult.tier,
        scored_at: scoringResult.scored_at,
        payment_status: 'pending'
      };

      const { data, error } = await supabase
        .from('leads')
        .insert([leadPayload])
        .select()
        .single();

      if (error) throw error;

      setCurrentLead(data);

      toast({
        title: "Assessment Saved",
        description: content.success_message,
      });
      
      setShowPayment(true);

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Please try again later or contact us on WhatsApp."
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
      
      <StripePaymentModal 
        isOpen={showPayment} 
        onClose={() => setShowPayment(false)} 
        leadData={currentLead}
      />

      <div className="min-h-screen bg-slate-950 text-slate-50 pt-20">
        <section className="py-20 text-center container mx-auto px-4 bg-slate-900 border-b border-slate-800">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">{content.page_heading}</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {content.page_intro}
          </p>
        </section>

        <AdUnit slotId={ADSENSE_SLOTS.eligibilityTop} />

        <section className="py-8 container mx-auto px-4 max-w-2xl">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">{content.form_title}</h3>
            <p className="text-slate-400 mb-6">{content.form_subtitle}</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Full Name</label>
                  <Input 
                    required 
                    placeholder="John Doe" 
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="bg-slate-950 border-slate-700 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">WhatsApp Number</label>
                  <Input 
                    required 
                    placeholder="+263 77..." 
                    value={formData.whatsapp}
                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                    className="bg-slate-950 border-slate-700 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email Address</label>
                <Input 
                  required 
                  type="email" 
                  placeholder="john@example.com" 
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="bg-slate-950 border-slate-700 h-11"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Current Country</label>
                  <Select required onValueChange={(val) => handleChange('origin_country', val)} value={formData.origin_country}>
                    <SelectTrigger className="bg-slate-950 border-slate-700 h-11"><SelectValue placeholder="Select Country" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                      <SelectItem value="South Africa">South Africa</SelectItem>
                      <SelectItem value="Nigeria">Nigeria</SelectItem>
                      <SelectItem value="Ghana">Ghana</SelectItem>
                      <SelectItem value="Kenya">Kenya</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Target Destination</label>
                  <Select required onValueChange={(val) => handleChange('target_destination', val)} value={formData.target_destination}>
                    <SelectTrigger className="bg-slate-950 border-slate-700 h-11"><SelectValue placeholder="Select Destination" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Poland">Poland</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="USA">USA</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="UK">UK</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Study Level</label>
                  <Select required onValueChange={(val) => handleChange('study_level', val)} value={formData.study_level}>
                    <SelectTrigger className="bg-slate-950 border-slate-700 h-11"><SelectValue placeholder="Select Level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bachelor">Bachelor's Degree</SelectItem>
                      <SelectItem value="Master">Master's Degree</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                      <SelectItem value="Foundation">Foundation Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Annual Budget</label>
                  <Select required onValueChange={(val) => handleChange('budget_range', val)} value={formData.budget_range}>
                    <SelectTrigger className="bg-slate-950 border-slate-700 h-11"><SelectValue placeholder="Select Budget" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="< $5,000">Less than $5,000</SelectItem>
                      <SelectItem value="$5,000 - $15,000">$5,000 - $15,000</SelectItem>
                      <SelectItem value="$15,000 - $30,000">$15,000 - $30,000</SelectItem>
                      <SelectItem value="$30,000+">$30,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
               
               <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Preferred Intake</label>
                  <Select required onValueChange={(val) => handleChange('intake_month', val)} value={formData.intake_month}>
                    <SelectTrigger className="bg-slate-950 border-slate-700 h-11"><SelectValue placeholder="Select Month" /></SelectTrigger>
                    <SelectContent>
                      {['January', 'February', 'September', 'October'].map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                      <SelectItem value="Any">Any Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              <Button type="submit" disabled={loading} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 mt-4">
                {loading ? <Loader2 className="animate-spin" /> : 'Start Assessment'}
              </Button>
            </form>
          </div>
        </section>

        <AdUnit slotId={ADSENSE_SLOTS.eligibilityBottom} />

      </div>
    </>
  );
};

export default EligibilityPage;