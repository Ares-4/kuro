import React, { useEffect, useState } from 'react';
import CountUp from '@/components/CountUp';
import { supabase } from '@/lib/customSupabaseClient';
import { ShieldCheck, GraduationCap, Globe2, Users, Wallet, CalendarClock, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

const CredibilityBlock = ({ className = "" }) => {
  const [metrics, setMetrics] = useState([
    { icon: 'ShieldCheck', value: '90%+', label: 'Visa Success Rate' },
    { icon: 'Users', value: '200+', label: 'Students Placed' },
    { icon: 'GraduationCap', value: '35+', label: 'Partner Universities' },
    { icon: 'Globe2', value: '5+', label: 'Countries Served' }
  ]);

  useEffect(() => {
    const fetchMetrics = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'credibility_metrics')
        .maybeSingle();
      
      if (data?.value) setMetrics(data.value);
    };
    fetchMetrics();
  }, []);

  const getIcon = (iconName) => {
    const icons = { ShieldCheck, Users, GraduationCap, Globe2 };
    const Icon = icons[iconName] || ShieldCheck;
    return <Icon className="w-10 h-10" />;
  };


  return (
    <section className={`py-20 bg-slate-950 border-y border-slate-900 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Statement */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">
            We Don't Guess. We Deliver.
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Our expertise is built on data, regulatory knowledge, and direct partnerships. 
            We prioritize transparency over promises, ensuring you have a realistic path to Europe.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {metrics.map((metric, index) => (
            <div key={index} className="bento-cell text-center">
              <div className="accent-text relative z-10 flex justify-center mb-4">
                {getIcon(metric.icon)}
              </div>
              <CountUp value={metric.value} className="relative z-10 block text-4xl font-bold text-white mb-2 tabular" />
              <div className="relative z-10 text-sm text-slate-300 font-semibold">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* What students actually worry about, each answered with something
            the site really does (and links to it). Replaces an unverifiable
            'Certified Excellence' claim. */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Wallet, title: 'Prices before you pay', body: '€2.99 or €19 for the readiness check, shown upfront. The €19 comes off our full service fee.', to: '/readiness-check', cta: 'See prices' },
            { icon: ShieldCheck, title: 'Visa rules checked', body: 'Visa fees and steps are checked against official sources, with the date on every country page.', to: '/destinations', cta: 'Check your country' },
            { icon: CalendarClock, title: 'Deadlines you can see', body: 'University and scholarship deadlines for 2027, updated as they change, so you never miss an intake.', to: '/deadlines', cta: 'View deadlines' },
            { icon: BookOpen, title: 'Free 2027 guide', body: '15 pages on costs, documents, visas, scholarships and avoiding scams, written for Southern African students.', to: '/guides/kuro-study-in-europe-guide-2027.pdf', cta: 'Download PDF', external: true },
          ].map(({ icon: Icon, title, body, to, cta, external }) => (
            <div key={title} className="bento-cell flex flex-col">
              <div className="accent-chip w-11 h-11 rounded-xl flex items-center justify-center mb-4"><Icon className="w-5 h-5" /></div>
              <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed flex-1">{body}</p>
              {external
                ? <a href={to} target="_blank" rel="noopener noreferrer" className="accent-text mt-4 text-sm font-semibold hover:underline underline-offset-4">{cta}</a>
                : <Link to={to} className="accent-text mt-4 text-sm font-semibold hover:underline underline-offset-4">{cta}</Link>}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CredibilityBlock;