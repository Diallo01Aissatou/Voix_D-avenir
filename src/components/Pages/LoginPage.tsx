import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Api from '../../data/Api';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'mentoree'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await Api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.user) {
        localStorage.setItem('mentora_user', JSON.stringify(response.data.user));

        // Déclencher un événement pour mettre à jour le contexte
        window.dispatchEvent(new Event('storage'));

        // Redirection basée sur le rôle de l'utilisateur
        const userRole = response.data.user.role;
        if (userRole === 'admin') {
          onNavigate('admin-dashboard');
        } else if (userRole === 'mentore') {
          onNavigate('mentore-dashboard');
        } else {
          onNavigate('mentoree-dashboard');
        }
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Email ou mot de passe incorrect';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const createAdmin = async () => {
    try {
      const timestamp = Date.now();
      await Api.post('/auth/create-admin', {
        name: 'Administrateur',
        email: `admin${timestamp}@voixdavenir.gn`,
        password: 'admin123'
      });
      alert(`Admin créé avec succès !\nEmail: admin${timestamp}@voixdavenir.gn\nMot de passe: admin123`);
    } catch (error) {
      alert('Erreur: ' + (error?.response?.data?.message || 'Erreur de création'));
    }
  };

  // Comptes de démonstration
  // const demoAccounts = [
  //   { email: 'aminata@email.com', role: 'mentoree', name: 'Aminata (Mentorée)' },
  //   { email: 'fatoumata@email.com', role: 'mentore', name: 'Dr. Fatoumata (Mentore)' },
  //   { email: 'admin@mentora.gn', role: 'admin', name: 'Administrateur' }
  // ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="Voix D'avenir Logo" className="h-16 w-auto" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Connexion</h1>
            <p className="text-gray-600">Accédez à votre espace personnel</p>
          </div>

          {/* Comptes de démonstration */}
          {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-3">Comptes de démonstration</h3>
            <div className="space-y-2">
              {demoAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setFormData({
                      email: account.email,
                      password: 'password',
                      role: account.role
                    });
                  }}
                  className="w-full text-left p-2 rounded bg-white hover:bg-blue-50 transition-colors text-sm"
                >
                  <div className="font-medium text-blue-800">{account.name}</div>
                  <div className="text-blue-600">{account.email}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Mot de passe pour tous les comptes : <code className="bg-white px-1 rounded">password</code>
            </p>
          </div> */}

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Type de compte
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="mentoree">Mentorée</option>
                  <option value="mentore">Mentore</option>
                  <option value="admin" style={{ display: 'none' }}>Administrateur</option>
                </select>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connexion...</span>
                  </div>
                ) : (
                  'Se connecter'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="text-purple-600 hover:text-purple-800 font-medium"
                >
                  Pas encore de compte ? S'inscrire
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
