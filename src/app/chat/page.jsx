'use client';

import 'regenerator-runtime/runtime';
import React, { useState, useEffect, useRef } from 'react';
import ChatHeader from '../../components/ChatHeader';
import { sendMessage, startNewChat } from '../../service/gemini';
import MessageList from '../../components/MessageList';
import MessageInput from '../../components/MessageInput';
import SettingsDialog from '../../components/SettingsDialog';
import HistorySidebar from '../../components/HistorySidebar';
import { useTheme } from '../../context/ThemeContext';
import { saveOrUpdateChat, getHistory, deleteChat } from '../../service/chatHistory';
import DownloadBanner from '../../components/DownloadBanner';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const { theme } = useTheme();
  const abortControllerRef = useRef(null);
  const lastSavedMessages = useRef(null);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768; // Tailwind's md breakpoint
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  useEffect(() => {
    if (isLoading || messages.length === 0) {
      return;
    }
    if (JSON.stringify(messages) === JSON.stringify(lastSavedMessages.current)) {
      return;
    }
    handleSaveChat();
    lastSavedMessages.current = messages;
  }, [messages, isLoading]);

  const cancelOngoingRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleSaveChat = () => {
    if (messages.length > 0) {
      const savedChatId = saveOrUpdateChat(messages, activeChatId);
      if (!activeChatId) {
        setActiveChatId(savedChatId);
      }
      setHistory(getHistory());
    }
  };

  const handleNewChat = () => {
    cancelOngoingRequest();
    handleSaveChat();
    lastSavedMessages.current = [];
    setMessages([]);
    startNewChat();
    setActiveChatId(null);
  };

  const handleSend = async () => {
    if (input.trim() === '') return;

    if (messages.length === 0) {
      handleSaveChat();
    }

    cancelOngoingRequest();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const userInput = input;
    setInput('');

    try {
      const modelResponse = await sendMessage(userInput, abortControllerRef.current.signal);
      abortControllerRef.current = null;

      if (modelResponse === null) {
        // Request was cancelled
        setIsLoading(false);
        return;
      }

      const modelMessage = {
        id: newMessages.length + 1,
        text: modelResponse,
        sender: 'model',
      };

      setMessages((prevMessages) => [...prevMessages, modelMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = {
        id: newMessages.length + 1,
        text: 'Error: Unable to get a response from the model. Please check the configuration.',
        sender: 'model',
        isError: true,
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadChat = (chat) => {
    cancelOngoingRequest();
    // The useEffect hook will handle saving the previous chat if it was modified
    lastSavedMessages.current = chat.messages;
    setMessages(chat.messages);
    setActiveChatId(chat.id);
    startNewChat();
  };

  const handleDeleteChat = (chatId) => {
    cancelOngoingRequest();
    deleteChat(chatId);
    if (activeChatId === chatId) {
      lastSavedMessages.current = [];
      setMessages([]);
      setActiveChatId(null);
    }
    setHistory(getHistory());
  };

  return (
    <div
      className={`flex h-screen ${
        theme === 'dark' ? 'aurora-background' : ''
      }`}
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50"
          aria-hidden="true"
        />
      )}
      <HistorySidebar
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        history={history}
        onLoadChat={handleLoadChat}
        onNewChat={handleNewChat}
        activeChatId={activeChatId}
        onDeleteChat={handleDeleteChat}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <ChatHeader
          onSettingsClick={() => setIsSettingsOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
        />
        <SettingsDialog
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          {messages.length === 0 && !isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                How can Dom help you today?
              </h1>
              <div className="w-full max-w-4xl mt-8">
                <MessageInput
                  input={input}
                  setInput={setInput}
                  handleSend={handleSend}
                  isLoading={isLoading}
                />
              </div>
            </div>
          ) : (
            <>
              <MessageList messages={messages} isLoading={isLoading} />
              <MessageInput
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                isLoading={isLoading}
              />
            </>
          )}
        </div>
      </div>
      <DownloadBanner />
    </div>
  );
};

export default ChatPage;