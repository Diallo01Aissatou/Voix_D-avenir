import React, { useState, useEffect } from 'react';
import { Plus, Send, Check, X, MessageCircle, User, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DynamicChat from './DynamicChat';

interface MentorshipRequest {
  _id: string;
  mentore?: { _id: string; name: string; photo?: string; profession: string };
  mentoree?: { _id: string; name: string; photo?: string; profession: string; city: string };
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  response?: string;
  createdAt: string;
}

interface Mentore {
  _id: string;
  name: string;
  photo?: string;
  profession: string;
  expertise: string[];
}

const MentorshipSystem: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [mentores, setMentores] = useState<Mentore[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMentore, setSelectedMentore] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatUser, setChatUser] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    loadRequests();
    if (currentUser?.role === 'mentoree') {
      loadMentores();
    }
  }, [currentUser]);

  const loadRequests = async () => {
    try {
      const endpoint = currentUser?.role === 'mentore' ? 'received' : 'sent';
      const response = await fetch(`http://localhost:5000/api/mentorship/${endpoint}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const loadMentores = async () => {
    try {
      console.log('Chargement des mentores...');
      const response = await fetch('http://localhost:5000/api/users?role=mentore', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Mentores chargées:', data);
        setMentores(data);
      } else {
        console.error('Erreur réponse:', response.status);
      }
    } catch (error) {
      console.error('Erreur chargement mentores:', error);
    }
  };

  const createRequest = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/mentorship/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mentoreId: selectedMentore, message: message })
      });

      if (response.ok) {
        alert('Demande envoyée avec succès!');
        setShowModal(false);
        setSelectedMentore('');
        setMessage('');
        setSearchTerm('');
        loadRequests();
      } else {
        alert('Erreur lors de l\'envoi');
      }
    } catch (error) {
      alert('Erreur réseau');
    }
    setLoading(false);
  };

  const respondToRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`http://localhost:5000/api/mentorship/respond/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, response: responseMessage.trim() || undefined })
      });

      if (response.ok) {
        setRespondingTo(null);
        setResponseMessage('');
        loadRequests();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Acceptée';
      case 'rejected': return 'Rejetée';
      default: return 'En attente';
    }
  };

  const filteredMentores = mentores.filter(mentore => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      mentore.name?.toLowerCase().includes(search) ||
      mentore.profession?.toLowerCase().includes(search) ||
      mentore.expertise?.some(exp => exp?.toLowerCase().includes(search))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          {currentUser?.role === 'mentore' ? 'Demandes reçues' : 'Mes demandes de mentorat'}
        </h2>
        {currentUser?.role === 'mentoree' && (
          <button
            onClick={async () => {
              setShowModal(true);
              await loadMentores();
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle demande</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune demande</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow p-6 border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    {(request.mentore?.photo || request.mentoree?.photo) ? (
                      <img 
                        src={request.mentore?.photo || request.mentoree?.photo} 
                        alt="Photo" 
                        className="w-12 h-12 rounded-full object-cover" 
                      />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {currentUser?.role === 'mentore' ? request.mentoree?.name : request.mentore?.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {currentUser?.role === 'mentore' ? request.mentoree?.profession : request.mentore?.profession}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                  {getStatusText(request.status)}
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Message :</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{request.message}</p>
              </div>

              {request.response && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Réponse :</h4>
                  <p className="text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    {request.response}
                  </p>
                </div>
              )}

              {currentUser?.role === 'mentore' && request.status === 'pending' && (
                <div className="space-y-4">
                  {respondingTo === request._id ? (
                    <div className="space-y-3">
                      <textarea
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        placeholder="Message de réponse (optionnel)..."
                        className="w-full p-3 border rounded-lg"
                        rows={3}
                      />
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => {
                            setRespondingTo(null);
                            setResponseMessage('');
                          }}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => respondToRequest(request._id, 'rejected')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Rejeter</span>
                        </button>
                        <button
                          onClick={() => respondToRequest(request._id, 'accepted')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accepter</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <button
                        onClick={() => setRespondingTo(request._id)}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Répondre
                      </button>
                    </div>
                  )}
                </div>
              )}

              {request.status === 'accepted' && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      const otherUser = currentUser?.role === 'mentore' ? request.mentoree : request.mentore;
                      setChatUser({id: otherUser?._id || '', name: otherUser?.name || ''});
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Commencer la conversation</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal nouvelle demande */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Nouvelle demande de mentorat</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rechercher une mentore</label>
                <input
                  type="text"
                  placeholder="Rechercher par nom, ville ou domaine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border rounded-lg mb-2"
                />
                {filteredMentores.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border rounded-lg">
                    {filteredMentores.map((mentore) => (
                      <div
                        key={mentore._id}
                        onClick={() => {
                          setSelectedMentore(mentore._id);
                          setSearchTerm(mentore.name);
                        }}
                        className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="font-medium">{mentore.name}</div>
                        <div className="text-sm text-gray-600">{mentore.profession} - {mentore.city}</div>
                        <div className="text-xs text-gray-500">
                          {mentore.expertise?.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Présentez-vous et expliquez pourquoi vous souhaitez ce mentorat..."
                  className="w-full p-2 border rounded-lg"
                  rows={4}
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedMentore('');
                    setMessage('');
                    setSearchTerm('');
                  }}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={createRequest}
                  disabled={loading || !selectedMentore || !message.trim()}
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Envoi...' : 'Envoyer'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat */}
      {chatUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh]">
            <DynamicChat
              otherUserId={chatUser.id}
              otherUserName={chatUser.name}
              onClose={() => setChatUser(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipSystem;