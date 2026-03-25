import React, { useState } from 'react';
import { Calendar, Clock, User, Video, MessageSquare, CheckCircle, XCircle, AlertCircle, ExternalLink, FileText, Edit, Trash2, Plus } from 'lucide-react';

// Fonction utilitaire pour corriger les URLs des photos
const getPhotoUrl = (photo: string | undefined) => {
  if (!photo) return null;
  if (photo.startsWith('http')) return photo;
  const fileName = photo.split('/').pop();
  return `https://voix-avenir-backend.onrender.com/uploads/${fileName}`;
};

interface SessionsManagerProps {
  sessions: any[];
  onRefresh: () => void;
  onOpenChat: (userId: string) => void;
  onRequestMentorship: () => void;
}

const SessionsManager: React.FC<SessionsManagerProps> = ({ 
  sessions, 
  onRefresh, 
  onOpenChat, 
  onRequestMentorship 
}) => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [confirmingPresence, setConfirmingPresence] = useState(null);

  const API_URL = 'https://voix-avenir-backend.onrender.com';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'À venir';
      case 'confirmed': return 'Confirmée';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      case 'pending': return 'En attente';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const confirmPresence = async (sessionId: string) => {
    setConfirmingPresence(sessionId);
    try {
      const response = await fetch(`${API_URL}/api/mentorship/sessions/${sessionId}/confirm`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (response.ok) {
        alert('Présence confirmée avec succès !');
        onRefresh();
      } else {
        const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur confirmation présence:', error);
      alert('Erreur de connexion');
    } finally {
      setConfirmingPresence(null);
    }
  };

  const cancelSession = async (sessionId: string) => {
    if (!confirm('Êtes-vous sûre de vouloir annuler cette séance ?')) return;
    try {
      const response = await fetch(`${API_URL}/api/mentorship/sessions/${sessionId}/cancel`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (response.ok) {
        alert('Séance annulée avec succès !');
        onRefresh();
      } else {
        const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur annulation séance:', error);
      alert('Erreur de connexion');
    }
  };

  const SessionCard = ({ session }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
          {getPhotoUrl(session.mentore?.photo) ? (
            <img src={getPhotoUrl(session.mentore.photo)} alt={session.mentore.name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-white" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-lg font-bold text-gray-800">{session.mentore?.name}</h4>
              <p className="text-purple-600 text-sm font-medium">{session.mentore?.profession}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm flex items-center ${getStatusColor(session.status)}`}>
                {getStatusIcon(session.status)}
                <span className="ml-1">{getStatusText(session.status)}</span>
              </span>
            </div>
          </div>

          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center"><Calendar className="w-4 h-4 mr-2" />{new Date(session.scheduledDate).toLocaleDateString()}</div>
            <div className="flex items-center"><Clock className="w-4 h-4 mr-2" />{session.scheduledTime} - {session.duration || 60} min</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => {setSelectedSession(session); setShowDetails(true);}} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">Détails</button>
            {session.status === 'scheduled' && (
              <button onClick={() => confirmPresence(session._id)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">Confirmer</button>
            )}
            <button onClick={() => onOpenChat(session.mentore._id)} className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm">Contacter</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Mes Séances</h3>
        <button onClick={onRequestMentorship} className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Demander
        </button>
      </div>
      <div className="space-y-4">
        {sessions.map((session) => <SessionCard key={session._id} session={session} />)}
      </div>
    </div>
  );
};

export default SessionsManager;
