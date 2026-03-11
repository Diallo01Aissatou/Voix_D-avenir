import React, { useState, useEffect } from 'react';
import ProfessionalNotification, { NotificationType } from '../UI/ProfessionalNotification';
import { Bell, Loader2, RefreshCw } from 'lucide-react';
import { notificationService, BackendNotification } from '../../services/notificationService';
import { formatRelativeTime } from '../../services/voixAvenirNotifications';

interface NotificationPageProps {
    onNavigate?: (page: string) => void;
}

const NotificationDemoPage: React.FC<NotificationPageProps> = ({ onNavigate }) => {
    const [notifications, setNotifications] = useState<BackendNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await notificationService.getNotifications();
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
    }, []);

    const handleAction = (notification: BackendNotification) => {
        console.log(`Action clicked for ${notification.id}`, notification.data);

        if (!onNavigate) return;

        // Navigation basée sur le type de notification
        if (notification.type === 'message' && notification.data?.messageId) {
            onNavigate('messages');
        } else if (notification.type === 'request') {
            onNavigate(notification.data?.status === 'pending' ? 'mentore-dashboard' : 'mentoree-dashboard');
        } else if (notification.type === 'session') {
            onNavigate('mentoree-dashboard'); // Ou une page dédiée aux sessions si elle existe
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

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <div className="text-center flex-1">
                        <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4">
                            <Bell className="w-8 h-8 text-purple-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Centre de Notifications
                        </h1>
                        <p className="text-lg text-gray-600">
                            Restez connectée avec votre parcours de mentorat
                        </p>
                    </div>
                </div>

                <div className="flex justify-end mb-6">
                    <button
                        onClick={fetchNotifications}
                        className="flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Rafraîchir
                    </button>
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
                        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune notification</h3>
                            <p className="text-gray-500">Vous êtes à jour ! De nouvelles notifications apparaîtront ici.</p>
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
                                actionLabel={getActionLabel(notification.type)}
                                onAction={() => handleAction(notification)}
                            />
                        ))
                    )}
                </div>

                <div className="mt-12 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Guide de style des notifications
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                        <div>
                            <h3 className="font-medium text-purple-700 mb-2">Couleurs & Signification</h3>
                            <ul className="space-y-2">
                                <li className="flex items-center">
                                    <span className="w-3 h-3 bg-purple-100 border border-purple-200 rounded-full mr-2"></span>
                                    Violet : Messages et communications
                                </li>
                                <li className="flex items-center">
                                    <span className="w-3 h-3 bg-pink-100 border border-pink-200 rounded-full mr-2"></span>
                                    Rose : Séances et rappels
                                </li>
                                <li className="flex items-center">
                                    <span className="w-3 h-3 bg-indigo-100 border border-indigo-200 rounded-full mr-2"></span>
                                    Indigo : Ressources éducatives
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-purple-700 mb-2">Bonnes pratiques</h3>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Titres courts et impactants</li>
                                <li>Messages bienveillants et motivants</li>
                                <li>Appels à l'action clairs</li>
                                <li>Indicateurs visuels de statut (lu/non lu)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationDemoPage;
