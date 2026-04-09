import React, { useState, useEffect } from 'react';
import { Star, Award, MapPin, Briefcase, Quote, MessageSquare, ChevronRight } from 'lucide-react';
import Api from '../../data/Api';

interface ExpertsPageProps {
  onNavigate: (page: string) => void;
}

const ExpertsPage: React.FC<ExpertsPageProps> = ({ onNavigate }) => {
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [experts, setExperts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getPhotoUrl = (photo: string | undefined) => {
    if (!photo) return 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg';
    if (photo.startsWith('http') || photo.startsWith('data:')) return photo;
    const fileName = photo.split('/').pop();
    return `https://voix-avenir-backend.onrender.com/uploads/${fileName}`;
  };

  useEffect(() => {
    loadExperts();
  }, []);

  const loadExperts = async () => {
    try {
      const response = await Api.get('/experts');
      setExperts(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des expertes:', error);
      setExperts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = () => {
    if (contactMessage.trim()) {
      alert('Message envoyé avec succès ! L\'experte vous répondra bientôt.');
      setSelectedExpert(null);
      setContactMessage('');
    }
  };

  const featuredExpert = experts.find(expert => expert.isFeatured) || experts[0];
  const otherExperts = experts.filter(expert => expert._id !== featuredExpert?._id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <p className="text-gray-600">Chargement des expertes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Femmes Expertes de Guinée
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez les parcours inspirants de femmes guinéennes exceptionnelles qui façonnent l'avenir de notre pays
          </p>
        </div>

        {/* Featured Expert */}
        {featuredExpert && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full">
                <Star className="w-5 h-5" />
                <span className="font-semibold">Femme du Mois</span>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="h-96 lg:h-auto">
                  <img
                    src={getPhotoUrl(featuredExpert.user?.photo)}
                    alt={featuredExpert.user?.name}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'initial' } as any}
                  />
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{featuredExpert.user?.name}</h2>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center text-purple-600">
                        <Briefcase className="w-5 h-5 mr-2" />
                        <span className="font-semibold">{featuredExpert.user?.profession}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{featuredExpert.user?.city}</span>
                      </div>
                    </div>
                    <div className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full text-purple-700 text-sm font-medium">
                      {featuredExpert.domain}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {featuredExpert.user?.bio}
                  </p>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Principales Réalisations</h4>
                    <ul className="space-y-2">
                      {featuredExpert.achievements?.map((achievement: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <Award className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {featuredExpert.quote && (
                    <blockquote className="border-l-4 border-purple-500 pl-4 mb-6">
                      <Quote className="w-6 h-6 text-purple-500 mb-2" />
                      <p className="text-lg italic text-gray-700 mb-2">
                        "{featuredExpert.quote}"
                      </p>
                      <cite className="text-purple-600 font-semibold">- {featuredExpert.user?.name}</cite>
                    </blockquote>
                  )}


                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Experts */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Autres Femmes Inspirantes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {otherExperts.length > 0 ? otherExperts.map((expert) => (
              <div key={expert._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden group">
                <div className="h-64 overflow-hidden">
                  <img
                    src={getPhotoUrl(expert.user?.photo)}
                    alt={expert.user?.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    style={{ imageRendering: 'pixelated' } as any}
                  />
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{expert.user?.name}</h3>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center text-purple-600">
                        <Briefcase className="w-4 h-4 mr-1" />
                        <span className="text-sm font-semibold">{expert.user?.profession}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{expert.user?.city}</span>
                      </div>
                    </div>
                    <div className="inline-block bg-purple-100 px-3 py-1 rounded-full text-purple-700 text-xs font-medium">
                      {expert.domain}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {expert.user?.bio}
                  </p>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Réalisations</h4>
                    <ul className="space-y-1">
                      {expert.achievements?.slice(0, 2).map((achievement: string, index: number) => (
                        <li key={index} className="flex items-start text-sm">
                          <ChevronRight className="w-4 h-4 text-purple-500 mr-1 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>


                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center py-12">
                <p className="text-gray-500 text-lg">Aucune autre experte disponible pour le moment</p>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Vous Êtes une Experte ?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Rejoignez notre communauté de femmes inspiratrices et partagez votre expertise avec la nouvelle génération
          </p>
          <button
            onClick={() => onNavigate('register')}
            className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-xl"
          >
            Devenir Mentore
          </button>
        </div>
      </div>

      {/* Contact Modal */}
      {selectedExpert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Contacter {experts.find(e => e._id === selectedExpert)?.name}
            </h3>
            <p className="text-gray-600 mb-4">
              Posez votre question ou demandez un conseil à cette experte inspirante.
            </p>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Bonjour, j'aimerais vous poser une question sur..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setSelectedExpert(null)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleContact()}
                disabled={!contactMessage.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertsPage;
