import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { History, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from '@/lib/customSupabaseClient';
import { revertContent } from '@/lib/contentService';
import { useToast } from '@/components/ui/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const VersionHistory = ({ page, fieldName, contentId, onRevert }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { adminUser } = useAdminAuth();

  const fetchHistory = async () => {
    if (!contentId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('public_content_history')
        .select('*')
        .eq('content_id', contentId)
        .order('changed_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (historyItem) => {
    const result = await revertContent(contentId, historyItem.id, adminUser?.id);
    if (result.success) {
      toast({ title: "Content Reverted", className: "bg-green-600 text-white border-none" });
      onRevert();
      setIsOpen(false);
    } else {
      toast({ title: "Revert Failed", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if(open) fetchHistory();
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <History className="h-4 w-4 text-slate-400" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Version History for {fieldName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {loading ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : history.length === 0 ? (
            <p className="text-slate-400 text-center">No history available for this field.</p>
          ) : (
            history.map((item) => (
              <div key={item.id} className="p-4 rounded-lg border border-slate-800 bg-slate-950/50">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-slate-400">
                    <span className="font-semibold text-white">Changed by:</span> {item.changed_by || 'Unknown'} <br/>
                    <span className="text-xs">{format(new Date(item.changed_at), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-slate-700 hover:bg-slate-800 text-xs h-7"
                    onClick={() => handleRevert(item)}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Restore Previous
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-2 text-xs">
                  <div className="p-2 bg-red-950/20 rounded border border-red-900/30">
                    <p className="font-bold text-red-400 mb-1">Previous Value:</p>
                    <p className="text-slate-300 break-words line-clamp-3">{item.old_content}</p>
                  </div>
                  <div className="p-2 bg-green-950/20 rounded border border-green-900/30">
                    <p className="font-bold text-green-400 mb-1">New Value:</p>
                    <p className="text-slate-300 break-words line-clamp-3">{item.new_content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VersionHistory;