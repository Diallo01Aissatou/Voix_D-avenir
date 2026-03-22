const API_URL = 'https://voix-avenir-backend.onrender.com/api/questions';

export interface UserQuestionData {
    question: string;
    category?: string;
    userName?: string;
    userEmail?: string;
}

export const questionService = {
    submitQuestion: async (data: UserQuestionData) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de la soumission');
        }

        return response.json();
    },

    getAllQuestions: async () => {
        const response = await fetch(API_URL, {
            headers: {
                ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des questions');
        }

        return response.json();
    }
};
