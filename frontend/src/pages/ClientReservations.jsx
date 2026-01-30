import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, getCurrentUser } from '../auth';
import './ClientReservations.css';

function ClientReservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- Sécurité JWT ---------- */
  useEffect(() => {
    const token = getToken();
    const user = getCurrentUser();

    if (!token || !user || !user.is_client) {
      navigate('/login');
    }
  }, [navigate]);

  /* ---------- Fonction de chargement ---------- */
  const fetchReservations = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch('http://localhost:8000/api/client/reservations/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Erreur chargement réservations');

      const data = await res.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Charger l'historique AU MONTAGE ---------- */
  useEffect(() => {
    fetchReservations();
  }, []);

  /* ---------- Rafraîchir quand on revient sur la page ---------- */
  useEffect(() => {
    const onFocus = () => {
      fetchReservations();
    };

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  /* ---------- Redemander ---------- */
  const handleRedemander = (reservation) => {
    navigate(`/reservation/${reservation.prestataire}`);
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="client-reservations">
      <h2>Historique de mes demandes</h2>

      {reservations.length === 0 ? (
        <p>Aucune réservation pour le moment.</p>
      ) : (
        reservations.map(res => (
          <div key={res.id} className="reservation-box">
            <p>
              <strong>Prestataire :</strong>{' '}
              {res.prestataire_username || 'Inconnu'}
            </p>

            <p><strong>Date :</strong> {res.date}</p>
            <p><strong>Adresse :</strong> {res.address}</p>
            <p><strong>Description :</strong> {res.description}</p>

            <p>
              <strong>Statut :</strong>{' '}
              <span className={`status ${res.status.toLowerCase()}`}>
                {res.status}
              </span>
            </p>

            {res.status !== 'EN_ATTENTE' && (
              <button onClick={() => handleRedemander(res)}>
                Redemander ce prestataire
              </button>
            )}
          </div>
        ))
      )}

      <button
        className="back-btn"
        onClick={() => navigate('/ClientDashboard')}
      >
        Retour au dashboard
      </button>
    </div>
  );
}

export default ClientReservations;