import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(userId: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io('https://voix-avenir-backend.onrender.com', {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connecté au serveur Socket.IO');
      this.socket?.emit('joinRoom', { room: `user_${userId}`, userId });
    });

    this.socket.on('disconnect', () => {
      console.log('Déconnecté du serveur Socket.IO');
    });

    // Écouter les événements de mentorat
    this.socket.on('newMentorshipRequest', (data) => {
      this.emit('newMentorshipRequest', data);
    });

    this.socket.on('mentorshipResponse', (data) => {
      this.emit('mentorshipResponse', data);
    });

    this.socket.on('receiveMessage', (data) => {
      this.emit('receiveMessage', data);
    });

    this.socket.on('newMessage', (data) => {
      this.emit('newMessage', data);
    });

    this.socket.on('messageError', (data) => {
      this.emit('messageError', data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinMentorshipRoom(mentorshipId: string, userId: string): void {
    if (this.socket) {
      this.socket.emit('joinMentorship', { mentorshipId, userId });
    }
  }

  sendMessage(data: {
    room: string;
    message: { content: string };
    from: string;
    to: string;
    mentorshipId?: string;
  }): void {
    if (this.socket) {
      this.socket.emit('sendMessage', data);
    }
  }

  markMessagesAsRead(messageIds: string[], userId: string): void {
    if (this.socket) {
      this.socket.emit('markAsRead', { messageIds, userId });
    }
  }

  notifyMentorshipRequest(mentoreId: string, requestData: any): void {
    if (this.socket) {
      this.socket.emit('mentorshipRequest', { mentoreId, requestData });
    }
  }

  notifyMentorshipResponse(mentoreeId: string, responseData: any): void {
    if (this.socket) {
      this.socket.emit('mentorshipResponse', { mentoreeId, responseData });
    }
  }

  // Système d'événements personnalisé
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new SocketService();


