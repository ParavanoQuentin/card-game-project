import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './AuthPages.css';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, resendVerificationEmail, loading, error, clearError } = useAuthStore();
  
  const [verificationState, setVerificationState] = useState<'verifying' | 'success' | 'error' | 'resend'>('verifying');
  const [resendEmail, setResendEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleVerification = async (token: string) => {
      try {
        const result = await verifyEmail(token);
        
        if (result.success) {
          setVerificationState('success');
          setMessage(result.message);
          // Redirect to home after 3 seconds
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          setVerificationState('error');
          setMessage(result.message);
        }
      } catch (error) {
        setVerificationState('error');
        setMessage('Email verification failed. Please try again.');
      }
    };

    const token = searchParams.get('token');
    
    if (token) {
      handleVerification(token);
    } else {
      setVerificationState('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
    }

    clearError();
  }, [searchParams, verifyEmail, navigate, clearError]);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resendEmail.trim()) {
      return;
    }

    try {
      const result = await resendVerificationEmail(resendEmail);
      setMessage(result.message);
      
      if (result.success) {
        setVerificationState('resend');
      }
    } catch (error) {
      setMessage('Failed to resend verification email. Please try again.');
    }
  };

  const renderContent = () => {
    switch (verificationState) {
      case 'verifying':
        return (
          <div className="verification-content">
            <div className="loading-spinner large"></div>
            <h2>Verifying your email...</h2>
            <p>Please wait while we verify your email address.</p>
          </div>
        );

      case 'success':
        return (
          <div className="verification-content success">
            <div className="success-icon">✅</div>
            <h2>Email Verified Successfully!</h2>
            <p>{message}</p>
            <p>You will be redirected to the home page in a few seconds...</p>
            <Link to="/" className="auth-button">
              Continue to Home
            </Link>
          </div>
        );

      case 'error':
        return (
          <div className="verification-content error">
            <div className="error-icon">❌</div>
            <h2>Email Verification Failed</h2>
            <p>{message}</p>
            
            <div className="resend-section">
              <h3>Resend Verification Email</h3>
              <p>Enter your email address to receive a new verification link:</p>
              
              <form onSubmit={handleResendVerification} className="resend-form">
                <div className="form-group">
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    disabled={loading}
                  />
                </div>
                
                <button
                  type="submit"
                  className={`auth-button ${loading ? 'loading' : ''}`}
                  disabled={loading || !resendEmail.trim()}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>
              </form>
            </div>
            
            <div className="auth-footer">
              <Link to="/login" className="auth-link">Back to Login</Link>
              <span> | </span>
              <Link to="/register" className="auth-link">Create New Account</Link>
            </div>
          </div>
        );

      case 'resend':
        return (
          <div className="verification-content success">
            <div className="success-icon">📧</div>
            <h2>Verification Email Sent!</h2>
            <p>{message}</p>
            <p>Please check your inbox and click the verification link.</p>
            
            <div className="auth-footer">
              <Link to="/login" className="auth-link">Back to Login</Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>⚡ Aether Beasts</h1>
          <p>Email Verification</p>
        </div>

        {error && verificationState !== 'error' && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
