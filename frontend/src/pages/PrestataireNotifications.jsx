import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../auth';
import './PrestataireNotifications.css';

function PrestataireNotifications() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- Sécurité SIMPLE ---------- */
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  /* ---------- Charger les demandes ---------- */
  const fetchReservations = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(
        'http://localhost:8000/api/prestataire/reservations/',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error('Erreur chargement notifications');

      const data = await res.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  /* ---------- Accepter / Refuser ---------- */
  const updateStatus = async (reservationId, newStatus) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/reservation/${reservationId}/status/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) throw new Error('Erreur mise à jour statut');

      // 🔁 rafraîchir la liste après action
      fetchReservations();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour');
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="prestataire-notifications">
      <h2>Demandes reçues</h2>

      {reservations.length === 0 ? (
        <p>Aucune demande pour le moment.</p>
      ) : (
        reservations.map(res => (
          <div key={res.id} className="notification-box">
            <p><strong>Client :</strong> {res.client_username}</p>
            <p><strong>Date :</strong> {res.date}</p>
            <p><strong>Adresse :</strong> {res.address}</p>
            <p><strong>Description :</strong> {res.description}</p>

            <p>
              <strong>Statut :</strong>{' '}
              <span className={`status ${res.status.toLowerCase()}`}>
                {res.status}
              </span>
            </p>

            {res.status === 'EN_ATTENTE' && (
              <div className="actions">
                <button
                  className="accept-btn"
                  onClick={() => updateStatus(res.id, 'accepted')}
                >
                  Accepter
                </button>

                <button
                  className="refuse-btn"
                  onClick={() => updateStatus(res.id, 'refused')}
                >
                  Refuser
                </button>
              </div>
            )}
          </div>
        ))
      )}

      <button
        className="back-btn"
        onClick={() => navigate('/PrestataireDashboard')}
      >
        Retour au dashboard
      </button>
    </div>
  );
}

export default PrestataireNotifications;