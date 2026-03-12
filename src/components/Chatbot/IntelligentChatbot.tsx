import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../../contexts/AuthContext';
import { ConversationContext, BotResponse } from '../../services/chatbotService';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    action?: BotResponse['action'];
    suggestions?: string[];
}

const IntelligentChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Bonjour ! Je suis l'assistant intelligent de Voix D'avenir. Je suis là pour t'écouter, te conseiller et t'accompagner dans ton parcours. Comment te sens-tu aujourd'hui ?",
            sender: 'bot',
            timestamp: new Date(),
            suggestions: [
                "C'est quoi Voix D'avenir ?",
                "Comment trouver une mentore ?",
            ]
        }
    ]);

    const [mentors, setMentors] = useState<any[]>([]);
    const [resources, setResources] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [conversationContext, setConversationContext] = useState<ConversationContext>({
        clarificationCount: 0,
        conversationHistory: [],
        userRole: null,
        userName: undefined
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { currentUser } = useAuth();

    // Mettre à jour le contexte quand l'utilisateur change
    useEffect(() => {
        setConversationContext(prev => ({
            ...prev,
            userRole: currentUser?.role as 'mentore' | 'mentoree' | 'admin' | null,
            userName: currentUser?.name
        }));
    }, [currentUser]);

    // Charger les données
    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = {
                    'Content-Type': 'application/json',
                    ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
                };

                const [mentorsRes, resourcesRes, sessionsRes] = await Promise.all([
                    fetch('https://voix-avenir-backend.onrender.com/api/users/mentores').catch(() => null),
                    fetch('https://voix-avenir-backend.onrender.com/api/resources').catch(() => null),
                    currentUser ? fetch('https://voix-avenir-backend.onrender.com/api/sessions', { headers }).catch(() => null) : Promise.resolve(null)
                ]);

                // Données de fallback
                const mockMentors = [
                    { name: "Aissatou Diallo", profession: "Leadership & Business", expertise: "Business", bio: "Experte en leadership féminin et entrepreneuriat." },
                    { name: "Fatou Camara", profession: "Développement personnel", expertise: "Coaching", bio: "Coach certifiée en développement personnel et confiance en soi." },
                    { name: "Mariama Sow", profession: "Études à l'étranger", expertise: "Education", bio: "Conseillère d'orientation et experte en études internationales." },
                    { name: "Hawa Mansaré", profession: "Technologie", expertise: "Tech", bio: "Ingénieure en informatique, experte en développement web." },
                    { name: "Hadja Safiatou Diallo", profession: "Santé", expertise: "Médecine", bio: "Médecin spécialisée, experte en santé publique." }
                ];

                const mockResources = [
                    { title: "Guide de l'entrepreneuriat féminin" },
                    { title: "Comment obtenir une bourse ?" },
                    { title: "Vidéo : Confiance en soi" },
                    { title: "Modèle de CV professionnel" }
                ];

                if (mentorsRes && mentorsRes.ok) {
                    const data = await mentorsRes.json();
                    setMentors(data.length > 0 ? data : mockMentors);
                } else {
                    setMentors(mockMentors);
                }

                if (resourcesRes && resourcesRes.ok) {
                    const data = await resourcesRes.json();
                    setResources(data.length > 0 ? data : mockResources);
                } else {
                    setResources(mockResources);
                }

                if (sessionsRes && sessionsRes.ok) {
                    setSessions(await sessionsRes.json());
                }
            } catch (error) {
                console.error("Erreur chargement données chatbot:", error);
                // Fallback critique
                setMentors([
                    { name: "Aissatou Diallo", profession: "Leadership & Business", expertise: "Business", bio: "Experte en leadership féminin." },
                    { name: "Fatou Camara", profession: "Développement personnel", expertise: "Coaching", bio: "Coach certifiée." }
                ]);
            }
        };
        fetchData();
    }, [currentUser]);

    const [isLoading, setIsLoading] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isLoading]);

    // Focus sur l'input quand le chat s'ouvre
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSend = async (e?: React.FormEvent, suggestionText?: string) => {
        e?.preventDefault();
        const textToSend = suggestionText || inputText.trim();
        if (!textToSend || isLoading) return;

        // Message utilisateur
        const userMessage: Message = {
            id: Date.now().toString(),
            text: textToSend,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        // Mettre à jour le contexte (historique local)
        const updatedHistory = [...conversationContext.conversationHistory, textToSend];
        setConversationContext(prev => ({
            ...prev,
            conversationHistory: updatedHistory
        }));

        try {
            // Préparer les messages pour l'API
            const apiMessages = messages.map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            }));
            apiMessages.push({ role: 'user', content: textToSend });

            // Appel à notre API backend
            const response = await fetch('https://voix-avenir-backend.onrender.com/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: apiMessages })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Erreur API');
            }

            const data = await response.json();
            const aiContent = data.message.content;

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: aiContent,
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Erreur AI Chatbot:", error);

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Désolé, je rencontre une petite difficulté technique pour me connecter à mon cerveau IA. 🧠 Peux-tu réessayer dans un instant ?",
                sender: 'bot',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, botMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        handleSend(undefined, suggestion);
    };

    const handleActionClick = (action: BotResponse['action']) => {
        if (!action) return;

        // Navigation selon le type d'action
        if (action.type === 'navigate' && action.value) {
            window.location.href = action.value;
        } else if (action.type === 'link' && action.value) {
            window.open(action.value, '_blank');
        }
        // Pour 'suggest', on peut ajouter une logique spécifique si nécessaire
    };

    const formatMessage = (text: string) => {
        return (
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold text-purple-700" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                    code: ({ node, ...props }) => <code className="bg-gray-100 rounded px-1 py-0.5 text-xs font-mono" {...props} />,
                }}
            >
                {text}
            </ReactMarkdown>
        );
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col h-[600px] transition-all duration-300 ease-in-out transform origin-bottom-right">
                    {/* En-tête */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between text-white">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Voix d'Avenir</h3>
                                <p className="text-xs text-white/80 flex items-center">
                                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                                    Assistant Connecté
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            aria-label="Fermer le chat"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-purple-50/50 to-pink-50/50 space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${msg.sender === 'user'
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none shadow-md'
                                    : 'bg-white text-gray-700 shadow-sm border border-purple-100 rounded-bl-none'
                                    }`}>
                                    {msg.sender === 'bot' ? (
                                        <div className="space-y-2">
                                            {formatMessage(msg.text)}
                                            {msg.action && (
                                                <button
                                                    onClick={() => handleActionClick(msg.action)}
                                                    className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-md"
                                                >
                                                    {msg.action.label}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Suggestions */}
                        {messages[messages.length - 1]?.suggestions && messages[messages.length - 1].sender === 'bot' && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {messages[messages.length - 1].suggestions?.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="px-3 py-1.5 text-xs bg-white border border-purple-200 text-purple-700 rounded-full hover:bg-purple-50 hover:border-purple-300 transition-colors shadow-sm"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-700 shadow-sm border border-purple-100 rounded-2xl rounded-bl-none p-3 max-w-[85%]">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={(e) => handleSend(e)} className="p-3 bg-white border-t border-purple-100">
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-full px-4 py-2 border border-purple-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Posez votre question..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-700 placeholder-gray-400"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(e);
                                    }
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className={`p-2 rounded-full transition-colors ${inputText.trim()
                                    ? 'text-purple-600 hover:bg-purple-100'
                                    : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                aria-label="Envoyer le message"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-center">
                            💬 Assistant intelligent • Réponses bienveillantes
                        </p>
                    </form>
                </div>
            )}

            {/* Bouton flottant */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 ${isOpen
                    ? 'bg-gray-800 text-white rotate-90'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                    }`}
                aria-label={isOpen ? "Fermer le chat" : "Ouvrir le chat"}
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <div className="relative">
                        <MessageCircle className="w-7 h-7" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                    </div>
                )}
            </button>
        </div>
    );
};

export default IntelligentChatbot;
