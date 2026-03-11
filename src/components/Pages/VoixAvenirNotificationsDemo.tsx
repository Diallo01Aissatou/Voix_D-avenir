import React from 'react';
import ProfessionalNotification, { NotificationType } from '../UI/ProfessionalNotification';
import { Bell, Heart, Sparkles } from 'lucide-react';
import {
  EXAMPLE_NOTIFICATIONS,
  formatRelativeTime,
  generateMessageReceivedNotification,
  generateMessageFromMentoreeNotification,
  generateMentorshipAcceptedNotification,
  generateMentorshipPendingNotification,
  generateMentorshipRejectedNotification,
  generateResourceAvailableNotification,
  generateSessionScheduledNotification,
  generateSessionReminderNotification
} from '../../services/voixAvenirNotifications';

/**
 * Page de démonstration des notifications pour "Voix d'Avenir"
 * Affiche tous les types de notifications avec des exemples concrets
 */
const VoixAvenirNotificationsDemo: React.FC = () => {
  // Générer des notifications avec des exemples concrets
  const notifications = [
    {
      id: '1',
      ...EXAMPLE_NOTIFICATIONS.messageReceived,
      type: 'message' as NotificationType,
      timestamp: formatRelativeTime(new Date()),
      read: false,
    },
    {
      id: '2',
      ...EXAMPLE_NOTIFICATIONS.messageFromMentoree,
      type: 'reply' as NotificationType,
      timestamp: formatRelativeTime(new Date(Date.now() - 10 * 60 * 1000)),
      read: false,
    },
    {
      id: '3',
      ...EXAMPLE_NOTIFICATIONS.mentorshipAccepted,
      type: 'request' as NotificationType,
      timestamp: formatRelativeTime(new Date(Date.now() - 30 * 60 * 1000)),
      read: false,
    },
    {
      id: '4',
      ...EXAMPLE_NOTIFICATIONS.mentorshipPending,
      type: 'request' as NotificationType,
      timestamp: formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000)),
      read: false,
    },
    {
      id: '5',
      ...EXAMPLE_NOTIFICATIONS.mentorshipRejected,
      type: 'request' as NotificationType,
      timestamp: formatRelativeTime(new Date(Date.now() - 5 * 60 * 60 * 1000)),
      read: true,
    },
    {
      id: '6',
      ...EXAMPLE_NOTIFICATIONS.resourceAvailable,
      type: 'resource' as NotificationType,
      timestamp: formatRelativeTime(new Date(Date.now() - 24 * 60 * 60 * 1000)),
      read: true,
    },
    {
      id: '7',
      ...EXAMPLE_NOTIFICATIONS.sessionScheduled,
      type: 'session' as NotificationType,
      timestamp: formatRelativeTime(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
      read: false,
    },
    {
      id: '8',
      ...EXAMPLE_NOTIFICATIONS.sessionReminder,
      type: 'reminder' as NotificationType,
      timestamp: formatRelativeTime(new Date(Date.now() - 6 * 60 * 60 * 1000)),
      read: false,
    },
  ];

  const handleAction = (notificationId: string, actionType: string) => {
    console.log(`Action "${actionType}" déclenchée pour la notification ${notificationId}`);
    // Ici, vous pouvez ajouter la logique de navigation ou d'action
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* En-tête avec branding Voix d'Avenir */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Voix d'Avenir
          </h1>
          <p className="text-xl text-gray-700 font-medium mb-2">
            Centre de Notifications
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Restez connectée avec votre parcours de mentorat. Des notifications bienveillantes 
            pour vous accompagner dans votre développement professionnel.
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Non lues</p>
                <p className="text-2xl font-bold text-purple-600">
                  {notifications.filter(n => !n.read).length}
                </p>
              </div>
              <Bell className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-pink-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-pink-600">
                  {notifications.length}
                </p>
              </div>
              <Heart className="w-8 h-8 text-pink-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Messages</p>
                <p className="text-2xl font-bold text-purple-600">
                  {notifications.filter(n => n.type === 'message' || n.type === 'reply').length}
                </p>
              </div>
              <Bell className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Liste des notifications */}
        <div className="space-y-4 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Vos notifications
          </h2>
          {notifications.map((notification) => (
            <ProfessionalNotification
              key={notification.id}
              id={notification.id}
              type={notification.icon as NotificationType}
              title={notification.title}
              message={notification.message}
              actionLabel={notification.actionLabel}
              timestamp={notification.timestamp}
              read={notification.read}
              variant={notification.variant}
              onAction={() => handleAction(notification.id, notification.actionLabel)}
              onClick={() => handleAction(notification.id, 'click')}
              className="hover:shadow-lg transition-shadow"
            />
          ))}
        </div>

        {/* Guide de style et bonnes pratiques */}
        <div className="bg-white rounded-xl border border-purple-200 shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
            Guide des notifications Voix d'Avenir
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Types de notifications */}
            <div>
              <h3 className="text-lg font-semibold text-purple-700 mb-4">
                Types de notifications
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-purple-400 pl-4">
                  <h4 className="font-medium text-gray-900 mb-1">Messages</h4>
                  <p className="text-sm text-gray-600">
                    Notifications lorsqu'un mentor ou une mentorée envoie un message.
                    Couleur : Violet
                  </p>
                </div>
                <div className="border-l-4 border-pink-400 pl-4">
                  <h4 className="font-medium text-gray-900 mb-1">Demandes de mentorat</h4>
                  <p className="text-sm text-gray-600">
                    Acceptées (vert), en attente (jaune), refusées (rose).
                    Couleur : Violet/Rose selon le statut
                  </p>
                </div>
                <div className="border-l-4 border-purple-400 pl-4">
                  <h4 className="font-medium text-gray-900 mb-1">Séances programmées</h4>
                  <p className="text-sm text-gray-600">
                    Nouvelles séances et rappels de séances à venir.
                    Couleur : Violet/Rose
                  </p>
                </div>
                <div className="border-l-4 border-purple-400 pl-4">
                  <h4 className="font-medium text-gray-900 mb-1">Ressources</h4>
                  <p className="text-sm text-gray-600">
                    Nouvelles ressources ajoutées à la bibliothèque.
                    Couleur : Violet
                  </p>
                </div>
              </div>
            </div>

            {/* Principes de communication */}
            <div>
              <h3 className="text-lg font-semibold text-pink-700 mb-4">
                Principes de communication
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Heart className="w-5 h-5 text-pink-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900">Bienveillance</span>
                    <p className="text-sm text-gray-600">
                      Ton positif et encourageant pour accompagner le développement
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Sparkles className="w-5 h-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900">Clarté</span>
                    <p className="text-sm text-gray-600">
                      Messages courts, précis et faciles à comprendre
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Bell className="w-5 h-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900">Action</span>
                    <p className="text-sm text-gray-600">
                      Chaque notification propose une action claire et utile
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Heart className="w-5 h-5 text-pink-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900">Motivation</span>
                    <p className="text-sm text-gray-600">
                      Messages inspirants qui encouragent l'engagement
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Exemples d'utilisation */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Exemples d'utilisation dans le code
          </h2>
          <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
            <pre className="text-sm text-gray-100">
{`import {
  generateMessageReceivedNotification,
  generateMentorshipAcceptedNotification,
  formatRelativeTime
} from '@/services/voixAvenirNotifications';

// Notification de message reçu
const notification = generateMessageReceivedNotification(
  'Fatoumata Diallo',
  'Elle souhaite discuter de votre projet.'
);

// Notification de demande acceptée
const acceptedNotif = generateMentorshipAcceptedNotification(
  'Aissatou Diallo'
);

// Formatage du temps
const time = formatRelativeTime(new Date());`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoixAvenirNotificationsDemo;
