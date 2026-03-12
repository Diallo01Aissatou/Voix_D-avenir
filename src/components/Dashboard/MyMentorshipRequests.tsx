import React, { useState, useEffect } from 'react';
import { User, Clock, MessageCircle, CheckCircle, XCircle } from 'lucide-react';

interface MentorshipRequest {
  _id: string;
  mentore: {
    _id: string;
    name: string;
    email: string;
    photo?: string;
    profession: string;
    expertise: string[];
  };
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  responseMessage?: string;
  createdAt: string;
  respondedAt?: string;
}

interface MyMentorshipRequestsProps {
  onStartChat?: (mentoreId: string, mentoreName: string) => void;
}

const MyMentorshipRequests: React.FC<MyMentorshipRequestsProps> = ({ onStartChat }) => {
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/mentorship/sent', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
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
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Mes demandes de mentorat</h2>
      
      {requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucune demande de mentorat envoyée</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    {request.mentore.photo ? (
                      <img src={request.mentore.photo} alt={request.mentore.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{request.mentore.name}</h3>
                    <p className="text-sm text-gray-600">{request.mentore.profession}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      Envoyée le {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(request.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Votre message :</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{request.message}</p>
              </div>

              {request.responseMessage && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Réponse de la mentore :</h4>
                  <p className="text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    {request.responseMessage}
                  </p>
                </div>
              )}

              {request.status === 'accepted' && onStartChat && (
                <div className="flex justify-end">
                  <button
                    onClick={() => onStartChat(request.mentore._id, request.mentore.name)}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Commencer la conversation</span>
                  </button>
                </div>
              )}

              {request.respondedAt && (
                <p className="text-xs text-gray-500 mt-2">
                  Réponse reçue le {new Date(request.respondedAt).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMentorshipRequests;
