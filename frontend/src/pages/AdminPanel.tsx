import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { adminService } from '../services/adminService';
import { User } from '../types/auth';
import './AdminPanel.css';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated || !currentUser || currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await adminService.getAllUsers();
      
      if (response.success && response.users) {
        setUsers(response.users);
      } else {
        setError(response.message || 'Failed to load users');
      }
    } catch (error) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(userId);
    
    try {
      const response = await adminService.deleteUser(userId);
      
      if (response.success) {
        setUsers(users.filter(user => user.id !== userId));
        alert(`User "${username}" has been deleted successfully.`);
      } else {
        alert(`Failed to delete user: ${response.message}`);
      }
    } catch (error) {
      alert('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: 'user' | 'admin', username: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const action = newRole === 'admin' ? 'promote' : 'demote';
    
    if (!window.confirm(`Are you sure you want to ${action} "${username}" ${newRole === 'admin' ? 'to admin' : 'to regular user'}?`)) {
      return;
    }

    setActionLoading(userId);
    
    try {
      const response = await adminService.updateUserRole(userId, newRole);
      
      if (response.success && response.user) {
        setUsers(users.map(user => 
          user.id === userId ? response.user! : user
        ));
        alert(`User "${username}" has been ${action}d successfully.`);
      } else {
        alert(`Failed to ${action} user: ${response.message}`);
      }
    } catch (error) {
      alert(`Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated || !currentUser || currentUser.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <button 
          className="back-button"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
      </div>

      <div className="admin-content">
        <div className="users-section">
          <div className="section-header">
            <h2>User Management</h2>
            <button 
              className="refresh-button"
              onClick={loadUsers}
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading users...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="users-container">
              <div className="users-stats">
                <p>Total Users: <strong>{users.length}</strong></p>
                <p>Admins: <strong>{users.filter(u => u.role === 'admin').length}</strong></p>
                <p>Regular Users: <strong>{users.filter(u => u.role === 'user').length}</strong></p>
              </div>

              <div className="users-table">
                <div className="table-header">
                  <div className="column">Username</div>
                  <div className="column">Email</div>
                  <div className="column">Role</div>
                  <div className="column">Created</div>
                  <div className="column">Last Login</div>
                  <div className="column">Actions</div>
                </div>

                {users.map(user => (
                  <div key={user.id} className={`table-row ${user.id === currentUser.id ? 'current-user' : ''}`}>
                    <div className="column username">
                      {user.username}
                      {user.id === currentUser.id && <span className="you-label">(You)</span>}
                    </div>
                    <div className="column email">{user.email}</div>
                    <div className="column role">
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </div>
                    <div className="column date">{formatDate(user.createdAt)}</div>
                    <div className="column date">
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                    </div>
                    <div className="column actions">
                      {user.id !== currentUser.id && (
                        <>
                          <button
                            className={`role-button ${user.role === 'admin' ? 'demote' : 'promote'}`}
                            onClick={() => handleToggleRole(user.id, user.role, user.username)}
                            disabled={actionLoading === user.id}
                          >
                            {actionLoading === user.id ? 'Loading...' : user.role === 'admin' ? 'Demote' : 'Promote'}
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            disabled={actionLoading === user.id}
                          >
                            {actionLoading === user.id ? '⏳' : '🗑️ Delete'}
                          </button>
                        </>
                      )}
                      {user.id === currentUser.id && (
                        <span className="self-label">Cannot modify own account</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
