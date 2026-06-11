import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import { Toaster } from 'react-hot-toast';
import HomePage from './components/Pages/HomePage';
import AboutPage from './components/Pages/AboutPage';
import LoginPage from './components/Pages/LoginPage';
import RegisterPage from './components/Pages/RegisterPage';
import ForgotPasswordPage from './components/Pages/ForgotPasswordPage';
import ResetPasswordPage from './components/Pages/ResetPasswordPage';
import MentoreeDashboard from './components/Dashboard/MentoreeDashboard';
import MentoreDashboard from './components/Dashboard/MentoreDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import ExpertsPage from './components/Pages/ExpertsPage';
import ResourcesPage from './components/Pages/ResourcesPage';
// import EventsPage from './components/Pages/EventsPage';
// import OpportunitiesPage from './components/Pages/OpportunitiesPage';
import FAQPage from './components/Pages/FAQPage';
import ApplicationForm from './components/Pages/Candidature';
import Rencontres from './components/Pages/Rencontres';
import NotificationsPage from './components/Pages/NotificationsPage';
import VoixAvenirNotificationsDemo from './components/Pages/VoixAvenirNotificationsDemo';
import ContactPage from './components/Pages/ContactPage';
import HelpCenterPage from './components/Pages/HelpCenterPage';
import PrivacyPolicy from './components/Pages/PrivacyPolicy';
import TermsOfService from './components/Pages/TermsOfService';
import IntelligentChatbot from './components/Chatbot/IntelligentChatbot';


function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, isLoading } = useAuth();

  // Détecter les paramètres URL pour la réinitialisation de mot de passe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    const token = urlParams.get('token');

    if (page === 'reset-password' && token) {
      // Sauvegarder le token en localStorage par sécurité pour éviter les pertes lors des redirections
      localStorage.setItem('resetPasswordToken', token);
      setCurrentPage('reset-password');
    } else if (page === 'privacy-policy') {
      setCurrentPage('privacy-policy');
    } else if (page === 'terms-of-service') {
      setCurrentPage('terms-of-service');
    }
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };




  // L'écran de chargement global a été supprimé pour éviter tout conflit avec la page de connexion
  // et assurer que les messages d'erreur soient toujours visibles.
  const isAuthPage = ['login', 'register', 'forgot-password', 'reset-password'].includes(currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={handleNavigate} />;
      case 'reset-password':
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token') || undefined;
        return <ResetPasswordPage onNavigate={handleNavigate} token={token} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'application':
        return <ApplicationForm onNavigate={handleNavigate} />;
      case 'rencontre':
        return <Rencontres onNavigate={handleNavigate} />;
      case 'mentoree-dashboard':
        return <MentoreeDashboard onNavigate={handleNavigate} />;
      case 'mentore-dashboard':
        return <MentoreDashboard onNavigate={handleNavigate} />;
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'experts':
        return <ExpertsPage onNavigate={handleNavigate} />;
      case 'resources':
        return <ResourcesPage onNavigate={handleNavigate} />;
      // case 'events':
      //   return <EventsPage onNavigate={handleNavigate} />;
      // case 'opportunities':
      //   return <OpportunitiesPage onNavigate={handleNavigate} />;
      case 'faq':
        return <FAQPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage onNavigate={handleNavigate} />;
      case 'help-center':
        return <HelpCenterPage onNavigate={handleNavigate} />;
      case 'privacy-policy':
        return <PrivacyPolicy onNavigate={handleNavigate} />;
      case 'terms-of-service':
        return <TermsOfService onNavigate={handleNavigate} />;
      case 'notifications':
        return <NotificationsPage onNavigate={handleNavigate} />;
      case 'voix-avenir-notifications':
        return <VoixAvenirNotificationsDemo />;
      default:
        return <HomePage onNavigate={handleNavigate} />
    }
  };

  const isDashboardPage = ['mentoree-dashboard', 'mentore-dashboard', 'admin-dashboard'].includes(currentPage);
  const showHeader = !['login', 'forgot-password', 'reset-password'].includes(currentPage);
  const showFooter = !isDashboardPage && !['login', 'forgot-password', 'reset-password'].includes(currentPage);

  return (
    <div className={`min-h-screen ${isAuthPage ? '' : 'bg-gray-50'}`}>
      {showHeader && (
        <Header
          onMenuToggle={handleMenuToggle}
          isMenuOpen={isMenuOpen}
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />
      )}

      <main className={showHeader ? "pt-0" : ""}>
        {renderPage()}
      </main>

      {showFooter && <Footer onNavigate={handleNavigate} />}
      <IntelligentChatbot />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
