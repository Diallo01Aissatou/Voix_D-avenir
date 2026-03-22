/**
 * Utilitaire pour mapper les notifications du backend vers les templates Voix d'Avenir
 */

import {
  generateMessageReceivedNotification,
  generateMessageFromMentoreeNotification,
  generateMentorshipAcceptedNotification,
  generateMentorshipPendingNotification,
  generateMentorshipRejectedNotification,
  generateResourceAvailableNotification,
  generateSessionScheduledNotification,
  generateSessionReminderNotification,
  formatRelativeTime,
  NotificationData
} from '../services/voixAvenirNotifications';
import { NotificationType } from '../components/UI/ProfessionalNotification';

export interface BackendNotification {
  id: string;
  type: string;
  senderName?: string;
  recipientName?: string;
  mentorName?: string;
  mentoreeName?: string;
  status?: 'accepted' | 'pending' | 'rejected';
  resourceTitle?: string;
  resourceType?: string;
  sessionDate?: string;
  sessionTime?: string;
  message?: string;
  preview?: string;
  createdAt: string;
  read: boolean;
  data?: any;
}

export interface MappedNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionLabel: string;
  variant: 'default' | 'success' | 'error' | 'warning';
  timestamp: string;
  read: boolean;
  icon: NotificationType;
  data?: any;
}

/**
 * Mappe une notification du backend vers le format Voix d'Avenir
 */
export function mapBackendNotificationToVoixAvenir(
  backendNotif: BackendNotification,
  userRole: 'mentore' | 'mentoree' | 'admin'
): MappedNotification {
  let notificationData: NotificationData;
  let iconType: NotificationType = 'message';

  switch (backendNotif.type) {
    case 'message_received':
      if (userRole === 'mentore') {
        notificationData = generateMessageFromMentoreeNotification(
          backendNotif.mentoreeName || backendNotif.senderName || 'Votre mentorée',
          backendNotif.preview
        );
        iconType = 'reply';
      } else {
        notificationData = generateMessageReceivedNotification(
          backendNotif.mentorName || backendNotif.senderName || 'Votre mentor',
          backendNotif.preview
        );
        iconType = 'message';
      }
      break;

    case 'mentorship_accepted':
      notificationData = generateMentorshipAcceptedNotification(
        backendNotif.mentorName || 'Votre mentor'
      );
      iconType = 'request';
      break;

    case 'mentorship_pending':
      notificationData = generateMentorshipPendingNotification(
        backendNotif.mentorName || 'Votre mentor'
      );
      iconType = 'request';
      break;

    case 'mentorship_rejected':
      notificationData = generateMentorshipRejectedNotification(
        backendNotif.mentorName || 'Votre mentor'
      );
      iconType = 'request';
      break;

    case 'resource_available':
      notificationData = generateResourceAvailableNotification(
        backendNotif.resourceTitle || 'Nouvelle ressource',
        backendNotif.resourceType
      );
      iconType = 'resource';
      break;

    case 'session_scheduled':
      notificationData = generateSessionScheduledNotification(
        backendNotif.mentorName || backendNotif.mentoreeName || 'Votre partenaire',
        backendNotif.sessionDate || new Date().toLocaleDateString('fr-FR'),
        backendNotif.sessionTime || '14h00'
      );
      iconType = 'session';
      break;

    case 'session_reminder':
      notificationData = generateSessionReminderNotification(
        backendNotif.mentorName || backendNotif.mentoreeName || 'Votre partenaire',
        backendNotif.sessionDate || new Date().toLocaleDateString('fr-FR'),
        backendNotif.sessionTime || '14h00',
        false
      );
      iconType = 'reminder';
      break;

    default:
      // Fallback pour les notifications non reconnues
      notificationData = {
        title: backendNotif.message || 'Nouvelle notification',
        message: backendNotif.message || 'Vous avez une nouvelle notification.',
        actionLabel: 'Voir les détails',
        variant: 'default',
        icon: 'system'
      };
      iconType = 'system';
  }

  return {
    id: backendNotif.id,
    type: iconType,
    title: notificationData.title,
    message: notificationData.message,
    actionLabel: notificationData.actionLabel,
    variant: notificationData.variant,
    timestamp: formatRelativeTime(backendNotif.createdAt),
    read: backendNotif.read,
    icon: notificationData.icon as NotificationType,
    data: backendNotif.data
  };
}

/**
 * Mappe un tableau de notifications du backend
 */
export function mapBackendNotificationsToVoixAvenir(
  backendNotifications: BackendNotification[],
  userRole: 'mentore' | 'mentoree' | 'admin'
): MappedNotification[] {
  return backendNotifications.map(notif => 
    mapBackendNotificationToVoixAvenir(notif, userRole)
  );
}
