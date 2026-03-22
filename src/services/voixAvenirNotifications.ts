/**
 * Service de génération de notifications pour la plateforme "Voix d'Avenir"
 * Notifications professionnelles et bienveillantes pour le mentorat féminin
 */

export type NotificationCategory = 
  | 'message_received' 
  | 'message_sent' 
  | 'mentorship_accepted' 
  | 'mentorship_pending' 
  | 'mentorship_rejected'
  | 'resource_available'
  | 'session_scheduled'
  | 'session_reminder';

export interface NotificationData {
  title: string;
  message: string;
  actionLabel: string;
  variant: 'default' | 'success' | 'error' | 'warning';
  icon: 'message' | 'reply' | 'session' | 'reminder' | 'resource' | 'request' | 'system';
}

/**
 * Génère une notification pour un nouveau message reçu (mentoré reçoit un message du mentor)
 */
export function generateMessageReceivedNotification(
  mentorName: string,
  preview?: string
): NotificationData {
  return {
    title: 'Nouveau message de votre mentor',
    message: preview 
      ? `Vous avez reçu un nouveau message de votre mentor ${mentorName}. ${preview}`
      : `Vous avez reçu un nouveau message de votre mentor ${mentorName}. Cliquez pour lire et répondre.`,
    actionLabel: 'Voir le message',
    variant: 'default',
    icon: 'message'
  };
}

/**
 * Génère une notification pour un nouveau message reçu (mentor reçoit un message de la mentorée)
 */
export function generateMessageFromMentoreeNotification(
  mentoreeName: string,
  preview?: string
): NotificationData {
  return {
    title: 'Nouveau message de votre mentorée',
    message: preview
      ? `${mentoreeName} vous a envoyé un message. ${preview}`
      : `${mentoreeName} vous a envoyé un message. Cliquez pour lire et répondre.`,
    actionLabel: 'Voir le message',
    variant: 'default',
    icon: 'reply'
  };
}

/**
 * Génère une notification pour une demande de mentorat acceptée
 */
export function generateMentorshipAcceptedNotification(
  mentorName: string
): NotificationData {
  return {
    title: 'Demande de mentorat acceptée !',
    message: `Votre demande de mentorat avec ${mentorName} est acceptée. Commencez votre première séance maintenant !`,
    actionLabel: 'Commencer le mentorat',
    variant: 'success',
    icon: 'request'
  };
}

/**
 * Génère une notification pour une demande de mentorat en attente
 */
export function generateMentorshipPendingNotification(
  mentorName: string
): NotificationData {
  return {
    title: 'Demande de mentorat en attente',
    message: `Votre demande de mentorat avec ${mentorName} est en attente. Vous serez informée dès qu'elle sera examinée.`,
    actionLabel: 'Voir la demande',
    variant: 'warning',
    icon: 'request'
  };
}

/**
 * Génère une notification pour une demande de mentorat refusée
 */
export function generateMentorshipRejectedNotification(
  mentorName: string
): NotificationData {
  return {
    title: 'Mise à jour de votre demande',
    message: `Votre demande de mentorat avec ${mentorName} a été refusée. Vous pouvez envoyer une nouvelle demande à un autre mentor.`,
    actionLabel: 'Explorer d\'autres mentors',
    variant: 'error',
    icon: 'request'
  };
}

/**
 * Génère une notification pour une nouvelle ressource disponible
 */
export function generateResourceAvailableNotification(
  resourceTitle: string,
  resourceType?: string
): NotificationData {
  const typeText = resourceType ? ` (${resourceType})` : '';
  return {
    title: 'Nouvelle ressource disponible',
    message: `Une nouvelle ressource "${resourceTitle}"${typeText} a été ajoutée à la bibliothèque. Une lecture inspirante pour votre parcours.`,
    actionLabel: 'Découvrir la ressource',
    variant: 'default',
    icon: 'resource'
  };
}

/**
 * Génère une notification pour une nouvelle séance de mentorat programmée
 */
export function generateSessionScheduledNotification(
  mentorName: string,
  sessionDate: string,
  sessionTime: string
): NotificationData {
  return {
    title: 'Nouvelle séance de mentorat programmée',
    message: `Une séance de mentorat avec ${mentorName} a été programmée le ${sessionDate} à ${sessionTime}. Préparez vos questions !`,
    actionLabel: 'Voir les détails',
    variant: 'default',
    icon: 'session'
  };
}

/**
 * Génère une notification de rappel pour une séance à venir
 */
export function generateSessionReminderNotification(
  mentorName: string,
  sessionDate: string,
  sessionTime: string,
  isToday: boolean = false
): NotificationData {
  const dateText = isToday ? 'aujourd\'hui' : `le ${sessionDate}`;
  return {
    title: 'Rappel : Séance de mentorat à venir',
    message: `N'oubliez pas votre séance de mentorat avec ${mentorName} prévue ${dateText} à ${sessionTime}. Préparez vos questions !`,
    actionLabel: 'Rejoindre la séance',
    variant: 'warning',
    icon: 'reminder'
  };
}

/**
 * Exemples concrets de notifications pour la démo
 */
export const EXAMPLE_NOTIFICATIONS = {
  messageReceived: generateMessageReceivedNotification(
    'Fatoumata Diallo',
    'Elle souhaite discuter de votre projet professionnel.'
  ),
  
  messageFromMentoree: generateMessageFromMentoreeNotification(
    'Aminata Traoré',
    'Elle vous remercie pour vos conseils et souhaite planifier une nouvelle séance.'
  ),
  
  mentorshipAccepted: generateMentorshipAcceptedNotification('Aissatou Diallo'),
  
  mentorshipPending: generateMentorshipPendingNotification('Hawa Mansaré'),
  
  mentorshipRejected: generateMentorshipRejectedNotification('Hadja Safiatou Diallo'),
  
  resourceAvailable: generateResourceAvailableNotification(
    'Le Leadership au Féminin',
    'Guide PDF'
  ),
  
  sessionScheduled: generateSessionScheduledNotification(
    'Fatoumata Diallo',
    'Mardi 24 Octobre 2024',
    '14h00'
  ),
  
  sessionReminder: generateSessionReminderNotification(
    'Aissatou Diallo',
    'Mardi 24 Octobre 2024',
    '14h00',
    false
  )
};

/**
 * Fonction utilitaire pour formater le temps relatif
 */
export function formatRelativeTime(timestamp: string | Date): string {
  const now = new Date();
  const time = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const diffMs = now.getTime() - time.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'À l\'instant';
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  
  return time.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long',
    year: time.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}
