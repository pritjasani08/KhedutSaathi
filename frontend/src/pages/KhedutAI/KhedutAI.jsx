import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Bot, User, Send, Mic, MicOff, Sparkles, Clock } from 'lucide-react';
import { useChat } from '../../context/ChatContext';



export default function KhedutAI() {
  const { t } = useTranslation();
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

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        // --- Silence Detection ---
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
        const SILENCE_THRESHOLD = 30; // Increased volume threshold to ignore background noise
        const SILENCE_DURATION = 1500; // 1.5 seconds of silence stops recording
        const NO_SPEECH_TIMEOUT = 5000; // 5 seconds of total silence stops recording
        
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
        // -------------------------

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          // Cleanup silence detection
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

          // Stop all audio tracks
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

  const suggestedQuestions = [
    "What crop should I grow this season?",
    "Show Gujarat mandi prices",
    "How to treat cotton leaf disease?",
    "Best fertilizer for wheat?",
    "Weather forecast for my village"
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ml', name: 'മലയാളം (Malayalam)' },
    { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
    { code: 'as', name: 'অসমীয়া (Assamese)' },
    { code: 'ur', name: 'اردو (Urdu)' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-8 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-green-400/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="text-center max-w-2xl mx-auto mb-4 relative z-10 flex flex-col items-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center p-2 bg-primary/10 rounded-xl"
          >
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-heading tracking-tight">
            Khedut <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-500">AI</span>
          </h1>
        </div>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto px-4">
          Your highly intelligent, voice-enabled agricultural assistant. Ask anything about your farm, crops, or market prices.
        </p>
      </div>

      <div className="flex-1 max-w-[1600px] w-[96%] mx-auto px-2 sm:px-4 lg:px-6 flex gap-6 h-[calc(100vh-160px)] min-h-[500px] relative z-10">
        
        {/* Left Sidebar - Chat History */}
        <div className="hidden lg:flex flex-col w-80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden h-full">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
            <h3 className="font-display font-bold text-heading flex items-center gap-2.5 text-lg">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              Recent Chats
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
            <button 
              onClick={startNewChat}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                !currentSessionId 
                  ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-md shadow-primary/20 scale-[1.02]' 
                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-[1.02]'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!currentSessionId ? 'bg-white/20' : 'bg-white dark:bg-slate-700 shadow-sm'}`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="truncate">New Chat Session</span>
            </button>
            
            {sessions.map(session => (
              <button 
                key={session.id}
                onClick={() => loadSession(session.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  currentSessionId === session.id 
                    ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-md shadow-primary/20 scale-[1.02]' 
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-[1.02]'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${currentSessionId === session.id ? 'bg-white/20' : 'bg-white dark:bg-slate-700 shadow-sm'}`}>
                  <Clock className="w-4 h-4" />
                </div>
                <span className="truncate text-left">{session.title || 'Chat Session'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden relative h-full">
          
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] dark:opacity-[0.03]">
            <Bot className="w-[400px] h-[400px]" />
          </div>

          {/* Chat Window */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 relative z-10 custom-scrollbar">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`flex gap-4 max-w-[85%] ${msg.type === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl shrink-0 flex items-center justify-center shadow-sm ${
                  msg.type === 'bot' 
                    ? 'bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/50 dark:to-primary-800/30 text-primary border border-primary/20' 
                    : 'bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300/50 dark:border-slate-500/50'
                }`}>
                  {msg.type === 'bot' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
                <div
                  className={`px-5 py-4 sm:px-6 sm:py-5 rounded-3xl text-[15px] sm:text-base leading-relaxed shadow-sm ${
                    msg.type === 'bot'
                      ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm border border-slate-100 dark:border-slate-700/50'
                      : 'bg-gradient-to-br from-primary to-primary-dark text-white rounded-tr-sm shadow-primary/20'
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <div className="flex gap-4 max-w-[85%]">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/50 dark:to-primary-800/30 text-primary border border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="bg-white dark:bg-slate-800 px-6 py-5 rounded-3xl rounded-tl-sm shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Khedut AI is thinking</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 2 && (
            <div className="px-6 sm:px-8 pb-4 relative z-10">
              <div className="flex flex-wrap gap-2.5">
                {suggestedQuestions.map((q, idx) => (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx}
                    onClick={() => sendMessage(q)}
                    className="px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md hover:bg-primary-50 dark:hover:bg-primary-900/30 border border-slate-200/50 dark:border-slate-700/50 hover:border-primary/30 text-slate-600 dark:text-slate-300 hover:text-primary rounded-xl text-[13px] sm:text-sm font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 sm:p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-t border-slate-100/50 dark:border-slate-800/50 shrink-0 relative z-10">
            <div className="flex items-end gap-3 max-w-5xl mx-auto">
              <button 
                onClick={toggleRecording}
                className={`shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-300 shadow-sm ${
                  isRecording
                    ? 'bg-red-500 text-white shadow-red-500/30 animate-pulse scale-105'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md'
                }`}
              >
                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              
              <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all flex shadow-sm items-center">
                <select
                  value={chatLanguage}
                  onChange={(e) => setChatLanguage(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-700 border-r border-slate-200/50 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold focus:outline-none pl-3 pr-2 py-4 h-full rounded-l-2xl cursor-pointer shrink-0"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Khedut AI anything..."
                  className="w-full bg-transparent border-0 outline-none px-5 py-4 text-[15px] sm:text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-none max-h-32 min-h-[56px] custom-scrollbar"
                  rows="1"
                />
              </div>
              
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="shrink-0 w-14 h-14 flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 disabled:hover:shadow-none"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </div>
            <p className="text-center text-[11px] sm:text-xs text-slate-400 mt-4 font-medium">
              Khedut AI can make mistakes. Consider verifying critical agricultural information.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
