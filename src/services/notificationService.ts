import Api from '../data/Api';

export interface BackendNotification {
    id: string;
    type: string;
    title: string;
    message: string;
    time?: string;
    data?: {
        messageId?: string;
        sessionId?: string;
        requestId?: string;
        status?: string;
    };
}

class NotificationService {
    async getNotifications(): Promise<BackendNotification[]> {
        try {
            const response = await Api.get('/mentorship/notifications');
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    // Future methods can be added here (e.g., mark as read)
}

export const notificationService = new NotificationService();
export default notificationService;
