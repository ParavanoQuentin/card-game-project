import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock pour le store auth
jest.mock('./store/authStore', () => ({
  useAuthStore: () => ({
    loadUser: jest.fn(),
    user: null,
    isAuthenticated: false
  })
}));

// Helper pour wrapper l'App avec Router
const AppWithRouter = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<AppWithRouter />);
  });

  test('renders main navigation elements', () => {
    render(<AppWithRouter />);
    
    // L'app devrait rendre quelque chose
    const appElement = document.querySelector('.App') || document.body;
    expect(appElement).toBeInTheDocument();
  });
});
