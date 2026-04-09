import React, { useEffect } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationSystem from '../Dashboard/NotificationSystem';



interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen, currentPage, onNavigate }) => {
  const { currentUser, logout } = useAuth();
  useEffect(() => {
    // loadUserProfile();
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    onNavigate('home');
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-0">
        <div className="flex items-center justify-between py-2 lg:py-1">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity lg:flex-1"
            onClick={() => onNavigate('home')}
          >
            <div className="flex items-center justify-center w-full lg:justify-start">
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Voix D'avenir Logo"
                className="h-10 sm:h-12 md:h-14 w-auto bg-transparent object-contain"
              />
            </div>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-4 xl:space-x-6">
            <button
              onClick={() => onNavigate('home')}
              className={`text-gray-700 hover:text-purple-600 transition-colors font-medium border-b-2 transition-all ${currentPage === 'home' ? 'text-purple-600 border-purple-600 pb-1' : 'border-transparent pb-1'
                }`}
            >
              Accueil
            </button>
            <button
              onClick={() => onNavigate('experts')}
              className={`text-gray-700 hover:text-purple-600 transition-colors font-medium border-b-2 transition-all ${currentPage === 'experts' ? 'text-purple-600 border-purple-600 pb-1' : 'border-transparent pb-1'
                }`}
            >
              Femmes Expertes
            </button>
            <button
              onClick={() => onNavigate('resources')}
              className={`text-gray-700 hover:text-purple-600 transition-colors font-medium border-b-2 transition-all ${currentPage === 'resources' ? 'text-purple-600 border-purple-600 pb-1' : 'border-transparent pb-1'
                }`}
            >
              Ressources
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`text-gray-700 hover:text-purple-600 transition-colors font-medium border-b-2 transition-all ${currentPage === 'about' ? 'text-purple-600 border-purple-600 pb-1' : 'border-transparent pb-1'
                }`}
            >
              À Propos
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className={`text-gray-700 hover:text-purple-600 transition-colors font-medium border-b-2 transition-all ${currentPage === 'contact' ? 'text-purple-600 border-purple-600 pb-1' : 'border-transparent pb-1'
                }`}
            >
              Contact
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 sm:space-x-4 lg:flex-1">
            {currentUser ? (
              <>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <NotificationSystem
                    userId={(currentUser as any)?._id || currentUser?.id}
                    userRole={currentUser?.role}
                    onNotificationClick={(notification) => {
                      if (notification.type === 'request' || notification.type === 'session' || notification.type === 'message') {
                        onNavigate(currentUser.role === 'mentore' ? 'mentore-dashboard' : 'mentoree-dashboard');
                      }
                    }}
                    onViewAll={() => onNavigate('notifications')}
                  />
                  <button
                    onClick={() => {
                      const dashboardPage = currentUser.role === 'admin' ? 'admin-dashboard' :
                        currentUser.role === 'mentore' ? 'mentore-dashboard' : 'mentoree-dashboard';
                      onNavigate(dashboardPage);
                    }}
                    className="hidden sm:flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-colors font-medium text-sm sm:text-base"
                  >
                    <span>Dashboard</span>
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm sm:text-base"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
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
              className="p-2 text-gray-600 hover:text-purple-600 transition-colors rounded-lg hover:bg-gray-100 md:hidden"
              aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
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
