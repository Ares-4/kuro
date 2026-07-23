import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Book, MessageSquare, Phone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ResourcesAndSupportSection = () => {
  const resources = [
    { name: "FAQ Center", icon: HelpCircle, link: "/faqs", color: "text-blue-400" },
    { name: "Student Guide", icon: Book, link: "/resources", color: "text-green-400" },
    { name: "Contact Support", icon: Phone, link: "/contact", color: "text-purple-400" }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">Support & Resources</h2>
      
      <div className="grid gap-4">
        {resources.map((res, i) => (
          <Link key={i} to={res.link} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-slate-600 transition-all group">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg bg-slate-800 ${res.color}`}>
                <res.icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-slate-200 group-hover:text-white">{res.name}</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
          </Link>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-900/50 rounded-xl">
        <h4 className="text-sm font-bold text-blue-200 mb-2">Need immediate help?</h4>
        <p className="text-xs text-blue-300 mb-3">Our student success team is available Mon-Fri, 9am-5pm.</p>
        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-xs">Chat with Agent</Button>
      </div>
    </motion.div>
  );
};

export default ResourcesAndSupportSection;