import React, { useState, useEffect } from 'react';
import { Search, Download, Play, FileText, Filter, BookOpen, Star, Eye, X } from 'lucide-react';
import Api from '../../data/Api';

interface ResourcesPageProps {
  onNavigate: (page: string) => void;
}

const ResourcesPage: React.FC<ResourcesPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showAllResources, setShowAllResources] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareResource, setShareResource] = useState({
    title: '', description: '', category: '', type: 'pdf', 
    fileUrl: '', resourceFile: null
  });

  const [categories, setCategories] = useState(['Tous']);
  const [types, setTypes] = useState(['Tous', 'Article', 'Vidéo', 'Guide']);

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    // Catégories statiques comme dans le dashboard admin
    const allCategories = [
      'Tous', 'Leadership', 'Entrepreneuriat', 'Technologie', 'Santé', 'Éducation', 'Finance',
      'Développement Personnel', 'Communication', 'Gestion de Projet', 'Marketing', 'Ressources Humaines',
      'Innovation', 'Networking', 'Équilibre Vie-Travail', 'Confiance en Soi', 'Négociation',
      'Prise de Parole', 'Gestion du Stress', 'Carrière', 'Autre'
    ];
    
    if (resources.length > 0) {
      // Ajouter les catégories dynamiques qui ne sont pas déjà dans la liste
      const dynamicCategories = [...new Set(resources.map(r => r.category).filter(Boolean))];
      const additionalCategories = dynamicCategories.filter(cat => !allCategories.includes(cat));
      setCategories([...allCategories, ...additionalCategories]);
    } else {
      setCategories(allCategories);
    }
  }, [resources]);

  const loadResources = async () => {
    try {
      const response = await Api.get('/resources');
      setResources(response.data || []);
    } catch (error) {
      console.error('Erreur chargement ressources');
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Logique pour les catégories avec "Autre"
    let matchesCategory = true;
    if (selectedCategory && selectedCategory !== 'Tous') {
      if (selectedCategory === 'Autre') {
        // Afficher les ressources dont la catégorie ne figure pas dans la liste principale
        const mainCategories = [
          'Leadership', 'Entrepreneuriat', 'Technologie', 'Santé', 'Éducation', 'Finance',
          'Développement Personnel', 'Communication', 'Gestion de Projet', 'Marketing', 'Ressources Humaines',
          'Innovation', 'Networking', 'Équilibre Vie-Travail', 'Confiance en Soi', 'Négociation',
          'Prise de Parole', 'Gestion du Stress', 'Carrière'
        ];
        matchesCategory = !mainCategories.includes(resource.category);
      } else {
        matchesCategory = resource.category === selectedCategory;
      }
    }
    
    // Normaliser la comparaison des types
    let matchesType = true;
    if (selectedType && selectedType !== 'Tous') {
      const normalizedSelectedType = selectedType.toLowerCase().replace('é', 'e'); // Vidéo -> video
      const normalizedResourceType = resource.type.toLowerCase();
      matchesType = normalizedResourceType === normalizedSelectedType;
    }
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleResourceAction = async (resource) => {
    if (resource.type === 'video') {
      // Ouvrir le lecteur vidéo
      setSelectedResource(resource);
      setShowViewer(true);
    } else if (resource.type === 'pdf') {
      // Ouvrir le PDF dans le viewer
      setSelectedResource(resource);
      setShowViewer(true);
    } else {
      // Télécharger directement les autres fichiers
      downloadFile(resource);
    }
  };

  const downloadFile = async (resource) => {
    if (!resource.fileUrl || resource.fileUrl.trim() === '') {
      alert('Aucun fichier disponible pour le téléchargement.');
      return;
    }

    try {
      // Incrémenter le compteur
      await Api.put(`/resources/download/${resource._id}`);
      loadResources();
    } catch (error) {
      console.error('Erreur compteur');
    }

    try {
      const fileUrl = resource.fileUrl.startsWith('http') ? resource.fileUrl : `https://voix-avenir-backend.onrender.com${resource.fileUrl}`;
      
      // Pour les vidéos, essayer d'abord un téléchargement direct
      if (resource.type === 'video') {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.style.display = 'none';
        link.target = '_blank';
        
        const sanitizedTitle = resource.title ? resource.title.replace(/[^a-z0-9\s]/gi, '_').substring(0, 50) : 'video';
        link.download = `${sanitizedTitle}.${getFileExtension(resource.type)}`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      
      // Pour les autres fichiers, utiliser fetch
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.style.display = 'none';
      
      const sanitizedTitle = resource.title ? resource.title.replace(/[^a-z0-9\s]/gi, '_').substring(0, 50) : 'resource';
      link.download = `${sanitizedTitle}.${getFileExtension(resource.type)}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      // Fallback: ouvrir le fichier dans un nouvel onglet
      const fileUrl = resource.fileUrl.startsWith('http') ? resource.fileUrl : `https://voix-avenir-backend.onrender.com${resource.fileUrl}`;
      window.open(fileUrl, '_blank');
    }
  };

  const getFileExtension = (type) => {
    switch (type) {
      case 'pdf': return 'pdf';
      case 'video': return 'mp4';
      case 'guide': return 'pdf';
      case 'article': return 'pdf';
      default: return 'file';
    }
  };

  const closeViewer = () => {
    setShowViewer(false);
    setSelectedResource(null);
  };

  const submitResource = async () => {
    if (!shareResource.title || !shareResource.description || !shareResource.category) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!shareResource.resourceFile) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    try {
      console.log('Données à envoyer:', {
        title: shareResource.title,
        category: shareResource.category,
        type: shareResource.type,
        fileSize: shareResource.resourceFile.size,
        fileName: shareResource.resourceFile.name
      });

      const formData = new FormData();
      formData.append('title', shareResource.title);
      formData.append('description', shareResource.description);
      formData.append('category', shareResource.category);
      formData.append('type', shareResource.type);
      formData.append('resourceFile', shareResource.resourceFile);
      
      const response = await Api.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Réponse serveur:', response.data);
      
      setShareResource({ title: '', description: '', category: '', type: 'pdf', fileUrl: '', resourceFile: null });
      setShowShareModal(false);
      loadResources();
      alert('Ressource soumise avec succès ! Elle sera examinée par nos administrateurs.');
    } catch (error) {
      console.error('Erreur complète:', error);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      
      let errorMessage = 'Erreur lors de la soumission';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 500) {
        errorMessage = 'Erreur serveur interne. Vérifiez les logs du serveur.';
      }
      
      alert(errorMessage);
    }
  };

  // Fermer le modal avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showViewer) {
        closeViewer();
      }
    };

    if (showViewer) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Empêcher le scroll
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset'; // Restaurer le scroll
    };
  }, [showViewer]);

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    
    // Extraire l'ID de la vidéo YouTube
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      return url; // Déjà au bon format
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const getVimeoEmbedUrl = (url) => {
    if (!url) return '';
    
    // Extraire l'ID de la vidéo Vimeo
    const match = url.match(/vimeo\.com\/(\d+)/);
    const videoId = match ? match[1] : '';
    
    return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'article':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'video':
        return <Play className="w-5 h-5 text-blue-500" />;
      case 'guide':
        return <BookOpen className="w-5 h-5 text-green-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'article':
        return 'bg-red-100 text-red-700';
      case 'video':
        return 'bg-blue-100 text-blue-700';
      case 'guide':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const featuredResources = resources.filter(resource => resource.isFeatured).slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Bibliothèque de Ressources
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Accédez à une collection complète de ressources pour développer vos compétences et atteindre vos objectifs
          </p>
        </div>

        {/* Featured Resources */}
        {featuredResources.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Ressources à la Une</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {featuredResources.map((resource) => (
                <div key={resource._id} className="bg-white rounded-md shadow-sm overflow-hidden hover:shadow-md transition-all group">
                  <div className="relative h-20 overflow-hidden">
                    <img
                      src={resource.image ? `https://voix-avenir-backend.onrender.com${resource.image}` : 'https://images.pexels.com/photos/7688460/pexels-photo-7688460.jpeg'}
                      alt={resource.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute top-1 left-1">
                      <span className={`px-1 py-0.5 rounded text-xs ${getTypeColor(resource.type)}`}>
                        {resource.type === 'pdf' ? 'article' : resource.type}
                      </span>
                    </div>
                    <div className="absolute bottom-1 left-1">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="p-2">
                    <h3 className="text-sm font-bold text-gray-800 mb-1 line-clamp-1">{resource.title}</h3>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{resource.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                        {resource.category}
                      </span>
                      <button 
                        onClick={() => handleResourceAction(resource)}
                        className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded text-xs flex items-center"
                      >
                        {resource.type === 'video' ? <Play className="w-3 h-3 mr-1" /> : <Download className="w-3 h-3 mr-1" />}
                        {resource.type === 'video' ? 'Voir' : 'DL'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category === 'Tous' ? '' : category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              >
                {types.map(type => (
                  <option key={type} value={type === 'Tous' ? '' : type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        {isLoading ? (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Chargement...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(showAllResources ? filteredResources : filteredResources.slice(0, 4)).map((resource) => (
              <div key={resource._id || resource.id} className="bg-white rounded-md shadow-sm hover:shadow-md transition-all group">
              {resource.type === 'video' && (
                <div className="relative h-24 overflow-hidden rounded-t-md">
                  <div className="relative w-full h-full bg-gray-900">
                    {resource.image ? (
                      <img 
                        src={`https://voix-avenir-backend.onrender.com${resource.image}`}
                        alt={resource.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <video 
                      className={`w-full h-full object-cover ${resource.image ? 'hidden' : ''}`}
                      src={`https://voix-avenir-backend.onrender.com${resource.fileUrl}`}
                      preload="metadata"
                      muted
                      onLoadedMetadata={(e) => {
                        e.target.currentTime = 1;
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                        <Play className="w-4 h-4 text-gray-800 ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute top-1 right-1">
                      <span className="px-1 py-0.5 bg-red-600 text-white text-xs rounded">
                        VID
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className={`px-1 py-0.5 rounded text-xs ${getTypeColor(resource.type)}`}>
                    {resource.type === 'pdf' ? 'article' : resource.type}
                  </span>
                  <span className="px-1 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                    {resource.category}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-gray-800 mb-1 line-clamp-2">
                  {resource.title}
                </h3>
                
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {resource.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>{resource.downloadCount || 0} Téléchargements</span>
                  <Eye className="w-3 h-3" />
                </div>

                <div className="flex gap-1">
                  <button 
                    onClick={() => handleResourceAction(resource)}
                    className="flex-1 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded text-xs flex items-center justify-center"
                  >
                    {resource.type === 'video' ? (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        Voir
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3 mr-1" />
                        Télécharger
                      </>
                    )}
                  </button>
                  {resource.type === 'video' && (
                    <button 
                      onClick={() => downloadFile(resource)}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                      title="Télécharger la vidéo"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  )}
                </div>
                </div>
              </div>
            ))}
            </div>
          
          {/* Bouton Voir plus/moins */}
          {filteredResources.length > 4 && (
            <div className="text-center mt-4">
              {!showAllResources ? (
                <button
                  onClick={() => setShowAllResources(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded text-sm hover:shadow-md transition-all"
                >
                  Afficher toutes les ressources ({filteredResources.length})
                </button>
              ) : (
                <button
                  onClick={() => setShowAllResources(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-all"
                >
                  Afficher moins (4 premières)
                </button>
              )}
            </div>
          )}
          </>
        )}

        {filteredResources.length === 0 && (
          <div className="text-center py-6">
            <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Aucune ressource trouvée</h3>
            <p className="text-xs text-gray-500">Modifiez vos critères de recherche</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-3 text-center text-white">
          <h2 className="text-lg font-bold mb-2">Partagez vos Ressources</h2>
          <p className="text-sm text-purple-100 mb-3">
            Contribuez à notre bibliothèque
          </p>
          <button 
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2 bg-white text-purple-600 rounded text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            Proposer une Ressource
          </button>
        </div>

        {/* Viewer Modal */}
        {showViewer && selectedResource && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeViewer();
              }
            }}
          >
            <div 
              className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-bold text-gray-800">{selectedResource.title}</h3>
                <button 
                  onClick={closeViewer}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-4">
                {selectedResource.type === 'video' ? (
                  <div className="space-y-4">
                    <div className="aspect-video relative">
                      {selectedResource.fileUrl?.includes('youtube.com') || selectedResource.fileUrl?.includes('youtu.be') ? (
                        <iframe
                          src={getYouTubeEmbedUrl(selectedResource.fileUrl)}
                          className="w-full h-full rounded-lg border-0"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          title={selectedResource.title}
                        />
                      ) : selectedResource.fileUrl?.includes('vimeo.com') ? (
                        <iframe
                          src={getVimeoEmbedUrl(selectedResource.fileUrl)}
                          className="w-full h-full rounded-lg border-0"
                          allowFullScreen
                          allow="autoplay; fullscreen; picture-in-picture"
                          title={selectedResource.title}
                        />
                      ) : (
                        <>
                          <video 
                            controls 
                            className="w-full h-full rounded-lg bg-black"
                            src={`https://voix-avenir-backend.onrender.com${selectedResource.fileUrl}`}
                            preload="metadata"
                            poster={selectedResource.image ? `https://voix-avenir-backend.onrender.com${selectedResource.image}` : undefined}
                            onLoadedMetadata={(e) => {
                              e.target.currentTime = 1;
                            }}
                            onError={(e) => {
                              console.error('Erreur de lecture vidéo');
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          >
                            <source src={`https://voix-avenir-backend.onrender.com${selectedResource.fileUrl}`} type="video/mp4" />
                            <source src={`https://voix-avenir-backend.onrender.com${selectedResource.fileUrl}`} type="video/webm" />
                            <source src={`https://voix-avenir-backend.onrender.com${selectedResource.fileUrl}`} type="video/ogg" />
                            Votre navigateur ne supporte pas la lecture vidéo.
                          </video>
                          <div className="hidden w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600 mb-4">Impossible de lire cette vidéo</p>
                              <a 
                                href={`https://voix-avenir-backend.onrender.com${selectedResource.fileUrl}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Ouvrir dans un nouvel onglet
                              </a>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={() => downloadFile(selectedResource)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center shadow-lg"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger la Vidéo
                      </button>
                    </div>
                  </div>
                ) : selectedResource.type === 'pdf' || selectedResource.type === 'article' ? (
                  <div className="h-96">
                    <iframe
                      src={`https://voix-avenir-backend.onrender.com${selectedResource.fileUrl}`}
                      className="w-full h-full rounded-lg border"
                      title={selectedResource.title}
                    />
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => downloadFile(selectedResource)}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger l'Article
                      </button>
                    </div>
                  </div>
                ) : selectedResource.type === 'guide' ? (
                  <div className="h-96">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-8 h-full flex flex-col items-center justify-center">
                      <BookOpen className="w-24 h-24 text-green-600 mb-6" />
                      <h3 className="text-2xl font-bold text-green-800 mb-4">Guide Pratique</h3>
                      <p className="text-green-700 text-center mb-6 max-w-md">
                        Ce guide contient des informations précieuses pour vous accompagner dans votre parcours.
                      </p>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => downloadFile(selectedResource)}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center shadow-lg"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger le Guide
                        </button>
                        <a
                          href={`https://voix-avenir-backend.onrender.com${selectedResource.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-white text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-colors inline-flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Prévisualiser
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Prévisualisation non disponible pour ce type de fichier</p>
                    <a 
                      href={`https://voix-avenir-backend.onrender.com${selectedResource.fileUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </a>
                  </div>
                )}
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 mb-2">{selectedResource.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Catégorie: {selectedResource.category}</span>
                    <span>Type: {selectedResource.type === 'pdf' ? 'ARTICLE' : selectedResource.type.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Share Resource Modal */}
        {showShareModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowShareModal(false);
              }
            }}
          >
            <div 
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-bold text-gray-800">Partager une Ressource</h3>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
                  <input
                    type="text"
                    value={shareResource.title}
                    onChange={(e) => setShareResource({...shareResource, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Titre de votre ressource"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                    <select
                      value={shareResource.category}
                      onChange={(e) => setShareResource({...shareResource, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.filter(cat => cat !== 'Tous').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                    <select
                      value={shareResource.type}
                      onChange={(e) => setShareResource({...shareResource, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="pdf">Article</option>
                      <option value="video">Vidéo</option>
                      <option value="guide">Guide</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={shareResource.description}
                    onChange={(e) => setShareResource({...shareResource, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Décrivez votre ressource..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fichier de la ressource *</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.mp4,.avi,.mov,.wmv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setShareResource({...shareResource, resourceFile: file});
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Formats acceptés: PDF, DOC, DOCX, MP4, AVI, MOV, WMV</p>
                </div>



                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={submitResource}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Soumettre la Ressource
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
