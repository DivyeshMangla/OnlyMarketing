// DetailsPane.tsx — Side pane component; displays comprehensive details for a single contact, including activity and notes.
import { useState, useEffect } from 'react';
import type { Contact, ContactStatus, Activity } from '../types';
import { Badge } from '../components/Badge';
import { X, Clock, Trash2, Check } from 'lucide-react';

interface DetailsPaneProps {
  contact: Contact | null;
  onClose: () => void;
  onNotesChange: (notes: string) => Promise<Contact | undefined>;
  onRemove: (id: string) => Promise<void>;
  onStatusChange: (status: ContactStatus) => Promise<Contact | undefined>;
  onActionClick: (type: string) => void;
}

const STATUS_OPTIONS: ContactStatus[] = ['Added', 'In The Works', 'Denied'];

/**
 * Slide-out pane for viewing and editing contact specific details.
 */
export const DetailsPane = ({ contact, onClose, onNotesChange, onRemove, onStatusChange, onActionClick }: DetailsPaneProps) => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [localNotes, setLocalNotes] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ─── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (contact) {
      setLocalNotes(contact.notes);
      setIsSaved(false);
      setShowStatusDropdown(false);
      setIsConfirmingRemove(false);
      setError('');
    }
  }, [contact]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      const updated = await onNotesChange(localNotes);
      setLocalNotes(updated?.notes ?? localNotes);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusSelect = async (status: ContactStatus) => {
    try {
      setIsSubmitting(true);
      setError('');
      await onStatusChange(status);
      setShowStatusDropdown(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      await onRemove(contact!.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`side-pane ${contact ? 'open' : ''}`}>
      {contact && (
        <>
          <div className="pane-header">
            <button className="close-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
            <div className="pane-top-info">
              <div>
                <div className="pane-name">{contact.name}</div>
                <div className="pane-sub">{contact.position} at {contact.co}</div>
              </div>
            </div>
            <div className="pane-status-row">
              <div className="status-control">
                <div className="status-selector" onClick={() => setShowStatusDropdown(!showStatusDropdown)}>
                  <Badge status={contact.status} />
                </div>
                {showStatusDropdown && (
                  <div className="status-dropdown">
                    {STATUS_OPTIONS.map(s => (
                      <div 
                        key={s} 
                        className={`status-option ${contact.status === s ? 'active' : ''}`} 
                        onClick={() => void handleStatusSelect(s)}
                      >
                        <div className={`status-dot ${s.toLowerCase().replace(/ /g, '-')}`} />
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="added-by">Added by {contact.addedBy}</div>
            </div>
          </div>
          <div className="pane-content">
            <div className="pane-actions">
              <button className="p-act-btn" onClick={() => onActionClick('Gmail')}>Gmail</button>
              <button className="p-act-btn whatsapp" onClick={() => onActionClick('WhatsApp')}>WhatsApp</button>
              <button className="p-act-btn instagram" onClick={() => onActionClick('Instagram')}>Instagram</button>
            </div>
            <div className="pane-section">
              <div className="ps-lbl">Contact Info</div>
              <div className="ps-row">
                <span className="ps-key">Email</span>
                <span className="ps-val">{contact.email}</span>
              </div>
              <div className="ps-row">
                <span className="ps-key">Phone</span>
                <span className="ps-val">{contact.phone}</span>
              </div>
            </div>
            <div className="pane-section">
              <div className="ps-lbl">Notes</div>
              <textarea 
                className="ps-notes-area" 
                placeholder="Add notes..." 
                value={localNotes} 
                disabled={isSubmitting}
                onChange={(e) => setLocalNotes(e.target.value)} 
              />
              <button className="save-notes-btn" onClick={() => void handleSave()} disabled={isSubmitting}>
                {isSaved ? <><Check size={14} className="btn-icon" /> Saved</> : isSubmitting ? 'Saving...' : 'Save Notes'}
              </button>
              {error && <div className="error-banner">{error}</div>}
            </div>
            <div className="pane-section pane-activity-section">
              <div className="ps-lbl">Activity Log</div>
              {(contact.activity || []).length > 0 ? (
                <div className="activity-list">
                  {(contact.activity || []).map((a: Activity, i: number) => (
                    <div key={i} className="activity-item">
                      <div className="a-icon-wrap">
                        <Clock size={12} />
                      </div>
                      <div className="a-info">
                        <div className="a-desc"><strong>{a.type}:</strong> {a.desc}</div>
                        <div className="a-date">{a.date} • {a.performedBy}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ps-notes-empty">No outreach activity has been logged yet.</div>
              )}
            </div>
          </div>
          <div className="pane-footer">
            {!isConfirmingRemove ? (
              <button className="remove-contact-btn" onClick={() => setIsConfirmingRemove(true)}>
                <Trash2 size={16} className="btn-icon" />
                Remove Contact
              </button>
            ) : (
              <div className="remove-confirm-row">
                <button className="cancel-btn" onClick={() => setIsConfirmingRemove(false)}>Cancel</button>
                <button className="confirm-btn" onClick={() => void handleRemove()} disabled={isSubmitting}>
                  {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
