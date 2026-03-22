import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://voix-avenir-backend.onrender.com/api';

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
            const response = await axios.get(`${API_URL}/mentorship/notifications`, {
                withCredentials: true
            });
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
