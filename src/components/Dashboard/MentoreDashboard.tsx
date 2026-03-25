import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, User, Clock, CheckCircle, XCircle, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import MessageriePage from './MessageriePage';
import NotificationSystem from './NotificationSystem';
import DynamicMentorshipManager from './DynamicMentorshipManager';

// Fonction utilitaire pour compresser les images
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max = 800;
        if (width > height && width > max) { height *= max / width; width = max; }
        else if (height > max) { width *= max / height; height = max; }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          else resolve(file);
        }, 'image/jpeg', 0.7);
      };
    };
  });
};

// Fonction utilitaire pour corriger les URLs des photos
let photoVersion = Date.now();
const getPhotoUrl = (photo: string | undefined) => {
  if (!photo) return null;
  let url = photo;
  if (!photo.startsWith('http')) {
    const fileName = photo.split('/').pop();
    url = `https://voix-avenir-backend.onrender.com/uploads/${fileName}`;
  }
  return (url.replace('http://', 'https://')) + `?v=${photoVersion}`;
};

// Composant pour l'image de profil avec fallback
const ProfileImage = ({ src, alt, className, iconSize = 8 }: { src: string | null, alt: string, className: string, iconSize?: number }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!src || error) {
    return (
      <div className={`${className} bg-purple-100 flex items-center justify-center`}>
        <User className={`w-${iconSize} h-${iconSize} text-purple-600`} />
      </div>
    );
  }

  return (
    <div className={`${className} relative overflow-hidden flex items-center justify-center`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        className={`${className} object-cover w-full h-full`} 
        onLoad={() => setLoading(false)}
        onError={() => { setError(true); setLoading(false); }} 
      />
    </div>
  );
};

interface MentoreDashboardProps {
  onNavigate: (page: string) => void;
}

const MentoreDashboard: React.FC<MentoreDashboardProps> = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
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

    const handleMentorshipUpdate = () => {
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

  const loadRequests = async () => {
    try {
      const response = await fetch('https://voix-avenir-backend.onrender.com/api/mentorship/received', { credentials: 'include' });
      if (response.ok) setRequests(await response.json());
    } catch (error) { console.error(error); }
  };

  const loadSessions = async () => {
    try {
      const response = await fetch('https://voix-avenir-backend.onrender.com/api/sessions', { credentials: 'include' });
      if (response.ok) setSessions(await response.json());
    } catch (error) { console.error(error); }
  };

  const loadStats = async () => {
    try {
      const [rR, sR] = await Promise.all([
        fetch('https://voix-avenir-backend.onrender.com/api/mentorship/received', { credentials: 'include' }),
        fetch('https://voix-avenir-backend.onrender.com/api/sessions', { credentials: 'include' })
      ]);
      let reqs = rR.ok ? await rR.json() : [];
      let sess = sR.ok ? await sR.json() : [];

      const totalRequests = reqs.length;
      const pendingRequests = reqs.filter((r: any) => r.status === 'pending').length;
      const acceptedRequests = reqs.filter((r: any) => r.status === 'accepted').length;
      const rejectedRequests = reqs.filter((r: any) => r.status === 'rejected').length;
      const totalHours = sess.filter((s: any) => s.status === 'completed').reduce((t: number, s: any) => t + (s.duration || 60), 0) / 60;

      setStats({
        totalRequests, pendingRequests, acceptedRequests, rejectedRequests,
        totalSessions: sess.length, totalHours: Math.round(totalHours * 10) / 10
      });
    } catch (error) { console.error(error); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 shadow-md">
              <ProfileImage 
                src={getPhotoUrl(currentUser?.photo)} 
                alt={currentUser?.name || 'Profil'} 
                className="w-16 h-16"
                iconSize={8}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de Bord - Mentore</h1>
              <p className="text-gray-600">Bienvenue, <span className="text-purple-600 font-bold">{currentUser?.name}</span></p>
            </div>
          </div>
          <NotificationSystem
            userId={(currentUser?._id || currentUser?.id || '') as string}
            userRole={(currentUser?.role || '') as string}
            onNotificationClick={(n) => {
              if (n.type === 'request') setActiveTab('requests');
              else if (n.type === 'session') setActiveTab('sessions');
              else if (n.type === 'message') setActiveTab('messaging');
            }}
          />
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
                { id: 'requests', icon: MessageSquare, label: 'Demandes Reçues' },
                { id: 'sessions', icon: Calendar, label: 'Mes Séances' },
                { id: 'messaging', icon: MessageSquare, label: 'Messagerie' },
                { id: 'profile', icon: User, label: 'Mon Profil & Bio' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white hover:text-purple-600 hover:shadow-sm whitespace-nowrap'
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

const SessionsManagerMentore = ({ sessions, onRefresh, onOpenChat }: { sessions: any[], onRefresh: () => void, onOpenChat: () => void }) => {
  const [showLinkModal, setShowLinkModal] = useState(null);
  const [meetingLink, setMeetingLink] = useState('');
  const API_URL = 'https://voix-avenir-backend.onrender.com';

  const handleAction = async (id: string, action: string) => {
    if (!confirm(`Confirmer ${action} ?`)) return;
    try { await fetch(`${API_URL}/api/sessions/${id}/${action}`, { method: 'PUT', credentials: 'include' }); onRefresh(); } catch (e) { console.error(e); }
  };

  const saveMeetingLink = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/sessions/${id}/update`, { 
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ meetingLink })
      });
      if (res.ok) { setShowLinkModal(null); onRefresh(); }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-xl">Vos Séances de Mentorat</h3><button onClick={onRefresh} className="text-purple-600 font-bold">Actualiser</button></div>
      {sessions.map(s => (
        <div key={s._id} className="bg-gray-50 p-4 rounded-xl border flex justify-between items-center hover:bg-white transition-colors">
          <div className="flex items-center space-x-3">
             <ProfileImage src={getPhotoUrl(s.mentoree?.photo)} alt={s.mentoree?.name || ''} className="w-12 h-12 rounded-full border-2 border-purple-100" iconSize={6} />
             <div><p className="font-bold">{s.mentoree?.name}</p><p className="text-sm text-purple-600">{s.topic}</p><p className="text-xs text-gray-500">{new Date(s.scheduledDate).toLocaleDateString()} à {s.scheduledTime}</p></div>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => { setMeetingLink(s.meetingLink || ''); setShowLinkModal(s._id); }} className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold">Lien</button>
            <button onClick={() => handleAction(s._id, 'complete')} className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold">Terminer</button>
            <button onClick={() => onOpenChat()} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold">Chat</button>
          </div>
        </div>
      ))}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl">
            <h4 className="font-bold mb-4">Lien de la réunion Google Meet / Zoom</h4>
            <input type="url" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} className="w-full border-2 border-gray-100 p-2 rounded-xl mb-4 focus:border-purple-500 outline-none" placeholder="https://..." />
            <div className="flex space-x-2">
              <button onClick={() => setShowLinkModal(null)} className="flex-1 border-2 border-gray-100 py-2 rounded-xl font-bold">Annuler</button>
              <button onClick={() => saveMeetingLink(showLinkModal)} className="flex-1 bg-purple-600 text-white py-2 rounded-xl font-bold">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileManager = ({ currentUser, onUpdate }: { currentUser: any, onUpdate: () => void }) => {
  const { setCurrentUser } = useAuth();
  const [profileData, setProfileData] = useState({ 
    bio: currentUser?.bio || '', 
    expertise: currentUser?.expertise?.join(', ') || '',
    city: currentUser?.city || '',
    profession: currentUser?.profession || ''
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const API_URL = 'https://voix-avenir-backend.onrender.com';

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setPhotoFile(compressed);
      setPhotoPreview(URL.createObjectURL(compressed));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. Text fields
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ ...profileData, expertise: profileData.expertise.split(',').map((e: string) => e.trim()) })
      });

      let finalUser = null;
      if (res.ok) {
        const data = await res.json();
        finalUser = data.user;
      }

      // 2. Photo
      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        const photoRes = await fetch(`${API_URL}/api/users/profile/photo`, {
          method: 'POST', credentials: 'include', body: formData
        });
        if (photoRes.ok) {
          const photoData = await photoRes.json();
          finalUser = photoData.user;
        }
      }

      if (finalUser) { 
        setCurrentUser(finalUser);
        localStorage.setItem('mentora_user', JSON.stringify(finalUser));
        alert('Profil mis à jour !'); 
        setPhotoFile(null);
        setPhotoPreview(null);
        // photoVersion = Date.now(); // This variable is not defined in the provided context, commenting out.
        onUpdate(); 
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h3 className="text-xl font-bold">Modifier mon Profil de Mentore</h3>
      
      <div className="flex items-center space-x-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <div className="relative group">
          <ProfileImage 
            src={photoPreview || getPhotoUrl(currentUser?.photo)} 
            alt="Aperçu" 
            className="w-24 h-24 rounded-2xl shadow-md border-4 border-white"
          />
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
            <Camera className="w-8 h-8" />
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
          </label>
        </div>
        <div>
          <h4 className="font-bold text-gray-800 text-lg">Photo de profil</h4>
          <p className="text-sm text-gray-500">Cliquez sur l'image pour la modifier</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Ville</label>
          <input type="text" value={profileData.city} onChange={e => setProfileData({ ...profileData, city: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-purple-500 outline-none" placeholder="Ville" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Profession</label>
          <input type="text" value={profileData.profession} onChange={e => setProfileData({ ...profileData, profession: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-purple-500 outline-none" placeholder="Ex: Avocate, Médecin..." />
        </div>
      </div>
      <div><label className="block text-sm font-bold text-gray-700 mb-1">Ma Biographie</label><textarea value={profileData.bio} onChange={e => setProfileData({ ...profileData, bio: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-purple-500 outline-none" rows={5} placeholder="Décrivez votre parcours..." /></div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Mes Domaines d'Expertise (séparés par des virgules)</label>
        <input type="text" value={profileData.expertise} onChange={e => setProfileData({ ...profileData, expertise: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-purple-500 outline-none" placeholder="Finance, Leadership, Technologie..." />
      </div>
      <button 
        onClick={handleSave} 
        disabled={loading} 
        className={`w-full ${loading ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'} text-white py-3 rounded-xl font-bold shadow-lg transition-all`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Enregistrement en cours...
          </span>
        ) : 'Enregistrer mon profil'}
      </button>
    </div>
  );
};

export default MentoreDashboard;
