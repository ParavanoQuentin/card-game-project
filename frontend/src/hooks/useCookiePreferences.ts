import { useState, useEffect } from 'react';

export interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  performance: boolean;
  timestamp?: string;
}

const defaultPreferences: CookiePreferences = {
  essential: true,
  functional: false,
  analytics: false,
  performance: false,
};

export const useCookiePreferences = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    const savedPreferences = localStorage.getItem('cookieConsent');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
        setHasConsented(true);
      } catch (error) {
        console.error('Error parsing cookie preferences:', error);
      }
    }
  }, []);

  const updatePreferences = (newPreferences: CookiePreferences) => {
    const preferencesWithTimestamp = {
      ...newPreferences,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(preferencesWithTimestamp));
    setPreferences(preferencesWithTimestamp);
    setHasConsented(true);
  };

  const resetPreferences = () => {
    localStorage.removeItem('cookieConsent');
    setPreferences(defaultPreferences);
    setHasConsented(false);
  };

  const canUseAnalytics = () => {
    return hasConsented && preferences.analytics;
  };

  const canUsePerformance = () => {
    return hasConsented && preferences.performance;
  };

  const canUseFunctional = () => {
    return hasConsented && preferences.functional;
  };

  return {
    preferences,
    hasConsented,
    updatePreferences,
    resetPreferences,
    canUseAnalytics,
    canUsePerformance,
    canUseFunctional,
  };
};

// Utility functions for tracking initialization
export const initializeAnalytics = () => {
  // Initialize analytics services here (e.g., Google Analytics)
  console.log('Analytics initialized');
  
  // Example: Initialize Google Analytics
  // gtag('config', 'GA_MEASUREMENT_ID');
};

export const initializePerformanceMonitoring = () => {
  // Initialize performance monitoring here
  console.log('Performance monitoring initialized');
  
  // Example: Initialize performance monitoring
  // Initialize performance monitoring service
};

export const initializeFunctionalCookies = () => {
  // Initialize functional features here
  console.log('Functional cookies initialized');
  
  // Example: Enable theme preferences, language settings, etc.
};
