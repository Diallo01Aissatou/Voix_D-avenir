import React, { useState, useEffect } from 'react';
import { Users, Target, Heart, Award } from 'lucide-react';
import Api from '../../data/Api';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMentores: 0,
    citiesCovered: 0,
    completedSessions: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await Api.get('/users/stats');
      setStats({
        totalUsers: response.data.totalUsers || 0,
        totalMentores: response.data.totalMentores || 0,
        citiesCovered: response.data.citiesCovered || 0,
        completedSessions: response.data.completedSessions || 0
      });
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <style>
        {`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-700 {
          animation-delay: 0.7s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-1200 {
          animation-delay: 1.2s;
        }
      `}</style>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 animate-slide-up">
            À Propos de Voix D'avenir
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto animate-slide-up delay-200">
            Une plateforme dédiée à l'autonomisation des femmes guinéennes à travers le mentorat et l'accompagnement professionnel.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up delay-300">
          <div className="flex items-center mb-6">
            <Target className="w-8 h-8 text-purple-600 mr-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-gray-800">Notre Mission</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Voix D'avenir a pour mission de connecter les jeunes femmes guinéennes avec des mentores expérimentées
            pour favoriser leur développement personnel et professionnel. Nous croyons au pouvoir du mentorat
            pour transformer des vies et construire un avenir meilleur pour la Guinée.
          </p>
        </div>

        {/* Vision */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up delay-500">
          <div className="flex items-center mb-6">
            <Heart className="w-8 h-8 text-pink-600 mr-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-800">Notre Vision</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Devenir la plateforme de référence pour l'autonomisation des femmes en Guinée,
            en créant un écosystème où chaque femme peut accéder aux ressources,
            aux conseils et au soutien nécessaires pour réaliser son plein potentiel avec Voix D'avenir.
          </p>
        </div>

        {/* Valeurs */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up delay-700">
          <div className="flex items-center mb-6">
            <Award className="w-8 h-8 text-green-600 mr-4 animate-spin-slow" />
            <h2 className="text-2xl font-bold text-gray-800">Nos Valeurs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="hover:bg-gray-50 p-4 rounded-lg transition-colors duration-300">
              <h3 className="font-semibold text-gray-800 mb-2">Solidarité</h3>
              <p className="text-gray-600 text-sm">Nous croyons en la force de l'entraide entre femmes.</p>
            </div>
            <div className="hover:bg-gray-50 p-4 rounded-lg transition-colors duration-300">
              <h3 className="font-semibold text-gray-800 mb-2">Excellence</h3>
              <p className="text-gray-600 text-sm">Nous visons l'excellence dans tout ce que nous faisons.</p>
            </div>
            <div className="hover:bg-gray-50 p-4 rounded-lg transition-colors duration-300">
              <h3 className="font-semibold text-gray-800 mb-2">Inclusion</h3>
              <p className="text-gray-600 text-sm">Nous accueillons toutes les femmes, peu importe leur origine.</p>
            </div>
            <div className="hover:bg-gray-50 p-4 rounded-lg transition-colors duration-300">
              <h3 className="font-semibold text-gray-800 mb-2">Innovation</h3>
              <p className="text-gray-600 text-sm">Nous utilisons la technologie pour créer des solutions modernes.</p>
            </div>
          </div>
        </div>

        {/* Impact */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 text-white mb-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slide-up delay-1000">
          <div className="flex items-center mb-6">
            <Users className="w-8 h-8 mr-4 animate-bounce" />
            <h2 className="text-2xl font-bold">Notre Impact</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {isLoading ? (
                  <div className="w-16 h-8 bg-white bg-opacity-20 rounded animate-pulse mx-auto"></div>
                ) : (
                  `${stats.totalUsers}+`
                )}
              </div>
              <div className="text-purple-100">Utilisatrices inscrites</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {isLoading ? (
                  <div className="w-16 h-8 bg-white bg-opacity-20 rounded animate-pulse mx-auto"></div>
                ) : (
                  `${stats.totalMentores}+`
                )}
              </div>
              <div className="text-purple-100">Mentores actives</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {isLoading ? (
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded animate-pulse mx-auto"></div>
                ) : (
                  stats.citiesCovered
                )}
              </div>
              <div className="text-purple-100">Villes couvertes</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center animate-slide-up delay-1200">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Rejoignez Notre Communauté</h3>
          <p className="text-gray-600 mb-6">
            Que vous souhaitiez être mentorée ou devenir mentore, nous avons une place pour vous.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('register')}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Devenir Mentorée
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="px-8 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Devenir Mentore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
