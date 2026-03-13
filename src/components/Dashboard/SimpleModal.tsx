import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BASE_API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://voix-avenir-backend.onrender.com';

interface Mentore {
  _id: string;
  name: string;
  profession: string;
}

const SimpleModal: React.FC<SimpleModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mentores, setMentores] = useState<Mentore[]>([]);
  const [selectedMentore, setSelectedMentore] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMentores();
    }
  }, [isOpen]);

  const loadMentores = async () => {
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

  const sendRequest = async () => {
    if (!selectedMentore || !message) return;

    setLoading(true);
    try {
      const response = await fetch(`${BASE_API_URL}/api/mentorship/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mentoreId: selectedMentore, message })
      });

      if (response.ok) {
        alert('Demande envoyée!');
        onSuccess();
        onClose();
        setSelectedMentore('');
        setMessage('');
      } else {
        alert('Erreur');
      }
    } catch (error) {
      alert('Erreur réseau');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Nouvelle demande</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Mentore</label>
            <select
              value={selectedMentore}
              onChange={(e) => setSelectedMentore(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Choisir...</option>
              {mentores.map((mentore) => (
                <option key={mentore._id} value={mentore._id}>
                  {mentore.name} - {mentore.profession}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 border rounded hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={sendRequest}
              disabled={!selectedMentore || !message || loading}
              className="flex-1 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleModal;
