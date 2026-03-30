import React from 'react';
import { Heart, Mail, MapPin, Phone } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Voix d'Avenir Logo"
                className="h-16 w-auto object-contain bg-transparent mix-blend-multiply"
              />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Plateforme de mentorat pour connecter les jeunes filles guinéennes
              à des femmes expertes et inspirantes. En route avec Voix D'avenir.
            </p>
            <div className="flex space-x-4">
              <a href="mailto:aissatoudiallo.nene29@gmail.com" className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              <a href="https://wa.me/224622949868" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-700 transition-colors">
                <Phone className="w-4 h-4" />
              </a>
              <a href="https://tiktok.com/@mentoragn" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Accueil
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('experts')}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Femmes Expertes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('resources')}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Ressources
                </button>
              </li>
              <li>
                {/* <button
                  onClick={() => onNavigate('events')}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Événements
                </button> */}
              </li>
              <li>
                {/* <button
                  onClick={() => onNavigate('opportunities')}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Opportunités
                </button> */}
              </li>
              <li>
                {/* <button
                  onClick={() => onNavigate('application')}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Candidature
                </button> */}
              </li>
              <li>
                <button
                  onClick={() => onNavigate('notification-demo')}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Démo Notifications
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('faq')}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('help-center')}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Centre d'aide
                </button>
              </li>
              {/* <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Conditions d'utilisation
                </a>
              </li> */}
              {/* <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Politique de confidentialité
                </a>
              </li> */}
              {/* <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Signaler un problème
                </a>
              </li> */}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div
                className="flex items-center space-x-3 cursor-pointer hover:text-purple-400 transition-colors"
                onClick={() => onNavigate('contact')}
              >
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300 text-sm">Conakry, Guinée</span>
              </div>
              <div
                className="flex items-center space-x-3 cursor-pointer hover:text-purple-400 transition-colors"
                onClick={() => onNavigate('contact')}
              >
                <Phone className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300 text-sm">+224 622949868</span>
              </div>
              <div
                className="flex items-center space-x-3 cursor-pointer hover:text-purple-400 transition-colors"
                onClick={() => onNavigate('contact')}
              >
                <Mail className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300 text-sm">contact@voixdavenir.gn</span>
              </div>
              {/* </div>
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2">Newsletter</h4>
              <p className="text-xs text-gray-400 mb-3">
                Recevez nos actualités, conseils et témoignages inspirants
              </p>
              
              {subscriptionStatus === 'success' && (
                <div className="mb-3 p-2 bg-green-600 text-white text-xs rounded-lg">
                  ✅ Inscription réussie ! Vérifiez votre email.
                </div>
              )}
              
              {subscriptionStatus === 'error' && (
                <div className="mb-3 p-2 bg-red-600 text-white text-xs rounded-lg">
                  ❌ Erreur d'inscription. Réessayez plus tard.
                </div>
              )} */}

              {/* <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="flex">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@exemple.com"
                    className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    required
                    disabled={isSubscribing}
                  />
                  <button 
                    type="submit"
                    disabled={isSubscribing || !email.trim() || subscriptionStatus === 'success'}
                    className="px-4 py-2 bg-purple-600 text-white text-sm rounded-r-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubscribing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : subscriptionStatus === 'success' ? (
                      '✓'
                    ) : (
                      'S\'abonner'
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Pas de spam. Désabonnement facile à tout moment.
                </p>
              </form> */}
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-800" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <span>© {new Date().getFullYear()} Voix D'avenir. Fait avec</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>pour l'autonomisation des femmes guinéennes</span>
          </div>
          <div className="mt-2 md:mt-0">
            {/* <span>Version 1.0.0</span> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
