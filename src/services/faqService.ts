import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://voix-avenir-backend.onrender.com/api';

export interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

export interface GroupedFAQs {
    [category: string]: FAQItem[];
}

class FAQService {
    async getFAQs(): Promise<GroupedFAQs> {
        try {
            const response = await axios.get(`${API_URL}/faq`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            return {};
        }
    }
}

export const faqService = new FAQService();
export default faqService;
