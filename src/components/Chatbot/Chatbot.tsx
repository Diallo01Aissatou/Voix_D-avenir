import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Bonjour ! Je suis l'assistant officiel de Voix d'Avenir 🌸. Je suis là pour t'expliquer la plateforme, t'orienter et t'accompagner.\n\nTu peux me demander :\n- \"C'est quoi Voix d'Avenir ?\"\n- \"Comment trouver une mentore ?\"\n- \"Aide-moi pour mon avenir\"",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [mentors, setMentors] = useState<any[]>([]);
    const [resources, setResources] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = {
                    'Content-Type': 'application/json',
                    ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
                };

                // Fetch with catch to prevent Promise.all from failing entirely
                const [mentorsRes, resourcesRes, sessionsRes] = await Promise.all([
                    fetch('https://voix-avenir-backend.onrender.com/api/users/mentores').catch(() => null),
                    fetch('https://voix-avenir-backend.onrender.com/api/resources').catch(() => null),
                    currentUser ? fetch('https://voix-avenir-backend.onrender.com/api/sessions', { headers }).catch(() => null) : Promise.resolve(null)
                ]);

                // Fallback Mock Data
                const mockMentors = [
                    { name: "Aissatou Diallo", profession: "Leadership & Business", expertise: "Business", bio: "Experte en leadership féminin." },
                    { name: "Fatou Camara", profession: "Développement personnel", expertise: "Coaching", bio: "Coach certifiée." },
                    { name: "Mariama Sow", profession: "Études à l'étranger", expertise: "Education", bio: "Conseillère d'orientation." }
                ];
                const mockResources = [
                    { title: "Guide de l'entrepreneuriat féminin" },
                    { title: "Comment obtenir une bourse ?" },
                    { title: "Vidéo : Confiance en soi" }
                ];

                // Set Mentors (API or Mock)
                if (mentorsRes && mentorsRes.ok) {
                    const data = await mentorsRes.json();
                    setMentors(data.length > 0 ? data : mockMentors);
                } else {
                    setMentors(mockMentors);
                }

                // Set Resources (API or Mock)
                if (resourcesRes && resourcesRes.ok) {
                    const data = await resourcesRes.json();
                    setResources(data.length > 0 ? data : mockResources);
                } else {
                    setResources(mockResources);
                }

                // Set Sessions
                if (sessionsRes && sessionsRes.ok) {
                    setSessions(await sessionsRes.json());
                }

            } catch (error) {
                console.error("Erreur chargement données chatbot:", error);
                // Critical fallback
                setMentors([
                    { name: "Aissatou Diallo", profession: "Leadership & Business", expertise: "Business", bio: "Experte en leadership féminin." },
                    { name: "Fatou Camara", profession: "Développement personnel", expertise: "Coaching", bio: "Coach certifiée." },
                    { name: "Mariama Sow", profession: "Études à l'étranger", expertise: "Education", bio: "Conseillère d'orientation." }
                ]);
            }
        };
        fetchData();
    }, [currentUser]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const getBotResponse = (input: string): string => {
        const lowerInput = input.toLowerCase();

        // Helper for keyword matching
        const contains = (keywords: string[]) => keywords.some(k => lowerInput.includes(k));

        // --- 0. DÉTECTION DU RÔLE ---
        const isMentore = currentUser?.role === 'mentore';
        const isMentoree = currentUser?.role === 'mentoree' || !currentUser;

        // --- 1. IDENTITÉ & MISSION ---
        if (contains(['qui es-tu', 'ton nom', 'tu es qui', 'présente toi', 'présente-toi', 'bonjour', 'salut', 'coucou', 'hello'])) {
            const roleMsg = isMentore
                ? "Madame la Mentore ! 🌟 Je suis là pour vous aider à accompagner vos mentorées."
                : "Future Leader ! 🚀 Je suis là pour t'orienter vers ton succès.";
            return `Bonjour ${currentUser?.name || ''} ! Je suis l'assistant officiel de Voix d'Avenir.\n${roleMsg}\n\nQue puis-je faire pour toi aujourd'hui ?`;
        }

        // --- 2. LOGIQUE SPÉCIFIQUE : MENTORE ---
        if (isMentore) {
            if (contains(['demande', 'fille', 'candidate', 'accepter'])) {
                return "👩🏫 **Gestion des demandes** :\nPour voir les demandes de mentorat, allez dans votre **Tableau de bord**. Vous pouvez accepter ou refuser une demande et voir le profil des candidates. Avez-vous une demande en attente ?";
            }
            if (contains(['dispo', 'agenda', 'calendrier', 'planifier'])) {
                return "📅 **Vos Disponibilités** :\nIl est important de garder votre agenda à jour. Allez dans 'Mon Planning' pour définir vos créneaux de mentorat. Cela aide les mentorées à réserver facilement.";
            }
            if (contains(['conseil', 'aider', 'bon mentor', 'guide mentore'])) {
                return "💡 **Conseil pour Mentore** :\nL'écoute active est votre meilleur atout. Encouragez l'autonomie de vos mentorées. N'hésitez pas à consulter notre 'Guide de la Mentore' dans les Ressources.";
            }
        }

        // --- 3. PRÉSENTATION & CIBLE (Commun) ---
        if (contains(["c'est quoi", "qu'est-ce que", "c est quoi", "parle moi de voix", "présente voix", "définition", "résumé", "vision", "mission"])) {
            return "Voix d’Avenir est la première plateforme de mentorat féminin en Guinée 🇬🇳.\nElle connecte les jeunes filles à des femmes modèles pour :\n✨ Orientation académique & professionnelle.\n✨ Développement personnel (confiance, leadership).\n✨ Accès à des opportunités exclusives (stages, bourses).\n\nSouhaites-tu savoir comment t'inscrire ou voir nos mentores ?";
        }
        if (contains(["pour qui", "audience", "cible", "je suis", "s'adresse"])) {
            return "La plateforme s'adresse à deux profils :\n👩🎓 **Jeunes filles** (lycéennes, étudiantes, jeunes diplômées) en quête d'orientation et de soutien.\n👩💼 **Femmes professionnelles** (mentores) souhaitant partager leur expérience et inspirer.\n\nDans quelle catégorie te situes-tu ?";
        }
        if (contains(["impact", "pourquoi", "importance", "intérêt", "utile"])) {
            return "Voix d’Avenir est cruciale car elle brise les barrières ! Elle permet de :\n✅ Trouver des modèles inspirants.\n✅ Booster la confiance en soi.\n✅ Faciliter l'insertion professionnelle.\n✅ Créer un réseau de femmes leaders.\n\nVeux-tu faire partie de ce changement ?";
        }

        // --- 4. NAVIGATION & AIDE TECHNIQUE ---
        if (contains(['inscri', 'compte', 'rejoindre', 'enregistrement', 'créer'])) {
            return isMentore
                ? "Vous êtes déjà inscrite ! Mais si vous connaissez une experte, invitez-la à nous rejoindre via la page d'accueil."
                : "Pour t'inscrire : Clique sur 'S'inscrire', choisis 'Mentorée', et remplis ton profil. C'est le début de l'aventure !";
        }
        if (contains(['connecter', 'connexion', 'login', 'mot de passe'])) {
            return "🔑 **Connexion** :\nClique sur 'Se connecter', entre ton email et ton mot de passe. Si tu as oublié ton mot de passe, utilise le lien 'Mot de passe oublié' pour le réinitialiser. Tout est clair ?";
        }
        if (contains(['profil', 'photo', 'bio', 'modifier'])) {
            return isMentore
                ? "Un profil complet (Photo professionnelle, Expertise détaillée) rassure les mentorées. Mettez-le à jour dans 'Mon Profil' !"
                : "Ton profil est ta carte de visite ! Ajoute tes intérêts et tes rêves pour attirer la bonne mentore.";
        }
        if (contains(['message', 'contacter', 'écrire', 'parler'])) {
            return "💬 **Messagerie** :\nPour contacter une mentore :\n1. Va sur la liste des mentores.\n2. Clique sur le profil qui t'intéresse.\n3. Utilise le bouton 'Envoyer un message'.\nSoyez polie et expliquez clairement votre demande.";
        }
        if (contains(['séance', 'meet', 'google meet', 'présentiel', 'rendez-vous', 'réserver'])) {
            return "📅 **Séances de Mentorat** :\nNous proposons deux formats :\n💻 **En ligne** : Via Google Meet (lien généré automatiquement).\n🤝 **En présentiel** : À convenir avec la mentore.\n\nPour réserver : Onglet 'Mes Séances' > 'Nouvelle demande'.";
        }

        // --- 5. LOGIQUE SPÉCIFIQUE : MENTORÉE (Recherche de mentor) ---
        if (!isMentore) {
            if (contains(['liste des mentores', 'voir les mentores', 'trouver une mentore', 'chercher', 'mentor', 'modèle'])) {
                if (mentors.length === 0) return "Notre réseau d'expertes se construit. Revenez bientôt !";
                const list = mentors.slice(0, 3).map((m, i) => `${i + 1}. ${m.name} (${m.profession})`).join('\n');
                return `Voici des modèles inspirants :\n${list}\n\nVous pouvez les filtrer par domaine (Santé, Tech, Business...). Lequel vous intéresse ?`;
            }
            if (contains(['choisir', 'laquelle', 'conseil mentore', 'hésite'])) {
                return "Choisis une mentore dont le parcours te fait rêver ! Lis sa bio et regarde si ses expertises matchent avec tes objectifs.";
            }

            // Filtrage par domaine (Logique Avancée)
            const domains = ['leadership', 'business', 'tech', 'entrepr', 'développ', 'science', 'éducation', 'santé', 'art', 'finance', 'droit'];
            const foundDomain = domains.find(d => lowerInput.includes(d));
            if (foundDomain) {
                const filtered = mentors.filter(m =>
                    (m.expertise?.toLowerCase() || '').includes(foundDomain) ||
                    (m.profession?.toLowerCase() || '').includes(foundDomain)
                );
                if (filtered.length === 0) return `Je n'ai pas trouvé de mentore spécifique en "${foundDomain}" pour l'instant. Mais d'autres profils pourraient t'inspirer ! Veux-tu voir la liste générale ?`;
                const list = filtered.map(m => `- ${m.name} (${m.profession})`).join('\n');
                return `Voici nos expertes en ${foundDomain} :\n${list}\n\nVisite leur profil pour prendre rendez-vous !`;
            }

            if (lowerInput.includes('info sur') || lowerInput.includes('détail sur')) {
                const nameQuery = lowerInput.replace('info sur', '').replace('détail sur', '').trim();
                const mentor = mentors.find(m => m.name.toLowerCase().includes(nameQuery));
                if (mentor) {
                    return `👤 **${mentor.name}**\n💼 ${mentor.profession}\n🌟 Expertise : ${mentor.expertise || 'Non spécifié'}\n📝 Bio : ${mentor.bio || 'Une experte prête à partager son savoir.'}\n\nElle correspond à tes attentes ? Connecte-toi pour la contacter !`;
                }
                return "Je n'ai pas trouvé cette mentore. Vérifie l'orthographe ou demande la liste complète.";
            }
        }

        // --- 6. RESSOURCES & APPRENTISSAGE ---
        if (contains(['ressource', 'guide', 'vidéo', 'document', 'lire', 'apprendre', 'cv', 'entretien'])) {
            return "📚 **Centre de Ressources** :\nNous avons des guides sur le CV, le leadership, et des vidéos inspirantes. Tout est gratuit dans l'onglet 'Ressources'. Allez-y jeter un œil !";
        }
        if (contains(['bourse', 'financement', 'argent', 'stage', 'emploi', 'travail', 'job', 'opportunité'])) {
            return "💼 **Opportunités** :\nConsultez régulièrement la section 'Opportunités'. Nos partenaires y publient des offres de stages et de bourses exclusives.";
        }

        // --- 7. "N'IMPORTE QUELLE QUESTION" (Généraliste & Soft Skills) ---
        if (contains(['avenir', 'métier', 'orientation', 'choix', 'carrière'])) {
            return "Ton avenir se construit pas à pas. Ne stresse pas ! 🌟\nCommence par identifier tes passions et tes talents. As-tu déjà une idée du métier qui te fait rêver ? Je peux t'aider à explorer des pistes.";
        }
        if (contains(['peur', 'doute', 'confiance', 'timide', 'pas capable', 'difficile', 'oser'])) {
            return "✨ **Confiance en soi** :\nLa confiance se construit par l'action. Chaque petit pas compte. Voix d'Avenir est là pour vous rappeler que vous êtes capable de grandes choses. C'est normal d'avoir peur, cela prouve que tes rêves sont grands ! 💪";
        }
        if (contains(['échec', 'raté', 'erreur'])) {
            return "L'échec n'est pas une fin, c'est une leçon. Toutes nos mentores ont connu des échecs avant de réussir. Parlez-en avec elles !";
        }
        if (contains(['stress', 'examen', 'pression'])) {
            return "Respirez ! 🌿 L'organisation est la clé anti-stress. Faites un planning et accordez-vous des pauses. Courage !";
        }
        if (lowerInput.includes('objectif')) {
            return "Définir un objectif est la première étape du succès. Il doit être SMART : Spécifique, Mesurable, Atteignable, Réaliste et Temporel. Quel est ton objectif pour ce mois-ci ?";
        }

        // --- 7b. MON PLANNING (Fonctionnalité Perso) ---
        if (contains(['mon planning', 'mes séances', 'prochaine séance', 'agenda', 'rendez-vous prévu', 'suivi'])) {
            if (!currentUser) return "Pour voir ton planning personnalisé, connecte-toi d'abord !";
            if (sessions.length === 0) return "Tu n'as aucune séance prévue pour le moment. La régularité est clé ! Pourquoi ne pas programmer une séance cette semaine ?";

            const upcoming = sessions.filter((s: any) => new Date(s.date) > new Date()).slice(0, 3);
            if (upcoming.length === 0) return "Rien de prévu à venir. C'est peut-être le moment de relancer ta mentore ?";

            const list = upcoming.map((s: any) => `📅 ${new Date(s.date).toLocaleDateString()} avec ${s.mentore?.name || 'ta mentore'}`).join('\n');
            return `Voici tes prochaines étapes :\n${list}\n\nPrépare bien tes questions pour profiter à fond de chaque séance !`;
        }

        // --- 8. FAQ & SUPPORT ---
        if (contains(['aide', 'support', 'bug', 'problème', 'marche pas', 'erreur'])) {
            return "Oups ! Si tu rencontres un problème technique, tu peux contacter notre support technique à support@voixdavenir.gn ou via le formulaire de contact en bas de page. Décris bien ton problème.";
        }
        if (contains(['merci', 'top', 'super', 'génial', 'cool'])) {
            return "Avec plaisir ! ❤️ Je suis là pour toi 24/7. N'hésite pas si tu as d'autres questions !";
        }

        // --- FALLBACK INTELLIGENT ---
        return "Je ne suis pas sûre d'avoir bien compris, mais je veux t'aider ! 🤔\nTu peux me demander :\n- \"Liste des mentores\"\n- \"Comment s'inscrire ?\"\n- \"Conseils pour mon avenir\"\n- \"Voir mes séances\"\n\nOu pose une question à nos mentores expertes !";
    };

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');

        setTimeout(() => {
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: getBotResponse(userMessage.text),
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botResponse]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[500px] transition-all duration-300 ease-in-out transform origin-bottom-right">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between text-white">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Voix d'Avenir</h3>
                                <p className="text-xs text-white/80">Assistant Connecté</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100">
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Posez votre question..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-700 placeholder-gray-400"
                            />
                            <button type="submit" disabled={!inputText.trim()} className={`p-2 rounded-full transition-colors ${inputText.trim() ? 'text-purple-600 hover:bg-purple-100' : 'text-gray-300 cursor-not-allowed'}`}>
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <button onClick={() => setIsOpen(!isOpen)} className={`p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 ${isOpen ? 'bg-gray-800 text-white rotate-90' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'}`}>
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
            </button>
        </div>
    );
};

export default Chatbot;
