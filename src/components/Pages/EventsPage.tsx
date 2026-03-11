import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Star, ChevronRight, Play, Search } from 'lucide-react';
import Api from '../../data/Api';

interface EventsPageProps {
  onNavigate: (page: string) => void;
}

const EventsPage: React.FC<EventsPageProps> = ({ onNavigate }) => {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterTime, setFilterTime] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadEventId, setUploadEventId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalParticipants: 0,
    totalReplays: 0,
    averageRating: 0
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await Api.get('/events');
      const eventsData = response.data || [];
      console.log('Événements chargés:', eventsData.length);
      if (eventsData.length > 0) {
        console.log('Premier événement:', eventsData[0]);
      }
      setEvents(eventsData);

      // Calculer les statistiques dynamiquement
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthEvents = eventsData.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
      });

      setStats({
        totalEvents: thisMonthEvents.length,
        totalParticipants: eventsData.reduce((sum, event) => sum + (event.participants || 0), 0),
        totalReplays: eventsData.filter(event => new Date(event.date) < new Date()).length,
        averageRating: eventsData.length > 0 ? eventsData.reduce((sum, event) => sum + (event.rating || 4.8), 0) / eventsData.length : 4.8
      });
    } catch (error) {
      console.error('Erreur chargement événements:', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = (eventId: string) => {
    alert('Inscription confirmée ! Vous recevrez un email de confirmation.');
    setSelectedEvent(null);
  };

  const handleUploadDocument = async (eventId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('eventId', eventId);

      const response = await Api.post(`/events/${eventId}/documents`, formData);

      // Mise à jour dynamique de l'état
      setEvents(prevEvents =>
        prevEvents.map(event =>
          (event._id || event.id) === eventId
            ? {
              ...event,
              documents: [...(event.documents || []), response.data]
            }
            : event
        )
      );

      alert('Document ajouté avec succès !');
      setShowUploadModal(false);
    } catch (error) {
      alert('Erreur lors de l\'ajout du document');
    }
  };

  const handleUploadVideo = async (eventId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('eventId', eventId);

      const response = await Api.post(`/events/${eventId}/videos`, formData);

      // Mise à jour dynamique de l'état
      setEvents(prevEvents =>
        prevEvents.map(event =>
          (event._id || event.id) === eventId
            ? {
              ...event,
              videos: [...(event.videos || []), response.data]
            }
            : event
        )
      );

      alert('Vidéo ajoutée avec succès !');
      setShowUploadModal(false);
    } catch (error) {
      alert('Erreur lors de l\'ajout de la vidéo');
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'webinar':
        return 'bg-blue-100 text-blue-700';
      case 'workshop':
        return 'bg-green-100 text-green-700';
      case 'conference':
        return 'bg-purple-100 text-purple-700';
      case 'networking':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'webinar':
        return 'Webinaire';
      case 'workshop':
        return 'Atelier';
      case 'conference':
        return 'Conférence';
      case 'networking':
        return 'Networking';
      default:
        return type;
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesTime = filterTime === 'all' ||
      (filterTime === 'upcoming' && new Date(event.date) >= new Date()) ||
      (filterTime === 'past' && new Date(event.date) < new Date());
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesTime && matchesSearch;
  });

  const upcomingEvents = filteredEvents.filter(event => new Date(event.date) >= new Date());
  const pastEvents = filteredEvents.filter(event => new Date(event.date) < new Date());

  console.log('Événements filtrés:', filteredEvents.length);
  console.log('À venir:', upcomingEvents.length);
  console.log('Passés:', pastEvents.length);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Événements & Ateliers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Participez à nos webinaires, ateliers et conférences pour développer vos compétences et élargir votre réseau
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalEvents}</p>
            <p className="text-sm text-gray-600">Événements ce mois</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalParticipants}</p>
            <p className="text-sm text-gray-600">Participantes inscrites</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Play className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalReplays}</p>
            <p className="text-sm text-gray-600">Replays disponibles</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.averageRating}/5</p>
            <p className="text-sm text-gray-600">Satisfaction moyenne</p>
          </div>
        </div>

        {/* Filtres & Catégories */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par mot-clé (Leadership, Tech, CV...)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-4">
              <select
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filterTime}
                onChange={(e) => setFilterTime(e.target.value)}
              >
                <option value="upcoming">À venir</option>
                <option value="past">Passés</option>
                <option value="all">Tous</option>
              </select>

              <select
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Tous types</option>
                <option value="workshop">Ateliers</option>
                <option value="webinar">Webinaires</option>
                <option value="networking">Networking</option>
              </select>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Événements à Venir</h2>
            <button
              onClick={() => setFilterTime('all')}
              className="text-purple-600 hover:text-purple-800 font-medium flex items-center space-x-1"
            >
              <span>Voir le calendrier complet</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des événements...</p>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun événement à venir</h3>
              <p className="text-gray-500">Revenez bientôt pour découvrir nos prochains événements</p>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {upcomingEvents.map((event) => (
                <div key={event._id || event.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.image || '/api/placeholder/400/250'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/400/250';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEventTypeColor(event.type || 'default')}`}>
                        {getEventTypeLabel(event.type || 'Événement')}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm">{new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4">
                      {event.description}
                    </p>

                    {/* Affichage dynamique des documents et vidéos */}
                    {(event.documents?.length > 0 || event.videos?.length > 0) && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        {event.documents?.length > 0 && (
                          <div className="mb-3">
                            <span className="text-xs font-medium text-gray-700 block mb-2">Documents:</span>
                            <div className="space-y-1">
                              {event.documents.map((doc, index) => (
                                <a
                                  key={index}
                                  href={`http://localhost:5001${doc.fileUrl || doc.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-purple-600 hover:text-purple-800 underline block"
                                >
                                  📄 {doc.filename || doc.name || `Document ${index + 1}`}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        {event.videos?.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-gray-700 block mb-2">Vidéos:</span>
                            <div className="space-y-1">
                              {event.videos.map((video, index) => (
                                <a
                                  key={index}
                                  href={`http://localhost:5001${video.fileUrl || video.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-red-600 hover:text-red-800 underline block"
                                >
                                  🎥 {video.filename || video.name || `Vidéo ${index + 1}`}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Users className="w-4 h-4 mr-1" />
                      <span>Organisateur: Voix D'avenir</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Places disponibles
                      </div>
                      <button
                        onClick={() => setSelectedEvent(event._id || event.id)}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                      >
                        S'inscrire
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Events / Recordings */}
        {(filterTime === 'past' || filterTime === 'all') && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Replays Disponibles</h2>

            {pastEvents.length === 0 ? (
              <div className="text-center py-12">
                <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun replay disponible</h3>
                <p className="text-gray-500">Les enregistrements des événements passés apparaîtront ici</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((event) => (
                  <div key={event._id || event.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                    <div className="relative h-40 overflow-hidden rounded-t-xl">
                      <img
                        src={event.image || '/api/placeholder/400/250'}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/400/250';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <button className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all transform hover:scale-110">
                          <Play className="w-6 h-6 text-purple-600 ml-1" />
                        </button>
                      </div>
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        REPLAY
                      </div>
                    </div>

                    <div className="p-4">
                      <h4 className="font-bold text-gray-800 mb-2">{event.title}</h4>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>

                      {/* Affichage dynamique des ressources */}
                      {(event.documents?.length > 0 || event.videos?.length > 0) && (
                        <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                          {event.documents?.length > 0 && (
                            <div className="mb-2">
                              <span className="text-purple-600 font-medium block mb-1">📄 Documents:</span>
                              {event.documents.map((doc, index) => (
                                <a
                                  key={index}
                                  href={`http://localhost:5001${doc.fileUrl || doc.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:text-purple-800 underline block ml-2"
                                >
                                  {doc.filename || doc.name || `Document ${index + 1}`}
                                </a>
                              ))}
                            </div>
                          )}
                          {event.videos?.length > 0 && (
                            <div>
                              <span className="text-red-600 font-medium block mb-1">🎥 Vidéos:</span>
                              {event.videos.map((video, index) => (
                                <a
                                  key={index}
                                  href={`http://localhost:5001${video.fileUrl || video.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-600 hover:text-red-800 underline block ml-2"
                                >
                                  {video.filename || video.name || `Vidéo ${index + 1}`}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                        <span>{event.participants} participants</span>
                      </div>

                      <button className="w-full py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium flex items-center justify-center">
                        <Play className="w-4 h-4 mr-2" />
                        Voir le replay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Newsletter Subscription */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ne Ratez Aucun Événement</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Inscrivez-vous à notre newsletter pour être informée en priorité de nos prochains événements
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-opacity-90 transition-all font-semibold">
              S'abonner
            </button>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Ajouter Document/Vidéo
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document (PDF, DOC, etc.)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && uploadEventId) {
                      handleUploadDocument(uploadEventId, file);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vidéo (MP4, AVI, etc.)
                </label>
                <input
                  type="file"
                  accept=".mp4,.avi,.mov,.wmv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && uploadEventId) {
                      handleUploadVideo(uploadEventId, file);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadEventId(null);
                }}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Inscription à l'Événement
            </h3>
            <p className="text-gray-600 mb-6">
              Confirmez votre inscription à cet événement. Vous recevrez un email avec les détails de connexion.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Votre nom complet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleRegister(selectedEvent)}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;