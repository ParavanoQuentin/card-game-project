import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookiePreferences, CookiePreferences, initializeAnalytics, initializePerformanceMonitoring, initializeFunctionalCookies } from '../hooks/useCookiePreferences';
import './CookieConsent.css';

const CookieConsent: React.FC = () => {
  const navigate = useNavigate();
  const { hasConsented, updatePreferences } = useCookiePreferences();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    functional: true,
    analytics: true,
    performance: true,
  });

  useEffect(() => {
    // Show banner if user hasn't consented yet
    if (!hasConsented) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasConsented]);

  const handleAcceptAll = () => {
    const consentData = {
      essential: true,
      functional: true,
      analytics: true,
      performance: true,
    };
    
    updatePreferences(consentData);
    setIsVisible(false);
    
    // Initialize analytics and other tracking here
    initializeTracking(consentData);
  };

  const handleRejectAll = () => {
    const consentData = {
      essential: true, // Always required
      functional: false,
      analytics: false,
      performance: false,
    };
    
    updatePreferences(consentData);
    setIsVisible(false);
    
    // Initialize only essential cookies
    initializeTracking(consentData);
  };

  const handleCustomize = () => {
    setShowDetails(!showDetails);
  };

  const handleSavePreferences = () => {
    updatePreferences(preferences);
    setIsVisible(false);
    
    // Initialize tracking based on preferences
    initializeTracking(preferences);
  };

  const handlePreferenceChange = (type: keyof CookiePreferences) => {
    if (type === 'essential') return; // Essential cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const initializeTracking = (consent: CookiePreferences) => {
    // Initialize different tracking services based on consent
    if (consent.analytics) {
      console.log('Analytics cookies enabled');
      initializeAnalytics();
    }
    
    if (consent.performance) {
      console.log('Performance cookies enabled');
      initializePerformanceMonitoring();
    }
    
    if (consent.functional) {
      console.log('Functional cookies enabled');
      initializeFunctionalCookies();
    }
    
    console.log('Cookie preferences saved:', consent);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-banner">
        <div className="cookie-content">
          <div className="cookie-header">
            <h3>We Value Your Privacy</h3>
            <p>
              We use cookies to enhance your gaming experience, remember your preferences, 
              and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
            </p>
          </div>

          {showDetails && (
            <div className="cookie-details">
              <div className="cookie-category">
                <div className="cookie-category-header">
                  <label className="cookie-switch">
                    <input
                      type="checkbox"
                      checked={preferences.essential}
                      disabled
                      onChange={() => {}} // Essential cookies cannot be disabled
                    />
                    <span className="slider essential"></span>
                  </label>
                  <div>
                    <h4>Essential Cookies</h4>
                    <p>Required for the website to function properly. Cannot be disabled.</p>
                  </div>
                </div>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <label className="cookie-switch">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={() => handlePreferenceChange('functional')}
                    />
                    <span className="slider"></span>
                  </label>
                  <div>
                    <h4>Functional Cookies</h4>
                    <p>Remember your preferences and enhance your experience.</p>
                  </div>
                </div>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <label className="cookie-switch">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => handlePreferenceChange('analytics')}
                    />
                    <span className="slider"></span>
                  </label>
                  <div>
                    <h4>Analytics Cookies</h4>
                    <p>Help us understand how you use our game to improve it.</p>
                  </div>
                </div>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <label className="cookie-switch">
                    <input
                      type="checkbox"
                      checked={preferences.performance}
                      onChange={() => handlePreferenceChange('performance')}
                    />
                    <span className="slider"></span>
                  </label>
                  <div>
                    <h4>Performance Cookies</h4>
                    <p>Improve loading times and game performance.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="cookie-actions">
            <div className="cookie-links">
              <button 
                className="link-button"
                onClick={() => navigate('/privacy-policy')}
              >
                Privacy Policy
              </button>
              <button 
                className="link-button"
                onClick={() => navigate('/cookie-policy')}
              >
                Cookie Policy
              </button>
            </div>
            
            <div className="cookie-buttons">
              <button 
                className="cookie-button secondary"
                onClick={handleRejectAll}
              >
                Reject All
              </button>
              <button 
                className="cookie-button secondary"
                onClick={handleCustomize}
              >
                {showDetails ? 'Hide Details' : 'Customize'}
              </button>
              {showDetails ? (
                <button 
                  className="cookie-button primary"
                  onClick={handleSavePreferences}
                >
                  Save Preferences
                </button>
              ) : (
                <button 
                  className="cookie-button primary"
                  onClick={handleAcceptAll}
                >
                  Accept All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
