import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, getCurrentUser, logout } from '../auth';
import './ClientDashboard.css';

/* ---------- Distance GPS ---------- */
function calculDistance(lat1, lon1, lat2, lon2) {
  const toRad = x => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

function ClientDashboard() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [prestataires, setPrestataires] = useState([]);
  const [filteredPrestataires, setFilteredPrestataires] = useState([]);
  const [clientPosition, setClientPosition] = useState(null);

  /* ---------- filtre ---------- */
  const [filterType, setFilterType] = useState('name');
  const [filterValue, setFilterValue] = useState('');

  /* ---------- sécurité JWT ---------- */
  useEffect(() => {
    const token = getToken();
    const user = getCurrentUser();

    if (!token || !user || !user.is_client) {
      navigate('/login');
      return;
    }

    setCurrentUser(user);

    if (user.latitude && user.longitude) {
      setClientPosition([user.latitude, user.longitude]);
    }
  }, [navigate]);

  /* ---------- fetch prestataires ---------- */
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    fetch('http://localhost:8000/api/prestataires/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Accès refusé');
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) return;

        // Ajouter la distance + trier
        const prestatairesAvecDistance = data.map(p => {
          if (clientPosition && p.latitude && p.longitude) {
            const distance = calculDistance(
              clientPosition[0],
              clientPosition[1],
              p.latitude,
              p.longitude
            );
            return { ...p, distance };
          }
          return { ...p, distance: null };
        });

        // Trier par distance croissante
        prestatairesAvecDistance.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });

        setPrestataires(prestatairesAvecDistance);
        setFilteredPrestataires(prestatairesAvecDistance);
      })
      .catch(() => {
        logout();
        navigate('/login');
      });
  }, [navigate, clientPosition]);

  /* ---------- logout ---------- */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /* ---------- appliquer filtre ---------- */
  const handleFilter = () => {
    const value = filterValue.toLowerCase();

    const result = prestataires.filter(p => {
      if (filterType === 'name') {
        return p.username?.toLowerCase().includes(value);
      }

      if (filterType === 'address') {
        return p.address_display?.toLowerCase().includes(value);
      }

      if (filterType === 'service') {
        return p.service_type?.toLowerCase().includes(value);
      }

      return true;
    });

    // garder l'ordre par distance
    result.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    setFilteredPrestataires(result);
  };

  /* ---------- reset filtre ---------- */
  const resetFilter = () => {
    setFilterValue('');
    setFilteredPrestataires(prestataires);
  };

  /* ---------- UI ---------- */
  return (
    <div className="client-dashboard">
      <header className="client-header">
        <h2>Bienvenue, {currentUser?.username}</h2>

       <div className="header-buttons">
         <button onClick={() => navigate('/ClientReservations')}>
             Historique des demandes
         </button>

         <button onClick={handleLogout}>Déconnexion</button>
       </div>
     </header>



      {/* ---------- filtres ---------- */}
      <div className="filters-container">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="name">Nom</option>
          <option value="address">Adresse</option>
          <option value="service">Service</option>
        </select>

        <input
          type="text"
          placeholder="Tape ta recherche ici..."
          value={filterValue}
          onChange={e => setFilterValue(e.target.value)}
        />

        <button onClick={handleFilter}>OK</button>
        <button onClick={resetFilter}>Réinitialiser</button>
      </div>

      {/* ---------- liste prestataires ---------- */}
      <main className="prestataires-container">
        {filteredPrestataires.length === 0 ? (
          <p>Aucun prestataire trouvé.</p>
        ) : (
          filteredPrestataires.map(p => (
            <div key={p.id} className="prestataire-box">
              <h3>{p.username}</h3>
              <p>Service : {p.service_type || 'Non précisé'}</p>
              <p>Adresse : {p.address_display || 'Inconnue'}</p>
              {p.distance !== null && <p>Distance : {p.distance} km</p>}

              <div className="prestataire-buttons">
                <button onClick={() => navigate(`/reservation/${p.id}`)}>
                  Réserver
                </button>
                <button onClick={() => navigate(`/prestataire/${p.id}`)}>
                  Voir profil
                </button>

              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default ClientDashboard;
