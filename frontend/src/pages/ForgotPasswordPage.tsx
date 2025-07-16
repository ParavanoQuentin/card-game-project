import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './AuthPages.css';

const ForgotPasswordPage: React.FC = () => {
  const { loading, requestPasswordReset } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      const result = await requestPasswordReset(email);
      
      if (result.success) {
        setMessage('Password reset email sent! Please check your inbox and follow the instructions to reset your password.');
        setEmail(''); // Clear the form
      } else {
        setError(result.message || 'Failed to send password reset email');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while sending the password reset email');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p className="auth-description">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
              placeholder="Enter your email address"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading || !email}
          >
            {loading ? 'Sending Email...' : 'Send Reset Email'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login" className="link-button">
            Back to Login
          </Link>
          <Link to="/register" className="link-button">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
