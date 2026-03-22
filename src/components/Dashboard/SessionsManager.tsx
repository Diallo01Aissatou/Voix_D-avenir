import React, { useState } from 'react';
import { Calendar, Clock, User, Video, MessageSquare, CheckCircle, XCircle, AlertCircle, FileText, Plus } from 'lucide-react';
import Api, { BASE_URL } from '../../data/Api';

// Fonction utilitaire pour corriger les URLs des photos
const getPhotoUrl = (photo: string | undefined) => {
  if (!photo) return null;
  if (photo.startsWith('http')) return photo;
  return `${BASE_URL}${photo.startsWith('/') ? photo : '/' + photo}`;
};

interface SessionsManagerProps {
  sessions: any[];
  onRefresh: () => void;
  onOpenChat: (userId: string) => void;
  onRequestMentorship: () => void;
}

const SessionsManager: React.FC<SessionsManagerProps> = ({
  sessions,
  onRefresh,
  onOpenChat,
  onRequestMentorship
}) => {
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [confirmingPresence, setConfirmingPresence] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'À venir';
      case 'confirmed': return 'Confirmée';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      case 'pending': return 'En attente';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const confirmPresence = async (sessionId: string) => {
    setConfirmingPresence(sessionId);
    try {
      const response = await Api.put(`/mentorship/sessions/${sessionId}/confirm`);
      if (response.data) {
        alert('Présence confirmée avec succès !');
        onRefresh();
      }
    } catch (error: any) {
      console.error('Erreur confirmation présence:', error);
      alert(`Erreur: ${error.response?.data?.message || 'Une erreur est survenue.'}`);
    } finally {
      setConfirmingPresence(null);
    }
  };

  const cancelSession = async (sessionId: string) => {
    if (!confirm('Êtes-vous sûre de vouloir annuler cette séance ?')) return;

    try {
      const response = await Api.put(`/mentorship/sessions/${sessionId}/cancel`);
      if (response.data) {
        alert('Séance annulée avec succès !');
        onRefresh();
      }
    } catch (error: any) {
      console.error('Erreur annulation séance:', error);
      alert(`Erreur: ${error.response?.data?.message || 'Une erreur est survenue.'}`);
    }
  };

  const SessionCard = ({ session }: { session: any }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
          {getPhotoUrl(session.mentore?.photo) ? (
            <img
              src={getPhotoUrl(session.mentore.photo)!}
              alt={session.mentore.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-white" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-lg font-bold text-gray-800">{session.mentore?.name}</h4>
              <p className="text-purple-600 text-sm font-medium">{session.mentore?.profession}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm flex items-center ${getStatusColor(session.status)}`}>
                {getStatusIcon(session.status)}
                <span className="ml-1">{getStatusText(session.status)}</span>
              </span>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(session.scheduledDate).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              {session.scheduledTime} - Durée: {session.duration || 60} minutes
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2" />
              {session.topic || 'Séance de mentorat personnalisée'}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedSession(session);
                setShowDetails(true);
              }}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Voir détails
            </button>

            {session.status === 'scheduled' && (
              <>
                <button
                  onClick={() => confirmPresence(session._id)}
                  disabled={confirmingPresence === session._id}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                >
                  {confirmingPresence === session._id ? 'Confirmation...' : 'Confirmer présence'}
                </button>
                <button
                  onClick={() => cancelSession(session._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Annuler
                </button>
              </>
            )}

            {session.meetingLink && (session.status === 'scheduled' || session.status === 'confirmed') && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.open(session.meetingLink, '_blank', 'noopener,noreferrer');
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center"
              >
                <Video className="w-4 h-4 mr-1" />
                Rejoindre
              </button>
            )}

            <button
              onClick={() => onOpenChat(session.mentore?._id)}
              className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Contacter
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const SessionDetails = ({ session, onClose }: { session: any, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Détails de la séance</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center overflow-hidden">
                {getPhotoUrl(session.mentore?.photo) ? (
                  <img
                    src={getPhotoUrl(session.mentore.photo)!}
                    alt={session.mentore.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{session.mentore?.name}</h3>
                <p className="text-purple-600 font-medium">{session.mentore?.profession}</p>
                <div className="flex items-center mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm flex items-center ${getStatusColor(session.status)}`}>
                    {getStatusIcon(session.status)}
                    <span className="ml-1">{getStatusText(session.status)}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date et heure</label>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(session.scheduledDate).toLocaleDateString('fr-FR')} à {session.scheduledTime}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {session.duration || 60} minutes
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                  <p className="text-gray-600">{session.topic || 'Séance de mentorat personnalisée'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t">
              {session.status === 'scheduled' && (
                <>
                  <button
                    onClick={() => {
                      confirmPresence(session._id);
                      onClose();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmer présence
                  </button>
                  <button
                    onClick={() => {
                      cancelSession(session._id);
                      onClose();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Annuler séance
                  </button>
                </>
              )}

              {session.meetingLink && (session.status === 'scheduled' || session.status === 'confirmed') && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(session.meetingLink, '_blank', 'noopener,noreferrer');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Rejoindre la séance
                </button>
              )}

              <button
                onClick={() => {
                  onOpenChat(session.mentore?._id);
                  onClose();
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Ouvrir chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Mes Séances de Mentorat</h3>
        <button
          onClick={onRequestMentorship}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Demander un mentorat
        </button>
      </div>

      {sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session) => (
            <SessionCard key={session._id} session={session} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Aucune séance programmée</p>
          <p className="text-sm mb-4">Vos séances de mentorat apparaîtront ici</p>
          <button
            onClick={onRequestMentorship}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Demander une séance
          </button>
        </div>
      )}

      {showDetails && selectedSession && (
        <SessionDetails
          session={selectedSession}
          onClose={() => {
            setShowDetails(false);
            setSelectedSession(null);
          }}
        />
      )}
    </div>
  );
};

export default SessionsManager;
