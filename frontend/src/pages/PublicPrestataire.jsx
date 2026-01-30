import React, { useEffect, useState } from 'react'; 
import { useNavigate, useParams } from 'react-router-dom';
import { getToken } from '../auth';
import './PrestataireDashboard.css';

function PublicPrestataire() {
  const { prestataireId } = useParams();
  const navigate = useNavigate();

  const [prestataire, setPrestataire] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------- fetch prestataire ---------- */
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    fetch(`http://localhost:8000/api/prestataires/${prestataireId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Prestataire introuvable');
        return res.json();
      })
      .then(data => setPrestataire(data))
      .catch(() => navigate(-1))
      .finally(() => setLoading(false)); // fini le chargement
  }, [prestataireId, navigate]);

  if (loading) {
    return (
      <div className="prestataire-dashboard">
        <p>Chargement du profil...</p>
      </div>
    );
  }

  if (!prestataire) {
    return (
      <div className="prestataire-dashboard">
        <p>Prestataire introuvable.</p>
        <button onClick={() => navigate(-1)}>Retour</button>
      </div>
    );
  }

  return (
    <div className="prestataire-dashboard">
      <header className="prestataire-dashboard-header">
        <h2>Profil de {prestataire.full_name || prestataire.username}</h2>
        <button onClick={() => navigate(-1)}>Retour</button>
      </header>

      <main className="prestataire-profile-container">
        {/* Photo de profil */}
        <img
          src={prestataire.profile_photo_url || 'https://via.placeholder.com/150'}
          alt="Photo profil"
          className="profile-photo"
        />

        {/* Infos du prestataire */}
        <p><strong>Nom :</strong> {prestataire.full_name || prestataire.username}</p>
        {prestataire.bio && <p><strong>Bio :</strong> {prestataire.bio}</p>}
        {prestataire.service_type && <p><strong>Service :</strong> {prestataire.service_type}</p>}
        {prestataire.city && <p><strong>Ville :</strong> {prestataire.city}</p>}
        {prestataire.phone && <p><strong>Téléphone :</strong> {prestataire.phone}</p>}
        {prestataire.address_display && <p><strong>Adresse :</strong> {prestataire.address_display}</p>}
        <h3>Photos des travaux personnels</h3>

        {/* Images supplémentaires */}
        {prestataire.images && prestataire.images.length > 0 && (
          <div className="prestataire-images">

            {prestataire.images.map((imgObj, index) => (
              <img
                key={index}
                src={imgObj.url}
                alt={`Prestataire ${index}`}
                className="additional-image"
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default PublicPrestataire;