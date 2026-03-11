const API_BASE_URL = 'http://localhost:5000/api';

class MentorshipApi {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      credentials: 'include' as RequestCredentials,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur réseau' }));
      throw new Error(error.message || `Erreur ${response.status}`);
    }

    return response.json();
  }

  // Créer une demande de mentorat
  async createRequest(mentoreId: string, message: string) {
    return this.request('/mentorship/request', {
      method: 'POST',
      body: JSON.stringify({ mentoreId, message }),
    });
  }

  // Obtenir les demandes reçues (pour les mentores)
  async getReceivedRequests() {
    return this.request('/mentorship/received');
  }

  // Obtenir les demandes envoyées (pour les mentorées)
  async getSentRequests() {
    return this.request('/mentorship/sent');
  }

  // Répondre à une demande
  async respondToRequest(requestId: string, status: 'accepted' | 'rejected', responseMessage?: string) {
    return this.request(`/mentorship/respond/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, responseMessage }),
    });
  }

  // Obtenir les mentorships actifs
  async getActiveMentorships() {
    return this.request('/mentorship/active');
  }

  // Obtenir les conversations de mentorat
  async getMentorshipConversations() {
    return this.request('/messages/mentorship-conversations');
  }

  // Envoyer un message
  async sendMessage(recipientId: string, content: string, file?: File) {
    const formData = new FormData();
    formData.append('recipient', recipientId);
    formData.append('content', content);
    
    if (file) {
      formData.append('file', file);
    }

    return this.request('/messages', {
      method: 'POST',
      headers: {}, // Laisser le navigateur définir le Content-Type pour FormData
      body: formData,
    });
  }

  // Obtenir les messages d'une conversation
  async getMessages(userId: string) {
    return this.request(`/messages/${userId}`);
  }

  // Obtenir la liste des mentores
  async getMentores() {
    return this.request('/users/mentores');
  }
}

export default new MentorshipApi();