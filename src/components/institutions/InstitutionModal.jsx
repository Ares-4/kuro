import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Users, Globe, Clock, DollarSign, Calendar, GraduationCap, ArrowRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDuration } from '@/lib/utils';

const InstitutionModal = ({ isOpen, onClose, institution }) => {
  const [activeTab, setActiveTab] = useState('about');

  if (!institution) return null;

  // Placeholder data if fields are missing
  const stats = [
    { label: 'Student Population', value: institution.studentCount || '15,000+', icon: Users },
    { label: 'Intl. Students', value: institution.intlStudentCount || '2,500+', icon: Globe },
    { label: 'Founded', value: institution.foundedYear || '1992', icon: Building },
    { label: 'Location', value: institution.city || 'Warsaw', icon: MapPin },
  ];

  const programs = institution.programs || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-white p-2 flex items-center justify-center shrink-0">
               {institution.logoUrl ? (
                 <img src={institution.logoUrl} alt={institution.name} className="w-full h-full object-contain" />
               ) : (
                 <Building className="w-8 h-8 text-slate-900" />
               )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{institution.name}</h2>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{institution.city || 'Warsaw'}, {institution.country || 'Poland'}</span>
                {institution.ranking && (
                  <Badge variant="outline" className="ml-2 border-blue-500/50 text-blue-400">
                    Rank #{institution.ranking}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
            <div className="px-6 pt-4 border-b border-slate-800 bg-slate-900/30">
              <TabsList className="bg-transparent p-0 gap-6">
                <TabsTrigger 
                  value="about" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none pb-3 px-0 text-slate-400 data-[state=active]:text-blue-400 transition-none"
                >
                  About
                </TabsTrigger>
                <TabsTrigger 
                  value="programs" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none pb-3 px-0 text-slate-400 data-[state=active]:text-blue-400 transition-none"
                >
                  Programs <Badge className="ml-2 bg-blue-900/50 text-blue-300 hover:bg-blue-900/50 h-5 px-1.5">{programs.length}</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="details" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none pb-3 px-0 text-slate-400 data-[state=active]:text-blue-400 transition-none"
                >
                  Admission & Details
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950/50 custom-scrollbar">
              <div className="p-6">
                
                {/* About Tab */}
                <TabsContent value="about" className="mt-0 space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col items-center text-center">
                        <stat.icon className="w-5 h-5 text-blue-500 mb-2" />
                        <span className="text-xl font-bold text-white">{stat.value}</span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed">
                    <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
                    <p>{institution.description || 'No description available for this institution.'}</p>
                    
                    {institution.features && (
                       <>
                         <h3 className="text-lg font-semibold text-white mt-6 mb-2">Key Features</h3>
                         <ul className="grid md:grid-cols-2 gap-2">
                           {institution.features.map((feature, idx) => (
                             <li key={idx} className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                               {feature}
                             </li>
                           ))}
                         </ul>
                       </>
                    )}
                  </div>
                </TabsContent>

                {/* Programs Tab */}
                <TabsContent value="programs" className="mt-0">
                  <div className="space-y-4">
                    {programs.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        No programs listed at this moment.
                      </div>
                    ) : (
                      programs.map((prog, idx) => (
                        <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-blue-500/30 transition-colors">
                          <div className="space-y-1">
                             <div className="flex items-center gap-2">
                               <h4 className="font-semibold text-white text-lg">{prog.name}</h4>
                               <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">{prog.level || 'Bachelor'}</Badge>
                             </div>
                             <div className="flex items-center gap-4 text-sm text-slate-400">
                               <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(prog.duration)}</span>
                               <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {formatCurrency(prog.tuition, prog.currency)}/year</span>
                             </div>
                          </div>
                          <Button size="sm" className="md:opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 hover:bg-blue-700">
                            View Details
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="mt-0 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
                        <h3 className="flex items-center gap-2 font-semibold text-white mb-4">
                          <GraduationCap className="w-5 h-5 text-purple-400" /> Admission Requirements
                        </h3>
                        <ul className="space-y-2 text-sm text-slate-300">
                          {institution.requirements ? (
                            institution.requirements.map((req, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="mt-1.5 w-1 h-1 bg-purple-400 rounded-full shrink-0"/>
                                {req}
                              </li>
                            ))
                          ) : (
                            <>
                              <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 bg-purple-400 rounded-full shrink-0"/>High School Diploma / Bachelor Degree</li>
                              <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 bg-purple-400 rounded-full shrink-0"/>English Proficiency (IELTS 6.0+)</li>
                              <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 bg-purple-400 rounded-full shrink-0"/>Valid Passport</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
                        <h3 className="flex items-center gap-2 font-semibold text-white mb-4">
                          <Calendar className="w-5 h-5 text-orange-400" /> Deadlines
                        </h3>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center text-sm">
                             <span className="text-slate-400">Fall Intake</span>
                             <span className="text-white font-medium">July 15th</span>
                           </div>
                           <div className="w-full h-px bg-slate-800" />
                           <div className="flex justify-between items-center text-sm">
                             <span className="text-slate-400">Spring Intake</span>
                             <span className="text-white font-medium">November 30th</span>
                           </div>
                        </div>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
                        <h3 className="flex items-center gap-2 font-semibold text-white mb-4">
                           <Globe className="w-5 h-5 text-blue-400" /> Contact
                        </h3>
                        <div className="text-sm text-slate-300 space-y-1">
                          <p>Admissions Office</p>
                          <p className="text-white">{institution.email || 'admissions@example.edu'}</p>
                          <p>{institution.phone || '+48 22 123 4567'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

              </div>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
            Close
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            Apply Now <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstitutionModal;