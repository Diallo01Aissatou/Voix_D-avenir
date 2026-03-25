import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Eye, EyeOff, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'mentoree' | 'mentore';
  age: string;
  city: string;
  education: string;
  profession: string;
  expertise: string;
  interests: string;
  bio: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  age?: string;
  city?: string;
}

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'mentoree',
    age: '',
    city: '',
    education: '',
    profession: '',
    expertise: '',
    interests: '',
    bio: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const cities: string[] = [...new Set([
    'Beyla', 'Boffa', 'Boké', 'Coléah', 'Conakry', 'Coyah', 'Dabola', 'Dalaba',
    'Dinguiraye', 'Dubreka', 'Faranah', 'Forcécariah', 'Fria', 'Gaoual', 'Guéckédou',
    'Kankan', 'Kérouane', 'Kindia', 'Kissidougou', 'Koubia', 'Koundara', 'Kouroussa',
    'Labé', 'Lélouma', 'Lola', 'Macenta', 'Mali', 'Mamou', 'Mandiana', 'N\'Zérékoré',
    'Pita', 'Siguiri', 'Télimélé', 'Tougue', 'Yomou',
    'Baro', 'Benti', 'Bignamou', 'Bintimodia', 'Bissikrima', 'Bomboli', 'Boussou',
    'Dabiss', 'Damaro', 'Diari', 'Diecke', 'Diountou', 'Ditinn', 'Doko', 'Donghol-Touma',
    'Douprou', 'Forécariah', 'Foulamory', 'Friguiagbé', 'Gadha-Woundou', 'Ganta',
    'Gbangbadou', 'Gberedou-Baranama', 'Gbessoba', 'Gouécké', 'Hafia', 'Hérico',
    'Kamsar', 'Kania', 'Kassa', 'Koba', 'Kolangui', 'Kolda', 'Kondétou', 'Konia',
    'Koumbia', 'Kouremalé', 'Koyamah', 'Kpéléyah', 'Lansanaya', 'Lelouma', 'Linsan',
    'Loguéya', 'Madina-Oula', 'Maférinyah', 'Malapouya', 'Mambia', 'Mandiana',
    'Matakang', 'Matoto', 'Médina-Gounass', 'Morodou', 'Moussaya', 'Nafadji',
    'Niagassola', 'Norasoba', 'Ouende-Kénéma', 'Ouré-Kaba', 'Pamalap', 'Popodara',
    'Ratoma', 'Sagalé', 'Sambailo', 'Sangarédi', 'Saramoussaya', 'Sérédou',
    'Singuéléya', 'Sokotoro', 'Soumba', 'Tabounsou', 'Tanéné', 'Tolo', 'Tondon',
    'Tougnifili', 'Wendou-Bosséya', 'Wonkifong', 'Yalenzou', 'Yembéring', 'Youkounkoun'
  ])].sort();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    if (!formData.email.includes('@')) newErrors.email = 'Email invalide';
    if (formData.password.length < 6) newErrors.password = 'Min. 6 caractères';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    if (!formData.city) newErrors.city = 'La ville est requise';
    if (formData.role === 'mentoree' && !formData.age) newErrors.age = 'Âge requis';
    if (formData.role === 'mentoree' && formData.age && parseInt(formData.age) < 13) newErrors.age = 'Âge minimum 13 ans';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setIsSuccess(false);

    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const expertiseArray = formData.expertise
        ? formData.expertise.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const interestsArray = formData.interests
        ? formData.interests.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      fd.append('password', formData.password);
      fd.append('role', formData.role);

      if (formData.age) fd.append('age', String(parseInt(formData.age, 10)));
      if (formData.city) fd.append('city', formData.city);
      if (formData.education) fd.append('level', formData.education);
      if (formData.profession) fd.append('profession', formData.profession);

      if (expertiseArray.length) fd.append('expertise', expertiseArray.join(', '));
      if (interestsArray.length) fd.append('interests', interestsArray.join(', '));

      if (formData.bio) fd.append('bio', formData.bio);
      if (photoFile) fd.append('photo', photoFile);

      const success = await register(fd);

      if (success) {
        setMessage('Inscription réussie ! Redirection vers votre tableau de bord...');
        setIsSuccess(true);
      } else {
        setMessage("Une erreur est survenue lors de l'inscription.");
        setIsSuccess(false);
      }

    } catch (err: any) {
      const apiMessage = err?.response?.data?.message || "Erreur d'inscription. Veuillez réessayer.";
      setMessage(apiMessage);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [e.target.name]: undefined
      });
    }
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Voix D'avenir Logo" className="h-16 w-auto" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Créer un Compte</h1>
            <p className="text-gray-600">Rejoignez la communauté Voix D'avenir</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {message && (
              <div
                className={`py-3 px-6 rounded-lg mb-6 text-center text-white font-semibold transition-all duration-300 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}
              >
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Je souhaite devenir
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'mentoree' })}
                    className={`p-4 rounded-lg border-2 transition-all ${formData.role === 'mentoree'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300'
                      }`}
                  >
                    <div className="font-semibold">Mentorée</div>
                    <div className="text-sm text-gray-600">Être accompagnée</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'mentore' })}
                    className={`p-4 rounded-lg border-2 transition-all ${formData.role === 'mentore'
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-gray-200 hover:border-pink-300'
                      }`}
                  >
                    <div className="font-semibold">Mentore</div>
                    <div className="text-sm text-gray-600">Accompagner</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Votre nom complet"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 6 caractères"
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Répétez le mot de passe"
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.role === 'mentoree' && (
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                      Âge *
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age}
                      min="13"
                      max="25"
                      onChange={handleChange}
                      placeholder="Votre âge"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${errors.age ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                  </div>
                )}

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Sélectionnez votre ville</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.role === 'mentoree' && (
                  <div>
                    <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">
                      Niveau d'éducation
                    </label>
                    <select
                      id="education"
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionnez votre niveau</option>
                      <option value="Collège">Collège</option>
                      <option value="Lycée">Lycée</option>
                      <option value="Université">Université</option>
                      <option value="Master">Master</option>
                    </select>
                  </div>
                )}

                {formData.role === 'mentore' && (
                  <div>
                    <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-2">
                      Profession
                    </label>
                    <input
                      type="text"
                      id="profession"
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      placeholder="Votre profession"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                )}
              </div>

              {formData.role === 'mentore' && (
                <div>
                  <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-2">
                    Domaines d'expertise
                  </label>
                  <input
                    type="text"
                    id="expertise"
                    name="expertise"
                    value={formData.expertise}
                    onChange={handleChange}
                    placeholder="Ex: Développement web, Marketing, Finance... (séparés par des virgules)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              )}

              {formData.role === 'mentoree' && (
                <div>
                  <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
                    Centres d'intérêt
                  </label>
                  <input
                    type="text"
                    id="interests"
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    placeholder="Ex: Technologie, Entrepreneuriat, Art... (séparés par des virgules)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              )}

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Biographie
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Parlez-nous de vous..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo de profil
                </label>
                <div className="flex items-center space-x-4">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Aperçu"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      id="photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="photo"
                      className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                    >
                      Choisir une photo
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
                  }`}
              >
                {isLoading ? 'Inscription en cours...' : 'Créer mon compte'}
              </button>

              <div className="text-center">
                <p className="text-gray-600">
                  Déjà un compte ?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                  >
                    Se connecter
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
