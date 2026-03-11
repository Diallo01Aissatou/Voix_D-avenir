import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const MessageTest: React.FC = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [testMessage, setTestMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    loadUsers();
    loadConversations();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/messages/users/available', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/messages/conversations', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    }
  };

  const sendTestMessage = async () => {
    if (!testMessage.trim() || !selectedUser) return;

    try {
      const response = await fetch('http://localhost:5001/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          recipient: selectedUser,
          content: testMessage
        })
      });

      if (response.ok) {
        setTestMessage('');
        loadConversations();
        alert('Message envoyé avec succès !');
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      alert('Erreur lors de l\'envoi du message');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test de Messagerie</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Envoyer un message */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Envoyer un message</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Destinataire:</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Sélectionner un utilisateur</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Message:</label>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              rows={3}
              placeholder="Tapez votre message..."
            />
          </div>

          <button
            onClick={sendTestMessage}
            disabled={!testMessage.trim() || !selectedUser}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Envoyer
          </button>
        </div>

        {/* Conversations */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Mes Conversations</h2>
          
          {conversations.length === 0 ? (
            <p className="text-gray-500">Aucune conversation</p>
          ) : (
            <div className="space-y-2">
              {conversations.map(conv => (
                <div key={conv._id} className="p-3 border border-gray-200 rounded">
                  <div className="font-medium">{conv.user.name}</div>
                  <div className="text-sm text-gray-600">
                    {conv.lastMessage?.content || 'Nouvelle conversation'}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {conv.unreadCount} non lu(s)
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Informations utilisateur */}
      <div className="mt-6 bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Utilisateur connecté:</h3>
        <p>Nom: {currentUser?.name}</p>
        <p>ID: {currentUser?._id || currentUser?.id}</p>
        <p>Rôle: {currentUser?.role}</p>
      </div>
    </div>
  );
};

export default MessageTest;