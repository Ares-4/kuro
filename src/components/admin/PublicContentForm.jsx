import React, { useState, useEffect } from 'react';
import { Save, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { getPageContent, updatePageContent } from '@/lib/contentService';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import VersionHistory from './VersionHistory';

const pages = [
  { id: 'home', label: 'Home Page' },
  { id: 'destinations', label: 'Destinations Page' },
  { id: 'services', label: 'Services Page' },
  { id: 'process', label: 'Process Page' },
  { id: 'why_kuro', label: 'Why Kuro Page' },
  { id: 'faqs', label: 'FAQs Page' },
  { id: 'contact', label: 'Contact Page' },
  { id: 'eligibility', label: 'Eligibility Page' },
];

const PublicContentForm = ({ onContentChange, onPageChange }) => {
  const [selectedPage, setSelectedPage] = useState('home');
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});
  const { toast } = useToast();
  const { adminUser } = useAdminAuth();

  useEffect(() => {
    fetchContent(selectedPage);
    onPageChange?.(selectedPage);
  }, [selectedPage]);

  const fetchContent = async (page) => {
    setLoading(true);
    const data = await getPageContent(page);
    setContent(data);
    onContentChange?.(data); // Propagate to preview
    setLoading(false);
  };

  const handleFieldChange = (field, value) => {
    const updated = { ...content, [field]: value };
    setContent(updated);
    onContentChange?.(updated); // Live preview update
  };

  const handleSave = async (field) => {
    setSaving(prev => ({ ...prev, [field]: true }));
    try {
      const result = await updatePageContent(selectedPage, field, content[field], adminUser?.id);
      if (result.success) {
        toast({ title: "Saved", className: "bg-green-600 text-white border-none h-10" });
      } else {
        toast({ title: "Error", description: "Failed to save content", variant: "destructive" });
      }
    } finally {
      setSaving(prev => ({ ...prev, [field]: false }));
    }
  };

  const renderFields = () => {
    const defaultFields = DEFAULT_CONTENT[selectedPage] || {};
    
    return Object.keys(defaultFields).map((key) => {
      const label = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const isLongText = key.includes('description') || key.includes('intro') || key.includes('answer');
      
      return (
        <div key={key} className="p-4 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
          <div className="flex justify-between items-center mb-1">
            <Label className="text-slate-200">{label}</Label>
            <div className="flex items-center gap-2">
              <VersionHistory 
                page={selectedPage} 
                fieldName={key} 
                contentId={null} 
                onRevert={() => fetchContent(selectedPage)}
              />
              <Button 
                size="sm" 
                onClick={() => handleSave(key)}
                disabled={saving[key]}
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
              >
                {saving[key] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              </Button>
            </div>
          </div>
          
          {isLongText ? (
            <Textarea
              value={content[key] || ''}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              className="bg-slate-950 border-slate-800 min-h-[100px]"
            />
          ) : (
            <Input
              value={content[key] || ''}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              className="bg-slate-950 border-slate-800"
            />
          )}
          <div className="text-xs text-slate-500 text-right">
            {content[key]?.length || 0} chars
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-lg border border-slate-800 sticky top-0 z-10 shadow-md">
        <Select value={selectedPage} onValueChange={setSelectedPage}>
          <SelectTrigger className="w-[200px] bg-slate-950 border-slate-700">
            <SelectValue placeholder="Select Page" />
          </SelectTrigger>
          <SelectContent>
            {pages.map(p => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => fetchContent(selectedPage)} title="Refresh">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></div>
        ) : (
          renderFields()
        )}
      </div>
    </div>
  );
};

export default PublicContentForm;