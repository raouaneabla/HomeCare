import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveTokens } from '../auth';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        mode: 'cors',
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || 'Erreur login');

      saveTokens(data);

      if (data.is_client) navigate('/ClientDashboard');
      else if (data.is_prestataire) navigate('/PrestataireDashboard');
      else navigate('/');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nom d'utilisateur"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
        />
        <button type="submit">Se connecter</button>
      </form>

      {/* Lien Mot de passe oublié */}
      <p className="forgot-password">
        <span
          style={{ cursor: 'pointer', color: '#ffffff', textDecoration: 'underline' }}
          onClick={() => navigate('/ForgotPassword')}
        >
          Mot de passe oublié ?
        </span>
      </p>
    </div>
  );
}

export default Login;