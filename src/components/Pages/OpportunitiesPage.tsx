import React, { useState } from 'react';
import { Briefcase, GraduationCap, Trophy, Clock, MapPin, Building, ChevronRight, ExternalLink, Filter } from 'lucide-react';
import { mockOpportunities } from '../../data/mockData';

interface OpportunitiesPageProps {
  onNavigate: (page: string) => void;
}

const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({ onNavigate }) => {
  const [selectedType, setSelectedType] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState('');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'internship':
        return <Briefcase className="w-5 h-5" />;
      case 'scholarship':
        return <GraduationCap className="w-5 h-5" />;
      case 'contest':
        return <Trophy className="w-5 h-5" />;
      default:
        return <Briefcase className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'internship':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'scholarship':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'contest':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'internship':
        return 'Stage';
      case 'scholarship':
        return 'Bourse';
      case 'contest':
        return 'Concours';
      default:
        return type;
    }
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredOpportunities = mockOpportunities.filter(opportunity => {
    const matchesType = !selectedType || opportunity.type === selectedType;
    const matchesOrg = !selectedOrganization || opportunity.organization === selectedOrganization;
    return matchesType && matchesOrg;
  });

  const featuredOpportunities = [
    {
      id: 'featured-1',
      title: 'Programme de Mentorat Orange Digital Center',
      organization: 'Orange Guinée',
      type: 'program',
      description: 'Programme intensif de 6 mois pour développer vos compétences digitales avec mentorat personnalisé.',
      deadline: '2024-03-15',
      image: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg',
      benefits: ['Formation gratuite', 'Mentorat 1:1', 'Certification', 'Réseau professionnel']
    },
    {
      id: 'featured-2',
      title: 'Incubateur WomenTech Guinée 2024',
      organization: 'WomenTech Africa',
      type: 'incubator',
      description: 'Accélérateur dédié aux startups fondées ou co-fondées par des femmes en Guinée.',
      deadline: '2024-04-01',
      image: 'https://images.pexels.com/photos/7688460/pexels-photo-7688460.jpeg',
      benefits: ['Financement jusqu\'à 10K$', 'Mentorat expert', 'Espace de coworking', 'Réseau d\'investisseurs']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Opportunités & Bourses
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez les meilleures opportunités de stages, bourses d'études et concours pour booster votre carrière
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">24</p>
            <p className="text-sm text-gray-600">Stages disponibles</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">8</p>
            <p className="text-sm text-gray-600">Bourses d'études</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">5</p>
            <p className="text-sm text-gray-600">Concours ouverts</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">12</p>
            <p className="text-sm text-gray-600">Se terminent bientôt</p>
          </div>
        </div>

        {/* Featured Opportunities */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Opportunités à la Une</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={opportunity.image}
                    alt={opportunity.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-semibold">
                      ⭐ RECOMMANDÉ
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">
                        {getDaysRemaining(opportunity.deadline)} jours restants
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-800">{opportunity.title}</h3>
                    <div className="flex items-center text-gray-500">
                      <Building className="w-4 h-4 mr-1" />
                      <span className="text-sm">{opportunity.organization}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{opportunity.description}</p>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Avantages :</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {opportunity.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <ChevronRight className="w-3 h-3 text-green-500 mr-1 flex-shrink-0" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Date limite: {opportunity.deadline}
                    </span>
                    <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center" onClick={() => onNavigate('application')}>
                      Postuler
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'opportunité
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Tous les types</option>
                <option value="internship">Stages</option>
                <option value="scholarship">Bourses</option>
                <option value="contest">Concours</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organisation
              </label>
              <select
                value={selectedOrganization}
                onChange={(e) => setSelectedOrganization(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Toutes les organisations</option>
                <option value="Orange Guinée">Orange Guinée</option>
                <option value="Fondation Education Guinée">Fondation Education Guinée</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center">
                <Filter className="w-4 h-4 mr-2" />
                Filtres avancés
              </button>
            </div>
          </div>
        </div>

        {/* Opportunities List */}
        <div className="space-y-6">
          {filteredOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg border ${getTypeColor(opportunity.type)}`}>
                        {getTypeIcon(opportunity.type)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{opportunity.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            <span>{opportunity.organization}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(opportunity.type)}`}>
                            {getTypeLabel(opportunity.type)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        getDaysRemaining(opportunity.deadline) <= 7 
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        <Clock className="w-3 h-3 inline mr-1" />
                        {getDaysRemaining(opportunity.deadline)} jours
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Date limite: {opportunity.deadline}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{opportunity.description}</p>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">Prérequis :</h4>
                    <ul className="space-y-1">
                      {opportunity.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600">
                          <ChevronRight className="w-3 h-3 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="lg:ml-6 mt-4 lg:mt-0">
                  <button className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center" onClick={() => onNavigate('application')}>
                    Postuler maintenant
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune opportunité trouvée</h3>
            <p className="text-gray-500">Essayez de modifier vos filtres de recherche</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Vous Offrez des Opportunités ?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Partagez vos stages, bourses et concours avec notre communauté de femmes ambitieuses
          </p>
          <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-xl">
            Publier une Opportunité
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesPage;
