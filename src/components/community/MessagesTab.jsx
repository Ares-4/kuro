import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send } from 'lucide-react';
import StickerPicker from './StickerPicker';

const MessagesTab = ({ studentId }) => {
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [stickers, setStickers] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      // 1. Fetch joined groups
      const { data: memberships } = await supabase
        .from('group_members')
        .select('group:community_groups(id, name)')
        .eq('student_id', studentId);

      const groups = memberships?.map(m => m.group) || [];
      setJoinedGroups(groups);
      
      if (groups.length > 0) {
        setSelectedGroupId(groups[0].id);
      }

      // 2. Fetch stickers
      const { data: stickersData } = await supabase.from('stickers').select('*');
      setStickers(stickersData || []);

      setLoading(false);
    };

    if (studentId) init();
  }, [studentId]);

  // Fetch messages and subscribe
  useEffect(() => {
    if (!selectedGroupId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('community_messages')
        .select(`
          id, message_text, created_at,
          student:students(full_name),
          sticker:stickers(emoji, name)
        `)
        .eq('group_id', selectedGroupId)
        .order('created_at', { ascending: true });
      
      setMessages(data || []);
      scrollToBottom();
    };

    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`group-${selectedGroupId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'community_messages', filter: `group_id=eq.${selectedGroupId}` },
        async (payload) => {
          // Fetch complete message data to get relations
          const { data } = await supabase
            .from('community_messages')
            .select(`
              id, message_text, created_at,
              student:students(full_name),
              sticker:stickers(emoji, name)
            `)
            .eq('id', payload.new.id)
            .single();
            
          if (data) {
            setMessages(prev => [...prev, data]);
            scrollToBottom();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedGroupId]);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedGroupId) return;
    
    try {
      await supabase.from('community_messages').insert({
        group_id: selectedGroupId,
        student_id: studentId,
        message_text: inputText
      });
      setInputText('');
    } catch (error) {
      console.error('Failed to send:', error);
    }
  };

  const handleSendSticker = async (sticker) => {
    if (!selectedGroupId) return;
    try {
      await supabase.from('community_messages').insert({
        group_id: selectedGroupId,
        student_id: studentId,
        sticker_id: sticker.id
      });
    } catch (error) {
      console.error('Failed to send sticker:', error);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

  if (joinedGroups.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 border border-slate-800 rounded-xl bg-slate-900/50">
        You haven't joined any groups yet. Go to the Groups tab to join one!
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
         <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
           <SelectTrigger className="w-[250px] bg-slate-950 border-slate-700">
             <SelectValue placeholder="Select Group" />
           </SelectTrigger>
           <SelectContent>
             {joinedGroups.map(g => (
               <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
             ))}
           </SelectContent>
         </Select>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
        {messages.map((msg) => {
          const isMe = false; // ideally check vs studentId
          return (
            <div key={msg.id} className="flex flex-col items-start">
              <span className="text-xs text-slate-500 mb-1 ml-1">{msg.student?.full_name || 'Unknown'}</span>
              <div className={`rounded-lg p-3 max-w-[80%] ${msg.sticker ? 'bg-transparent pl-0' : 'bg-slate-800 text-slate-200'}`}>
                {msg.sticker ? (
                   <span className="text-4xl" title={msg.sticker.name}>{msg.sticker.emoji}</span>
                ) : (
                   msg.message_text
                )}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-900 flex gap-2">
        <StickerPicker stickers={stickers} onSelect={handleSendSticker} />
        <Input 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
          className="bg-slate-950 border-slate-700 flex-1"
        />
        <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700" size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessagesTab;