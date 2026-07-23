import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const GroupRequestModal = ({ isOpen, onClose, studentId }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('community_groups').insert({
        name: formData.name,
        description: formData.description,
        created_by: studentId,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Your group request is pending moderator approval.",
        className: "bg-green-600 text-white border-none"
      });
      
      setFormData({ name: '', description: '' });
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit request."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Request New Group</DialogTitle>
          <DialogDescription className="text-slate-400">
            Create a new community group. It will be reviewed by a moderator.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Group Name</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Computer Science Students"
              className="bg-slate-950 border-slate-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <Textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What is this group about?"
              className="bg-slate-950 border-slate-700 min-h-[100px]"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GroupRequestModal;