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

  useEffect(() => {
    localStorage.setItem('chatLanguage', chatLanguage);
  }, [chatLanguage]);

  useEffect(() => {
    if (user && user.user_type === 'farmer') {
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.profile) setProfileData(data.profile);
        })
        .catch(err => console.error("Error fetching profile for AI context", err));
      }
    }
  }, [user]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', text, time: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      let queryWithContext = text;
      
      const langNames = { en: 'English', hi: 'Hindi', gu: 'Gujarati' };
      const langInstruction = `\n\n[Instruction: Please respond exclusively in ${langNames[chatLanguage] || 'English'}.]`;

      if (profileData && profileData.primary_crop) {
        const contextStr = `\n\n[Context: I am a farmer in ${profileData.district || ''}, ${profileData.state || 'India'}. I have ${profileData.farm_size || 'a'} acre farm with ${profileData.soil_type || 'unknown'} soil. My primary crop is ${profileData.primary_crop}. Please keep this in mind when answering.]`;
        queryWithContext = text + contextStr + langInstruction;
      } else {
        queryWithContext = text + langInstruction;
      }

      const responseText = await askRag(queryWithContext);
      const botMessage = { id: Date.now() + 1, type: 'bot', text: responseText, time: new Date() };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error communicating with Khedut AI", error);
      const errorMessage = { id: Date.now() + 1, type: 'bot', text: "Sorry, I am unable to answer right now. Please try again.", time: new Date() };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, setMessages, isTyping, sendMessage, chatLanguage, setChatLanguage }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
