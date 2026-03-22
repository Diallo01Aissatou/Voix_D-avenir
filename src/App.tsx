import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
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
import NotificationDemoPage from './components/Pages/NotificationDemoPage';
import VoixAvenirNotificationsDemo from './components/Pages/VoixAvenirNotificationsDemo';
import ContactPage from './components/Pages/ContactPage';
import HelpCenterPage from './components/Pages/HelpCenterPage';
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
      setCurrentPage('reset-password');
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

  // Redirection après connexion
  React.useEffect(() => {
    if (currentUser && (currentPage === 'login' || currentPage === 'register')) {
      if (currentUser.role === 'admin') {
        setCurrentPage('admin-dashboard');
      } else if (currentUser.role === 'mentore') {
        setCurrentPage('mentore-dashboard');
      } else {
        setCurrentPage('mentoree-dashboard');
      }
    }
  }, [currentUser, currentPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">V</span>
          </div>
          <p className="text-gray-600">Chargement de Voix D'avenir...</p>
        </div>
      </div>
    );
  }

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
      case 'notification-demo':
        return <NotificationDemoPage onNavigate={handleNavigate} />;
      case 'voix-avenir-notifications':
        return <VoixAvenirNotificationsDemo />;
      default:
        return <HomePage onNavigate={handleNavigate} />
    }
  };

  const isDashboardPage = ['mentoree-dashboard', 'mentore-dashboard', 'admin-dashboard'].includes(currentPage);
  const isAuthPage = ['login', 'forgot-password', 'reset-password'].includes(currentPage);
  const showHeader = !isAuthPage;
  const showFooter = !isDashboardPage && !isAuthPage;

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
    </AuthProvider>
  );
}

export default App;
