import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCircle, 
  XCircle, 
  User, 
  Paperclip,
  Phone,
  Video,
  MoreVertical,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { MentorshipRequest, Message, User as UserType } from '../../types';
import Api from '../../data/Api';
// import { useSocket } from '../../hooks/useSocket';

interface CompleteMentorshipSystemProps {
  onNavigate?: (page: string) => void;
}

const CompleteMentorshipSystem: React.FC<CompleteMentorshipSystemProps> = ({ onNavigate: _onNavigate }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'mentorships' | 'chat'>('requests');
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [mentorships, setMentorships] = useState<MentorshipRequest[]>([]);
  const [selectedMentorship, setSelectedMentorship] = useState<MentorshipRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const { socket } = useSocket();

  // Socket events disabled for now

  // Charger les données
  useEffect(() => {
    loadRequests();
    loadMentorships();
  }, [currentUser]);

  // Load messages when mentorship is selected
  useEffect(() => {
    if (selectedMentorship) {
      loadMessages(selectedMentorship._id);
    }
  }, [selectedMentorship]);

  const loadRequests = async () => {
    try {
      const endpoint = currentUser?.role === 'mentore' ? 'received' : 'sent';
      const res = await Api.get(`/mentorship/${endpoint}`);
      setRequests(res.data);
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
    }
  };

  const loadMentorships = async () => {
    try {
      const endpoint = currentUser?.role === 'mentore' ? 'received' : 'sent';
      const res = await Api.get(`/mentorship/${endpoint}`);
      const activeMentorships = res.data.filter((r: any) => r.status === 'accepted');
      setMentorships(activeMentorships);
    } catch (error) {
      console.error('Erreur chargement mentorats:', error);
    }
  };

  const loadMessages = async (_mentorshipId: string) => {
    try {
      const otherUserId = getOtherUserId(selectedMentorship);
      if (otherUserId) {
        const res = await Api.get(`/messages/${otherUserId}`);
        setMessages(res.data);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const getOtherUserId = (mentorship: MentorshipRequest | null): string | null => {
    if (!mentorship) return null;
    if (currentUser?.role === 'mentore') {
      return typeof mentorship.mentoree === 'string' ? mentorship.mentoree : mentorship.mentoree._id;
    } else {
      return typeof mentorship.mentore === 'string' ? mentorship.mentore : mentorship.mentore._id;
    }
  };

  const getOtherUser = (mentorship: MentorshipRequest | null): UserType | null => {
    if (!mentorship) return null;
    if (currentUser?.role === 'mentore') {
      return typeof mentorship.mentoree === 'string' ? null : mentorship.mentoree;
    } else {
      return typeof mentorship.mentore === 'string' ? null : mentorship.mentore;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedMentorship) return;

    const otherUserId = getOtherUserId(selectedMentorship);
    if (!otherUserId) return;

    try {
      const res = await Api.post('/messages', {
        recipient: otherUserId,
        content: newMessage
      });

      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedMentorship) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('recipient', getOtherUserId(selectedMentorship) || '');
    formData.append('mentorshipId', selectedMentorship._id || '');

    try {
      const response = await Api.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessages(prev => [...prev, response.data]);
      scrollToBottom();
    } catch (error) {
      console.error('Erreur upload fichier:', error);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'accepted' | 'rejected', responseMessage?: string) => {
    setIsLoading(true);
    try {
      const res = await Api.put(`/mentorship/respond/${requestId}`, { status: action, responseMessage });
      if (res.data) {
        loadRequests();
        loadMentorships();
      }
    } catch (error) {
      console.error('Erreur action demande:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'rejected': return 'Refusée';
      default: return status;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Système de Mentorat</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'requests'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Demandes
            </button>
            <button
              onClick={() => setActiveTab('mentorships')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'mentorships'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Mentorats
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Chat
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          {activeTab === 'requests' && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">
                  {currentUser?.role === 'mentore' ? 'Demandes reçues' : 'Mes demandes'}
                </h3>
              </div>
              <div className="space-y-2 p-2">
                {requests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Aucune demande</p>
                  </div>
                ) : (
                  requests.map((request) => (
                    <div key={request._id} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                          {currentUser?.role === 'mentore' ? (
                            typeof request.mentoree === 'string' ? (
                              <User className="w-5 h-5 text-white" />
                            ) : (
                              request.mentoree.photo ? (
                                <img src={request.mentoree.photo} alt={request.mentoree.name} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-white" />
                              )
                            )
                          ) : (
                            typeof request.mentore === 'string' ? (
                              <User className="w-5 h-5 text-white" />
                            ) : (
                              request.mentore.photo ? (
                                <img src={request.mentore.photo} alt={request.mentore.name} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-white" />
                              )
                            )
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {currentUser?.role === 'mentore' 
                                ? (typeof request.mentoree === 'string' ? 'Mentorée' : request.mentoree.name)
                                : (typeof request.mentore === 'string' ? 'Mentore' : request.mentore.name)
                              }
                            </p>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                              {getStatusText(request.status)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{request.message}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      
                      {/* Actions pour les mentores */}
                      {currentUser?.role === 'mentore' && request.status === 'pending' && (
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleRequestAction(request._id, 'accepted')}
                            disabled={isLoading}
                            className="flex-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            Accepter
                          </button>
                          <button
                            onClick={() => handleRequestAction(request._id, 'rejected')}
                            disabled={isLoading}
                            className="flex-1 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3 inline mr-1" />
                            Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'mentorships' && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Mentorats actifs</h3>
              </div>
              <div className="space-y-2 p-2">
                {mentorships.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Aucun mentorat actif</p>
                  </div>
                ) : (
                  mentorships.map((mentorship) => (
                    <div 
                      key={mentorship._id} 
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedMentorship?._id === mentorship._id ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedMentorship(mentorship)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                          {getOtherUser(mentorship)?.photo ? (
                            <img src={getOtherUser(mentorship)?.photo} alt={getOtherUser(mentorship)?.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getOtherUser(mentorship)?.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {getOtherUser(mentorship)?.profession}
                          </p>
                          <div className="flex items-center mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-xs text-gray-400">En ligne</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedMentorship ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      {getOtherUser(selectedMentorship)?.photo ? (
                        <img src={getOtherUser(selectedMentorship)?.photo} alt={getOtherUser(selectedMentorship)?.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getOtherUser(selectedMentorship)?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getOtherUser(selectedMentorship)?.profession}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Aucun message</p>
                    <p className="text-sm">Commencez la conversation !</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${typeof message.sender === 'string' ? message.sender === currentUser?._id : message.sender._id === currentUser?._id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          typeof message.sender === 'string' 
                            ? message.sender === currentUser?._id 
                            : message.sender._id === currentUser?._id
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        {message.messageType === 'file' && message.fileUrl ? (
                          <div>
                            <a 
                              href={message.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              📎 {message.fileName}
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                        <p className={`text-xs mt-1 ${
                          typeof message.sender === 'string' 
                            ? message.sender === currentUser?._id 
                            : message.sender._id === currentUser?._id
                            ? 'text-purple-100'
                            : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Tapez votre message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Sélectionnez une conversation</h3>
                <p className="text-sm">Choisissez un mentorat pour commencer à échanger des messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompleteMentorshipSystem;
