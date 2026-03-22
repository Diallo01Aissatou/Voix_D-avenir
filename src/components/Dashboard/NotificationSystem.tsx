import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import ProfessionalNotification, { NotificationType } from '../UI/ProfessionalNotification';
import Api from '../../data/Api';

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

  useEffect(() => {
    loadNotifications();

    // Actualiser les notifications toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, [userId]);

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

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Tout effacer
                  </button>
                )}
                <button
                  onClick={() => setShowDropdown(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <ProfessionalNotification
                  key={notification.id}
                  type={notification.type as NotificationType}
                  title={notification.title}
                  message={notification.message}
                  timestamp={notification.time}
                  read={notification.read}
                  onClick={() => handleNotificationClick(notification)}
                  className="mb-2 border-b-0 last:mb-0"
                  variant={
                    notification.data?.status === 'accepted' ? 'success' :
                      notification.data?.status === 'rejected' ? 'error' :
                        notification.data?.status === 'pending' ? 'warning' :
                          'default'
                  }
                />
              ))
            )}
          </div>

          {notifications.length > 0 && onViewAll && (
            <div className="p-3 border-t border-gray-100 text-center">
              <button
                onClick={() => {
                  onViewAll();
                  setShowDropdown(false);
                }}
                className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
              >
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;
