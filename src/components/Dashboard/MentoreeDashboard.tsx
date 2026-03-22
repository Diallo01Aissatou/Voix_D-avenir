import React, { useState, useEffect } from 'react';
import { Search, Bell, Calendar, MessageSquare, User, Settings, BookOpen, Clock, Filter, Plus, X, CheckCircle, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import MessageriePage from './MessageriePage';
import MentorshipTest from './MentorshipTest';
import DynamicMentorshipManager from './DynamicMentorshipManager';
import SimpleMentorship from './SimpleMentorship';
import MentorshipRequestForm from './MentorshipRequestForm';
import NotificationSystem from './NotificationSystem';
import SessionsManagerMentoree from './SessionsManagerMentoree';
import SessionNotifications from './SessionNotifications';
import TestimonialManager from './TestimonialManager';
import ChatWindow from './ChatWindow';
import MentorChat from './MentorChat';
import MentorRequestModal from './MentorRequestModal';

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
  const [searchFilters, setSearchFilters] = useState({
    search: '',
    city: '',
    expertise: ''
  });
  const [cities, setCities] = useState([]);
  const [expertiseList, setExpertiseList] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requests, setRequests] = useState([]);
  
  // États pour les chats et modaux
  const [showChat, setShowChat] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [showMentorRequestModal, setShowMentorRequestModal] = useState(false);
  const [refreshRequests, setRefreshRequests] = useState(0);
  const [showMentorChat, setShowMentorChat] = useState(false);
  const [mentorChatUser, setMentorChatUser] = useState(null);
  const [showChatComplete, setShowChatComplete] = useState(false);
  const [chatUserComplete, setChatUserComplete] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatInterval, setChatInterval] = useState(null);

  const API_URL = 'https://voix-avenir-backend.onrender.com';

  useEffect(() => {
    loadMentors();
    loadFiltersData();
    loadUserProfile();
    loadMySessions();
    loadStats();
    loadRequests();
  }, [searchFilters, refreshRequests]);

  const loadRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mentorship/sent`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
    }
  };

  const loadMentors = async () => {
    try {
      const params = new URLSearchParams();
      if (searchFilters.search) params.append('search', searchFilters.search);
      if (searchFilters.city) params.append('city', searchFilters.city);
      if (searchFilters.expertise) params.append('expertise', searchFilters.expertise);
      
      const response = await fetch(`${API_URL}/api/users?role=mentore&${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setMentores(data);
      }
    } catch (error) {
      console.error('Erreur chargement mentores:', error);
    }
  };

  const loadFiltersData = async () => {
    try {
      const [citiesRes, expertiseRes] = await Promise.all([
        fetch(`${API_URL}/api/users/cities`),
        fetch(`${API_URL}/api/users/expertise`)
      ]);
      if (citiesRes.ok) setCities(await citiesRes.json());
      if (expertiseRes.ok) setExpertiseList(await expertiseRes.json());
    } catch (error) {
      console.error('Erreur filtres:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        credentials: 'include'
      });
      if (response.ok) {
        setUserProfile(await response.json());
      }
    } catch (error) {
      console.error('Erreur profil:', error);
    }
  };

  const loadMySessions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/sessions`, {
        credentials: 'include'
      });
      if (response.ok) {
        setMySessions(await response.json());
      }
    } catch (error) {
      console.error('Erreur séances:', error);
    }
  };

  const loadStats = async () => {
    try {
      const [mentorshipsRes, sessionsRes] = await Promise.all([
        fetch(`${API_URL}/api/mentorship/sent`, { credentials: 'include' }),
        fetch(`${API_URL}/api/sessions`, { credentials: 'include' })
      ]);
      
      if (mentorshipsRes.ok && sessionsRes.ok) {
        const mentorships = await mentorshipsRes.json();
        const sessions = await sessionsRes.json();
        
        const active = mentorships.filter(m => m.status === 'accepted').length;
        const pending = mentorships.filter(m => m.status === 'pending').length;
        const completed = sessions.filter(s => s.status === 'completed').length;
        const hours = sessions.filter(s => s.status === 'completed')
          .reduce((acc, curr) => acc + (curr.duration || 60), 0) / 60;
          
        setStats({
          activeMentorships: active,
          pendingRequests: pending,
          completedSessions: completed,
          totalHours: Math.round(hours * 10) / 10
        });
      }
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userProfile)
      });
      if (response.ok) {
        setIsEditingProfile(false);
        alert('Profil mis à jour !');
      }
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !chatUserComplete) return;
    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          recipientId: chatUserComplete._id,
          content: newMessage.trim()
        })
      });
      if (response.ok) {
        setNewMessage('');
        // Recharger les messages
        const res = await fetch(`${API_URL}/api/messages/${chatUserComplete._id}`, { credentials: 'include' });
        if (res.ok) setMessages(await res.json());
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-purple-50">
                  {userProfile?.photo ? (
                    <img src={`${API_URL}${userProfile.photo}`} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-purple-600" />
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{currentUser?.name}</h2>
                <p className="text-purple-600 font-medium tracking-wide uppercase text-xs mt-1">Mentorée</p>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'find-mentor', icon: Search, label: 'Trouver une mentore' },
                  { id: 'mentorship', icon: CheckCircle, label: 'Mon Mentorat' },
                  { id: 'sessions', icon: Calendar, label: 'Mes Séances' },
                  { id: 'requests', icon: Clock, label: 'Mes Demandes' },
                  { id: 'messagerie', icon: MessageSquare, label: 'Messagerie' },
                  { id: 'testimonials', icon: MessageSquare, label: 'Témoignages' },
                  { id: 'profile', icon: User, label: 'Mon Profil' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.id 
                        ? 'bg-purple-600 text-white shadow-lg' 
                        : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="bg-purple-50 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-purple-800 mb-2 uppercase tracking-wider">Activité</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-600">Mentorats</span>
                      <span className="font-bold text-purple-800">{stats.activeMentorships}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-600">Séances</span>
                      <span className="font-bold text-purple-800">{stats.completedSessions}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:w-3/4">
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">
                {activeTab === 'find-mentor' && 'Explorer les Mentores'}
                {activeTab === 'mentorship' && 'Mon Système de Mentorat'}
                {activeTab === 'sessions' && 'Calendrier des Séances'}
                {activeTab === 'requests' && 'Suivi des Demandes'}
                {activeTab === 'messagerie' && 'Centre de Messages'}
                {activeTab === 'testimonials' && 'Avis et Témoignages'}
                {activeTab === 'profile' && 'Paramètres du Profil'}
              </h1>
              <div className="flex items-center space-x-4">
                <NotificationSystem userId={currentUser?._id || ''} userRole="mentoree" />
                <SessionNotifications userId={currentUser?._id || ''} />
              </div>
            </header>

            {activeTab === 'find-mentor' && (
              <div className="space-y-6">
                {/* Recommandations basées sur les intérêts */}
                {userProfile?.interests?.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl mb-8">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      Recommandé pour vous
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                      {mentores.filter(mentore => 
                        mentore.expertise?.some(exp => 
                          userProfile.interests.some(int => exp.toLowerCase().includes(int.toLowerCase()))
                        )
                      ).slice(0, 2).map(mentore => (
                        <div key={mentore.id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
                              {mentore.photo ? (
                                <img src={`${API_URL}${mentore.photo}`} alt={mentore.name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-purple-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{mentore.name}</p>
                              <p className="text-xs text-white/70">{mentore.profession}</p>
                            </div>
                          </div>
                          <p className="text-xs text-white/80 line-clamp-1 mb-3">{mentore.bio}</p>
                          <button 
                            onClick={() => {
                              setActiveTab('mentorship');
                              setTimeout(() => setShowRequestForm(true), 100);
                            }}
                            className="w-full py-2 bg-white text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-50 transition-colors"
                          >
                            Voir Profil
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="md:col-span-1">
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchFilters.search}
                      onChange={(e) => setSearchFilters({ ...searchFilters, search: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <select
                      value={searchFilters.city}
                      onChange={(e) => setSearchFilters({ ...searchFilters, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Toutes les villes</option>
                      {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>
                  <div>
                    <select
                      value={searchFilters.expertise}
                      onChange={(e) => setSearchFilters({ ...searchFilters, expertise: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Tous les domaines</option>
                      {expertiseList.map(exp => <option key={exp} value={exp}>{exp}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mentores.map((mentore) => (
                    <div key={mentore.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          {mentore.photo ? (
                            <img src={`${API_URL}${mentore.photo}`} alt={mentore.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800">{mentore.name}</h3>
                          <p className="text-purple-600 font-medium text-sm">{mentore.profession}</p>
                          <p className="text-xs text-gray-500 mb-2">{mentore.city}</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {mentore.expertise?.slice(0, 2).map((exp, i) => (
                              <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px]">{exp}</span>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{mentore.bio}</p>
                          <button 
                            onClick={() => {
                              setActiveTab('mentorship');
                              setTimeout(() => setShowRequestForm(true), 100);
                            }}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 w-full"
                          >
                            Contacter
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {mentores.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                      Aucune mentore trouvée pour ces critères.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'mentorship' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Votre Mentorat</h3>
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle demande
                  </button>
                </div>
                <SimpleMentorship />
              </div>
            )}

            {activeTab === 'sessions' && (
              <SessionsManagerMentoree 
                sessions={mySessions} 
                onRefresh={loadMySessions} 
                onOpenChat={(id) => {
                  setActiveTab('messagerie');
                  // Trigger chat component to open conversion
                }} 
              />
            )}

            {activeTab === 'requests' && (
              <DynamicMentorshipManager 
                userRole="mentoree" 
                onNavigateToMessaging={(id) => setActiveTab('messagerie')} 
              />
            )}

            {activeTab === 'messagerie' && (
              <div className="h-[600px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <MessageriePage />
              </div>
            )}

            {activeTab === 'testimonials' && <TestimonialManager />}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                {isEditingProfile ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                        <input
                          type="text"
                          value={userProfile?.name || ''}
                          onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                        <input
                          type="text"
                          value={userProfile?.city || ''}
                          onChange={(e) => setUserProfile({ ...userProfile, city: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        value={userProfile?.bio || ''}
                        onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        rows={4}
                      />
                    </div>
                    <div className="flex space-x-4 pt-4">
                      <button 
                        type="submit" 
                        className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700"
                      >
                        Sauvegarder
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-8">
                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-24 bg-purple-100 rounded-2xl flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                        {userProfile?.photo ? (
                          <img src={`${API_URL}${userProfile.photo}`} alt="Profil" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">{userProfile?.name}</h3>
                        <p className="text-gray-500 font-medium">{userProfile?.email}</p>
                        <button 
                          onClick={() => setIsEditingProfile(true)}
                          className="mt-2 text-purple-600 text-sm font-bold flex items-center hover:underline"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Modifier les informations
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <h4 className="font-bold text-gray-800 mb-4 uppercase tracking-wider text-sm">Détails Personnels</h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Ville</p>
                            <p className="text-gray-700 font-medium">{userProfile?.city || 'Non renseigné'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Âge</p>
                            <p className="text-gray-700 font-medium">{userProfile?.age || 'Non renseigné'} ans</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Niveau d'étude</p>
                            <p className="text-gray-700 font-medium">{userProfile?.level || 'Non renseigné'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <h4 className="font-bold text-gray-800 mb-4 uppercase tracking-wider text-sm">À propos</h4>
                        <p className="text-gray-600 leading-relaxed italic">
                          "{userProfile?.bio || "Aucune biographie fournie."}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <MentorshipRequestForm
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        onSuccess={() => {
          setShowRequestForm(false);
          loadRequests();
          loadStats();
          setActiveTab('requests');
        }}
      />
    </div>
  );
};

// Subversion of the icons for layout
const Star = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
  </svg>
);

const Edit = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
  </svg>
);

export default MentoreeDashboard;
