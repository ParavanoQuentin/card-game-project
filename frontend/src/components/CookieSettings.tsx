import React, { useState } from 'react';
import { useCookiePreferences, CookiePreferences } from '../hooks/useCookiePreferences';
import './CookieSettings.css';

interface CookieSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const CookieSettings: React.FC<CookieSettingsProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences, resetPreferences } = useCookiePreferences();
  const [localPreferences, setLocalPreferences] = useState<CookiePreferences>(preferences);

  const handlePreferenceChange = (type: keyof CookiePreferences) => {
    if (type === 'essential') return; // Essential cookies cannot be disabled
    
    setLocalPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleSave = () => {
    updatePreferences(localPreferences);
    onClose();
  };

  const handleReset = () => {
    resetPreferences();
    setLocalPreferences({
      essential: true,
      functional: false,
      analytics: false,
      performance: false,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="cookie-settings-overlay">
      <div className="cookie-settings-modal">
        <div className="cookie-settings-header">
          <h2>Cookie Preferences</h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="cookie-settings-content">
          <p className="settings-description">
            Manage your cookie preferences. You can enable or disable different types of cookies below.
          </p>

          <div className="cookie-categories">
            <div className="cookie-category">
              <div className="category-header">
                <label className="cookie-toggle">
                  <input
                    type="checkbox"
                    checked={localPreferences.essential}
                    disabled
                    onChange={() => {}}
                  />
                  <span className="toggle-slider essential"></span>
                </label>
                <div className="category-info">
                  <h3>Essential Cookies</h3>
                  <p>
                    These cookies are necessary for the website to function and cannot be switched off. 
                    They are usually only set in response to actions made by you which amount to a request for services.
                  </p>
                </div>
              </div>
            </div>

            <div className="cookie-category">
              <div className="category-header">
                <label className="cookie-toggle">
                  <input
                    type="checkbox"
                    checked={localPreferences.functional}
                    onChange={() => handlePreferenceChange('functional')}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <div className="category-info">
                  <h3>Functional Cookies</h3>
                  <p>
                    These cookies enable the website to provide enhanced functionality and personalization. 
                    They may be set by us or by third party providers whose services we have added to our pages.
                  </p>
                </div>
              </div>
            </div>

            <div className="cookie-category">
              <div className="category-header">
                <label className="cookie-toggle">
                  <input
                    type="checkbox"
                    checked={localPreferences.analytics}
                    onChange={() => handlePreferenceChange('analytics')}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <div className="category-info">
                  <h3>Analytics Cookies</h3>
                  <p>
                    These cookies allow us to count visits and traffic sources so we can measure and improve 
                    the performance of our site. They help us to know which pages are the most and least popular.
                  </p>
                </div>
              </div>
            </div>

            <div className="cookie-category">
              <div className="category-header">
                <label className="cookie-toggle">
                  <input
                    type="checkbox"
                    checked={localPreferences.performance}
                    onChange={() => handlePreferenceChange('performance')}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <div className="category-info">
                  <h3>Performance Cookies</h3>
                  <p>
                    These cookies are used to enhance the performance and functionality of our website. 
                    They help us optimize loading times and provide a better user experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="cookie-settings-actions">
          <button 
            className="settings-button secondary"
            onClick={handleReset}
          >
            Reset to Default
          </button>
          <div className="action-group">
            <button 
              className="settings-button secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="settings-button primary"
              onClick={handleSave}
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieSettings;
