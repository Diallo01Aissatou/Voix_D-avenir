import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, User, Paperclip, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Api from '../../data/Api'; // Importation du service Api

interface Message {
  _id: string;
  sender: { _id: string; name: string };
  recipient: { _id: string; name: string };
  content: string;
  fileUrl?: string;
  fileName?: string;
  timestamp: string;
}

interface DynamicChatProps {
  otherUserId: string;
  otherUserName: string;
  onClose: () => void;
}

const DynamicChat: React.FC<DynamicChatProps> = ({ otherUserId, otherUserName, onClose }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000); // Actualisation toutes les 2 secondes
    return () => clearInterval(interval);
  }, [otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await Api.get(`/messages/${otherUserId}`);
      setMessages(res.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !fileInputRef.current?.files?.[0]) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('recipient', otherUserId);
      formData.append('content', newMessage.trim());
      
      if (fileInputRef.current?.files?.[0]) {
        formData.append('file', fileInputRef.current.files[0]);
      }

      const res = await Api.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-purple-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">{otherUserName}</h3>
            <p className="text-sm opacity-90">Conversation de mentorat</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Aucun message. Commencez la conversation !</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender._id === currentUser?._id;
            return (
              <div key={message._id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isCurrentUser 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white text-gray-800 shadow'
                }`}>
                  {message.content && <p className="text-sm">{message.content}</p>}
                  {message.fileUrl && (
                    <div className="mt-2">
                      {message.fileName?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img 
                          src={`https://voix-avenir-backend.onrender.com${message.fileUrl}`} 
                          alt={message.fileName}
                          className="max-w-full h-auto rounded"
                        />
                      ) : (
                        <a 
                          href={`https://voix-avenir-backend.onrender.com${message.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-sm underline"
                        >
                          <Paperclip className="w-4 h-4" />
                          <span>{message.fileName}</span>
                        </a>
                      )}
                    </div>
                  )}
                  <p className={`text-xs mt-1 ${isCurrentUser ? 'text-white text-opacity-70' : 'text-gray-500'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,.pdf"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={sending || (!newMessage.trim() && !fileInputRef.current?.files?.[0])}
            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default DynamicChat;
