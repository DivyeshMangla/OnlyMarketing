// DetailsPane.tsx — Side pane component; displays comprehensive details for a single contact, including activity and notes.
import { useState, useEffect } from 'react';
import type { Contact, ContactStatus, Activity } from '../types';
import { Badge } from '../components/Badge';
import { X, Clock, Trash2, Check } from 'lucide-react';

interface DetailsPaneProps {
  contact: Contact | null;
  onClose: () => void;
  onNotesChange: (notes: string) => void;
  onRemove: (id: string) => void;
  onStatusChange: (status: ContactStatus) => void;
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

  // ─── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (contact) {
      setLocalNotes(contact.notes);
      setIsSaved(false);
      setShowStatusDropdown(false);
      setIsConfirmingRemove(false);
    }
  }, [contact?.id]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleSave = () => {
    onNotesChange(localNotes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
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
              <div className="status-selector" onClick={() => setShowStatusDropdown(!showStatusDropdown)}>
                <Badge status={contact.status} />
              </div>
              <div className="added-by">Added by {contact.addedBy}</div>
              {showStatusDropdown && (
                <div className="status-dropdown">
                  {STATUS_OPTIONS.map(s => (
                    <div 
                      key={s} 
                      className={`status-option ${contact.status === s ? 'active' : ''}`} 
                      onClick={() => { onStatusChange(s); setShowStatusDropdown(false); }}
                    >
                      <div className={`status-dot ${s.toLowerCase().replace(/ /g, '-')}`} />
                      {s}
                    </div>
                  ))}
                </div>
              )}
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
                onChange={(e) => setLocalNotes(e.target.value)} 
              />
              <button className="save-notes-btn" onClick={handleSave}>
                {isSaved ? <><Check size={14} style={{marginRight: 6}}/> Saved</> : 'Save Notes'}
              </button>
            </div>
            <div className="pane-section pane-activity-section">
              <div className="ps-lbl">Activity Log</div>
              <div className="activity-list">
                {contact.activity.map((a: Activity, i: number) => (
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
            </div>
          </div>
          <div className="pane-footer">
            {!isConfirmingRemove ? (
              <button className="remove-contact-btn" onClick={() => setIsConfirmingRemove(true)}>
                <Trash2 size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Remove Contact
              </button>
            ) : (
              <div className="remove-confirm-row">
                <button className="cancel-btn" onClick={() => setIsConfirmingRemove(false)}>Cancel</button>
                <button className="confirm-btn" onClick={() => onRemove(contact.id)}>Confirm Delete</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
