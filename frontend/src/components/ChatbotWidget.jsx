import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, X, Send, Mic, MicOff,
  Stethoscope, TrendingUp, Sprout, Droplets, Bot, User, ChevronDown
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { ALL_LANGUAGES } from '../constants/languages';

export default function ChatbotWidget() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isTyping, sendMessage, chatLanguage, setChatLanguage } = useChat();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const audioContextRef = useRef(null);

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = ALL_LANGUAGES;

  const quickActions = [
    { key: 'diagnose', icon: Stethoscope, label: t('chatbot.quickActions.diagnose', { lng: chatLanguage }) },
    { key: 'prices', icon: TrendingUp, label: t('chatbot.quickActions.prices', { lng: chatLanguage }) },
    { key: 'crops', icon: Sprout, label: t('chatbot.quickActions.crops', { lng: chatLanguage }) },
    { key: 'irrigation', icon: Droplets, label: t('chatbot.quickActions.irrigation', { lng: chatLanguage }) },
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
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
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] max-h-[80vh] bg-surface rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden notranslate"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-light px-5 py-4 flex items-center justify-between shrink-0 relative z-[9999] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface/20 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white text-sm">
                    {t('chatbot.title', { lng: chatLanguage })}
                  </h3>
                  <span className="text-white/70 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                    Online
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative notranslate" ref={langDropdownRef}>
                  <button
                    onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                    className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg px-2.5 py-1.5 outline-none cursor-pointer transition-colors duration-200"
                  >
                    {languages.find(l => l.code === chatLanguage)?.label || 'English'}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {langDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-2 w-48 max-h-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-y-auto z-[9999]"
                      >
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setChatLanguage(lang.code);
                              setLangDropdownOpen(false);
                            }}
                            className={`block w-full text-left px-4 py-3 text-sm font-bold transition-colors duration-200 ${
                              chatLanguage === lang.code
                                ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-dark dark:text-primary-light'
                                : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors duration-300"
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
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
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
                  placeholder={t('chatbot.placeholder', { lng: chatLanguage })}
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
