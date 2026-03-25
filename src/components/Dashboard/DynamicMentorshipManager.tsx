import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, XCircle, Clock, User, RefreshCw, Calendar } from 'lucide-react';
import CreateSessionModal from './CreateSessionModal';
import Api, { BASE_URL } from '../../data/Api';

const getPhotoUrl = (photo: string | undefined) => {
  if (!photo) return null;
  let url = photo;
  if (!photo.startsWith('http')) {
    const fileName = photo.split('/').pop();
    url = `https://voix-avenir-backend.onrender.com/uploads/${fileName}`;
  }
  return url.replace('http://', 'https://');
};

interface DynamicMentorshipManagerProps {
  userRole: 'mentore' | 'mentoree';
  onNavigateToMessaging: (userId: string) => void;
}

const DynamicMentorshipManager: React.FC<DynamicMentorshipManagerProps> = ({
  userRole,
  onNavigateToMessaging
}) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showCreateSession, setShowCreateSession] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();

    // Actualisation automatique toutes les 15 secondes
    const interval = setInterval(() => {
      loadRequests();
    }, 15000);

    return () => clearInterval(interval);
  }, [userRole]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const endpoint = userRole === 'mentore' ? 'received' : 'sent';
      const response = await Api.get(`/mentorship/${endpoint}`);

      setRequests(response.data || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
    setProcessingRequest(requestId);

    try {
      await Api.put(`/mentorship/respond/${requestId}`, { status });

      alert(`Demande ${status === 'accepted' ? 'acceptée' : 'rejetée'} avec succès !`);

      await loadRequests();

      // Émettre un événement pour actualiser les stats
      const updateEvent = new CustomEvent('mentorshipUpdate', {
        detail: { type: 'response', status, requestId }
      });
      window.dispatchEvent(updateEvent);
    } catch (error: any) {
      console.error('Erreur réponse:', error);
      alert(`Erreur: ${error.response?.data?.message || error.message || 'Une erreur est survenue'}`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'accepted') {
      return (
        <span className="px-3 py-1 rounded-full text-sm flex items-center bg-green-100 text-green-700">
          <CheckCircle className="w-4 h-4 mr-1" />
          Acceptée
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="px-3 py-1 rounded-full text-sm flex items-center bg-red-100 text-red-700">
          <XCircle className="w-4 h-4 mr-1" />
          Rejetée
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-sm flex items-center bg-yellow-100 text-yellow-700">
        <Clock className="w-4 h-4 mr-1" />
        En attente
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            {userRole === 'mentore' ? 'Demandes Reçues' : 'Mes Demandes'}
          </h3>
          <p className="text-sm text-gray-500">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={loadRequests}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">
            {userRole === 'mentore' ? 'Aucune demande reçue' : 'Aucune demande envoyée'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request: any, index: number) => {
            const otherUser = userRole === 'mentore' ? request.mentoree : request.mentore;

            return (
              <div key={`${request._id}-${request.status}-${index}`} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                      {getPhotoUrl(otherUser?.photo) ? (
                        <img
                          src={getPhotoUrl(otherUser.photo) || ''}
                          alt={otherUser.name}
                          className="w-16 h-16 object-cover rounded-full"
                        />
                      ) : (
                        <User className="w-8 h-8 text-white" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-800">{otherUser?.name}</h4>
                      <p className="text-purple-600 text-sm font-medium">{otherUser?.profession}</p>

                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p><strong>Ville:</strong> {otherUser?.city}</p>
                        {userRole === 'mentore' && (
                          <>
                            <p><strong>Âge:</strong> {otherUser?.age} ans</p>
                            <p><strong>Niveau:</strong> {otherUser?.level}</p>
                            <p><strong>Centres d'intérêt:</strong> {otherUser?.interests?.join(', ')}</p>
                          </>
                        )}
                        {userRole === 'mentoree' && (
                          <>
                            {otherUser?.expertise && (
                              <p><strong>Expertise:</strong> {otherUser.expertise.join(', ')}</p>
                            )}

                            {otherUser?.availableDays && otherUser.availableDays.length > 0 && (
                              <p><strong>Disponible:</strong> {otherUser.availableDays.join(', ')}</p>
                            )}
                            {otherUser?.startTime && otherUser?.endTime && (
                              <p><strong>Horaires:</strong> {otherUser.startTime} - {otherUser.endTime}</p>
                            )}
                          </>
                        )}
                      </div>

                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700">Message:</p>
                        <p className="text-sm text-gray-600 mt-1">{request.message}</p>
                      </div>

                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    {getStatusBadge(request.status)}

                    {userRole === 'mentore' && request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleResponse(request._id, 'accepted')}
                          disabled={processingRequest === request._id}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                        >
                          {processingRequest === request._id ? 'Traitement...' : 'Accepter'}
                        </button>
                        <button
                          onClick={() => handleResponse(request._id, 'rejected')}
                          disabled={processingRequest === request._id}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50"
                        >
                          {processingRequest === request._id ? 'Traitement...' : 'Rejeter'}
                        </button>
                      </div>
                    )}

                    {request.status === 'accepted' && (
                      <div className="flex space-x-2">
                        {userRole === 'mentore' && (
                          <button
                            onClick={() => setShowCreateSession(request._id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center"
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            Planifier séance
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (otherUser?._id || otherUser?.id) {
                              onNavigateToMessaging(otherUser._id || otherUser.id);
                            }
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Bavarder
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de création de séance */}
      {showCreateSession && (
        <CreateSessionModal
          isOpen={!!showCreateSession}
          onClose={() => setShowCreateSession(null)}
          mentorshipRequestId={showCreateSession}
          mentoreeInfo={{
            name: requests.find(r => r._id === showCreateSession)?.mentoree?.name || 'Mentorée',
            photo: requests.find(r => r._id === showCreateSession)?.mentoree?.photo
          }}
          onSuccess={() => {
            setShowCreateSession(null);
            loadRequests();
          }}
        />
      )}
    </div>
  );
};

export default DynamicMentorshipManager;
