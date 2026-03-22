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

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
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
        setSessions(data);
      } else {
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

      let reqs = [];
      let sess = [];

      if (requestsResponse.ok) reqs = await requestsResponse.json();
      if (sessionsResponse.ok) sess = await sessionsResponse.json();

      const totalRequests = reqs.length;
      const pendingRequests = reqs.filter(r => r.status === 'pending').length;
      const acceptedRequests = reqs.filter(r => r.status === 'accepted').length;
      const rejectedRequests = reqs.filter(r => r.status === 'rejected').length;

      const completedSessions = sess.filter(s => s.status === 'completed');
      const totalHours = completedSessions.reduce((total, session) => {
        return total + (session.duration || 60);
      }, 0) / 60;

      setStats({
        totalRequests,
        pendingRequests,
        acceptedRequests,
        rejectedRequests,
        totalSessions: sess.length,
        totalHours: Math.round(totalHours * 10) / 10
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const loadNotifications = async () => {
    setNotifications([
      { id: 1, type: 'request', message: 'Nouvelle demande de mentorat', time: '5 min' },
      { id: 2, type: 'session', message: 'Séance dans 1 heure', time: '1h' }
    ]);
  };

  const handleRequestResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`https://voix-avenir-backend.onrender.com/api/mentorship/respond/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        window.dispatchEvent(new CustomEvent('mentorshipUpdate', {
          detail: { type: 'response', status, requestId }
        }));
        alert(`Demande ${status === 'accepted' ? 'acceptée' : 'rejetée'} avec succès !`);
        loadRequests();
        loadStats();
      }
    } catch (error) {
      console.error('Erreur réponse demande:', error);
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
                  if (notification.type === 'request') setActiveTab('requests');
                  else if (notification.type === 'session') setActiveTab('sessions');
                  else if (notification.type === 'message') setActiveTab('messaging');
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="stat-card-enhanced bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold">{stats.totalRequests}</p>
                <p className="text-sm text-gray-500">Total demandes</p>
              </div>
            </div>
          </div>
          <div className="stat-card-enhanced bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Clock className="w-7 h-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold">{stats.pendingRequests}</p>
                <p className="text-sm text-gray-500">En attente</p>
              </div>
            </div>
          </div>
          <div className="stat-card-enhanced bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold">{stats.acceptedRequests}</p>
                <p className="text-sm text-gray-500">Acceptées</p>
              </div>
            </div>
          </div>
          <div className="stat-card-enhanced bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <XCircle className="w-7 h-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold">{stats.rejectedRequests}</p>
                <p className="text-sm text-gray-500">Refusées</p>
              </div>
            </div>
          </div>
          <div className="stat-card-enhanced bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-bold">{stats.totalHours}h</p>
                <p className="text-sm text-gray-500">Heures</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden border border-gray-100">
          <div className="border-b border-gray-100 bg-gray-50/50 p-2">
            <nav className="flex space-x-2 px-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'requests', icon: MessageSquare, label: 'Demandes' },
                { id: 'sessions', icon: Calendar, label: 'Séances' },
                { id: 'messaging', icon: MessageSquare, label: 'Messagerie' },
                { id: 'profile', icon: User, label: 'Profil' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-white hover:text-purple-600'
                    }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'requests' && <DynamicMentorshipManager userRole="mentore" onNavigateToMessaging={() => setActiveTab('messaging')} />}
            {activeTab === 'sessions' && <SessionsManagerMentore sessions={sessions} onRefresh={loadSessions} onOpenChat={() => setActiveTab('messaging')} />}
            {activeTab === 'messaging' && <div className="h-[600px]"><MessageriePage /></div>}
            {activeTab === 'profile' && <ProfileManager currentUser={currentUser} onUpdate={loadStats} />}
          </div>
        </div>
      </div>
    </div >
  );
};

// --- Sous-composants ---
// (J'inclus ici les versions simplifiées pour le moment car ce qui compte est le layout original à onglets)

const SessionsManagerMentore = ({ sessions, onRefresh, onOpenChat }) => {
  const [showLinkModal, setShowLinkModal] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [showEditModal, setShowEditModal] = useState(null);
  const [editData, setEditData] = useState({ topic: '', date: '', time: '', duration: 60 });
  const [loading, setLoading] = useState(false);
  const API_URL = 'https://voix-avenir-backend.onrender.com';

  const handleAction = async (id, action) => {
    if (!confirm(`Confirmer ${action} ?`)) return;
    try { await fetch(`${API_URL}/api/sessions/${id}/${action}`, { method: 'PUT', credentials: 'include' }); onRefresh(); } catch (e) { console.error(e); }
  };

  const saveMeetingLink = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/sessions/${id}/update`, { 
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ meetingLink })
      });
      if (res.ok) { setShowLinkModal(null); onRefresh(); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-xl">Vos Séances</h3>
        <button onClick={onRefresh} className="text-purple-600 font-bold">Actualiser</button>
      </div>
      {sessions.map(s => (
        <div key={s._id} className="bg-gray-50 p-4 rounded-xl border flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                {s.mentoree?.photo ? <img src={getPhotoUrl(s.mentoree.photo)!} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-purple-600" />}
             </div>
             <div>
                <p className="font-bold">{s.mentoree?.name}</p>
                <p className="text-sm text-purple-600">{s.topic}</p>
                <p className="text-xs text-gray-500">{new Date(s.scheduledDate).toLocaleDateString()} à {s.scheduledTime}</p>
             </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => { setMeetingLink(s.meetingLink || ''); setShowLinkModal(s._id); }} className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs">Lien</button>
            <button onClick={() => handleAction(s._id, 'complete')} className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs">Terminer</button>
            <button onClick={() => onOpenChat()} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs text-nowrap">Chat</button>
          </div>
        </div>
      ))}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h4 className="font-bold mb-4">Lien de réunion</h4>
            <input type="url" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} className="w-full border p-2 rounded mb-4" />
            <div className="flex space-x-2">
              <button onClick={() => setShowLinkModal(null)} className="flex-1 border py-2 rounded">Annuler</button>
              <button onClick={() => saveMeetingLink(showLinkModal)} className="flex-1 bg-purple-600 text-white py-2 rounded">Sauver</button>
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
    expertise: currentUser?.expertise?.join(', ') || ''
  });
  const [loading, setLoading] = useState(false);
  const API_URL = 'https://voix-avenir-backend.onrender.com';

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ ...profileData, expertise: profileData.expertise.split(',').map(e => e.trim()) })
      });
      if (res.ok) { alert('Profil mis à jour !'); onUpdate(); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Profil & Disponibilité</h3>
      <textarea value={profileData.bio} onChange={e => setProfileData({ ...profileData, bio: e.target.value })} className="w-full border p-2 rounded" rows={4} placeholder="Bio..." />
      <input type="text" value={profileData.expertise} onChange={e => setProfileData({ ...profileData, expertise: e.target.value })} className="w-full border p-2 rounded" placeholder="Expertises..." />
      <button onClick={handleSave} disabled={loading} className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold">Sauvegarder</button>
    </div>
  );
};

export default MentoreDashboard;
