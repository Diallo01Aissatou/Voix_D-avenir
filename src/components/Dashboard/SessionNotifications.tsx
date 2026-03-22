import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import Api from '../../data/Api';

interface Notification {
  id: string;
  type: 'session_updated' | 'session_confirmed' | 'session_cancelled' | 'session_reminder';
  message: string;
  sessionId?: string;
  timestamp: string;
  read: boolean;
}

interface SessionNotificationsProps {
  userId: string;
  onNotificationClick?: (notification: Notification) => void;
}

const SessionNotifications: React.FC<SessionNotificationsProps> = ({
  userId,
  onNotificationClick
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();

    // Écouter les événements de mise à jour de séance
    const handleSessionUpdate = (event: CustomEvent) => {
      const { type, sessionId, message } = event.detail;
      addNotification({
        id: `${Date.now()}-${Math.random()}`,
        type,
        message,
        sessionId,
        timestamp: new Date().toISOString(),
        read: false
      });
    };

    window.addEventListener('sessionUpdate', handleSessionUpdate as EventListener);

    // Vérifier les notifications toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000);

    return () => {
      window.removeEventListener('sessionUpdate', handleSessionUpdate as EventListener);
      clearInterval(interval);
    };
  }, [userId]);

  const loadNotifications = async () => {
    try {
      const response = await Api.get('/sessions/notifications');

      if (response.data) {
        const formattedNotifications = response.data.map((notif: any) => ({
          id: notif._id,
          type: notif.type,
          message: notif.title || notif.message,
          sessionId: notif.sessionId,
          timestamp: notif.createdAt,
          read: notif.read
        }));

        setNotifications(formattedNotifications);
        setUnreadCount(formattedNotifications.filter((n: any) => !n.read).length);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      // Fallback avec notifications vides si l'API échoue
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Garder max 10 notifications
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await Api.put(`/sessions/notifications/${notificationId}/read`);

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'session_confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'session_cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'session_updated':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    return `${Math.floor(diffMinutes / 1440)}j`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border z-50">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    markAsRead(notification.id);
                    onNotificationClick?.(notification);
                    setShowDropdown(false);
                  }}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-purple-50' : ''
                    }`}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t">
              <button
                onClick={async () => {
                  try {
                    await Api.put('/sessions/notifications/read-all');
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    setUnreadCount(0);
                  } catch (error) {
                    console.error('Erreur marquage notifications:', error);
                  }
                }}
                className="w-full text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Marquer tout comme lu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionNotifications;
