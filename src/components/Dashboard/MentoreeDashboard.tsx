import React, { useState, useEffect } from 'react';
import { Search, Calendar, MessageSquare, User, CheckCircle, Clock, Star, Edit, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import MessageriePage from './MessageriePage';
import NotificationSystem from './NotificationSystem';
import DynamicMentorshipManager from './DynamicMentorshipManager';
import SimpleMentorship from './SimpleMentorship';
import MentorshipRequestForm from './MentorshipRequestForm';
import SessionsManagerMentoree from './SessionsManagerMentoree';
import SessionNotifications from './SessionNotifications';
import TestimonialManager from './TestimonialManager';

// Fonction utilitaire pour corriger les URLs des photos
let photoVersion = Date.now(); // Version globale stable par session
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
          <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
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

const MentoreeDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { currentUser, setCurrentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('find-mentor');
  const [mentores, setMentores] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [stats, setStats] = useState({
    activeMentorships: 0,
    pendingRequests: 0,
    completedSessions: 0,
    totalHours: 0
  });
  const [searchFilters, setSearchFilters] = useState({ search: '', city: '', expertise: '' });
  const [cities, setCities] = useState([]);
  const [expertiseList, setExpertiseList] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const API_URL = 'https://voix-avenir-backend.onrender.com';

  useEffect(() => {
    loadMentors();
    loadFiltersData();
    loadUserProfile();
    loadMySessions();
    loadStats();
  }, [searchFilters]);

  const loadMentors = async () => {
    try {
      const params = new URLSearchParams();
      if (searchFilters.search) params.append('search', searchFilters.search);
      if (searchFilters.city) params.append('city', searchFilters.city);
      if (searchFilters.expertise) params.append('expertise', searchFilters.expertise);
      const res = await fetch(`${API_URL}/api/users?role=mentore&${params.toString()}`);
      if (res.ok) setMentores(await res.json());
    } catch (e) { console.error(e); }
  };

  const loadFiltersData = async () => {
    try {
      const [c, e] = await Promise.all([fetch(`${API_URL}/api/users/cities`), fetch(`${API_URL}/api/users/expertise`)]);
      if (c.ok) setCities(await c.json());
      if (e.ok) setExpertiseList(await e.json());
    } catch (err) { console.error(err); }
  };

  const loadUserProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, { credentials: 'include' });
      if (res.ok) setUserProfile(await res.json());
    } catch (e) { console.error(e); }
  };

  const loadMySessions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sessions`, { credentials: 'include' });
      if (res.ok) setMySessions(await res.json());
    } catch (e) { console.error(e); }
  };

  const loadStats = async () => {
    try {
      const [mRes, sRes] = await Promise.all([
        fetch(`${API_URL}/api/mentorship/sent`, { credentials: 'include' }),
        fetch(`${API_URL}/api/sessions`, { credentials: 'include' })
      ]);
      if (mRes.ok && sRes.ok) {
        const m = await mRes.json();
        const s = await sRes.json();
        const active = m.filter(x => x.status === 'accepted').length;
        const pending = m.filter(x => x.status === 'pending').length;
        const completed = s.filter(x => x.status === 'completed').length;
        const hours = s.filter(x => x.status === 'completed').reduce((acc, curr) => acc + (curr.duration || 60), 0) / 60;
        setStats({ activeMentorships: active, pendingRequests: pending, completedSessions: completed, totalHours: Math.round(hours * 10) / 10 });
      }
    } catch (e) { console.error(e); }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Attention : Cette photo est très lourde (> 5Mo). Le chargement risque d'être lent ou d'échouer sur le serveur gratuit.");
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);
    
    try {
      let finalUser = null;

      // 1. Mettre à jour les champs texte
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include', 
        body: JSON.stringify(userProfile)
      });
      
      if (res.ok) {
        const data = await res.json();
        finalUser = data.user;
      }

      // 2. Mettre à jour la photo si une nouvelle est sélectionnée
      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        const photoRes = await fetch(`${API_URL}/api/users/profile/photo`, {
          method: 'POST', 
          credentials: 'include', 
          body: formData
        });
        if (photoRes.ok) {
          const photoData = await photoRes.json();
          finalUser = photoData.user; // Utiliser l'utilisateur mis à jour avec la nouvelle photo
        }
      }

      if (finalUser) {
        setCurrentUser(finalUser);
        localStorage.setItem('mentora_user', JSON.stringify(finalUser));
        setUserProfile(finalUser);
      }
      
      setIsEditingProfile(false); 
      setPhotoFile(null);
      setPhotoPreview(null);
      photoVersion = Date.now(); // Forcer la mise à jour de la photo partout lors du prochain rendu
      await loadUserProfile();
      alert('Profil mis à jour avec succès !'); 
    } catch (err: any) { 
      console.error(err);
      alert(err.message || 'Une erreur est survenue lors de la mise à jour.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 shadow-md">
              <ProfileImage 
                src={getPhotoUrl(userProfile?.photo || currentUser?.photo)} 
                alt={userProfile?.name || currentUser?.name || 'Profil'} 
                className="w-16 h-16"
                iconSize={8}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de Bord - Mentorée</h1>
              <p className="text-gray-600 font-medium">Bienvenue, <span className="text-purple-600">{currentUser?.name}</span></p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationSystem userId={currentUser?._id || ''} userRole="mentoree" />
            <SessionNotifications userId={currentUser?._id || ''} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg flex items-center transition-transform hover:scale-105">
            <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold">{stats.activeMentorships}</p>
              <p className="text-sm text-gray-500 font-medium">Mentorats actifs</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg flex items-center transition-transform hover:scale-105">
            <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Clock className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold">{stats.pendingRequests}</p>
              <p className="text-sm text-gray-500 font-medium">Demandes en attente</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg flex items-center transition-transform hover:scale-105">
            <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold">{stats.completedSessions}</p>
              <p className="text-sm text-gray-500 font-medium">Séances terminées</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg flex items-center transition-transform hover:scale-105">
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Star className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold">{stats.totalHours}h</p>
              <p className="text-sm text-gray-500 font-medium">Heures cumulées</p>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden border border-gray-100">
          <div className="border-b border-gray-100 bg-gray-50/50 p-2">
            <nav className="flex space-x-2 px-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'find-mentor', icon: Search, label: 'Trouver une Mentore' },
                { id: 'mentorship', icon: CheckCircle, label: 'Mon Mentorat' },
                { id: 'sessions', icon: Calendar, label: 'Mes Séances' },
                { id: 'requests', icon: Clock, label: 'Mes Demandes' },
                { id: 'messagerie', icon: MessageSquare, label: 'Messagerie' },
                { id: 'testimonials', icon: Star, label: 'Témoignages' },
                { id: 'profile', icon: User, label: 'Mon Profil' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white hover:text-purple-600 hover:shadow-sm'
                    }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'find-mentor' && (
              <div className="space-y-6">
                 {/* Recommandations */}
                 {userProfile?.interests?.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl mb-8">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                      <Star className="w-5 h-5 mr-2 text-yellow-300" />
                      Recommandé pour vous
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mentores.filter(m => m.expertise?.some(e => userProfile.interests.some(i => e.toLowerCase().includes(i.toLowerCase())))).slice(0, 2).map(m => (
                        <div key={m.id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                          <div className="flex items-center space-x-3 mb-2">
                            <ProfileImage 
                              src={getPhotoUrl(m.photo)} 
                              alt={m.name} 
                              className="w-12 h-12 rounded-full border-2 border-white/50" 
                              iconSize={6}
                            />
                            <div>
                               <p className="font-bold text-sm">{m.name}</p> 
                               <p className="text-xs text-white/70">{m.profession}</p>
                            </div>
                          </div>
                          <button onClick={() => { setActiveTab('find-mentor'); setShowRequestForm(true); }} className="w-full py-2 bg-white text-purple-600 rounded-lg text-xs font-bold mt-2 hover:bg-purple-50 transition-colors">Contacter</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Rechercher par nom..." value={searchFilters.search} onChange={e => setSearchFilters({ ...searchFilters, search: e.target.value })} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  <select value={searchFilters.city} onChange={e => setSearchFilters({ ...searchFilters, city: e.target.value })} className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="">Toutes les villes</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={searchFilters.expertise} onChange={e => setSearchFilters({ ...searchFilters, expertise: e.target.value })} className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="">Tous les domaines d'expertise</option>
                    {expertiseList.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mentores.map(m => (
                    <div key={m.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                      <div className="flex items-start space-x-4">
                        <ProfileImage 
                          src={getPhotoUrl(m.photo)} 
                          alt={m.name} 
                          className="w-20 h-20 rounded-2xl flex-shrink-0" 
                          iconSize={10}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                             <h3 className="text-lg font-bold group-hover:text-purple-600 transition-colors">{m.name}</h3>
                             <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest bg-gray-100 px-2 py-1 rounded">Mentore</span>
                          </div>
                          <p className="text-purple-600 font-medium text-sm mb-1">{m.profession}</p>
                          <p className="text-xs text-gray-500 mb-4">{m.city}</p>
                          <button onClick={() => { setActiveTab('find-mentor'); setShowRequestForm(true); }} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold w-full hover:bg-purple-700 transition-colors shadow-lg shadow-purple-100">
                            Contacter
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'mentorship' && <div className="bg-white rounded-xl p-6 border border-gray-100"><SimpleMentorship /></div>}
            {activeTab === 'sessions' && <SessionsManagerMentoree sessions={mySessions} onRefresh={loadMySessions} onOpenChat={() => setActiveTab('messagerie')} />}
            {activeTab === 'requests' && <DynamicMentorshipManager userRole="mentoree" onNavigateToMessaging={() => setActiveTab('messagerie')} />}
            {activeTab === 'messagerie' && <div className="h-[600px] border border-gray-100 rounded-xl overflow-hidden shadow-inner"><MessageriePage /></div>}
            {activeTab === 'testimonials' && <TestimonialManager />}
            {activeTab === 'profile' && (
               <div className="max-w-4xl mx-auto py-4">
                 <h3 className="text-2xl font-bold text-gray-800 mb-6">Mon Profil Personnel</h3>
                 {isEditingProfile ? (
                    <form onSubmit={handleUpdateProfile} className="bg-white rounded-2xl p-8 border border-purple-100 shadow-sm space-y-4">
                       <div className="flex items-center space-x-6 mb-6 pb-6 border-b border-gray-100">
                         <div className="relative group">
                           <ProfileImage 
                             src={photoPreview || getPhotoUrl(userProfile?.photo)} 
                             alt="Aperçu" 
                             className="w-24 h-24 rounded-2xl object-cover shadow-md"
                           />
                           <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                             <Camera className="w-8 h-8" />
                             <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                           </label>
                         </div>
                         <div>
                           <h4 className="font-bold text-gray-800">Photo de profil</h4>
                           <p className="text-xs text-gray-500">Cliquez sur l'image pour la modifier</p>
                         </div>
                       </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-1">Nom complet</label>
                           <input value={userProfile?.name || ''} onChange={e => setUserProfile({ ...userProfile, name: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-purple-500 outline-none transition-colors" placeholder="Nom" />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-1">Âge</label>
                           <input type="number" value={userProfile?.age || ''} onChange={e => setUserProfile({ ...userProfile, age: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-purple-500 outline-none transition-colors" placeholder="Âge" />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-1">Ville</label>
                           <input value={userProfile?.city || ''} onChange={e => setUserProfile({ ...userProfile, city: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-purple-500 outline-none transition-colors" placeholder="Ville" />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-1">Niveau d'études / Métier</label>
                           <input value={userProfile?.level || ''} onChange={e => setUserProfile({ ...userProfile, level: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-purple-500 outline-none transition-colors" placeholder="Ex: Étudiante en Droit" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Mes Intérêts (séparés par des virgules)</label>
                        <input value={userProfile?.interests?.join(', ') || ''} onChange={e => setUserProfile({ ...userProfile, interests: e.target.value.split(',').map(it => it.trim()) })} className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-purple-500 outline-none transition-colors" placeholder="Ex: Marketing, IA, Finance" />
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">Ma Bio</label>
                         <textarea value={userProfile?.bio || ''} onChange={e => setUserProfile({ ...userProfile, bio: e.target.value })} className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-purple-500 outline-none transition-colors" rows={5} placeholder="Décrivez-vous..." />
                      </div>
                      <div className="flex space-x-3 pt-4">
                         <button 
                           type="submit" 
                           disabled={isUpdating}
                           className={`flex-1 ${isUpdating ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'} text-white py-3 rounded-xl font-bold shadow-lg transition-all`}
                         >
                           {isUpdating ? (
                             <span className="flex items-center justify-center">
                               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                               Enregistrement...
                             </span>
                           ) : 'Enregistrer les modifications'}
                         </button>
                         <button type="button" onClick={() => { setIsEditingProfile(false); setPhotoFile(null); setPhotoPreview(null); }} className="flex-1 border-2 border-gray-200 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-50">Annuler</button>
                      </div>
                   </form>
                 ) : (
                   <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
                     <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
                        <ProfileImage 
                          src={getPhotoUrl(userProfile?.photo)} 
                          alt={userProfile?.name || 'Profil'} 
                          className="w-32 h-32 rounded-3xl shadow-xl ring-4 ring-purple-50" 
                          iconSize={12}
                        />
                        <div className="flex-1 text-center md:text-left">
                           <h3 className="text-3xl font-black text-gray-800 mb-1">{userProfile?.name}</h3>
                           <p className="text-purple-600 font-bold mb-2 uppercase tracking-widest text-[10px]">VOTRE COMPTE MENTORÉE</p>
                           <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                             <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{userProfile?.age || '?'} ans</span>
                             <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{userProfile?.city || 'Ma ville'}</span>
                             <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-bold">{userProfile?.level || 'Niveau d\'études'}</span>
                           </div>
                           <p className="text-gray-500 mb-4 font-medium bg-gray-50 px-4 py-2 rounded-xl inline-block text-sm">{userProfile?.email}</p>
                           
                           {userProfile?.interests?.length > 0 && (
                             <div className="flex flex-wrap gap-1 mb-4 justify-center md:justify-start">
                               {userProfile.interests.map((it, idx) => (
                                 <span key={idx} className="bg-purple-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">#{it}</span>
                               ))}
                             </div>
                           )}

                           <div className="p-4 bg-purple-50 rounded-2xl italic text-purple-800 text-sm mb-6 border-l-4 border-purple-400">
                             "{userProfile?.bio || "Partagez votre histoire et vos objectifs avec la communauté."}"
                           </div>
                           
                           <button onClick={() => setIsEditingProfile(true)} className="mt-6 flex items-center px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg">
                             <Edit className="w-4 h-4 mr-2" />
                             Modifier mon profil
                           </button>
                        </div>
                     </div>
                   </div>
                 )}
               </div>
            )}
          </div>
        </div>
      </div>

      <MentorshipRequestForm isOpen={showRequestForm} onClose={() => setShowRequestForm(false)} onSuccess={() => { setShowRequestForm(false); loadStats(); setActiveTab('requests'); }} />
    </div>
  );
};

export default MentoreeDashboard;
