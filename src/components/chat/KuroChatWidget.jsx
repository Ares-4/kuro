import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { MessageSquare, X, Send, User, Bot, Minimize2, Loader2, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

const QUICK_ACTIONS = [
  "Admissions",
  "Visa Basics", 
  "Tuition & Costs",
  "Accommodation",
  "Requirements"
];

const KuroChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am the Kuro Assistant. How can I help you today?', id: 'init' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [mode, setMode] = useState('chat'); // 'chat' or 'lead-capture'
  const [leadStep, setLeadStep] = useState(0);
  const [leadData, setLeadData] = useState({ name: '', whatsapp: '', email: '', goal: '' });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize session
    const initSession = async () => {
      let storedSession = localStorage.getItem('kuro_chat_session');
      if (!storedSession) {
        const { data } = await supabase.from('chat_sessions').insert([{}]).select().single();
        if (data) {
          storedSession = data.id;
          localStorage.setItem('kuro_chat_session', data.id);
        }
      }
      setSessionId(storedSession);
    };
    initSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMsg = { role: 'user', content: text, id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    if (mode === 'lead-capture') {
      await handleLeadFlow(text);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('kuro-chat', {
        body: { message: text, sessionId }
      });

      if (error) throw error;

      // Handle case where function returns 200 but contains an error message in body (graceful failure)
      if (data.error) {
         const errorMsg = {
            role: 'assistant',
            content: data.response || "I'm having trouble connecting right now. Please try again or use the 'Talk to Human' button.",
            id: (Date.now() + 1).toString()
         };
         setMessages(prev => [...prev, errorMsg]);
      } else {
          const botMsg = { 
            role: 'assistant', 
            content: data.response, 
            sources: data.sources, 
            id: (Date.now() + 1).toString() 
          };
          setMessages(prev => [...prev, botMsg]);
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again or use the 'Talk to Human' button.", id: 'err' }]);
    } finally {
      setLoading(false);
    }
  };

  const startHandoff = () => {
    setMode('lead-capture');
    setLeadStep(0);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: "I'll connect you with a human agent. First, what is your full name?", 
      id: 'lead-1' 
    }]);
  };

  const handleLeadFlow = async (text) => {
    const steps = [
      { field: 'name', nextPrompt: "Great! What is your WhatsApp number (with country code)?" },
      { field: 'whatsapp', nextPrompt: "Thanks. What is your email address?" },
      { field: 'email', nextPrompt: "Almost done. What is your main study goal? (e.g. Study Medicine in China)" },
      { field: 'goal', nextPrompt: "Thank you! An agent will contact you shortly." }
    ];

    const currentStepObj = steps[leadStep];
    const newLeadData = { ...leadData, [currentStepObj.field]: text };
    setLeadData(newLeadData);

    if (leadStep < steps.length - 1) {
      setLeadStep(prev => prev + 1);
      setMessages(prev => [...prev, { role: 'assistant', content: currentStepObj.nextPrompt, id: `lead-${leadStep + 2}` }]);
    } else {
      // Final step
      await supabase.from('leads').insert([{
        ...newLeadData,
        chat_session_id: sessionId,
        intake_form: 'Chat Widget Handoff'
      }]);
      setMessages(prev => [...prev, { role: 'assistant', content: "Your request has been received! Our team will reach out via WhatsApp soon.", id: 'lead-done' }]);
      setMode('chat');
    }
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-red-600 hover:bg-red-700 text-white z-50 flex items-center justify-center transition-transform hover:scale-110"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out",
      isMinimized ? "w-72 h-14" : "w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh]"
    )}>
      <Card className="h-full flex flex-col shadow-2xl border-slate-700 bg-slate-900 overflow-hidden">
        {/* Header */}
        <div 
          className="bg-red-700 p-4 flex items-center justify-between cursor-pointer"
          onClick={() => !isMinimized && setIsMinimized(true)}
        >
          <div className="flex items-center gap-2 text-white">
            <Bot className="h-5 w-5" />
            <div className="font-bold">Kuro Assistant</div>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            {isMinimized ? (
               <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }} className="h-6 w-6 p-0 hover:bg-red-600"><MaximizeIcon className="h-4 w-4" /></Button>
            ) : (
               <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }} className="h-6 w-6 p-0 hover:bg-red-600"><Minimize2 className="h-4 w-4" /></Button>
            )}
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="h-6 w-6 p-0 hover:bg-red-600">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content (Hidden if minimized) */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
               {messages.map((msg) => (
                 <div key={msg.id} className={cn("flex gap-2", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                   <div className={cn(
                     "w-8 h-8 rounded-full flex items-center justify-center shrink-0", 
                     msg.role === 'user' ? "bg-blue-600" : "bg-red-600"
                   )}>
                     {msg.role === 'user' ? <User className="h-4 w-4 text-white"/> : <Bot className="h-4 w-4 text-white"/>}
                   </div>
                   <div className={cn(
                     "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                     msg.role === 'user' ? "bg-blue-600 text-white rounded-tr-none" : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
                   )}>
                     {msg.content}
                     {msg.sources && msg.sources.length > 0 && (
                       <div className="mt-2 pt-2 border-t border-slate-700/50">
                         <p className="text-xs text-slate-500 font-semibold mb-1">Sources:</p>
                         <div className="flex flex-wrap gap-1">
                           {msg.sources.map((s, i) => (
                             <span key={i} className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">{s}</span>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
               ))}
               {loading && (
                 <div className="flex gap-2">
                   <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                     <Bot className="h-4 w-4 text-white"/>
                   </div>
                   <div className="bg-slate-800 rounded-2xl rounded-tl-none px-4 py-2 border border-slate-700 flex items-center">
                     <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                   </div>
                 </div>
               )}
               <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {mode === 'chat' && messages.length < 3 && (
              <div className="p-2 bg-slate-900 border-t border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <div className="flex gap-2">
                  {QUICK_ACTIONS.map(action => (
                    <Button 
                      key={action} 
                      variant="outline" 
                      size="sm" 
                      className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
                      onClick={() => handleSend(action)}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === 'chat' ? "Ask about visa, universities..." : "Type your answer..."}
                  className="bg-slate-950 border-slate-700 focus-visible:ring-red-500"
                  disabled={loading}
                />
                <Button type="submit" size="icon" className="bg-red-600 hover:bg-red-700" disabled={loading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              
              {mode === 'chat' && (
                <div className="flex justify-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-slate-500 hover:text-white flex items-center gap-1 h-auto py-1"
                    onClick={startHandoff}
                  >
                    <Phone className="h-3 w-3" /> Talk to a Human Agent
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

// Helper for maximize icon since it wasn't imported
const MaximizeIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);

export default KuroChatWidget;