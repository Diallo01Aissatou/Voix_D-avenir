import React, { useState, useEffect } from 'react';
import { Search, Bell, Calendar, MessageSquare, User, Settings, CheckCircle, Clock, Star, Plus, Edit, Mail, MapPin } from 'lucide-react';
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

const MentoreeDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
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
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(userProfile)
      });
      if (res.ok) { setIsEditingProfile(false); alert('Profil mis à jour !'); }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        
        {/* Barre de Profil Utilisateur Connecté - TRES VISIBLE */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-purple-100 mb-8 flex flex-col md:flex-row items-center justify-between">
           <div className="flex items-center space-x-6">
              <div className="relative">
                <ProfileImage 
                  src={getPhotoUrl(userProfile?.photo)} 
                  alt={currentUser?.name || 'Moi'} 
                  className="w-24 h-24 rounded-full border-4 border-purple-50 shadow-md" 
                  iconSize={10} 
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-800">Espace de <span className="text-purple-600">{currentUser?.name}</span></h1>
                <div className="flex flex-wrap gap-3 mt-1">
                   <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full"><Mail className="w-3 h-3 mr-1" /> {currentUser?.email}</span>
                   <span className="flex items-center text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full"><MapPin className="w-3 h-3 mr-1" /> {userProfile?.city || 'Ma ville'}</span>
                </div>
              </div>
           </div>
           <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="text-right hidden md:block">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Compte</p>
                 <p className="text-sm font-bold text-purple-600">Mentorée Active</p>
              </div>
              <NotificationSystem userId={currentUser?._id || ''} userRole="mentoree" />
              <SessionNotifications userId={currentUser?._id || ''} />
           </div>
        </div>

        {/* Titre de la page */}
        <div className="mb-8">
           <h2 className="text-3xl font-extrabold text-gray-800 flex items-center">
             <div className="w-2 h-8 bg-purple-600 rounded-full mr-4"></div>
             Mon Tableau de Bord
           </h2>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-lg flex items-center border-b-4 border-purple-500">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-black text-gray-800">{stats.activeMentorships}</p>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-tighter">Mentorats</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg flex items-center border-b-4 border-yellow-400">
            <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600">
              <Clock className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-black text-gray-800">{stats.pendingRequests}</p>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-tighter">Attentes</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg flex items-center border-b-4 border-green-500">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-black text-gray-800">{stats.completedSessions}</p>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-tighter">Séances</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg flex items-center border-b-4 border-blue-500">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <Star className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-black text-gray-800">{stats.totalHours}h</p>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-tighter">Heures</p>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <div className="bg-white rounded-3xl shadow-2xl mb-12 overflow-hidden border border-gray-100">
          <div className="border-b border-gray-100 bg-gray-50/80 p-3">
            <nav className="flex space-x-2 px-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'find-mentor', icon: Search, label: 'Trouver une Mentore' },
                { id: 'mentorship', icon: CheckCircle, label: 'Suivre mon Mentorat' },
                { id: 'sessions', icon: Calendar, label: 'Mes Séances' },
                { id: 'requests', icon: Clock, label: 'Demandes Envoyées' },
                { id: 'messagerie', icon: MessageSquare, label: 'Ma Messagerie' },
                { id: 'testimonials', icon: Star, label: 'Témoignages' },
                { id: 'profile', icon: User, label: 'Mon Profil Complet' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-xl transform -translate-y-1'
                    : 'text-gray-500 hover:bg-white hover:text-purple-600 hover:shadow-md'
                    }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'find-mentor' && (
              <div className="space-y-8">
                 {/* Explication claire */}
                 <div className="bg-purple-50 p-6 rounded-2xl border border-dashed border-purple-200">
                    <h3 className="text-xl font-bold text-purple-900 mb-2 flex items-center"><Search className="w-6 h-6 mr-2" /> Catalogue des Experts</h3>
                    <p className="text-purple-700 font-medium">Ci-dessous, vous trouverez les mentores disponibles que vous pouvez solliciter pour vous accompagner dans votre parcours. Ce ne sont pas vos profils personnels, mais des professionnelles à votre écoute.</p>
                 </div>

                 {/* Recommandations */}
                 {userProfile?.interests?.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                       <Star className="w-32 h-32" />
                    </div>
                    <h3 className="text-2xl font-black mb-6 flex items-center relative z-10">
                      <Star className="w-8 h-8 mr-3 text-yellow-400 animate-pulse" />
                      Sélectionnées pour vous
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                      {mentores.filter(m => m.expertise?.some(e => userProfile.interests.some(i => e.toLowerCase().includes(i.toLowerCase())))).slice(0, 2).map(m => (
                        <div key={m.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all cursor-pointer shadow-lg">
                          <div className="flex items-center space-x-4 mb-4">
                            <ProfileImage 
                              src={getPhotoUrl(m.photo)} 
                              alt={m.name} 
                              className="w-16 h-16 rounded-full border-2 border-white/50 shadow-inner" 
                              iconSize={8}
                            />
                            <div>
                               <p className="font-black text-lg">{m.name}</p> 
                               <p className="text-xs text-purple-200 font-bold uppercase tracking-wider">{m.profession}</p>
                            </div>
                          </div>
                          <button onClick={() => { setActiveTab('find-mentor'); setShowRequestForm(true); }} className="w-full py-3 bg-white text-purple-700 rounded-xl font-black text-sm hover:scale-105 transition-transform active:scale-95 shadow-md">Voir son profil & Contacter</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filtres de recherche */}
                <div className="bg-gray-50 border border-gray-100 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Qui cherchez-vous ?" value={searchFilters.search} onChange={e => setSearchFilters({ ...searchFilters, search: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent border-gray-100 rounded-2xl focus:border-purple-500 outline-none transition-all font-medium" />
                  </div>
                  <select value={searchFilters.city} onChange={e => setSearchFilters({ ...searchFilters, city: e.target.value })} className="px-6 py-4 bg-white border-2 border-transparent border-gray-100 rounded-2xl outline-none focus:border-purple-500 transition-all font-bold text-gray-700">
                    <option value="">Toutes les Villes</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={searchFilters.expertise} onChange={e => setSearchFilters({ ...searchFilters, expertise: e.target.value })} className="px-6 py-4 bg-white border-2 border-transparent border-gray-100 rounded-2xl outline-none focus:border-purple-500 transition-all font-bold text-gray-700">
                    <option value="">Tous les Domaines</option>
                    {expertiseList.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                {/* Liste des Mentores */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {mentores.map(m => (
                    <div key={m.id} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-50 hover:border-purple-200 hover:shadow-2xl transition-all group relative pt-16">
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                         <ProfileImage 
                            src={getPhotoUrl(m.photo)} 
                            alt={m.name} 
                            className="w-24 h-24 rounded-3xl shadow-2xl group-hover:rotate-3 transition-transform duration-300 ring-8 ring-white" 
                            iconSize={12}
                         />
                      </div>
                      <div className="text-center">
                         <div className="inline-block px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">Mentore Experte</div>
                         <h3 className="text-xl font-black text-gray-800 mb-1 group-hover:text-purple-600 transition-colors line-clamp-1">{m.name}</h3>
                         <p className="text-purple-600 font-bold text-sm mb-4">{m.profession}</p>
                         <p className="text-xs text-gray-400 font-medium mb-6 flex items-center justify-center"><MapPin className="w-3 h-3 mr-1" /> {m.city}</p>
                         <button onClick={() => { setActiveTab('find-mentor'); setShowRequestForm(true); }} className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-black text-sm w-full hover:bg-purple-700 hover:shadow-lg active:scale-95 transition-all">
                           Demander à {m.name.split(' ')[0]}
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'mentorship' && <div className="bg-white rounded-3xl p-8 border border-gray-100"><SimpleMentorship /></div>}
            {activeTab === 'sessions' && <SessionsManagerMentoree sessions={mySessions} onRefresh={loadMySessions} onOpenChat={() => setActiveTab('messagerie')} />}
            {activeTab === 'requests' && <DynamicMentorshipManager userRole="mentoree" onNavigateToMessaging={() => setActiveTab('messagerie')} />}
            {activeTab === 'messagerie' && <div className="h-[650px] border border-gray-100 rounded-3xl overflow-hidden shadow-2xl bg-white"><MessageriePage /></div>}
            {activeTab === 'testimonials' && <TestimonialManager />}
            {activeTab === 'profile' && (
               <div className="max-w-4xl mx-auto py-8">
                 <h3 className="text-3xl font-black text-gray-800 mb-8 flex items-center"><User className="w-8 h-8 mr-3 text-purple-600" /> Gestion de Mon Profil</h3>
                 {isEditingProfile ? (
                   <form onSubmit={handleUpdateProfile} className="bg-white rounded-3xl p-10 border border-purple-100 shadow-2xl space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Nom complet</label>
                           <input value={userProfile?.name || ''} onChange={e => setUserProfile({ ...userProfile, name: e.target.value })} className="w-full border-2 border-gray-50 bg-gray-50 p-4 rounded-2xl focus:bg-white focus:border-purple-500 outline-none transition-all font-bold" placeholder="Votre nom" />
                        </div>
                        <div>
                           <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Ville</label>
                           <input value={userProfile?.city || ''} onChange={e => setUserProfile({ ...userProfile, city: e.target.value })} className="w-full border-2 border-gray-50 bg-gray-50 p-4 rounded-2xl focus:bg-white focus:border-purple-500 outline-none transition-all font-bold" placeholder="Ville" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Ma Biographie & Objectifs</label>
                        <textarea value={userProfile?.bio || ''} onChange={e => setUserProfile({ ...userProfile, bio: e.target.value })} className="w-full border-2 border-gray-50 bg-gray-50 p-4 rounded-2xl focus:bg-white focus:border-purple-500 outline-none transition-all font-bold" rows={6} placeholder="Parlez-nous de vous..." />
                     </div>
                     <div className="flex space-x-4 pt-4">
                        <button type="submit" className="flex-1 bg-purple-600 text-white py-4 rounded-2xl font-black hover:bg-purple-700 shadow-xl active:scale-95 transition-all">Enregistrer mon Profil</button>
                        <button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 bg-white border-2 border-gray-200 py-4 rounded-2xl font-black text-gray-500 hover:bg-gray-50 transition-all">Abandonner</button>
                     </div>
                   </form>
                 ) : (
                   <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-2xl overflow-hidden relative">
                     <div className="absolute top-0 right-0 p-8 text-purple-50 opacity-10">
                        <User className="w-64 h-64" />
                     </div>
                     <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-12 relative z-10">
                        <ProfileImage 
                          src={getPhotoUrl(userProfile?.photo)} 
                          alt={userProfile?.name || 'Moi'} 
                          className="w-48 h-48 rounded-3xl shadow-2xl ring-8 ring-purple-50" 
                          iconSize={20}
                        />
                        <div className="flex-1 text-center md:text-left">
                           <div className="inline-block px-4 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Compte Vérifié</div>
                           <h3 className="text-4xl font-black text-gray-800 mb-2">{userProfile?.name}</h3>
                           <p className="text-gray-500 font-bold mb-8 text-lg">{userProfile?.email}</p>
                           
                           <div className="grid grid-cols-2 gap-4 mb-8">
                              <div className="bg-gray-50 p-4 rounded-2xl">
                                 <p className="text-[10px] font-bold text-gray-400 uppercase">Localisation</p>
                                 <p className="font-black text-gray-700">{userProfile?.city || 'N/A'}</p>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-2xl">
                                 <p className="text-[10px] font-bold text-gray-400 uppercase">Âge</p>
                                 <p className="font-black text-gray-700">{userProfile?.age || 'N/A'} ans</p>
                              </div>
                           </div>

                           <div className="p-6 bg-purple-50 rounded-3xl italic text-purple-900 border-l-8 border-purple-400 shadow-inner mb-8">
                             "{userProfile?.bio || "Aucune biographie rédigée. Pourquoi ne pas en ajouter une ?"}"
                           </div>

                           <button onClick={() => setIsEditingProfile(true)} className="px-8 py-4 bg-white border-2 border-purple-600 text-purple-600 font-black rounded-2xl flex items-center hover:bg-purple-600 hover:text-white transition-all shadow-lg active:scale-95 mx-auto md:mx-0">
                             <Edit className="w-6 h-6 mr-2" /> 
                             Mettre à jour mes informations
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
