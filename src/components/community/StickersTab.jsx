import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';

const StickersTab = () => {
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStickers = async () => {
      const { data } = await supabase.from('stickers').select('*');
      setStickers(data || []);
      setLoading(false);
    };
    fetchStickers();
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Available Stickers</h2>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {stickers.map((sticker) => (
          <div key={sticker.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-slate-800 transition-colors aspect-square">
            <span className="text-4xl mb-2">{sticker.emoji}</span>
            <span className="text-xs text-slate-500 capitalize">{sticker.name.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StickersTab;