import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Bot, User, Send, Mic, MicOff, Sparkles, Clock, MapPin, Paperclip, ChevronRight, Droplets, Leaf, Thermometer, FileText, PlusCircle, UserCircle2, Layers, Tractor, Activity, CheckCircle2 } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useDashboardOverview } from '../../features/dashboard/hooks/useDashboardQueries';
import { ALL_LANGUAGES } from '../../constants/languages';

export default function KhedutAI() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { data: overview } = useDashboardOverview();
  const profile = overview?.profile || {};

  const { messages, isTyping, sendMessage, sessions, currentSessionId, startNewChat, loadSession, chatLanguage, setChatLanguage } = useChat();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const audioContextRef = useRef(null);

  const isFirstRender = useRef(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (messages.length > 0 || isTyping) {
      scrollToBottom();
    }
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

  // --- Voice Logic (Preserved) ---
  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 512;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        let isSpeaking = false;
        let silenceStart = Date.now();
        const SILENCE_THRESHOLD = 30; 
        const SILENCE_DURATION = 1500; 
        const NO_SPEECH_TIMEOUT = 5000; 
        
        const checkSilence = () => {
          if (mediaRecorderRef.current?.state === 'inactive') return;
          
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
          const averageVolume = sum / bufferLength;
          
          if (averageVolume > SILENCE_THRESHOLD) {
            isSpeaking = true;
            silenceStart = Date.now();
          } else {
            const timeQuiet = Date.now() - silenceStart;
            if ((isSpeaking && timeQuiet > SILENCE_DURATION) || (!isSpeaking && timeQuiet > NO_SPEECH_TIMEOUT)) {
              if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
                setIsRecording(false);
              }
              return;
            }
          }
          silenceTimerRef.current = requestAnimationFrame(checkSilence);
        };
        setTimeout(() => checkSilence(), 500);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          if (silenceTimerRef.current) cancelAnimationFrame(silenceTimerRef.current);
          if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
             audioContextRef.current.close().catch(console.error);
          }

          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          try {
            setInput('Transcribing voice...');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/transcribe`, {
              method: 'POST',
              body: formData,
            });
            const data = await response.json();
            if (response.ok && data.text) {
              setInput(data.text);
            } else {
              setInput('');
              alert('Error transcribing audio: ' + (data.message || 'Unknown error'));
            }
          } catch (err) {
            setInput('');
            alert('Failed to connect to transcription service.');
          }

          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Microphone access denied:", err);
        alert("Please allow microphone permissions to use voice input.");
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }
  };

  const languages = ALL_LANGUAGES;

  const aiCommands = [
    { label: "Crop Advice", query: "Give me actionable advice for my current crop.", icon: Leaf, color: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
    { label: "Disease Detection", query: "How do I identify and treat common diseases for my crop?", icon: Activity, color: "text-red-500", bg: "bg-red-100 dark:bg-red-500/20" },
    { label: "Market Analysis", query: "What is the current market trend for my primary crop?", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20" },
    { label: "Weather Analysis", query: "Analyze my local weather and recommend actions.", icon: Thermometer, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
    { label: "Yield Prediction", query: "How can I maximize my yield this season?", icon: Layers, color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-500/20" },
    { label: "Government Schemes", query: "Which government schemes am I currently eligible for?", icon: FileText, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20" },
    { label: "Fertilizer Recs", query: "What fertilizer schedule should I follow based on my soil type?", icon: Tractor, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-500/20" },
    { label: "Irrigation Plan", query: "Suggest an optimal irrigation schedule for my farm.", icon: Droplets, color: "text-cyan-500", bg: "bg-cyan-100 dark:bg-cyan-500/20" }
  ];

  // Simple Markdown-like formatter for AI responses
  const renderMessageContent = (text) => {
    if (!text) return null;
    // Basic bold syntax **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-heading">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-4 h-screen overflow-hidden selection:bg-primary/30">
      
      {/* Workspace Header - Reimagined as Page Header */}
      <header className="shrink-0 bg-transparent px-4 sm:px-10 lg:px-20 py-4 flex items-end justify-between z-20 relative">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md shadow-primary/20 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-[28px] font-display font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
              Khedut AI Workspace
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-[58px] hidden sm:block">
            Your intelligent farming assistant for localized insights and operations.
          </p>
        </div>
        
        <div className="hidden lg:flex items-center gap-5 pb-1 opacity-80">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span> Connected
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> AI Ready
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            <Mic className="w-3.5 h-3.5" /> Voice Enabled
          </span>
        </div>
      </header>

      {/* Main Workspace Area (2 Columns) */}
      <div className="flex-1 flex overflow-hidden w-full max-w-[1920px] mx-auto notranslate">
        
        {/* LEFT SIDEBAR (20-25%) */}
        <aside className="w-[320px] shrink-0 border-r border-subtle bg-white/50 dark:bg-slate-900/30 backdrop-blur-md flex flex-col h-full overflow-y-auto custom-scrollbar">
          
          <div className="p-4 border-b border-subtle">
            <button 
              onClick={startNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all font-semibold text-sm"
            >
              <PlusCircle className="w-5 h-5" /> New Chat
            </button>
          </div>

          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Recent Sessions
            </h4>
            
            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
              {sessions.map(session => (
                <button 
                  key={session.id}
                  onClick={() => loadSession(session.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left group ${
                    currentSessionId === session.id 
                      ? 'bg-primary/10 text-primary dark:bg-primary-900/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Clock className={`w-4 h-4 shrink-0 ${currentSessionId === session.id ? 'text-primary' : 'text-slate-400 group-hover:text-slate-500'}`} />
                  <span className="truncate">{session.title || 'Conversation'}</span>
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* CENTER WORKSPACE (75-80%) */}
        <main className="flex-1 flex flex-col min-w-0 bg-white/40 dark:bg-slate-900/10 h-full relative">
          
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.015] dark:opacity-[0.02]">
            <Sparkles className="w-[500px] h-[500px]" />
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-10 lg:px-20 py-8 relative z-10 custom-scrollbar flex flex-col">
            
            {/* Empty State: AI Command Center */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl mx-auto py-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/50 dark:to-primary-800/30 text-primary border border-primary/20 flex items-center justify-center shadow-sm mb-6">
                  <Bot className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-display font-bold text-heading mb-3">How can I assist your farm today?</h2>
                <p className="text-slate-500 text-lg mb-12 text-center max-w-2xl">
                  Select a workflow below, use voice input, or type a custom command. I already have your farm context loaded.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  {aiCommands.map((cmd, idx) => {
                    const Icon = cmd.icon;
                    return (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => sendMessage(cmd.query)}
                      className="flex flex-col p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/40 dark:hover:border-primary/40 transition-all text-left group"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${cmd.bg} ${cmd.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-heading text-[15px] mb-1 group-hover:text-primary transition-colors">{cmd.label}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{cmd.query}</p>
                    </motion.button>
                  )})}
                </div>
              </div>
            )}

            {/* Conversation Flow */}
            <div className="w-full max-w-4xl mx-auto space-y-10 flex-1">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-5 w-full ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-sm mt-1 ${
                    msg.type === 'bot' 
                      ? 'bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/50 dark:to-primary-800/30 text-primary border border-primary/20' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                  }`}>
                    {msg.type === 'bot' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className={`flex flex-col max-w-[85%] ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                      {msg.type === 'bot' ? 'Khedut AI' : 'You'}
                    </div>
                    <div
                      className={`px-6 py-4 rounded-3xl text-base leading-loose shadow-sm whitespace-pre-wrap ${
                        msg.type === 'bot'
                          ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm border border-slate-200 dark:border-slate-700'
                          : 'bg-slate-800 dark:bg-slate-200 text-slate-100 dark:text-slate-900 rounded-tr-sm'
                      }`}
                    >
                      {renderMessageContent(msg.text)}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex gap-5 w-full">
                  <div className="w-10 h-10 rounded-xl shrink-0 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/50 dark:to-primary-800/30 text-primary border border-primary/20 flex items-center justify-center shadow-sm mt-1">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col max-w-[85%] items-start">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Khedut AI</div>
                    <div className="bg-white dark:bg-slate-800 px-6 py-5 rounded-3xl rounded-tl-sm shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-500">Analyzing farm context</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>

          </div>

          {/* Smart Command Dock (Full Width of Workspace) */}
          <div className="px-4 sm:px-10 lg:px-20 pb-6 pt-2 bg-gradient-to-t from-slate-50 via-slate-50 dark:from-slate-950 dark:via-slate-950 to-transparent relative z-10 shrink-0">
            <div className="w-full max-w-5xl mx-auto">
              
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-black/20 flex items-end p-2 transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                
                {/* Tools Left */}
                <div className="flex items-center gap-1 px-2 pb-1 shrink-0">
                  <button 
                    onClick={toggleRecording}
                    className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
                      isRecording
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-all">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                  <select
                    value={chatLanguage}
                    onChange={(e) => setChatLanguage(e.target.value)}
                    className="bg-transparent border-none text-slate-600 dark:text-slate-300 text-sm font-bold focus:outline-none focus:ring-0 cursor-pointer h-11 px-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all appearance-none"
                    style={{ backgroundImage: 'none' }}
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.label}</option>
                    ))}
                  </select>
                </div>

                {/* Input Field */}
                <div className="flex-1 flex flex-col justify-center min-h-[52px]">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Khedut AI..."
                    className="w-full bg-transparent border-0 outline-none px-3 py-3.5 text-[15px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none max-h-40 min-h-[52px] custom-scrollbar font-medium"
                    rows="1"
                  />
                </div>
                
                {/* Tools Right */}
                <div className="px-2 pb-1 shrink-0">
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="w-11 h-11 flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:bg-primary dark:hover:bg-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-6 mt-4">
                <p className="text-[11px] sm:text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Context Synced
                </p>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                  Khedut AI can make mistakes. Verify critical actions.
                </p>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
