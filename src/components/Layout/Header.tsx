import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationSystem from '../Dashboard/NotificationSystem';
import Api, { BASE_URL } from '../../data/Api';

// Fonction utilitaire pour corriger les URLs des photos
const getPhotoUrl = (photo: string | undefined) => {
  if (!photo) return null;
  if (photo.startsWith('http')) return photo;
  return `${BASE_URL}${photo.startsWith('/') ? photo : '/' + photo}`;
};

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen, currentPage, onNavigate }) => {
  const { currentUser, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const loadUserProfile = async () => {
    if (!currentUser) return;
    try {
      const response = await Api.get('/users/profile');
      if (response.data) {
        setUserProfile(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement profil header:', error);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    onNavigate('home');
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-0">
        <div className="flex items-center justify-between py-4 lg:py-1">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onNavigate('home')}
          >
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Voix D'avenir Logo"
              className="h-10 w-auto"
            />
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-4 xl:space-x-6">
            <button
              onClick={() => onNavigate('home')}
              className={`text-gray-700 hover:text-purple-600 transition-colors font-medium ${currentPage === 'home' ? 'text-purple-600 border-b-2 border-purple-600 pb-1' : ''
                }`}
            >
              Accueil
            </button>
            <button
              onClick={() => onNavigate('experts')}
              className={`text-gray-700 hover:text-purple-600 transition-colors font-medium ${currentPage === 'experts' ? 'text-purple-600 border-b-2 border-purple-600 pb-1' : ''
                }`}
            >
              Femmes Expertes
            </button>
            <button
              onClick={() => onNavigate('resources')}
              className={`text-gray-700 hover:text-purple-600 transition-colors font-medium ${currentPage === 'resources' ? 'text-purple-600 border-b-2 border-purple-600 pb-1' : ''
                }`}
            >
              Ressources
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`text-gray-700 hover:text-purple-600 transition-colors font-medium ${currentPage === 'about' ? 'text-purple-600 border-b-2 border-purple-600 pb-1' : ''
                }`}
            >
              À Propos
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className={`text-gray-700 hover:text-purple-600 transition-colors font-medium ${currentPage === 'contact' ? 'text-purple-600 border-b-2 border-purple-600 pb-1' : ''
                }`}
            >
              Contact
            </button>
            {/* <button
              onClick={() => onNavigate('events')}
              className={`text-gray-700 hover:text-purple-600 transition-colors font-medium ${
                currentPage === 'events' ? 'text-purple-600 border-b-2 border-purple-600 pb-1' : ''
              }`}
            >
              Événements
            </button>
            <button
              onClick={() => onNavigate('opportunities')}
              className={`text-gray-700 hover:text-purple-600 transition-colors font-medium ${
                currentPage === 'opportunities' ? 'text-purple-600 border-b-2 border-purple-600 pb-1' : ''
              }`}
            >
              Opportunités 
            </button> */}


            {/* <button onClick={() => onNavigate('rencontre')}
               className={`text-gray-700 hover:text-purple-600 transition-colors font-medium ${
                currentPage === 'rencontre' ? 'text-purple-600 border-b-2 border-purple-600 pb-1' : ''
              }`}> 
              Rendez-vous</button> */}


          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <div className="hidden md:flex items-center space-x-3">
                  <NotificationSystem
                    userId={(currentUser as any)?._id || currentUser?.id}
                    userRole={currentUser?.role}
                    onNotificationClick={(notification) => {
                      if (notification.type === 'request') {
                        onNavigate(currentUser.role === 'mentore' ? 'mentore-dashboard' : 'mentoree-dashboard');
                      } else if (notification.type === 'session') {
                        onNavigate(currentUser.role === 'mentore' ? 'mentore-dashboard' : 'mentoree-dashboard');
                      } else if (notification.type === 'message') {
                        onNavigate(currentUser.role === 'mentore' ? 'mentore-dashboard' : 'mentoree-dashboard');
                      }
                    }}
                    onViewAll={() => onNavigate('notification-demo')}
                  />
                  {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      const dashboardPage = currentUser.role === 'admin' ? 'admin-dashboard' :
                        currentUser.role === 'mentore' ? 'mentore-dashboard' : 'mentoree-dashboard';
                      onNavigate(dashboardPage);
                    }}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {getPhotoUrl(userProfile?.photo) ? (
                        <img
                          src={getPhotoUrl(userProfile.photo)!}
                          alt={userProfile.name || currentUser.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            console.log('Erreur photo header desktop:', userProfile?.photo);
                            e.currentTarget.style.display = 'none';
                          }}
                          onLoad={() => console.log('Photo header desktop chargée:', getPhotoUrl(userProfile?.photo))}
                        />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-800">{currentUser.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                    </div>
                  </button>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors font-medium"
                >
                  Se connecter
                </button>
              </div>
            )}

            {/* Menu mobile */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-3 mt-4">
              <button
                onClick={() => {
                  onNavigate('home');
                  onMenuToggle();
                }}
                className="text-left px-2 py-2 text-gray-700 hover:text-purple-600 transition-colors"
              >
                Accueil
              </button>
              <button
                onClick={() => {
                  onNavigate('experts');
                  onMenuToggle();
                }}
                className="text-left px-2 py-2 text-gray-700 hover:text-purple-600 transition-colors"
              >
                Femmes Expertes
              </button>
              <button
                onClick={() => {
                  onNavigate('resources');
                  onMenuToggle();
                }}
                className="text-left px-2 py-2 text-gray-700 hover:text-purple-600 transition-colors"
              >
                Ressources
              </button>
              <button
                onClick={() => {
                  onNavigate('about');
                  onMenuToggle();
                }}
                className="text-left px-2 py-2 text-gray-700 hover:text-purple-600 transition-colors"
              >
                À Propos
              </button>
              <button
                onClick={() => {
                  onNavigate('contact');
                  onMenuToggle();
                }}
                className="text-left px-2 py-2 text-gray-700 hover:text-purple-600 transition-colors"
              >
                Contact
              </button>
              <button
                onClick={() => {
                  onNavigate('events');
                  onMenuToggle();
                }}
                className="text-left px-2 py-2 text-gray-700 hover:text-purple-600 transition-colors"
              >
                Événements
              </button>
              <button
                onClick={() => {
                  onNavigate('opportunities');
                  onMenuToggle();
                }}
                className="text-left px-2 py-2 text-gray-700 hover:text-purple-600 transition-colors"
              >
                Opportunités
              </button>

              {currentUser ? (
                <>
                  <button
                    onClick={() => {
                      const dashboardPage = currentUser.role === 'admin' ? 'admin-dashboard' :
                        currentUser.role === 'mentore' ? 'mentore-dashboard' : 'mentoree-dashboard';
                      onNavigate(dashboardPage);
                      onMenuToggle();
                    }}
                    className="text-left px-2 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors font-medium"
                  >
                    Mon Dashboard
                  </button>
                  {currentUser.role === 'admin' && (
                  <div className="flex items-center space-x-3 px-2 py-2 border-t border-gray-200 mt-3 pt-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {getPhotoUrl(userProfile?.photo) ? (
                        <img
                          src={getPhotoUrl(userProfile.photo)!}
                          alt={userProfile.name || currentUser.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            console.log('Erreur photo header mobile:', userProfile?.photo);
                            e.currentTarget.style.display = 'none';
                          }}
                          onLoad={() => console.log('Photo header mobile chargée:', getPhotoUrl(userProfile?.photo))}
                        />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{currentUser.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                    </div>
                  </div>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      onMenuToggle();
                    }}
                    className="text-left px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  {/* <button
                    onClick={() => {
                      onNavigate('login');
                      onMenuToggle();
                    }}
                    className="text-left px-2 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    Se connecter
                  </button> */}

                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
