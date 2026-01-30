import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [countdown, setCountdown] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (countdown === 0) {
      navigate('/ResetPassword');
    }

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setResetToken('');
    setCountdown(null);

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/password-reset/request/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Erreur lors de la demande');
      }

      setResetToken(data.reset_token);
      setMessage(
        'Copiez le token. Redirection vers la page de réinitialisation dans 10 secondes...'
      );
      setCountdown(10);
      setEmail('');
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Mot de passe oublié</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Générer le token</button>
      </form>

      {message && <p>{message}</p>}

      {resetToken && (
        <div>
          <strong>Token (DEV) :</strong>
          <p>{resetToken}</p>
          {countdown !== null && (
            <p>Redirection dans {countdown} seconde(s)…</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;