import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
// import { useSocket } from '../../hooks/useSocket';
import Api from '../../data/Api';

const MentorshipTest: React.FC = () => {
  const { currentUser } = useAuth();
  const [isConnected] = useState(false); // Socket désactivé pour l'instant
  const [requests, setRequests] = useState([]);
  const [mentorships, setMentorships] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    activeMentorships: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Utiliser les vraies routes qui existent
      const requestsRes = await fetch(`http://localhost:5001/api/mentorship/${currentUser?.role === 'mentore' ? 'received' : 'sent'}`, {
        credentials: 'include'
      });
      
      const requests = requestsRes.ok ? await requestsRes.json() : [];
      
      const calculatedStats = {
        totalRequests: requests.length,
        pendingRequests: requests.filter((r: any) => r.status === 'pending').length,
        acceptedRequests: requests.filter((r: any) => r.status === 'accepted').length,
        activeMentorships: requests.filter((r: any) => r.status === 'accepted').length
      };
      
      setRequests(requests);
      setMentorships(requests.filter((r: any) => r.status === 'accepted'));
      setStats(calculatedStats);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`http://localhost:5001/api/mentorship/respond/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: action })
      });
      
      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Erreur action demande:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Test du Système de Mentorat</h2>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              Socket.IO: {isConnected ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            Rôle: {currentUser?.role}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-800">{stats.totalRequests}</p>
              <p className="text-sm text-gray-600">Total demandes</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-800">{stats.pendingRequests}</p>
              <p className="text-sm text-gray-600">En attente</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-800">{stats.acceptedRequests}</p>
              <p className="text-sm text-gray-600">Acceptées</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <User className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-800">{stats.activeMentorships}</p>
              <p className="text-sm text-gray-600">Mentorats actifs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {currentUser?.role === 'mentore' ? 'Demandes reçues' : 'Mes demandes'}
        </h3>
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Aucune demande</p>
            </div>
          ) : (
            requests.map((request: any) => (
              <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {(currentUser?.role === 'mentore' ? request.mentoree?.photo : request.mentore?.photo) ? (
                        <img 
                          src={currentUser?.role === 'mentore' ? request.mentoree?.photo : request.mentore?.photo}
                          alt={currentUser?.role === 'mentore' ? request.mentoree?.name : request.mentore?.name}
                          className="w-16 h-16 rounded-full object-cover" 
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      {!(currentUser?.role === 'mentore' ? request.mentoree?.photo : request.mentore?.photo) && (
                        <User className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {currentUser?.role === 'mentore' 
                          ? (typeof request.mentoree === 'string' ? 'Mentorée' : request.mentoree.name)
                          : (typeof request.mentore === 'string' ? 'Mentore' : request.mentore.name)
                        }
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{request.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {request.status === 'pending' ? 'En attente' :
                       request.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                    </span>
                    {currentUser?.role === 'mentore' && request.status === 'pending' && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleRequestAction(request._id, 'accepted')}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRequestAction(request._id, 'rejected')}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Mentorships */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mentorats actifs</h3>
        <div className="space-y-3">
          {mentorships.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Aucun mentorat actif</p>
            </div>
          ) : (
            mentorships.map((mentorship: any) => (
              <div key={mentorship._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {(currentUser?.role === 'mentore' ? mentorship.mentoree?.photo : mentorship.mentore?.photo) ? (
                      <img 
                        src={currentUser?.role === 'mentore' ? mentorship.mentoree?.photo : mentorship.mentore?.photo}
                        alt={currentUser?.role === 'mentore' ? mentorship.mentoree?.name : mentorship.mentore?.name}
                        className="w-16 h-16 rounded-full object-cover" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    {!(currentUser?.role === 'mentore' ? mentorship.mentoree?.photo : mentorship.mentore?.photo) && (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {currentUser?.role === 'mentore' 
                        ? (typeof mentorship.mentoree === 'string' ? 'Mentorée' : mentorship.mentoree.name)
                        : (typeof mentorship.mentore === 'string' ? 'Mentore' : mentorship.mentore.name)
                      }
                    </h4>
                    <p className="text-sm text-gray-600">
                      Débuté le {new Date(mentorship.startDate || mentorship.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorshipTest;


