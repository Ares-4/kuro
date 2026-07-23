import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading2, 
  Heading3, 
  Quote, 
  Undo, 
  Redo, 
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const RichTextEditor = ({ value, onChange, className }) => {
  const contentRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Initialize content
  useEffect(() => {
    if (contentRef.current && value && contentRef.current.innerHTML !== value) {
      // Only update if significantly different to prevent cursor jumps
      // This is a simple check; for production might need more robust comparison
      if (contentRef.current.innerHTML === '') {
        contentRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (contentRef.current) {
      const html = contentRef.current.innerHTML;
      onChange(html);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (contentRef.current) {
      contentRef.current.focus();
    }
    handleInput();
  };

  const ToolbarButton = ({ icon: Icon, command, arg = null, active = false, title }) => (
    <Button
      variant="ghost"
      size="sm"
      type="button"
      onClick={(e) => {
        e.preventDefault();
        execCommand(command, arg);
      }}
      className={cn(
        "h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700",
        active && "bg-slate-700 text-white"
      )}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className={cn("border border-slate-700 rounded-md overflow-hidden bg-slate-900", className)}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-700 bg-slate-800/50">
        <ToolbarButton icon={Bold} command="bold" title="Bold" />
        <ToolbarButton icon={Italic} command="italic" title="Italic" />
        <div className="w-px h-6 bg-slate-700 mx-1" />
        <ToolbarButton icon={Heading2} command="formatBlock" arg="<h2>" title="Heading 2" />
        <ToolbarButton icon={Heading3} command="formatBlock" arg="<h3>" title="Heading 3" />
        <div className="w-px h-6 bg-slate-700 mx-1" />
        <ToolbarButton icon={List} command="insertUnorderedList" title="Bullet List" />
        <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" />
        <ToolbarButton icon={Quote} command="formatBlock" arg="<blockquote>" title="Quote" />
        <div className="w-px h-6 bg-slate-700 mx-1" />
        <ToolbarButton icon={AlignLeft} command="justifyLeft" title="Align Left" />
        <ToolbarButton icon={AlignCenter} command="justifyCenter" title="Align Center" />
        <ToolbarButton icon={AlignRight} command="justifyRight" title="Align Right" />
        <div className="w-px h-6 bg-slate-700 mx-1" />
        <ToolbarButton icon={Undo} command="undo" title="Undo" />
        <ToolbarButton icon={Redo} command="redo" title="Redo" />
      </div>
      
      <div
        ref={contentRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="min-h-[400px] max-h-[600px] overflow-y-auto p-4 focus:outline-none prose prose-invert max-w-none text-slate-200"
        style={{
          // Basic reset styles to ensure consistent editing
        }}
      />
    </div>
  );
};

export default RichTextEditor;