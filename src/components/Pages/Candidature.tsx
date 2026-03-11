import React, { useState, ChangeEvent, FormEvent } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

// Type pour un mentor
interface Mentor {
  id: string;
  name: string;
}

// Type pour les données du formulaire
interface FormData {
  mentor: string;
  scheduledAt: string;
}

// Données fictives pour les mentors
const mockMentors: Mentor[] = [
  { id: 'mentor1', name: 'Dr. Jane Doe' },
  { id: 'mentor2', name: 'Prof. John Smith' },
  { id: 'mentor3', name: 'Mme. Sarah Conner' },
];

interface AppointmentFormProps {
  onNavigate?: (page: string) => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = () => {
  const [formData, setFormData] = useState<FormData>({
    mentor: '',
    scheduledAt: '',
  });

  const [message, setMessage] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Données du rendez-vous soumises :', formData);
    setMessage('Votre demande de rendez-vous a été soumise avec succès !');
    setFormData({
      mentor: '',
      scheduledAt: '',
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white font-sans">
      <div className="w-full max-w-4xl flex bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Colonne de gauche avec gradient et texte */}
        <div className="hidden md:flex flex-col justify-center items-start p-8 lg:p-12 w-full md:w-1/2 bg-gradient-to-br from-pink-500 to-purple-600 text-white">
          <h2 className="text-3xl font-extrabold mb-4">Prendre un rendez-vous</h2>
          <p className="text-lg font-light mb-6">
            Sélectionnez un mentor et une date pour planifier votre séance. Nous vous contacterons une fois votre rendez-vous confirmé.
          </p>
          <ul className="space-y-4 text-base">
            <li className="flex items-center">
              <CheckIcon className="h-5 w-5 mr-3 text-green-300" />
              Prenez rendez-vous en quelques clics.
            </li>
            <li className="flex items-center">
              <CheckIcon className="h-5 w-5 mr-3 text-green-300" />
              Consultez le statut de votre demande en temps réel.
            </li>
            <li className="flex items-center">
              <CheckIcon className="h-5 w-5 mr-3 text-green-300" />
              Recevez des rappels pour vos séances.
            </li>
          </ul>
        </div>

        {/* Colonne de droite avec le formulaire */}
        <div className="w-full md:w-1/2 p-8 lg:p-12">
          {message && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg text-center font-medium">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sélection du mentor */}
            <div>
              <label
                htmlFor="mentor"
                className="block text-sm font-light text-gray-500 mb-1"
              >
                Mentor
              </label>
              <select
                name="mentor"
                id="mentor"
                required
                value={formData.mentor}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors text-gray-900"
              >
                <option value="">Sélectionnez un mentor</option>
                {mockMentors.map((mentor) => (
                  <option key={mentor.id} value={mentor.id}>
                    {mentor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date et heure du rendez-vous */}
            <div>
              <label
                htmlFor="scheduledAt"
                className="block text-sm font-light text-gray-500 mb-1"
              >
                Date et heure du rendez-vous
              </label>
              <input
                type="datetime-local"
                name="scheduledAt"
                id="scheduledAt"
                required
                value={formData.scheduledAt}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 mt-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50 transition-all transform hover:scale-105"
            >
              Soumettre la Demande
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
