/**
 * Service de chatbot intelligent pour Voix d'Avenir
 * Gestion des intentions, contexte conversationnel et réponses bienveillantes
 */

export interface ConversationContext {
  lastIntent?: string;
  clarificationCount: number;
  userRole?: 'mentore' | 'mentoree' | 'admin' | null;
  userName?: string;
  conversationHistory: string[];
}

export interface BotResponse {
  text: string;
  action?: {
    label: string;
    type: 'navigate' | 'suggest' | 'link';
    value?: string;
  };
  suggestions?: string[];
  needsClarification?: boolean;
}

/**
 * Détecte l'intention principale de l'utilisateur
 */
export function detectIntent(input: string): string {
  const lowerInput = input.toLowerCase().trim();

  // Intentions principales avec priorités
  const intentPatterns: { intent: string; keywords: string[]; priority: number }[] = [
    // Salutations et présentation
    { intent: 'greeting', keywords: ['bonjour', 'salut', 'coucou', 'hello', 'hi', 'bonsoir', 'bonne journée'], priority: 10 },
    { intent: 'identity', keywords: ['qui es-tu', 'ton nom', 'tu es qui', 'présente toi', 'présente-toi'], priority: 10 },

    // Présentation plateforme
    { intent: 'platform_what', keywords: ["c'est quoi", "qu'est-ce que", "c est quoi", "parle moi de voix", "définition", "résumé"], priority: 9 },
    { intent: 'platform_who', keywords: ['pour qui', 'audience', 'cible', "s'adresse", 'qui peut'], priority: 9 },
    { intent: 'platform_impact', keywords: ['impact', 'pourquoi', 'importance', 'utile', 'intérêt'], priority: 8 },

    // Inscription et connexion
    { intent: 'register', keywords: ['inscri', 'compte', 'rejoindre', 'enregistrement', 'créer compte', 's\'inscrire'], priority: 9 },
    { intent: 'login', keywords: ['connecter', 'connexion', 'login', 'se connecter', 'identifier'], priority: 9 },
    { intent: 'password', keywords: ['mot de passe', 'oublié', 'réinitialiser', 'reset password'], priority: 8 },

    // Profil
    { intent: 'profile', keywords: ['profil', 'photo', 'bio', 'modifier profil', 'mon profil'], priority: 7 },

    // Messagerie
    { intent: 'messaging', keywords: ['message', 'contacter', 'écrire', 'parler', 'chat', 'discuter'], priority: 8 },

    // Séances
    { intent: 'session_online', keywords: ['séance en ligne', 'google meet', 'meet', 'vidéo', 'visio'], priority: 8 },
    { intent: 'session_presentiel', keywords: ['séance présentiel', 'présentiel', 'en personne', 'physique', 'rencontre'], priority: 8 },
    { intent: 'session_book', keywords: ['réserver', 'planifier', 'programmer', 'prendre rendez-vous'], priority: 8 },
    { intent: 'session_list', keywords: ['mes séances', 'mon planning', 'agenda', 'rendez-vous prévu', 'prochaine séance'], priority: 7 },

    // Mentorat
    { intent: 'mentor_list', keywords: ['liste des mentores', 'voir les mentores', 'trouver une mentore', 'chercher mentore', 'mentores disponibles'], priority: 9 },
    { intent: 'mentor_choose', keywords: ['choisir', 'laquelle', 'conseil mentore', 'hésite', 'quelle mentore'], priority: 8 },
    { intent: 'mentor_info', keywords: ['info sur', 'détail sur', 'en savoir plus sur', 'profil de'], priority: 7 },
    { intent: 'mentor_request', keywords: ['demande de mentorat', 'demander', 'solliciter', 'faire une demande'], priority: 8 },
    { intent: 'mentor_role', keywords: ['rôle mentore', 'que fait une mentore', 'responsabilité mentore'], priority: 7 },

    // Ressources
    { intent: 'resources', keywords: ['ressource', 'guide', 'document', 'lire', 'apprendre', 'bibliothèque'], priority: 7 },
    { intent: 'resources_video', keywords: ['vidéo', 'vidéos', 'tutoriel vidéo'], priority: 6 },
    { intent: 'resources_cv', keywords: ['cv', 'curriculum', 'rédiger cv', 'modèle cv'], priority: 6 },
    { intent: 'resources_interview', keywords: ['entretien', 'interview', 'préparer entretien'], priority: 6 },

    // Opportunités
    { intent: 'opportunities', keywords: ['bourse', 'financement', 'stage', 'emploi', 'job', 'opportunité', 'offre'], priority: 7 },

    // Orientation et avenir
    { intent: 'orientation', keywords: ['avenir', 'métier', 'orientation', 'choix', 'carrière', 'profession'], priority: 8 },
    { intent: 'decision', keywords: ['décision', 'choisir', 'hésiter', 'doute', 'indécision'], priority: 7 },
    { intent: 'confidence', keywords: ['confiance', 'timide', 'pas capable', 'difficile', 'oser', 'peur'], priority: 8 },
    { intent: 'motivation', keywords: ['motivation', 'motiver', 'encouragement', 'soutien'], priority: 7 },

    // Suivi et accompagnement
    { intent: 'progress', keywords: ['progression', 'avancer', 'suivi', 'accompagnement', 'évolution'], priority: 7 },
    { intent: 'next_steps', keywords: ['prochaine étape', 'que faire', 'par où commencer', 'débuter'], priority: 7 },

    // Support et FAQ
    { intent: 'help', keywords: ['aide', 'support', 'bug', 'problème', 'marche pas', 'erreur', 'difficulté'], priority: 6 },
    { intent: 'faq', keywords: ['faq', 'questions fréquentes', 'questions courantes'], priority: 5 },

    // Émotions et soutien
    { intent: 'failure', keywords: ['échec', 'raté', 'erreur', 'échouer'], priority: 7 },
    { intent: 'stress', keywords: ['stress', 'examen', 'pression', 'anxiété', 'anxieux'], priority: 7 },
    { intent: 'objectives', keywords: ['objectif', 'but', 'cible', 'ambition'], priority: 6 },

    // Remerciements
    { intent: 'thanks', keywords: ['merci', 'top', 'super', 'génial', 'cool', 'parfait'], priority: 5 },
  ];

  // Trouver l'intention avec la priorité la plus élevée
  let bestMatch = { intent: 'unknown', priority: 0 };

  for (const pattern of intentPatterns) {
    const matchCount = pattern.keywords.filter(k => lowerInput.includes(k)).length;
    if (matchCount > 0 && pattern.priority > bestMatch.priority) {
      bestMatch = { intent: pattern.intent, priority: pattern.priority };
    }
  }

  // Détection spécifique de catégories de ressources
  const resourceCategories = [
    { category: 'Orientation', keywords: ['orient', 'choisir', 'carrière', 'futur', 'métier'] },
    { category: 'Education', keywords: ['éduc', 'école', 'universi', 'étud', 'diplôm'] },
    { category: 'Opportunités', keywords: ['oppor', 'offre', 'stage', 'bourse', 'emploi', 'job'] },
    { category: 'Inspiration', keywords: ['inspi', 'succès', 'réussi', 'parcours', 'témoignage'] },
    { category: 'Développement personnel', keywords: ['dévelop', 'confiance', 'stress', 'soft skill', 'leadership'] },
    { category: 'Technologie', keywords: ['tech', 'info', 'code', 'numériqu', 'digital'] },
    { category: 'Guides pratiques', keywords: ['guide', 'expert', 'pratiqu', 'comment', 'outil'] }
  ];

  for (const rc of resourceCategories) {
    if (rc.keywords.some(k => lowerInput.includes(k))) {
      // Si on détecte une catégorie mais que l'intention est vague, on précise
      if (bestMatch.intent === 'unknown' || bestMatch.intent === 'resources') {
        return `resource_cat_${rc.category.toLowerCase().replace(/\s+/g, '_')}`;
      }
    }
  }

  return bestMatch.intent;
}

/**
 * Génère une réponse bienveillante et structurée selon l'intention
 */
export function generateResponse(
  input: string,
  context: ConversationContext,
  mentors: any[] = [],
  resources: any[] = [],
  sessions: any[] = []
): BotResponse {
  const intent = detectIntent(input);
  const lowerInput = input.toLowerCase();
  const isMentore = context.userRole === 'mentore';
  const isMentoree = context.userRole === 'mentoree' || !context.userRole;

  // === SALUTATIONS ET PRÉSENTATION ===
  if (intent === 'greeting' || intent === 'identity') {
    const roleMsg = isMentore
      ? "Madame la Mentore ! 🌟 Je suis là pour vous aider à accompagner vos mentorées avec bienveillance et professionnalisme."
      : "Future Leader ! 🚀 Je suis là pour t'orienter, te conseiller et t'accompagner dans ton parcours vers le succès.";

    return {
      text: `Bonjour ${context.userName || ''} ! Je suis l'assistant intelligent de Voix d'Avenir, la plateforme de mentorat féminin en Guinée. 🇬🇳\n\n${roleMsg}\n\nJe peux t'aider à :\n✨ Comprendre la plateforme\n✨ Trouver une mentore adaptée\n✨ Gérer tes séances et messages\n✨ Accéder aux ressources et opportunités\n✨ T'orienter dans tes choix professionnels\n\nQue souhaiterais-tu faire aujourd'hui ?`,
      suggestions: [
        "C'est quoi Voix d'Avenir ?",
        "Comment trouver une mentore ?",
        "Comment s'inscrire ?",
        "Voir mes séances"
      ]
    };
  }

  // === PRÉSENTATION DE LA PLATEFORME ===
  if (intent === 'platform_what') {
    return {
      text: `Voix d'Avenir est la première plateforme de mentorat féminin en Guinée 🇬🇳, conçue pour connecter les jeunes filles aux femmes leaders qui peuvent les inspirer et les guider.\n\n**Ce que nous proposons :**\n✨ **Orientation académique & professionnelle** : Trouve ta voie avec l'aide d'expertes\n✨ **Développement personnel** : Boost ta confiance en soi et ton leadership\n✨ **Accès à des opportunités exclusives** : Bourses, stages, ateliers réservés aux membres\n✨ **Réseau de femmes inspirantes** : Rejoins une communauté de futures leaders\n\n**Notre mission** : Briser les barrières et créer un pont entre les générations de femmes guinéennes.\n\nSouhaites-tu savoir comment t'inscrire ou voir nos mentores disponibles ?`,
      action: {
        label: isMentoree ? "Voir les mentores" : "Voir mon tableau de bord",
        type: 'navigate',
        value: isMentoree ? '/experts' : '/mentore-dashboard'
      },
      suggestions: [
        "Comment s'inscrire ?",
        "Voir les mentores",
        "Pour qui est cette plateforme ?"
      ]
    };
  }

  if (intent === 'platform_who') {
    return {
      text: `Voix d'Avenir s'adresse à deux profils complémentaires :\n\n👩🎓 **Les jeunes filles (mentorées)** :\n- Lycéennes en quête d'orientation\n- Étudiantes cherchant leur voie\n- Jeunes diplômées en début de carrière\n- Toutes celles qui veulent grandir avec l'aide d'une mentore\n\n👩💼 **Les femmes professionnelles (mentores)** :\n- Femmes leaders dans leur domaine\n- Entrepreneures et cadres\n- Expertes souhaitant partager leur expérience\n- Celles qui veulent inspirer la prochaine génération\n\n**Dans quelle catégorie te situes-tu ?** Nous avons des parcours adaptés pour chacun !`,
      suggestions: [
        "Je suis une jeune fille",
        "Je suis une professionnelle",
        "Comment s'inscrire ?"
      ]
    };
  }

  if (intent === 'platform_impact') {
    return {
      text: `Voix d'Avenir est cruciale car elle brise les barrières et crée des opportunités ! 🌟\n\n**Notre impact :**\n✅ **Trouver des modèles inspirants** : Des femmes qui ont réussi et qui te montrent que c'est possible\n✅ **Booster la confiance en soi** : Par l'accompagnement bienveillant et personnalisé\n✅ **Faciliter l'insertion professionnelle** : Accès à un réseau et à des opportunités exclusives\n✅ **Créer un réseau de femmes leaders** : Une communauté solidaire et motivante\n✅ **Orienter les choix** : Des conseils éclairés pour faire les bons choix académiques et professionnels\n\n**Ensemble, nous construisons l'avenir des femmes guinéennes !** 💪\n\nVeux-tu faire partie de ce changement positif ?`,
      action: {
        label: "Rejoindre Voix d'Avenir",
        type: 'navigate',
        value: '/register'
      }
    };
  }

  // === INSCRIPTION ET CONNEXION ===
  if (intent === 'register') {
    if (isMentore) {
      return {
        text: `Vous êtes déjà inscrite en tant que mentore ! 🌟\n\nSi vous connaissez d'autres expertes qui souhaiteraient rejoindre notre communauté, n'hésitez pas à les inviter via la page d'accueil ou à partager notre plateforme.\n\nY a-t-il autre chose avec laquelle je peux vous aider aujourd'hui ?`,
        suggestions: ["Voir mes demandes", "Gérer mon planning", "Voir mes mentorées"]
      };
    }

    return {
      text: `Excellente décision ! Rejoindre Voix d'Avenir, c'est faire le premier pas vers ton avenir. 🚀\n\n**Pour t'inscrire :**\n1️⃣ Clique sur "S'inscrire" en haut à droite\n2️⃣ Choisis "Mentorée" comme type de compte\n3️⃣ Remplis ton profil avec tes intérêts et tes rêves\n4️⃣ Explore les mentores et envoie ta première demande !\n\n**Astuce** : Un profil complet (photo, bio, intérêts) attire les meilleures mentores ! 📸\n\nC'est le début d'une belle aventure ! As-tu déjà une idée du domaine qui t'intéresse ?`,
      action: {
        label: "S'inscrire maintenant",
        type: 'navigate',
        value: '/register'
      },
      suggestions: [
        "Voir les mentores disponibles",
        "Comment choisir une mentore ?",
        "Qu'est-ce qu'une mentore ?"
      ]
    };
  }

  if (intent === 'login') {
    return {
      text: `Pour te connecter à Voix d'Avenir : 🔑\n\n1️⃣ Clique sur "Se connecter" en haut à droite\n2️⃣ Entre ton email et ton mot de passe\n3️⃣ Accède à ton tableau de bord personnalisé\n\n**Mot de passe oublié ?** Pas de souci ! Utilise le lien "Mot de passe oublié" sur la page de connexion. Tu recevras un email pour le réinitialiser.\n\nTout est clair ? Si tu rencontres un problème, je suis là pour t'aider !`,
      action: {
        label: "Se connecter",
        type: 'navigate',
        value: '/login'
      }
    };
  }

  if (intent === 'password') {
    return {
      text: `Pas de panique ! On va récupérer ton accès ensemble. 🔐\n\n**Pour réinitialiser ton mot de passe :**\n1️⃣ Va sur la page de connexion\n2️⃣ Clique sur "Mot de passe oublié ?"\n3️⃣ Entre ton email\n4️⃣ Vérifie ta boîte mail (et les spams !)\n5️⃣ Clique sur le lien reçu et crée un nouveau mot de passe\n\n**Conseil** : Choisis un mot de passe fort avec au moins 8 caractères, des majuscules, des chiffres et des symboles.\n\nSi tu ne reçois pas l'email après quelques minutes, vérifie que tu as bien utilisé l'email de ton compte. Besoin d'aide supplémentaire ?`,
      action: {
        label: "Réinitialiser mon mot de passe",
        type: 'navigate',
        value: '/forgot-password'
      }
    };
  }

  // === PROFIL ===
  if (intent === 'profile') {
    if (isMentore) {
      return {
        text: `Un profil complet et professionnel est essentiel pour rassurer les mentorées et les attirer ! 👩💼\n\n**Pour optimiser ton profil :**\n✨ **Photo professionnelle** : Une photo claire et souriante inspire confiance\n✨ **Bio détaillée** : Partage ton parcours, tes expertises et ta passion pour le mentorat\n✨ **Domaines d'expertise** : Précise tes spécialités (Business, Tech, Santé, etc.)\n✨ **Disponibilités** : Mets à jour ton planning régulièrement\n\n**Un bon profil = Plus de demandes de mentorat !** 📈\n\nTu peux modifier ton profil dans "Mon Profil" depuis ton tableau de bord.`,
        action: {
          label: "Voir mon profil",
          type: 'navigate',
          value: '/mentore-dashboard'
        }
      };
    }

    return {
      text: `Ton profil est ta carte de visite sur Voix d'Avenir ! 🎯\n\n**Pour attirer la bonne mentore :**\n✨ **Photo** : Une photo claire et professionnelle\n✨ **Bio** : Parle de tes rêves, tes passions, tes objectifs\n✨ **Intérêts** : Indique les domaines qui t'intéressent\n✨ **Objectifs** : Partage ce que tu veux accomplir\n\n**Plus ton profil est complet, plus les mentores peuvent te comprendre et t'aider !** 💪\n\nAs-tu déjà rempli ton profil ? Si non, c'est le moment de le faire !`,
      action: {
        label: "Modifier mon profil",
        type: 'navigate',
        value: '/mentoree-dashboard'
      }
    };
  }

  // === MESSAGERIE ===
  if (intent === 'messaging') {
    return {
      text: `La messagerie est ton outil principal pour communiquer avec ta mentore ! 💬\n\n**Comment contacter une mentore :**\n1️⃣ Va sur la liste des mentores (onglet "Mentores")\n2️⃣ Clique sur le profil de celle qui t'intéresse\n3️⃣ Utilise le bouton "Envoyer un message" ou "Demander un mentorat"\n4️⃣ Rédige un message poli et clair expliquant ta demande\n\n**Conseils pour un bon message :**\n✨ Sois polie et respectueuse\n✨ Présente-toi brièvement\n✨ Explique ce que tu cherches\n✨ Montre ta motivation\n\n**Une fois la demande acceptée**, vous aurez accès à un chat privé pour échanger librement ! 🎉\n\nAs-tu déjà identifié une mentore qui t'intéresse ?`,
      action: {
        label: "Voir les mentores",
        type: 'navigate',
        value: '/experts'
      },
      suggestions: [
        "Comment choisir une mentore ?",
        "Voir mes messages",
        "Comment faire une bonne demande ?"
      ]
    };
  }

  // === SÉANCES ===
  if (intent === 'session_online') {
    return {
      text: `Les séances en ligne sont pratiques et flexibles ! 💻\n\n**Comment ça fonctionne :**\n✨ Une fois ta demande acceptée, tu peux proposer une séance\n✨ La mentore confirme la date et l'heure\n✨ Un lien Google Meet est généré automatiquement\n✨ Tu reçois une notification avec le lien avant la séance\n\n**Avantages des séances en ligne :**\n✅ Pas de déplacement nécessaire\n✅ Flexibilité géographique\n✅ Facile à organiser\n✅ Enregistrement possible (avec accord)\n\n**Pour réserver une séance en ligne :**\nVa dans "Mes Séances" > "Nouvelle séance" et choisis "En ligne".\n\nAs-tu déjà une mentore avec qui tu veux planifier une séance ?`,
      action: {
        label: "Voir mes séances",
        type: 'navigate',
        value: '/mentoree-dashboard'
      }
    };
  }

  if (intent === 'session_presentiel') {
    return {
      text: `Les séances en présentiel créent une connexion plus forte ! 🤝\n\n**Comment organiser une séance en présentiel :**\n1️⃣ Contacte ta mentore via la messagerie\n2️⃣ Proposez ensemble un lieu et une date\n3️⃣ Confirme les détails (adresse, heure, durée)\n4️⃣ La séance est ajoutée à votre planning\n\n**Conseils de sécurité :**\n✨ Choisissez un lieu public et sûr\n✨ Informez quelqu'un de votre rendez-vous\n✨ Respectez les horaires convenus\n\n**Pour réserver :**\nVa dans "Mes Séances" > "Nouvelle séance" et choisis "En présentiel".\n\nAs-tu déjà convenu d'un lieu avec ta mentore ?`,
      action: {
        label: "Voir mes séances",
        type: 'navigate',
        value: '/mentoree-dashboard'
      }
    };
  }

  if (intent === 'session_book' || intent === 'session_list') {
    if (!context.userRole) {
      return {
        text: `Pour voir ton planning personnalisé et réserver des séances, connecte-toi d'abord ! 🔐\n\nUne fois connectée, tu pourras :\n✨ Voir tes séances à venir\n✨ Réserver de nouvelles séances\n✨ Gérer ton agenda\n✨ Recevoir des rappels\n\nConnecte-toi maintenant pour accéder à toutes ces fonctionnalités !`,
        action: {
          label: "Se connecter",
          type: 'navigate',
          value: '/login'
        }
      };
    }

    if (sessions.length === 0) {
      return {
        text: `Tu n'as aucune séance prévue pour le moment. 📅\n\n**La régularité est la clé du succès !** Pourquoi ne pas programmer une séance cette semaine ?\n\n**Pour réserver une séance :**\n1️⃣ Assure-toi d'avoir une demande acceptée\n2️⃣ Va dans "Mes Séances"\n3️⃣ Clique sur "Nouvelle séance"\n4️⃣ Choisis le format (en ligne ou présentiel)\n5️⃣ Propose une date et une heure\n\n**Conseil** : Programme tes séances régulièrement (toutes les 2-3 semaines) pour un meilleur suivi ! 💪\n\nAs-tu déjà une mentore avec qui tu travailles ?`,
        action: {
          label: "Voir mes demandes",
          type: 'navigate',
          value: '/mentoree-dashboard'
        },
        suggestions: [
          "Comment trouver une mentore ?",
          "Voir mes messages",
          "Comment faire une demande ?"
        ]
      };
    }

    const upcoming = sessions
      .filter((s: any) => new Date(s.date) > new Date())
      .slice(0, 3);

    if (upcoming.length === 0) {
      return {
        text: `Rien de prévu à venir pour le moment. 📅\n\nC'est peut-être le moment de relancer ta mentore pour programmer une nouvelle séance ? La régularité dans le mentorat est importante pour progresser ! 💪\n\n**Pourquoi ne pas :**\n✨ Envoyer un message à ta mentore\n✨ Proposer quelques créneaux\n✨ Préparer tes questions pour la prochaine séance\n\nVeux-tu que je t'aide à préparer tes questions ?`,
        action: {
          label: "Envoyer un message",
          type: 'navigate',
          value: '/mentoree-dashboard'
        }
      };
    }

    const list = upcoming
      .map((s: any) => `📅 ${new Date(s.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })} à ${s.time || '14h00'} avec ${s.mentore?.name || 'ta mentore'}`)
      .join('\n');

    return {
      text: `Voici tes prochaines séances :\n\n${list}\n\n**Pour profiter au maximum de chaque séance :**\n✨ Prépare tes questions à l'avance\n✨ Note tes objectifs pour la séance\n✨ Sois ponctuelle et respectueuse\n✨ Prends des notes pendant l'échange\n\n**Rappel** : Tu recevras une notification 24h avant chaque séance ! 🔔\n\nAs-tu besoin d'aide pour préparer tes questions ?`,
      action: {
        label: "Voir toutes mes séances",
        type: 'navigate',
        value: '/mentoree-dashboard'
      }
    };
  }

  // === MENTORAT ===
  if (intent === 'mentor_list') {
    if (mentors.length === 0) {
      return {
        text: `Notre réseau d'expertes se construit chaque jour ! 🌟\n\nReviens bientôt pour découvrir de nouvelles mentores inspirantes. En attendant, tu peux t'inscrire pour être notifiée dès qu'une nouvelle mentore rejoint la plateforme.\n\nVeux-tu t'inscrire maintenant ?`,
        action: {
          label: "S'inscrire",
          type: 'navigate',
          value: '/register'
        }
      };
    }

    const list = mentors
      .slice(0, 5)
      .map((m, i) => `${i + 1}. **${m.name}** - ${m.profession || m.expertise || 'Experte'}`)
      .join('\n');

    return {
      text: `Voici quelques-unes de nos mentores inspirantes : 🌟\n\n${list}\n\n**Tu peux :**\n✨ Les filtrer par domaine (Santé, Tech, Business, Éducation...)\n✨ Lire leur profil détaillé\n✨ Les contacter directement\n✨ Voir leurs disponibilités\n\n**Conseil** : Choisis une mentore dont le parcours te fait rêver et dont les expertises correspondent à tes objectifs ! 💪\n\nQuel domaine t'intéresse le plus ?`,
      action: {
        label: "Voir toutes les mentores",
        type: 'navigate',
        value: '/experts'
      },
      suggestions: [
        "Mentores en Business",
        "Mentores en Tech",
        "Mentores en Santé",
        "Comment choisir ?"
      ]
    };
  }

  if (intent === 'mentor_choose') {
    return {
      text: `Choisir une mentore est une décision importante ! Voici comment faire le bon choix : 🎯\n\n**Critères à considérer :**\n✨ **Son parcours** : Est-ce qu'il t'inspire et te montre que c'est possible ?\n✨ **Ses expertises** : Correspondent-elles à tes objectifs et intérêts ?\n✨ **Sa bio** : Partage-t-elle tes valeurs et ta vision ?\n✨ **Sa disponibilité** : A-t-elle du temps pour t'accompagner ?\n\n**Mon conseil** : Lis attentivement les profils, pose-toi ces questions :\n- "Est-ce que je me vois suivre ses conseils ?"\n- "Est-ce que son parcours me donne envie de réussir ?"\n- "Est-ce que je me sens à l'aise avec elle ?"\n\n**N'hésite pas** : Tu peux faire plusieurs demandes et voir avec qui le courant passe le mieux ! 💪\n\nAs-tu déjà identifié quelques mentores qui t'intéressent ?`,
      action: {
        label: "Voir les mentores",
        type: 'navigate',
        value: '/experts'
      }
    };
  }

  if (intent === 'mentor_info') {
    const nameQuery = lowerInput
      .replace('info sur', '')
      .replace('détail sur', '')
      .replace('en savoir plus sur', '')
      .replace('profil de', '')
      .trim();

    const mentor = mentors.find(m =>
      m.name.toLowerCase().includes(nameQuery) ||
      nameQuery.includes(m.name.toLowerCase())
    );

    if (mentor) {
      return {
        text: `👤 **${mentor.name}**\n\n💼 **Profession** : ${mentor.profession || 'Non spécifié'}\n🌟 **Expertise** : ${mentor.expertise || 'Non spécifié'}\n📝 **Bio** : ${mentor.bio || "Une experte prête à partager son savoir et son expérience pour t'aider à réussir."}\n\n**Elle correspond à tes attentes ?** Connecte-toi pour la contacter et lui envoyer une demande de mentorat ! 💪`,
        action: {
          label: "Contacter cette mentore",
          type: 'navigate',
          value: '/experts'
        }
      };
    }

    return {
      text: `Je n'ai pas trouvé cette mentore dans notre base. 🤔\n\n**Peux-tu :**\n✨ Vérifier l'orthographe du nom\n✨ Me donner plus de détails (domaine, profession)\n✨ Demander la liste complète des mentores\n\nJe peux aussi t'aider à trouver une mentore selon tes critères ! Quel domaine t'intéresse ?`,
      needsClarification: context.clarificationCount < 2,
      suggestions: [
        "Voir toutes les mentores",
        "Mentores en Business",
        "Mentores en Tech"
      ]
    };
  }

  if (intent === 'mentor_request') {
    return {
      text: `Faire une demande de mentorat, c'est faire le premier pas vers ton avenir ! 🚀\n\n**Comment faire une bonne demande :**\n1️⃣ **Choisis une mentore** qui t'inspire\n2️⃣ **Rédige un message personnalisé** :\n   - Présente-toi brièvement\n   - Explique pourquoi tu la choisis\n   - Partage tes objectifs et tes rêves\n   - Montre ta motivation\n3️⃣ **Sois polie et respectueuse**\n4️⃣ **Sois patiente** : Les mentores reçoivent plusieurs demandes\n\n**Conseil** : Une demande personnalisée a plus de chances d'être acceptée ! Montre que tu as lu son profil et que tu as vraiment envie de travailler avec elle. 💪\n\nAs-tu déjà identifié une mentore qui t'intéresse ?`,
      action: {
        label: "Voir les mentores",
        type: 'navigate',
        value: '/experts'
      }
    };
  }

  if (intent === 'mentor_role') {
    return {
      text: `Une mentore est une femme expérimentée qui partage son savoir et son expérience pour t'aider à réussir ! 👩💼\n\n**Le rôle d'une mentore sur Voix d'Avenir :**\n✨ **Orienter** : T'aider à faire les bons choix académiques et professionnels\n✨ **Conseiller** : Partager son expérience et ses leçons apprises\n✨ **Motiver** : Te donner confiance en toi et en tes capacités\n✨ **Réseauter** : T'ouvrir des portes et des opportunités\n✨ **Accompagner** : Être là pour toi dans les moments importants\n\n**Ce qu'une mentore n'est PAS :**\n❌ Une enseignante (pas de cours)\n❌ Une psychologue (pas de thérapie)\n❌ Une recruteuse (mais peut t'orienter)\n\n**C'est une alliée** qui croit en toi et veut te voir réussir ! 💪\n\nVeux-tu en savoir plus sur comment trouver une mentore ?`,
      suggestions: [
        "Voir les mentores",
        "Comment choisir une mentore ?",
        "Comment faire une demande ?"
      ]
    };
  }

  // === RESSOURCES ===
  if (intent === 'resources') {
    return {
      text: `Notre centre de ressources est une mine d'or pour ton développement ! 📚\n\n**Ce que tu y trouveras :**\n✨ **Guides pratiques** : CV, entretiens, leadership, entrepreneuriat\n✨ **Vidéos inspirantes** : Témoignages, tutoriels, conférences\n✨ **Documents de formation** : PDFs téléchargeables\n✨ **Conseils d'experts** : Articles et guides rédigés par nos mentores\n\n**Tout est gratuit** et accessible dans l'onglet "Ressources" ! 🎉\n\n**Conseil** : Consulte régulièrement les nouvelles ressources ajoutées. Elles sont mises à jour fréquemment !\n\nQuel type de ressource t'intéresse le plus ?`,
      action: {
        label: "Voir les ressources",
        type: 'navigate',
        value: '/resources'
      },
      suggestions: [
        "Guides CV",
        "Vidéos",
        "Guides d'entretien",
        "Leadership"
      ]
    };
  }

  if (intent === 'resources_cv') {
    return {
      text: `Un bon CV, c'est ta première impression professionnelle ! 📄\n\n**Dans nos ressources, tu trouveras :**\n✨ Des modèles de CV adaptés\n✨ Des conseils pour rédiger chaque section\n✨ Des exemples concrets\n✨ Des astuces pour se démarquer\n\n**Conseils de base pour un bon CV :**\n✅ Sois concise et claire\n✅ Mets en avant tes compétences\n✅ Adapte-le au poste visé\n✅ Vérifie l'orthographe\n✅ Format PDF professionnel\n\n**Va dans "Ressources" > "Guides" pour télécharger nos modèles !** 💪\n\nAs-tu besoin d'aide pour un domaine spécifique de ton CV ?`,
      action: {
        label: "Voir les guides CV",
        type: 'navigate',
        value: '/resources'
      }
    };
  }

  if (intent === 'resources_interview') {
    return {
      text: `Bien préparer un entretien, c'est déjà réussir à moitié ! 🎤\n\n**Dans nos ressources, tu trouveras :**\n✨ Des guides de préparation complets\n✨ Des exemples de questions/réponses\n✨ Des conseils pour gérer le stress\n✨ Des astuces pour te démarquer\n\n**Conseils essentiels :**\n✅ Prépare-toi à l'avance\n✅ Connais l'entreprise et le poste\n✅ Prépare tes questions\n✅ Sois ponctuelle et professionnelle\n✅ Montre ta motivation\n\n**Va dans "Ressources" pour accéder à tous nos guides !** 💪\n\nAs-tu un entretien prévu bientôt ?`,
      action: {
        label: "Voir les guides d'entretien",
        type: 'navigate',
        value: '/resources'
      }
    };
  }

  // === OPPORTUNITÉS ===
  if (intent === 'opportunities' || intent === 'resource_cat_opportunités') {
    const relevantResources = resources.filter(r =>
      r.category === 'Opportunités' ||
      r.title.toLowerCase().includes('opportunité') ||
      r.title.toLowerCase().includes('bourse')
    ).slice(0, 3);

    let text = `Les opportunités, c'est ton accès privilégié à des offres exclusives ! 💼\n\n**Ce que tu trouveras :**\n✨ **Bourses d'études**, **Stages**, **Emplois** et **Programmes** de développement.\n\n`;

    if (relevantResources.length > 0) {
      text += `**Voici des ressources qui peuvent t'aider :**\n${relevantResources.map(r => `📄 ${r.title}`).join('\n')}\n\n`;
    }

    text += `**Nos partenaires** publient régulièrement des offres exclusives ! 🌟\n\nVeux-tu voir les opportunités disponibles maintenant ?`;

    return {
      text,
      action: {
        label: "Voir les opportunités",
        type: 'navigate',
        value: '/opportunities'
      }
    };
  }

  // === ORIENTATION ET AVENIR ===
  if (intent === 'orientation' || intent === 'resource_cat_orientation') {
    const relevantResources = resources.filter(r =>
      r.category === 'Orientation' ||
      r.title.toLowerCase().includes('orientation') ||
      r.title.toLowerCase().includes('carrière')
    ).slice(0, 3);

    let text = `Ton avenir se construit pas à pas, et je suis là pour t'accompagner ! 🌟\n\n`;

    if (relevantResources.length > 0) {
      text += `**Voici des ressources qui peuvent t'aider :**\n${relevantResources.map(r => `📄 ${r.title}`).join('\n')}\n\n`;
    }

    text += `**Pour t'orienter efficacement :**\n✨ Identifie tes passions\n✨ Connais tes talents\n✨ Explore les métiers\n✨ Parle avec des mentores\n\n**As-tu déjà une idée du métier qui te fait rêver ?**`;

    return {
      text,
      suggestions: [
        "Je ne sais pas quoi faire",
        "Voir les mentores",
        "Conseils pour choisir"
      ]
    };
  }

  if (intent === 'confidence') {
    return {
      text: `La confiance en soi se construit par l'action, et chaque petit pas compte ! ✨\n\n**Voix d'Avenir est là pour te rappeler que tu es capable de grandes choses.** 💪\n\n**C'est normal d'avoir peur** : Cela prouve que tes rêves sont grands et que tu prends les choses au sérieux. C'est même un bon signe ! 🌟\n\n**Pour développer ta confiance :**\n✨ **Agis malgré la peur** : Chaque action te rend plus forte\n✨ **Célèbre tes petites victoires** : Chaque pas compte\n✨ **Entoure-toi de personnes positives** : Comme tes mentores\n✨ **Parle de tes doutes** : Avec ta mentore ou d'autres mentorées\n✨ **Rappelle-toi tes réussites** : Tu as déjà accompli beaucoup\n\n**Tu n'es pas seule** : Toutes les grandes femmes ont douté avant de réussir. La différence ? Elles ont continué malgré tout. 💪\n\nVeux-tu que je te connecte avec une mentore qui peut t'aider à développer ta confiance ?`,
      action: {
        label: "Voir les mentores",
        type: 'navigate',
        value: '/experts'
      }
    };
  }

  if (intent === 'failure') {
    return {
      text: `L'échec n'est pas une fin, c'est une leçon précieuse ! 🌱\n\n**Toutes nos mentores ont connu des échecs avant de réussir.** C'est même souvent grâce à ces échecs qu'elles ont appris les leçons les plus importantes. 💪\n\n**Comment transformer un échec en opportunité :**\n✨ **Analyse ce qui s'est passé** : Qu'as-tu appris ?\n✨ **Identifie ce que tu peux améliorer** : Pour la prochaine fois\n✨ **Ne te décourage pas** : Un échec ne définit pas qui tu es\n✨ **Parle-en** : Avec ta mentore ou d'autres mentorées\n✨ **Continue d'avancer** : Chaque tentative te rapproche du succès\n\n**Rappelle-toi** : Les plus grandes réussites viennent souvent après plusieurs échecs. L'important, c'est de ne jamais abandonner ! 💪\n\nVeux-tu parler de ton expérience avec une mentore ?`,
      action: {
        label: "Voir les mentores",
        type: 'navigate',
        value: '/experts'
      }
    };
  }

  if (intent === 'stress') {
    return {
      text: `Respire ! Le stress est normal, mais on peut le gérer. 🌿\n\n**Pour gérer le stress efficacement :**\n✨ **Organise-toi** : Un planning clair réduit le stress\n✨ **Prends des pauses** : Le repos est essentiel\n✨ **Parle de ce qui te stresse** : Avec ta mentore ou des amies\n✨ **Respire profondément** : Des exercices de respiration aident\n✨ **Priorise** : Focalise-toi sur l'essentiel\n✨ **Fais du sport** : L'activité physique réduit le stress\n\n**Pour les examens spécifiquement :**\n✅ Prépare-toi à l'avance (pas de dernière minute)\n✅ Fais un planning de révision\n✅ Teste-toi régulièrement\n✅ Dors bien la veille\n✅ Reste calme le jour J\n\n**Tu n'es pas seule** : Beaucoup de personnes stressent, c'est normal. L'important, c'est de ne pas laisser le stress te paralyser. 💪\n\nAs-tu besoin de conseils plus spécifiques pour gérer ton stress ?`,
      suggestions: [
        "Stress pour les examens",
        "Parler avec une mentore",
        "Conseils d'organisation"
      ]
    };
  }

  if (intent === 'objectives') {
    return {
      text: `Définir un objectif est la première étape du succès ! 🎯\n\n**Pour fixer un bon objectif, utilise la méthode SMART :**\n✨ **S**pécifique : Sois précise sur ce que tu veux\n✨ **M**esurable : Comment sauras-tu que tu l'as atteint ?\n✨ **A**tteignable : Est-ce réaliste pour toi ?\n✨ **R**éaliste : As-tu les moyens de l'atteindre ?\n✨ **T**emporel : Quand veux-tu l'atteindre ?\n\n**Exemple d'objectif SMART :**\n"Je veux obtenir mon bac avec mention Bien en juin 2024 en étudiant 2h par jour."\n\n**Quel est ton objectif pour ce mois-ci ?** Je peux t'aider à le formuler de manière SMART ! 💪`,
      needsClarification: context.clarificationCount < 2
    };
  }

  // === SUIVI ET ACCOMPAGNEMENT ===
  if (intent === 'progress') {
    return {
      text: `Suivre ta progression, c'est voir comment tu grandis ! 📈\n\n**Pour mesurer ta progression :**\n✨ **Note tes objectifs** : Où veux-tu être dans 3 mois, 6 mois, 1 an ?\n✨ **Fais le point régulièrement** : Avec ta mentore\n✨ **Célèbre tes victoires** : Même les petites\n✨ **Ajuste si nécessaire** : Les objectifs peuvent évoluer\n\n**Sur Voix d'Avenir, tu peux :**\n✅ Voir tes séances passées et à venir\n✅ Suivre tes demandes de mentorat\n✅ Accéder à tes ressources consultées\n✅ Mesurer tes progrès avec ta mentore\n\n**La progression n'est pas toujours linéaire** : Il y a des hauts et des bas, c'est normal. L'important, c'est de continuer d'avancer ! 💪\n\nAs-tu déjà défini tes objectifs avec ta mentore ?`,
      action: {
        label: "Voir mon tableau de bord",
        type: 'navigate',
        value: isMentoree ? '/mentoree-dashboard' : '/mentore-dashboard'
      }
    };
  }

  if (intent === 'next_steps') {
    return {
      text: `Parfait ! Voici tes prochaines étapes pour réussir avec Voix d'Avenir : 🚀\n\n**Si tu n'es pas encore inscrite :**\n1️⃣ Inscris-toi sur la plateforme\n2️⃣ Complète ton profil\n3️⃣ Explore les mentores\n4️⃣ Envoie ta première demande\n\n**Si tu es déjà inscrite :**\n1️⃣ Assure-toi d'avoir un profil complet\n2️⃣ Contacte une mentore qui t'inspire\n3️⃣ Programme ta première séance\n4️⃣ Explore les ressources disponibles\n5️⃣ Consulte les opportunités\n\n**Conseil** : Ne cherche pas à tout faire en une fois. Commence par une étape, puis passe à la suivante. Chaque petit pas compte ! 💪\n\n**Par où veux-tu commencer ?** Je suis là pour t'accompagner à chaque étape !`,
      suggestions: [
        "S'inscrire",
        "Voir les mentores",
        "Voir les ressources",
        "Voir les opportunités"
      ]
    };
  }

  // === SUPPORT ET FAQ ===
  if (intent === 'help') {
    return {
      text: `Je suis là pour t'aider ! 💪\n\n**Si tu rencontres un problème technique :**\n✨ Décris bien ton problème\n✨ Indique à quelle étape ça bloque\n✨ Vérifie ta connexion internet\n✨ Essaie de rafraîchir la page\n\n**Tu peux contacter notre support :**\n📧 Email : support@voixdavenir.gn\n📱 Via le formulaire de contact en bas de page\n💬 Ou continue à me parler, je peux peut-être t'aider !\n\n**Pour les questions sur la plateforme :**\nPose-moi directement tes questions ! Je suis là pour t'expliquer comment tout fonctionne. 💬\n\n**Quel est le problème que tu rencontres ?** Décris-le moi et je vais faire mon maximum pour t'aider !`,
      needsClarification: context.clarificationCount < 2
    };
  }

  if (intent === 'thanks') {
    return {
      text: `Avec plaisir ! ❤️ Je suis là pour toi 24/7.\n\nN'hésite pas si tu as d'autres questions. Je suis toujours disponible pour t'aider, t'orienter et t'accompagner dans ton parcours avec Voix d'Avenir ! 🌟\n\n**N'oublie pas :**\n✨ Explore les mentores disponibles\n✨ Consulte les ressources régulièrement\n✨ Programme tes séances\n✨ Suis les opportunités\n\n**Bonne continuation dans ton parcours ! Tu es capable de grandes choses !** 💪✨`,
      suggestions: [
        "Voir les mentores",
        "Voir les ressources",
        "Voir mes séances"
      ]
    };
  }

  // === FALLBACK INTELLIGENT ===
  // Détection de domaines spécifiques pour filtrage de mentores
  const domains = ['leadership', 'business', 'tech', 'entrepr', 'développ', 'science', 'éducation', 'santé', 'art', 'finance', 'droit', 'médecine', 'ingénieur'];
  const foundDomain = domains.find(d => lowerInput.includes(d));

  if (foundDomain && mentors.length > 0) {
    const filtered = mentors.filter(m =>
      (m.expertise?.toLowerCase() || '').includes(foundDomain) ||
      (m.profession?.toLowerCase() || '').includes(foundDomain)
    );

    if (filtered.length > 0) {
      const list = filtered.map(m => `- **${m.name}** (${m.profession})`).join('\n');
      return {
        text: `Voici nos expertes en ${foundDomain} : 🌟\n\n${list}\n\nVisite leur profil pour en savoir plus et leur envoyer une demande de mentorat ! 💪`,
        action: {
          label: "Voir les mentores",
          type: 'navigate',
          value: '/experts'
        }
      };
    }
  }

  // Fallback final - Ne devrait plus être utilisé avec l'IA activée
  return {
    text: "Je suis en train d'initialiser ma connexion avec mon cerveau IA pour mieux te répondre. 🧠 En attendant, n'hésite pas à explorer nos mentors ou nos ressources !",
    suggestions: [
      "Voir les mentores",
      "Voir les ressources",
      "S'inscrire"
    ]
  };
}
