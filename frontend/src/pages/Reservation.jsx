import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getToken, getCurrentUser } from "../auth";
import "./Reservation.css";

function Reservation() {
  const { prestataireId } = useParams();
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const user = getCurrentUser();

  useEffect(() => {
    if (!getToken() || !user || !user.is_client) {
      navigate("/login");
    }
  }, [navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = getToken();

    try {
      const res = await fetch(
        "http://localhost:8000/api/reservations/create/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            prestataire: prestataireId,
            description: description,
            address: address,
            date: date,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error(err);
        alert("Erreur lors de l'envoi de la réservation");
        return;
      }

      alert("Réservation envoyée avec succès !");
      navigate("/ClientDashboard");
    } catch (error) {
      console.error(error);
      alert("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reservation-page">
      <h2>Demande de réservation</h2>

      <form onSubmit={handleSubmit} className="reservation-form">
        <textarea
          placeholder="Détails du service demandé"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Adresse d'intervention"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Envoi..." : "Envoyer la demande"}
        </button>
      </form>
    </div>
  );
}

export default Reservation;
