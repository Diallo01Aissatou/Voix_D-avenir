import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, User, CheckCircle, XCircle, Clock, Plus, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import MessageriePage from './MessageriePage';
import NotificationSystem from './NotificationSystem';
import DynamicMentorshipManager from './DynamicMentorshipManager';
import Api from '../../data/Api';

// Fonction utilitaire pour corriger les URLs des photos
const getPhotoUrl = (photo: string | undefined) => {
  if (!photo) return null;
  if (photo.startsWith('http')) return photo;
  return `https://voix-avenir-backend.onrender.com${photo.startsWith('/') ? photo : '/' + photo}`;
};

interface MentoreDashboardProps {
  onNavigate: (page: string) => void;
}

interface Notification {
  _id: string;
  type: string;
  message: string;
  status: string;
  createdAt: string;
}

interface RequestsManagerProps {
  requests: any[];
  onResponse: (requestId: string, status: 'accepted' | 'rejected') => void;
  onRefresh: () => void;
}

interface UserProfile {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  photo?: string;
  bio?: string;
  city?: string;
  age?: number;
  expertise?: string[];
  interests?: string[];
}

interface MentorshipRequest {
  _id: string;
  mentoree: any;
  message: string;
  status: string;
  createdAt: string;
}

interface Session {
  _id: string;
  mentoree: any;
  topic: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  mode: string;
  meetingLink?: string;
  status: string;
}

interface SessionsManagerMentoreProps {
  sessions: Session[];
  onRefresh: () => void;
  onOpenChat: (userId: string) => void;
}

const MentoreDashboard: React.FC<MentoreDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    rejectedRequests: 0,
    totalSessions: 0,
    totalHours: 0
  });

  useEffect(() => {
    loadRequests();
    loadSessions();
    loadStats();

    // Écouter les mises à jour de mentorat
    const handleMentorshipUpdate = (event: CustomEvent) => {
      console.log('Mise à jour mentorat détectée:', event.detail);
      loadRequests();
      loadSessions();
      loadStats();
    };

    window.addEventListener('mentorshipUpdate', handleMentorshipUpdate as EventListener);

    // Actualiser les données toutes les 30 secondes
    const interval = setInterval(() => {
      loadSessions();
      loadStats();
    }, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mentorshipUpdate', handleMentorshipUpdate as EventListener);
    };
  }, []);

  const loadRequests = async () => {
    try {
      console.log('Chargement des demandes reçues...');
      const response = await Api.get('/mentorship/received');
      console.log('Demandes reçues:', response.data);
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
      setRequests([]);
    }
  };

  const loadSessions = async () => {
    try {
      console.log('Chargement des séances...');
      const response = await Api.get('/sessions');
      console.log('Séances chargées:', response.data);
      setSessions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur chargement séances:', error);
      setSessions([]);
    }
  };

  const loadStats = async () => {
    try {
      const [requestsResponse, sessionsResponse] = await Promise.all([
        Api.get('/mentorship/received'),
        Api.get('/sessions')
      ]);

      const requests = Array.isArray(requestsResponse.data) ? requestsResponse.data : [];
      const sessions = Array.isArray(sessionsResponse.data) ? sessionsResponse.data : [];

      const totalRequests = requests.length;
      const pendingRequests = requests.filter((r: any) => r.status === 'pending').length;
      const acceptedRequests = requests.filter((r: any) => r.status === 'accepted').length;
      const rejectedRequests = requests.filter((r: any) => r.status === 'rejected').length;

      // Calculer les heures réelles basées sur les séances terminées
      const completedSessions = sessions.filter((s: any) => s.status === 'completed');
      const totalHours = completedSessions.reduce((total: number, session: any) => {
        return total + (session.duration || 60); // durée en minutes
      }, 0) / 60; // convertir en heures

      setStats({
        totalRequests,
        pendingRequests,
        acceptedRequests,
        rejectedRequests,
        totalSessions: sessions.length,
        totalHours: Math.round(totalHours * 10) / 10 // arrondir à 1 décimale
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const handleRequestResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      console.log('Réponse à la demande:', requestId, status);
      const response = await Api.put(`/mentorship/respond/${requestId}`, { status });
      console.log('Résultat:', response.data);

      // Émettre un événement pour notifier les autres composants
      const updateEvent = new CustomEvent('mentorshipUpdate', {
        detail: { type: 'response', status, requestId }
      });
      window.dispatchEvent(updateEvent);

      alert(`Demande ${status === 'accepted' ? 'acceptée' : 'rejetée'} avec succès !`);
      loadRequests();
      loadStats();
    } catch (error: any) {
      console.error('Erreur réponse demande:', error);
      const message = (error as any).response?.data?.message || 'Erreur de connexion';
      alert(`Erreur: ${message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de Bord - Mentore</h1>
              <p className="text-gray-600">Bienvenue {currentUser?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationSystem
                userId={currentUser?._id || currentUser?.id}
                userRole={currentUser?.role}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-800">{stats.totalRequests}</p>
                <p className="text-sm text-gray-600">Total demandes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-800">{stats.pendingRequests}</p>
                <p className="text-sm text-gray-600">En attente</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-800">{stats.acceptedRequests}</p>
                <p className="text-sm text-gray-600">Acceptées</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-800">{stats.rejectedRequests || 0}</p>
                <p className="text-sm text-gray-600">Refusées</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-800">{stats.totalHours}h</p>
                <p className="text-sm text-gray-600">Heures de mentorat</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'requests'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Demandes de Mentorat
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'sessions'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Mes Séances
              </button>
              <button
                onClick={() => setActiveTab('messaging')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'messaging'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Messagerie
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'profile'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Profil & Disponibilité
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'requests' && (
              <DynamicMentorshipManager
                userRole="mentore"
                onNavigateToMessaging={(userId) => {
                  setActiveTab('messaging');
                  setTimeout(() => {
                    const messageEvent = new CustomEvent('openConversation', {
                      detail: { userId }
                    });
                    window.dispatchEvent(messageEvent);
                  }, 100);
                }}
              />
            )}

            {activeTab === 'sessions' && (
              <SessionsManagerMentore
                sessions={sessions}
                onRefresh={() => {
                  console.log('onRefresh appelé depuis MentoreDashboard');
                  loadSessions();
                  loadStats();
                }}
                onOpenChat={(userId: string) => {
                  // Basculer vers la messagerie et ouvrir la conversation
                  setActiveTab('messaging');
                  setTimeout(() => {
                    const messageEvent = new CustomEvent('openConversation', {
                      detail: { userId }
                    });
                    window.dispatchEvent(messageEvent);
                  }, 100);
                }}
              />
            )}

            {activeTab === 'messaging' && (
              <div className="h-[600px]">
                <MessageriePage />
              </div>
            )}

            {activeTab === 'profile' && (
              <ProfileManager
                currentUser={currentUser}
                onUpdate={(updatedUser: UserProfile) => {
                  // Mettre à jour le contexte utilisateur si nécessaire
                  console.log('Profil mis à jour:', updatedUser);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour gérer les demandes
const RequestsManager: React.FC<RequestsManagerProps> = ({ requests, onResponse, onRefresh }) => {
  console.log('RequestsManager - Nombre de demandes:', requests.length);
  console.log('RequestsManager - Demandes:', requests);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Demandes de Mentorat Reçues ({requests.length})</h3>
        <button
          onClick={() => {
            if (onRefresh) onRefresh();
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Actualiser
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Aucune demande reçue</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request: MentorshipRequest) => (
            <div key={request._id} className="bg-gray-50 rounded-xl p-6 border">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                    {getPhotoUrl(request.mentoree?.photo) ? (
                      <img
                        src={getPhotoUrl(request.mentoree.photo)!}
                        alt={request.mentoree.name}
                        className="w-16 h-16 object-cover rounded-full"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          console.log('Erreur chargement photo:', getPhotoUrl(request.mentoree.photo));
                          e.currentTarget.src = '';
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">{request.mentoree?.name}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Âge:</strong> {request.mentoree?.age || 'Non spécifié'} ans</p>
                      <p><strong>Ville:</strong> {request.mentoree?.city}</p>
                      <p><strong>Niveau:</strong> {request.mentoree?.level}</p>
                      <p><strong>Centres d'intérêt:</strong> {request.mentoree?.interests?.join(', ')}</p>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">Message:</p>
                      <p className="text-sm text-gray-600 mt-1">{request.message}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Reçue le {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onResponse(request._id, 'accepted')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accepter
                    </button>
                    <button
                      onClick={() => onResponse(request._id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeter
                    </button>
                  </div>
                )}

                {request.status !== 'pending' && (
                  <span className={`px-3 py-1 rounded-full text-sm ${request.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {request.status === 'accepted' ? 'Acceptée' : 'Rejetée'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Composant pour gérer les séances (mentore)
const SessionsManagerMentore: React.FC<SessionsManagerMentoreProps> = ({ sessions, onRefresh, onOpenChat }) => {

  const [showLinkModal, setShowLinkModal] = useState<string | null>(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [editData, setEditData] = useState({ topic: '', date: '', time: '', duration: 60, mode: 'online' });
  const [loading, setLoading] = useState(false);

  const handleModifySession = (session: Session) => {
    console.log('handleModifySession called with:', session);
    const sessionDate = new Date(session.scheduledDate);
    const formattedDate = sessionDate.toISOString().split('T')[0];

    setEditData({
      topic: session.topic || '',
      date: formattedDate,
      time: session.scheduledTime || '14:00',
      duration: session.duration || 60,
      mode: session.mode || 'online'
    });
    setShowEditModal(session._id);
  };

  const saveSessionChanges = async (sessionId: string) => {
    if (!editData.topic.trim() || !editData.date || !editData.time) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    console.log('Sauvegarde des modifications:', {
      sessionId,
      editData
    });

    setLoading(true);
    try {
      const response = await Api.put(`/sessions/${sessionId}/update`, {
        topic: editData.topic.trim(),
        scheduledDate: editData.date,
        scheduledTime: editData.time,
        duration: editData.duration,
        mode: editData.mode
      });

      console.log('Résultat modification:', response.data);
      alert('Séance modifiée avec succès !');
      setShowEditModal(null);
      setTimeout(() => onRefresh(), 100);
    } catch (error: any) {
      console.error('Erreur modification:', error);
      const message = error.response?.data?.message || 'Erreur de connexion';
      alert(`Erreur: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeetingLink = (session: Session) => {
    console.log('handleAddMeetingLink called with:', session);
    setMeetingLink(session.meetingLink || '');
    setShowLinkModal(session._id);
  };

  const saveMeetingLink = async (sessionId: string) => {
    if (!meetingLink.trim()) {
      alert('Veuillez saisir un lien de réunion');
      return;
    }

    setLoading(true);
    try {
      await Api.put(`/sessions/${sessionId}/update`, {
        meetingLink: meetingLink.trim()
      });

      alert('Lien de réunion ajouté avec succès !');
      setShowLinkModal(null);
      setMeetingLink('');
      onRefresh();
    } catch (error: any) {
      console.error('Erreur ajout lien:', error);
      const message = error.response?.data?.message || 'Erreur de connexion';
      alert(`Erreur: ${message}`);
    } finally {
      setLoading(false);
    }
  };



  const handleCompleteSession = async (sessionId: string) => {
    console.log('handleCompleteSession called with:', sessionId);
    if (!confirm('Marquer cette séance comme terminée ?')) return;

    setLoading(true);
    try {
      await Api.put(`/sessions/${sessionId}/complete`);
      alert('Séance marquée comme terminée !');
      onRefresh();
    } catch (error: any) {
      console.error('Erreur completion:', error);
      const message = error.response?.data?.message || 'Erreur de connexion';
      alert(`Erreur: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    console.log('handleCancelSession called with:', sessionId);
    if (!confirm('Êtes-vous sûre de vouloir annuler cette séance ?')) return;

    setLoading(true);
    try {
      await Api.put(`/sessions/${sessionId}/cancel`);
      alert('Séance annulée avec succès !');
      onRefresh();
    } catch (error: any) {
      console.error('Erreur annulation:', error);
      const message = error.response?.data?.message || 'Erreur de connexion';
      alert(`Erreur: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    console.log('handleDeleteSession called with:', sessionId);
    if (!confirm('Êtes-vous sûre de vouloir supprimer cette séance de l\'historique ?')) return;

    setLoading(true);
    try {
      await Api.delete(`/sessions/${sessionId}`);
      alert('Séance supprimée de l\'historique avec succès !');
      onRefresh();
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      const message = error.response?.data?.message || 'Erreur de connexion';
      alert(`Erreur: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Mes Séances Planifiées</h3>
        <button
          onClick={() => {
            console.log('Bouton Actualiser cliqué');
            onRefresh();
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Actualiser
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Aucune séance planifiée</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session: Session, index: number) => (
            <div key={`${session._id}-${Date.now()}-${index}`} className="bg-gray-50 rounded-xl p-6 border">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                    {getPhotoUrl(session.mentoree?.photo) ? (
                      <img
                        src={getPhotoUrl(session.mentoree.photo)!}
                        alt={session.mentoree.name}
                        className="w-16 h-16 object-cover rounded-full"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          console.log('Erreur chargement photo:', getPhotoUrl(session.mentoree.photo));
                          e.currentTarget.src = '';
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">{session.mentoree?.name}</h4>
                    <p className="text-purple-600 text-sm">{session.topic}</p>
                    <div className="text-sm text-gray-600 mt-2">
                      <p><strong>Date:</strong> {new Date(session.scheduledDate).toLocaleDateString('fr-FR')}</p>
                      <p><strong>Heure:</strong> {session.scheduledTime}</p>
                      <p><strong>Durée:</strong> {session.duration} minutes</p>
                      <p><strong>Mode:</strong> {session.mode === 'online' ? 'En ligne' : session.mode === 'video' ? 'Appel vidéo' : session.mode === 'presential' ? 'Présentiel' : session.mode}</p>
                      {session.meetingLink && (
                        <p><strong>Lien:</strong> <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Rejoindre</a></p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${session.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    session.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      session.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                    {session.status === 'scheduled' ? 'Programmée' :
                      session.status === 'confirmed' ? 'Confirmée' :
                        session.status === 'completed' ? 'Terminée' : 'Annulée'}
                  </span>

                  {(session.status === 'scheduled' || session.status === 'confirmed') && (
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => handleModifySession(session)}
                        disabled={loading}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center disabled:opacity-50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleAddMeetingLink(session)}
                        disabled={loading}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter lien
                      </button>
                      <button
                        onClick={() => handleCompleteSession(session._id)}
                        disabled={loading}
                        className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Terminer
                      </button>
                      <button
                        onClick={() => {
                          console.log('Chat button clicked for:', session.mentoree._id);
                          onOpenChat && onOpenChat(session.mentoree._id);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Chat
                      </button>
                      <button
                        onClick={() => handleCancelSession(session._id)}
                        disabled={loading}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50"
                      >
                        Annuler
                      </button>
                    </div>
                  )}

                  {(session.status === 'completed' || session.status === 'cancelled') && (
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => {
                          console.log('Chat button clicked for:', session.mentoree._id);
                          onOpenChat && onOpenChat(session.mentoree._id);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Chat
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session._id)}
                        disabled={loading}
                        className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm disabled:opacity-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}



      {/* Modal pour ajouter un lien */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Ajouter un lien de réunion</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lien de réunion</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowLinkModal(null);
                    setMeetingLink('');
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => saveMeetingLink(showLinkModal)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Sauvegarde...' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour modifier une séance */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Modifier la séance</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
                <input
                  type="text"
                  value={editData.topic}
                  onChange={(e) => setEditData({ ...editData, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={editData.date}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
                  <input
                    type="time"
                    value={editData.time}
                    onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Durée (min)</label>
                  <input
                    type="number"
                    value={editData.duration}
                    onChange={(e) => setEditData({ ...editData, duration: parseInt(e.target.value) || 60 })}
                    min="15"
                    max="180"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                  <select
                    value={editData.mode}
                    onChange={(e) => setEditData({ ...editData, mode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="online">En ligne</option>
                    <option value="video">Appel vidéo</option>
                    <option value="presential">Présentiel</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEditModal(null)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => saveSessionChanges(showEditModal)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour gérer le profil
const ProfileManager = ({ currentUser, onUpdate }) => {
  const [profileData, setProfileData] = useState({
    bio: currentUser?.bio || '',
    expertise: currentUser?.expertise?.join(', ') || '',
    availableDays: currentUser?.availableDays || [],
    startTime: currentUser?.startTime || '09:00',
    endTime: currentUser?.endTime || '17:00'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        bio: currentUser.bio || '',
        expertise: currentUser.expertise?.join(', ') || '',
        availableDays: currentUser.availableDays || [],
        startTime: currentUser.startTime || '09:00',
        endTime: currentUser.endTime || '17:00'
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const expertiseArray = profileData.expertise.split(',').map(e => e.trim()).filter(Boolean);
      console.log('Données à envoyer:', {
        bio: profileData.bio.trim(),
        expertise: expertiseArray,
        availableDays: profileData.availableDays,
        startTime: profileData.startTime,
        endTime: profileData.endTime
      });

      const response = await Api.put('/users/profile', {
        bio: profileData.bio.trim(),
        expertise: expertiseArray,
        availableDays: profileData.availableDays,
        startTime: profileData.startTime,
        endTime: profileData.endTime
      });

      if (response.data) {
        alert('Profil mis à jour avec succès !');
        if (onUpdate) onUpdate(response.data);
      } else {
        alert(`Erreur: Mise à jour échouée`);
      }
    } catch (error) {
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-6">Profil & Disponibilité</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-800 mb-4">Informations Professionnelles</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  placeholder="Décrivez votre expérience..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expertise</label>
                <input
                  type="text"
                  value={profileData.expertise}
                  onChange={(e) => setProfileData({ ...profileData, expertise: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Ex: Leadership, Management..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-800 mb-4">Disponibilités</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jours disponibles</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profileData.availableDays.includes(day)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setProfileData(prev => ({
                            ...prev,
                            availableDays: checked
                              ? [...prev.availableDays, day]
                              : prev.availableDays.filter(d => d !== day)
                          }));
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heures disponibles</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Début</label>
                    <input
                      type="time"
                      value={profileData.startTime}
                      onChange={(e) => setProfileData({ ...profileData, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Fin</label>
                    <input
                      type="time"
                      value={profileData.endTime}
                      onChange={(e) => setProfileData({ ...profileData, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {loading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
        </button>
      </div>
    </div>
  );
};

export default MentoreDashboard;
