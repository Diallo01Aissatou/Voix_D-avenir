import React from 'react';

interface PrivacyPolicyProps {
  onNavigate: (page: string) => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => onNavigate('home')}
          className="mb-8 text-purple-600 hover:text-purple-800 font-medium flex items-center transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à l'accueil
        </button>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4">Politique de Confidentialité</h1>
        
        <div className="prose prose-purple max-w-none text-gray-600 space-y-6">
          <p className="text-lg">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. Introduction</h2>
            <p>
              Voix D'avenir ("nous", "notre") s'engage à protéger la vie privée des utilisatrices de sa plateforme de mentorat. 
              Cette politique explique comment nous collectons, utilisons et protégeons vos informations personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. Informations que nous collectons</h2>
            <p>Nous collectons les informations suivantes lorsque vous utilisez notre plateforme :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Informations d'inscription :</strong> Nom, adresse e-mail, photo de profil, ville, âge.</li>
              <li><strong>Informations de profil :</strong> Profession, domaine d'expertise, intérêts, biographie.</li>
              <li><strong>Données de connexion sociale :</strong> Si vous choisissez de vous connecter via Google, TikTok ou LinkedIn, nous recevons votre identifiant unique et des informations de profil public (nom, photo).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Utilisation de vos données</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Créer et gérer votre compte utilisateur.</li>
              <li>Faciliter les connexions de mentorat entre mentorées et expertes.</li>
              <li>Vous envoyer des notifications importantes concernant vos sessions et messages.</li>
              <li>Améliorer l'expérience utilisateur et les fonctionnalités de la plateforme.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. Partage des données</h2>
            <p>
              Nous ne vendons jamais vos données personnelles. Vos informations de profil (nom, expertise, bio) sont visibles 
              par les autres membres connectés de la plateforme pour faciliter le mentorat. 
              Nous pouvons partager des données avec des fournisseurs de services tiers (comme l'hébergement) uniquement pour le bon fonctionnement du site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">5. Vos droits</h2>
            <p>
              Conformément aux lois sur la protection des données, vous avez le droit d'accéder à vos données, de les rectifier ou de demander leur suppression. 
              Vous pouvez gérer vos informations depuis votre tableau de bord ou nous contacter directement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">6. Sécurité</h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données contre tout accès non autorisé.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">7. Contact</h2>
            <p>
              Pour toute question concernant cette politique, contactez-nous à : <span className="font-semibold text-purple-600">contact@voixdavenir.gn</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
