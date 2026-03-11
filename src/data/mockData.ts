import { User, MentorshipRequest, Resource, ExpertWoman, Event, Opportunity } from '../types';

export  const mockUsers: User[] = [
  {
    id: '1',
    name: 'Aminata Konaté',
    email: 'aminata@email.com',
    role: 'mentoree',
    age: 19,
    city: 'Conakry',
    education: 'Université',
    interests: ['Technologie', 'Entrepreneuriat', 'Sciences'],
    bio: 'Étudiante passionnée de technologie, je souhaite devenir développeuse web.'
  },
  {
    id: '2',
    name: 'Dr. Fatoumata Bah',
    email: 'fatoumata@email.com',
    role: 'mentore',
    profession: 'Médecin Chirurgien',
    city: 'Conakry',
    expertise: ['Médecine', 'Chirurgie', 'Formation'],
    bio: 'Médecin avec 15 ans d\'expérience, je souhaite accompagner la nouvelle génération.'
  },
  {
    id: '3',
    name: 'Mariama Diallo',
    email: 'mariama@email.com',
    role: 'mentore',
    profession: 'Directrice Marketing',
    city: 'Labé',
    expertise: ['Marketing', 'Communication', 'Leadership'],
    bio: 'Experte en marketing digital, passionnée par l\'accompagnement des jeunes talents.'
  }
];

export const mockMentorshipRequests: MentorshipRequest[] = [
  {
    id: '1',
    mentoreeId: '1',
    mentoreId: '2',
    status: 'pending',
    message: 'Bonjour Dr. Bah, je suis très intéressée par votre parcours en médecine...',
    createdAt: '2024-01-15',
    mentoree: mockUsers[0],
    mentore: mockUsers[1]
  }
];

export const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Guide de Rédaction CV Professionnel',
    description: 'Apprenez à rédiger un CV qui attire l\'attention des recruteurs',
    type: 'pdf',
    category: 'Carrière',
    url: '/resources/cv-guide.pdf',
    downloadCount: 245
  },
  {
    id: '2',
    title: 'Femmes Leaders en Guinée - Documentaire',
    description: 'Découvrez le parcours inspirant de femmes guinéennes exceptionnelles',
    type: 'video',
    category: 'Inspiration',
    url: 'https://example.com/video',
    downloadCount: 189
  },
  {
    id: '3',
    title: 'Guide des Bourses d\'Études 2024',
    description: 'Toutes les opportunités de bourses disponibles pour les étudiantes',
    type: 'pdf',
    category: 'Éducation',
    url: '/resources/scholarships-guide.pdf',
    downloadCount: 356
  }
];

export const mockExpertWomen: ExpertWoman[] = [
  {
    id: '1',
    name: 'Hadja Idrissa Chernor Bah',
    profession: 'Ministre de l\'Enseignement Supérieur',
    company: 'Gouvernement de la Guinée',
    domain: 'Politique & Éducation',
    bio: 'Première femme ministre de l\'Enseignement Supérieur en Guinée, elle a révolutionné le système éducatif guinéen.',
    achievements: [
      'Réforme du système universitaire',
      'Augmentation de 40% des inscriptions féminines',
      'Création de 5 nouvelles universités'
    ],
    quote: 'L\'éducation des filles est la clé du développement de notre nation.',
    image: 'https://images.pexels.com/photos/3760607/pexels-photo-3760607.jpeg',
    isFeatured: true
  },
  {
    id: '2',
    name: 'Dr. Mariama Dalanda Diallo',
    profession: 'Directrice Générale',
    company: 'OMS Afrique de l\'Ouest',
    domain: 'Santé Publique',
    bio: 'Experte en santé publique avec plus de 20 ans d\'expérience dans la lutte contre les épidémies.',
    achievements: [
      'Coordination de la lutte contre Ebola',
      'Programmes de vaccination en Afrique de l\'Ouest',
      'Formation de 1000+ professionnels de santé'
    ],
    quote: 'La santé est un droit fondamental, et nous devons nous battre pour tous.',
    image: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg'
  },
  {
    id: '3',
    name: 'Aminata Touré',
    profession: 'CEO & Fondatrice',
    company: 'TechAfrika Solutions',
    domain: 'Technologie & Innovation',
    bio: 'Pionnière de la tech en Guinée, elle a créé la première plateforme de paiement mobile du pays.',
    achievements: [
      'Première femme CEO tech en Guinée',
      'Levée de fonds de 2M$ pour sa startup',
      '50,000+ utilisateurs de sa plateforme'
    ],
    quote: 'La technologie peut transformer l\'Afrique, et les femmes y joueront un rôle majeur.',
    image: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg'
  }
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Webinaire: Leadership Féminin en Afrique',
    description: 'Découvrez les stratégies de leadership adoptées par les femmes leaders africaines',
    date: '2024-02-15',
    time: '14:00',
    type: 'webinar',
    speaker: 'Panel d\'expertes',
    registrationUrl: '#',
    image: 'https://images.pexels.com/photos/7688460/pexels-photo-7688460.jpeg'
  },
  {
    id: '2',
    title: 'Atelier: Création d\'Entreprise pour Jeunes Femmes',
    description: 'Workshop pratique sur l\'entrepreneuriat féminin et les étapes de création d\'entreprise',
    date: '2024-02-20',
    time: '09:00',
    type: 'workshop',
    speaker: 'Aminata Touré',
    registrationUrl: '#',
    image: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg'
  }
];

export const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Stage en Développement Web - Orange Guinée',
    description: 'Opportunité de stage de 6 mois dans l\'équipe développement d\'Orange Guinée',
    type: 'internship',
    deadline: '2024-03-01',
    organization: 'Orange Guinée',
    applyUrl: '#',
    requirements: [
      'Étudiante en informatique',
      'Connaissances HTML/CSS/JavaScript',
      'Disponibilité 6 mois'
    ]
  },
  {
    id: '2',
    title: 'Bourse Excellence Académique 2024',
    description: 'Bourse complète pour études supérieures en Europe pour étudiantes guinéennes méritantes',
    type: 'scholarship',
    deadline: '2024-04-15',
    organization: 'Fondation Education Guinée',
    applyUrl: '#',
    requirements: [
      'Moyenne générale > 15/20',
      'Projet d\'études défini',
      'Engagement communautaire'
    ]
  }
];

export const mockStats = {
  totalMentorships: 1247,
  activeMentores: 156,
  citiesCovered: 12,
  partnerships: 8,
  successStories: 89,
  totalUsers: 2341
}