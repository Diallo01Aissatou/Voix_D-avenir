import React, { useState, useEffect, useCallback } from 'react';
import { Search, MessageSquare, User as UserIcon, BookOpen, Calendar, Edit, Plus, X, Clock, CheckCircle } from 'lucide-react';
import Api, { BASE_URL } from '../../data/Api';
import { useAuth } from '../../contexts/AuthContext';
import NotificationSystem from './NotificationSystem';
import SessionsManagerMentoree from './SessionsManagerMentoree';
import SessionNotifications from './SessionNotifications';
import TestimonialManager from './TestimonialManager';
import MessageriePage from './MessageriePage';
import MentorshipTest from './MentorshipTest';
import DynamicMentorshipManager from './DynamicMentorshipManager';
import SimpleMentorship from './SimpleMentorship';
import MentorshipRequestForm from './MentorshipRequestForm';

// Fonction utilitaire pour corriger les URLs des photos
const getPhotoUrl = (photo: string | undefined) => {
  if (!photo) return null;
  if (photo.startsWith('http')) return photo;
  return `${BASE_URL}${photo.startsWith('/') ? photo : '/' + photo}`;
};

interface UserProfile {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: 'mentoree' | 'mentore' | 'admin';
  photo?: string;
  age?: number;
  city?: string;
  level?: string;
  interests?: string[];
  bio?: string;
  expertise?: string[];
  profession?: string;
  education?: string;
}

interface MentorshipRequest {
  _id: string;
  mentore: UserProfile;
  mentoree: UserProfile;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  _id: string;
  mentore: UserProfile;
  mentoree: UserProfile;
  topic?: string;
  date?: string;
  time?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'canceled';
  meetingLink?: string;
  mode?: string;
  createdAt?: string;
  updatedAt?: string;
}

// interface Message removed

interface PhotoDisplayProps {
  photo: string | undefined;
}

const PhotoDisplay: React.FC<PhotoDisplayProps> = ({ photo }) => {
  const [currentPhoto, setCurrentPhoto] = useState(photo);

  useEffect(() => {
    setCurrentPhoto(photo);
  }, [photo]);

  return (
    <div className="w-full h-full rounded-full border-4 border-white shadow-lg overflow-hidden bg-purple-100 flex items-center justify-center">
      {currentPhoto ? (
        <img
          src={getPhotoUrl(currentPhoto)!}
          alt="Profil"
          className="w-full h-full object-cover"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.src = '';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-purple-100"><svg class="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>';
            }
          }}
        />
      ) : (
        <UserIcon className="w-12 h-12 text-purple-600" />
      )}
    </div>
  );
};

interface ProfileEditFormProps {
  profile: UserProfile | null;
  onSave: (profile: Partial<UserProfile>) => void;
  onCancel: () => void;
  cities: string[];
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ profile, onSave, onCancel, cities }) => {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    age: profile?.age || '',
    city: profile?.city || '',
    level: profile?.level || '',
    interests: profile?.interests?.join(', ') || '',
    bio: profile?.bio || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      age: formData.age ? Number(formData.age) : undefined,
      interests: formData.interests.split(',').map(i => i.trim()).filter(i => i !== '')
    } as any);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Âge</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            min="13"
            max="100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
          <select
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Sélectionnez votre ville</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Niveau d'éducation</label>
          <input
            type="text"
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="Ex: Licence en Informatique"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Centres d'intérêt</label>
        <input
          type="text"
          value={formData.interests}
          onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
          placeholder="Ex: Technologie, Art, Sport... (séparés par des virgules)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Biographie</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={4}
          placeholder="Parlez-nous de vous..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
        />
      </div>
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Sauvegarder
        </button>
      </div>
    </form>
  );
};

interface MentoreeDashboardProps {
  onNavigate: (page: string) => void;
}

const MentoreeDashboard: React.FC<MentoreeDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('find-mentor');
  const [mentores, setMentores] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState({
    activeMentorships: 0,
    pendingRequests: 0,
    completedSessions: 0,
    totalHours: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    search: '',
    city: '',
    expertise: ''
  });
  const [cities, setCities] = useState<string[]>([]);
  const [expertiseList, setExpertiseList] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedMentorForRequest, setSelectedMentorForRequest] = useState<UserProfile | null>(null);

  // loadRequests removed

  const loadStats = useCallback(async () => {
    try {
      const [sentResponse, receivedResponse, sessionsResponse] = await Promise.all([
        Api.get('/mentorship/sent'),
        Api.get('/mentorship/received'),
        Api.get('/mentorship/sessions')
      ]);

      const sentRequests = Array.isArray(sentResponse.data) ? sentResponse.data as MentorshipRequest[] : [];
      const receivedRequests = Array.isArray(receivedResponse.data) ? receivedResponse.data as MentorshipRequest[] : [];
      const sessions = Array.isArray(sessionsResponse.data) ? sessionsResponse.data as Session[] : [];

      const allRequests = currentUser?.role === 'mentore' ? receivedRequests : sentRequests;
      const activeMentorships = allRequests.filter(r => r.status === 'accepted').length;
      const pendingRequests = allRequests.filter(r => r.status === 'pending').length;

      const completedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'confirmed');
      const totalHours = completedSessions.reduce((total, session) => total + (session.duration || 60), 0) / 60;

      setStats({
        activeMentorships,
        pendingRequests,
        completedSessions: completedSessions.length,
        totalHours: Math.round(totalHours * 10) / 10
      });
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  }, [currentUser]);

  const loadUserProfile = useCallback(async () => {
    try {
      const response = await Api.get('/users/profile');
      setUserProfile(response.data as UserProfile);
    } catch (error) {
      console.error('Erreur profil:', error);
      if (currentUser) {
        setUserProfile({
          ...currentUser,
          _id: (currentUser as any)._id || currentUser.id,
        } as any);
      }
    }
  }, [currentUser]);

  const loadFiltersData = useCallback(async () => {
    try {
      const [citiesRes, expertiseRes] = await Promise.all([
        Api.get('/users/cities'),
        Api.get('/users/expertise')
      ]);
      setCities(citiesRes.data || []);
      setExpertiseList(expertiseRes.data || []);
    } catch (error) {
      console.error('Erreur filtres:', error);
    }
  }, []);

  const loadMentors = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchFilters.search) params.append('search', searchFilters.search);
      if (searchFilters.city) params.append('city', searchFilters.city);
      if (searchFilters.expertise) params.append('expertise', searchFilters.expertise);
      params.append('role', 'mentore');

      const response = await Api.get(`/users?${params.toString()}`);
      setMentores(Array.isArray(response.data) ? response.data as UserProfile[] : []);
    } catch (error) {
      console.error('Erreur mentors:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchFilters]);

  useEffect(() => {
    loadUserProfile();
    loadFiltersData();
    loadStats();
  }, [loadUserProfile, loadFiltersData, loadStats]);

  useEffect(() => {
    if (activeTab === 'find-mentor') {
      loadMentors();
    }
  }, [activeTab, loadMentors]);

  const handleApplyToMentor = (mentor: UserProfile) => {
    setSelectedMentorForRequest(mentor);
    setShowRequestForm(true);
  };

  const handleSaveProfile = async (updatedData: Partial<UserProfile>) => {
    try {
      const response = await Api.put('/users/profile', updatedData);
      setUserProfile(response.data as UserProfile);
      setIsEditingProfile(false);
      alert('Profil mis à jour !');
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'find-mentor':
        return (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou expertise..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  value={searchFilters.search}
                  onChange={(e) => setSearchFilters({ ...searchFilters, search: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <select
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 min-w-[150px]"
                  value={searchFilters.city}
                  onChange={(e) => setSearchFilters({ ...searchFilters, city: e.target.value })}
                >
                  <option value="">Ville</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 min-w-[150px]"
                  value={searchFilters.expertise}
                  onChange={(e) => setSearchFilters({ ...searchFilters, expertise: e.target.value })}
                >
                  <option value="">Expertise</option>
                  {expertiseList.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mentores.length > 0 ? (
                  mentores.map(mentor => (
                    <div key={mentor._id || mentor.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
                      <div className="h-32 bg-gradient-to-br from-purple-600 to-indigo-600"></div>
                      <div className="px-6 pb-6 -mt-16">
                        <div className="w-32 h-32 mb-4 mx-auto">
                          <PhotoDisplay photo={mentor.photo} />
                        </div>
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-black text-gray-900 uppercase truncate">{mentor.name}</h3>
                          <p className="text-purple-600 font-bold">{mentor.profession || 'Mentor'}</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 mb-6 h-16 overflow-hidden">
                          {mentor.expertise?.map((exp, i) => (
                            <span key={i} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold ring-1 ring-purple-100">
                              {exp}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => handleApplyToMentor(mentor)}
                          className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          REJOINDRE
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                    <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">Aucun mentor trouvé</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 'mentorship':
        return (
          <div className="space-y-8">
            <SimpleMentorship />
            <DynamicMentorshipManager userRole="mentoree" onNavigateToMessaging={() => setActiveTab('messagerie')} />
          </div>
        );
      case 'sessions':
        return <SessionsManagerMentoree sessions={[]} onRefresh={() => loadStats()} onOpenChat={() => setActiveTab('messagerie')} />;
      case 'requests':
        return <MentorshipTest />;
      case 'messagerie':
        return (
          <div className="h-[700px] bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <MessageriePage />
          </div>
        );
      case 'profile':
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
              <div className="h-64 bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-700 relative">
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="absolute bottom-6 right-6 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-2xl backdrop-blur-xl transition-all font-bold flex items-center gap-2 border border-white/30"
                >
                  <Edit className="w-5 h-5" />
                  MODIFIER LE PROFIL
                </button>
              </div>
              <div className="px-12 pb-12">
                <div className="relative -mt-32 mb-8 inline-block">
                  <div className="w-48 h-48 rounded-[2.5rem] bg-white p-2 shadow-2xl">
                    <PhotoDisplay photo={userProfile?.photo} />
                  </div>
                </div>

                {isEditingProfile ? (
                  <ProfileEditForm
                    profile={userProfile}
                    onSave={handleSaveProfile}
                    onCancel={() => setIsEditingProfile(false)}
                    cities={cities}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-8">
                      <div>
                        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight mb-2">
                          {userProfile?.name}
                        </h1>
                        <p className="text-xl text-purple-600 font-black tracking-widest uppercase">Mentorée</p>
                      </div>
                      <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                        <h3 className="text-lg font-black text-gray-900 mb-4 uppercase tracking-wider">Biographie</h3>
                        <p className="text-gray-600 leading-relaxed text-lg">
                          {userProfile?.bio || "Partagez votre histoire avec nous..."}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="bg-purple-600 p-8 rounded-[2rem] text-white shadow-xl shadow-purple-200">
                        <h3 className="font-black mb-6 uppercase tracking-widest text-sm opacity-80">Détails</h3>
                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase opacity-60">Âge</p>
                              <p className="font-bold text-lg">{userProfile?.age || 'Non défini'} ans</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                              <Search className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase opacity-60">Localisation</p>
                              <p className="font-bold text-lg">{userProfile?.city || 'Non définie'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                CENTRES D'INTÉRÊT
              </h3>
              <div className="flex flex-wrap gap-4">
                {userProfile?.interests?.map((interest, i) => (
                  <span key={i} className="px-6 py-3 bg-purple-50 text-purple-700 rounded-2xl text-sm font-black border border-purple-100 shadow-sm uppercase tracking-wider">
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            <TestimonialManager />
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-100 fixed h-full z-30 shadow-2xl shadow-gray-200/50">
        <div className="p-10">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl transform -rotate-6">
              <span className="text-white font-black text-2xl">V</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">VOIX</h1>
              <p className="text-xs font-black text-purple-600 tracking-[0.3em] ml-1">AVENIR</p>
            </div>
          </div>

          <nav className="space-y-3">
            {[
              { id: 'find-mentor', label: 'Trouver un Mentor', icon: Search },
              { id: 'mentorship', label: 'Mon Mentorat', icon: CheckCircle },
              { id: 'sessions', label: 'Mes Séances', icon: Calendar },
              { id: 'requests', label: 'Demandes', icon: Clock },
              { id: 'messagerie', label: 'Messagerie', icon: MessageSquare },
              { id: 'profile', label: 'Mon Profil', icon: UserIcon },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === item.id
                  ? 'bg-purple-600 text-white shadow-xl shadow-purple-200'
                  : 'text-gray-400 hover:bg-purple-50 hover:text-purple-600'
                  }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="uppercase text-sm tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-10">
          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg">
              <PhotoDisplay photo={userProfile?.photo} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-gray-900 truncate uppercase text-sm">{currentUser?.name}</p>
              <p className="text-[10px] font-bold text-purple-600 tracking-wider">MENTORÉE</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-80 min-h-screen flex flex-col">
        <header className="h-24 bg-white/70 backdrop-blur-3xl border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-20">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
            {activeTab === 'find-mentor' && 'Explorer les Mentors'}
            {activeTab === 'mentorship' && 'Gestion du Mentorat'}
            {activeTab === 'sessions' && 'Planning des Séances'}
            {activeTab === 'requests' && 'Suivi des Demandes'}
            {activeTab === 'messagerie' && 'Centre de Messages'}
            {activeTab === 'profile' && 'Configuration Profil'}
          </h2>
          <div className="flex items-center gap-6">
            <NotificationSystem userId={currentUser?._id || currentUser?.id || ''} userRole={currentUser?.role || ''} />
            <SessionNotifications userId={currentUser?._id || currentUser?.id || ''} />
            <div className="h-8 w-[1px] bg-gray-200"></div>
            <button
              onClick={() => onNavigate('home')}
              className="p-3 bg-white border border-gray-100 hover:border-purple-200 text-gray-400 hover:text-purple-600 rounded-2xl shadow-sm transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="p-12 flex-1">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {[
              { label: 'Mentors Actifs', value: stats.activeMentorships, icon: UserIcon, color: 'from-purple-600 to-indigo-600' },
              { label: 'En attente', value: stats.pendingRequests, icon: Clock, color: 'from-amber-500 to-orange-500' },
              { label: 'Séances faites', value: stats.completedSessions, icon: CheckCircle, color: 'from-emerald-500 to-teal-500' },
              { label: 'Total Heures', value: `${stats.totalHours}h`, icon: BookOpen, color: 'from-blue-600 to-cyan-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex items-center gap-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {renderContent()}
        </div>
      </main>

      {/* Modals & Overlays */}
      {showRequestForm && (
        <MentorshipRequestForm
          isOpen={showRequestForm}
          onClose={() => setShowRequestForm(false)}
          onSuccess={() => {
            setShowRequestForm(false);
            loadStats();
          }}
        />
      )}
    </div>
  );
};

export default MentoreeDashboard;
