// MessagePreviewModal.tsx — Modal component; allows previewing and editing outreach messages with dynamic placeholder replacement.
import { useState } from 'react';
import type { Contact, UserProfile, Organization } from '../types';
import { X, Download, Copy, Check, Info } from 'lucide-react';
import { fillPlaceholders } from '../lib/templateUtils';

interface MessagePreviewModalProps {
  type: string;
  template: string;
  contact: Contact;
  user: UserProfile;
  org: Organization;
  onClose: () => void;
}

/**
 * Modal for finalizing and sending outreach messages via WhatsApp or Email.
 */
export const MessagePreviewModal = ({ type, template, contact, user, org, onClose }: MessagePreviewModalProps) => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const initialMessage = fillPlaceholders(template, { contact, user, org });
  const [message, setMessage] = useState(initialMessage);
  const [isCopied, setIsCopied] = useState(false);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  /**
   * Copies the final message text to the user's clipboard.
   */
  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  /**
   * Opens WhatsApp Web or Desktop with the pre-filled message.
   */
  const handleSendWhatsApp = () => {
    const cleanPhone = contact.phone.replace(/\D/g, '');
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMsg}`, '_blank');
  };

  /**
   * Triggers a download of the organization's marketing proposal PDF.
   */
  const handleDownload = () => {
    if (!org.proposalData) return;
    const link = document.createElement("a");
    link.href = org.proposalData;
    link.download = org.proposalFileName;
    link.click();
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content message-preview-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header-between">
          <div className="modal-title">Preview {type} Draft</div>
          <button className="close-btn-static" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        
        <div className="pane-section">
          <div className="ps-lbl">Edit message before sending</div>
          <textarea 
            className="ps-notes-area preview-area" 
            value={message} 
            onChange={e => setMessage(e.target.value)} 
          />
        </div>

        <div className="modal-footer-spaced">
          {org.proposalFileName ? (
            <button className="proposal-btn" onClick={handleDownload}>
              <Download size={16} /> PDF Proposal
            </button>
          ) : (
            <div className="no-proposal-hint">
              <Info size={16} /> No Proposal
            </div>
          )}
          
          {type === 'WhatsApp' ? (
            <button className="whatsapp-btn" onClick={handleSendWhatsApp}>
              Open in WhatsApp
            </button>
          ) : (
            <button className="create-btn copy-btn" onClick={handleCopy}>
              {isCopied ? <><Check size={18} /> Copied!</> : <><Copy size={18} /> Copy Message</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
