// Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <>
      {/* HEADER */}
      <header>
        <div className="logo">
          <img src={process.env.PUBLIC_URL + '/images/logo.png'} alt="HomeCare" />
          <span className="logo-title">
            Home<span className="green">Care</span>
          </span>
        </div>

        <div className="buton">
          <Link to="/login" className="signup">Login</Link>
          <Link to="/register" className="signup">S'inscrire</Link>
        </div>
      </header>

      {/* BANNIÈRE */}
      <section className="banner">
        <img img src={process.env.PUBLIC_URL + '/images/accueil.jpeg'} alt="Banner"/>

        <div className="banner-box">
          <h1>
            Votre maison mérite le meilleur service,
            <br /> proche et fiable en quelques clics!
          </h1>

          <p>
            HomeCare vous met en relation avec des prestataires spécialisés
            dans le nettoyage à domicile et le jardinage. Consultez leurs profils,
            découvrez leurs réalisations et choisissez le prestataire parfait pour vos besoins.
          </p>
        </div>
      </section>

      {/* SERVICES TITLE */}
      <section className="services-title">
        <h2>L'excellence au cœur de nos services</h2>
      </section>

      {/* SERVICES SECTIONS */}
      <section className="services-container">

        {/* Service Jardinage */}
        <div className="service-section">
          <div className="service-boxes">
            <div className="service-box">
              <div className="circle">01</div>
              <h3>Tonte du gazon</h3>
              <p>Un gazon net et bien entretenu pour embellir votre jardin.</p>
            </div>
            <div className="service-box">
              <div className="circle">02</div>
              <h3>Arrosage des plantes</h3>
              <p>Maintien de vos plantes en pleine santé grâce à un arrosage adapté.</p>
            </div>
            <div className="service-box">
              <div className="circle">03</div>
              <h3>Ramassage des feuilles</h3>
              <p>Élimination rapide des feuilles mortes pour garder votre jardin propre.</p>
            </div>
            <div className="service-box">
              <div className="circle">04</div>
              <h3>Taille de haies</h3>
              <p>Des haies propres et parfaitement taillées pour un jardin impeccable.</p>
            </div>
          </div>

          <div className="service-image">
            <img src={process.env.PUBLIC_URL + '/images/photoJardinage.jpeg'} alt="Service Jardinage" />
            <div className="service-label">
              Service<br />Jardinage
            </div>
          </div>
        </div>

        {/* Service Nettoyage */}
        <div className="service-section reverse">
          <div className="service-boxes">
            <div className="service-box">
              <div className="circle">01</div>
              <h3>Nettoyage complet de la maison</h3>
              <p>Un service complet pour rendre chaque pièce impeccable et saine, du sol au plafond.</p>
            </div>
            <div className="service-box">
              <div className="circle">02</div>
              <h3>Nettoyage des vitres</h3>
              <p>Des vitres étincelantes, sans traces ni poussière, pour une vue claire et lumineuse.</p>
            </div>
            <div className="service-box">
              <div className="circle">03</div>
              <h3>Repassage des vêtements</h3>
              <p>Vos vêtements parfaitement repassés et prêts à porter, sans effort pour vous.</p>
            </div>
            <div className="service-box">
              <div className="circle">04</div>
              <h3>Nettoyage après événement</h3>
              <p>Remise en état rapide et efficace après fêtes ou événements, pour retrouver votre espace impeccable.</p>
            </div>
          </div>

          <div className="service-image">
            <img src={process.env.PUBLIC_URL + '/images/photoMenage.jpeg'} alt="Service Nettoyage" />
            <div className="service-label">
              Service<br />Nettoyage
            </div>
          </div>
        </div>

      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-left">
          <img src="/images/logo.png" alt="HomeCare" />
          <p>
            HomeCare — Votre plateforme de confiance pour trouver rapidement
            des professionnels de services à domicile.
          </p>
        </div>

        <div className="footer-right">
          <p><i className="fas fa-envelope"></i> HomeCare@gmail.com</p>
          <p><i className="fab fa-facebook-f"></i> HomeCare</p>
          <p><i className="fab fa-instagram"></i> HomeCare_00</p>
        </div>
      </footer>

      <div className="footer-bottom">
        © 2025 HomeCare. Tous droits réservés.
      </div>
    </>
  );
}

export default Home;
