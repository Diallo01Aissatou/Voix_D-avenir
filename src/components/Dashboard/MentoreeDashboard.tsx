import React, { useState, useEffect } from 'react';
import { Search, Bell, Calendar, MessageSquare, User, Settings, CheckCircle, Clock, Star, Plus, Edit } from 'lucide-react';
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
  return `https://voix-avenir-backend.onrender.com${photo.startsWith('/') ? photo : '/' + photo}`;
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
  const [userProfile, setUserProfile] = useState(null);
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
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de Bord - Mentorée</h1>
            <p className="text-gray-600">Bienvenue {currentUser?.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationSystem userId={currentUser?._id || ''} userRole="mentoree" />
            <SessionNotifications userId={currentUser?._id || ''} />
          </div>
        </div>

        {/* Stats Cards (Même disposition que MentoreDashboard) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg flex items-center">
            <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold">{stats.activeMentorships}</p>
              <p className="text-sm text-gray-500">Mentorats actifs</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg flex items-center">
            <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Clock className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold">{stats.pendingRequests}</p>
              <p className="text-sm text-gray-500">Demandes en attente</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg flex items-center">
            <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold">{stats.completedSessions}</p>
              <p className="text-sm text-gray-500">Séances terminées</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg flex items-center">
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Star className="w-7 h-7" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold">{stats.totalHours}h</p>
              <p className="text-sm text-gray-500">Heures cumulées</p>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs (Même style que MentoreDashboard) */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden border border-gray-100">
          <div className="border-b border-gray-100 bg-gray-50/50 p-2">
            <nav className="flex space-x-2 px-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'find-mentor', icon: Search, label: 'Explorer' },
                { id: 'mentorship', icon: CheckCircle, label: 'Mon Mentorat' },
                { id: 'sessions', icon: Calendar, label: 'Séances' },
                { id: 'requests', icon: Clock, label: 'Mes Demandes' },
                { id: 'messagerie', icon: MessageSquare, label: 'Messagerie' },
                { id: 'testimonials', icon: Star, label: 'Témoignages' },
                { id: 'profile', icon: User, label: 'Profil' }
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
                 {/* Recommandations basées sur les intérêts */}
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
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
                              {m.photo ? <img src={getPhotoUrl(m.photo)!} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-purple-600" />}
                            </div>
                            <div><p className="font-bold text-sm">{m.name}</p> <p className="text-xs text-white/70">{m.profession}</p></div>
                          </div>
                          <button onClick={() => { setActiveTab('find-mentor'); setShowRequestForm(true); }} className="w-full py-2 bg-white text-purple-600 rounded-lg text-xs font-bold mt-2">Voir Profil</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <input type="text" placeholder="Rechercher..." value={searchFilters.search} onChange={e => setSearchFilters({ ...searchFilters, search: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" />
                  <select value={searchFilters.city} onChange={e => setSearchFilters({ ...searchFilters, city: e.target.value })} className="px-4 py-2 border rounded-lg">
                    <option value="">Toutes les villes</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={searchFilters.expertise} onChange={e => setSearchFilters({ ...searchFilters, expertise: e.target.value })} className="px-4 py-2 border rounded-lg">
                    <option value="">Tous les domaines</option>
                    {expertiseList.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mentores.map(m => (
                    <div key={m.id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-all">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          {m.photo ? <img src={getPhotoUrl(m.photo)!} className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-purple-600" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold">{m.name}</h3>
                          <p className="text-purple-600 font-medium text-sm">{m.profession}</p>
                          <button onClick={() => { setActiveTab('find-mentor'); setShowRequestForm(true); }} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm w-full">Contacter</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'mentorship' && <div className="bg-white rounded-xl p-6 border"><SimpleMentorship /></div>}
            {activeTab === 'sessions' && <SessionsManagerMentoree sessions={mySessions} onRefresh={loadMySessions} onOpenChat={() => setActiveTab('messagerie')} />}
            {activeTab === 'requests' && <DynamicMentorshipManager userRole="mentoree" onNavigateToMessaging={() => setActiveTab('messagerie')} />}
            {activeTab === 'messagerie' && <div className="h-[600px]"><MessageriePage /></div>}
            {activeTab === 'testimonials' && <TestimonialManager />}
            {activeTab === 'profile' && (
               <div className="bg-white rounded-xl p-6 border">
                 {isEditingProfile ? (
                   <form onSubmit={handleUpdateProfile} className="space-y-4">
                     <input value={userProfile?.name || ''} onChange={e => setUserProfile({ ...userProfile, name: e.target.value })} className="w-full border p-2 rounded" placeholder="Nom" />
                     <textarea value={userProfile?.bio || ''} onChange={e => setUserProfile({ ...userProfile, bio: e.target.value })} className="w-full border p-2 rounded" rows={4} placeholder="Bio" />
                     <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded font-bold">Sauvegarder</button>
                     <button type="button" onClick={() => setIsEditingProfile(false)} className="w-full border py-2 rounded mt-2">Annuler</button>
                   </form>
                 ) : (
                   <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                           {userProfile?.photo ? <img src={getPhotoUrl(userProfile.photo)!} className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-purple-600" />}
                        </div>
                        <div><h3 className="text-xl font-bold">{userProfile?.name}</h3><p className="text-gray-500">{userProfile?.email}</p></div>
                     </div>
                     <button onClick={() => setIsEditingProfile(true)} className="text-purple-600 font-bold flex items-center"><Edit className="w-4 h-4 mr-1" /> Modifier</button>
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
