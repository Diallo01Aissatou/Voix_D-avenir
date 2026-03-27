import React, { useState } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import Api from '../../data/Api'; // Importation du service Api

// Fonction utilitaire pour corriger les URLs des photos
const getPhotoUrl = (photo: string | undefined) => {
  if (!photo) return null;
  let url = photo;
  if (!photo.startsWith('http')) {
    const fileName = photo.split('/').pop();
    url = `https://voix-avenir-backend.onrender.com/uploads/${fileName}`;
  }
  return url.replace('http://', 'https://');
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
  const [_selectedSession, _setSelectedSession] = useState<any>(null);
  const [_showDetails, _setShowDetails] = useState(false);
  const [_confirmingPresence, setConfirmingPresence] = useState<string | null>(null);


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
      const res = await Api.put(`/mentorship/sessions/${sessionId}/confirm`);
      if (res.data) {
        alert('Présence confirmée avec succès !');
        onRefresh();
      }
    } catch (error: any) {
      console.error('Erreur confirmation présence:', error);
      alert(`Erreur: ${error.response?.data?.message || 'Erreur de connexion'}`);
    } finally {
      setConfirmingPresence(null);
    }
  };

  const cancelSession = async (sessionId: string) => {
    if (!confirm('Êtes-vous sûre de vouloir annuler cette séance ?')) return;
    try {
      const res = await Api.put(`/mentorship/sessions/${sessionId}/cancel`);
      if (res.data) {
        alert('Séance annulée avec succès !');
        onRefresh();
      }
    } catch (error: any) {
      console.error('Erreur annulation séance:', error);
      alert(`Erreur: ${error.response?.data?.message || 'Erreur de connexion'}`);
    }
  };

  const SessionCard = ({ session }: { session: any }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
          {getPhotoUrl(session.mentore?.photo) ? (
            <img src={getPhotoUrl(session.mentore.photo)!} alt={session.mentore.name} className="w-16 h-16 rounded-full object-cover" />
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
            <button onClick={() => _setShowDetails(true)} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">Détails</button>
            {session.status === 'scheduled' && (
              <button onClick={() => confirmPresence(session._id)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">Confirmer</button>
            )}
            {session.status === 'scheduled' && (
              <button onClick={() => cancelSession(session._id)} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm">Annuler</button>
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
