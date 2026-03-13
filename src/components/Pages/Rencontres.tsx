import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

interface User {
  _id: string;
  role: 'mentee' | 'mentor';
  fullName?: string;
}

interface Appointment {
  _id: string;
  mentor: User;
  mentee: User;
  scheduledAt: string;
  status: 'en attente' | 'accepté' | 'refusé' | 'terminé' | 'annulé';
  notes?: string;
}

interface FormData {
  mentor: string;
  scheduledAt: string;
  notes: string;
}

interface RencontresProps {
  onNavigate?: (page: string) => void;
}

const App: React.FC<RencontresProps> = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [formData, setFormData] = useState<FormData>({ mentor: '', scheduledAt: '', notes: '' });
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User>({ _id: '66d03d42f5347f3b610c4a4a', role: 'mentee' }); // Exemple utilisateur
  const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://voix-avenir-backend.onrender.com';

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${API_URL}/api/appointments`);
        const data: Appointment[] = await response.json();
        if (response.ok) setAppointments(data);
        else console.error('Failed to fetch appointments:', data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    const fetchMentors = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/mentors`);
        const data: User[] = await response.json();
        if (response.ok) setMentors(data);
        else console.error('Failed to fetch mentors:', data);
      } catch (error) {
        console.error('Error fetching mentors:', error);
      }
    };

    fetchAppointments();
    fetchMentors();
  }, [API_URL]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRequestAppointment = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('');
    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, mentee: user._id }),
      });

      if (response.ok) {
        const newAppt: Appointment = await response.json();
        setStatus('Demande de rendez-vous envoyée avec succès !');
        setFormData({ mentor: '', scheduledAt: '', notes: '' });
        setAppointments(prev => [...prev, newAppt]);
      } else {
        const errorData = await response.json();
        setStatus(`Erreur lors de l'envoi : ${errorData.message}`);
      }
    } catch (error) {
      setStatus('Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Appointment['status']) => {
    try {
      const response = await fetch(`${API_URL}/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setAppointments(prev =>
          prev.map(appt => (appt._id === id ? { ...appt, status: newStatus } : appt))
        );
      } else {
        const errorData = await response.json();
        console.error(`Erreur: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour.', error);
    }
  };

  const getStatusClass = (status: Appointment['status']) => {
    switch (status) {
      case 'en attente': return 'bg-yellow-100 text-yellow-800';
      case 'accepté': return 'bg-green-100 text-green-800';
      case 'refusé': return 'bg-red-100 text-red-800';
      case 'terminé': return 'bg-gray-100 text-gray-800';
      case 'annulé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl overflow-hidden p-8 mb-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Gestion des rendez-vous</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Demander un rendez-vous */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-4">Demander un rendez-vous</h2>
            <form onSubmit={handleRequestAppointment} className="space-y-4">
              <div>
                <label htmlFor="mentor" className="block text-sm font-medium">Mentor</label>
                <select
                  name="mentor"
                  id="mentor"
                  value={formData.mentor}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-800"
                >
                  <option value="">Sélectionner un mentor</option>
                  {mentors.map(mentor => (
                    <option key={mentor._id} value={mentor._id}>{mentor.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="scheduledAt" className="block text-sm font-medium">Date et heure</label>
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  id="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-800"
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium">Notes</label>
                <textarea
                  name="notes"
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-800"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm font-semibold transition-colors duration-300 bg-white text-purple-600 hover:bg-gray-100"
              >
                {isLoading ? 'Envoi...' : 'Envoyer la demande'}
              </button>
              {status && <p className="mt-4 text-center font-medium">{status}</p>}
            </form>
          </div>

          {/* Mes rendez-vous */}
          <div className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Mes rendez-vous</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {appointments.length > 0 ? (
                appointments.map(appt => (
                  <div key={appt._id} className="bg-white rounded-lg p-4 shadow-md">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-gray-700">
                        {user.role === 'mentee' ? `Avec ${appt.mentor.fullName}` : `Pour ${appt.mentee.fullName}`}
                      </p>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(appt.status)}`}>
                        {appt.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Date : {new Date(appt.scheduledAt).toLocaleString()}</p>
                    {appt.notes && <p className="text-sm text-gray-600 mt-1">Notes : {appt.notes}</p>}
                    {user.role === 'mentor' && appt.status === 'en attente' && (
                      <div className="flex mt-3 space-x-2">
                        <button
                          onClick={() => handleUpdateStatus(appt._id, 'accepté')}
                          className="flex-1 py-1 px-3 text-sm rounded-md bg-green-500 text-white hover:bg-green-600"
                        >Accepter</button>
                        <button
                          onClick={() => handleUpdateStatus(appt._id, 'refusé')}
                          className="flex-1 py-1 px-3 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
                        >Refuser</button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">Aucun rendez-vous trouvé.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
