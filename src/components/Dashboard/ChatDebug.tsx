import React from 'react';

interface ChatDebugProps {
  messages: any[];
  currentUser: any;
}

const ChatDebug: React.FC<ChatDebugProps> = ({ messages, currentUser }) => {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-0 right-0 bg-black text-white p-4 text-xs max-w-md z-50">
      <h3>Debug Chat</h3>
      <div>Current User: {JSON.stringify(currentUser, null, 2)}</div>
      <div>Messages:</div>
      {messages.slice(-3).map((msg, i) => (
        <div key={i} className="border-t border-gray-600 mt-2 pt-2">
          <div>Sender: {JSON.stringify(msg.sender, null, 2)}</div>
          <div>Content: {msg.content}</div>
        </div>
      ))}
    </div>
  );
};

export default ChatDebug;
