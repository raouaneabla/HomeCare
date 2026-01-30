import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PrestataireDashboard.css';
import { getToken, logout } from '../auth';

function PrestataireDashboard() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Champs formulaire
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null); // Pour la suppression

  const token = getToken();
  const navigate = useNavigate();

  // ------------------- Récupération profil -------------------
  const fetchProfile = () => {
    if (!token) return;
    setLoading(true);

    fetch('http://localhost:8000/api/prestataire/profile/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setBio(data.bio || '');
        setCity(data.city || '');
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  // ------------------- Déconnexion -------------------
  const handleLogout = () => {
    logout(); // supprime token & currentUser
    navigate('/login'); // redirige vers login
  };

  // ------------------- Soumission formulaire -------------------
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('bio', bio);
    formData.append('city', city);
    if (profilePhoto) formData.append('profile_photo', profilePhoto);
    images.forEach(img => formData.append('images', img));

    try {
      const response = await fetch('http://localhost:8000/api/prestataire/profile/', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        console.error(errData);
        alert('Erreur lors de la sauvegarde');
        return;
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setEditing(false);
      setProfilePhoto(null);
      setImages([]);
      alert('Profil mis à jour avec succès !');
    } catch (err) {
      console.error(err);
      alert('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Gestion ajout d'images -------------------
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };

  // ------------------- Supprimer image sélectionnée -------------------
  const handleDeleteImage = async () => {
    if (!selectedImageId) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/prestataire/image/${selectedImageId}/delete/`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        console.error(errData);
        alert('Erreur lors de la suppression');
        return;
      }

      alert('Image supprimée avec succès !');
      fetchProfile(); // rafraîchir les images
      setSelectedImageId(null);
    } catch (err) {
      console.error(err);
      alert('Erreur réseau');
    }
  };

  if (!profile) return <div>Chargement...</div>;

  return (
    <div className="prestataire-dashboard">
      {/* ---------------- HEADER ---------------- */}
      <div className="prestataire-dashboard-header">
        <h2>Bienvenue, {profile.full_name || profile.username}</h2>
        <div className="dashboard-actions">
          <button onClick={handleLogout}>Déconnexion</button>
          <button onClick={() => navigate('/RestataireNotifications')}>
            Notifications
         </button>

        </div>
      </div>

      {loading && <div>Chargement...</div>}

      {!editing && (
        <>
          <img
            src={profile.profile_photo_url || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="profile-photo"
          />
          <p><strong>Nom:</strong> {profile.full_name || profile.username}</p>
          <p><strong>Bio:</strong> {profile.bio || 'Aucune bio'}</p>
          <p><strong>Service:</strong> {profile.service_type || 'Non défini'}</p>
          <p><strong>Ville:</strong> {profile.city || 'Non défini'}</p>
          <p><strong>Téléphone:</strong> {profile.phone || 'Non défini'}</p>
          <p><strong>Adresse:</strong> {profile.address_display || 'Non définie'}</p>
          <button onClick={() => setEditing(true)}>Modifier profil</button>
          <button
                disabled={!selectedImageId}
                onClick={handleDeleteImage}
              >
                Supprimer l'image sélectionnée
          </button>
          <h3>Mes images</h3>
          {profile.images && profile.images.length > 0 && (
            <div className="prestataire-images">

              {profile.images.map((imgObj, index) => (
                <div key={index} className="image-item">
                  <img src={imgObj.url} alt={`Prestataire ${index}`} className="additional-image" />
                  <input
                    type="radio"
                    name="selectedImage"
                    onChange={() => setSelectedImageId(imgObj.id)}
                    checked={selectedImageId === imgObj.id}
                  />
                </div>
              ))}

            </div>
          )}

          
        </>
      )}

      {editing && (
        <form className="edit-profile-form" onSubmit={handleSave}>
          <h3>Modifier mon profil</h3>

          <label>
            Bio:
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
          </label>

          <label>
            Ville:
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
          </label>

          <label>
            Photo de profil:
            <input type="file" accept="image/*" onChange={(e) => setProfilePhoto(e.target.files[0])} />
          </label>

          <label>
            Ajouter des images supplémentaires:
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
            />
          </label>

          {images.length > 0 && (
            <div className="preview-images">
              <h4>Prévisualisation des images :</h4>
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(img)}
                  alt={`Preview ${idx}`}
                  className="additional-image"
                />
              ))}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button type="button" onClick={() => { setEditing(false); setImages([]); setProfilePhoto(null); }}>
            Annuler
          </button>
        </form>
      )}
    </div>
  );
}

export default PrestataireDashboard;
