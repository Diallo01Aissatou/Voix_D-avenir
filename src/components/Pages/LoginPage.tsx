import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(formData.email, formData.password, formData.role);

      if (success) {
        const savedUser = localStorage.getItem('mentora_user');
        const user = savedUser ? JSON.parse(savedUser) : null;

        if (user) {
          if (user.role === 'admin') {
            onNavigate('admin-dashboard');
          } else if (user.role === 'mentore') {
            onNavigate('mentore-dashboard');
          } else {
            onNavigate('mentoree-dashboard');
          }
        }
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch (err: any) {
      setError('Une erreur est survenue lors de la connexion');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Voix D'avenir Logo" className="h-16 w-auto" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Connexion</h1>
            <p className="text-gray-600">Accédez à votre espace personnel</p>
          </div>

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

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 uppercase">Ou se connecter avec</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <a
                  href="https://voix-avenir-backend.onrender.com/api/auth/google"
                  className="flex items-center justify-center space-x-2 py-3 border-2 border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  <span className="font-semibold text-gray-700">Google</span>
                </a>
                
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="https://voix-avenir-backend.onrender.com/api/auth/facebook"
                    className="flex items-center justify-center space-x-2 py-3 border-2 border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <img src="https://www.facebook.com/images/fb_icon_325x325.png" alt="Facebook" className="w-5 h-5" />
                    <span className="font-semibold text-gray-700">Facebook</span>
                  </a>
                  
                  <a
                    href="https://voix-avenir-backend.onrender.com/api/auth/linkedin"
                    className="flex items-center justify-center space-x-2 py-3 border-2 border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <img src="https://content.linkedin.com/content/dam/me/business/en-us/amp/brand-site/v2/bg/LI-Bug.svg.original.svg" alt="LinkedIn" className="w-5 h-5" />
                    <span className="font-semibold text-gray-700">LinkedIn</span>
                  </a>
                </div>
              </div>

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
