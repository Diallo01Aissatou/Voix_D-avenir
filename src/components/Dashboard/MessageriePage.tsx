import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, User, MessageCircle, Plus, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
// import { useSocket } from '../../hooks/useSocket';

// Fonction utilitaire pour corriger les URLs des photos
const getPhotoUrl = (photo: string | undefined) => {
  if (!photo) return null;
  if (photo.startsWith('http')) return photo;
  return `https://voix-avenir-backend.onrender.com${photo.startsWith('/') ? photo : '/' + photo}`;
};

interface Conversation {
  _id: string;
  user: {
    _id: string;
    name: string;
    photo?: string;
    role?: string;
  };
  lastMessage?: {
    content: string;
    timestamp: string;
    sender: string;
    
  };
  unreadCount?: number;
}

interface Message {
  _id: string;
  sender: any;
  recipient: string;
  content: string;
  timestamp: string;
  read?: boolean;
}

const MessageriePage: React.FC = () => {
  const { currentUser } = useAuth();
  // const { socket } = useSocket();
  const socket = null; // Désactiver temporairement les WebSockets
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = 'https://voix-avenir-backend.onrender.com';

  useEffect(() => {
    console.log('CurrentUser dans MessageriePage:', currentUser);
    loadConversations();
    loadUserProfile();
    loadAvailableUsers(); // Charger les utilisateurs disponibles au démarrage
    
    // Écouter l'événement pour ouvrir une conversation spécifique
    const handleOpenConversation = (event: CustomEvent) => {
      const { userId } = event.detail;
      console.log('Événement openConversation reçu pour userId:', userId);
      if (userId && userId !== selectedConversation) {
        console.log('Changement de conversation de', selectedConversation, 'vers', userId);
        setSelectedConversation(null);
        setMessages([]);
        setTimeout(() => {
          setSelectedConversation(userId);
          loadMessages(userId);
        }, 100);
      } else if (userId === selectedConversation) {
        console.log('Même conversation, rechargement des messages');
        loadMessages(userId);
      }
    };

    window.addEventListener('openConversation', handleOpenConversation as EventListener);

    return () => {
      window.removeEventListener('openConversation', handleOpenConversation as EventListener);
    };
  }, []); // Supprimer les dépendances qui causent la boucle

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]); // Supprimer les dépendances inutiles

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/messages/conversations`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
      setConversations([]);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/messages/users/available`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data);
      } else {
        setAvailableUsers([]);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      setAvailableUsers([]);
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  const startNewConversation = (userId: string) => {
    setSelectedConversation(userId);
    setShowNewConversation(false);
    setMessages([]); // Vider les messages précédents
    loadMessages(userId);
  };

  const loadMessages = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/messages/${userId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending || !currentUser) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          recipient: selectedConversation,
          content: messageContent
        })
      });

      if (response.ok) {
        const savedMessage = await response.json();
        setMessages(prev => [...prev, savedMessage]);
        loadConversations();
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUser = selectedConversation ? (
    conversations.find(conv => conv.user._id === selectedConversation)?.user || 
    availableUsers.find(user => user._id === selectedConversation)
  ) : null;

  return (
    <div className="h-full bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center overflow-hidden">
                {getPhotoUrl(userProfile?.photo) ? (
                  <img src={getPhotoUrl(userProfile.photo)!} alt={userProfile?.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Messages</h1>
                <p className="text-xs text-gray-500">{userProfile?.name}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowNewConversation(true);
                loadAvailableUsers();
              }}
              className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {showNewConversation ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Nouvelle conversation</h3>
                <button onClick={() => setShowNewConversation(false)} className="p-1 text-gray-500 hover:text-gray-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {availableUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => startNewConversation(user._id)}
                    className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center overflow-hidden">
                        {getPhotoUrl(user.photo) ? (
                          <img src={getPhotoUrl(user.photo)!} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{user.name}</h4>
                        <p className="text-sm text-purple-600 capitalize font-medium">
                          {user.role === 'mentore' ? 'Mentore' : 'Mentorée'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => setSelectedConversation(conversation.user._id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation === conversation.user._id ? 'bg-purple-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center overflow-hidden">
                    {getPhotoUrl(conversation.user.photo) ? (
                      <img src={getPhotoUrl(conversation.user.photo)!} alt={conversation.user.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{conversation.user.name}</h3>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-1">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage?.content || 'Nouvelle conversation'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center overflow-hidden">
                  {selectedUser && getPhotoUrl(selectedUser.photo) ? (
                    <img src={getPhotoUrl(selectedUser.photo)!} alt={selectedUser.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedUser?.name}</h2>
                  <p className="text-sm text-green-600">En ligne</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
                  const isMyMessage = String(senderId) === String(currentUser?._id || currentUser?.id);

                  return (
                    <div key={index} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`px-4 py-2 rounded-2xl max-w-xs ${
                        isMyMessage ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-[10px] mt-1 ${isMyMessage ? 'text-purple-200' : 'text-gray-400'}`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="bg-white border-t border-gray-200 p-4 flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Message..."
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none"
              />
              <button onClick={sendMessage} disabled={!newMessage.trim() || sending} className="p-2 bg-purple-600 text-white rounded-full">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500">
            Sélectionnez une conversation pour commencer
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageriePage;
