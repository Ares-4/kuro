import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MessageSquare, X, Send, User, Bot, Minimize2, Loader2, Phone, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const STOP_WORDS = new Set(['a','an','the','is','are','was','were','i','my','what','how','do','does','can','will','would','could','should','in','on','at','to','for','of','and','or','but','not','be','have','has','it','this','that','with','about','from']);

const extractKeywords = (text) =>
  text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));

const QUICK_ACTIONS = ['Visa requirements', 'Study in Poland', 'Cost breakdown', 'How to apply', 'IELTS score'];

const FALLBACK = "I don't have a specific answer for that. For personalised guidance, book a free consultation with our team — they'll respond within 24 hours.";

const KuroChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm the Kuro assistant. Ask me anything about studying abroad — visas, costs, applications, or destinations.", id: 'init' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('chat');
  const [leadStep, setLeadStep] = useState(0);
  const [leadData, setLeadData] = useState({ name: '', whatsapp: '', email: '', goal: '' });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const searchKnowledge = async (text) => {
    const keywords = extractKeywords(text);
    if (!keywords.length) return null;

    const orFilters = keywords.map(kw => `question.ilike.%${kw}%`).join(',');

    const { data } = await supabase
      .from('knowledge_base')
      .select('question, answer, tags, page_link')
      .eq('is_active', true)
      .or(orFilters)
      .limit(3);

    if (!data?.length) {
      const tagFilter = keywords.map(kw => `tags.cs.{${kw}}`).join(',');
      const { data: tagData } = await supabase
        .from('knowledge_base')
        .select('question, answer, tags, page_link')
        .eq('is_active', true)
        .or(tagFilter)
        .limit(3);
      return tagData?.length ? tagData[0] : null;
    }

    return data[0];
  };

  const handleSend = async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages(prev => [...prev, { role: 'user', content: trimmed, id: Date.now().toString() }]);
    setInput('');

    if (mode === 'lead-capture') {
      setLoading(true);
      await handleLeadFlow(trimmed);
      setLoading(false);
      return;
    }

    setLoading(true);
    const match = await searchKnowledge(trimmed);
    setLoading(false);

    const botMsg = {
      role: 'assistant',
      content: match ? match.answer : FALLBACK,
      pageLink: match?.page_link || null,
      id: (Date.now() + 1).toString(),
    };
    setMessages(prev => [...prev, botMsg]);
  };

  const startHandoff = () => {
    setMode('lead-capture');
    setLeadStep(0);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: "I'll connect you with a human advisor. First, what is your full name?",
      id: 'lead-1'
    }]);
  };

  const handleLeadFlow = async (text) => {
    const steps = [
      { field: 'name',     nextPrompt: "What is your WhatsApp number (with country code)?" },
      { field: 'whatsapp', nextPrompt: "What is your email address?" },
      { field: 'email',    nextPrompt: "What is your main study goal? (e.g. Study Medicine in Poland)" },
      { field: 'goal',     nextPrompt: null }
    ];
    const step = steps[leadStep];
    const updated = { ...leadData, [step.field]: text };
    setLeadData(updated);

    if (leadStep < steps.length - 1) {
      setLeadStep(p => p + 1);
      setMessages(prev => [...prev, { role: 'assistant', content: step.nextPrompt, id: `lead-${leadStep + 2}` }]);
    } else {
      await supabase.from('leads').insert([{ ...updated, intake_form: 'Chat Widget' }]);
      setMessages(prev => [...prev, { role: 'assistant', content: "Your request has been received. Our team will reach out via WhatsApp within 24 hours.", id: 'lead-done' }]);
      setMode('chat');
    }
  };

  const fab = (
    <motion.button
      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-[0_8px_30px_rgba(37,99,235,0.5)] flex items-center justify-center"
      style={{ background: 'var(--blue-600, #2563eb)' }}
      aria-label="Open Kuro assistant"
    >
      <MessageSquare className="w-6 h-6 text-white" />
    </motion.button>
  );

  return (
    <AnimatePresence mode="wait">
      {!isOpen ? fab : (
        <motion.div
          key="chat"
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl border",
            isMinimized ? "w-72 h-14" : "w-[90vw] sm:w-[400px] h-[580px] max-h-[85vh]"
          )}
          style={{ background: 'var(--wall, #0f1729)', borderColor: 'var(--line-2, rgba(255,255,255,0.08))' }}
        >
          {/* Header */}
          <div
            className="h-14 px-4 flex items-center justify-between shrink-0 cursor-pointer"
            style={{ background: 'rgba(37,99,235,0.15)', borderBottom: '1px solid rgba(37,99,235,0.2)' }}
            onClick={() => isMinimized && setIsMinimized(false)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">Kuro Assistant</p>
                <p className="text-[10px] text-blue-400 leading-none mt-0.5">Online · Instant answers</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={e => { e.stopPropagation(); setIsMinimized(m => !m); }}
                className="p-1.5 text-slate-400 hover:text-white transition-colors rounded"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); setIsOpen(false); }}
                className="p-1.5 text-slate-400 hover:text-white transition-colors rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={cn("flex gap-2.5", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                      msg.role === 'user' ? "bg-blue-600" : "bg-slate-700"
                    )}>
                      {msg.role === 'user'
                        ? <User className="w-3.5 h-3.5 text-white" />
                        : <Bot className="w-3.5 h-3.5 text-blue-400" />
                      }
                    </div>
                    <div className={cn(
                      "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      msg.role === 'user'
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : "text-slate-200 rounded-tl-sm"
                    )} style={msg.role !== 'user' ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' } : {}}>
                      {msg.content}
                      {msg.pageLink && (
                        <Link to={msg.pageLink} className="flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300">
                          <ExternalLink className="w-3 h-3" /> Learn more
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {[0, 1, 2].map(i => (
                        <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick actions */}
              {mode === 'chat' && messages.length < 3 && (
                <div className="px-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
                  {QUICK_ACTIONS.map(a => (
                    <button key={a} onClick={() => handleSend(a)}
                      className="shrink-0 text-xs px-3 py-1.5 rounded-full border text-slate-300 hover:text-white transition-colors whitespace-nowrap"
                      style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}>
                      {a}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 space-y-2 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={mode === 'chat' ? "Ask about visas, costs, universities..." : "Type your answer..."}
                    className="text-sm"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    disabled={loading}
                  />
                  <Button type="submit" size="icon" disabled={loading || !input.trim()}
                    className="shrink-0 bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
                {mode === 'chat' && (
                  <button onClick={startHandoff}
                    className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1.5 py-1">
                    <Phone className="w-3 h-3" /> Talk to a human advisor
                  </button>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KuroChatWidget;
