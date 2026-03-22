import React from 'react';
import { BookOpen, User, Users, PlayCircle, MessageSquare, ChevronRight, HelpCircle, PhoneCall, ShieldCheck, Search } from 'lucide-react';

interface HelpCenterPageProps {
    onNavigate: (page: string) => void;
}

const HelpCenterPage: React.FC<HelpCenterPageProps> = ({ onNavigate }) => {
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-purple-700 to-pink-600 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-6 opacity-90" />
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Centre d'Apprentissage</h1>
                    <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                        Guides, tutoriels et bonnes pratiques pour tirer le meilleur parti de votre expérience sur Voix D'avenir.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12">
                <div className="container mx-auto px-4 max-w-6xl">

                    {/* Section: Premiers Pas */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                            <PlayCircle className="w-8 h-8 text-purple-600" />
                            Premiers Pas
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-gray-800 mb-3">1. Compléter son profil à 100%</h3>
                                <p className="text-gray-600 mb-4">Un profil complet attire plus d'attention. Découvrez comment mettre en valeur vos compétences et vos objectifs.</p>
                                <div className="bg-purple-50 p-4 rounded-xl text-sm text-purple-800 flex items-start gap-2">
                                    <span className="font-semibold shrink-0">Astuce :</span>
                                    <span>Ajoutez une photo professionnelle et une biographie détaillée pour inspirer confiance.</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-gray-800 mb-3">2. Comprendre le tableau de bord</h3>
                                <p className="text-gray-600 mb-4">Naviguez facilement dans votre espace personnel : suivez vos demandes, gérez vos sessions et accédez à vos ressources.</p>
                                <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                                    <li>L'onglet <strong>Sessions</strong> rassemble vos prochains rendez-vous.</li>
                                    <li>L'onglet <strong>Messages</strong> permet de communiquer avec votre binôme.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 mb-16">
                        {/* Guide Mentorée */}
                        <div>
                            <div className="bg-pink-50 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                                <User className="w-8 h-8 text-pink-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Guide de la Mentorée</h2>

                            <div className="space-y-4">
                                <div className="group bg-white p-5 rounded-xl border border-gray-100 hover:border-pink-300 transition-colors cursor-pointer flex items-start gap-4">
                                    <div className="bg-gray-100 rounded-lg p-3 group-hover:bg-pink-100 transition-colors">
                                        <Search className="w-6 h-6 text-gray-600 group-hover:text-pink-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 mb-1">Trouver la mentore idéale</h4>
                                        <p className="text-sm text-gray-600">Utilisez l'annuaire des expertes pour filtrer par domaine de compétence et secteur.</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 mt-2 group-hover:text-pink-600 transition-colors" />
                                </div>

                                <div className="group bg-white p-5 rounded-xl border border-gray-100 hover:border-pink-300 transition-colors cursor-pointer flex items-start gap-4">
                                    <div className="bg-gray-100 rounded-lg p-3 group-hover:bg-pink-100 transition-colors">
                                        <MessageSquare className="w-6 h-6 text-gray-600 group-hover:text-pink-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 mb-1">Faire une demande percutante</h4>
                                        <p className="text-sm text-gray-600">Comment rédiger un premier message qui prouve votre motivation.</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 mt-2 group-hover:text-pink-600 transition-colors" />
                                </div>
                            </div>
                        </div>

                        {/* Guide Mentore */}
                        <div>
                            <div className="bg-purple-50 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                                <Users className="w-8 h-8 text-purple-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Guide de la Mentore</h2>

                            <div className="space-y-4">
                                <div className="group bg-white p-5 rounded-xl border border-gray-100 hover:border-purple-300 transition-colors cursor-pointer flex items-start gap-4">
                                    <div className="bg-gray-100 rounded-lg p-3 group-hover:bg-purple-100 transition-colors">
                                        <ShieldCheck className="w-6 h-6 text-gray-600 group-hover:text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 mb-1">Gérer les demandes</h4>
                                        <p className="text-sm text-gray-600">Apprenez à sélectionner vos mentorées en fonction de vos disponibilités et compétences.</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 mt-2 group-hover:text-purple-600 transition-colors" />
                                </div>

                                <div className="group bg-white p-5 rounded-xl border border-gray-100 hover:border-purple-300 transition-colors cursor-pointer flex items-start gap-4">
                                    <div className="bg-gray-100 rounded-lg p-3 group-hover:bg-purple-100 transition-colors">
                                        <BookOpen className="w-6 h-6 text-gray-600 group-hover:text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 mb-1">Structurer une session</h4>
                                        <p className="text-sm text-gray-600">Conseils et trames pour des rencontres productives et bienveillantes, optimisées pour la progression.</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 mt-2 group-hover:text-purple-600 transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="border-t border-gray-200 pt-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Vous ne trouvez pas ce que vous cherchez ?</h2>
                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            <button
                                onClick={() => onNavigate('faq')}
                                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center group"
                            >
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                                    <HelpCircle className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Consulter la FAQ</h3>
                                <p className="text-gray-600">Pour des réponses rapides aux questions courantes concernant la création de compte, les bugs, ou d'autres interrogations génériques.</p>
                            </button>

                            <button
                                onClick={() => onNavigate('contact')}
                                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center group"
                            >
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                                    <PhoneCall className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Contacter le Support</h3>
                                <p className="text-gray-600">Notre équipe est disponible pour vous accompagner face à une difficulté technique qui bloque votre progression.</p>
                            </button>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default HelpCenterPage;
