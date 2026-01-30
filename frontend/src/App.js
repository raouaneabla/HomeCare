// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import PrestataireNotifications from './pages/PrestataireNotifications';
import PublicPrestataire from './pages/PublicPrestataire';
import PrestataireDashboard from './pages/PrestataireDashboard';
import ClientReservations from './pages/ClientReservations';
import Reservation from "./pages/Reservation";
import ClientDashboard from './pages/ClientDashboard';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* PAGE D'ACCUEIL */}
        <Route path="/" element={<Home />} />

        {/* PAGE INSCRIPTION */}
        <Route path="/register" element={<Register />} />

        {/* PAGE LOGIN */}
        <Route path="/login" element={<Login />} />

        {/*page client*/}
        <Route path="/ClientDashboard" element={<ClientDashboard />} />

        {/*page reservation */}
        <Route path="/reservation/:prestataireId" element={<Reservation />} />
        {/*page hostorique reservations */}
        <Route path="/ClientReservations" element={<ClientReservations />} />
        
        {/* PAGE PRESTATAIRE */}
        <Route path="/PrestataireDashboard" element={<PrestataireDashboard />} />
        {/* PAGE PRESTATAIRE vue client */}
         <Route path="/prestataire/:prestataireId" element={<PublicPrestataire />} />
        {/* PAGE NOTIFICATIONS PRESTATAIRE */}
        <Route path="/PrestataireNotifications" element={<PrestataireNotifications />}/>
        {/* PAGE OUBLIE MOT DR PASSE */}
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />



        
      </Routes>
    </Router>
  );
}

export default App;
