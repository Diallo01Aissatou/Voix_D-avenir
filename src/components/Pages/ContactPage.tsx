import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Twitter, Instagram, Linkedin, MessageSquare, Info } from 'lucide-react';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
);

interface ContactPageProps {
    onNavigate: (page: string) => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simuler un envoi
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });

            // Réinitialiser le message de succès après 5 secondes
            setTimeout(() => setSubmitted(false), 5000);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-50 via-white to-pink-50 -z-10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Contactez <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Voix d'Avenir</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Vous avez des questions, des suggestions ou vous souhaitez devenir mentor ?
                        L'équipe de Voix D'avenir est là pour vous accompagner.
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                        {/* Contact Information */}
                        <div className="space-y-12">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                    <Info className="text-purple-600 w-6 h-6" />
                                    Nos Coordonnées
                                </h2>
                                <div className="space-y-8">
                                    <div className="flex items-start gap-5 group">
                                        <div className="w-12 h-12 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Adresse</p>
                                            <p className="text-gray-900 font-medium text-lg">Conakry, République de Guinée</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-5 group">
                                        <div className="w-12 h-12 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                                            <p className="text-gray-900 font-medium text-lg">contact@voixdavenir.gn</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-5 group">
                                        <div className="w-12 h-12 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Téléphone</p>
                                            <p className="text-gray-900 font-medium text-lg">+224 000 00 00 00</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Suivez-nous</h3>
                                <div className="flex gap-4">
                                    {[
                                        { icon: TikTokIcon, label: 'TikTok', color: 'hover:bg-black' },
                                        { icon: Twitter, label: 'Twitter', color: 'hover:bg-sky-500' },
                                        { icon: Instagram, label: 'Instagram', color: 'hover:bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600' },
                                        { icon: Linkedin, label: 'LinkedIn', color: 'hover:bg-blue-700' }
                                    ].map((social, idx) => (
                                        <a
                                            key={idx}
                                            href="#"
                                            className={`w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300 ${social.color}`}
                                            aria-label={social.label}
                                        >
                                            <social.icon className="w-5 h-5" />
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden group shadow-xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                                <div className="relative z-10">
                                    <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <MessageSquare className="w-6 h-6" />
                                        Discutez avec Voix d'Avenir
                                    </h4>
                                    <p className="text-white/90 mb-6 leading-relaxed">
                                        Besoin d'une réponse immédiate ? Notre chatbot intelligent est disponible 24/7 pour répondre à vos questions sur l'orientation et les opportunités.
                                    </p>
                                    <button
                                        onClick={() => {
                                            const chatbotTrigger = document.querySelector('[aria-label="Toggle chatbot"]') as HTMLButtonElement;
                                            if (chatbotTrigger) chatbotTrigger.click();
                                        }}
                                        className="px-6 py-2.5 bg-white text-purple-600 rounded-full font-bold hover:bg-opacity-90 transition-all flex items-center gap-2"
                                    >
                                        Ouvrir le chat
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white rounded-3xl shadow-2xl shadow-purple-100 p-8 md:p-10 border border-gray-50">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">Envoyez-nous un message</h2>

                            {submitted ? (
                                <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center animate-fade-in">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
                                        <Send className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-green-900 mb-2">Message envoyé !</h3>
                                    <p className="text-green-700">Merci de nous avoir contactés. Notre équipe vous répondra dans les plus brefs délais.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Nom complet</label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-900"
                                                placeholder="Votre nom"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-900"
                                                placeholder="votre@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">Sujet</label>
                                        <select
                                            id="subject"
                                            name="subject"
                                            required
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-900 appearance-none"
                                        >
                                            <option value="">Sélectionnez un sujet</option>
                                            <option value="orientation">Orientation scolaire</option>
                                            <option value="mentorat">Devenir mentor</option>
                                            <option value="partenariat">Partenariat</option>
                                            <option value="technique">Problème technique</option>
                                            <option value="autre">Autre</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-900 resize-none"
                                            placeholder="Comment pouvons-nous vous aider ?"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-purple-200 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Envoi en cours...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Envoyer le message
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Map or CTA Section */}
            <section className="bg-gray-50 py-20 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Rejoignez notre communauté</h2>
                    <p className="text-gray-600 mb-10 max-w-xl mx-auto">
                        Plus de 500 jeunes guinéens font déjà confiance à Voix D'avenir pour leur avenir.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={() => onNavigate('register')}
                            className="px-8 py-3 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-all shadow-md"
                        >
                            C'est parti !
                        </button>
                        <button
                            onClick={() => onNavigate('about')}
                            className="px-8 py-3 bg-white text-gray-700 border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-all shadow-sm"
                        >
                            En savoir plus
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
