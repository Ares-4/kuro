import React, { useState, useEffect } from 'react';
import { getContentHistory, revertContent } from '@/lib/contentService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, History, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format } from 'date-fns';

const VersionHistoryPanel = ({ pageName, fields }) => {
  const { toast } = useToast();
  const [selectedField, setSelectedField] = useState('');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Set default selected field when fields load
  useEffect(() => {
    if (fields.length > 0 && !selectedField) {
      setSelectedField(fields[0].field_name);
    }
  }, [fields, selectedField]);

  useEffect(() => {
    if (pageName && selectedField) {
      fetchHistory();
    }
  }, [pageName, selectedField]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getContentHistory(pageName, selectedField);
      setHistory(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevert = async (historyId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const result = await revertContent(null, historyId, user.id);
      
      if (result.success) {
        toast({
          title: "Reverted Successfully",
          description: "Content has been reverted. Refresh or fetch latest data to see changes.",
          className: "bg-green-600 text-white"
        });
        // Ideally trigger a refresh in parent, but for now we just refresh history list
        fetchHistory();
      } else {
        throw new Error("Revert failed");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not revert content."
      });
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center gap-2 mb-4 text-slate-300 font-semibold">
        <History className="w-5 h-5" />
        <h3>Version History</h3>
      </div>

      <div className="mb-6">
        <label className="text-xs text-slate-500 mb-2 block">Select Field</label>
        <Select value={selectedField} onValueChange={setSelectedField}>
          <SelectTrigger className="w-full bg-slate-950 border-slate-700">
             <SelectValue placeholder="Select a field" />
          </SelectTrigger>
          <SelectContent>
            {fields.map(f => (
              <SelectItem key={f.field_name} value={f.field_name}>
                {f.field_label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin w-6 h-6 text-slate-500" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center text-slate-500 py-8 text-sm">
            No history found for this field.
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {history.map((version) => (
              <AccordionItem key={version.id} value={version.id} className="border border-slate-800 rounded-md bg-slate-950/50 px-3">
                <AccordionTrigger className="hover:no-underline py-3 text-sm">
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-slate-200">
                      {format(new Date(version.changed_at), 'MMM d, yyyy HH:mm')}
                    </span>
                    <span className="text-xs text-slate-500">
                      by {version.changer?.email || 'Unknown'}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 space-y-3">
                  <div className="space-y-1">
                     <p className="text-xs uppercase text-slate-500 font-bold">New Content</p>
                     <div className="bg-slate-900 p-2 rounded text-xs text-slate-300 max-h-24 overflow-y-auto">
                       {version.new_content}
                     </div>
                  </div>
                  <div className="space-y-1">
                     <p className="text-xs uppercase text-slate-500 font-bold">Previous Content</p>
                     <div className="bg-slate-900 p-2 rounded text-xs text-slate-400 max-h-24 overflow-y-auto line-through opacity-70">
                       {version.old_content}
                     </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="w-full mt-2 h-8"
                    onClick={() => handleRevert(version.id)}
                  >
                    <RotateCcw className="w-3 h-3 mr-2" /> Restore this version
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default VersionHistoryPanel;