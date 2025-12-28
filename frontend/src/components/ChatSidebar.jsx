import React, { useState, useRef, useEffect } from 'react';
import { pathwayAPI } from '../services/apiClient';

const ChatSidebar = ({ pathwayId, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    // Debounce scroll to avoid excessive reflows
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const data = await pathwayAPI.chatWithPathway(pathwayId, userMessage, messages);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: "I encountered a synchronization error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-white/95 backdrop-blur-xl shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.05)] z-50 flex flex-col border-l border-slate-200/60 animate-in slide-in-from-right duration-500 ease-out">
      
      {/* Editorial Header */}
      <header className="h-24 px-8 flex items-center justify-between border-b border-slate-100 bg-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Contextual Intelligence</p>
          </div>
          <h3 className="font-black text-slate-900 text-lg">Study Assistant</h3>
        </div>
        <button 
          onClick={onClose} 
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </header>

      {/* Conversation Thread */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#F8FAFC]/50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-16 h-16 bg-white rounded-[1.5rem] shadow-sm flex items-center justify-center text-2xl border border-slate-100">
              📖
            </div>
            <div className="max-w-[240px]">
              <p className="text-sm font-black text-slate-900 mb-1">Deep Context Query</p>
              <p className="text-xs font-medium text-slate-400 leading-relaxed">
                Ask specific questions about your uploaded PDFs. I have full access to the document embeddings.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2 px-1">
              {msg.role === 'user' ? 'Scholar' : 'Assistant'}
            </p>
            <div className={`max-w-[90%] p-5 rounded-[1.8rem] text-sm leading-relaxed shadow-sm transition-all ${
              msg.role === 'user' 
                ? 'bg-slate-900 text-white rounded-tr-none' 
                : 'bg-white text-slate-700 border border-slate-200/60 rounded-tl-none'
            }`}>
              <p className="font-medium">{msg.content}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex flex-col items-start animate-in fade-in duration-300">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2 px-1">Analyzing...</p>
            <div className="bg-white border border-slate-200/60 p-5 rounded-[1.8rem] rounded-tl-none shadow-sm flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-blue-600/40 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-600/60 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-blue-600/80 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Tactile Input Area */}
      <footer className="p-6 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search within pathway context..."
            className="w-full pl-6 pr-24 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="absolute right-3 px-5 py-2.5 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 disabled:bg-slate-100 disabled:text-slate-300 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            {isTyping ? '...' : 'Send'}
          </button>
        </form>
        <p className="text-[9px] text-center mt-4 font-bold text-slate-300 uppercase tracking-tighter">
          RAG-Augmented Response Engine
        </p>
      </footer>
    </div>
  );
};

export default ChatSidebar;