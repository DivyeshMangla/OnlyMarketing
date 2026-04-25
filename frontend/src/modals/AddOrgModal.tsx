// AddOrgModal.tsx — Modal component; provides a simple form to initialize a new organization.
import { useState } from 'react';

interface AddOrgModalProps {
  onClose: () => void;
  onAdd: (name: string) => void;
}

/**
 * Overlay modal for creating a new organization/fest entry.
 */
export const AddOrgModal = ({ onClose, onAdd }: AddOrgModalProps) => {
  const [name, setName] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(name);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-title">New Organization</div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Organization Name</label>
            <input 
              autoFocus 
              className="form-input" 
              placeholder="e.g. Saturnalia" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-modal-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="create-btn">
              Create Organization
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
