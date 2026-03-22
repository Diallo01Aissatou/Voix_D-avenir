import React, { useState, useEffect } from 'react';
import { X, Send, User } from 'lucide-react';

interface Mentore {
  _id: string;
  name: string;
  photo?: string;
  profession: string;
  expertise: string[];
  bio?: string;
}

interface MentorRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BASE_API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://voix-avenir-backend.onrender.com';

const MentorRequestModal: React.FC<MentorRequestModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mentores, setMentores] = useState<Mentore[]>([]);
  const [selectedMentore, setSelectedMentore] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMentores();
    }
  }, [isOpen]);

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
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentore || !message.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${BASE_API_URL}/api/mentor-requests/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mentoreId: selectedMentore,
          message: message.trim()
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setSelectedMentore('');
        setMessage('');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Demande de Mentorat</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Choisir une mentore</label>
            <select
              value={selectedMentore}
              onChange={(e) => setSelectedMentore(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            >
              <option value="">Sélectionner...</option>
              {mentores.map((mentore) => (
                <option key={mentore._id} value={mentore._id}>
                  {mentore.name} - {mentore.profession}
                </option>
              ))}
            </select>
          </div>

          {selectedMentore && (
            <div className="bg-gray-50 p-3 rounded-lg">
              {(() => {
                const mentore = mentores.find(m => m._id === selectedMentore);
                return mentore ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      {mentore.photo ? (
                        <img src={mentore.photo} alt={mentore.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{mentore.name}</h3>
                      <p className="text-sm text-gray-600">{mentore.profession}</p>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Présentez-vous et expliquez pourquoi vous souhaitez ce mentorat..."
              className="w-full p-2 border rounded-lg"
              rows={4}
              required
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !selectedMentore || !message.trim()}
              className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Envoi...' : 'Envoyer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentorRequestModal;
