import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Bot, User, Send, Mic, Sparkles, Clock } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export default function KhedutAI() {
  const { t } = useTranslation();
  const { messages, isTyping, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "What crop should I grow this season?",
    "Show Gujarat mandi prices",
    "How to treat cotton leaf disease?",
    "Best fertilizer for wheat?",
    "Weather forecast for my village"
  ];

  return (
    <div className="pt-20 lg:pt-24 min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex gap-6 h-[calc(100vh-6rem)]">
        
        {/* Left Sidebar - Chat History (Mock) */}
        <div className="hidden lg:flex flex-col w-64 bg-surface rounded-2xl border border-subtle shadow-sm overflow-hidden">
          <div className="p-4 border-b border-subtle bg-surface-muted">
            <h3 className="font-semibold text-heading flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Recent Chats
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <button className="w-full text-left px-3 py-2 rounded-xl bg-primary-50 text-primary text-sm font-medium">
              Current Session
            </button>
            <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-muted text-slate-600 dark:text-slate-400 text-sm font-medium transition-colors">
              Cotton Disease Diagnosis
            </button>
            <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-muted text-slate-600 dark:text-slate-400 text-sm font-medium transition-colors">
              Wheat Fertilizer Schedule
            </button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-surface rounded-2xl border border-subtle shadow-sm overflow-hidden relative">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-subtle bg-surface-muted flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-sm">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-heading">Khedut AI Assistant</h1>
                <p className="text-xs text-body flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Your Smart Farming Companion
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-primary font-medium bg-primary-50 px-3 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4" />
              Powered by AI
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[85%] ${msg.type === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0 flex items-center justify-center ${
                  msg.type === 'bot' ? 'bg-primary-100 text-primary' : 'bg-slate-200 text-slate-600'
                }`}>
                  {msg.type === 'bot' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div
                  className={`px-4 py-3 sm:px-5 sm:py-4 rounded-2xl text-sm sm:text-base leading-relaxed shadow-sm ${
                    msg.type === 'bot'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                      : 'bg-primary text-white rounded-tr-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-100 text-primary flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Khedut AI is typing...</span>
                  <div className="flex items-center gap-1.5 ml-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 2 && (
            <div className="px-4 sm:px-6 pb-2">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(q)}
                    className="shrink-0 px-4 py-2 bg-surface-muted hover:bg-primary-50 border border-subtle hover:border-primary-200 text-slate-600 dark:text-slate-300 hover:text-primary rounded-full text-xs sm:text-sm transition-colors whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 sm:p-6 border-t border-subtle bg-surface">
            <div className="flex items-end gap-2 sm:gap-3">
              <button className="shrink-0 p-3 rounded-xl bg-surface-muted hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <div className="flex-1 bg-surface-muted rounded-xl border border-subtle focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Khedut AI anything..."
                  className="w-full bg-transparent border-0 outline-none px-4 py-3 text-sm sm:text-base text-body resize-none max-h-32 min-h-[50px]"
                  rows="1"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="shrink-0 p-3 bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-center text-[10px] sm:text-xs text-slate-400 mt-3">
              Khedut AI can make mistakes. Consider verifying critical agricultural information.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
