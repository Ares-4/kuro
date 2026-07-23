import React, { useState } from 'react';
import { Plus, X, GripHorizontal, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const AdSlotPlaceholder = ({ page, slot, currentPlacement, onDrop, onRemove, promoDetails }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
    
    // Retrieve the promo ID from the drag event
    const promoId = e.dataTransfer.getData('text/plain');
    if (promoId && onDrop) {
      onDrop(page, slot, promoId);
    }
  };

  return (
    <div 
      className={cn(
        "relative w-full rounded-lg border-2 border-dashed transition-all duration-200 my-4 flex flex-col items-center justify-center min-h-[120px]",
        isOver 
          ? "border-blue-500 bg-blue-500/10 scale-[1.02]" 
          : currentPlacement 
            ? "border-green-500/50 bg-green-500/5" 
            : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="absolute top-2 left-3 text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center gap-2">
        <Target className="w-3 h-3" />
        {slot.replace('_', ' ')}
      </div>

      {currentPlacement && promoDetails ? (
        <div className="w-full h-full p-4 pt-8 flex items-center justify-between gap-4">
           <div className="flex items-center gap-3">
             <div className="bg-slate-200 text-slate-900 px-2 py-1 rounded text-xs font-bold uppercase">
               {promoDetails.type || 'Promo'}
             </div>
             <div>
               <div className="font-semibold text-slate-900 dark:text-white text-sm">{promoDetails.title}</div>
               <div className="text-xs text-slate-500 truncate max-w-[200px]">{promoDetails.text}</div>
             </div>
           </div>
           
           <button 
             onClick={() => onRemove(page, slot)}
             className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-md transition-colors"
             title="Remove placement"
           >
             <X className="w-4 h-4" />
           </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Plus className="w-6 h-6 opacity-50" />
          <span className="text-sm font-medium">Drop Promo Here</span>
        </div>
      )}
      
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20 backdrop-blur-[1px] rounded-lg border-2 border-blue-500 z-10 pointer-events-none">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            Drop to Place
          </span>
        </div>
      )}
    </div>
  );
};

export default AdSlotPlaceholder;