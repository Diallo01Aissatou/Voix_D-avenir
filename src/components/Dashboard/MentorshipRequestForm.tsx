import React, { useState, useEffect } from 'react';
import { X, Send, User, Search, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { User as UserType } from '../../types';
import Api from '../../data/Api';

interface MentorshipRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MentorshipRequestForm: React.FC<MentorshipRequestFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { currentUser } = useAuth();
  const [mentores, setMentores] = useState<UserType[]>([]);
  const [selectedMentore, setSelectedMentore] = useState<UserType | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [expertiseList, setExpertiseList] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadMentores();
      loadFiltersData();
    }
  }, [isOpen]);

  const loadMentores = async () => {
    try {
      const params: any = { role: 'mentore' };
      if (searchTerm) params.search = searchTerm;
      if (selectedCity) params.city = selectedCity;
      if (selectedExpertise) params.expertise = selectedExpertise;

      const response = await Api.get('/users', { params });
      setMentores(response.data || []);
    } catch (error) {
      console.error('Erreur chargement mentores:', error);
      setMentores([]);
    }
  };

  const loadFiltersData = async () => {
    try {
      const [citiesResponse, expertiseResponse] = await Promise.all([
        Api.get('/users/cities'),
        Api.get('/users/expertise')
      ]);
      setCities(citiesResponse.data || []);
      setExpertiseList(expertiseResponse.data || []);
    } catch (error) {
      console.error('Erreur chargement filtres:', error);
      setCities(['Conakry', 'Kankan', 'Labé', 'N\'Zérékoré', 'Kindia', 'Mamou', 'Boké', 'Faranah']);
      setExpertiseList(['Médecine', 'Marketing', 'Technologie', 'Finance', 'Éducation', 'Droit', 'Ingénierie', 'Santé publique', 'Informatique']);
    }
  };

  useEffect(() => {
    if (searchTerm || selectedCity || selectedExpertise) {
      loadMentores();
    }
  }, [searchTerm, selectedCity, selectedExpertise]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentore || !message.trim()) {
      alert('Veuillez sélectionner une mentore et saisir un message');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Envoi demande:', { mentoreId: selectedMentore._id, message: message.trim() });
      
      const response = await fetch('https://voix-avenir-backend.onrender.com/api/mentorship/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mentoreId: selectedMentore._id,
          message: message.trim()
        })
      });
      
      console.log('Réponse API:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur serveur' }));
        console.error('Erreur API:', errorData);
        throw new Error(errorData.message || 'Erreur lors de l\'envoi');
      }
      
      const result = await response.json();
      console.log('Demande envoyée avec succès:', result);
      
      alert('Demande envoyée avec succès !');
      onSuccess();
      onClose();
      setMessage('');
      setSelectedMentore(null);
    } catch (error) {
      console.error('Erreur envoi demande:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Envoyer une demande de mentorat</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left Panel - Mentores List */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher une mentore..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    <option value="">Toutes les villes</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <select
                    value={selectedExpertise}
                    onChange={(e) => setSelectedExpertise(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    <option value="">Tous les domaines</option>
                    {expertiseList.map(expertise => (
                      <option key={expertise} value={expertise}>{expertise}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Mentores List */}
            <div className="flex-1 overflow-y-auto p-4">
              {mentores.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Aucune mentore trouvée</p>
                  <p className="text-sm">Ajustez vos critères de recherche</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mentores.map((mentore) => (
                    <div
                      key={mentore._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedMentore?._id === mentore._id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedMentore(mentore)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center overflow-hidden">
                          {mentore.photo ? (
                            <img src={mentore.photo} alt={mentore.name} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{mentore.name}</h3>
                          <p className="text-sm text-purple-600 font-medium">{mentore.profession}</p>
                          <p className="text-sm text-gray-500">{mentore.city}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {mentore.expertise?.slice(0, 3).map((exp, index) => (
                              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                                {exp}
                              </span>
                            ))}
                          </div>
                          {mentore.bio && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{mentore.bio}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Request Form */}
          <div className="w-1/2 flex flex-col">
            {selectedMentore ? (
              <>
                {/* Selected Mentore Info */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center overflow-hidden">
                      {selectedMentore.photo ? (
                        <img src={selectedMentore.photo} alt={selectedMentore.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedMentore.name}</h3>
                      <p className="text-sm text-purple-600">{selectedMentore.profession}</p>
                      <p className="text-sm text-gray-500">{selectedMentore.city}</p>
                    </div>
                  </div>
                </div>

                {/* Request Form */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                  <div className="flex-1 p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message de demande
                        </label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Expliquez pourquoi vous souhaitez être mentorée par cette personne..."
                          rows={8}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {message.length}/500 caractères
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        {isLoading ? 'Envoi...' : 'Envoyer'}
                      </button>
                    </div>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Sélectionnez une mentore</h3>
                  <p className="text-sm">Choisissez une mentore dans la liste pour envoyer votre demande</p>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default MentorshipRequestForm;


