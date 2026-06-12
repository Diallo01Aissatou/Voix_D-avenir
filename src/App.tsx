import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import { Toaster } from 'react-hot-toast';
// Lazy loading des pages pour optimiser les performances (Code Splitting)
const HomePage = React.lazy(() => import('./components/Pages/HomePage'));
const AboutPage = React.lazy(() => import('./components/Pages/AboutPage'));
const LoginPage = React.lazy(() => import('./components/Pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./components/Pages/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./components/Pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./components/Pages/ResetPasswordPage'));
const MentoreeDashboard = React.lazy(() => import('./components/Dashboard/MentoreeDashboard'));
const MentoreDashboard = React.lazy(() => import('./components/Dashboard/MentoreDashboard'));
const AdminDashboard = React.lazy(() => import('./components/Dashboard/AdminDashboard'));
const ExpertsPage = React.lazy(() => import('./components/Pages/ExpertsPage'));
const ResourcesPage = React.lazy(() => import('./components/Pages/ResourcesPage'));
const FAQPage = React.lazy(() => import('./components/Pages/FAQPage'));
const ApplicationForm = React.lazy(() => import('./components/Pages/Candidature'));
const Rencontres = React.lazy(() => import('./components/Pages/Rencontres'));
const NotificationsPage = React.lazy(() => import('./components/Pages/NotificationsPage'));
const VoixAvenirNotificationsDemo = React.lazy(() => import('./components/Pages/VoixAvenirNotificationsDemo'));
const ContactPage = React.lazy(() => import('./components/Pages/ContactPage'));
const HelpCenterPage = React.lazy(() => import('./components/Pages/HelpCenterPage'));
const PrivacyPolicy = React.lazy(() => import('./components/Pages/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./components/Pages/TermsOfService'));
const IntelligentChatbot = React.lazy(() => import('./components/Chatbot/IntelligentChatbot'));


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
        <React.Suspense fallback={
          <div className="flex h-[50vh] items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        }>
          {renderPage()}
        </React.Suspense>
      </main>

      {showFooter && <Footer onNavigate={handleNavigate} />}
      
      <React.Suspense fallback={null}>
        <IntelligentChatbot />
      </React.Suspense>
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
