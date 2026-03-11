import React, { useState, useEffect } from 'react';
import { Star, Plus, Edit, Trash2, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Testimonial {
  _id: string;
  author: {
    _id: string;
    name: string;
    photo?: string;
    profession?: string;
  };
  content: string;
  rating: number;
  createdAt: string;
}

const TestimonialManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    rating: 5
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.role === 'mentoree') {
      loadMyTestimonials();
    }
  }, [currentUser]);

  // Vérifier si l'utilisateur est une mentorée
  if (currentUser?.role !== 'mentoree') {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-600 mb-2">Accès Restreint</p>
        <p className="text-sm text-gray-500">Seules les mentorées peuvent créer et gérer des témoignages.</p>
      </div>
    );
  }

  const loadMyTestimonials = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/testimonials/my', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      }
    } catch (error) {
      console.error('Erreur chargement témoignages:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      alert('Veuillez saisir votre témoignage');
      return;
    }

    setLoading(true);
    try {
      const url = editingTestimonial 
        ? `http://localhost:5001/api/testimonials/${editingTestimonial._id}`
        : 'http://localhost:5001/api/testimonials';
      
      const method = editingTestimonial ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingTestimonial ? 'Témoignage modifié!' : 'Témoignage ajouté!');
        setShowModal(false);
        setEditingTestimonial(null);
        setFormData({ content: '', rating: 5 });
        loadMyTestimonials();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.message}`);
      }
    } catch (error) {
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      content: testimonial.content,
      rating: testimonial.rating
    });
    setShowModal(true);
  };

  const handleDelete = async (testimonialId: string) => {
    if (!confirm('Supprimer ce témoignage ?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/testimonials/${testimonialId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Témoignage supprimé!');
        loadMyTestimonials();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      alert('Erreur de connexion');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Mes Témoignages</h3>
          <p className="text-sm text-gray-600 mt-1">Partagez votre expérience pour inspirer d'autres mentorées</p>
        </div>
        <button
          onClick={() => {
            setEditingTestimonial(null);
            setFormData({ content: '', rating: 5 });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un témoignage
        </button>
      </div>

      {testimonials.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Aucun témoignage</p>
          <p className="text-sm mb-4">Partagez votre expérience de mentorat pour inspirer d'autres jeunes femmes</p>
          <p className="text-xs text-purple-600 bg-purple-50 px-4 py-2 rounded-lg inline-block">
            💡 Vos témoignages apparaîtront automatiquement sur la page d'accueil
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <div key={testimonial._id} className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {renderStars(testimonial.rating)}
                  <span className="text-sm text-gray-500">
                    {new Date(testimonial.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-700">{testimonial.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editingTestimonial ? 'Modifier le témoignage' : 'Ajouter un témoignage'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <div className="flex space-x-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: i + 1 })}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${i < formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Témoignage</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Partagez votre expérience de mentorat..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Sauvegarde...' : editingTestimonial ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialManager;