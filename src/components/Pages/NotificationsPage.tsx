import React, { useState, useEffect } from 'react';
import ProfessionalNotification, { NotificationType } from '../UI/ProfessionalNotification';
import { Bell, Loader2, RefreshCw, CheckSquare, Trash2, BellOff } from 'lucide-react';
import { notificationService, BackendNotification } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface NotificationsPageProps {
    onNavigate?: (page: string) => void;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
    const { currentUser } = useAuth();
    const userId = currentUser ? ((currentUser as any)._id || currentUser.id) : undefined;

    const [notifications, setNotifications] = useState<BackendNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await notificationService.getNotifications(userId);
            setNotifications(data);
        } catch (err) {
            setError('Erreur lors du chargement des notifications');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [userId]);

    const handleAction = async (notification: BackendNotification) => {
        // Marquer comme lu automatiquement lors du clic d'action
        if (userId && !notification.read) {
            await handleMarkAsRead(notification.id);
        }

        if (!onNavigate) return;

        // Navigation basée sur le type de notification
        if (notification.type === 'message') {
            onNavigate('messages');
        } else if (notification.type === 'request') {
            onNavigate(notification.data?.status === 'pending' ? 'mentore-dashboard' : 'mentoree-dashboard');
        } else if (notification.type === 'session') {
            onNavigate(notification.data?.status === 'confirmed' ? 'mentore-dashboard' : 'mentoree-dashboard');
        }
    };

    const handleMarkAsRead = async (id: string) => {
        if (!userId) return;
        try {
            await notificationService.markAsRead(id, userId);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
        } catch (err) {
            console.error(err);
        }
    };

    const handleDismiss = (id: string) => {
        if (!userId) return;
        try {
            notificationService.dismissNotification(id, userId);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Notification effacée');
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!userId || notifications.length === 0) return;
        try {
            await notificationService.markAllAsRead(userId, notifications);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success('Toutes les notifications ont été marquées comme lues');
        } catch (err) {
            toast.error('Erreur lors du marquage des notifications');
            console.error(err);
        }
    };

    const handleClearAll = () => {
        if (!userId || notifications.length === 0) return;
        try {
            notificationService.clearAll(userId, notifications);
            setNotifications([]);
            toast.success('Centre de notifications vidé');
        } catch (err) {
            toast.error('Erreur lors de la suppression');
            console.error(err);
        }
    };

    const getActionLabel = (type: string) => {
        switch (type) {
            case 'message': return 'Voir le message';
            case 'request': return 'Gérer les demandes';
            case 'session': return 'Voir la séance';
            default: return 'En savoir plus';
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4">
                        <Bell className="w-8 h-8 text-purple-600 animate-swing" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Centre de Notifications
                    </h1>
                    <p className="text-lg text-gray-600">
                        Suivez l'activité de votre parcours de mentorat
                    </p>
                </div>

                {/* Barre d'actions */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-sm text-gray-500 font-medium">
                        {notifications.length > 0 ? (
                            <span>
                                {notifications.length} notification{notifications.length > 1 ? 's' : ''} 
                                {unreadCount > 0 && ` (${unreadCount} non lue${unreadCount > 1 ? 's' : ''})`}
                            </span>
                        ) : (
                            <span>Aucune notification</span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="flex items-center text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                            >
                                <CheckSquare className="w-4 h-4 mr-1.5" />
                                Tout marquer lu
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="flex items-center text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                            >
                                <Trash2 className="w-4 h-4 mr-1.5" />
                                Tout effacer
                            </button>
                        )}
                        <button
                            onClick={fetchNotifications}
                            className="flex items-center text-xs text-gray-600 hover:text-purple-600 hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
                            disabled={isLoading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                            Rafraîchir
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                            <p className="text-gray-500">Chargement de vos notifications...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button
                                onClick={fetchNotifications}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Réessayer
                            </button>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BellOff className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune notification</h3>
                            <p className="text-gray-500">Vous êtes à jour ! Les alertes importantes apparaîtront ici.</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <ProfessionalNotification
                                key={notification.id}
                                id={notification.id}
                                type={notification.type as NotificationType}
                                title={notification.title}
                                message={notification.message}
                                timestamp={notification.time || 'À l\'instant'}
                                read={notification.read}
                                actionLabel={getActionLabel(notification.type)}
                                onAction={() => handleAction(notification)}
                                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                                onDismiss={() => handleDismiss(notification.id)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
