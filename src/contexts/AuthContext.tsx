import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import Api from '../data/Api';
import { mockUsers } from '../data/mockData';
import { UserServices } from '../data/User';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password: string, role: string) => boolean;
  register: (userData: Partial<User>) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Récupérer l'utilisateur connecté depuis localStorage
    const loadUser = () => {
      const savedUser = localStorage.getItem('mentora_user');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (error) {
          localStorage.removeItem('mentora_user');
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };

    loadUser();
    setIsLoading(false);

    // Écouter les changements de localStorage
    window.addEventListener('storage', loadUser);

    return () => {
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  const login = (email: string, password: string, role: string): boolean => {
    // Simulation de l'authentification
    if (password === 'password') {
      let user: User | undefined;

      if (role === 'admin' && email === 'admin@mentora.gn') {
        user = {
          id: 'admin',
          name: 'Administrateur',
          email: 'admin@mentora.gn',
          role: 'admin'
        };
      } else {
        user = mockUsers.find(u => u.email === email && u.role === role);
      }

      if (user) {
        setCurrentUser(user);
        localStorage.setItem('mentora_user', JSON.stringify(user));
        return true;
      }
    }
    return false;
  };

  const register = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const response = await UserServices.aregistre(userData); // appel backend
      const newUser = response; // à adapter selon ton backend (un seul user ou tableau)

      setCurrentUser(newUser);
      localStorage.setItem("mentora_user", JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error("Erreur d'inscription :", error);
      return false;
    }
  };


  const logout = async () => {
    try {
      await Api.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setCurrentUser(null);
      localStorage.removeItem('mentora_user');
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      login,
      register,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};