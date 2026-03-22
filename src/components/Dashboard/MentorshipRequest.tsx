import React, { useState, useEffect } from 'react';
import { Send, User, Star, MapPin } from 'lucide-react';

interface Mentore {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  profession: string;
  expertise: string[];
  bio?: string;
  city?: string;
}

interface MentorshipRequestProps {
  onClose: () => void;
}

const BASE_API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://voix-avenir-backend.onrender.com';

const MentorshipRequest: React.FC<MentorshipRequestProps> = ({ onClose }) => {
  const [mentores, setMentores] = useState<Mentore[]>([]);
  const [selectedMentore, setSelectedMentore] = useState<string>('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMentores();
  }, []);

  const fetchMentores = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/api/users?role=mentore`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMentores(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des mentores:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentore || !message.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${BASE_API_URL}/api/mentorship/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          mentoreId: selectedMentore,
          message: message.trim()
        })
      });

      if (response.ok) {
        alert('Demande envoyée avec succès !');
        onClose();
      } else {
        const error = await response.json();
        alert(error.message || 'Erreur lors de l\'envoi de la demande');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Demander un mentorat</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choisir une mentore
            </label>
            <select
              value={selectedMentore}
              onChange={(e) => setSelectedMentore(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionner une mentore...</option>
              {mentores.map((mentore) => (
                <option key={mentore._id} value={mentore._id}>
                  {mentore.name} - {mentore.profession}
                </option>
              ))}
            </select>
          </div>

          {selectedMentore && (
            <div className="bg-gray-50 p-4 rounded-lg">
              {(() => {
                const mentore = mentores.find(m => m._id === selectedMentore);
                if (!mentore) return null;

                return (
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      {mentore.photo ? (
                        <img src={mentore.photo} alt={mentore.name} className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{mentore.name}</h3>
                      <p className="text-sm text-gray-600">{mentore.profession}</p>
                      {mentore.city && (
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {mentore.city}
                        </p>
                      )}
                      {mentore.expertise && mentore.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {mentore.expertise.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message de présentation
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Présentez-vous et expliquez pourquoi vous souhaitez être mentorée par cette personne..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !selectedMentore || !message.trim()}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Envoi...' : 'Envoyer la demande'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentorshipRequest;
