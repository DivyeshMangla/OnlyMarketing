// Login.tsx — Page component; handles user authentication (login and registration) with a unified form.
import { useState } from 'react';
import { ShieldCheck, Mail, Lock, ArrowRight, User } from 'lucide-react';
import { authApi } from '../features/auth/auth.api';
import type { UserProfile } from '../types';

interface LoginProps {
  onLogin: (token: string, user: UserProfile) => void;
}

/**
 * Authentication page for signing in or creating a new account.
 */
export const Login = ({ onLogin }: LoginProps) => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    birth: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = isRegister 
        ? await authApi.register(formData)
        : await authApi.login({ email: formData.email, password: formData.password });

      if (res.token) {
        onLogin(res.token, res.user);
      } else {
        setError('Authentication failed');
      }
    } catch (err: any) {
      setError(err.message || 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="login-page">
      <div className="modal-content login-box">
        <div className="login-header">
          <div className="login-logo-full-container">
            <img src="/logo.png" alt="OnlyMarketing" className="login-logo-full" />
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="input-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input 
                  className="form-input" 
                  placeholder="Your Name" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input 
                type="email" 
                className="form-input" 
                placeholder="name@college.edu" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input 
                type="password" 
                autoComplete="current-password"
                className="form-input" 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                required 
              />
            </div>
          </div>

          {isRegister && (
            <div className="form-grid-2">
              <div className="input-group">
                <label className="form-label">Phone</label>
                <input 
                  className="form-input" 
                  placeholder="Phone" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
              </div>
              <div className="input-group">
                <label className="form-label">Birth Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={formData.birth} 
                  onChange={e => setFormData({...formData, birth: e.target.value})} 
                />
              </div>
            </div>
          )}

          <button type="submit" className="create-btn login-submit" disabled={loading}>
            {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')} <ArrowRight size={18} />
          </button>
        </form>

        <div className="login-footer">
          {isRegister ? 'Already have an account?' : "Don't have an account?"} {' '}
          <span onClick={() => setIsRegister(!isRegister)} className="login-toggle">
            {isRegister ? 'Sign In' : 'Register Now'}
          </span>
        </div>
      </div>
    </div>
  );
};
