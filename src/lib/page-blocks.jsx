import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Block Components for Dynamic Pages

export const HeroBlock = ({ content }) => (
  <section className="py-20 px-4 bg-slate-900 relative overflow-hidden">
    <div className="absolute inset-0 bg-blue-600/10" />
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {content.title || "Hero Title"}
        </h1>
        <p className="text-xl text-slate-300 mb-8">
          {content.subtitle || "Hero subtitle goes here."}
        </p>
        <div className="flex gap-4">
          {content.ctaText && (
            <Link to={content.ctaLink || "#"}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg">
                {content.ctaText} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
      </motion.div>
      <div className="relative mt-8 lg:mt-0">
        {content.image_url ? (
          <img src={content.image_url} alt="Hero" className="rounded-2xl shadow-2xl w-full h-auto object-cover aspect-[4/3]" />
        ) : (
          <div className="w-full h-64 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500">
             No Image
          </div>
        )}
      </div>
    </div>
  </section>
);

export const RichTextBlock = ({ content }) => (
  <section className="py-16 px-4 bg-slate-950">
    <div className="max-w-4xl mx-auto prose prose-invert prose-lg">
      {content.heading && <h2 className="text-3xl font-bold text-white mb-6">{content.heading}</h2>}
      <div className="text-slate-300 whitespace-pre-wrap">{content.text}</div>
    </div>
  </section>
);

export const FeaturesBlock = ({ content }) => (
  <section className="py-16 px-4 bg-slate-900/50">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">{content.title || "Our Features"}</h2>
        <p className="text-slate-400">{content.subtitle}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {(content.features || []).map((feature, idx) => (
          <div key={idx} className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <CheckCircle className="w-10 h-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-slate-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const CtaBlock = ({ content }) => (
  <section className="py-20 px-4 bg-blue-900">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{content.title || "Ready to start?"}</h2>
      <p className="text-xl text-blue-100 mb-8">{content.subtitle}</p>
      <Link to={content.link || "/signup"}>
        <Button size="lg" className="bg-white text-blue-900 hover:bg-slate-100">
          {content.buttonText || "Get Started"}
        </Button>
      </Link>
    </div>
  </section>
);

export const BlockRenderer = ({ section }) => {
  switch (section.type) {
    case 'hero': return <HeroBlock content={section.content} />;
    case 'richtext': return <RichTextBlock content={section.content} />;
    case 'features': return <FeaturesBlock content={section.content} />;
    case 'cta': return <CtaBlock content={section.content} />;
    default: return null;
  }
};