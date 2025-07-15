import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import CookieSettings from '../components/CookieSettings';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [showCookieSettings, setShowCookieSettings] = useState(false);

  const handleLogout = () => {
    logout();
    // Stay on homepage after logout
  };

  return (
    <div className="homepage">
      {/* Authentication Header */}
      <div className="auth-header">
        {isAuthenticated && user ? (
          <div className="user-info">
            <span className="welcome-text">Welcome back, {user.username}!</span>
            <div className="user-actions">
              {user.role === 'admin' && (
                <button 
                  className="admin-panel-button"
                  onClick={() => navigate('/admin')}
                >
                  Admin Panel
                </button>
              )}
              <button 
                className="change-password-button"
                onClick={() => navigate('/change-password')}
              >
                Change Password
              </button>
              <button className="logout-button" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="auth-buttons">
            <button 
              className="login-button"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
            <button 
              className="register-button"
              onClick={() => navigate('/register')}
            >
              Create Account
            </button>
          </div>
        )}
      </div>

      <div className="hero-section">
        <h1 className="game-title">Aether Beasts</h1>
        <p className="game-subtitle">
          Command legendary creatures from ancient mythologies in epic card battles
        </p>
        
        <div className="mythology-preview">
          <div className="mythology-card greek">
            <h3>Greek</h3>
            <p>Zeus, Medusa, and the gods of Olympus</p>
          </div>
          <div className="mythology-card egyptian">
            <h3>Egyptian</h3>
            <p>Anubis, Sphinx, and the guardians of the afterlife</p>
          </div>
          <div className="mythology-card norse">
            <h3>Norse</h3>
            <p>Thor, Fenrir, and the warriors of Valhalla</p>
          </div>
          <div className="mythology-card chinese">
            <h3>Chinese</h3>
            <p>Dragons, Phoenix, and celestial beings</p>
          </div>
        </div>
      </div>

      <div className="action-section">
        <div className="action-buttons">
          <button 
            className="primary-button"
            onClick={() => navigate('/deck-creator')}
          >
            Create Deck
          </button>
          <button 
            className="secondary-button"
            onClick={() => navigate('/combat')}
          >
            Quick Battle
          </button>
        </div>

        <div className="game-rules">
          <h2>How to Play</h2>
          <div className="rules-grid">
            <div className="rule-item">
              <h3>Objective</h3>
              <p>Reduce your opponent's Nexus HP to 0 or eliminate all their beasts</p>
            </div>
            <div className="rule-item">
              <h3>Deck</h3>
              <p>10 cards from one mythology: Beasts, Techniques, and Artifacts</p>
            </div>
            <div className="rule-item">
              <h3>Combat</h3>
              <p>Deploy one beast at a time and use techniques strategically</p>
            </div>
            <div className="rule-item">
              <h3>Victory</h3>
              <p>Tactical gameplay with mythological creatures and powers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Aether Beasts</h4>
            <p>Command legendary creatures from ancient mythologies</p>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <div className="footer-links">
              <button 
                className="footer-link" 
                onClick={() => navigate('/privacy-policy')}
              >
                Privacy Policy
              </button>
              <button 
                className="footer-link" 
                onClick={() => navigate('/terms-of-service')}
              >
                Terms of Service
              </button>
              <button 
                className="footer-link" 
                onClick={() => navigate('/cookie-policy')}
              >
                Cookie Policy
              </button>
              <button 
                className="footer-link" 
                onClick={() => setShowCookieSettings(true)}
              >
                Cookie Settings
              </button>
            </div>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <div className="footer-links">
              <span className="footer-text">Email: support@aetherbeasts.com</span>
              <span className="footer-text">Version 1.0.0</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Aether Beasts. All rights reserved.</p>
        </div>
      </footer>
      
      <CookieSettings 
        isOpen={showCookieSettings} 
        onClose={() => setShowCookieSettings(false)} 
      />
    </div>
  );
};

export default HomePage;
