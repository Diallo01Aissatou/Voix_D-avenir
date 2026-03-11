// Store global pour les messages
let globalMessages = [];

export const chatStore = {
  // Ajouter un message
  addMessage: (message) => {
    globalMessages.push(message);
    console.log('Message ajouté au store:', message);
    console.log('Total messages dans store:', globalMessages.length);
  },

  // Récupérer tous les messages
  getAllMessages: () => {
    console.log('Récupération de tous les messages:', globalMessages);
    return [...globalMessages];
  },

  // Vider les messages
  clearMessages: () => {
    globalMessages = [];
  }
};