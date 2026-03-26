import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { UserServices } from '../data/User';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  register: (userData: Partial<User> | FormData) => Promise<boolean>;
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
    const loadUser = async () => {
      // 1. Essayer de charger depuis localStorage pour un affichage immédiat
      const savedUser = localStorage.getItem('mentora_user');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (error) {
          localStorage.removeItem('mentora_user');
        }
      }

      // 2. Vérifier la session réelle auprès du serveur (important pour social login)
      try {
        const data = await UserServices.getMe();
        if (data && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('mentora_user', JSON.stringify(data.user));
        }
      } catch (error) {
        // Si 401 ou erreur, l'utilisateur n'est pas connecté ou session expirée
        if (savedUser) {
           setCurrentUser(null);
           localStorage.removeItem('mentora_user');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Écouter les changements de localStorage
    window.addEventListener('storage', loadUser);

    return () => {
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const data = await UserServices.login({ email, password, role });

      if (data && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('mentora_user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User> | FormData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const newUser = await UserServices.aregistre(userData);

      if (newUser && newUser.id) {
        setCurrentUser(newUser);
        localStorage.setItem("mentora_user", JSON.stringify(newUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erreur d'inscription :", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await UserServices.logout();
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
