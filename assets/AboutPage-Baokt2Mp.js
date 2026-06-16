import{c as d,r,A as c,j as e,H as m}from"./index-CD4FhBAT.js";import{A as x}from"./award-COhC5-ao.js";import{U as u}from"./users-BQNbN2gn.js";/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=d("Target",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]),y=({onNavigate:l})=>{const[a,i]=r.useState({totalUsers:0,totalMentores:0,citiesCovered:0,completedSessions:0}),[t,n]=r.useState(!0);r.useEffect(()=>{o()},[]);const o=async()=>{try{const s=await c.get("/users/stats");i({totalUsers:s.data.totalUsers||0,totalMentores:s.data.totalMentores||0,citiesCovered:s.data.citiesCovered||0,completedSessions:s.data.completedSessions||0})}catch(s){console.error("Erreur chargement statistiques:",s)}finally{n(!1)}};return e.jsxs("div",{className:"min-h-screen bg-gray-50 pt-20",children:[e.jsx("style",{children:`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-700 {
          animation-delay: 0.7s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-1200 {
          animation-delay: 1.2s;
        }
      `}),e.jsxs("div",{className:"container mx-auto px-4 py-8",children:[e.jsxs("div",{className:"text-center mb-12 animate-fade-in",children:[e.jsx("h1",{className:"text-4xl font-bold text-gray-800 mb-4 animate-slide-up",children:"À Propos de Voix D'avenir"}),e.jsx("p",{className:"text-lg text-gray-600 max-w-3xl mx-auto animate-slide-up delay-200",children:"Une plateforme dédiée à l'autonomisation des femmes guinéennes à travers le mentorat et l'accompagnement professionnel."})]}),e.jsxs("div",{className:"bg-white rounded-xl shadow-lg p-8 mb-8 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up delay-300",children:[e.jsxs("div",{className:"flex items-center mb-6",children:[e.jsx(p,{className:"w-8 h-8 text-purple-600 mr-4 animate-bounce"}),e.jsx("h2",{className:"text-2xl font-bold text-gray-800",children:"Notre Mission"})]}),e.jsx("p",{className:"text-gray-600 leading-relaxed",children:"Voix D'avenir a pour mission de connecter les jeunes femmes guinéennes avec des mentores expérimentées pour favoriser leur développement personnel et professionnel. Nous croyons au pouvoir du mentorat pour transformer des vies et construire un avenir meilleur pour la Guinée."})]}),e.jsxs("div",{className:"bg-white rounded-xl shadow-lg p-8 mb-8 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up delay-500",children:[e.jsxs("div",{className:"flex items-center mb-6",children:[e.jsx(m,{className:"w-8 h-8 text-pink-600 mr-4 animate-pulse"}),e.jsx("h2",{className:"text-2xl font-bold text-gray-800",children:"Notre Vision"})]}),e.jsx("p",{className:"text-gray-600 leading-relaxed",children:"Devenir la plateforme de référence pour l'autonomisation des femmes en Guinée, en créant un écosystème où chaque femme peut accéder aux ressources, aux conseils et au soutien nécessaires pour réaliser son plein potentiel avec Voix D'avenir."})]}),e.jsxs("div",{className:"bg-white rounded-xl shadow-lg p-8 mb-8 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up delay-700",children:[e.jsxs("div",{className:"flex items-center mb-6",children:[e.jsx(x,{className:"w-8 h-8 text-green-600 mr-4 animate-spin-slow"}),e.jsx("h2",{className:"text-2xl font-bold text-gray-800",children:"Nos Valeurs"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{className:"hover:bg-gray-50 p-4 rounded-lg transition-colors duration-300",children:[e.jsx("h3",{className:"font-semibold text-gray-800 mb-2",children:"Solidarité"}),e.jsx("p",{className:"text-gray-600 text-sm",children:"Nous croyons en la force de l'entraide entre femmes."})]}),e.jsxs("div",{className:"hover:bg-gray-50 p-4 rounded-lg transition-colors duration-300",children:[e.jsx("h3",{className:"font-semibold text-gray-800 mb-2",children:"Excellence"}),e.jsx("p",{className:"text-gray-600 text-sm",children:"Nous visons l'excellence dans tout ce que nous faisons."})]}),e.jsxs("div",{className:"hover:bg-gray-50 p-4 rounded-lg transition-colors duration-300",children:[e.jsx("h3",{className:"font-semibold text-gray-800 mb-2",children:"Inclusion"}),e.jsx("p",{className:"text-gray-600 text-sm",children:"Nous accueillons toutes les femmes, peu importe leur origine."})]}),e.jsxs("div",{className:"hover:bg-gray-50 p-4 rounded-lg transition-colors duration-300",children:[e.jsx("h3",{className:"font-semibold text-gray-800 mb-2",children:"Innovation"}),e.jsx("p",{className:"text-gray-600 text-sm",children:"Nous utilisons la technologie pour créer des solutions modernes."})]})]})]}),e.jsxs("div",{className:"bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 text-white mb-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slide-up delay-1000",children:[e.jsxs("div",{className:"flex items-center mb-6",children:[e.jsx(u,{className:"w-8 h-8 mr-4 animate-bounce"}),e.jsx("h2",{className:"text-2xl font-bold",children:"Notre Impact"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"text-3xl font-bold mb-2",children:t?e.jsx("div",{className:"w-16 h-8 bg-white bg-opacity-20 rounded animate-pulse mx-auto"}):`${a.totalUsers}+`}),e.jsx("div",{className:"text-purple-100",children:"Utilisatrices inscrites"})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"text-3xl font-bold mb-2",children:t?e.jsx("div",{className:"w-16 h-8 bg-white bg-opacity-20 rounded animate-pulse mx-auto"}):`${a.totalMentores}+`}),e.jsx("div",{className:"text-purple-100",children:"Mentores actives"})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"text-3xl font-bold mb-2",children:t?e.jsx("div",{className:"w-8 h-8 bg-white bg-opacity-20 rounded animate-pulse mx-auto"}):a.citiesCovered}),e.jsx("div",{className:"text-purple-100",children:"Villes couvertes"})]})]})]}),e.jsxs("div",{className:"text-center animate-slide-up delay-1200",children:[e.jsx("h3",{className:"text-2xl font-bold text-gray-800 mb-4",children:"Rejoignez Notre Communauté"}),e.jsx("p",{className:"text-gray-600 mb-6",children:"Que vous souhaitiez être mentorée ou devenir mentore, nous avons une place pour vous."}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-4 justify-center",children:[e.jsx("button",{onClick:()=>l("register"),className:"px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg",children:"Devenir Mentorée"}),e.jsx("button",{onClick:()=>l("register"),className:"px-8 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg",children:"Devenir Mentore"})]})]})]})]})};export{y as default};
