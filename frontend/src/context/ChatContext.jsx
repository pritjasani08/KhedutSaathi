import React, { createContext, useContext, useState } from 'react';
import { askRag } from '../services/ragApi';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hello! I am Khedut AI, your smart farming companion. How can I assist you today?', time: new Date() },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', text, time: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const responseText = await askRag(text);
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
    <ChatContext.Provider value={{ messages, setMessages, isTyping, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
