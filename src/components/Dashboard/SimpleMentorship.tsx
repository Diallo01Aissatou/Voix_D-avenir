import React, { useState, useEffect } from 'react';
import { Send, Check, X, MessageCircle, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Api from '../../data/Api';

const SimpleMentorship = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [mentores, setMentores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMentore, setSelectedMentore] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatUser, setChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    try {
      // Charger les demandes
      const endpoint = currentUser.role === 'mentore' ? 'received' : 'sent';
      const reqResponse = await Api.get(`/mentorship/${endpoint}`);
      if (reqResponse.data) {
        setRequests(reqResponse.data);
      }

      // Charger les mentores si mentorée
      if (currentUser.role === 'mentoree') {
        const mentResponse = await Api.get('/users?role=mentore');
        if (mentResponse.data) {
          setMentores(mentResponse.data);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const sendRequest = async () => {
    setLoading(true);
    try {
      const response = await Api.post('/mentorship/request', {
        mentoreId: selectedMentore,
        message
      });

      if (response.data) {
        alert('Demande envoyée!');
        setShowModal(false);
        setSelectedMentore('');
        setMessage('');
        loadData();
      }
    } catch (error) {
      console.error('Erreur envoi demande:', error);
      alert('Erreur lors de l\'envoi');
    }
    setLoading(false);
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !chatUser) return;

    try {
      const response = await Api.post('/messages', {
        recipient: chatUser._id,
        content: newMessage
      });

      if (response.data) {
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const respond = async (requestId, status) => {
    try {
      const response = await Api.put(`/mentorship/respond/${requestId}`, { status });
      if (response.data) {
        loadData();
      }
    } catch (error) {
      console.error('Erreur réponse demande:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {currentUser?.role === 'mentore' ? 'Demandes reçues' : 'Mes demandes'}
        </h2>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request._id} className="bg-white p-6 rounded-lg shadow border">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                  {(currentUser?.role === 'mentore' ? request.mentoree?.photo : request.mentore?.photo) ? (
                    <img
                      src={currentUser?.role === 'mentore' ? request.mentoree?.photo : request.mentore?.photo}
                      alt={currentUser?.role === 'mentore' ? request.mentoree?.name : request.mentore?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {currentUser?.role === 'mentore' ? request.mentoree?.name : request.mentore?.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {currentUser?.role === 'mentore' ? request.mentoree?.profession : request.mentore?.profession}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                  request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                }`}>
                {request.status === 'accepted' ? 'Acceptée' :
                  request.status === 'rejected' ? 'Rejetée' : 'En attente'}
              </span>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 bg-gray-50 p-3 rounded">{request.message}</p>
            </div>

            {currentUser?.role === 'mentore' && request.status === 'pending' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => respond(request._id, 'rejected')}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <X className="w-4 h-4 inline mr-1" />
                  Rejeter
                </button>
                <button
                  onClick={() => respond(request._id, 'accepted')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <Check className="w-4 h-4 inline mr-1" />
                  Accepter
                </button>
              </div>
            )}

            {request.status === 'accepted' && (
              <button
                onClick={() => {
                  const otherUser = currentUser?.role === 'mentore' ? request.mentoree : request.mentore;
                  if (otherUser) {
                    const messageEvent = new CustomEvent('switchToMessaging', {
                      detail: { userId: otherUser._id }
                    });
                    window.dispatchEvent(messageEvent);
                  }
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4 inline mr-1" />
                Bavarder
              </button>
            )}
          </div>
        ))}
        {requests.length === 0 && (
          <p className="text-center text-gray-500 py-8">Aucune demande pour le moment.</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Nouvelle demande</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mentore</label>
                <select
                  value={selectedMentore}
                  onChange={(e) => setSelectedMentore(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Choisir...</option>
                  {mentores.map((mentore) => (
                    <option key={mentore._id} value={mentore._id}>
                      {mentore.name} - {mentore.profession}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={4}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border rounded hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={sendRequest}
                  disabled={!selectedMentore || !message || loading}
                  className="flex-1 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showChat && chatUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Chat avec {chatUser.name}</h3>
              <button
                onClick={() => {
                  setShowChat(false);
                  setChatUser(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>Commencez votre conversation</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, index) => {
                      const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                      const currentUserId = currentUser?._id || currentUser?.id;
                      const isCurrentUser = String(senderId) === String(currentUserId);

                      return (
                        <div key={index} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
                          <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                            }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${isCurrentUser
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                : 'bg-gray-300 text-gray-600'
                              }`}>
                              {isCurrentUser ? (
                                currentUser?.photo ? (
                                  <img src={currentUser.photo} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                  <span className="text-xs font-medium">{currentUser?.name?.charAt(0).toUpperCase() || 'M'}</span>
                                )
                              ) : (
                                chatUser?.photo ? (
                                  <img src={chatUser.photo} alt={chatUser.name} className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                  <span className="text-xs font-medium">{chatUser?.name?.charAt(0).toUpperCase() || 'U'}</span>
                                )
                              )}
                            </div>
                            <div className={`px-4 py-3 rounded-2xl shadow-md ${isCurrentUser
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                              }`}>
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                              <div className={`flex items-center mt-2 ${isCurrentUser ? 'justify-end' : 'justify-start'
                                }`}>
                                <span className={`text-xs ${isCurrentUser ? 'text-purple-200' : 'text-gray-500'
                                  }`}>
                                  {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="p-4 border-t bg-white">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Tapez votre message..."
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMentorship;
