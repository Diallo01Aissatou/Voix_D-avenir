import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, MessageSquare, BarChart3, Settings, Eye, Trash2, Edit, Star, BookOpen, Calendar, User as UserIcon } from 'lucide-react';
import Api, { BASE_URL } from '../../data/Api';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingMentors, setPendingMentors] = useState<User[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const getPhotoUrl = (photo: string | undefined) => {
    if (!photo) return null;
    if (photo.startsWith('http') || photo.startsWith('data:')) return photo;
    
    // Si c'est un chemin relatif, construire l'URL complète
    const fileName = photo.split('/').pop();
    return `${BASE_URL}/uploads/${fileName}`;
  };
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMentores: 0,
    totalMentorees: 0,
    approvedMentores: 0,
    totalRequests: 0,
    pendingRequests: 0,
    acceptedRequests: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [partners, setPartners] = useState([]);
  const [newPartner, setNewPartner] = useState({ name: '', logoFile: null, website: '', description: '' });
  const [mentees, setMentees] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [newTestimonial, setNewTestimonial] = useState({ menteeId: '', message: '', rating: 5 });
  const [experts, setExperts] = useState([]);
  const [availableMentores, setAvailableMentores] = useState([]);
  const [newExpert, setNewExpert] = useState({
    userId: '', domain: '', achievements: [''], quote: ''
  });
  const [adminResources, setAdminResources] = useState([]);
  const [newResource, setNewResource] = useState({
    title: '', description: '', category: '', type: 'pdf', fileUrl: '', resourceFile: null, imageFile: null
  });
  const [editingResource, setEditingResource] = useState<any>(null);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [resourceCategoryFilter, setResourceCategoryFilter] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');

  useEffect(() => {
    loadStats();
    loadUsers(); // Charger au démarrage
    loadRequests();
    loadPartners();
    loadPendingMentors();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
    if (activeTab === 'approvals') {
      loadPendingMentors();
    }
    if (activeTab === 'testimonials') {
      loadTestimonials();
      loadMentees();
    }
    if (activeTab === 'experts') {
      loadExperts();
      loadAvailableMentores();
    }
    if (activeTab === 'news') {
      loadNews();
    }
    if (activeTab === 'resources') {
      loadResources();
    }
    if (activeTab === 'events') {
      loadEvents();
    }
    if (activeTab === 'resources') {
      loadResources();
    }
    if (activeTab === 'experts') {
      loadMentores();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'experts') {
      loadMentores();
    }
  }, [activeTab]);

  // Recharger les stats après certaines actions
  const refreshStats = () => {
    loadStats();
    loadPendingMentors();
  };

  const loadPendingMentors = async () => {
    // 1. Essayer l'endpoint dédié
    try {
      const response = await Api.get('/users/admin/pending');
      const fromApi = response.data.mentors || [];
      if (fromApi.length > 0) {
        setPendingMentors(fromApi);
        return;
      }
    } catch (error) {
      console.error('Erreur /admin/pending (endpoint peut-être pas encore déployé):', error);
    }

    // 2. Repli: charger TOUS les utilisateurs et filtrer côté frontend
    try {
      const allResponse = await Api.get('/users/admin/all');
      const allUsers = allResponse.data.users || allResponse.data || [];
      const pending = allUsers.filter((u: User) => u.role === 'mentore' && u.isApproved === false);
      setPendingMentors(pending);
    } catch (err) {
      console.error('Erreur repli pending mentors:', err);
      setPendingMentors([]);
    }
  };

  const loadExperts = async () => {
    try {
      const response = await Api.get('/experts/all');
      console.log('Expertes chargées:', response.data); // Debug
      setExperts(response.data);
    } catch (error) {
      console.error('Erreur chargement expertes:', error);
      setExperts([]);
    }
  };

  const loadAvailableMentores = async () => {
    try {
      // Charger toutes les mentores depuis l'API utilisateurs
      const usersResponse = await Api.get('/users/admin/all');
      const allUsers = usersResponse.data.users || usersResponse.data;
      const allMentores = allUsers.filter(user => user.role === 'mentore');

      // Charger les expertes existantes
      const expertsResponse = await Api.get('/experts/all');
      const existingExperts = expertsResponse.data || [];
      const expertUserIds = existingExperts.map(expert => expert.user?._id || expert.user);

      // Filtrer les mentores qui ne sont pas encore expertes
      const availableMentores = allMentores.filter(mentore =>
        !expertUserIds.includes(mentore._id)
      );

      console.log('Toutes les mentores:', allMentores.length);
      console.log('Expertes existantes:', expertUserIds.length);
      console.log('Mentores disponibles:', availableMentores.length);

      setAvailableMentores(availableMentores);
    } catch (error) {
      console.error('Erreur chargement mentores disponibles:', error);
      setAvailableMentores([]);
    }
  };

  const addExpert = async () => {
    if (!newExpert.userId || !newExpert.domain) {
      alert('Veuillez sélectionner une mentore et spécifier son domaine d\'expertise');
      return;
    }

    setIsLoading(true);
    try {
      const expertData = {
        userId: newExpert.userId,
        domain: newExpert.domain,
        achievements: newExpert.achievements.filter(a => a.trim()),
        quote: newExpert.quote
      };

      await Api.post('/experts', expertData);

      setNewExpert({ userId: '', domain: '', achievements: [''], quote: '' });
      loadExperts();
      loadAvailableMentores();
      alert('Experte ajoutée avec succès');
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de l\'ajout');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExpert = async (expertId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette experte ?')) return;

    setIsLoading(true);
    try {
      await Api.delete(`/experts/${expertId}`);
      loadExperts();
      alert('Experte supprimée avec succès');
    } catch (error) {
      alert('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeatured = async (expertId: string) => {
    setIsLoading(true);
    try {
      await Api.put(`/experts/featured/${expertId}`);
      loadExperts();
      alert('Experte définie comme vedette');
    } catch (error) {
      alert('Erreur lors de la modification');
    } finally {
      setIsLoading(false);
    }
  };

  const loadResources = async () => {
    try {
      const response = await Api.get('/resources');
      setAdminResources(response.data);
    } catch (error) {
      setAdminResources([]);
    }
  };

  const addResource = async () => {
    if (!newResource.title || !newResource.description || !newResource.category) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!newResource.resourceFile) {
      alert('Veuillez sélectionner un fichier à uploader');
      return;
    }

    // Vérifier la taille du fichier (500MB max)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (newResource.resourceFile.size > maxSize) {
      alert(`Le fichier est trop volumineux. Taille maximum: 500MB. Taille actuelle: ${Math.round(newResource.resourceFile.size / (1024 * 1024))}MB`);
      return;
    }

    // Validation des types de fichiers
    const allowedTypes = {
      'pdf': ['application/pdf'],
      'article': ['application/pdf'],
      'video': ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo'],
      'guide': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    const fileType = newResource.resourceFile.type;
    const resourceType = newResource.type;

    if (!allowedTypes[resourceType]?.includes(fileType)) {
      alert(`Type de fichier non compatible. Pour ${resourceType}, utilisez: ${allowedTypes[resourceType]?.join(', ')}`);
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newResource.title);
      formData.append('description', newResource.description);
      formData.append('category', newResource.category);
      formData.append('type', newResource.type);
      formData.append('resourceFile', newResource.resourceFile);

      if (newResource.imageFile) {
        formData.append('image', newResource.imageFile);
      }

      const response = await Api.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Ressource ajoutée:', response.data);

      setNewResource({ title: '', description: '', category: '', type: 'pdf', fileUrl: '', resourceFile: null, imageFile: null });
      // Réinitialiser les inputs de fichier
      const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
      fileInputs.forEach(input => input.value = '');
      loadResources();
      alert('Ressource ajoutée avec succès');
    } catch (error) {
      console.error('Erreur détaillée:', error);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message serveur:', error.response?.data?.message);
      console.error('Erreur serveur:', error.response?.data?.error);
      console.error('Headers:', error.response?.headers);

      let errorMessage = 'Erreur lors de l\'ajout';
      if (error.response) {
        errorMessage = `Erreur ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'Erreur de connexion au serveur';
      } else {
        errorMessage = error.message;
      }

      alert(`Erreur: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const editResource = (resource: any) => {
    setEditingResource(resource);
    setNewResource({
      title: resource.title,
      description: resource.description,
      category: resource.category,
      type: resource.type,
      fileUrl: resource.fileUrl,
      resourceFile: null,
      imageFile: null
    });
    // Scroll to form
    const formElement = document.getElementById('resource-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingResource(null);
    setNewResource({ title: '', description: '', category: '', type: 'pdf', fileUrl: '', resourceFile: null, imageFile: null });
    const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
    fileInputs.forEach(input => input.value = '');
  };

  const updateResource = async () => {
    if (!editingResource) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newResource.title);
      formData.append('description', newResource.description);
      formData.append('category', newResource.category);
      formData.append('type', newResource.type);

      if (newResource.resourceFile) {
        formData.append('resourceFile', newResource.resourceFile);
      }
      if (newResource.imageFile) {
        formData.append('image', newResource.imageFile);
      }

      await Api.put(`/resources/${editingResource._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      cancelEdit();
      loadResources();
      alert('Ressource mise à jour avec succès');
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteResource = async (resourceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) return;

    setIsLoading(true);
    try {
      await Api.delete(`/resources/${resourceId}`);
      loadResources();
      alert('Ressource supprimée avec succès');
    } catch (error) {
      alert('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTestimonials = async () => {
    try {
      const response = await Api.get('/testimonials/all');
      setTestimonials(response.data);
    } catch (error) {
      setTestimonials([]);
    }
  };

  const loadMentees = async () => {
    try {
      const response = await Api.get('/users/admin/all');
      const allUsers = response.data.users || response.data;
      setMentees(allUsers.filter(user => user.role === 'mentoree'));
    } catch (error) {
      setMentees([]);
    }
  };

  const addTestimonial = async () => {
    if (!newTestimonial.menteeId || !newTestimonial.message.trim()) {
      alert('Veuillez sélectionner une mentorée et saisir un message');
      return;
    }

    setIsLoading(true);
    try {
      const selectedMentee = mentees.find(m => m._id === newTestimonial.menteeId);
      await Api.post('/testimonials/admin-create', {
        name: selectedMentee?.name,
        role: 'mentoree',
        message: newTestimonial.message,
        rating: newTestimonial.rating,
        avatar: selectedMentee?.photo ? `https://voix-avenir-backend.onrender.com${selectedMentee.photo}` : 'https://via.placeholder.com/50'
      });
      setNewTestimonial({ menteeId: '', message: '', rating: 5 });
      loadTestimonials();
      alert('Témoignage ajouté avec succès');
    } catch (error) {
      alert('Erreur lors de l\'ajout');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTestimonial = async (testimonialId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) return;

    setIsLoading(true);
    try {
      await Api.delete(`/testimonials/clear-all`);
      loadTestimonials();
      alert('Témoignages supprimés avec succès');
    } catch (error) {
      alert('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const [news, setNews] = useState([]);
  const [newNews, setNewNews] = useState({ title: '', summary: '', content: '', imageFile: null });
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', location: '', type: 'workshop', status: 'upcoming', resourceFile: null });

  const [mentores, setMentores] = useState([]);
  const [showMentoresList, setShowMentoresList] = useState(false);
  const [selectedMentore, setSelectedMentore] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMentores, setFilteredMentores] = useState([]);

  const loadNews = async () => {
    try {
      const response = await Api.get('/news');
      setNews(response.data);
    } catch (error) {
      setNews([]);
    }
  };

  const addNews = async () => {
    if (!newNews.title.trim() || !newNews.summary.trim()) {
      alert('Le titre et le résumé sont obligatoires');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newNews.title);
      formData.append('summary', newNews.summary);
      formData.append('content', newNews.content);

      if (newNews.imageFile) {
        formData.append('image', newNews.imageFile);
      }

      await Api.post('/news', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setNewNews({ title: '', summary: '', content: '', imageFile: null });
      loadNews();
      alert('Actualité ajoutée avec succès');
    } catch (error) {
      alert('Erreur lors de l\'ajout');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNews = async (newsId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) return;

    setIsLoading(true);
    try {
      await Api.delete(`/news/${newsId}`);
      loadNews();
      alert('Actualité supprimée avec succès');
    } catch (error) {
      alert('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await Api.get('/events');
      setEvents(response.data);
    } catch (error) {
      setEvents([]);
    }
  };

  const addEvent = async () => {
    if (!newEvent.title?.trim()) {
      alert('Le titre de l\'événement est obligatoire');
      return;
    }

    setIsLoading(true);
    try {
      // Créer d'abord l'événement sans fichier
      const eventData = {
        title: newEvent.title,
        description: newEvent.description || 'Description à venir',
        date: newEvent.date || new Date().toISOString(),
        location: newEvent.location || '',
        type: newEvent.type || 'workshop'
      };

      const response = await Api.post('/events', eventData);
      const eventId = response.data._id || response.data.id;

      // Fichier sélectionné mais pas d'upload automatique (endpoints non disponibles)

      setNewEvent({ title: '', description: '', date: '', location: '', type: 'workshop', status: 'upcoming', resourceFile: null });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      loadEvents();
      alert('Événement ajouté avec succès');
    } catch (error) {
      console.error('Erreur détaillée:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'ajout';
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

    setIsLoading(true);
    try {
      await Api.delete(`/events/${eventId}`);
      loadEvents();
      alert('Événement supprimé avec succès');
    } catch (error) {
      alert('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };



  const loadMentores = async () => {
    try {
      const response = await Api.get('/users/admin/all');
      const allUsers = response.data.users || response.data;
      const mentoresList = allUsers.filter(user => user.role === 'mentore');
      setMentores(mentoresList);
      setFilteredMentores(mentoresList);
    } catch (error) {
      setMentores([]);
      setFilteredMentores([]);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredMentores(mentores);
    } else {
      const filtered = mentores.filter(mentore =>
        mentore.name.toLowerCase().includes(term.toLowerCase()) ||
        mentore.email.toLowerCase().includes(term.toLowerCase()) ||
        mentore.city.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredMentores(filtered);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await Api.get('/users/admin/all');
      const allUsers = response.data.users || response.data;
      console.log('Utilisateurs chargés:', allUsers); // Debug
      setUsers(allUsers);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      setUsers([]);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await Api.get('/sessions');
      setRequests(response.data || []);
    } catch (error) {
      setRequests([]);
    }
  };

  const loadStats = async () => {
    try {
      const response = await Api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
      setStats({
        totalUsers: 0,
        totalMentores: 0,
        totalMentorees: 0,
        approvedMentores: 0,
        totalRequests: 0,
        pendingRequests: 0,
        acceptedRequests: 0
      });
    }
  };

  const loadPartners = async () => {
    try {
      const response = await Api.get('/partners');
      setPartners(response.data);
    } catch (error) {
      setPartners([]);
    }
  };

  const addPartner = async () => {
    if (!newPartner.name.trim()) {
      alert('Le nom du partenaire est obligatoire');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', newPartner.name);
      formData.append('website', newPartner.website);
      formData.append('description', newPartner.description);
      formData.append('isActive', 'true');

      if (newPartner.logoFile) {
        formData.append('logo', newPartner.logoFile);
      }

      await Api.post('/partners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setNewPartner({ name: '', logoFile: null, website: '', description: '' });
      loadPartners();
      refreshStats();
      alert('Partenaire ajouté avec succès');
    } catch (error) {
      console.error('Erreur détaillée:', error);
      let errorMessage = 'Erreur lors de l\'ajout du partenaire';

      if (error.response) {
        errorMessage = `Erreur ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'Erreur de connexion au serveur';
      } else {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePartner = async (partnerId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) return;

    setIsLoading(true);
    try {
      await Api.delete(`/partners/${partnerId}`);
      loadPartners();
      refreshStats();
      alert('Partenaire supprimé avec succès');
    } catch (error) {
      alert('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    setIsLoading(true);
    try {
      await Api.delete(`/users/admin/${userId}`);
      loadUsers();
      refreshStats();
      alert('Utilisateur supprimé avec succès');
    } catch (error) {
      alert('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Êtes-vous sûr de vouloir ${!currentStatus ? 'activer' : 'désactiver'} cet utilisateur ?`)) return;

    // Mettre à jour localement d'abord
    const updatedUsers = users.map(user =>
      user._id === userId ? { ...user, verified: !currentStatus } : user
    );
    setUsers(updatedUsers);

    try {
      await Api.put(`/users/admin/${userId}`, { verified: !currentStatus });
      refreshStats();
      alert(`Utilisateur ${!currentStatus ? 'activé' : 'désactivé'} avec succès`);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification du statut');
      // Restaurer l'état précédent en cas d'erreur
      setUsers(users.map(user =>
        user._id === userId ? { ...user, verified: currentStatus } : user
      ));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
            {getPhotoUrl(currentUser?.photo) ? (
              <img
                src={getPhotoUrl(currentUser?.photo)!}
                alt={currentUser?.name || ''}
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <UserIcon className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de Bord - Administrateur</h1>
            <p className="text-gray-600">Bienvenue <span className="text-purple-600 font-bold">{currentUser?.name}</span></p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
                <p className="text-sm text-gray-600">Total utilisateurs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-800">{stats.approvedMentores || 0} / {stats.totalMentores}</p>
                <p className="text-sm text-gray-600">Mentores (Approuvés / Total)</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <UserX className="w-6 h-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-800">{stats.totalMentorees}</p>
                <p className="text-sm text-gray-600">Mentorées</p>
              </div>
            </div>
          </div>




        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Vue d'ensemble
              </button>
              <button
                onClick={() => setActiveTab('approvals')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors flex items-center ${ activeTab === 'approvals'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <UserCheck className="w-4 h-4 inline mr-2" />
                Approbation Mentores
                {pendingMentors.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingMentors.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'users'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Gestion Utilisateurs
              </button>
              <button
                onClick={() => setActiveTab('partners')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'partners'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Partenaires
              </button>
              <button
                onClick={() => setActiveTab('experts')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'experts'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Femmes Expertes
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'resources'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Ressources
              </button>
              {(currentUser?.email === 'admin@mentora.gn' || currentUser?.isMasterAdmin) && (
                <button
                  onClick={() => setActiveTab('admins')}
                  className={`py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'admins'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Admins
                </button>
              )}

            </nav>
          </div>

          <div className="p-6">
            {/* ===== ONGLET APPROBATION MENTORES ===== */}
            {activeTab === 'approvals' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Approbation des Mentores</h3>
                  <button onClick={loadPendingMentors} className="text-sm text-purple-600 font-medium hover:underline">
                    Actualiser
                  </button>
                </div>
                {pendingMentors.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <UserCheck className="w-16 h-16 mx-auto mb-4 text-green-300" />
                    <p className="text-lg font-medium text-gray-500">Aucune mentore en attente d'approbation</p>
                    <p className="text-sm mt-1">Toutes les demandes ont été traitées.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pendingMentors.map(mentor => (
                      <div key={mentor._id} className="bg-white border border-gray-100 rounded-2xl shadow-md overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 flex items-center space-x-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-purple-200">
                            {getPhotoUrl(mentor.photo) ? (
                              <img src={getPhotoUrl(mentor.photo)!} alt={mentor.name} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display='none'; }} />
                            ) : (
                              <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                                <span className="text-xl font-bold text-purple-600">{mentor.name?.charAt(0)?.toUpperCase()}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">{mentor.name}</h4>
                            <p className="text-xs text-gray-500">{mentor.email}</p>
                            {mentor.city && <p className="text-xs text-purple-600 mt-0.5">📍 {mentor.city}</p>}
                          </div>
                        </div>
                        {/* Details */}
                        <div className="p-5 flex-1 space-y-3">
                          {mentor.profession && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Profession</p>
                              <p className="text-sm text-gray-700">{mentor.profession}</p>
                            </div>
                          )}
                          {mentor.expertise && mentor.expertise.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Expertises</p>
                              <div className="flex flex-wrap gap-1">
                                {(Array.isArray(mentor.expertise) ? mentor.expertise : [mentor.expertise]).map((e: string, i: number) => (
                                  <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">{e}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {mentor.bio && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Biographie</p>
                              <p className="text-sm text-gray-600 line-clamp-4">{mentor.bio}</p>
                            </div>
                          )}
                          {!mentor.profession && !mentor.bio && (!mentor.expertise || mentor.expertise.length === 0) && (
                            <p className="text-sm text-gray-400 italic">Profil incomplet — aucune expertise ou bio renseignée.</p>
                          )}
                        </div>
                        {/* Actions */}
                        <div className="p-5 pt-0 space-y-2">
                          <div className="flex space-x-2">
                            <button
                              onClick={async () => {
                                try {
                                  await Api.put(`/users/admin/approve/${mentor._id}`);
                                  await loadPendingMentors();
                                  await refreshStats();
                                  alert(`${mentor.name} a été approuvée !`);
                                } catch (err) { alert('Erreur lors de l\'approbation'); }
                              }}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-bold text-sm transition-colors"
                            >
                              ✅ Approuver
                            </button>
                            <button
                              onClick={() => setRejectingId(mentor._id!)}
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-bold text-sm transition-colors"
                            >
                              ❌ Rejeter
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Modal de rejet */}
                {rejectingId && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                      <h4 className="font-bold text-lg mb-4 text-gray-800">Raison du rejet (optionnel)</h4>
                      <textarea
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-red-400 outline-none"
                        rows={4}
                        placeholder="Ex: Profil incomplet, expertise non vérifiable..."
                      />
                      <div className="flex space-x-2 mt-4">
                        <button onClick={() => { setRejectingId(null); setRejectReason(''); }} className="flex-1 border-2 border-gray-100 py-2 rounded-xl font-bold text-sm">
                          Annuler
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              // Essayer le nouvel endpoint dédié
                              try {
                                await Api.put(`/users/admin/reject/${rejectingId}`, { reason: rejectReason });
                              } catch {
                                // Repli: utiliser l'endpoint de mise à jour existant
                                await Api.put(`/users/admin/${rejectingId}`, { isApproved: false, verified: false });
                              }
                              setRejectingId(null);
                              setRejectReason('');
                              await loadPendingMentors();
                              await refreshStats();
                              alert('Mentore rejetée.');
                            } catch (err: any) {
                              alert(`Erreur: ${err?.response?.data?.message || err?.message || 'Erreur inconnue'}`);
                            }
                          }}
                          className="flex-1 bg-red-500 text-white py-2 rounded-xl font-bold text-sm"
                        >
                          Confirmer le rejet
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'overview' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Vue d'ensemble de la plateforme</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                    <h4 className="text-lg font-semibold mb-4">Activité récente</h4>
                    <div className="space-y-2">
                      <p className="text-sm opacity-90">• {stats.totalUsers} utilisateurs inscrits</p>
                      <p className="text-sm opacity-90">• {stats.pendingRequests} demandes en attente</p>
                      <p className="text-sm opacity-90">• {stats.acceptedRequests} mentorats actifs</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
                    <h4 className="text-lg font-semibold mb-4">Répartition des rôles</h4>
                    <div className="space-y-2">
                      <p className="text-sm opacity-90">• {stats.totalMentores} mentores actives</p>
                      <p className="text-sm opacity-90">• {stats.totalMentorees} mentorées inscrites</p>
                      <p className="text-sm opacity-90">• Ratio: {stats.totalMentores > 0 ? Math.round(stats.totalMentorees / stats.totalMentores) : 0}:1</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Gestion des Utilisateurs</h3>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                              <p>Aucun utilisateur trouvé</p>
                            </td>
                          </tr>
                        ) : (
                          users.map((user) => (
                            <tr key={user._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                                    {getPhotoUrl(user.photo) ? (
                                      <img src={getPhotoUrl(user.photo)!} alt={user.name} className="w-10 h-10 object-cover" />
                                    ) : (
                                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {user.name?.charAt(0)?.toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                  user.role === 'mentore' ? 'bg-purple-100 text-purple-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                  {user.role === 'mentore' ? 'Mentore' : user.role === 'mentoree' ? 'Mentorée' : 'Admin'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {user.verified ? 'Vérifié' : 'Non vérifié'}
                                </span>
                                {user.role === 'mentore' && (
                                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${user.isApproved ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {user.isApproved ? 'Approuvé' : 'En attente'}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <button
                                  onClick={() => deleteUser(user._id!)}
                                  className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                  Supprimer
                                </button>
                                {user.role === 'mentore' && !user.isApproved && (
                                  <button
                                    onClick={async () => {
                                      if (confirm(`Approuver ${user.name} en tant que mentor ?`)) {
                                        try {
                                          await Api.put(`/users/admin/approve/${user._id}`);
                                          await loadUsers();
                                          await refreshStats();
                                          alert('Mentor approuvé');
                                        } catch (err) {
                                          alert('Erreur lors de l\'approbation');
                                        }
                                      }
                                    }}
                                    className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors disabled:opacity-50"
                                  >
                                    Approuver
                                  </button>
                                )}
                                <button
                                  onClick={() => toggleUserStatus(user._id!, user.verified || false)}
                                  className={`px-3 py-1 rounded text-xs transition-colors disabled:opacity-50 ${user.verified ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                  {user.verified ? 'Désactiver' : 'Activer'}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Demandes de Mentorat</h3>
                <div className="space-y-4">
                  {requests.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>Aucune demande de mentorat pour le moment</p>
                    </div>
                  ) : (
                    requests.map((request) => (
                      <div key={request._id} className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-lg mb-2">
                              Demande de {request.mentoree?.name || 'Utilisateur'}
                            </h4>
                            <p className="text-gray-600 mb-4">{request.message}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Mentore: {request.mentore?.name || 'Non spécifiée'}</span>
                              <span>Date: {new Date(request.createdAt).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                              {request.status === 'pending' ? 'En attente' :
                                request.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'partners' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Gestion des Partenaires</h3>

                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Ajouter un nouveau partenaire</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nom du partenaire"
                      value={newPartner.name}
                      onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="url"
                      placeholder="Site web"
                      value={newPartner.website}
                      onChange={(e) => setNewPartner({ ...newPartner, website: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewPartner({ ...newPartner, logoFile: file });
                        }
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <textarea
                      placeholder="Description"
                      value={newPartner.description}
                      onChange={(e) => setNewPartner({ ...newPartner, description: e.target.value })}
                      className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    ></textarea>
                  </div>
                  <button
                    onClick={addPartner}
                    disabled={isLoading}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Ajout...' : 'Ajouter le partenaire'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {partners.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-gray-500">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>Aucun partenaire pour le moment</p>
                    </div>
                  ) : (
                    partners.map((partner) => (
                      <div key={partner._id} className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center flex-1 min-w-0">
                            {partner.logo && (
                              <img
                                src={(partner.logo.startsWith('http') || partner.logo.startsWith('data:')) ? partner.logo : `${BASE_URL}${partner.logo}`}
                                alt={partner.name}
                                className="w-16 h-16 object-contain mr-4 flex-shrink-0"
                                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/64?text=Logo'; }}
                              />
                            )}
                            <div className="min-w-0">
                              <h4 className="font-bold text-gray-800 text-lg truncate">{partner.name}</h4>
                              {partner.website && (
                                <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 text-sm hover:underline block break-all">
                                  {partner.website}
                                </a>
                              )}
                              {partner.description && (
                                <p className="text-gray-600 text-sm mt-2">{partner.description}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => deletePartner(partner._id)}
                            className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'testimonials' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Gestion des Témoignages</h3>

                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Ajouter un nouveau témoignage</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner une mentorée</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Rechercher une mentorée par nom, email ou ville..."
                          value={searchTerm}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                        {searchTerm && mentees.filter(mentee =>
                          mentee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          mentee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          mentee.city.toLowerCase().includes(searchTerm.toLowerCase())
                        ).length > 0 && (
                            <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto border border-gray-300 rounded-lg bg-white shadow-lg">
                              <div className="divide-y divide-gray-200">
                                {mentees.filter(mentee =>
                                  mentee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  mentee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  mentee.city.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map((mentee) => (
                                  <div
                                    key={mentee._id}
                                    onClick={() => {
                                      setNewTestimonial({ ...newTestimonial, menteeId: mentee._id });
                                      setSearchTerm(mentee.name);
                                    }}
                                    className="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                        {mentee.photo ? (
                                          <img
                                            src={`https://voix-avenir-backend.onrender.com${mentee.photo}`}
                                            alt={mentee.name}
                                            className="w-8 h-8 object-cover"
                                          />
                                        ) : (
                                          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                            {mentee.name?.charAt(0)?.toUpperCase()}
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-800 text-sm">{mentee.name}</p>
                                        <p className="text-xs text-gray-500">{mentee.email} - {mentee.city}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                    <textarea
                      placeholder="Message du témoignage"
                      rows={3}
                      value={newTestimonial.message}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, message: e.target.value })}
                      className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    ></textarea>
                    <select
                      value={newTestimonial.rating}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={5}>5 étoiles</option>
                      <option value={4}>4 étoiles</option>
                      <option value={3}>3 étoiles</option>
                    </select>
                  </div>
                  <button
                    onClick={addTestimonial}
                    disabled={isLoading}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Ajout...' : 'Ajouter le témoignage'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {testimonials.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-gray-500">
                      <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>Aucun témoignage pour le moment</p>
                    </div>
                  ) : (
                    testimonials.map((testimonial) => (
                      <div key={testimonial._id} className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex mb-4">
                          {[...Array(testimonial.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <p className="text-gray-600 italic mb-4">"{testimonial.message}"</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                              {(testimonial.adminCreated?.avatar || testimonial.mentee?.photo) ? (
                                <img
                                  src={getPhotoUrl(testimonial.adminCreated?.avatar || testimonial.mentee?.photo)!}
                                  alt={testimonial.adminCreated?.name || testimonial.mentee?.name}
                                  className="w-10 h-10 object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className={`w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold ${(testimonial.adminCreated?.avatar || testimonial.mentee?.photo) ? 'hidden' : ''}`}>
                                {(testimonial.adminCreated?.name || testimonial.mentee?.name)?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{testimonial.adminCreated?.name || testimonial.mentee?.name}</p>
                              <p className="text-sm text-gray-600">{testimonial.adminCreated?.role || testimonial.mentee?.role || 'Mentorée'}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteTestimonial(testimonial._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'experts' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Gestion des Femmes Expertes</h3>

                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Promouvoir une mentore comme experte</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner une mentore *</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Rechercher une mentore par nom, email ou ville..."
                          value={searchTerm}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                        {searchTerm && filteredMentores.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto border border-gray-300 rounded-lg bg-white shadow-lg">
                            <div className="divide-y divide-gray-200">
                              {filteredMentores.map((mentore, index) => (
                                <div
                                  key={mentore._id}
                                  onClick={() => {
                                    setNewExpert({
                                      ...newExpert,
                                      userId: mentore._id,
                                      domain: mentore.profession || ''
                                    });
                                    setSelectedMentore(mentore._id);
                                    setSearchTerm('');
                                  }}
                                  className="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                      {mentore.photo ? (
                                        <img
                                          src={getPhotoUrl(mentore.photo)!}
                                          alt={mentore.name}
                                          className="w-8 h-8 object-cover"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                          {mentore.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-800 text-sm">{mentore.name}</p>
                                      <p className="text-xs text-gray-500">{mentore.email} - {mentore.city}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Total mentores: {mentores.length} | Sélectionnée: {selectedMentore ? filteredMentores.find(m => m._id === selectedMentore)?.name : 'Aucune'}
                      </p>
                    </div>
                    <input
                      type="text"
                      placeholder="Domaine d'expertise *"
                      value={newExpert.domain}
                      onChange={(e) => setNewExpert({ ...newExpert, domain: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <textarea
                      placeholder="Citation inspirante"
                      rows={2}
                      value={newExpert.quote}
                      onChange={(e) => setNewExpert({ ...newExpert, quote: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    ></textarea>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Réalisations</label>
                      {newExpert.achievements.map((achievement, index) => (
                        <div key={index} className="flex mb-2">
                          <input
                            type="text"
                            placeholder={`Réalisation ${index + 1}`}
                            value={achievement}
                            onChange={(e) => {
                              const newAchievements = [...newExpert.achievements];
                              newAchievements[index] = e.target.value;
                              setNewExpert({ ...newExpert, achievements: newAchievements });
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newAchievements = newExpert.achievements.filter((_, i) => i !== index);
                              setNewExpert({ ...newExpert, achievements: newAchievements });
                            }}
                            className="ml-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            −
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setNewExpert({ ...newExpert, achievements: [...newExpert.achievements, ''] })}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        + Ajouter une réalisation
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={addExpert}
                    disabled={isLoading}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Ajout...' : 'Ajouter l\'experte'}
                  </button>
                </div>

                <div className="mb-4 text-sm text-gray-600">
                  Nombre d'expertes: {experts.length}
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {experts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>Aucune experte pour le moment</p>
                      <p className="text-xs mt-2">Vérifiez la console pour plus d'infos</p>
                    </div>
                  ) : (
                    experts.map((expert) => (
                      <div key={expert._id} className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-4">
                              {expert.user?.photo && (
                                <img
                                  src={getPhotoUrl(expert.user.photo)!}
                                  alt={expert.user.name}
                                  className="w-16 h-16 rounded-full object-cover mr-4"
                                />
                              )}
                              <div>
                                <h4 className="font-bold text-gray-800 text-lg">{expert.user?.name}</h4>
                                <p className="text-purple-600 font-medium">{expert.user?.profession}</p>
                                <p className="text-gray-500 text-sm">{expert.user?.email} - {expert.user?.city}</p>
                                <span className="inline-block bg-purple-100 px-2 py-1 rounded text-xs text-purple-700 mt-1">
                                  {expert.domain}
                                </span>
                                {expert.isFeatured && (
                                  <span className="ml-2 inline-block bg-yellow-100 px-2 py-1 rounded text-xs text-yellow-700">
                                    ★ Vedette
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-600 mb-4">{expert.user?.bio}</p>
                            {expert.quote && (
                              <blockquote className="border-l-4 border-purple-300 pl-3 mb-4 italic text-gray-600">
                                "{expert.quote}"
                              </blockquote>
                            )}
                            {expert.achievements?.length > 0 && (
                              <div className="mb-4">
                                <h5 className="font-semibold text-gray-800 mb-2">Réalisations:</h5>
                                <ul className="list-disc list-inside text-sm text-gray-600">
                                  {expert.achievements.map((achievement, index) => (
                                    <li key={index}>{achievement}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="ml-4 flex flex-col space-y-2">
                            <button
                              onClick={() => toggleFeatured(expert._id)}
                              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                            >
                              {expert.isFeatured ? 'Retirer vedette' : 'Définir vedette'}
                            </button>
                            <button
                              onClick={() => deleteExpert(expert._id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Gestion des Ressources</h3>

                <div id="resource-form" className="bg-gray-50 rounded-xl p-6 mb-6 border-2 border-purple-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    {editingResource ? 'Modifier la ressource' : 'Ajouter une nouvelle ressource'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Titre de la ressource *"
                      value={newResource.title}
                      onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <select
                      value={newResource.category}
                      onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Sélectionner une catégorie *</option>
                      <option value="Orientation">Orientation</option>
                      <option value="Education">Education</option>
                      <option value="Opportunités">Opportunités</option>
                      <option value="Inspiration">Inspiration</option>
                      <option value="Développement personnel">Développement personnel</option>
                      <option value="Technologie">Technologie</option>
                      <option value="Guides pratiques">Guides pratiques</option>
                      <option value="Autre">Autre</option>
                    </select>
                    <select
                      value={newResource.type}
                      onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="pdf">Article</option>
                      <option value="video">Vidéo</option>
                      <option value="guide">Guides</option>
                    </select>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Fichier de ressource *</label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.mp4,.avi,.mov,.wmv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewResource({ ...newResource, resourceFile: file, fileUrl: '' });
                          }
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 w-full"
                      />
                      <p className="text-xs text-gray-500">Formats acceptés: Article (PDF), DOC, DOCX, MP4, AVI, MOV, WMV (max 500MB)</p>
                    </div>

                    <textarea
                      placeholder="Description de la ressource *"
                      rows={3}
                      value={newResource.description}
                      onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                      className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    ></textarea>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={editingResource ? updateResource : addResource}
                      disabled={isLoading}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex-1"
                    >
                      {isLoading ? 'Traitement...' : editingResource ? 'Mettre à jour' : 'Ajouter la ressource'}
                    </button>
                    {editingResource && (
                      <button
                        onClick={cancelEdit}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Rechercher une ressource..."
                      value={resourceSearch}
                      onChange={(e) => setResourceSearch(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <select
                    value={resourceCategoryFilter}
                    onChange={(e) => setResourceCategoryFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Toutes les catégories</option>
                    <option value="Orientation">Orientation</option>
                    <option value="Education">Education</option>
                    <option value="Opportunités">Opportunités</option>
                    <option value="Inspiration">Inspiration</option>
                    <option value="Développement personnel">Développement personnel</option>
                    <option value="Technologie">Technologie</option>
                    <option value="Guides pratiques">Guides pratiques</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {adminResources.filter(r =>
                    (!resourceCategoryFilter || r.category === resourceCategoryFilter) &&
                    (!resourceSearch || r.title.toLowerCase().includes(resourceSearch.toLowerCase()) || r.description.toLowerCase().includes(resourceSearch.toLowerCase()))
                  ).length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>Aucune ressource pour le moment</p>
                    </div>
                  ) : (
                    adminResources.map((resource) => (
                      <div key={resource._id} className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium mr-2">
                                {resource.type === 'pdf' ? 'ARTICLE' : resource.type?.toUpperCase()}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {resource.category}
                              </span>
                            </div>
                            <h4 className="font-bold text-gray-800 text-lg mb-2">{resource.title}</h4>
                            <p className="text-gray-600 mb-4">{resource.description}</p>
                            {resource.fileUrl && (
                              <div className="mt-2">
                                {resource.type === 'video' ? (
                                  <div className="text-sm text-gray-600">
                                    <span className="inline-block bg-blue-100 px-2 py-1 rounded text-xs mr-2">Vidéo uploadée</span>
                                    <a href={`https://voix-avenir-backend.onrender.com${resource.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                                      Voir la vidéo
                                    </a>
                                  </div>
                                ) : (
                                  <a href={`https://voix-avenir-backend.onrender.com${resource.fileUrl}`} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline text-sm">
                                    Lien vers la ressource
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                          {resource.image && (
                            <div className="ml-4">
                              <img
                                src={`https://voix-avenir-backend.onrender.com${resource.image}`}
                                alt={resource.title}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex justify-end gap-3">
                          <button
                            onClick={() => editResource(resource)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
                          >
                            <Edit className="w-4 h-4 mr-1" /> Modifier
                          </button>
                          <button
                            onClick={() => deleteResource(resource._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Supprimer
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'news' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Gestion des Actualités</h3>

                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Ajouter une nouvelle actualité</h4>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Titre de l'actualité"
                      value={newNews.title}
                      onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <textarea
                      placeholder="Résumé de l'actualité"
                      rows={3}
                      value={newNews.summary}
                      onChange={(e) => setNewNews({ ...newNews, summary: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    ></textarea>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewNews({ ...newNews, imageFile: file });
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button
                    onClick={addNews}
                    disabled={isLoading}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Ajout...' : 'Ajouter l\'actualité'}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {news.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>Aucune actualité pour le moment</p>
                    </div>
                  ) : (
                    news.map((item) => (
                      <div key={item._id} className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-lg mb-2">{item.title}</h4>
                            <p className="text-gray-600 mb-4">{item.summary}</p>
                            <p className="text-sm text-gray-400">
                              {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          {item.image && (
                            <div className="ml-4">
                              <img
                                src={getPhotoUrl(item.image)!}
                                alt={item.title}
                                className="w-24 h-24 object-cover rounded-lg mb-2"
                              />
                              <a
                                href={getPhotoUrl(item.image)!}
                                download
                                className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                              >
                                📥 Télécharger
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => deleteNews(item._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Gestion des Événements</h3>

                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Ajouter un nouvel événement</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Titre de l'événement"
                      value={newEvent.title || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date et heure *</label>
                      <input
                        type="datetime-local"
                        value={newEvent.date || ''}
                        onChange={(e) => {
                          setNewEvent({ ...newEvent, date: e.target.value });
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type d'événement</label>
                      <select
                        value={newEvent.type || 'workshop'}
                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 w-full"
                      >
                        <option value="workshop">Atelier</option>
                        <option value="webinar">Webinaire</option>
                        <option value="conference">Conférence</option>
                        <option value="networking">Networking</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Statut de l'événement</label>
                      <select
                        value={newEvent.status || 'upcoming'}
                        onChange={(e) => {
                          const status = e.target.value;
                          let date = newEvent.date;

                          // Auto-ajuster la date selon le statut
                          if (status === 'past' && (!date || new Date(date) >= new Date())) {
                            // Définir une date passée par défaut
                            const pastDate = new Date();
                            pastDate.setMonth(pastDate.getMonth() - 1);
                            date = pastDate.toISOString().slice(0, 16);
                          } else if (status === 'upcoming' && (!date || new Date(date) < new Date())) {
                            // Définir une date future par défaut
                            const futureDate = new Date();
                            futureDate.setMonth(futureDate.getMonth() + 1);
                            date = futureDate.toISOString().slice(0, 16);
                          }

                          setNewEvent({ ...newEvent, status, date });
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 w-full"
                      >
                        <option value="upcoming">À venir</option>
                        <option value="past">Passé</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="Lieu (optionnel)"
                      value={newEvent.location || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Document/Vidéo (optionnel)</label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov,.wmv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewEvent({ ...newEvent, resourceFile: file });
                          }
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">PDF, DOC, PPT, MP4, AVI, MOV, WMV (upload manuel requis)</p>
                    </div>
                    <textarea
                      placeholder="Description de l'événement"
                      rows={3}
                      value={newEvent.description || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    ></textarea>
                  </div>
                  <button
                    onClick={addEvent}
                    disabled={isLoading}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Ajout...' : 'Ajouter l\'événement'}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {events.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>Aucun événement pour le moment</p>
                    </div>
                  ) : (
                    events.map((event) => (
                      <div key={event._id} className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-gray-800 text-lg">{event.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${event.type === 'workshop' ? 'bg-green-100 text-green-700' :
                                event.type === 'webinar' ? 'bg-blue-100 text-blue-700' :
                                  event.type === 'conference' ? 'bg-purple-100 text-purple-700' :
                                    event.type === 'networking' ? 'bg-orange-100 text-orange-700' :
                                      'bg-gray-100 text-gray-700'
                                }`}>
                                {event.type === 'workshop' ? 'Atelier' :
                                  event.type === 'webinar' ? 'Webinaire' :
                                    event.type === 'conference' ? 'Conférence' :
                                      event.type === 'networking' ? 'Networking' :
                                        event.type || 'Événement'}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${new Date(event.date) >= new Date() ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {new Date(event.date) >= new Date() ? 'À venir' : 'Passé'}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{event.description}</p>
                            <div className="text-sm text-gray-500 space-y-1">
                              <p>📅 {new Date(event.date).toLocaleDateString('fr-FR')} à {new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                              {event.location && <p>📍 {event.location}</p>}
                            </div>

                          </div>
                          {(event.documents?.length > 0 || event.videos?.length > 0) && (
                            <div className="ml-4">
                              <div className="text-sm text-gray-600 space-y-1">
                                {event.documents?.length > 0 && (
                                  <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                                    📄 {event.documents.length} document(s)
                                  </div>
                                )}
                                {event.videos?.length > 0 && (
                                  <div className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                                    🎥 {event.videos.length} vidéo(s)
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => deleteEvent(event._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'admins' && (currentUser?.email === 'admin@mentora.gn' || currentUser?.isMasterAdmin) && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Gestion des Administrateurs</h3>

                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Ajouter un nouvel administrateur</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Nom complet"
                      value={newAdmin.name}
                      onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="email"
                      placeholder="Adresse email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="password"
                      placeholder="Mot de passe"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
                        alert('Tous les champs sont obligatoires');
                        return;
                      }
                      try {
                        await Api.post('/auth/create-admin', newAdmin);
                        setNewAdmin({ name: '', email: '', password: '' });
                        loadUsers();
                        alert('Administrateur créé avec succès');
                      } catch (error) {
                        alert('Erreur: ' + (error.response?.data?.message || 'Erreur de création'));
                      }
                    }}
                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Créer l'administrateur
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Administrateur</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.filter(user => user.role === 'admin').map((admin) => (
                          <tr key={admin._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                  {admin.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {admin.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Administrateur
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {admin._id !== currentUser?.id && admin.email !== 'admin@mentora.gn' && (
                                <button
                                  onClick={() => deleteUser(admin._id!)}
                                  className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                                >
                                  Supprimer
                                </button>
                              )}
                              {admin.email === 'admin@mentora.gn' && (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                                  Admin Principal
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
