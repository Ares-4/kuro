import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { getPageContent, updatePageContent, getPageFields, getAllPages } from '@/lib/contentService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Save, RotateCcw, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ContentForm from './ContentForm';
import VersionHistoryPanel from './VersionHistoryPanel';
import ContentPreview from './ContentPreview';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';

const ContentManagerPanel = () => {
  const { toast } = useToast();
  const [selectedPage, setSelectedPage] = useState('home');
  const [formData, setFormData] = useState({});
  const [fields, setFields] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const availablePages = getAllPages();

  useEffect(() => {
    fetchPageData(selectedPage);
  }, [selectedPage]);

  const fetchPageData = async (pageName) => {
    setIsLoading(true);
    try {
      const content = await getPageContent(pageName);
      const pageFields = getPageFields(pageName);
      
      setFormData(content);
      setFields(pageFields);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load page content', error);
      toast({
        variant: "destructive",
        title: "Error loading content",
        description: "Please check your connection and try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleRevertField = (fieldName) => {
    const defaultValue = DEFAULT_CONTENT[selectedPage]?.[fieldName];
    if (defaultValue !== undefined) {
      handleFieldChange(fieldName, defaultValue);
      toast({
        title: "Field Reset",
        description: "Field reverted to original default value.",
      });
    }
  };

  const handleRevertAll = () => {
    if (window.confirm('Are you sure you want to reset all fields to their default values? unsaved changes will be lost.')) {
       setFormData(DEFAULT_CONTENT[selectedPage]);
       toast({
         title: "Reset Complete",
         description: "All fields reset to defaults. Click Save to apply.",
       });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    let successCount = 0;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save each field
      const promises = Object.entries(formData).map(([key, value]) => 
        updatePageContent(selectedPage, key, value, user.id)
      );

      const results = await Promise.all(promises);
      successCount = results.filter(r => r.success).length;

      if (successCount > 0) {
        toast({
          title: "Content Saved",
          description: `Successfully updated ${selectedPage} page.`,
          className: "bg-green-600 text-white border-none"
        });
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Save failed', error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 p-4 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-4">
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger className="w-[200px] bg-slate-900 border-slate-700">
              <SelectValue placeholder="Select Page" />
            </SelectTrigger>
            <SelectContent>
              {availablePages.map(page => (
                <SelectItem key={page} value={page} className="capitalize">
                  {page.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-slate-500 hidden md:inline">
            Last fetched: {lastUpdated ? lastUpdated.toLocaleTimeString() : '-'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4 mr-2" /> Preview
          </Button>
          <Button variant="outline" size="sm" onClick={handleRevertAll}>
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {/* Left: Form */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800">
              <ContentForm 
                pageName={selectedPage}
                fields={fields}
                formData={formData}
                onChange={handleFieldChange}
                onRevert={handleRevertField}
              />
            </div>

            {/* Right: History */}
            <div className="w-80 border-l border-slate-800 bg-slate-900/30 overflow-y-auto hidden lg:block">
              <VersionHistoryPanel 
                pageName={selectedPage}
                fields={fields}
              />
            </div>
          </>
        )}
      </div>

      <ContentPreview 
        isOpen={showPreview} 
        onClose={() => setShowPreview(false)}
        pageName={selectedPage}
        contentOverride={formData}
      />
    </div>
  );
};

export default ContentManagerPanel;