'use client';

import React, { useState } from 'react';
import ChatHeader from '../../components/ChatHeader';
import { sendMessage } from '../../service/gemini';
import MessageList from '../../components/MessageList';
import MessageInput from '../../components/MessageInput';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNewChat = () => {
    setMessages([]);
  };

  const handleSend = async () => {
    if (input.trim() === '') return;

    setIsLoading(true);

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    try {
      const modelResponse = await sendMessage(newMessages);

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

  return (
    <div className="flex flex-col h-screen text-white bg-gray-900">
      <ChatHeader onNewChat={handleNewChat} />
      <MessageList messages={messages} isLoading={isLoading} />
      <MessageInput
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatPage;