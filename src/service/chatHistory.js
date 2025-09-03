'use client';

import { v4 as uuidv4 } from 'uuid';

const CHAT_HISTORY_KEY = 'chat-history';

export const getHistory = () => {
  if (typeof window === 'undefined') {
    return [];
  }
  const history = localStorage.getItem(CHAT_HISTORY_KEY);
  return history ? JSON.parse(history) : [];
};

export const saveOrUpdateChat = (messages, chatId) => {
  if (typeof window === 'undefined' || messages.length === 0) {
    return;
  }
  const history = getHistory();

  if (chatId) {
    const chatIndex = history.findIndex((chat) => chat.id === chatId);
    if (chatIndex !== -1) {
      // Update existing chat
      const updatedChat = {
        ...history[chatIndex],
        messages,
        title: messages[0].text.substring(0, 40),
        timestamp: new Date().toISOString(),
      };
      history[chatIndex] = updatedChat;
      // Move to top
      const [chatToMove] = history.splice(chatIndex, 1);
      history.unshift(chatToMove);

      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
      return chatId;
    }
  }

  // Add new chat
  const newChat = {
    id: uuidv4(),
    title: messages[0].text.substring(0, 40),
    timestamp: new Date().toISOString(),
    messages,
  };
  const updatedHistory = [newChat, ...history];
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updatedHistory));
  return newChat.id;
};

export const deleteChat = (chatId) => {
  if (typeof window === 'undefined') {
    return;
  }
  const history = getHistory();
  const updatedHistory = history.filter((chat) => chat.id !== chatId);
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updatedHistory));
};
