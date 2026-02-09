'use client';

import React from 'react';

const Message = ({ message }) => {
  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';

  // Format the timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white mr-2">
          <span className="text-xs font-bold">AI</span>
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200'} rounded-lg px-4 py-2 shadow-sm`}>
        <div className="text-sm">{message.text}</div>
        
        {/* Show additional information for AI responses */}
        {isAI && message.intent && (
          <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
            <div><strong>Intent:</strong> {message.intent}</div>
            {message.entities && message.entities.length > 0 && (
              <div>
                <strong>Entities:</strong>
                <ul className="list-disc pl-4 mt-1">
                  {message.entities.map((entity, index) => (
                    <li key={index}>{entity.type}: {entity.value} (confidence: {(entity.confidence * 100).toFixed(0)}%)</li>
                  ))}
                </ul>
              </div>
            )}
            {message.toolUsed && (
              <div><strong>Tool Used:</strong> {message.toolUsed}</div>
            )}
            {message.toolResult && (
              <div><strong>Tool Result:</strong> {message.toolResult.success ? 'Success' : 'Failed'}</div>
            )}
          </div>
        )}
        
        <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white ml-2">
          <span className="text-xs font-bold">U</span>
        </div>
      )}
    </div>
  );
};

export default Message;