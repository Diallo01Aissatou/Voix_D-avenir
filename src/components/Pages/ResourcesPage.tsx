import React, { useState, useEffect } from 'react';
import { Search, Download, Play, BookOpen, Eye, X } from 'lucide-react';
import Api, { BASE_URL } from '../../data/Api';

interface ResourcesPageProps {
  onNavigate: (page: string) => void;
}

const ResourcesPage: React.FC<ResourcesPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareResource, setShareResource] = useState<any>({
    title: '', description: '', category: '', type: 'pdf',
    fileUrl: '', resourceFile: null
  });

  const [categories, setCategories] = useState(['Tous']);
  const types = ['Tous', 'Article', 'Vidéo', 'Guide'];

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    const allCategories = [
      'Tous', 'Leadership', 'Entrepreneuriat', 'Technologie', 'Santé', 'Éducation', 'Finance',
      'Développement Personnel', 'Communication', 'Gestion de Projet', 'Marketing', 'Ressources Humaines',
      'Innovation', 'Networking', 'Équilibre Vie-Travail', 'Confiance en Soi', 'Négociation',
      'Prise de Parole', 'Gestion du Stress', 'Carrière', 'Autre'
    ];

    if (resources.length > 0) {
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
      console.error('Erreur chargement ressources:', error);
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = (resource.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    let matchesCategory = true;
    if (selectedCategory && selectedCategory !== 'Tous') {
      matchesCategory = resource.category === selectedCategory;
    }

    let matchesType = true;
    if (selectedType && selectedType !== 'Tous') {
      const normalizedSelectedType = selectedType.toLowerCase().replace('é', 'e');
      const normalizedResourceType = (resource.type || '').toLowerCase();
      matchesType = normalizedResourceType === normalizedSelectedType;
    }

    return matchesSearch && matchesCategory && matchesType;
  });

  const handleResourceAction = (resource: any) => {
    if (resource.type === 'video' || resource.type === 'pdf') {
      setSelectedResource(resource);
      setShowViewer(true);
    } else {
      downloadFile(resource);
    }
  };

  const downloadFile = async (resource: any) => {
    if (!resource.fileUrl) {
      alert('Aucun fichier disponible.');
      return;
    }

    try {
      await Api.put(`/resources/download/${resource._id}`);
    } catch (error) {
      console.error('Erreur compteur de téléchargement');
    }

    const fileUrl = resource.fileUrl.startsWith('http') ? resource.fileUrl : `${BASE_URL}${resource.fileUrl.startsWith('/') ? '' : '/'}${resource.fileUrl}`;
    window.open(fileUrl, '_blank');
  };

  const submitResource = async () => {
    if (!shareResource.title || !shareResource.category || !shareResource.resourceFile) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', shareResource.title);
      formData.append('description', shareResource.description);
      formData.append('category', shareResource.category);
      formData.append('type', shareResource.type);
      formData.append('resourceFile', shareResource.resourceFile);

      await Api.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShareResource({ title: '', description: '', category: '', type: 'pdf', fileUrl: '', resourceFile: null });
      setShowShareModal(false);
      loadResources();
      alert('Ressource soumise avec succès !');
    } catch (error: any) {
      console.error('Erreur soumission:', error);
      alert(error.response?.data?.message || 'Erreur lors de la soumission');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'article': return 'bg-red-100 text-red-700';
      case 'video': return 'bg-blue-100 text-blue-700';
      case 'guide': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const featuredResources = resources.filter(resource => resource.isFeatured).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bibliothèque de Ressources</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Développez vos compétences avec notre collection de guides et vidéos.</p>
        </div>

        {/* Featured Section */}
        {featuredResources.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">À la Une</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredResources.map((resource) => (
                <div key={resource._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={resource.image ? (resource.image.startsWith('http') ? resource.image : `${BASE_URL}${resource.image}`) : 'https://images.pexels.com/photos/7688460/pexels-photo-7688460.jpeg'}
                      alt={resource.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                        {resource.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{resource.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{resource.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded-full">{resource.category}</span>
                      <button
                        onClick={() => handleResourceAction(resource)}
                        className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                      >
                        {resource.type === 'video' ? <Play className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une ressource..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map(cat => <option key={cat} value={cat === 'Tous' ? '' : cat}>{cat}</option>)}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            >
              {types.map(t => <option key={t} value={t === 'Tous' ? '' : t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Resources Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredResources.map((resource) => (
              <div key={resource._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getTypeColor(resource.type)}`}>
                      {resource.type}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center">
                      <Eye className="w-2.5 h-2.5 mr-1" /> {resource.downloadCount || 0}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 text-xs h-8 leading-tight">{resource.title}</h3>
                  <p className="text-[10px] text-gray-500 mb-3 line-clamp-2 h-6 leading-normal">{resource.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResourceAction(resource)}
                      className="flex-1 py-1.5 bg-purple-600 text-white rounded-lg text-[10px] font-medium hover:bg-purple-700 transition-colors flex items-center justify-center group-hover:bg-purple-700"
                    >
                      {resource.type === 'video' ? <Play className="w-2.5 h-2.5 mr-1" /> : <Download className="w-2.5 h-2.5 mr-1" />}
                      {resource.type === 'video' ? 'Voir' : 'Télécharger'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredResources.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune ressource trouvée.</p>
          </div>
        )}

        {/* Share CTA */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center text-white shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Contribuez à la Communauté</h2>
          <p className="mb-6 opacity-90 max-w-xl mx-auto">Vous avez un guide, un article ou une vidéo inspirante à partager ? Proposez-la pour enrichir notre bibliothèque.</p>
          <button
            onClick={() => setShowShareModal(true)}
            className="px-8 py-3 bg-white text-purple-600 rounded-full font-bold hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            Partager une Ressource
          </button>
        </div>

        {/* Modals */}
        {showViewer && selectedResource && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowViewer(false)}>
            <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-bold text-gray-800">{selectedResource.title}</h3>
                <button onClick={() => setShowViewer(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-4">
                {selectedResource.type === 'video' ? (
                  <div className="aspect-video">
                    <video
                      controls
                      className="w-full h-full rounded-lg bg-black"
                      src={selectedResource.fileUrl.startsWith('http') ? selectedResource.fileUrl : `${BASE_URL}${selectedResource.fileUrl.startsWith('/') ? '' : '/'}${selectedResource.fileUrl}`}
                    />
                  </div>
                ) : (
                  <iframe
                    src={selectedResource.fileUrl.startsWith('http') ? selectedResource.fileUrl : `${BASE_URL}${selectedResource.fileUrl.startsWith('/') ? '' : '/'}${selectedResource.fileUrl}`}
                    className="w-full h-[60vh] rounded-lg border"
                  />
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => downloadFile(selectedResource)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" /> Télécharger
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowShareModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-gray-800 mb-6">Proposer une Ressource</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Titre *"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={shareResource.title}
                  onChange={e => setShareResource({ ...shareResource, title: e.target.value })}
                />
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={shareResource.category}
                  onChange={e => setShareResource({ ...shareResource, category: e.target.value })}
                >
                  <option value="">Sélectionner une catégorie *</option>
                  {categories.filter(c => c !== 'Tous').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={shareResource.type}
                  onChange={e => setShareResource({ ...shareResource, type: e.target.value })}
                >
                  <option value="pdf">Article (PDF)</option>
                  <option value="video">Vidéo</option>
                  <option value="guide">Guide</option>
                </select>
                <textarea
                  placeholder="Description"
                  className="w-full px-4 py-2 border rounded-lg h-24"
                  value={shareResource.description}
                  onChange={e => setShareResource({ ...shareResource, description: e.target.value })}
                ></textarea>
                <input
                  type="file"
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  onChange={e => setShareResource({ ...shareResource, resourceFile: e.target.files?.[0] || null })}
                />
                <button
                  onClick={submitResource}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
                >
                  Soumettre
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
