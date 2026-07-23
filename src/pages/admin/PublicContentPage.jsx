import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PublicContentForm from '@/components/admin/PublicContentForm';
import ContentPreview from '@/components/admin/ContentPreview';

const PublicContentPage = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [currentContent, setCurrentContent] = useState({});

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Public Content Management</h1>
          <p className="text-slate-400">Edit text and content across your public website.</p>
        </div>
        <Button onClick={() => setPreviewOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Eye className="w-4 h-4 mr-2" /> Live Preview
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 flex-1 min-h-0">
        <div className="lg:col-span-2 overflow-y-auto pr-2 pb-20">
          <PublicContentForm 
             onContentChange={setCurrentContent}
             onPageChange={setCurrentPage}
          />
        </div>
        
        <div className="hidden lg:block bg-slate-900 rounded-xl border border-slate-800 p-6 h-fit">
          <h3 className="text-lg font-bold text-white mb-4">Quick Guide</h3>
          <ul className="space-y-3 text-slate-400 text-sm list-disc pl-4">
            <li>Select a page from the dropdown.</li>
            <li>Edit text fields. Changes are auto-saved to preview (but not DB).</li>
            <li>Click the Save icon next to a field to publish changes live.</li>
            <li>Use the History icon to revert to previous versions.</li>
            <li>Use "Live Preview" to see how it looks on mobile/desktop.</li>
          </ul>
        </div>
      </div>

      <ContentPreview 
        isOpen={previewOpen} 
        onClose={() => setPreviewOpen(false)} 
        page={currentPage}
        content={currentContent} 
      />
    </div>
  );
};

export default PublicContentPage;