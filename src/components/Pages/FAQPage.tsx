import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Mail,
  ExternalLink,
  HelpCircle,
  CheckCircle,
  Users,
  Book,
  Shield,
  Loader2
} from 'lucide-react';
import { faqService, GroupedFAQs } from '../../services/faqService';
import { questionService } from '../../services/questionService';
import { useAuth } from '../../contexts/AuthContext';

interface FAQPageProps {
  onNavigate: (page: string) => void;
}

const FAQPage: React.FC<FAQPageProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const staticFAQs: GroupedFAQs = {
    general: [
      { id: 'g1', question: "Qu'est-ce que Voix D'avenir ?", answer: "Voix D'avenir est une plateforme digitale dédiée au mentorat féminin en Guinée, connectant les jeunes filles aux femmes leaders." },
      { id: 'g2', question: "Comment ça marche ?", answer: "Les mentorées choisissent une mentore, soumettent une demande, et une fois acceptées, elles peuvent planifier des séances et échanger via le chat." }
    ],
    mentorat: [
      { id: 'm1', question: "Comment devenir mentor ?", answer: "Cliquez sur 'S'inscrire', choisissez le profil 'Mentor', et remplissez votre dossier. Notre équipe validera votre candidature." },
      { id: 'm2', question: "Est-ce payant ?", answer: "La plateforme de base est gratuite pour favoriser l'inclusion de toutes les jeunes filles guinéennes." }
    ],
    compte: [
      { id: 'c1', question: "J'ai oublié mon mot de passe", answer: "Utilisez le lien 'Mot de passe oublié' sur la page de connexion pour recevoir un email de réinitialisation." },
      { id: 'c2', question: "Comment modifier mon profil ?", answer: "Allez dans votre tableau de bord et cliquez sur l'onglet 'Profil' pour mettre à jour vos informations." }
    ],
    securite: [
      { id: 's1', question: "Mes données sont-elles sécurisées ?", answer: "Oui, nous utilisons des protocoles de chiffrement standards pour protéger toutes vos informations personnelles et vos échanges." }
    ]
  };

  const [faqData, setFaqData] = useState<GroupedFAQs>(staticFAQs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New state for User Questions
  const { currentUser } = useAuth();
  const [questionData, setQuestionData] = useState({
    text: '',
    category: 'autre'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const categories = [
    { id: 'general', name: 'Général', icon: HelpCircle },
    { id: 'mentorat', name: 'Mentorat', icon: Users },
    { id: 'compte', name: 'Mon Compte', icon: Book },
    { id: 'securite', name: 'Sécurité', icon: Shield }
  ];

  const fetchFAQs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await faqService.getFAQs();
      // Only update if we actually got grouped data
      if (data && Object.keys(data).length > 0) {
        setFaqData(data);
      }
    } catch (err) {
      console.warn('Backend FAQ empty or unreachable, using static fallback');
      // Keep static data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionData.text.trim()) return;

    setIsSubmitting(true);
    try {
      await questionService.submitQuestion({
        question: questionData.text,
        category: questionData.category,
        userName: currentUser?.name,
        userEmail: currentUser?.email
      });
      setSubmitSuccess(true);
      setQuestionData({ text: '', category: 'autre' });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFAQs = (faqData[activeCategory] || []).filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Centre d'Aide & FAQ
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Trouvez rapidement des réponses à vos questions les plus fréquentes
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher dans la FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Catégories</h3>
              <nav className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveCategory(category.id);
                        setOpenFAQ(null);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${activeCategory === category.id
                        ? 'bg-purple-100 text-purple-700 border-purple-200'
                        : 'hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{category.name}</span>
                      <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        {(faqData[category.id] || []).length}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {categories.find(c => c.id === activeCategory)?.name}
              </h2>

              <div className="space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                    <p className="text-gray-500">Chargement des réponses...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button onClick={fetchFAQs} className="text-purple-600 font-medium hover:underline">
                      Réessayer
                    </button>
                  </div>
                ) : (
                  filteredFAQs.map((faq) => {
                    const id = faq._id || faq.id;
                    return (
                      <div key={id} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => setOpenFAQ(openFAQ === id ? null : id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors rounded-lg"
                        >
                          <span className="font-semibold text-gray-800 pr-4">{faq.question}</span>
                          {openFAQ === id ? (
                            <ChevronUp className="w-5 h-5 text-purple-600 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>

                        {openFAQ === id && (
                          <div className="px-4 pb-4">
                            <div className="border-t border-gray-200 pt-4">
                              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {filteredFAQs.length === 0 && !loading && (
                <div className="text-center py-12">
                  <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune question trouvée</h3>
                  <p className="text-gray-500">Essayez de modifier votre recherche ou de changer de catégorie</p>
                </div>
              )}
            </div>

            {/* Contact Support */}
            <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center shadow-lg">
              <MessageCircle className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Besoin d'aide supplémentaire ?</h3>
              <p className="text-purple-100 mb-6 max-w-lg mx-auto">
                Notre équipe support est là pour vous aider par email ou via le formulaire de contact pour toute assistance personnalisée.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => onNavigate('contact')}
                  className="px-8 py-3 bg-white text-purple-600 rounded-xl hover:bg-opacity-90 transition-all font-bold shadow-md"
                >
                  Contacter le Support
                </button>
                <button
                  onClick={() => onNavigate('home')}
                  className="px-8 py-3 border-2 border-white text-white rounded-xl hover:bg-white hover:text-purple-600 transition-all font-bold"
                >
                  Retour à l'accueil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ask a Question Section */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nouveau : Posez votre question</h2>
            <p className="text-gray-600 text-lg">
              Vous ne trouvez pas votre réponse ? Soumettez votre question et nous l'ajouterons peut-être à notre base de connaissances.
            </p>
          </div>

          <div className="bg-purple-50 rounded-3xl p-8 md:p-10 border border-purple-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full -mr-16 -mt-16"></div>

            {submitSuccess ? (
              <div className="text-center py-6 animate-fade-in relative z-10">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-green-900 mb-3">Question bien reçue !</h3>
                <p className="text-green-700 text-lg">Merci beaucoup. Notre équipe va étudier votre question et l'intégrer prochainement.</p>
              </div>
            ) : (
              <form onSubmit={handleQuestionSubmit} className="space-y-6 relative z-10">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Votre question</label>
                  <textarea
                    required
                    value={questionData.text}
                    onChange={(e) => setQuestionData(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full px-5 py-4 bg-white border border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none text-gray-900 min-h-[140px] text-lg"
                    placeholder="Ex: Quelles sont les conditions pour devenir mentore ?"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie la plus proche</label>
                    <div className="relative">
                      <select
                        value={questionData.category}
                        onChange={(e) => setQuestionData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-5 py-4 bg-white border border-purple-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none text-gray-900 appearance-none text-lg"
                      >
                        <option value="general">Général</option>
                        <option value="mentorat">Mentorat</option>
                        <option value="compte">Compte & Connexion</option>
                        <option value="securite">Sécurité</option>
                        <option value="autre">Autre</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-purple-200 transform transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-6 h-6" />
                          Envoyer la question
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center group hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 transition-colors">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Guide du Mentorat</h3>
              <p className="text-gray-600 mb-6">
                Découvrez nos conseils pour tirer le meilleur parti de votre expérience.
              </p>
              <button
                onClick={() => onNavigate('resources')}
                className="text-purple-600 hover:text-purple-800 font-bold inline-flex items-center gap-2 group-hover:gap-3 transition-all"
              >
                Lire le guide <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center group hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-100 transition-colors">
                <Book className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ressources Utiles</h3>
              <p className="text-gray-600 mb-6">
                Accédez à notre bibliothèque de ressources pour développer vos compétences.
              </p>
              <button
                onClick={() => onNavigate('resources')}
                className="text-purple-600 hover:text-purple-800 font-bold inline-flex items-center gap-2 group-hover:gap-3 transition-all"
              >
                Voir les ressources <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center group hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-100 transition-colors">
                <Mail className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Communauté</h3>
              <p className="text-gray-600 mb-6">
                Rejoignez notre communauté pour plus de conseils et d'actualités.
              </p>
              <button
                onClick={() => onNavigate('contact')}
                className="text-purple-600 hover:text-purple-800 font-bold inline-flex items-center gap-2 group-hover:gap-3 transition-all"
              >
                Nous contacter <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
