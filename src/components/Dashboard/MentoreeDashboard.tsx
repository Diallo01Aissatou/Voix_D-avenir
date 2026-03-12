import React, { useState, useEffect } from 'react';
import { Search, Filter, Send, Clock, CheckCircle, XCircle, MessageSquare, User, BookOpen, Calendar, Edit, Plus, X, Bell } from 'lucide-react';
import NotificationSystem from './NotificationSystem';
import DynamicMentorshipManager from './DynamicMentorshipManager';
import Api from '../../data/Api';
import { useAuth } from '../../contexts/AuthContext';
import ChatWindow from './ChatWindow';
import MentorRequestModal from './MentorRequestModal';
import MentorRequestsList from './MentorRequestsList';
import MentorChat from './MentorChat';
import SimpleMentorship from './SimpleMentorship';
import SimpleCompleteMentorship from './SimpleCompleteMentorship';
import MentorshipRequestForm from './MentorshipRequestForm';
import MentorshipTest from './MentorshipTest';
import MessageriePage from './MessageriePage';
import SessionsManagerMentoree from './SessionsManagerMentoree';
import SessionNotifications from './SessionNotifications';
import TestimonialManager from './TestimonialManager';

interface MentoreeDashboardProps {
  onNavigate: (page: string) => void;
}

const PhotoUpload = ({ currentPhoto, onPhotoUpdate }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    setUploading(true);
    try {
      const response = await Api.post('/users/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onPhotoUpdate(response.data.user.photo);
      alert('Photo mise à jour avec succès !');
    } catch (error) {
      console.error('Erreur upload photo:', error);
      alert('Erreur lors de l\'upload de la photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploading}
      />
      <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
        {currentPhoto ? (
          <img src={currentPhoto} alt="Profil" className="w-24 h-24 rounded-full object-cover" />
        ) : (
          <User className="w-12 h-12 text-white" />
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer">
        <Edit className="w-4 h-4 text-white" />
      </div>
    </div>
  );
};

const ProfileEditForm = ({ profile, onSave, onCancel, cities }) => {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    age: profile.age || '',
    city: profile.city || '',
    level: profile.level || '',
    interests: profile.interests?.join(', ') || '',
    bio: profile.bio || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedProfile = {
      ...formData,
      interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean)
    };
    onSave(updatedProfile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Âge</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            min="13"
            max="25"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
          <select
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
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
          <select
            value={formData.level}
            onChange={(e) => setFormData({...formData, level: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Sélectionnez votre niveau</option>
            <option value="Collège">Collège</option>
            <option value="Lycée">Lycée</option>
            <option value="Université">Université</option>
            <option value="Masteur">Masteur</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Centres d'intérêt</label>
        <input
          type="text"
          value={formData.interests}
          onChange={(e) => setFormData({...formData, interests: e.target.value})}
          placeholder="Ex: Technologie, Art, Sport... (séparés par des virgules)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Biographie</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
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

const MentoreeDashboard: React.FC<MentoreeDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [searchFilters, setSearchFilters] = useState({
    city: '',
    expertise: '',
    search: ''
  });

  const [mentores, setMentores] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [expertiseList, setExpertiseList] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<{id: string, name: string} | null>(null);
  const [showMentorRequestModal, setShowMentorRequestModal] = useState(false);
  const [showMentorChat, setShowMentorChat] = useState(false);
  const [mentorChatUser, setMentorChatUser] = useState<{id: string, name: string} | null>(null);
  const [refreshRequests, setRefreshRequests] = useState(0);
  const [showChatComplete, setShowChatComplete] = useState(false);
  const [chatUserComplete, setChatUserComplete] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatInterval, setChatInterval] = useState(null);

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [stats, setStats] = useState({
    activeMentorships: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    rejectedRequests: 0,
    completedSessions: 0,
    totalHours: 0
  });
  const [mySessions, setMySessions] = useState([]);

  useEffect(() => {
    loadRequests();
    loadUserProfile();
    loadFiltersData();
    loadStats();
    loadMySessions();

    // Écouter l'événement pour basculer vers la messagerie
    const handleSwitchToMessaging = (event: CustomEvent) => {
      const { userId } = event.detail;
      setActiveTab('messagerie');
      setTimeout(() => {
        const messageEvent = new CustomEvent('openConversation', {
          detail: { userId }
        });
        window.dispatchEvent(messageEvent);
      }, 100);
    };
    
    // Écouter les mises à jour de mentorat
    const handleMentorshipUpdate = (event: CustomEvent) => {
      console.log('Mise à jour mentorat détectée (mentorée):', event.detail);
      loadRequests();
      loadMySessions();
      loadStats();
    };

    window.addEventListener('switchToMessaging', handleSwitchToMessaging as EventListener);
    window.addEventListener('mentorshipUpdate', handleMentorshipUpdate as EventListener);
    
    // Actualiser les données toutes les 30 secondes (seulement si pas sur messagerie)
    const interval = setInterval(() => {
      if (activeTab !== 'messagerie') {
        loadMySessions();
        loadStats();
        loadRequests();
      }
    }, 30000);

    return () => {
      window.removeEventListener('switchToMessaging', handleSwitchToMessaging as EventListener);
      window.removeEventListener('mentorshipUpdate', handleMentorshipUpdate as EventListener);
      clearInterval(interval);
    };
  }, []);
  
  useEffect(() => {
    if (activeTab === 'search') {
      loadAllMentores();
    }
  }, [activeTab]);
  
  const loadAllMentores = async () => {
    try {
      console.log('Chargement de toutes les mentores...');
      const response = await Api.get('/users', { 
        params: { role: 'mentore' } 
      });
      console.log('Toutes les mentores:', response.data);
      
      if (Array.isArray(response.data)) {
        setMentores(response.data);
      } else {
        setMentores([]);
      }
    } catch (error) {
      console.error('Erreur chargement mentores:', error);
      setMentores([]);
    }
  };
  
  useEffect(() => {
    if (activeTab === 'search') {
      if (searchFilters.search || searchFilters.city || searchFilters.expertise) {
        loadMentores();
      } else {
        // Charger toutes les mentores par défaut quand aucun filtre n'est appliqué
        loadAllMentores();
      }
    }
  }, [searchFilters, activeTab]);

  const loadMentores = async () => {
    try {
      const params = { role: 'mentore' };
      
      if (searchFilters.search) params.search = searchFilters.search;
      if (searchFilters.city) params.city = searchFilters.city;
      if (searchFilters.expertise) params.expertise = searchFilters.expertise;
      
      console.log('Recherche avec params:', params);
      const response = await Api.get('/users', { params });
      console.log('Réponse API mentores:', response.data);
      
      if (Array.isArray(response.data)) {
        setMentores(response.data);
      } else {
        console.error('Réponse API invalide:', response.data);
        setMentores([]);
      }
    } catch (error) {
      console.error('Erreur API mentores:', error);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      setMentores([]);
    }
  };

  const loadRequests = async () => {
    try {
      console.log('Chargement des demandes...');
      const response = await fetch('https://voix-avenir-backend.onrender.com/api/mentorship/sent', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Demandes reçues:', data);
        console.log('Photos des mentores:', data.map(r => ({ name: r.mentore?.name, photo: r.mentore?.photo })));
        setRequests(data);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
      setRequests([]);
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await Api.get('/users/profile');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setUserProfile(currentUser);
    }
  };

  const loadFiltersData = async () => {
    try {
      const [citiesResponse, expertiseResponse] = await Promise.all([
        Api.get('/users/cities'),
        Api.get('/users/expertise')
      ]);
      setCities(citiesResponse.data);
      setExpertiseList(expertiseResponse.data);
    } catch (error) {
      console.error('Erreur lors du chargement des filtres:', error);
      setCities([
        'Beyla', 'Boffa', 'Boké', 'Coléah', 'Conakry', 'Coyah', 'Dabola', 'Dalaba',
        'Dinguiraye', 'Dubreka', 'Faranah', 'Forcécariah', 'Fria', 'Gaoual', 'Guéckédou',
        'Kankan', 'Kérouane', 'Kindia', 'Kissidougou', 'Koubia', 'Koundara', 'Kouroussa',
        'Labé', 'Lélouma', 'Lola', 'Macenta', 'Mali', 'Mamou', 'Mandiana', 'N\'Zérékoré',
        'Pita', 'Siguiri', 'Télimélé', 'Tougue', 'Yomou',
        // Toutes les villes de Guinée
        'Baro', 'Benti', 'Bignamou', 'Bintimodia', 'Bissikrima', 'Bomboli', 'Boussou',
        'Dabiss', 'Damaro', 'Diari', 'Diecke', 'Diountou', 'Ditinn', 'Doko', 'Donghol-Touma',
        'Douprou', 'Forécariah', 'Foulamory', 'Friguiagbé', 'Gadha-Woundou', 'Ganta',
        'Gbangbadou', 'Gberedou-Baranama', 'Gbessoba', 'Gouécké', 'Hafia', 'Hérico',
        'Kamsar', 'Kania', 'Kassa', 'Koba', 'Kolangui', 'Kolda', 'Kondétou', 'Konia',
        'Koumbia', 'Kouremalé', 'Koyamah', 'Kpéléyah', 'Lansanaya', 'Lelouma', 'Linsan',
        'Loguéya', 'Madina-Oula', 'Maférinyah', 'Malapouya', 'Mambia', 'Mandiana',
        'Matakang', 'Matoto', 'Médina-Gounass', 'Morodou', 'Moussaya', 'Nafadji',
        'Niagassola', 'Norasoba', 'Ouende-Kénéma', 'Ouré-Kaba', 'Pamalap', 'Popodara',
        'Ratoma', 'Sagalé', 'Sambailo', 'Sangarédi', 'Saramoussaya', 'Sérédou',
        'Singuéléya', 'Sokotoro', 'Soumba', 'Tabounsou', 'Tanéné', 'Tolo', 'Tondon',
        'Tougnifili', 'Wendou-Bosséya', 'Wonkifong', 'Yalenzou', 'Yembéring', 'Youkounkoun'
      ]);
      setExpertiseList(['Médecine', 'Marketing', 'Technologie', 'Finance', 'Éducation', 'Droit', 'Ingénierie', 'Santé publique', 'Informatique']);
    }
  };

  const loadStats = async () => {
    try {
      const [sentResponse, receivedResponse, sessionsResponse] = await Promise.all([
        fetch('https://voix-avenir-backend.onrender.com/api/mentorship/sent', { credentials: 'include' }),
        fetch('https://voix-avenir-backend.onrender.com/api/mentorship/received', { credentials: 'include' }),
        fetch('https://voix-avenir-backend.onrender.com/api/mentorship/sessions', { credentials: 'include' })
      ]);
      
      let sentRequests = [];
      let receivedRequests = [];
      let sessions = [];
      
      if (sentResponse.ok) {
        sentRequests = await sentResponse.json();
      }
      if (receivedResponse.ok) {
        receivedRequests = await receivedResponse.json();
      }
      if (sessionsResponse.ok) {
        sessions = await sessionsResponse.json();
      }
      
      const allRequests = currentUser?.role === 'mentore' ? receivedRequests : sentRequests;
      const activeMentorships = allRequests.filter(r => r.status === 'accepted').length;
      const pendingRequests = allRequests.filter(r => r.status === 'pending').length;
      const acceptedRequests = allRequests.filter(r => r.status === 'accepted').length;
      const rejectedRequests = allRequests.filter(r => r.status === 'rejected').length;
      
      // Calculer les heures réelles basées sur les séances terminées
      const completedSessions = sessions.filter(s => s.status === 'completed');
      const totalHours = completedSessions.reduce((total, session) => {
        return total + (session.duration || 60); // durée en minutes, convertir en heures
      }, 0) / 60;
      
      setStats({
        activeMentorships,
        pendingRequests,
        acceptedRequests,
        rejectedRequests,
        completedSessions: completedSessions.length,
        totalHours: Math.round(totalHours * 10) / 10 // arrondir à 1 décimale
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setStats({ activeMentorships: 0, pendingRequests: 0, acceptedRequests: 0, rejectedRequests: 0, completedSessions: 0, totalHours: 0 });
    }
  };

  const loadMySessions = async () => {
    try {
      const response = await fetch('https://voix-avenir-backend.onrender.com/api/sessions', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMySessions(data);
      } else {
        setMySessions([]);
      }
    } catch (error) {
      console.error('Erreur chargement séances:', error);
      setMySessions([]);
    }
  };

  const loadChatMessages = async (userId) => {
    try {
      const response = await fetch(`https://voix-avenir-backend.onrender.com/api/messages/${userId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Messages reçus du serveur:', data);
        setMessages(data);
        
        setTimeout(() => {
          setMessages([...data]);
        }, 100);
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !chatUserComplete) return;
    
    try {
      const response = await fetch('https://voix-avenir-backend.onrender.com/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          recipient: chatUserComplete._id,
          content: newMessage
        })
      });

      if (response.ok) {
        const sentMessage = await response.json();
        console.log('Message envoyé:', sentMessage);
        setMessages(prev => {
          const newMessages = [...prev, sentMessage];
          console.log('Nouveaux messages:', newMessages);
          return newMessages;
        });
        setNewMessage('');
        
        setTimeout(() => {
          loadChatMessages(chatUserComplete._id);
          const messagesEnd = document.getElementById('messages-end');
          if (messagesEnd) {
            messagesEnd.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const handleUpdateProfile = async (profileData: any) => {
    setIsLoading(true);
    try {
      const response = await Api.put('/users/profile', profileData);
      setUserProfile(response.data);
      setIsEditingProfile(false);
      alert('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      alert('Erreur lors de la mise à jour du profil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de Bord - Mentorée</h1>
              <p className="text-gray-600">Bienvenue {currentUser?.name}</p>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <SessionNotifications 
                userId={currentUser?._id || currentUser?.id}
                onNotificationClick={(notification) => {
                  if (notification.type.includes('session')) {
                    setActiveTab('sessions');
                    loadMySessions();
                  }
                }}
              />
              <NotificationSystem 
                userId={currentUser?._id || currentUser?.id}
                userRole={currentUser?.role}
                onNotificationClick={(notification) => {
                  if (notification.type === 'request') {
                    setActiveTab('requests');
                    loadRequests();
                  } else if (notification.type === 'session') {
                    setActiveTab('sessions');
                    loadMySessions();
                  } else if (notification.type === 'message') {
                    setActiveTab('messagerie');
                  }
                }}
              />
              <button
                onClick={() => onNavigate('home')}
                className="px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                Accueil
              </button>
              <button
                onClick={() => onNavigate('experts')}
                className="px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                Expertes
              </button>
              <button
                onClick={() => onNavigate('resources')}
                className="px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                Ressources
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-800">{stats.activeMentorships}</p>
                <p className="text-sm text-gray-600">Mentorats actifs</p>
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
                <p className="text-2xl font-bold text-gray-800">{stats.acceptedRequests || 0}</p>
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
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-800">{stats.totalHours}h</p>
                <p className="text-sm text-gray-600">Heures de mentorat</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Mon Profil
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'search'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Search className="w-4 h-4 inline mr-2" />
                Rechercher des Mentores
              </button>
              <button
                onClick={() => setActiveTab('mentorship')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'mentorship'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Mentorat
              </button>
              <button
                onClick={() => setActiveTab('complete')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'complete'
                   ? 'border-purple-500 text-purple-600'
                     : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Système Complet
              </button>
              {/* <button
                onClick={() => setActiveTab('test')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'test'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Test
              </button> */}
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'requests'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Mes Demandes
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'sessions'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Mes Séances
              </button>
              <button
                onClick={() => setActiveTab('messagerie')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'messagerie'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Messagerie
              </button>
              <button
                onClick={() => setActiveTab('testimonials')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'testimonials'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Témoignages
              </button>
            </nav>
          </div>

          <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
            {activeTab === 'profile' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Mon Profil Personnel</h3>
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditingProfile ? 'Annuler' : 'Modifier'}
                  </button>
                </div>
                
                {userProfile && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-start space-x-6">
                      <PhotoUpload 
                        currentPhoto={userProfile.photo}
                        onPhotoUpdate={(newPhoto) => setUserProfile({...userProfile, photo: newPhoto})}
                      />
                      <div className="flex-1">
                        {!isEditingProfile ? (
                          <div>
                            <h4 className="text-2xl font-bold text-gray-800 mb-2">{userProfile.name}</h4>
                            <p className="text-purple-600 font-medium mb-2">{userProfile.city}</p>
                            <p className="text-gray-600 mb-4">Âge: {userProfile.age} ans</p>
                            <p className="text-gray-600 mb-4">Niveau d'éducation: {userProfile.level}</p>
                            <div className="mb-4">
                              <h5 className="font-semibold text-gray-800 mb-2">Centres d'intérêt:</h5>
                              <div className="flex flex-wrap gap-2">
                                {userProfile.interests?.map((interest, index) => (
                                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-800 mb-2">Biographie:</h5>
                              <p className="text-gray-600">{userProfile.bio || 'Aucune biographie renseignée.'}</p>
                            </div>
                          </div>
                        ) : (
                          <ProfileEditForm 
                            profile={userProfile} 
                            onSave={handleUpdateProfile}
                            onCancel={() => setIsEditingProfile(false)}
                            cities={cities}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'search' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <input
                      type="text"
                      placeholder="Rechercher une mentore..."
                      value={searchFilters.search}
                      onChange={(e) => setSearchFilters({...searchFilters, search: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <select
                      value={searchFilters.city}
                      onChange={(e) => setSearchFilters({...searchFilters, city: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Toutes les villes</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={searchFilters.expertise}
                      onChange={(e) => setSearchFilters({...searchFilters, expertise: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Tous les domaines</option>
                      {expertiseList.map(expertise => (
                        <option key={expertise} value={expertise}>{expertise}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtres avancés
                    </button>
                  </div>
                </div>

                {mentores.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">
                      {searchFilters.search || searchFilters.city || searchFilters.expertise 
                        ? 'Mentores non trouvées' 
                        : 'Chargement des mentores...'}
                    </p>
                    <p className="text-sm">
                      {searchFilters.search || searchFilters.city || searchFilters.expertise 
                        ? 'Aucune mentore ne correspond à vos critères de recherche'
                        : 'Veuillez patienter pendant le chargement'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mentores.map((mentore) => (
                    <div key={mentore.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center overflow-hidden">
                          {mentore.photo ? (
                            <img src={mentore.photo} alt={mentore.name} className="w-16 h-16 rounded-full object-cover" onError={(e) => console.log('Erreur chargement photo:', mentore.photo)} />
                          ) : (
                            <User className="w-8 h-8 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">{mentore.name}</h3>
                          <p className="text-purple-600 font-medium mb-2">{mentore.profession}</p>
                          <p className="text-sm text-gray-600 mb-3">{mentore.city}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {mentore.expertise?.slice(0, 3).map((exp, index) => (
                              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                                {exp}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{mentore.bio}</p>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-500 text-center py-2">
                              Utilisez l'onglet "Mentorat" pour envoyer une demande
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'mentorship' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Système de Mentorat</h3>
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle demande
                  </button>
                </div>
                <SimpleMentorship />
              </div>
            )}

            {activeTab === 'requests' && (
              <DynamicMentorshipManager 
                userRole="mentoree"
                onNavigateToMessaging={(userId) => {
                  setActiveTab('messagerie');
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
              <SessionsManagerMentoree 
                sessions={mySessions}
                onRefresh={() => {
                  loadMySessions();
                  loadStats();
                }}
                onOpenChat={(userId) => {
                  setActiveTab('messagerie');
                  setTimeout(() => {
                    const messageEvent = new CustomEvent('openConversation', {
                      detail: { userId }
                    });
                    window.dispatchEvent(messageEvent);
                  }, 100);
                }}
              />
            )}

            {activeTab === 'test' && (
              <MentorshipTest />
            )}

            {activeTab === 'messagerie' && (
              <div className="h-[600px] min-h-[600px]">
                <MessageriePage />
              </div>
            )}

            {activeTab === 'testimonials' && (
              <TestimonialManager />
            )}

            {activeTab === 'complete' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Système de Mentorat Complet</h3>
                
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-2xl font-bold text-blue-600">{stats.activeMentorships}</h4>
                    <p className="text-sm text-gray-600">Mentorats actifs</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</h4>
                    <p className="text-sm text-gray-600">En attente</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-2xl font-bold text-green-600">{requests.filter(r => r.status === 'accepted').length}</h4>
                    <p className="text-sm text-gray-600">Acceptées</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="text-2xl font-bold text-purple-600">{requests.length}</h4>
                    <p className="text-sm text-gray-600">Total demandes</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h4 className="font-semibold mb-4">Demandes Récentes</h4>
                  {requests.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucune demande</p>
                  ) : (
                    <div className="space-y-3">
                      {requests.slice(0, 3).map((request) => (
                        <div key={request._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">
                              {currentUser?.role === 'mentore' 
                                ? (request.mentoree?.name || 'Mentorée')
                                : (request.mentore?.name || 'Mentore')
                              }
                            </p>
                            <p className="text-sm text-gray-600">{request.message?.substring(0, 50)}...</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {request.status === 'pending' ? 'En attente' :
                             request.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="font-semibold mb-4">Mentorats Actifs</h4>
                  {requests.filter(r => r.status === 'accepted').length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucun mentorat actif</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {requests.filter(r => r.status === 'accepted').map((mentorship) => (
                        <div key={mentorship._id} className="border rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center overflow-hidden">
                              {(currentUser?.role === 'mentore' ? mentorship.mentoree?.photo : mentorship.mentore?.photo) ? (
                                <img 
                                  src={currentUser?.role === 'mentore' ? mentorship.mentoree?.photo : mentorship.mentore?.photo}
                                  alt={currentUser?.role === 'mentore' ? mentorship.mentoree?.name : mentorship.mentore?.name}
                                  className="w-12 h-12 rounded-full object-cover" 
                                />
                              ) : (
                                <User className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {currentUser?.role === 'mentore' 
                                  ? (mentorship.mentoree?.name || 'Mentorée')
                                  : (mentorship.mentore?.name || 'Mentore')
                                }
                              </p>
                              <p className="text-sm text-gray-500">
                                {mentorship.mentore?.profession || mentorship.mentoree?.profession || 'Profession'}
                              </p>
                              <p className="text-xs text-gray-400">
                                Début: {new Date(mentorship.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              const otherUser = currentUser?.role === 'mentore' ? mentorship.mentoree : mentorship.mentore;
                              if (otherUser) {
                                setActiveTab('messagerie');
                                setTimeout(() => {
                                  const messageEvent = new CustomEvent('openConversation', {
                                    detail: { userId: otherUser._id }
                                  });
                                  window.dispatchEvent(messageEvent);
                                }, 100);
                              }
                            }}
                            className="mt-3 w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                          >
                            <MessageSquare className="w-4 h-4 inline mr-1" />
                            Bavarder
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showChat && selectedChatUser && (
        <ChatWindow
          recipientId={selectedChatUser.id}
          recipientName={selectedChatUser.name}
          onClose={() => {
            setShowChat(false);
            setSelectedChatUser(null);
          }}
        />
      )}

      <MentorRequestModal
        isOpen={showMentorRequestModal}
        onClose={() => setShowMentorRequestModal(false)}
        onSuccess={() => setRefreshRequests(prev => prev + 1)}
      />

      {showMentorChat && mentorChatUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh]">
            <MentorChat
              otherUserId={mentorChatUser.id}
              otherUserName={mentorChatUser.name}
              currentUserId={currentUser?._id || ''}
              onBack={() => {
                setShowMentorChat(false);
                setMentorChatUser(null);
              }}
            />
          </div>
        </div>
      )}

      <MentorshipRequestForm
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        onSuccess={() => {
          loadRequests();
          loadStats();
          setRefreshRequests(prev => prev + 1);
        }}
      />

      {showChatComplete && chatUserComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg w-[95vw] h-[95vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Chat avec {chatUserComplete.name}</h3>
              <button 
                onClick={() => {
                  setShowChatComplete(false);
                  setChatUserComplete(null);
                  setMessages([]);
                  setNewMessage('');
                  
                  if (chatInterval) {
                    clearInterval(chatInterval);
                    setChatInterval(null);
                  }
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm">Messages: {messages.length}</span>
                  <button 
                    onClick={() => {
                      if (window.confirm('Supprimer toute la conversation ?')) {
                        setMessages([]);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                  >
                    🗑️ Vider
                  </button>
                </div>
                {messages.map((msg, index) => {
                  const isRight = (index % 2 === 0);
                  
                  return (
                    <div key={index} className={`flex ${isRight ? 'justify-end' : 'justify-start'} mb-3`}>
                      <div className={`p-3 rounded-lg max-w-sm ${
                        isRight 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-300 text-gray-800'
                      }`}>
                        <p>{msg.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 py-12">
                    <p>💬 Commencez votre conversation</p>
                  </div>
                )}
                <div id="messages-end"></div>
              </div>
            </div>
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2 mb-2">
                <button 
                  onClick={async () => {
                    try {
                      const response = await fetch(`https://voix-avenir-backend.onrender.com/api/messages/${chatUserComplete._id}`);
                      const msgs = await response.json();
                      console.log('Messages rechargés:', msgs);
                      setMessages(msgs);
                    } catch (error) {
                      console.error('Erreur:', error);
                    }
                  }}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  Recharger ({messages.length})
                </button>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Tapez votre message..."
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <button 
                  onClick={sendChatMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentoreeDashboard;
