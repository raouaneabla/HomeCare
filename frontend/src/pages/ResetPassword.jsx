// ResetPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResetPassword.css';

function ResetPassword() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/password-reset/confirm/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            new_password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Erreur');
      }

      setMessage('Mot de passe réinitialisé avec succès. Redirection vers la connexion…');

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Réinitialisation du mot de passe</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button type="submit">
          Réinitialiser le mot de passe
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPassword;