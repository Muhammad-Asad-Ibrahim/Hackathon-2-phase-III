import React from 'react';
import ChatWindow from '../components/ChatInterface/ChatWindow';

const ChatPage = () => {
  // In a real app, you would get the user ID from the authentication context
  const userId = 'current-user-id'; // Placeholder - would come from auth context

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Task Assistant</h1>
        <p className="text-gray-600">Interact with our AI to manage your tasks using natural language</p>
      </div>
      
      <div className="h-[600px]">
        <ChatWindow userId={userId} />
      </div>
      
      <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h3 className="font-semibold text-blue-800 mb-2">Try these examples:</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>"Create a task to buy groceries tomorrow"</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>"Update the meeting task to next week"</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>"Delete the doctor appointment task"</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>"Show me my tasks"</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ChatPage;