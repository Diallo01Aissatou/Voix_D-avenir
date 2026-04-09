import React from 'react';
import { Heart, Mail, MapPin, Phone } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white text-gray-800 border-t border-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et Description */}
          <div className="space-y-4">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Voix d'Avenir Logo"
              className="h-40 w-auto object-contain"
            />
            <p className="text-gray-600 text-sm leading-relaxed">
              Plateforme de mentorat pour connecter les jeunes filles guinéennes
              à des femmes expertes et inspirantes. En route avec Voix D'avenir.
            </p>
            <div className="flex space-x-4">
              <a href="mailto:aissatoudiallo.nene29@gmail.com" className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors">
                <Mail className="w-4 h-4 text-white" />
              </a>
              <a href="https://wa.me/224622949868" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-700 transition-colors">
                <Phone className="w-4 h-4 text-white" />
              </a>
              <a href="https://tiktok.com/@mentoragn" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium"
                >
                  Accueil
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('experts')}
                  className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium"
                >
                  Femmes Expertes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('resources')}
                  className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium"
                >
                  Ressources
                </button>
              </li>

            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('faq')}
                  className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('help-center')}
                  className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium"
                >
                  Centre d'aide
                </button>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('privacy-policy')}
                  className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium text-left"
                >
                  Politique de Confidentialité
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms-of-service')}
                  className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium text-left"
                >
                  Conditions d'Utilisation
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact</h3>
            <div className="space-y-3">
              <div
                className="flex items-center space-x-3 cursor-pointer hover:text-purple-600 transition-colors group"
                onClick={() => onNavigate('contact')}
              >
                <MapPin className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-gray-600 text-sm">Conakry, Guinée</span>
              </div>
              <div
                className="flex items-center space-x-3 cursor-pointer hover:text-purple-600 transition-colors group"
                onClick={() => onNavigate('contact')}
              >
                <Phone className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-gray-600 text-sm">+224 622949868</span>
              </div>
              <div
                className="flex items-center space-x-3 cursor-pointer hover:text-purple-600 transition-colors group"
                onClick={() => onNavigate('contact')}
              >
                <Mail className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-gray-600 text-sm">contact@voixdavenir.gn</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-100" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <span>© {new Date().getFullYear()} Voix D'avenir. Fait avec</span>
            <Heart className="w-4 h-4 text-red-500 animate-pulse" />
            <span>pour l'autonomisation des femmes guinéennes</span>
          </div>
          <div className="mt-2 md:mt-0 italic">
            <span>Ensemble vers l'excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
