import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import ProfessionalNotification, { NotificationType } from '../UI/ProfessionalNotification';
import Api from '../../data/Api';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  data?: any;
}

interface NotificationSystemProps {
  userId: string;
  userRole: string;
  onNotificationClick?: (notification: Notification) => void;
  onViewAll?: () => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  userId,
  onNotificationClick,
  onViewAll
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();

  useEffect(() => {
    loadNotifications();

    // Actualiser les notifications toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  // Écouter les notifications Socket en temps réel
  useEffect(() => {
    const handleNewMentorshipRequest = (data: any) => {
      console.log('Nouvelle demande de mentorat (Socket):', data);
      toast('Nouvelle demande de mentorat !', { icon: '📝', duration: 5000 });
      loadNotifications();
    };

    const handleMentorshipResponse = (data: any) => {
      console.log('Réponse à votre demande de mentorat (Socket):', data);
      toast('Mise à jour de votre demande de mentorat', { icon: '🔔', duration: 5000 });
      loadNotifications();
    };

    socket.on('newMentorshipRequest', handleNewMentorshipRequest);
    socket.on('mentorshipResponse', handleMentorshipResponse);

    return () => {
      socket.off('newMentorshipRequest', handleNewMentorshipRequest);
      socket.off('mentorshipResponse', handleMentorshipResponse);
    };
  }, [socket]);

  const loadNotifications = async () => {
    try {
      const localReadDb = JSON.parse(localStorage.getItem(`read_notifs_${userId}`) || '{}');

      // Charger les notifications de séances et de mentorat
      const [sessionsRes, mentorshipRes] = await Promise.all([
        Api.get('/sessions/notifications').catch(() => ({ data: [] })),
        Api.get('/mentorship/notifications').catch(() => ({ data: [] }))
      ]);

      let allNotifications: Notification[] = [];

      if (sessionsRes.data && Array.isArray(sessionsRes.data)) {
        const sessionNotifs = sessionsRes.data.map((notif: any) => ({
          id: notif._id,
          type: 'session' as NotificationType,
          title: notif.title || getNotificationTitle(notif),
          message: notif.message,
          time: formatTime(notif.createdAt),
          read: notif.read || !!localReadDb[notif._id],
          data: notif
        }));
        allNotifications = [...allNotifications, ...sessionNotifs];
      }

      try {
        if (mentorshipRes.data && Array.isArray(mentorshipRes.data)) {
          const mentorshipNotifs = mentorshipRes.data.map((notif: any) => {
            const notifId = notif.id || `notif-${notif.data?.requestId || Math.random()}`;
            return {
              id: notifId,
              type: notif.type as NotificationType,
              title: getNotificationTitle(notif),
              message: notif.message,
              time: notif.time || formatTime(notif.createdAt),
              read: !!localReadDb[notifId],
              data: notif
            };
          });
          allNotifications = [...allNotifications, ...mentorshipNotifs];
        }
      } catch (mentorshipError) {
        console.log('Pas de notifications de mentorat disponibles');
      }

      // Trier par date (plus récent en premier)
      allNotifications.sort((a, b) => {
        const dateA = new Date(a.data?.createdAt || 0).getTime();
        const dateB = new Date(b.data?.createdAt || 0).getTime();
        return dateB - dateA;
      });

      // Afficher un toast pour les nouvelles notifications non lues
      const localToastedDb = JSON.parse(localStorage.getItem(`toasted_notifs_${userId}`) || '{}');
      let hasNewToasts = false;

      allNotifications.forEach(n => {
        if (!n.read && !localToastedDb[n.id]) {
          toast(
            (t) => (
              <div className="flex flex-col cursor-pointer" onClick={() => { toast.dismiss(t.id); handleNotificationClick(n); }}>
                <span className="font-bold text-sm text-purple-700">{n.title}</span>
                <span className="text-xs text-gray-600 mt-1">{n.message}</span>
              </div>
            ),
            {
              duration: 5000,
              icon: n.type === 'request' ? '📝' : n.type === 'message' ? '💬' : '🔔',
            }
          );
          localToastedDb[n.id] = true;
          hasNewToasts = true;
        }
      });

      if (hasNewToasts) {
        localStorage.setItem(`toasted_notifs_${userId}`, JSON.stringify(localToastedDb));
      }

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return 'Maintenant';
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    return `${Math.floor(diffMinutes / 1440)}j`;
  };

  const getNotificationTitle = (notification: any) => {
    const { type, data } = notification;

    if (type === 'request') {
      if (data?.status === 'accepted') return 'Demande acceptée !';
      if (data?.status === 'rejected') return 'Mise à jour de demande';
      if (data?.status === 'pending') return 'Nouvelle demande en attente';
      return 'Nouvelle demande de mentorat';
    }

    switch (type) {
      case 'session': return 'Séance de mentorat à venir';
      case 'message': return 'Nouveau message reçu';
      case 'system': return 'Notification système';
      default: return 'Notification';
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Marquer comme lu côté serveur
      await Api.put(`/sessions/notifications/${notificationId}/read`);
    } catch (error) {
      console.log('Erreur marquage notification:', error);
    }

    // Sauvegarder localement
    const localReadDb = JSON.parse(localStorage.getItem(`read_notifs_${userId}`) || '{}');
    localReadDb[notificationId] = true;
    localStorage.setItem(`read_notifs_${userId}`, JSON.stringify(localReadDb));

    // Marquer comme lu côté client
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    setShowDropdown(false);
  };

  const clearAllNotifications = async () => {
    try {
      // Marquer toutes les notifications comme lues côté serveur
      await Api.put('/sessions/notifications/read-all');
    } catch (error) {
      console.log('Erreur marquage toutes notifications:', error);
    }

    // Sauvegarder localement
    const localReadDb = JSON.parse(localStorage.getItem(`read_notifs_${userId}`) || '{}');
    notifications.forEach(n => {
      localReadDb[n.id] = true;
    });
    localStorage.setItem(`read_notifs_${userId}`, JSON.stringify(localReadDb));

    // Marquer toutes comme lues côté client
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleBellClick = () => {
    const unreadNotifs = notifications.filter(n => !n.read);
    
    if (unreadNotifs.length === 0) {
      toast('Aucune nouvelle notification', { icon: '👍' });
      return;
    }

    unreadNotifs.forEach(n => {
      toast(
        (t) => (
          <div className="flex flex-col cursor-pointer" onClick={() => { toast.dismiss(t.id); handleNotificationClick(n); }}>
            <span className="font-bold text-sm text-purple-700">{n.title}</span>
            <span className="text-xs text-gray-600 mt-1">{n.message}</span>
          </div>
        ),
        {
          duration: 5000,
          icon: n.type === 'request' ? '📝' : n.type === 'message' ? '💬' : '🔔',
        }
      );
    });
  };

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default NotificationSystem;
