import React from 'react';

interface TermsOfServiceProps {
  onNavigate: (page: string) => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onNavigate }) => {
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

        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4">Conditions Générales d'Utilisation</h1>
        
        <div className="prose prose-purple max-w-none text-gray-600 space-y-6">
          <p className="text-lg">
            En vigueur le : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. Objet</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) encadrent l'accès et l'utilisation de la plateforme Voix D'avenir, 
              un service de mentorat dédié à l'autonomisation des femmes guinéennes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. Inscription et Compte</h2>
            <p>
              L'accès à certaines fonctionnalités nécessite la création d'un compte. Vous vous engagez à fournir des informations 
              exactes et à maintenir la confidentialité de vos identifiants. Vous êtes responsable de toute activité sur votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Code de conduite</h2>
            <p>Les utilisatrices de la plateforme s'engagent à :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Agir avec respect et professionnalisme envers les autres membres.</li>
              <li>Ne pas publier de contenu illicite, offensant ou discriminatoire.</li>
              <li>Respecter la confidentialité des échanges lors des sessions de mentorat.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. Propriété Intellectuelle</h2>
            <p>
              Tous les contenus présents sur le site (logos, textes, graphismes) sont la propriété exclusive de Voix D'avenir 
              ou de ses partenaires. Toute reproduction sans autorisation est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">5. Responsabilité</h2>
            <p>
              Voix D'avenir met en relation des mentorées et des expertes mais ne saurait être tenue responsable des conseils prodigués 
              ou du déroulement des interactions privées. Nous nous efforçons d'assurer la disponibilité du service mais ne garantissons pas 
              une absence d'interruptions techniques.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">6. Modification des termes</h2>
            <p>
              Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications prendront effet dès leur publication sur le site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">7. Droit applicable</h2>
            <p>
              Les présentes conditions sont régies par le droit en vigueur en République de Guinée.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
