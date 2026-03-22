import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Api from '../../data/Api';

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
                const [mentorsRes, resourcesRes, sessionsRes] = await Promise.all([
                    Api.get('/users/mentores').catch(() => null),
                    Api.get('/resources').catch(() => null),
                    currentUser ? Api.get('/sessions').catch(() => null) : Promise.resolve(null)
                ]);

                const mockMentors = [
                    { name: "Aissatou Diallo", profession: "Leadership & Business", expertise: "Business", bio: "Experte en leadership féminin." },
                    { name: "Fatou Camara", profession: "Développement personnel", expertise: "Coaching", bio: "Coach certifiée." }
                ];
                const mockResources = [
                    { title: "Guide de l'entrepreneuriat féminin" },
                    { title: "Comment obtenir une bourse ?" }
                ];

                if (mentorsRes && mentorsRes.data) {
                    setMentors(mentorsRes.data.length > 0 ? mentorsRes.data : mockMentors);
                } else {
                    setMentors(mockMentors);
                }

                if (resourcesRes && resourcesRes.data) {
                    setResources(resourcesRes.data.length > 0 ? resourcesRes.data : mockResources);
                } else {
                    setResources(mockResources);
                }

                if (sessionsRes && sessionsRes.data) {
                    setSessions(sessionsRes.data);
                }

            } catch (error) {
                console.error("Erreur chargement données chatbot:", error);
                setMentors([
                    { name: "Aissatou Diallo", profession: "Leadership & Business", expertise: "Business", bio: "Experte en leadership féminin." },
                    { name: "Fatou Camara", profession: "Développement personnel", expertise: "Coaching", bio: "Coach certifiée." }
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
        const contains = (keywords: string[]) => keywords.some(k => lowerInput.includes(k));
        const isMentore = currentUser?.role === 'mentore';

        if (contains(['qui es-tu', 'ton nom', 'tu es qui', 'présente toi', 'présente-toi', 'bonjour', 'salut', 'coucou', 'hello'])) {
            const roleMsg = isMentore
                ? "Madame la Mentore ! 🌟 Je suis là pour vous aider à accompagner vos mentorées."
                : "Future Leader ! 🚀 Je suis là pour t'orienter vers ton succès.";
            return `Bonjour ${currentUser?.name || ''} ! Je suis l'assistant officiel de Voix d'Avenir.\n${roleMsg}\n\nQue puis-je faire pour toi aujourd'hui ?`;
        }

        if (isMentore) {
            if (contains(['demande', 'fille', 'candidate', 'accepter'])) {
                return "👩🏫 **Gestion des demandes** :\nPour voir les demandes de mentorat, allez dans votre **Tableau de bord**. Vous pouvez accepter ou refuser une demande et voir le profil des candidates. Avez-vous une demande en attente ?";
            }
            if (contains(['dispo', 'agenda', 'calendrier', 'planifier'])) {
                return "📅 **Vos Disponibilités** :\nIl est important de garder votre agenda à jour. Allez dans 'Mon Planning' pour définir vos créneaux de mentorat. Cela aide les mentorées à réserver facilement.";
            }
        }

        if (contains(["c'est quoi", "qu'est-ce que", "c est quoi", "parle moi de voix", "présente voix", "définition", "résumé", "vision", "mission"])) {
            return "Voix d’Avenir est la première plateforme de mentorat féminin en Guinée 🇬🇳.\nElle connecte les jeunes filles à des femmes modèles pour :\n✨ Orientation académique & professionnelle.\n✨ Développement personnel (confiance, leadership).\n✨ Accès à des opportunités exclusives (stages, bourses).\n\nSouhaites-tu savoir comment t'inscrire ou voir nos mentores ?";
        }

        if (contains(['inscri', 'compte', 'rejoindre', 'enregistrement', 'créer'])) {
            return isMentore
                ? "Vous êtes déjà inscrite ! Mais si vous connaissez une experte, invitez-la à nous rejoindre via la page d'accueil."
                : "Pour t'inscrire : Clique sur 'S'inscrire', choisis 'Mentorée', et remplis ton profil. C'est le début de l'aventure !";
        }

        if (contains(['message', 'contacter', 'écrire', 'parler'])) {
            return "💬 **Messagerie** :\nPour contacter une mentore :\n1. Va sur la liste des mentores.\n2. Clique sur le profil qui t'intéresse.\n3. Utilise le bouton 'Envoyer un message'.\nSoyez polie et expliquez clairement votre demande.";
        }

        if (contains(['ressource', 'guide', 'vidéo', 'document', 'lire', 'apprendre', 'cv', 'entretien'])) {
            return "📚 **Centre de Ressources** :\nNous avons des guides sur le CV, le leadership, et des vidéos inspirantes. Tout est gratuit dans l'onglet 'Ressources'. Allez-y jeter un œil !";
        }

        if (contains(['aveni', 'métier', 'orientatio', 'choix', 'carrière'])) {
            return "Ton avenir se construit pas à pas. Ne stresse pas ! 🌟\nCommence par identifier tes passions et tes talents. As-tu déjà une idée du métier qui te fait rêver ? Je peux t'aider à explorer des pistes.";
        }

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
