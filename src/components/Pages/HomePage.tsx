import React, { useState, useEffect } from 'react';
import { ArrowRight, Users, MapPin, Award, Heart, Star, Play, TrendingUp, Sparkles, MessageCircle, Building2 } from 'lucide-react';
import Api, { BASE_URL } from '../../data/Api';
import { useAuth } from '../../contexts/AuthContext';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();

  const [stats, setStats] = useState({
    totalUsers: 0,
    citiesCovered: 0,
    partnerships: 0,
    satisfactionRate: 0
  });
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getPhotoUrl = (photo: string | undefined) => {
    if (!photo) return null;
    if (photo.startsWith('http') || photo.startsWith('data:')) return photo;
    const fileName = photo.split('/').pop();
    return `${BASE_URL}/uploads/${fileName}`;
  };

  useEffect(() => {
    loadStats();
    loadTestimonials();
    loadPartners();
    loadNews();
    loadEvents();
  }, []);



  const loadTestimonials = async () => {
    try {
      const response = await Api.get('/testimonials');
      setTestimonials(response.data || []);
    } catch (error) {
      console.error('Erreur témoignages:', error);
      setTestimonials([]);
    }
  };



  const loadPartners = async () => {
    try {
      console.log('Chargement des partenaires...');
      const response = await Api.get('/partners');
      console.log('Réponse partenaires:', response.data);
      setPartners(response.data.slice(0, 6));
    } catch (error) {
      console.error('Erreur chargement partenaires:', error);
      setPartners([]);
    }
  };

  const loadNews = async () => {
    try {
      const response = await Api.get('/news');
      setNewsItems(response.data.slice(0, 1));
    } catch (error) {
      console.error('Erreur chargement actualités:', error);
      setNewsItems([]);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await Api.get('/events');
      // Limiter à 1 événement maximum pour l'accueil
      setEvents(response.data.slice(0, 1));
    } catch (error) {
      setEvents([]);
    }
  };

  const loadStats = async () => {
    try {
      const response = await Api.get('/users/stats');
      setStats({
        totalUsers: response.data.totalUsers || 0,
        citiesCovered: response.data.citiesCovered || 0,
        partnerships: response.data.partnerships || 0,
        satisfactionRate: response.data.satisfactionRate || 0
      });
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
      setStats({
        totalUsers: 0,
        citiesCovered: 0,
        partnerships: 0,
        satisfactionRate: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative mt-1 min-h-[70vh] lg:h-[60vh] bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 text-white overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-8 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full h-full">
            <div className="space-y-6 lg:space-y-8 max-w-xl mx-auto lg:mx-0 order-2 lg:order-1">
              <div className="space-y-4 text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white border-opacity-30">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs sm:text-sm font-medium">Plateforme #1 en Guinée</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight">
                  Connecter les{' '}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-100">
                    Futures Leaders
                  </span>
                  {' '}de la Guinée
                </h1>

                <p className="text-base sm:text-lg text-purple-100 leading-relaxed font-light max-w-lg mx-auto lg:mx-0">
                  Rejoignez une communauté de femmes inspirantes.
                  Ensemble nous construisons un avenir meilleur pour toutes.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => onNavigate('register')}
                  className="group px-8 py-3.5 bg-white text-purple-900 rounded-xl font-bold hover:bg-opacity-90 transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-2 shadow-2xl"
                >
                  <span>Commencer</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => onNavigate('experts')}
                  className="group px-8 py-3.5 border-2 border-white border-opacity-50 text-white rounded-xl font-bold hover:bg-white hover:text-purple-900 transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Femmes Expertes</span>
                </button>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="relative z-10 max-w-sm sm:max-w-lg lg:max-w-xl mx-auto">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <img
                    src={`${import.meta.env.BASE_URL}image2.png`}
                    alt="Femme leader inspirante"
                    className="relative rounded-2xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500 w-full object-cover aspect-[4/3] lg:aspect-auto"
                  />
                </div>
                
                <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 bg-white rounded-2xl p-3 sm:p-4 shadow-2xl border border-purple-50 flex items-center space-x-3 transform -rotate-3 hover:rotate-0 transition-transform hidden sm:flex">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-inner">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm sm:text-base">Bienvenue</p>
                    <p className="text-xs text-purple-600 font-medium">Rejoignez-nous aujourd'hui</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-purple-200 transition-colors">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                {isLoading ? (
                  <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
                ) : (
                  stats.totalUsers.toLocaleString()
                )}
              </div>
              <div className="text-gray-500 text-xs sm:text-sm font-medium">Utilisatrices</div>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-pink-200 transition-colors">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                {isLoading ? (
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
                ) : (
                  stats.citiesCovered
                )}
              </div>
              <div className="text-gray-500 text-xs sm:text-sm font-medium">Villes</div>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-green-200 transition-colors">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                {isLoading ? (
                  <div className="w-12 h-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
                ) : (
                  stats.partnerships
                )}
              </div>
              <div className="text-gray-500 text-xs sm:text-sm font-medium">Partenariats</div>
            </div>

            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-yellow-200 transition-colors">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                {isLoading ? (
                  <div className="w-12 h-8 bg-gray-200 rounded animate-pulse mx-auto"></div>
                ) : (
                  `${stats.satisfactionRate}%`
                )}
              </div>
              <div className="text-gray-500 text-xs sm:text-sm font-medium">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Témoignages Inspirants</h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
              Découvrez les histoires de réussite de notre communauté de mentorées et mentores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.length > 0 ? testimonials.map((testimonial, index) => (
              <div
                key={testimonial._id || testimonial.id}
                className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-3 italic text-xs">
                  "{testimonial.content || testimonial.message}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
                    {getPhotoUrl(testimonial.author?.photo) ? (
                      <img
                        src={getPhotoUrl(testimonial.author.photo)!}
                        alt={testimonial.author.name}
                        className="w-12 h-12 object-cover"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg ${testimonial.author?.photo ? 'hidden' : ''}`}>
                      {testimonial.author?.name?.charAt(0)?.toUpperCase() || 'M'}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{testimonial.author?.name || 'Mentorée'}</p>
                    <p className="text-sm text-gray-600">Mentorée</p>
                    {testimonial.author?.profession && (
                      <p className="text-xs text-purple-600">{testimonial.author.profession}</p>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center py-6">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg mb-2">Aucun témoignage disponible pour le moment</p>
                <p className="text-gray-400 text-sm mb-4">Les témoignages des mentorées apparaîtront ici</p>
                <div className="bg-purple-50 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-purple-700 text-sm font-medium mb-2">💡 Pour les mentorées :</p>
                  <p className="text-purple-600 text-xs">
                    Connectez-vous à votre tableau de bord pour partager votre expérience de mentorat
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>


      </section>



      {/* How It Works Section */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Comment ça marche ?</h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
              Un processus simple et efficace pour connecter les futures leaders avec des femmes expertes en Guinée.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform animate-bounce">
                <span className="text-white font-bold text-2xl">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Inscription & Profil</h3>
              <p className="text-gray-600 leading-relaxed">
                Créez votre profil en quelques minutes. Partagez vos objectifs, vos centres d'intérêt et vos aspirations professionnelles.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform animate-bounce delay-100">
                <span className="text-white font-bold text-2xl">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Connexion Intelligente</h3>
              <p className="text-gray-600 leading-relaxed">
                Notre système vous met en relation avec des mentores expertes qui correspondent à vos domaines d'intérêt et objectifs de carrière.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform animate-bounce delay-200">
                <span className="text-white font-bold text-2xl">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Accompagnement Personnalisé</h3>
              <p className="text-gray-600 leading-relaxed">
                Bénéficiez de séances de mentorat individuelles, de conseils pratiques et d'un suivi régulier pour atteindre vos objectifs.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Ce que vous obtenez :</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Séances personnalisées</h4>
                      <p className="text-gray-600 text-sm">Rencontres individuelles adaptées à vos besoins</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Réseau professionnel</h4>
                      <p className="text-gray-600 text-sm">Accès à un réseau de femmes leaders inspirantes</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Ressources exclusives</h4>
                      <p className="text-gray-600 text-sm">Guides, outils et contenus pour votre développement</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Suivi continu</h4>
                      <p className="text-gray-600 text-sm">Accompagnement sur le long terme pour vos projets</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-3xl">👥</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Rejoignez la Communauté</h4>
                  <p className="text-gray-600 mb-4">Plus de {stats.totalUsers} femmes nous font déjà confiance</p>
                  <button
                    onClick={() => onNavigate('register')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 font-semibold"
                  >
                    Commencer Maintenant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Nos Partenaires de Confiance</h3>
            <p className="text-gray-600">Ensemble pour l'autonomisation des femmes guinéennes</p>
          </div>
          {partners.length > 0 ? (
            <div className="flex flex-wrap justify-center -mx-4 items-start">
              {partners.map((partner, index) => {
                const isImageLogo = partner.logo && (partner.logo.startsWith('/uploads') || partner.logo.startsWith('http') || partner.logo.startsWith('data:'));

                const partnerContent = (
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 mb-4 flex items-center justify-center bg-gray-50 rounded-xl p-3 shadow-sm group-hover:shadow-md transition-shadow">
                      {isImageLogo ? (
                        <img
                          src={partner.logo.startsWith('/uploads') ? `${BASE_URL}${partner.logo}` : partner.logo}
                          alt={partner.name}
                          className="w-20 h-20 object-contain group-hover:scale-110 transition-transform"
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            ((e.target as HTMLImageElement).nextSibling as HTMLElement).style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`text-4xl flex items-center justify-center group-hover:scale-110 transition-transform text-purple-600 ${isImageLogo ? 'hidden' : ''}`}>
                        <Building2 className="w-12 h-12" />
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors text-center px-2">
                      {partner.name}
                    </h4>
                    {partner.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 text-center px-4">
                        {partner.description}
                      </p>
                    )}
                  </div>
                );

                return (
                  <div key={partner._id || index} className="px-4 mb-12 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                    {partner.website ? (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group hover:transform hover:scale-105 transition-all cursor-pointer p-2"
                        title={`Visiter ${partner.name}`}
                      >
                        {partnerContent}
                      </a>
                    ) : (
                      <div className="group p-2 transition-all">
                        {partnerContent}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-400">🏢</span>
              </div>
              <p className="text-gray-500 text-lg mb-2">Aucun partenaire pour le moment</p>
              <p className="text-gray-400 text-sm">Les partenaires ajoutés apparaîtront ici</p>
            </div>
          )}
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">Prête à Commencer Votre Parcours ?</h2>
          <p className="text-lg text-purple-100 mb-6 max-w-xl mx-auto">
            Rejoignez des milliers de femmes guinéennes qui transforment leur avenir grâce à Voix D'avenir
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('register')}
              className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-xl"
            >
              Devenir Mentorée
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-purple-600 transition-all transform hover:scale-105"
            >
              Devenir Mentore
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
