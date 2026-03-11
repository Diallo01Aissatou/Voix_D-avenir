import React from 'react';
import './ChatStyles.css';

interface TypingIndicatorProps {
  userName: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ userName }) => {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-300 text-gray-600">
          <span className="text-xs font-medium">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Typing Bubble */}
        <div className="px-4 py-3 rounded-2xl shadow-md bg-white border border-gray-200 rounded-bl-md">
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
          <span className="text-xs text-gray-500 ml-2">
            {userName} est en train d'écrire...
          </span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;