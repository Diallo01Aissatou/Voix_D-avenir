import React, { useState, useEffect } from 'react';
import { Bell, Calendar, MessageSquare, User, Settings, CheckCircle, XCircle, Clock, Plus, Edit, Mail, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import MessageriePage from './MessageriePage';
import NotificationSystem from './NotificationSystem';
import DynamicMentorshipManager from './DynamicMentorshipManager';

// Fonction utilitaire pour corriger les URLs des photos
const getPhotoUrl = (photo: string | undefined) => {
  if (!photo) return null;
  if (photo.startsWith('http')) return photo;
  const cleanPath = photo.startsWith('/') ? photo : '/' + photo;
  return `https://voix-avenir-backend.onrender.com${cleanPath}`;
};

const ProfileImage = ({ src, alt, className, iconSize = 8 }: { src: string | null, alt: string, className: string, iconSize?: number }) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className={`${className} bg-purple-100 flex items-center justify-center border border-purple-200`}>
        <User className={`w-${iconSize} h-${iconSize} text-purple-600`} />
      </div>
    );
  }
  return (
    <img src={src} alt={alt} className={`${className} object-cover`} onError={() => setError(true)} />
  );
};

interface MentoreDashboardProps {
  onNavigate: (page: string) => void;
}

const MentoreDashboard: React.FC<MentoreDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    rejectedRequests: 0,
    totalSessions: 0,
    totalHours: 0
  });

  const API_URL = 'https://voix-avenir-backend.onrender.com';

  useEffect(() => {
    loadRequests();
    loadSessions();
    loadStats();
    loadUserProfile();

    const handleMentorshipUpdate = (event: CustomEvent) => {
      loadRequests();
      loadSessions();
      loadStats();
    };

    window.addEventListener('mentorshipUpdate', handleMentorshipUpdate as EventListener);
    const interval = setInterval(() => {
      loadSessions();
      loadStats();
    }, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mentorshipUpdate', handleMentorshipUpdate as EventListener);
    };
  }, []);

  const loadUserProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, { credentials: 'include' });
      if (res.ok) setUserProfile(await res.json());
    } catch (e) { console.error(e); }
  };

  const loadRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mentorship/received`, { credentials: 'include' });
      if (response.ok) setRequests(await response.json());
    } catch (error) { console.error(error); }
  };

  const loadSessions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/sessions`, { credentials: 'include' });
      if (response.ok) setSessions(await response.json());
    } catch (error) { console.error(error); }
  };

  const loadStats = async () => {
    try {
      const [rR, sR] = await Promise.all([
        fetch(`${API_URL}/api/mentorship/received`, { credentials: 'include' }),
        fetch(`${API_URL}/api/sessions`, { credentials: 'include' })
      ]);
      let reqs = rR.ok ? await rR.json() : [];
      let sess = sR.ok ? await sR.json() : [];

      const totalRequests = reqs.length;
      const pendingRequests = reqs.filter(r => r.status === 'pending').length;
      const acceptedRequests = reqs.filter(r => r.status === 'accepted').length;
      const rejectedRequests = reqs.filter(r => r.status === 'rejected').length;
      const totalHours = sess.filter(s => s.status === 'completed').reduce((t, s) => t + (s.duration || 60), 0) / 60;

      setStats({
        totalRequests, pendingRequests, acceptedRequests, rejectedRequests,
        totalSessions: sess.length, totalHours: Math.round(totalHours * 10) / 10
      });
    } catch (error) { console.error(error); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        
        {/* Barre de Profil Mentor Connecté - TRES VISIBLE */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-pink-100 mb-8 flex flex-col md:flex-row items-center justify-between">
           <div className="flex items-center space-x-6">
              <div className="relative">
                <ProfileImage 
                  src={getPhotoUrl(userProfile?.photo)} 
                  alt={currentUser?.name || 'Moi'} 
                  className="w-24 h-24 rounded-full border-4 border-pink-50 shadow-md" 
                  iconSize={10} 
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-800">Espace Mentore de <span className="text-pink-600">{currentUser?.name}</span></h1>
                <div className="flex flex-wrap gap-3 mt-1">
                   <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full"><Mail className="w-3 h-3 mr-1" /> {currentUser?.email}</span>
                   <span className="flex items-center text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full"><MapPin className="w-3 h-3 mr-1" /> {userProfile?.city || 'Ma ville'}</span>
                </div>
              </div>
           </div>
           <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="text-right hidden md:block">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rôle</p>
                 <p className="text-sm font-bold text-pink-600">Experte Voix D'avenir</p>
              </div>
              <NotificationSystem
                userId={currentUser?._id || currentUser?.id}
                userRole={currentUser?.role}
                onNotificationClick={(n) => {
                  if (n.type === 'request') setActiveTab('requests');
                  else if (n.type === 'session') setActiveTab('sessions');
                  else if (n.type === 'message') setActiveTab('messaging');
                }}
              />
           </div>
        </div>

        {/* Titre de la page */}
        <div className="mb-8">
           <h2 className="text-3xl font-extrabold text-gray-800 flex items-center">
             <div className="w-2 h-8 bg-pink-600 rounded-full mr-4"></div>
             Tableau de Bord Mentorat
           </h2>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-b-4 border-blue-500">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-black text-gray-800">{stats.totalRequests}</p>
                <p className="text-xs font-bold text-gray-400 uppercase">Demandes</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-b-4 border-yellow-400">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600">
                <Clock className="w-7 h-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-black text-gray-800">{stats.pendingRequests}</p>
                <p className="text-xs font-bold text-gray-400 uppercase">En attente</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-b-4 border-green-500">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-black text-gray-800">{stats.acceptedRequests}</p>
                <p className="text-xs font-bold text-gray-400 uppercase">Acceptées</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-b-4 border-red-500">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                <XCircle className="w-7 h-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-black text-gray-800">{stats.rejectedRequests}</p>
                <p className="text-xs font-bold text-gray-400 uppercase">Refusées</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-b-4 border-purple-500">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="ml-4">
                <p className="text-3xl font-black text-gray-800">{stats.totalHours}h</p>
                <p className="text-xs font-bold text-gray-400 uppercase">Heures</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-2xl mb-12 overflow-hidden border border-gray-100">
          <div className="border-b border-gray-100 bg-gray-50/80 p-3">
            <nav className="flex space-x-2 px-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'requests', icon: MessageSquare, label: 'Demandes Reçues' },
                { id: 'sessions', icon: Calendar, label: 'Mes Séances' },
                { id: 'messaging', icon: MessageSquare, label: 'Ma Messagerie' },
                { id: 'profile', icon: User, label: 'Mon Profil & Bio' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${activeTab === tab.id
                    ? 'bg-pink-600 text-white shadow-xl transform -translate-y-1'
                    : 'text-gray-500 hover:bg-white hover:text-pink-600 hover:shadow-md whitespace-nowrap'
                    }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'requests' && <DynamicMentorshipManager userRole="mentore" onNavigateToMessaging={() => setActiveTab('messaging')} />}
            {activeTab === 'sessions' && <SessionsManagerMentore sessions={sessions} onRefresh={loadSessions} onOpenChat={() => setActiveTab('messaging')} />}
            {activeTab === 'messaging' && <div className="h-[650px] bg-white rounded-3xl overflow-hidden shadow-inner border border-gray-50"><MessageriePage /></div>}
            {activeTab === 'profile' && <ProfileManager currentUser={currentUser} onUpdate={loadStats} />}
          </div>
        </div>
      </div>
    </div >
  );
};

const SessionsManagerMentore = ({ sessions, onRefresh, onOpenChat }) => {
  const [showLinkModal, setShowLinkModal] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const API_URL = 'https://voix-avenir-backend.onrender.com';

  const handleAction = async (id, action) => {
    if (!confirm(`Confirmer ${action} ?`)) return;
    try { await fetch(`${API_URL}/api/sessions/${id}/${action}`, { method: 'PUT', credentials: 'include' }); onRefresh(); } catch (e) { console.error(e); }
  };

  const saveMeetingLink = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/sessions/${id}/update`, { 
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ meetingLink })
      });
      if (res.ok) { setShowLinkModal(null); onRefresh(); }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-extrabold text-2xl text-gray-800">Vos Séances de Mentorat</h3>
        <button onClick={onRefresh} className="p-2 bg-pink-50 text-pink-600 rounded-xl font-bold hover:bg-pink-100 transition-colors">Actualiser</button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {sessions.map(s => (
          <div key={s._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center hover:shadow-xl transition-all group">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
               <ProfileImage src={getPhotoUrl(s.mentoree?.photo)} alt={s.mentoree?.name || ''} className="w-16 h-16 rounded-2xl border-2 border-pink-50 shadow-inner group-hover:rotate-3 transition-transform" iconSize={8} />
               <div>
                 <p className="font-black text-lg text-gray-800">{s.mentoree?.name}</p>
                 <p className="text-sm font-bold text-pink-600 mb-1">{s.topic}</p>
                 <p className="text-[10px] font-black uppercase text-gray-400 flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(s.scheduledDate).toLocaleDateString()} à {s.scheduledTime}</p>
               </div>
            </div>
            <div className="flex space-x-3 w-full md:w-auto">
              <button onClick={() => { setMeetingLink(s.meetingLink || ''); setShowLinkModal(s._id); }} className="flex-1 md:flex-none px-6 py-3 bg-green-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-green-100 hover:bg-green-600 active:scale-95 transition-all outline-none">Lien Vidéo</button>
              <button onClick={() => handleAction(s._id, 'complete')} className="flex-1 md:flex-none px-6 py-3 bg-pink-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-pink-100 hover:bg-pink-700 active:scale-95 transition-all outline-none">Terminer</button>
              <button onClick={() => onOpenChat()} className="flex-1 md:flex-none px-6 py-3 bg-blue-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-100 hover:bg-blue-600 active:scale-95 transition-all outline-none">Chat</button>
            </div>
          </div>
        ))}
      </div>
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl border border-pink-50 animate-in fade-in zoom-in duration-300">
            <h4 className="font-black text-2xl text-gray-800 mb-2">Lien de Réunion</h4>
            <p className="text-gray-500 text-sm mb-6 font-medium">Ajoutez ou modifiez le lien Google Meet, Zoom ou Teams pour cette séance.</p>
            <input type="url" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} className="w-full border-2 border-gray-50 bg-gray-50 p-4 rounded-2xl mb-8 focus:bg-white focus:border-pink-500 outline-none transition-all font-bold" placeholder="https://meet.google.com/..." />
            <div className="flex space-x-3">
              <button onClick={() => setShowLinkModal(null)} className="flex-1 bg-white border-2 border-gray-100 py-4 rounded-2xl font-black text-gray-500 hover:bg-gray-50 transition-all">Annuler</button>
              <button onClick={() => saveMeetingLink(showLinkModal)} className="flex-1 bg-pink-600 text-white py-4 rounded-2xl font-black shadow-xl hover:shadow-2xl active:scale-95 transition-all">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileManager = ({ currentUser, onUpdate }) => {
  const [profileData, setProfileData] = useState({ bio: currentUser?.bio || '', expertise: currentUser?.expertise?.join(', ') || '' });
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
    <div className="max-w-3xl mx-auto space-y-10 py-6">
      <div className="text-center">
         <h3 className="text-3xl font-black text-gray-800 mb-2">Ma Présentation Publique</h3>
         <p className="text-gray-500 font-medium font-medium">C'est ce que les futures mentorées verront lorsqu'elles chercheront une experte.</p>
      </div>
      <div className="space-y-6">
         <div>
            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Ma Biographie & Mon Histoire</label>
            <textarea value={profileData.bio} onChange={e => setProfileData({ ...profileData, bio: e.target.value })} className="w-full border-2 border-gray-50 bg-gray-50 p-6 rounded-3xl focus:bg-white focus:border-pink-500 outline-none transition-all font-bold shadow-inner" rows={6} placeholder="Parlez de votre parcours professionnel..." />
         </div>
         <div>
            <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Mes Mots-Clés d'Expertise</label>
            <input type="text" value={profileData.expertise} onChange={e => setProfileData({ ...profileData, expertise: e.target.value })} className="w-full border-2 border-gray-50 bg-gray-50 p-6 rounded-3xl focus:bg-white focus:border-pink-500 outline-none transition-all font-bold shadow-inner" placeholder="Pérou, Marketing Digital, Leadership, Finance..." />
            <p className="mt-2 text-[10px] text-gray-400 font-black uppercase tracking-tighter">Séparez vos compétences par des virgules</p>
         </div>
         <button onClick={handleSave} disabled={loading} className="w-full bg-pink-600 text-white py-6 rounded-3xl font-black shadow-2xl hover:bg-pink-700 hover:shadow-pink-100 active:scale-95 transition-all text-lg">{loading ? 'Mise à jour en cours...' : 'Enregistrer ma Présentation'}</button>
      </div>
    </div>
  );
};

export default MentoreDashboard;
