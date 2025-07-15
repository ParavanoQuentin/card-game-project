import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import HomePage from './pages/HomePage';
import DeckCreator from './pages/DeckCreator';
import CombatPage from './pages/CombatPage';
import TestConnection from './pages/TestConnection';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPanel from './pages/AdminPanel';
import ChangePasswordPage from './pages/ChangePasswordPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import CookieConsent from './components/CookieConsent';
import './App.css';

function App() {
  const { loadUser } = useAuthStore();

  // Load user data on app startup
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/deck-creator" element={<DeckCreator />} />
          <Route path="/combat" element={<CombatPage />} />
          <Route path="/test" element={<TestConnection />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
        </Routes>
        <CookieConsent />
      </div>
    </Router>
  );
}

export default App;
