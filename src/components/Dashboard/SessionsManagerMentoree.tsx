import React, { useState } from 'react';
import { Clock, User, Video, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import Api from '../../data/Api'; // Importation du service Api
import { Session } from '../../types';

let photoVersion = Date.now();
const getPhotoUrl = (photo: string | undefined) => {
  if (!photo) return null;
  if (photo.startsWith('http') || photo.startsWith('data:')) return photo + (photo.startsWith('http') ? `?v=${photoVersion}` : '');
  
  // Remplacer l'URL en dur par la constante BASE_URL qui existe dans Api
  const fileName = photo.split('/').pop();
  return `https://voix-avenir-backend.onrender.com/uploads/${fileName}?v=${photoVersion}`;
};

const ProfileImage = ({ src, alt, className }: { src: string | null, alt: string, className: string }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!src || error) {
    return (
      <div className={`${className} bg-purple-100 flex items-center justify-center`}>
        <User className="w-1/2 h-1/2 text-purple-600" />
      </div>
    );
  }

  return (
    <div className={`${className} relative overflow-hidden flex items-center justify-center`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        className={`${className} object-cover w-full h-full`} 
        onLoad={() => setLoading(false)}
        onError={() => { setError(true); setLoading(false); }} 
      />
    </div>
  );
};

interface SessionsManagerMentoreeProps {
  sessions: Session[];
  onRefresh: () => void;
  onOpenChat: (userId: string) => void;
}

const SessionsManagerMentoree: React.FC<SessionsManagerMentoreeProps> = ({ 
  sessions, 
  onRefresh, 
  onOpenChat 
}) => {
  const [_selectedSession, _setSelectedSession] = useState<Session | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [_confirmedSessions, _setConfirmedSessions] = useState<Set<string>>(new Set());


  const getStatusBadge = (status: string, _sessionId: string) => {
    const actualStatus = status; // confirmedSessions.has(sessionId) ? 'confirmed' : status;
    const badges = {
      scheduled: { color: 'bg-blue-100 text-blue-700', text: 'À venir', icon: Clock },
      confirmed: { color: 'bg-green-100 text-green-700', text: 'Confirmée', icon: CheckCircle },
      completed: { color: 'bg-gray-100 text-gray-700', text: 'Terminée', icon: CheckCircle },
      canceled: { color: 'bg-red-100 text-red-700', text: 'Annulée', icon: XCircle }
    };
    const badge = (badges as any)[actualStatus] || badges.scheduled;
    const Icon = badge.icon;
    return (
      <span className={`px-3 py-1 rounded-full text-sm flex items-center ${badge.color}`}>
        <Icon className="w-4 h-4 mr-1" /> {badge.text}
      </span>
    );
  };

  const handleConfirmPresence = async (sessionId: string) => {
    setLoading(true);
    try {
      const res = await Api.put(`/sessions/${sessionId}/confirm`);
      if (res.data) {
        alert('Présence confirmée avec succès !');
        onRefresh();
      }
    } catch (error) {
      alert('Erreur lors de la confirmation');
    } finally {
      setLoading(false);
      setShowConfirmModal(null);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    if (!confirm('Voulez-vous annuler cette séance ?')) return;
    setLoading(true);
    try {
      const res = await Api.put(`/sessions/${sessionId}/cancel`);
      if (res.data) {
        alert('Séance annulée');
        onRefresh();
      }
    } catch (error) {
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Mes Séances</h3>
        <button onClick={onRefresh} disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualiser
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map((session, index) => (
          <div key={`${session._id}-${index}`} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <ProfileImage src={getPhotoUrl(session.mentore?.photo)} alt={session.mentore?.name || ''} className="w-12 h-12 rounded-full border-2 border-purple-100 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-800">{session.mentore?.name}</h4>
                  <p className="text-sm text-purple-600">{session.topic}</p>
                </div>
              </div>
              {getStatusBadge(session.status || 'scheduled', session._id)}
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {session.status === 'scheduled' && (
                  <button onClick={() => setShowConfirmModal(session._id)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">Confirmer</button>
                )}
                {session.meetingLink && (
                   <a href={session.meetingLink} target="_blank" className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm flex items-center"><Video className="w-4 h-4 mr-1" /> Rejoindre</a>
                )}
                <button onClick={() => onOpenChat(session.mentore?._id || '')} className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm">Chat</button>
                {session.status === 'scheduled' && (
                  <button onClick={() => handleCancelSession(session._id)} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm">Annuler</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Confirmer votre présence</h3>
            <p className="text-gray-600 mb-6">Un lien Google Meet sera généré après confirmation.</p>
            <div className="flex space-x-3">
              <button onClick={() => setShowConfirmModal(null)} className="flex-1 border py-2 rounded-lg">Annuler</button>
              <button onClick={() => handleConfirmPresence(showConfirmModal)} className="flex-1 bg-green-600 text-white py-2 rounded-lg">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsManagerMentoree;
