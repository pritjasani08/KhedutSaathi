import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, Send, Mic, MicOff,
  Stethoscope, TrendingUp, Sprout, Droplets, Bot, User
} from 'lucide-react';

export default function ChatbotWidget() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: t('chatbot.greeting'), time: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { key: 'diagnose', icon: Stethoscope, label: t('chatbot.quickActions.diagnose') },
    { key: 'prices', icon: TrendingUp, label: t('chatbot.quickActions.prices') },
    { key: 'crops', icon: Sprout, label: t('chatbot.quickActions.crops') },
    { key: 'irrigation', icon: Droplets, label: t('chatbot.quickActions.irrigation') },
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input,
      time: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: "Thank you for your question! I'm analyzing your query and will provide you with the best farming advice. This is a demo response — the full AI backend will provide real-time intelligent answers.",
        time: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action) => {
    const actionMessages = {
      diagnose: "I'd like to diagnose a crop disease. Can you help me?",
      prices: "What are the current market prices for wheat in Gujarat?",
      crops: "What crops should I plant this season for maximum yield?",
      irrigation: "When should I irrigate my field based on current weather?",
    };
    setInput(actionMessages[action] || '');
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setInput("Voice input detected: What is the best time to plant rice?");
      }, 2000);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-primary to-primary-light text-white rounded-full shadow-green flex items-center justify-center group"
          >
            <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] max-h-[80vh] bg-surface rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-light px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface/20 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white text-sm">
                    {t('chatbot.title')}
                  </h3>
                  <span className="text-white/70 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                    Online
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={i18n.language}
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                  className="bg-surface/20 text-white text-xs rounded-lg px-2 py-1.5 border-0 outline-none cursor-pointer"
                >
                  <option value="en" className="text-body">English</option>
                  <option value="hi" className="text-body">हिंदी</option>
                  <option value="gu" className="text-body">ગુજરાતી</option>
                </select>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg bg-surface/20 hover:bg-surface/30 flex items-center justify-center transition-colors duration-300"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-3 border-b border-slate-100 flex gap-2 overflow-x-auto shrink-0">
              {quickActions.map((action) => (
                <button
                  key={action.key}
                  onClick={() => handleQuickAction(action.key)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 text-primary text-xs font-medium hover:bg-primary-100 transition-colors duration-300"
                >
                  <action.icon className="w-3.5 h-3.5" />
                  {action.label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                    msg.type === 'bot' ? 'bg-primary-100 text-primary' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {msg.type === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.type === 'bot'
                        ? 'bg-slate-100 text-slate-700 rounded-tl-md'
                        : 'bg-primary text-white rounded-tr-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleRecording}
                  className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('chatbot.placeholder')}
                  className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="shrink-0 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
