import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Flag, X, Download, Image, FileText } from 'lucide-react';
import Api from '../../data/Api';
import { useAuth } from '../../contexts/AuthContext';
import ChatDebug from './ChatDebug';
import './ChatStyles.css';

interface ChatWindowProps {
  recipientId: string;
  recipientName: string;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ recipientId, recipientName, onClose }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [recipientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await Api.get(`/messages/${recipientId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      setMessages([]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('recipient', recipientId);
      if (newMessage.trim()) {
        formData.append('content', newMessage);
      }
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await Api.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setNewMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      loadMessages();
    } catch (error) {
      console.error('Erreur envoi message:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Type de fichier non autorisé. Seuls les images et PDF sont acceptés.');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximum : 10MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const reportMessage = async (messageId: string) => {
    if (!reportReason.trim()) {
      alert('Veuillez indiquer la raison du signalement');
      return;
    }

    try {
      await Api.post('/messages/report', {
        messageId,
        reason: reportReason
      });
      alert('Message signalé avec succès');
      setShowReportModal(false);
      setReportReason('');
    } catch (error) {
      console.error('Erreur signalement:', error);
      alert('Erreur lors du signalement');
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {recipientName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{recipientName}</h3>
              <p className="text-sm text-green-500">En ligne</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-messages">
          {messages.map((message: any) => {
            const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
            const currentUserId = currentUser?.id || currentUser?._id;
            const isMyMessage = senderId === currentUserId;
            
            return (
              <div key={message._id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                  isMyMessage ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                }`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isMyMessage 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    <span className="text-xs font-medium">
                      {isMyMessage 
                        ? (currentUser?.name?.charAt(0).toUpperCase() || 'M')
                        : recipientName.charAt(0).toUpperCase()
                      }
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div className={`px-4 py-3 rounded-2xl shadow-md relative message-bubble ${
                    isMyMessage
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md my-message'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md other-message'
                  }`}>
                    {/* Message Content */}
                    {message.content && (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    )}
                    
                    {/* File Attachment */}
                    {message.fileUrl && (
                      <div className="mt-2">
                        {message.fileType?.startsWith('image/') ? (
                          <img
                            src={message.fileUrl}
                            alt={message.fileName}
                            className="max-w-full h-auto rounded-lg cursor-pointer"
                            onClick={() => window.open(message.fileUrl, '_blank')}
                          />
                        ) : (
                          <div className={`flex items-center space-x-2 p-2 rounded-lg ${
                            isMyMessage ? 'bg-white bg-opacity-20' : 'bg-gray-100'
                          }`}>
                            <FileText className="w-5 h-5" />
                            <span className="text-sm flex-1 truncate">{message.fileName}</span>
                            <button
                              onClick={() => window.open(message.fileUrl, '_blank')}
                              className={`p-1 rounded transition-colors ${
                                isMyMessage ? 'hover:bg-white hover:bg-opacity-20' : 'hover:bg-gray-200'
                              }`}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Time and Status */}
                    <div className={`flex items-center mt-2 space-x-2 ${
                      isMyMessage ? 'justify-end' : 'justify-between'
                    }`}>
                      <span className={`text-xs ${
                        isMyMessage ? 'text-purple-200' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </span>
                      
                      {/* Status indicators for my messages */}
                      {isMyMessage && (
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
                          {message.read && <div className="w-2 h-2 bg-green-400 rounded-full"></div>}
                        </div>
                      )}
                      
                      {/* Report button for received messages */}
                      {!isMyMessage && (
                        <button
                          onClick={() => setShowReportModal(true)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Signaler ce message"
                        >
                          <Flag className="w-3 h-3 text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* File Preview */}
        {selectedFile && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 flex-1 p-2 bg-white rounded-lg">
                {selectedFile.type.startsWith('image/') ? (
                  <Image className="w-5 h-5 text-blue-500" />
                ) : (
                  <FileText className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm text-gray-700 truncate">{selectedFile.name}</span>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-end space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,.pdf"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Joindre un fichier"
            >
              <Paperclip className="w-5 h-5 text-gray-500" />
            </button>
            
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={1}
              />
            </div>
            
            <button
              onClick={sendMessage}
              disabled={isLoading || (!newMessage.trim() && !selectedFile)}
              className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Signaler ce message</h3>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Indiquez la raison du signalement..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => reportMessage('')}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Signaler
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ChatDebug messages={messages} currentUser={currentUser} />
    </div>
  );
};

export default ChatWindow;