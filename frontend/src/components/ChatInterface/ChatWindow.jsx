'use client';

import React, { useState, useEffect, useRef } from 'react';
import Message from './Message';
import InputArea from './InputArea';
import chatApi from '@/services/chatApi';
import { useAuth } from '@/hooks/useAuth';

const ChatWindow = ({ userId }) => {
  const { isAuthenticated } = useAuth(); // Use the authentication context
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat session
  useEffect(() => {
    if (!isAuthenticated) return; // Only initialize if user is authenticated

    const initSession = async () => {
      try {
        // Get existing sessions or start a new one
        const response = await chatApi.getUserSessions();
        if (response.sessions && response.sessions.length > 0) {
          // Use the most recent session
          setSessionId(response.sessions[0].id);

          // Load messages from the session
          const messagesResponse = await chatApi.getSessionMessages(response.sessions[0].id);
          setMessages(messagesResponse.messages.map(msg => ({
            id: msg.id,
            text: msg.content,
            sender: msg.sender_type.toLowerCase(),
            timestamp: msg.timestamp
          })));
        } else {
          // Create a new session by sending a welcome message
          setMessages([{ id: 'welcome', text: 'Hello! How can I help you today?', sender: 'ai', timestamp: new Date().toISOString() }]);
        }
      } catch (error) {
        console.error('Error initializing chat session:', error);
        setMessages([{ id: 'error', text: 'Sorry, I\'m having trouble connecting. Please try again.', sender: 'ai', timestamp: new Date().toISOString() }]);
      }
    };

    initSession();
  }, [isAuthenticated]);

  // Function to handle sending a message
  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading || !isAuthenticated) return;

    // Add user message to the chat
    const userMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send message to backend
      const response = await chatApi.processMessage(text, sessionId);

      // Update session ID if it's the first message
      if (!sessionId) {
        setSessionId(response.session_id);
      }

      // Add AI response to the chat
      const aiMessage = {
        id: `ai-${Date.now()}`,
        text: response.response,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        intent: response.intent,
        entities: response.entities,
        toolUsed: response.tool_used,
        toolResult: response.tool_result
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: 'Sorry, I encountered an error processing your request.',
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden items-center justify-center">
        <p className="text-gray-500">Please sign in to use the AI assistant</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* Chat header */}
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-semibold">AI Task Assistant</h2>
        <p className="text-sm opacity-80">Ask me to create, update, or manage your tasks</p>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ maxHeight: 'calc(100vh - 250px)' }}>
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 text-blue-800 rounded-lg p-3 max-w-xs md:max-w-md lg:max-w-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <InputArea onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};

export default ChatWindow;