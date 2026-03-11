import React, { useState, useEffect, useRef } from 'react';
import { Send, User, ArrowLeft, Paperclip, Download } from 'lucide-react';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
  };
  recipient: {
    _id: string;
    name: string;
  };
  content: string;
  fileUrl?: string;
  fileName?: string;
  timestamp: string;
}

interface MentorshipChatProps {
  otherUserId: string;
  otherUserName: string;
  currentUserId: string;
  onBack: () => void;
}

const MentorshipChat: React.FC<MentorshipChatProps> = ({
  otherUserId,
  otherUserName,
  currentUserId,
  onBack
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${otherUserId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
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

      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi du message');
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

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('fr-FR');
  };

  const isToday = (timestamp: string) => {
    const messageDate = new Date(timestamp).toDateString();
    const today = new Date().toDateString();
    return messageDate === today;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
        <button
          onClick={onBack}
          className="mr-3 p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold">{otherUserName}</h3>
          <p className="text-sm opacity-90">Conversation de mentorat</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Aucun message encore. Commencez la conversation !</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
            const isCurrentUser = senderId === currentUserId;
            const showDate = index === 0 || 
              formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);

            return (
              <div key={message._id}>
                {showDate && (
                  <div className="text-center text-xs text-gray-500 my-4">
                    {isToday(message.timestamp) ? 'Aujourd\'hui' : formatDate(message.timestamp)}
                  </div>
                )}
                <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
                  <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                    isCurrentUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                  }`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCurrentUser 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      <span className="text-xs font-medium">
                        {isCurrentUser 
                          ? 'M'
                          : otherUserName.charAt(0).toUpperCase()
                        }
                      </span>
                    </div>

                    {/* Message Bubble */}
                    <div className={`px-4 py-3 rounded-2xl shadow-md relative ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                    }`}>
                      {message.content && (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      )}
                      {message.fileUrl && (
                        <div className="mt-2">
                          {message.fileName?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img 
                              src={`http://localhost:5001${message.fileUrl}`} 
                              alt={message.fileName}
                              className="max-w-full h-auto rounded-lg cursor-pointer"
                              onClick={() => window.open(`http://localhost:5001${message.fileUrl}`, '_blank')}
                            />
                          ) : (
                            <div className={`flex items-center space-x-2 p-2 rounded-lg ${
                              isCurrentUser ? 'bg-white bg-opacity-20' : 'bg-gray-100'
                            }`}>
                              <Paperclip className="w-4 h-4" />
                              <span className="text-sm flex-1 truncate">{message.fileName}</span>
                              <button
                                onClick={() => window.open(`http://localhost:5001${message.fileUrl}`, '_blank')}
                                className={`p-1 rounded transition-colors ${
                                  isCurrentUser ? 'hover:bg-white hover:bg-opacity-20' : 'hover:bg-gray-200'
                                }`}
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      <div className={`flex items-center mt-2 ${
                        isCurrentUser ? 'justify-end' : 'justify-start'
                      }`}>
                        <span className={`text-xs ${
                          isCurrentUser ? 'text-purple-200' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </span>
                        {isCurrentUser && (
                          <div className="flex space-x-1 ml-2">
                            <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
                            {message.read && <div className="w-2 h-2 bg-green-400 rounded-full"></div>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
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
            className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MentorshipChat;