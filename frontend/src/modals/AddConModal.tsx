// AddConModal.tsx — Modal component; providing a form to create a new contact entry.
import { useState } from 'react';
import { X } from 'lucide-react';
import type { CreateContactPayload } from '../types';

interface AddConModalProps {
  onClose: () => void;
  onAdd: (data: CreateContactPayload) => void;
  hasOrg: boolean;
}

/**
 * Overlay modal for adding a new contact to the active organization.
 */
export const AddConModal = ({ onClose, onAdd, hasOrg }: AddConModalProps) => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<CreateContactPayload>({ 
    orgId: '', 
    name: '', 
    co: '', 
    position: '', 
    email: '', 
    phone: '' 
  });
  
  const isValid = formData.name && formData.co && formData.position;
  
  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onAdd(formData);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header-between">
          <div className="modal-title">New Contact</div>
          <button className="close-btn-static" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input 
              autoFocus 
              className="form-input" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
              disabled={false} 
            />
          </div>
          
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Company *</label>
              <input 
                className="form-input" 
                value={formData.co} 
                onChange={e => setFormData({...formData, co: e.target.value})} 
                required 
                disabled={!hasOrg} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Position *</label>
              <input 
                className="form-input" 
                value={formData.position} 
                onChange={e => setFormData({...formData, position: e.target.value})} 
                required 
                disabled={!hasOrg} 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Email (Optional)</label>
            <input 
              className="form-input" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              disabled={false} 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Phone (Optional)</label>
            <input 
              className="form-input" 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
              disabled={!hasOrg} 
            />
          </div>
          
          <div className="modal-footer">
            <button type="button" className="cancel-modal-btn" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="create-btn" 
              disabled={!isValid}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
