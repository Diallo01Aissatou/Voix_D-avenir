import React, { useState, useEffect } from 'react';
import { Bell, Calendar, MessageSquare, User, Settings, CheckCircle, XCircle, Clock, Plus, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import MessageriePage from './MessageriePage';
import NotificationSystem from './NotificationSystem';
import DynamicMentorshipManager from './DynamicMentorshipManager';

// Fonction utilitaire pour corriger les URLs des photos
const getPhotoUrl = (photo: string | undefined) => {
  if (!photo) return null;
  if (photo.startsWith('http')) return photo;
  return `https://voix-avenir-backend.onrender.com${photo.startsWith('/') ? photo : '/' + photo}`;
};

interface MentoreDashboardProps {
  onNavigate: (page: string) => void;
}

const MentoreDashboard: React.FC<MentoreDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    rejectedRequests: 0,
    totalSessions: 0,
    totalHours: 0
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadRequests();
    loadSessions();
    loadStats();
    loadNotifications();

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
      const response = await fetch('https://voix-avenir-backend.onrender.com/api/mentorship/received', {
        credentials: 'include'
      });

      console.log('Réponse API demandes:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Demandes reçues:', data);
        console.log('Nombre de demandes:', data.length);
        setRequests(data);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur serveur' }));
        console.error('Erreur API demandes:', response.status, errorData);
        setRequests([]);
      }
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
      setRequests([]);
    }
  };

  const loadSessions = async () => {
    try {
      console.log('Chargement des séances...');
      const response = await fetch('https://voix-avenir-backend.onrender.com/api/sessions', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Séances chargées:', data);
        setSessions(data);
      } else {
        console.error('Erreur API séances:', response.status);
        setSessions([]);
      }
    } catch (error) {
      console.error('Erreur chargement séances:', error);
      setSessions([]);
    }
  };

  const loadStats = async () => {
    try {
      const [requestsResponse, sessionsResponse] = await Promise.all([
        fetch('https://voix-avenir-backend.onrender.com/api/mentorship/received', { credentials: 'include' }),
        fetch('https://voix-avenir-backend.onrender.com/api/sessions', { credentials: 'include' })
      ]);

      let requests = [];
      let sessions = [];

      if (requestsResponse.ok) {
        requests = await requestsResponse.json();
      }
      if (sessionsResponse.ok) {
        sessions = await sessionsResponse.json();
      }

      const totalRequests = requests.length;
      const pendingRequests = requests.filter(r => r.status === 'pending').length;
      const acceptedRequests = requests.filter(r => r.status === 'accepted').length;
      const rejectedRequests = requests.filter(r => r.status === 'rejected').length;

      // Calculer les heures réelles basées sur les séances terminées
      const completedSessions = sessions.filter(s => s.status === 'completed');
      const totalHours = completedSessions.reduce((total, session) => {
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

  const loadNotifications = async () => {
    // Simuler des notifications
    setNotifications([
      { id: 1, type: 'request', message: 'Nouvelle demande de mentorat', time: '5 min' },
      { id: 2, type: 'session', message: 'Séance dans 1 heure', time: '1h' }
    ]);
  };

  const handleRequestResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      console.log('Réponse à la demande:', requestId, status);

      const response = await fetch(`https://voix-avenir-backend.onrender.com/api/mentorship/respond/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      console.log('Réponse API:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Résultat:', result);

        // Émettre un événement pour notifier les autres composants
        const updateEvent = new CustomEvent('mentorshipUpdate', {
          detail: { type: 'response', status, requestId }
        });
        window.dispatchEvent(updateEvent);

        alert(`Demande ${status === 'accepted' ? 'acceptée' : 'rejetée'} avec succès !`);
        loadRequests();
        loadStats();
      } else {
        const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
        console.error('Erreur API:', error);
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur réponse demande:', error);
      alert('Erreur de connexion');
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
                onNotificationClick={(notification) => {
                  if (notification.type === 'request') {
                    setActiveTab('requests');
                    loadRequests();
                  } else if (notification.type === 'session') {
                    setActiveTab('sessions');
                    loadSessions();
                  } else if (notification.type === 'message') {
                    setActiveTab('messaging');
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="stat-card-enhanced bg-white rounded-2xl p-6 shadow-lg animate-fade-in-up animate-delay-100 gpu-accelerated will-change-all">
            <div className="decorative-circle absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-bl-full -mr-4 -mt-4"></div>
            <div className="flex items-center relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 icon-scale-hover">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold gradient-text">{stats.totalRequests}</p>
                <p className="text-sm text-gray-500 font-medium">Total demandes</p>
              </div>
            </div>
          </div>

          <div className="stat-card-enhanced bg-white rounded-2xl p-6 shadow-lg animate-fade-in-up animate-delay-200 gpu-accelerated will-change-all">
            <div className="decorative-circle absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-bl-full -mr-4 -mt-4"></div>
            <div className="flex items-center relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-yellow-200 icon-scale-hover">
                <Clock className="w-7 h-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold gradient-text">{stats.pendingRequests}</p>
                <p className="text-sm text-gray-500 font-medium">En attente</p>
              </div>
            </div>
          </div>

          <div className="stat-card-enhanced bg-white rounded-2xl p-6 shadow-lg animate-fade-in-up animate-delay-300 gpu-accelerated will-change-all">
            <div className="decorative-circle absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-green-100 to-green-50 rounded-bl-full -mr-4 -mt-4"></div>
            <div className="flex items-center relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200 icon-scale-hover">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold gradient-text">{stats.acceptedRequests}</p>
                <p className="text-sm text-gray-500 font-medium">Acceptées</p>
              </div>
            </div>
          </div>

          <div className="stat-card-enhanced bg-white rounded-2xl p-6 shadow-lg animate-fade-in-up animate-delay-400 gpu-accelerated will-change-all">
            <div className="decorative-circle absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-bl-full -mr-4 -mt-4"></div>
            <div className="flex items-center relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200 icon-scale-hover">
                <XCircle className="w-7 h-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold gradient-text">{stats.rejectedRequests || 0}</p>
                <p className="text-sm text-gray-500 font-medium">Refusées</p>
              </div>
            </div>
          </div>

          <div className="stat-card-enhanced bg-white rounded-2xl p-6 shadow-lg animate-fade-in-up animate-delay-500 gpu-accelerated will-change-all">
            <div className="decorative-circle absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-50 rounded-bl-full -mr-4 -mt-4"></div>
            <div className="flex items-center relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-200 icon-scale-hover">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold gradient-text">{stats.totalHours}h</p>
                <p className="text-sm text-gray-500 font-medium">Heures de mentorat</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden border border-gray-100">
          <div className="border-b border-gray-100 bg-gray-50/50 p-2">
            <nav className="flex space-x-2 px-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'requests', icon: MessageSquare, label: 'Demandes de Mentorat' },
                { id: 'sessions', icon: Calendar, label: 'Mes Séances' },
                { id: 'messaging', icon: MessageSquare, label: 'Messagerie' },
                { id: 'profile', icon: User, label: 'Profil & Disponibilité' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                    : 'text-gray-600 hover:bg-white hover:text-purple-600 hover:shadow-sm'
                    }`}
                >
                  <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'animate-bounce' : ''}`} />
                  {tab.label}
                </button>
              ))}
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
                onOpenChat={(userId) => {
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
                onUpdate={(updatedUser) => {
                  // Mettre à jour le contexte utilisateur si nécessaire
                  console.log('Profil mis à jour:', updatedUser);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

// Composant pour gérer les demandes
const RequestsManager = ({ requests, onResponse, onRefresh }) => {
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
          {requests.map((request) => (
            <div key={request._id} className="bg-gray-50 rounded-xl p-6 border">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                    {getPhotoUrl(request.mentoree?.photo) ? (
                      <img
                        src={getPhotoUrl(request.mentoree.photo)}
                        alt={request.mentoree.name}
                        className="w-16 h-16 object-cover rounded-full"
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
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onResponse(request._id, 'accepted')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Accepter
                    </button>
                    <button
                      onClick={() => onResponse(request._id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Rejeter
                    </button>
                  </div>
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
const SessionsManagerMentore = ({ sessions, onRefresh, onOpenChat }) => {
  const [showLinkModal, setShowLinkModal] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [showEditModal, setShowEditModal] = useState(null);
  const [editData, setEditData] = useState({ topic: '', date: '', time: '', duration: 60, mode: 'online' });
  const [loading, setLoading] = useState(false);

  const handleModifySession = (session) => {
    const sessionDate = new Date(session.scheduledDate);
    setEditData({
      topic: session.topic || '',
      date: sessionDate.toISOString().split('T')[0],
      time: session.scheduledTime || '14:00',
      duration: session.duration || 60,
      mode: session.mode || 'online'
    });
    setShowEditModal(session._id);
  };

  const saveSessionChanges = async (sessionId) => {
    setLoading(true);
    try {
      const response = await fetch(`https://voix-avenir-backend.onrender.com/api/sessions/${sessionId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          topic: editData.topic.trim(),
          scheduledDate: editData.date,
          scheduledTime: editData.time,
          duration: editData.duration,
          mode: editData.mode
        })
      });
      if (response.ok) {
        alert('Séance modifiée !');
        setShowEditModal(null);
        onRefresh();
      }
    } catch (error) {
      console.error('Erreur modification:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveMeetingLink = async (sessionId) => {
    setLoading(true);
    try {
      const response = await fetch(`https://voix-avenir-backend.onrender.com/api/sessions/${sessionId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ meetingLink: meetingLink.trim() })
      });
      if (response.ok) {
        alert('Lien ajouté !');
        setShowLinkModal(null);
        setMeetingLink('');
        onRefresh();
      }
    } catch (error) {
      console.error('Erreur lien:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSession = async (sessionId) => {
    if (!confirm('Terminer cette séance ?')) return;
    try {
      await fetch(`https://voix-avenir-backend.onrender.com/api/sessions/${sessionId}/complete`, {
        method: 'PUT',
        credentials: 'include'
      });
      onRefresh();
    } catch (error) {
      console.error('Erreur completion:', error);
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (!confirm('Annuler cette séance ?')) return;
    try {
      await fetch(`https://voix-avenir-backend.onrender.com/api/sessions/${sessionId}/cancel`, {
        method: 'PUT',
        credentials: 'include'
      });
      onRefresh();
    } catch (error) {
      console.error('Erreur annulation:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Vos Séances</h3>
        <button onClick={onRefresh} className="text-purple-600 font-bold">Actualiser</button>
      </div>
      {sessions.map(session => (
        <div key={session._id} className="bg-gray-50 p-4 rounded-xl border">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                {session.mentoree?.photo ? (
                  <img src={getPhotoUrl(session.mentoree.photo)} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-purple-600" />
                )}
              </div>
              <div>
                <p className="font-bold">{session.mentoree?.name}</p>
                <p className="text-sm text-purple-600">{session.topic}</p>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(session.scheduledDate).toLocaleDateString()} à {session.scheduledTime}
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <button onClick={() => handleModifySession(session)} className="text-xs bg-blue-600 text-white px-3 py-1 rounded">Modifier</button>
              <button onClick={() => {setShowLinkModal(session._id); setMeetingLink(session.meetingLink || '');}} className="text-xs bg-green-600 text-white px-3 py-1 rounded">Lien</button>
              <button onClick={() => handleCompleteSession(session._id)} className="text-xs bg-purple-600 text-white px-3 py-1 rounded">Terminer</button>
              <button onClick={() => handleCancelSession(session._id)} className="text-xs bg-red-600 text-white px-3 py-1 rounded">Annuler</button>
            </div>
          </div>
        </div>
      ))}

      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h4 className="font-bold mb-4">Lien de réunion</h4>
            <input type="url" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} className="w-full border p-2 rounded mb-4" />
            <div className="flex space-x-2">
              <button onClick={() => setShowLinkModal(null)} className="flex-1 border py-2 rounded">Fermer</button>
              <button onClick={() => saveMeetingLink(showLinkModal)} className="flex-1 bg-purple-600 text-white py-2 rounded">Sauver</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h4 className="font-bold mb-4">Modifier Séance</h4>
            <div className="space-y-4">
               <div><label className="text-sm">Sujet</label><input type="text" value={editData.topic} onChange={e => setEditData({...editData, topic: e.target.value})} className="w-full border p-2 rounded" /></div>
               <div className="grid grid-cols-2 gap-2">
                 <div><label className="text-sm">Date</label><input type="date" value={editData.date} onChange={e => setEditData({...editData, date: e.target.value})} className="w-full border p-2 rounded" /></div>
                 <div><label className="text-sm">Heure</label><input type="time" value={editData.time} onChange={e => setEditData({...editData, time: e.target.value})} className="w-full border p-2 rounded" /></div>
               </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <button onClick={() => setShowEditModal(null)} className="flex-1 border py-2 rounded">Fermer</button>
              <button onClick={() => saveSessionChanges(showEditModal)} className="flex-1 bg-purple-600 text-white py-2 rounded">Sauver</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileManager = ({ currentUser, onUpdate }) => {
  const [profileData, setProfileData] = useState({
    bio: currentUser?.bio || '',
    expertise: currentUser?.expertise?.join(', ') || '',
    availableDays: currentUser?.availableDays || [],
    startTime: currentUser?.startTime || '09:00',
    endTime: currentUser?.endTime || '17:00'
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://voix-avenir-backend.onrender.com/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...profileData,
          expertise: profileData.expertise.split(',').map(e => e.trim())
        })
      });
      if (response.ok) {
        alert('Profil à jour !');
        if (onUpdate) onUpdate(await response.json());
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-xl">Profil & Disponibilité</h3>
      <div className="bg-gray-50 p-6 rounded-xl border space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1">Votre Bio</label>
          <textarea value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="w-full border p-2 rounded" rows={3} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Expertises (séparées par virgules)</label>
          <input type="text" value={profileData.expertise} onChange={e => setProfileData({...profileData, expertise: e.target.value})} className="w-full border p-2 rounded" />
        </div>
        <button onClick={handleSave} disabled={loading} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold">Sauvegarder</button>
      </div>
    </div>
  );
};

export default MentoreDashboard;
