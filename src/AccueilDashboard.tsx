import React, { useState, useMemo } from 'react';
import { 
  Bell, MapPin, Calendar, BookOpen, 
  MessageCircle, Activity, ChevronRight, Droplet, 
  Baby, Heart, Shield, Plus, Clock, Apple, Home, Menu, X, Phone
} from 'lucide-react';

// --- MOCK DATA ---
const mockData = {
  adolescente: { type: "adolescente", prenom: "Fatoumata", age: 16, localite: "Conakry", phase: "lutéale", joursRegles: 4 },
  jeuneFemme:  { type: "jeuneFemme", prenom: "Aminata",   age: 24, localite: "Kindia", phase: "fertile", joursRegles: 14, probaGrossesse: "Élevée" },
  enceinte:    { type: "enceinte", prenom: "Mariama",   age: 32, localite: "Conakry", semaine: 24, trimestre: 2, dpa: "12 Mai", joursRestants: 112, poids: "65kg" },
  jeuneMere:   { type: "jeuneMere", prenom: "Kadiatou",  age: 28, localite: "Boké", semaine_pp: 6, derniereTetee: "Il y a 2h" },
  adulte:      { type: "adulte", prenom: "Aissatou",  age: 42, localite: "Labé", prochainDepistage: "Mammographie dans 2 mois" }
};

const articlesBase = [
  { id: 1, titre: "L'hygiène intime au quotidien", categorie: "Hygiène", tags: ["soins"], readTime: "3 min" },
  { id: 2, titre: "Bien manger pendant les règles", categorie: "Nutrition", tags: ["alimentation"], readTime: "5 min" },
  { id: 3, titre: "Comprendre les changements de son corps", categorie: "Puberté", tags: ["corps"], readTime: "4 min" },
  { id: 4, titre: "Gérer le stress et l'humeur", categorie: "Bien-être", tags: ["mental"], readTime: "6 min" },
  { id: 5, titre: "Quels moyens de contraception choisir ?", categorie: "Contraception", tags: ["pilule"], readTime: "5 min" },
  { id: 6, titre: "Les premiers signes de grossesse", categorie: "Grossesse", tags: ["symptômes"], readTime: "4 min" },
  { id: 7, titre: "Prévenir les infections sexuellement transmissibles", categorie: "IST", tags: ["sexualite"], readTime: "7 min" },
  { id: 8, titre: "Calculer sa période d'ovulation", categorie: "Fertilite", tags: ["ovulation"], readTime: "3 min" },
  { id: 9, titre: "Alimentation et allaitement", categorie: "Allaitement", tags: ["post-partum"], readTime: "5 min" },
];

const rdvsBase = [
  { id: 1, titre: "Rappel Vaccin HPV", date: "15 Nov", heure: "14:30", categorie: "Prévention", tags: ["santé"] },
  { id: 2, titre: "Consultation Gynécologique", date: "12 Oct", heure: "10:00", categorie: "Gynéco", tags: ["sexualite", "dépistage"] },
];

// --- LOGIQUE DE FILTRAGE ---
const CONTENUS_BLOQUES_MINEURE = [
  "grossesse", "contraception", "fertilite", "ovulation", 
  "post-partum", "allaitement", "ist", "sexualite", "dpa", "gynéco"
];

function filtrerContenu(contenu: any[], estMineure: boolean) {
  if (!estMineure) return contenu;
  return contenu.filter(item => 
    !CONTENUS_BLOQUES_MINEURE.some(mot => {
      const lowerMot = mot.toLowerCase();
      return (item.categorie?.toLowerCase().includes(lowerMot) ||
             item.tags?.some((t: string) => t.toLowerCase().includes(lowerMot)) ||
             item.titre?.toLowerCase().includes(lowerMot));
    })
  );
}

// --- COMPOSANT PRINCIPAL ---
export default function AccueilDashboard() {
  const [profilKey, setProfilKey] = useState<keyof typeof mockData>('adolescente');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const utilisateur = mockData[profilKey];
  const estMineure = utilisateur.age < 18;

  const articlesFiltres = useMemo(() => filtrerContenu(articlesBase, estMineure), [estMineure]);
  const rdvsFiltres = useMemo(() => filtrerContenu(rdvsBase, estMineure), [estMineure]);

  // Menu items config
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'cycle', label: 'Mon Cycle', icon: Calendar },
    { id: 'grossesse', label: 'Grossesse', icon: Baby, blockedForMineure: true },
    { id: 'postpartum', label: 'Post-partum', icon: Heart, blockedForMineure: true },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'bibliotheque', label: 'Bibliothèque', icon: Activity },
    { id: 'assistant', label: 'Assistant IA', icon: MessageCircle },
  ];

  const filteredMenuItems = menuItems.filter(item => !(estMineure && item.blockedForMineure));

  const renderHeroContent = () => {
    if (utilisateur.type === 'adolescente') {
      return (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-white rounded-[16px] p-6 shadow-[0_2px_12px_rgba(217,70,239,0.08)] border border-pink-50">
            <h3 className="text-gray-500 font-medium mb-2">Mon Cycle</h3>
            <div className="flex items-end gap-4 mb-4">
              <span className="text-4xl font-bold text-[#D946EF]">J-{utilisateur.joursRegles}</span>
              <span className="text-gray-600 mb-1">avant les prochaines règles</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-[#F0ABFC]/30 text-[#A855F7] px-4 py-2 rounded-full font-medium">
              <Droplet size={18} />
              Phase {utilisateur.phase}
            </div>
          </div>
          <div className="md:w-1/3 bg-gradient-to-br from-[#D946EF] to-[#A855F7] rounded-[16px] p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={20} className="text-[#FDE68A]" />
              <h3 className="font-bold">Conseil du jour</h3>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">
              N'oublie pas de changer ta protection toutes les 4 à 6 heures pour maintenir une bonne hygiène intime et éviter les inconforts.
            </p>
          </div>
        </div>
      );
    }
    
    if (utilisateur.type === 'jeuneFemme') {
      return (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-white rounded-[16px] p-6 shadow-[0_2px_12px_rgba(217,70,239,0.08)] border border-pink-50">
            <h3 className="text-gray-500 font-medium mb-2">Suivi du Cycle & Fertilité</h3>
            <div className="flex items-end gap-4 mb-4">
              <span className="text-4xl font-bold text-[#D946EF]">J-{utilisateur.joursRegles}</span>
              <span className="text-gray-600 mb-1">avant les règles</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 bg-[#F0ABFC]/30 text-[#A855F7] px-4 py-2 rounded-full font-medium text-sm">
                <Droplet size={16} />
                Phase {utilisateur.phase}
              </div>
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-medium text-sm">
                <Activity size={16} />
                Fenêtre fertile en cours
              </div>
            </div>
          </div>
          <div className="md:w-1/3 bg-gradient-to-br from-[#D946EF] to-[#A855F7] rounded-[16px] p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Heart size={20} className="text-[#FDE68A]" />
              <h3 className="font-bold">Prévention & Santé</h3>
            </div>
            <p className="text-white/90 text-sm leading-relaxed mb-3">
              Probabilité de grossesse : <strong className="text-white">{utilisateur.probaGrossesse}</strong>. 
            </p>
            <p className="text-white/80 text-xs">
              N'oublie pas ta contraception. Le préservatif protège aussi des IST.
            </p>
          </div>
        </div>
      );
    }

    if (utilisateur.type === 'enceinte') {
      return (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-white rounded-[16px] p-6 shadow-[0_2px_12px_rgba(217,70,239,0.08)] border border-pink-50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-gray-500 font-medium mb-1">Évolution de la grossesse</h3>
                <div className="text-3xl font-bold text-[#D946EF]">Semaine {utilisateur.semaine}</div>
                <div className="text-sm text-gray-500">Trimestre {utilisateur.trimestre}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">DPA: {utilisateur.dpa}</div>
                <div className="text-sm font-medium text-[#A855F7]">{utilisateur.joursRestants} jours restants</div>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
              <div className="bg-gradient-to-r from-[#D946EF] to-[#A855F7] h-3 rounded-full" style={{ width: `${(utilisateur.semaine / 40) * 100}%` }}></div>
            </div>
            <div className="text-xs text-gray-400 text-right">~{Math.round((utilisateur.semaine / 40) * 100)}% accompli</div>
          </div>
          <div className="md:w-1/3 bg-[#A855F7] rounded-[16px] p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Baby size={20} className="text-[#FDE68A]" />
              <h3 className="font-bold">Taille du bébé</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Apple size={32} className="text-[#FDE68A]" />
              </div>
              <div>
                <p className="text-white font-medium">La taille d'une belle mangue !</p>
                <p className="text-white/80 text-xs mt-1">Environ 30 cm pour 600g.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (utilisateur.type === 'jeuneMere') {
      return (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-white rounded-[16px] p-6 shadow-[0_2px_12px_rgba(217,70,239,0.08)] border border-pink-50">
            <h3 className="text-gray-500 font-medium mb-2">Post-partum</h3>
            <div className="flex items-end gap-4 mb-4">
              <span className="text-4xl font-bold text-[#D946EF]">Semaine {utilisateur.semaine_pp}</span>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Récupération physique</span>
                <span className="text-[#A855F7] font-medium">80%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-[#A855F7] h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
          <div className="md:w-1/3 bg-gradient-to-br from-[#D946EF] to-[#A855F7] rounded-[16px] p-6 text-white shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={20} className="text-[#FDE68A]" />
                <h3 className="font-bold">Suivi Allaitement</h3>
              </div>
              <p className="text-white/90 text-sm">Dernière tétée : <strong>{utilisateur.derniereTetee}</strong></p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-white/90 text-xs">
                <Shield size={14} className="inline mr-1" />
                Rappel : N'oubliez pas le point contraception avec votre sage-femme.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (utilisateur.type === 'adulte') {
      return (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-white rounded-[16px] p-6 shadow-[0_2px_12px_rgba(217,70,239,0.08)] border border-pink-50">
            <h3 className="text-gray-500 font-medium mb-2">Santé & Prévention</h3>
            <div className="flex items-center gap-4 mt-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">Prochain dépistage</p>
                <p className="text-[#D946EF] font-medium">{utilisateur.prochainDepistage}</p>
              </div>
            </div>
          </div>
          <div className="md:w-1/3 bg-gradient-to-br from-[#D946EF] to-[#A855F7] rounded-[16px] p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={20} className="text-[#FDE68A]" />
              <h3 className="font-bold">Article recommandé</h3>
            </div>
            <p className="text-white/90 text-sm leading-relaxed mb-3">
              <strong>Ménopause :</strong> Comprendre les changements hormonaux et préserver sa vitalité.
            </p>
            <button className="text-xs bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-full text-white font-medium">
              Lire l'article
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-['Nunito',sans-serif] flex overflow-hidden">
      {/* Sidebar Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-72 bg-white border-r border-gray-100 z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D946EF] to-[#A855F7] flex items-center justify-center">
              <Heart className="text-white" size={18} />
            </div>
            <span className="font-bold text-xl text-gray-800">FemSanté<span className="text-[#D946EF]">GN</span></span>
          </div>
          <button className="md:hidden text-gray-500 hover:bg-gray-100 p-1 rounded" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {filteredMenuItems.map(item => (
            <button 
              key={item.id}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${item.id === 'dashboard' ? 'bg-[#F0ABFC]/20 text-[#D946EF] font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-[#A855F7]'}`}
            >
              <item.icon size={20} className={item.id === 'dashboard' ? 'text-[#D946EF]' : 'text-gray-400'} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 m-4 bg-pink-50 rounded-2xl border border-pink-100">
          <div className="flex items-center gap-2 text-[#D946EF] font-semibold mb-2">
            <Phone size={18} />
            Support Médical
          </div>
          <p className="text-xs text-gray-600 mb-3">Contactez un spécialiste 24/7 de manière confidentielle.</p>
          <button className="w-full py-2 bg-white text-[#A855F7] text-sm font-bold rounded-xl shadow-sm border border-purple-100 hover:bg-purple-50 transition-colors">
            Appeler
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Dev Profile Selector */}
        <div className="bg-slate-800 p-2 text-xs flex flex-wrap justify-center items-center gap-2 z-50">
          <span className="text-slate-300 py-1 px-2 font-bold uppercase tracking-wider">Dev Mode (Test Profils) :</span>
          {(Object.keys(mockData) as Array<keyof typeof mockData>).map(key => (
            <button
              key={key}
              onClick={() => setProfilKey(key)}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors ${profilKey === key ? 'bg-[#D946EF] text-white shadow-sm' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Bonjour, {utilisateur.prenom} <span className="inline-block animate-wave text-2xl">👋</span>
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin size={14} className="text-gray-400" /> {utilisateur.localite} • {utilisateur.age} ans
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#D946EF] rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F0ABFC] to-[#D946EF] shadow-sm flex items-center justify-center text-white font-bold text-lg">
              {utilisateur.prenom.charAt(0)}
            </div>
          </div>
        </header>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          
          {/* Hero Card */}
          <section className="transition-all duration-300">
            {renderHeroContent()}
          </section>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            
            {/* Colonne 1 */}
            <div className="space-y-6">
              {/* Widget Dynamique (Suivi/Développement) */}
              <div className="bg-white rounded-[16px] p-6 shadow-[0_2px_12px_rgba(217,70,239,0.08)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 text-lg">
                    {estMineure ? 'Suivi de santé quotidien' : 'Tableau de bord vital'}
                  </h3>
                  <button className="text-[#D946EF] hover:bg-pink-50 p-2 rounded-full transition-colors">
                    <Plus size={20} />
                  </button>
                </div>
                {estMineure ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center"><Droplet size={18}/></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Flux menstruel</p>
                          <p className="text-xs text-gray-500">Moyen aujourd'hui</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 text-[#A855F7] rounded-full flex items-center justify-center"><Activity size={18}/></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Humeur & Symptômes</p>
                          <p className="text-xs text-gray-500">Légères crampes notées</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-400" />
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-purple-50 rounded-xl border border-purple-100 text-center">
                    <Activity className="mx-auto text-[#A855F7] mb-3" size={28} />
                    <p className="text-sm text-gray-700 font-medium">Vos indicateurs de santé sont stables.</p>
                    <p className="text-xs text-gray-500 mt-1">Poursuivez vos bonnes habitudes !</p>
                  </div>
                )}
              </div>

              {/* Widget Prochains RDV */}
              <div className="bg-white rounded-[16px] p-6 shadow-[0_2px_12px_rgba(217,70,239,0.08)]">
                <h3 className="font-bold text-gray-800 text-lg mb-4">Prochains Rendez-vous</h3>
                {rdvsFiltres.length > 0 ? (
                  <div className="space-y-3">
                    {rdvsFiltres.map(rdv => (
                      <div key={rdv.id} className="flex gap-4 p-3 border border-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
                        <div className="w-14 bg-pink-50 rounded-lg flex flex-col items-center justify-center text-[#D946EF]">
                          <span className="text-xs font-bold uppercase">{rdv.date.split(' ')[1]}</span>
                          <span className="text-lg font-black">{rdv.date.split(' ')[0]}</span>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <p className="font-semibold text-gray-800 text-sm">{rdv.titre}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Clock size={12}/> {rdv.heure} • {rdv.categorie}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-sm text-gray-500 italic">Aucun rendez-vous prévu prochainement.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne 2 */}
            <div className="space-y-6">
              {/* Widget Bibliothèque */}
              <div className="bg-white rounded-[16px] p-6 shadow-[0_2px_12px_rgba(217,70,239,0.08)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 text-lg">Pour vous aujourd'hui</h3>
                  <button className="text-sm font-semibold text-[#D946EF] hover:text-[#A855F7] transition-colors">Voir tout</button>
                </div>
                <div className="space-y-4">
                  {articlesFiltres.slice(0, 3).map(article => (
                    <div key={article.id} className="group cursor-pointer flex gap-4 items-center p-2 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#F0ABFC]/40 to-purple-100 flex-shrink-0 flex items-center justify-center">
                        <BookOpen className="text-[#A855F7] group-hover:scale-110 transition-transform" size={20} />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-bold tracking-wider text-[#A855F7] uppercase bg-purple-50 px-2 py-0.5 rounded-md">{article.categorie}</span>
                        <h4 className="font-semibold text-gray-800 mt-1 mb-1 text-sm group-hover:text-[#D946EF] transition-colors leading-tight">{article.titre}</h4>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} /> {article.readTime} de lecture</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Widget Assistant IA / Journal */}
              <div className="bg-gradient-to-r from-[#D946EF] to-[#A855F7] rounded-[16px] p-6 text-white shadow-[0_4px_20px_rgba(217,70,239,0.3)] relative overflow-hidden group cursor-pointer hover:shadow-[0_6px_25px_rgba(217,70,239,0.4)] transition-shadow">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl group-hover:opacity-20 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <MessageCircle size={24} />
                    </div>
                    <h3 className="font-bold text-lg">Une question ?</h3>
                  </div>
                  <p className="text-white/90 text-sm mb-5 leading-relaxed">
                    Notre assistante IA est là pour vous répondre en toute confidentialité.{' '}
                    {estMineure ? 'Pose-lui tes questions sur la puberté, les règles ou l\'hygiène.' : 'Posez-lui vos questions sur votre santé, cycle ou maternité.'}
                  </p>
                  <button className="w-full bg-white text-[#A855F7] font-bold py-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <MessageCircle size={18} />
                    Démarrer le chat
                  </button>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          50% { transform: rotate(10deg); }
          75% { transform: rotate(-15deg); }
        }
        .animate-wave {
          transform-origin: 70% 70%;
          animation: wave 2.5s infinite ease-in-out;
        }
      `}} />
    </div>
  );
}
