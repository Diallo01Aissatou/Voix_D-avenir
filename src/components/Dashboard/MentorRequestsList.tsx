import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, MessageCircle, User } from 'lucide-react';

interface MentorRequest {
  _id: string;
  mentore: {
    _id: string;
    name: string;
    photo?: string;
    profession: string;
    expertise: string[];
  };
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  response?: string;
  createdAt: string;
  updatedAt: string;
}

interface MentorRequestsListProps {
  onStartChat: (mentoreId: string, mentoreName: string) => void;
  refreshTrigger: number;
}

const MentorRequestsList: React.FC<MentorRequestsListProps> = ({ onStartChat, refreshTrigger }) => {
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [refreshTrigger]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/mentor-requests/sent', {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Acceptée';
      case 'rejected': return 'Rejetée';
      default: return 'En attente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucune demande envoyée</p>
        </div>
      ) : (
        requests.map((request) => (
          <div key={request._id} className="bg-white rounded-lg shadow p-6 border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  {request.mentore.photo ? (
                    <img src={request.mentore.photo} alt={request.mentore.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{request.mentore.name}</h3>
                  <p className="text-sm text-gray-600">{request.mentore.profession}</p>
                  <p className="text-xs text-gray-500 mt-1">
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

            {request.response && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Réponse de la mentore :</h4>
                <p className="text-gray-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                  {request.response}
                </p>
              </div>
            )}

            {request.status === 'accepted' && (
              <div className="flex justify-end">
                <button
                  onClick={() => onStartChat(request.mentore._id, request.mentore.name)}
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
  );
};

export default MentorRequestsList;