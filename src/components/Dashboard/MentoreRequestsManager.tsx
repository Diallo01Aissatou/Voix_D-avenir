import React, { useState, useEffect } from 'react';
import { Check, X, User, Clock, MessageCircle } from 'lucide-react';

interface MentorRequest {
  _id: string;
  mentoree: {
    _id: string;
    name: string;
    photo?: string;
    profession: string;
    level: string;
    city: string;
  };
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  response?: string;
  createdAt: string;
}

interface MentoreRequestsManagerProps {
  onStartChat: (mentoreeId: string, mentoreeName: string) => void;
}

const BASE_API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://voix-avenir-backend.onrender.com';

const MentoreRequestsManager: React.FC<MentoreRequestsManagerProps> = ({ onStartChat }) => {
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/api/mentor-requests/received`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`${BASE_API_URL}/api/mentor-requests/respond/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status,
          response: responseMessage.trim() || undefined
        })
      });

      if (response.ok) {
        const updatedRequest = await response.json();
        setRequests(prev => prev.map(req =>
          req._id === requestId ? updatedRequest : req
        ));
        setRespondingTo(null);
        setResponseMessage('');
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

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Demandes de mentorat reçues</h2>

      {requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucune demande reçue</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow p-6 border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    {request.mentoree.photo ? (
                      <img src={request.mentoree.photo} alt={request.mentoree.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{request.mentoree.name}</h3>
                    <p className="text-sm text-gray-600">{request.mentoree.profession}</p>
                    <p className="text-sm text-gray-500">{request.mentoree.city} • {request.mentoree.level}</p>
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
                <h4 className="font-medium text-gray-700 mb-2">Message de la mentorée :</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{request.message}</p>
              </div>

              {request.status === 'pending' ? (
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
                          onClick={() => handleResponse(request._id, 'rejected')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Rejeter</span>
                        </button>
                        <button
                          onClick={() => handleResponse(request._id, 'accepted')}
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
              ) : (
                <div className="space-y-4">
                  {request.response && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Votre réponse :</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{request.response}</p>
                    </div>
                  )}
                  {request.status === 'accepted' && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => onStartChat(request.mentoree._id, request.mentoree.name)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Commencer la conversation</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentoreRequestsManager;
