'use client';

import dynamic from 'next/dynamic';

// Dynamically import the ChatWindow component to avoid SSR issues
const ChatWindow = dynamic(() => import('@/components/ChatInterface/ChatWindow'), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center">Loading chat interface...</div>
});

const ChatPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Task Assistant</h1>
        <p className="text-gray-600">Interact with our AI to manage your tasks using natural language</p>
      </div>

      <div className="h-[600px]">
        <ChatWindow />
      </div>
    </div>
  );
};

export default ChatPage;