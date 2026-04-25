// ProfModal.tsx — Modal component; allows users to view and update their profile settings and log out.
import { useState } from 'react';
import type { UserProfile, UserPosition } from '../types';
import { ShieldCheck, LogOut } from 'lucide-react';
import { getInitials } from '../lib/userUtils';

interface ProfModalProps {
  profile: UserProfile;
  onClose: () => void;
  onSave: (p: Partial<UserProfile>) => void;
  onLogout: () => void;
}

/**
 * Overlay modal for user profile management.
 */
export const ProfModal = ({ profile, onClose, onSave, onLogout }: ProfModalProps) => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState(profile);
  const initials = getInitials(formData.name);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Profile Settings</div>
        <div className="profile-av-wrap">
          <div className="profile-av">{initials}</div>
        </div>
        <form className="modal-form">
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input 
                className="form-input" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Account Role</label>
              <div className="form-input-readonly">
                <ShieldCheck size={14} /> {formData.role}
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Position</label>
            <select 
              className="form-select" 
              value={formData.position} 
              onChange={e => setFormData({...formData, position: e.target.value as UserPosition})}
            >
              <option value="Executive">Executive</option>
              <option value="Core">Core</option>
              <option value="Coordinator">Coordinator</option>
              <option value="Executive Board">Executive Board</option>
            </select>
          </div>
          
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input 
                className="form-input" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Birth Date</label>
              <input 
                className="form-input" 
                type="date" 
                value={formData.birth} 
                onChange={e => setFormData({...formData, birth: e.target.value})} 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              className="form-input" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
            />
          </div>
          
          <div className="modal-footer">
            <button type="button" className="cancel-modal-btn" onClick={onClose}>
              Close
            </button>
            <button 
              type="button" 
              className="create-btn" 
              onClick={() => { onSave(formData); onClose(); }}
            >
              Save Profile
            </button>
          </div>

          <div className="modal-logout-zone">
            <button 
              type="button" 
              className="logout-btn" 
              onClick={onLogout}
            >
              <LogOut size={16} /> Log Out of Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
