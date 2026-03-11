import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Video, MapPin, Link, MessageSquare, CheckCircle, XCircle, Edit, Eye, RefreshCw } from 'lucide-react';
import { Session } from '../../types';

interface SessionsManagerMentoreeProps {
  sessions: Session[];
  onRefresh: () => void;
  onOpenChat: (userId: string) => void;
}

const SessionsManagerMentoree: React.FC<SessionsManagerMentoreeProps> = ({ 
  sessions, 
  onRefresh, 
  onOpenChat 
}) => {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmedSessions, setConfirmedSessions] = useState<Set<string>>(new Set());

  const getStatusBadge = (status: string, sessionId: string) => {
    // Si la séance a été confirmée localement, afficher "Confirmée"
    const actualStatus = confirmedSessions.has(sessionId) ? 'confirmed' : status;
    
    const badges = {
      scheduled: { color: 'bg-blue-100 text-blue-700', text: 'À venir', icon: Clock },
      confirmed: { color: 'bg-green-100 text-green-700', text: 'Confirmée', icon: CheckCircle },
      completed: { color: 'bg-gray-100 text-gray-700', text: 'Terminée', icon: CheckCircle },
      canceled: { color: 'bg-red-100 text-red-700', text: 'Annulée', icon: XCircle }
    };
    const badge = badges[actualStatus] || badges.scheduled;
    const Icon = badge.icon;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm flex items-center ${badge.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {badge.text}
      </span>
    );
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'presential': return <MapPin className="w-4 h-4" />;
      default: return <Link className="w-4 h-4" />;
    }
  };

  const handleConfirmPresence = async (sessionId: string) => {
    console.log('=== DEBUT handleConfirmPresence ===');
    console.log('SessionId:', sessionId);
    
    setLoading(true);
    console.log('Loading set to true');
    
    try {
      console.log('Envoi de la requête fetch...');
      const response = await fetch(`http://localhost:5001/api/sessions/${sessionId}/confirm`, {
        method: 'PUT',
        credentials: 'include'
      });
      
      console.log('Réponse reçue:', response.status, response.ok);

      if (response.ok) {
        console.log('Réponse OK - Affichage alerte');
        alert('Présence confirmée avec succès !');
        console.log('Alerte affichée - Appel onRefresh');
        onRefresh();
        console.log('onRefresh appelé');
      } else {
        console.log('Réponse pas OK - Affichage erreur');
        alert('Erreur lors de la confirmation');
      }
    } catch (error) {
      console.log('Erreur catch:', error);
      alert('Erreur de connexion');
    } finally {
      console.log('Finally - Loading set to false');
      setLoading(false);
      console.log('=== FIN handleConfirmPresence ===');
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    if (!confirm('Êtes-vous sûre de vouloir annuler cette séance ?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/sessions/${sessionId}/cancel`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Séance annulée');
        onRefresh();
      } else {
        alert('Erreur lors de l\'annulation');
      }
    } catch (error) {
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Êtes-vous sûre de vouloir supprimer cette séance de l\'historique ?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Séance supprimée de l\'historique');
        onRefresh();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Mes Séances</h3>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Aucune séance planifiée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((session, index) => (
            <div key={`${session._id}-${index}`} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    {session.mentore?.photo ? (
                      <img src={session.mentore.photo} alt={session.mentore.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{session.mentore?.name}</h4>
                    <p className="text-sm text-purple-600">{session.topic}</p>
                  </div>
                </div>
                {getStatusBadge(session.status, session._id)}
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(session.scheduledDate).toLocaleDateString('fr-FR')}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {session.scheduledTime} ({session.duration} min)
                </div>
                <div className="flex items-center">
                  {getModeIcon(session.mode)}
                  <span className="ml-2">
                    {session.mode === 'online' ? 'En ligne' : 
                     session.mode === 'video' ? 'Appel vidéo' : 'Présentiel'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSession(session)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm flex items-center"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Détails
                </button>

                {(session.status === 'scheduled' || session.status === 'confirmed') && (
                  <button
                    onClick={() => {
                      const message = `Bonjour, je souhaiterais reprogrammer notre séance "${session.topic}" prévue le ${new Date(session.scheduledDate).toLocaleDateString('fr-FR')}. Pouvez-vous me proposer d'autres créneaux ?`;
                      onOpenChat(session.mentore._id);
                      // Optionnel: pré-remplir le message
                      setTimeout(() => {
                        const event = new CustomEvent('prefillMessage', {
                          detail: { message }
                        });
                        window.dispatchEvent(event);
                      }, 500);
                    }}
                    className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Reprogrammer
                  </button>
                )}

                {(session.status === 'scheduled' || !session.status) && !confirmedSessions.has(session._id) && (
                  <button
                    onClick={async () => {
                      // Bloquer l'ouverture de nouvelles fenêtres
                      const originalOpen = window.open;
                      window.open = () => null;
                      
                      try {
                        const response = await fetch(`http://localhost:5001/api/sessions/${session._id}/confirm`, {
                          method: 'PUT',
                          credentials: 'include'
                        });
                        if (response.ok) {
                          setConfirmedSessions(prev => new Set([...prev, session._id]));
                          alert('Présence confirmée avec succès !');
                          onRefresh();
                        } else {
                          alert('Erreur lors de la confirmation');
                        }
                      } catch (error) {
                        alert('Erreur de connexion');
                      } finally {
                        // Restaurer window.open
                        window.open = originalOpen;
                      }
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Confirmer
                  </button>
                )}

                {session.meetingLink && (
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center"
                  >
                    <Video className="w-4 h-4 mr-1" />
                    Rejoindre Google Meet
                  </a>
                )}



                {(session.status === 'scheduled' || session.status === 'confirmed') && (
                  <button
                    onClick={() => handleCancelSession(session._id)}
                    disabled={loading}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50"
                  >
                    Annuler
                  </button>
                )}

                {(session.status === 'completed' || session.status === 'canceled' || session.status === 'cancelled') && (
                  <button
                    onClick={() => handleDeleteSession(session._id)}
                    disabled={loading}
                    className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de détails */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Détails de la séance</h3>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  {selectedSession.mentore?.photo ? (
                    <img src={selectedSession.mentore.photo} alt={selectedSession.mentore.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800">{selectedSession.mentore?.name}</h4>
                  <p className="text-purple-600">{selectedSession.mentore?.profession}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                  <p className="text-gray-900">{selectedSession.topic}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  {getStatusBadge(selectedSession.status)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <p className="text-gray-900">{new Date(selectedSession.scheduledDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                  <p className="text-gray-900">{selectedSession.scheduledTime}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
                  <p className="text-gray-900">{selectedSession.duration} minutes</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                  <p className="text-gray-900">
                    {selectedSession.mode === 'online' ? 'En ligne' : 
                     selectedSession.mode === 'video' ? 'Appel vidéo' : 'Présentiel'}
                  </p>
                </div>
              </div>

              {selectedSession.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedSession.description}</p>
                </div>
              )}

              {selectedSession.meetingLink && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lien Google Meet</label>
                  <div className="flex items-center space-x-2">
                    <a
                      href={selectedSession.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <Video className="w-4 h-4 mr-1" />
                      Rejoindre la réunion
                    </a>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedSession.meetingLink)}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200"
                    >
                      Copier
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{selectedSession.meetingLink}</p>
                </div>
              )}
              
              {!selectedSession.meetingLink && selectedSession.status === 'scheduled' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-700">
                    📹 Le lien Google Meet sera automatiquement généré lorsque vous confirmerez votre présence.
                  </p>
                </div>
              )}

              {selectedSession.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedSession.notes}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Messagerie de la séance</label>
                <button
                  onClick={() => {
                    setSelectedSession(null);
                    onOpenChat(selectedSession.mentore._id);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ouvrir la conversation avec {selectedSession.mentore?.name}
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedSession(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Fermer
              </button>
              {selectedSession.status === 'scheduled' && (
                <button
                  onClick={() => {
                    setShowConfirmModal(selectedSession._id);
                    setSelectedSession(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Confirmer ma présence
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Confirmer votre présence</h3>
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Confirmez-vous votre présence à cette séance de mentorat ?
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center">
                  <Video className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Lien Google Meet automatique
                    </p>
                    <p className="text-xs text-blue-600">
                      Un lien de réunion sera généré automatiquement après confirmation
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmModal(null)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleConfirmPresence(showConfirmModal)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  'Génération du lien...'
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Confirmer & Générer Meet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsManagerMentoree;