import React, { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import Api from '../../data/Api';
import { useAuth } from '../../contexts/AuthContext';

interface SimpleChatWindowProps {
  recipientId: string;
  recipientName: string;
  onClose: () => void;
}

const SimpleChatWindow: React.FC<SimpleChatWindowProps> = ({ recipientId, recipientName, onClose }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [recipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await Api.get(`/messages/${recipientId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const formData = new FormData();
      formData.append('recipient', recipientId);
      formData.append('content', newMessage);

      await Api.post('/messages', formData);
      setNewMessage('');
      loadMessages();
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-2xl">
          <h3 className="font-semibold">{recipientName}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.map((message: any, index: number) => {
            // Logique simple : messages pairs = moi, impairs = autre
            const isMyMessage = index % 2 === 0;
            
            return (
              <div key={message._id || index} className={`mb-4 flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                  isMyMessage 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md' 
                    : 'bg-white text-gray-800 shadow-md rounded-bl-md'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${isMyMessage ? 'text-purple-200' : 'text-gray-500'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Tapez votre message..."
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleChatWindow;