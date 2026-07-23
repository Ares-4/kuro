import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote, User } from 'lucide-react';

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const [{ data }, { data: setting }] = await Promise.all([
        supabase
          .from('testimonials')
          .select('*')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(6),
        supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'show_testimonials_section')
          .maybeSingle(),
      ]);
      setTestimonials(data || []);
      if (setting !== null && setting?.value === false) setVisible(false);
      setLoading(false);
    };
    fetchTestimonials();
  }, []);

  if (loading || !visible || testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Student Success Stories</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Don't just take our word for it. Here is what students are saying about their journey with Kuro.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-slate-950 border-slate-800 relative hover:border-slate-700 transition-colors">
              <CardContent className="pt-12 pb-8 px-8">
                <Quote className="absolute top-8 left-8 w-8 h-8 text-blue-900/50 rotate-180" />
                
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>

                <p className="text-slate-300 mb-8 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-4 border-t border-slate-900 pt-6">
                  <div className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-500 font-bold shrink-0">
                     {testimonial.image_url ? (
                       <img src={testimonial.image_url} alt={testimonial.student_name} className="w-full h-full rounded-full object-cover" />
                     ) : (
                       <User className="w-5 h-5" />
                     )}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{testimonial.student_name}</div>
                    <div className="text-xs text-slate-500">{testimonial.program} at {testimonial.university}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;