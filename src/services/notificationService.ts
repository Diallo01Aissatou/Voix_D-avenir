import Api from '../data/Api';

export interface BackendNotification {
    id: string;
    type: string;
    title: string;
    message: string;
    time?: string;
    createdAt?: string;
    read: boolean;
    data?: {
        messageId?: string;
        sessionId?: string;
        requestId?: string;
        status?: string;
    };
}

class NotificationService {
    async getNotifications(userId?: string): Promise<BackendNotification[]> {
        try {
            // 1. Charger les notifications des deux sources en parallèle
            const [sessionsRes, mentorshipRes] = await Promise.all([
                Api.get('/sessions/notifications').catch(() => ({ data: [] })),
                Api.get('/mentorship/notifications').catch(() => ({ data: [] }))
            ]);

            const localReadDb = userId ? JSON.parse(localStorage.getItem(`read_notifs_${userId}`) || '{}') : {};
            const localDeletedDb = userId ? JSON.parse(localStorage.getItem(`deleted_notifs_${userId}`) || '{}') : {};

            let allNotifications: BackendNotification[] = [];

            // 2. Traiter les notifications de séances (base de données)
            if (sessionsRes.data && Array.isArray(sessionsRes.data)) {
                sessionsRes.data.forEach((notif: any) => {
                    const id = notif._id;
                    // Ignorer si supprimée localement
                    if (localDeletedDb[id]) return;

                    allNotifications.push({
                        id,
                        type: notif.type || 'session',
                        title: notif.title || 'Séance de mentorat',
                        message: notif.message,
                        time: notif.createdAt,
                        createdAt: notif.createdAt,
                        read: notif.read || !!localReadDb[id],
                        data: notif
                    });
                });
            }

            // 3. Traiter les notifications de mentorat (dynamiques)
            if (mentorshipRes.data && Array.isArray(mentorshipRes.data)) {
                mentorshipRes.data.forEach((notif: any) => {
                    const id = notif.id || `notif-${notif.data?.requestId || Math.random()}`;
                    // Ignorer si supprimée localement
                    if (localDeletedDb[id]) return;

                    allNotifications.push({
                        id,
                        type: notif.type,
                        title: notif.title,
                        message: notif.message,
                        time: notif.time,
                        createdAt: notif.createdAt,
                        read: !!localReadDb[id],
                        data: notif.data
                    });
                });
            }

            // 4. Trier par date (plus récent en premier)
            allNotifications.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.time || 0).getTime();
                const dateB = new Date(b.createdAt || b.time || 0).getTime();
                return dateB - dateA;
            });

            return allNotifications;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    async markAsRead(id: string, userId: string): Promise<void> {
        // Enregistrer localement
        const localReadDb = JSON.parse(localStorage.getItem(`read_notifs_${userId}`) || '{}');
        localReadDb[id] = true;
        localStorage.setItem(`read_notifs_${userId}`, JSON.stringify(localReadDb));

        // Si c'est une notification en base de données (ne commence pas par message_, request_, new_requests), appeler l'API
        const isDynamic = id.startsWith('message_') || id.startsWith('request_') || id === 'new_requests';
        if (!isDynamic) {
            try {
                await Api.put(`/sessions/notifications/${id}/read`);
            } catch (error) {
                console.error('Error marking notification read on server:', error);
            }
        }
    }

    async markAllAsRead(userId: string, notifications: BackendNotification[]): Promise<void> {
        // Enregistrer localement
        const localReadDb = JSON.parse(localStorage.getItem(`read_notifs_${userId}`) || '{}');
        notifications.forEach(notif => {
            localReadDb[notif.id] = true;
        });
        localStorage.setItem(`read_notifs_${userId}`, JSON.stringify(localReadDb));

        // Appeler l'API pour marquer toutes les notifications en BD comme lues
        try {
            await Api.put('/sessions/notifications/read-all');
        } catch (error) {
            console.error('Error marking all notifications read on server:', error);
        }
    }

    dismissNotification(id: string, userId: string): void {
        const localDeletedDb = JSON.parse(localStorage.getItem(`deleted_notifs_${userId}`) || '{}');
        localDeletedDb[id] = true;
        localStorage.setItem(`deleted_notifs_${userId}`, JSON.stringify(localDeletedDb));
    }

    clearAll(userId: string, notifications: BackendNotification[]): void {
        const localDeletedDb = JSON.parse(localStorage.getItem(`deleted_notifs_${userId}`) || '{}');
        notifications.forEach(notif => {
            localDeletedDb[notif.id] = true;
        });
        localStorage.setItem(`deleted_notifs_${userId}`, JSON.stringify(localDeletedDb));
    }
}

export const notificationService = new NotificationService();
export default notificationService;
