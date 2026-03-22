/**
 * Exemple d'intégration du système de notifications Voix d'Avenir
 * 
 * Ce fichier montre comment intégrer les notifications dans votre application
 */

import React, { useState, useEffect } from 'react';
import ProfessionalNotification, { NotificationType } from '../components/UI/ProfessionalNotification';
import {
  generateMessageReceivedNotification,
  generateMentorshipAcceptedNotification,
  formatRelativeTime
} from '../services/voixAvenirNotifications';
import { mapBackendNotificationToVoixAvenir } from '../utils/notificationMapper';

// Exemple 1: Utilisation directe des fonctions de génération
const DirectUsageExample: React.FC = () => {
  const notification = generateMessageReceivedNotification(
    'Fatoumata Diallo',
    'Elle souhaite discuter de votre projet professionnel.'
  );

  return (
    <ProfessionalNotification
      type="message"
      title={notification.title}
      message={notification.message}
      actionLabel={notification.actionLabel}
      variant={notification.variant}
      timestamp={formatRelativeTime(new Date())}
      read={false}
      onAction={() => {
        console.log('Navigation vers les messages');
        // navigate('/messages');
      }}
    />
  );
};

// Exemple 2: Utilisation avec mapping depuis le backend
const BackendIntegrationExample: React.FC<{ userRole: 'mentore' | 'mentoree' }> = ({ userRole }) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // Simuler une réponse API
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      });
      const data = await response.json();

      // Mapper les notifications du backend vers Voix d'Avenir
      const mappedNotifications = data.map((notif: any) =>
        mapBackendNotificationToVoixAvenir(notif, userRole)
      );

      setNotifications(mappedNotifications);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <ProfessionalNotification
          key={notification.id}
          type={notification.icon}
          title={notification.title}
          message={notification.message}
          actionLabel={notification.actionLabel}
          variant={notification.variant}
          timestamp={notification.timestamp}
          read={notification.read}
          onAction={() => {
            handleNotificationAction(notification);
          }}
        />
      ))}
    </div>
  );
};

// Exemple 3: Gestion des actions selon le type de notification
const handleNotificationAction = (notification: any) => {
  switch (notification.type) {
    case 'message':
    case 'reply':
      // Navigation vers la messagerie
      console.log('Navigation vers messages');
      // navigate('/messages');
      break;

    case 'request':
      if (notification.variant === 'success') {
        // Navigation vers le mentorat accepté
        console.log('Navigation vers mentorat');
        // navigate('/mentorship');
      } else {
        // Navigation vers les demandes
        console.log('Navigation vers demandes');
        // navigate('/mentorship-requests');
      }
      break;

    case 'session':
    case 'reminder':
      // Navigation vers les séances
      console.log('Navigation vers séances');
      // navigate('/sessions');
      break;

    case 'resource':
      // Navigation vers les ressources
      console.log('Navigation vers ressources');
      // navigate('/resources');
      break;

    default:
      console.log('Action par défaut');
  }
};

// Exemple 4: Création dynamique de notifications selon les événements
export const createNotificationForEvent = (
  eventType: string,
  eventData: any,
  userRole: 'mentore' | 'mentoree'
) => {
  switch (eventType) {
    case 'NEW_MESSAGE':
      if (userRole === 'mentore') {
        return generateMessageFromMentoreeNotification(
          eventData.senderName,
          eventData.preview
        );
      } else {
        return generateMessageReceivedNotification(
          eventData.senderName,
          eventData.preview
        );
      }

    case 'MENTORSHIP_ACCEPTED':
      return generateMentorshipAcceptedNotification(eventData.mentorName);

    case 'MENTORSHIP_PENDING':
      return generateMentorshipPendingNotification(eventData.mentorName);

    case 'MENTORSHIP_REJECTED':
      return generateMentorshipRejectedNotification(eventData.mentorName);

    case 'NEW_RESOURCE':
      return generateResourceAvailableNotification(
        eventData.resourceTitle,
        eventData.resourceType
      );

    case 'SESSION_SCHEDULED':
      return generateSessionScheduledNotification(
        eventData.partnerName,
        eventData.date,
        eventData.time
      );

    case 'SESSION_REMINDER':
      return generateSessionReminderNotification(
        eventData.partnerName,
        eventData.date,
        eventData.time,
        eventData.isToday
      );

    default:
      return null;
  }
};

// Exemple 5: Hook personnalisé pour les notifications
export const useVoixAvenirNotifications = (userRole: 'mentore' | 'mentoree' | 'admin') => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Actualiser toutes les 30s
    return () => clearInterval(interval);
  }, [userRole]);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      });
      const data = await response.json();

      const mapped = data.map((notif: any) =>
        mapBackendNotificationToVoixAvenir(notif, userRole)
      );

      setNotifications(mapped);
      setUnreadCount(mapped.filter((n: any) => !n.read).length);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        credentials: 'include'
      });

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    refresh: loadNotifications
  };
};

export default DirectUsageExample;
