import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, GraduationCap, Building2, MapPin, X, FileText } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const STATIC_PAGES = [
  { title: 'Intake planner', path: '/intake-planner', description: 'Plan country, intake, budget, documents and visa route.' },
  { title: 'Readiness check', path: '/readiness-check', description: 'Check admission and visa risk before applying.' },
  { title: 'Application deadlines', path: '/deadlines', description: 'Track deadline windows and pinned dates.' },
  { title: 'Scholarships', path: '/scholarships', description: 'Find funding opportunities and scholarship pages.' },
  { title: 'Universities', path: '/universities', description: 'Browse partner and target institutions.' },
  { title: 'Services', path: '/services', description: 'Admissions, visa and relocation support.' },
  { title: 'Contact', path: '/contact', description: 'Book consultation or message Kuro.' },
];

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ pages: [], programs: [], universities: [], destinations: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const search = async () => {
      if (query.trim().length < 2) {
        setResults({ pages: [], programs: [], universities: [], destinations: [] });
        return;
      }

      setLoading(true);
      try {
        const [progRes, uniRes, destRes] = await Promise.all([
          supabase.from('programs').select('id, program_name, university, country').ilike('program_name', `%${query}%`).limit(5),
          supabase.from('universities').select('id, name, destination_id, destinations(name)').ilike('name', `%${query}%`).limit(5),
          supabase.from('destinations').select('id, name, slug').ilike('name', `%${query}%`).limit(3)
        ]);

        setResults({
          pages: STATIC_PAGES.filter(page => `${page.title} ${page.description}`.toLowerCase().includes(query.toLowerCase())).slice(0, 5),
          programs: progRes.data || [],
          universities: uniRes.data || [],
          destinations: destRes.data || []
        });
      } catch (error) {
        console.error("Search error", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-slate-900 border-slate-700 text-white gap-0 overflow-hidden">
        <div className="flex items-center border-b border-slate-700 px-4 py-3">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500 text-base"
            placeholder="Search courses, universities, or countries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <ScrollArea className="max-h-[60vh]">
          {loading ? (
            <div className="py-10 flex justify-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="p-2">
              {!query && (
                <div className="py-8 text-center text-slate-500 text-sm">
                  Type at least 2 characters to search...
                </div>
              )}

              {query && results.pages.length === 0 && results.programs.length === 0 && results.universities.length === 0 && results.destinations.length === 0 && (
                <div className="py-8 text-center text-slate-500">
                  No results found for "{query}"
                </div>
              )}

              {/* Pages */}
              {results.pages.length > 0 && (
                <div className="mb-2">
                  <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Pages and tools</h3>
                  {results.pages.map(page => (
                    <div
                      key={page.path}
                      onClick={() => handleSelect(page.path)}
                      className="flex items-center px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 rounded-md cursor-pointer group"
                    >
                      <FileText className="w-4 h-4 mr-3 text-amber-400 group-hover:text-amber-300" />
                      <div>
                        <div className="font-medium">{page.title}</div>
                        <div className="text-xs text-slate-500">{page.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Destinations */}
              {results.destinations.length > 0 && (
                <div className="mb-2">
                  <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Destinations</h3>
                  {results.destinations.map(dest => (
                    <div
                      key={dest.id}
                      onClick={() => handleSelect(`/destinations/${dest.slug}`)}
                      className="flex items-center px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 rounded-md cursor-pointer group"
                    >
                      <MapPin className="w-4 h-4 mr-3 text-purple-400 group-hover:text-purple-300" />
                      {dest.name}
                    </div>
                  ))}
                </div>
              )}

              {/* Universities */}
              {results.universities.length > 0 && (
                <div className="mb-2">
                  <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Universities</h3>
                  {results.universities.map(uni => (
                    <div
                      key={uni.id}
                      onClick={() => handleSelect(`/universities/${uni.id}`)}
                      className="flex items-center px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 rounded-md cursor-pointer group"
                    >
                      <Building2 className="w-4 h-4 mr-3 text-blue-400 group-hover:text-blue-300" />
                      <div>
                        <div className="font-medium">{uni.name}</div>
                        <div className="text-xs text-slate-500">{uni.destinations?.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Programs */}
              {results.programs.length > 0 && (
                <div className="mb-2">
                  <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Programs</h3>
                  {results.programs.map(prog => (
                    <div
                      key={prog.id}
                      onClick={() => handleSelect(`/courses/${prog.id}`)}
                      className="flex items-center px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 rounded-md cursor-pointer group"
                    >
                      <GraduationCap className="w-4 h-4 mr-3 text-green-400 group-hover:text-green-300" />
                      <div>
                        <div className="font-medium">{prog.program_name}</div>
                        <div className="text-xs text-slate-500">{prog.university}, {prog.country}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearch;