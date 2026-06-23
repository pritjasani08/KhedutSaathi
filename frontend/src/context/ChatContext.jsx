import React, { createContext, useContext, useState, useEffect } from 'react';
import { askRag } from '../services/ragApi';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hello! I am Khedut AI, your smart farming companion. How can I assist you today?', time: new Date() },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [chatLanguage, setChatLanguage] = useState(() => localStorage.getItem('chatLanguage') || 'en');
  
  // Chat History State
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  useEffect(() => {
    localStorage.setItem('chatLanguage', chatLanguage);
  }, [chatLanguage]);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (token) {
        // Fetch Profile
        if (user.user_type === 'farmer') {
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          .then(res => res.json())
          .then(data => {
            if (data.profile) setProfileData(data.profile);
          })
          .catch(err => console.error("Error fetching profile for AI context", err));
        }

        // Fetch Chat Sessions
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat-history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.sessions) {
            setSessions(data.sessions);
            if (data.sessions.length > 0) {
              setCurrentSessionId(data.sessions[0].id);
              setMessages(data.sessions[0].messages);
            }
          }
        })
        .catch(err => console.error("Error fetching chat sessions", err));
      }
    } else {
      // Clear on logout
      setSessions([]);
      setCurrentSessionId(null);
      setMessages([{ id: 1, type: 'bot', text: 'Hello! I am Khedut AI, your smart farming companion. How can I assist you today?', time: new Date() }]);
    }
  }, [user]);

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([{ id: Date.now(), type: 'bot', text: 'Hello! I am Khedut AI, your smart farming companion. How can I assist you today?', time: new Date() }]);
  };

  const loadSession = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(session.id);
      setMessages(session.messages);
    }
  };

  const saveSessionToDb = async (newMessages, sessionId) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    let title = "New Chat";
    const firstUserMsg = newMessages.find(m => m.type === 'user');
    if (firstUserMsg) {
      title = firstUserMsg.text.substring(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '');
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: sessionId, title, messages: newMessages })
      });
      const data = await res.json();
      return data.session;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', text, time: new Date() };
    const messagesWithUser = [...messages, userMessage];
    setMessages(messagesWithUser);
    setIsTyping(true);

    try {
      let queryWithContext = text;
      
      const langNames = {
        en: 'English', hi: 'Hindi', gu: 'Gujarati', mr: 'Marathi', pa: 'Punjabi',
        bn: 'Bengali', ta: 'Tamil', te: 'Telugu', kn: 'Kannada', ml: 'Malayalam',
        or: 'Odia', as: 'Assamese', ur: 'Urdu', sa: 'Sanskrit', ks: 'Kashmiri',
        gom: 'Konkani', mai: 'Maithili', mni: 'Manipuri', ne: 'Nepali', doi: 'Dogri',
        sat: 'Santali', sd: 'Sindhi', brx: 'Bodo'
      };
      const langInstruction = `\n\n[Instruction: Please respond exclusively in ${langNames[chatLanguage] || 'English'}.]`;

      if (profileData && profileData.primary_crop) {
        const contextStr = `\n\n[Context: I am a farmer in ${profileData.district || ''}, ${profileData.state || 'India'}. I have ${profileData.farm_size || 'a'} acre farm with ${profileData.soil_type || 'unknown'} soil. My primary crop is ${profileData.primary_crop}. Please keep this in mind when answering.]`;
        queryWithContext = text + contextStr + langInstruction;
      } else {
        queryWithContext = text + langInstruction;
      }

      const responseText = await askRag(queryWithContext);
      const botMessage = { id: Date.now() + 1, type: 'bot', text: responseText, time: new Date() };
      
      const finalMessages = [...messagesWithUser, botMessage];
      setMessages(finalMessages);
      
      // Save to database
      if (user) {
        const savedSession = await saveSessionToDb(finalMessages, currentSessionId);
        if (savedSession) {
          if (!currentSessionId) {
             setCurrentSessionId(savedSession.id);
             setSessions(prev => [savedSession, ...prev]);
          } else {
             setSessions(prev => prev.map(s => s.id === savedSession.id ? savedSession : s));
          }
        }
      }
    } catch (error) {
      console.error("Error communicating with Khedut AI", error);
      const errorMessage = { id: Date.now() + 1, type: 'bot', text: "Sorry, I am unable to answer right now. Please try again.", time: new Date() };
      setMessages([...messagesWithUser, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ChatContext.Provider value={{ 
      messages, setMessages, isTyping, sendMessage, chatLanguage, setChatLanguage,
      sessions, currentSessionId, startNewChat, loadSession 
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
