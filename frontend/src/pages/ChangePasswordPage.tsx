import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import './ChangePasswordPage.css';

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 12) {
      return { valid: false, message: 'Password must be at least 12 characters long' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!hasLowerCase) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!hasNumbers) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    if (!hasSpecialChar) {
      return { valid: false, message: 'Password must contain at least one special character' };
    }

    return { valid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate inputs
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      setLoading(false);
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message || 'Password does not meet security requirements');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (response.success) {
        setSuccess(true);
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(response.message || 'Failed to change password');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="change-password-page">
      <div className="change-password-container">
        <div className="change-password-header">
          <h1>Change Password</h1>
          <p>Update your password to keep your account secure</p>
          {user?.needsPasswordChange && (
            <div className="password-expired-warning">
              ⚠️ Your password has expired and must be changed to continue using your account.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter your new password"
              required
            />
            <div className="password-requirements">
              <p>Password must contain:</p>
              <ul>
                <li className={formData.newPassword.length >= 12 ? 'valid' : ''}>
                  At least 12 characters
                </li>
                <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : ''}>
                  One uppercase letter
                </li>
                <li className={/[a-z]/.test(formData.newPassword) ? 'valid' : ''}>
                  One lowercase letter
                </li>
                <li className={/\d/.test(formData.newPassword) ? 'valid' : ''}>
                  One number
                </li>
                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? 'valid' : ''}>
                  One special character
                </li>
              </ul>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your new password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && (
            <div className="success-message">
              Password changed successfully! Redirecting to home page...
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
