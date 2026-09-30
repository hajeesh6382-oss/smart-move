import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ArrowRight,
  MapPin,
  Clock,
  Coins,
  Zap,
  CornerDownLeft,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  actionUrl?: string;
  actionLabel?: string;
}

export const AIMobilityDrawer: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am SMARTMOVE AI, your intelligent mobility copilot. How can I optimize your urban journey today?',
      time: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const suggestedQuestions = [
    'Find the fastest route.',
    'Where can I park?',
    'Is traffic heavy?',
    'Find an EV charger.',
    'How much road pricing will I pay?',
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    // Realistic AI Response Generator
    setTimeout(() => {
      let replyText = '';
      let actionUrl: string | undefined = undefined;
      let actionLabel: string | undefined = undefined;

      const lower = query.toLowerCase();

      if (lower.includes('fastest route') || lower.includes('route')) {
        replyText =
          '🚀 The fastest path right now is the Outer Expressway corridor: 18 mins (7.2 km) with dynamic green wave clearance. You will save 6 minutes compared to arterial roads.';
        actionUrl = '/app/routes';
        actionLabel = 'Open Route Planner';
      } else if (lower.includes('park') || lower.includes('parking')) {
        replyText =
          '🅿️ Tech Park Alpha Multi-Level has 48 vacant slots (85% probability of instant entry). Civic Mall Parking has 14 slots.';
        actionUrl = '/app/parking';
        actionLabel = 'View Smart Parking Hub';
      } else if (lower.includes('traffic')) {
        replyText =
          '🟢 Overall arterial flow is currently Low (average speed 44 km/h). Minor slowdowns near Sector 4 due to signal re-calibration.';
        actionUrl = '/app/map';
        actionLabel = 'Inspect Live Traffic GIS';
      } else if (lower.includes('ev') || lower.includes('charger')) {
        replyText =
          '⚡ Supercharger Station Beta is 1.4 km away with 6 high-speed DC fast bays available (150kW). Zero waiting queue right now.';
        actionUrl = '/app/map';
        actionLabel = 'Navigate to EV Charger';
      } else if (lower.includes('road pricing') || lower.includes('pay') || lower.includes('price')) {
        replyText =
          '💰 Current CBD Dynamic ERP toll is ₹12 (Off-peak). Next scheduled adjustment in 18 minutes. Electric vehicles receive an automatic 25% green rebate!';
        actionUrl = '/app/road-pricing';
        actionLabel = 'Check Dynamic Toll Rates';
      } else {
        replyText =
          `I analyzed urban flow sensors for "${query}". The system recommends utilizing coordinated electric transit or the bypass corridor to avoid active bottlenecks.`;
        actionUrl = '/app/routes';
        actionLabel = 'Plan Journey';
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        time: 'Just now',
        actionUrl,
        actionLabel,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <>
      {/* Floating AI Button (Prompt Section 9) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative px-5 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-2xl shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-cyan-300/40"
          aria-label="Open SMARTMOVE AI Assistant"
        >
          {/* Subtle Continuous Glowing Pulse */}
          <span className="absolute -inset-1 rounded-full bg-cyan-400/40 blur-md animate-pulse pointer-events-none" />
          <Sparkles className="w-4 h-4 text-slate-950 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="tracking-wide">✦ AI</span>
        </button>
      </div>

      {/* Floating AI Assistant Drawer / Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[620px] h-[580px] z-50 rounded-3xl bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/40 shadow-2xl shadow-cyan-950/90 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Panel Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800/90 bg-gradient-to-r from-cyan-950/60 via-slate-900/60 to-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-md">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black font-display text-white tracking-tight flex items-center gap-1.5">
                  SMARTMOVE AI
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </h3>
                <p className="text-[11px] text-cyan-300 font-medium">
                  Your intelligent mobility assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    🤖
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold shadow-md'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* AI Deep Action Button */}
                  {msg.actionUrl && (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate(msg.actionUrl!);
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      <span>{msg.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Realistic Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono p-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-slate-400 ml-1">SMARTMOVE AI is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompt Chips (Prompt Section 9) */}
          <div className="p-3 bg-slate-900/80 border-t border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">
              Suggested Questions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="Ask anything about routes, EV or traffic..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-xs placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all cursor-pointer"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
