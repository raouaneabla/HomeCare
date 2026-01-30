import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveTokens } from '../auth';
import './Register.css';

function Register() {
  const navigate = useNavigate();

  // ------------------------ CHAMPS FORMULAIRE ------------------------
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isClient, setIsClient] = useState(true);
  const [isPrestataire, setIsPrestataire] = useState(false);

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [position, setPosition] = useState(null); // [lat, lng]

  // ------------------------ GÉOLOCALISATION ------------------------
  const handleLocation = () => {
    if (!navigator.geolocation) {
      alert('Géolocalisation non supportée');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setAddress(`Position approximative : ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      },
      () => alert('Impossible de récupérer la position')
    );
  };

  // ------------------------ ADRESSE → COORDONNÉES ------------------------
  const handleAddressChange = async (e) => {
    const value = e.target.value;
    setAddress(value);

    if (!value.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch (err) {
      console.error('Erreur géocodage :', err);
    }
  };

  // ------------------------ SUBMIT FORMULAIRE ------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password || !phone || !address || !position) {
      alert('Remplissez tous les champs !');
      return;
    }

    const payload = {
      username,
      email,
      password,
      is_client: isClient,
      is_prestataire: isPrestataire,
      phone,
      address,
      service_type: isPrestataire ? serviceType : '',
      latitude: position[0],
      longitude: position[1],
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        alert('Erreur inscription : ' + JSON.stringify(data));
        return;
      }

      saveTokens(data);
      alert('Inscription réussie !');

      if (data.is_client) navigate('/ClientDashboard');
      else if (data.is_prestataire) navigate('/PrestataireDashboard');
      else navigate('/');
    } catch (err) {
      console.error(err);
      alert('Erreur serveur');
    }
  };

  // ------------------------ JSX ------------------------
  return (
    <div className="register-container">
      <h2>Inscription</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {/* ------------------------ CHOIX CLIENT / PRESTATAIRE ------------------------ */}
        <div>
          <label>
            <input
              type="radio"
              checked={isClient}
              onChange={() => { setIsClient(true); setIsPrestataire(false); }}
            /> Client
          </label>
          <label>
            <input
              type="radio"
              checked={isPrestataire}
              onChange={() => { setIsPrestataire(true); setIsClient(false); }}
            /> Prestataire
          </label>
        </div>

        <input
          type="text"
          placeholder="Téléphone"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />

        <input
          type="text"
          placeholder="Adresse"
          value={address}
          onChange={handleAddressChange}
        />

        {isPrestataire && (
          <select value={serviceType} onChange={e => setServiceType(e.target.value)}>
            <option value="">-- Sélectionnez le service --</option>
            <option value="MENAGE">Ménage</option>
            <option value="JARDINAGE">Jardinage</option>
          </select>
        )}

        <button type="button" onClick={handleLocation}>
          Utiliser ma position
        </button>

        {position && (
          <div className="map-container">
            <iframe
              title="map"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                position[1] - 0.01
              },${position[0] - 0.01},${position[1] + 0.01},${position[0] + 0.01}&marker=${position[0]},${position[1]}`}
              loading="lazy"
            ></iframe>
          </div>
        )}

        <button  type="submit">S'inscrire</button>
      </form>
    </div>
  );
}

export default Register;
