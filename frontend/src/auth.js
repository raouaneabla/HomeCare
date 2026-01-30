// src/auth.js

// ---------------------------
// Stocke token et currentUser
// ---------------------------
export const saveTokens = ({
  access,
  refresh,
  id,
  username,
  is_client,
  is_prestataire,
  latitude,
  longitude,
  address
}) => {
  // Stocker le token d'accès et refresh
  localStorage.setItem('token', access);
  localStorage.setItem('refresh', refresh || '');

  // Stocker currentUser avec le token inclus pour simplifier l'accès
  localStorage.setItem(
    'currentUser',
    JSON.stringify({
      id,
      username,
      is_client,
      is_prestataire,
      latitude,
      longitude,
      address,
      access, // <-- très important pour PrestataireDashboard
    })
  );
};

// ---------------------------
// Récupère le token JWT
// ---------------------------
export const getToken = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  return currentUser?.access || localStorage.getItem('token') || null;
};

// ---------------------------
// Récupère les informations de l'utilisateur courant
// ---------------------------
export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

// ---------------------------
// Supprime tokens / déconnexion
// ---------------------------
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh');
  localStorage.removeItem('currentUser');
};
