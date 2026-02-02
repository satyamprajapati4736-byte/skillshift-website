
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToMentor } from '../services/geminiService';
import { Icons } from '../constants';

const MentorChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Main yahin hoon. Bas apni situation likho. Hum ek clear next step nikaalte hain.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    // If there's already an error or it's loading or input is empty, don't send
    if (!input.trim() || loading || hasError) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await sendMessageToMentor([...messages, userMessage]);
      
      // Basic check for error strings returned by service or unexpected failures
      if (!responseText || responseText.includes("Network issue") || responseText.includes("glitch in the matrix")) {
        throw new Error("API Failure");
      }

      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      setLoading(false);
    } catch (error) {
      console.error("Chat failure encountered:", error);
      setHasError(true);
      setLoading(false);
      // Show the error message ONLY ONCE as part of the state
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: 'Connection issue aa rahi hai. Thodi der baad try karo.' 
      }]);
    }
  };

  const handleRetry = () => {
    setHasError(false);
    // Note: We don't automatically resend to prevent loops.
    // The user can now type again or we could potentially offer to resend the last user message.
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto flex flex-col gap-4 p-2 scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            <div 
              className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'glass-card text-slate-200 rounded-tl-none border-pink-500/20 shadow-lg'
              } ${hasError && idx === messages.length - 1 && msg.role === 'model' ? 'border-red-500/50' : ''}`}
            >
              {msg.text.split('\n').map((line, i) => (
                <p key={i} className={line.trim() === '' ? 'h-2' : 'mb-1'}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="glass-card p-4 rounded-2xl rounded-tl-none flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce delay-100"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce delay-200"></div>
            </div>
          </div>
        )}

        {hasError && (
          <div className="flex flex-col items-center gap-3 mt-4 animate-fadeIn">
            <button 
              onClick={handleRetry}
              className="px-6 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="mt-4 flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={hasError ? "Connection issue..." : "Yahan type karo..."}
          rows={1}
          disabled={loading || hasError}
          className={`flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none max-h-32 transition-all ${
            (loading || hasError) ? 'opacity-50 cursor-not-allowed italic' : ''
          }`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim() || hasError}
          className={`p-3.5 rounded-2xl transition-all ${
            loading || !input.trim() || hasError
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white neon-glow-blue'
          }`}
        >
          <Icons.ArrowRight />
        </button>
      </div>
    </div>
  );
};

export default MentorChat;
