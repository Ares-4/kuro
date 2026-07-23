import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const StickerPicker = ({ stickers = [], onSelect }) => {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (sticker) => {
    onSelect(sticker);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white shrink-0">
          <Smile className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-slate-900 border-slate-800" align="start">
        <div className="p-3 border-b border-slate-800">
           <h4 className="font-medium text-sm text-slate-300">Choose a Sticker</h4>
        </div>
        <ScrollArea className="h-64 p-3">
          <div className="grid grid-cols-4 gap-3">
            {stickers && stickers.length > 0 ? (
              stickers.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => handleSelect(sticker)}
                  className="hover:bg-slate-800 p-2 rounded-lg text-3xl transition-colors flex items-center justify-center aspect-square border border-transparent hover:border-slate-700"
                  title={sticker.name}
                >
                  {sticker.emoji}
                </button>
              ))
            ) : (
              <div className="col-span-4 text-center text-xs text-slate-500 py-4">
                No stickers available
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default StickerPicker;