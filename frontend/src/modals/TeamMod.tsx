// TeamMod.tsx — Modal component; displays detailed member profiles, activity logs, and administrative controls.
import { useState } from 'react';
import type { TeamMember, Activity } from '../types';
import { X, History, Clock, ShieldCheck, UserX } from 'lucide-react';
import { getInitials } from '../lib/userUtils';

interface TeamModProps {
  member: TeamMember;
  activities: Activity[];
  isAdmin: boolean;
  onClose: () => void;
  onToggleAdmin: (id: string) => void;
  onRemove: (id: string) => void;
}

/**
 * Modal for viewing team member details and managing permissions.
 */
export const TeamMod = ({ member, activities, isAdmin, onClose, onToggleAdmin, onRemove }: TeamModProps) => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const initials = getInitials(member.name);
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content team-member-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header-between">
          <div className="modal-title">Team Member Details</div>
          <button className="close-btn-static" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        
        <div className="profile-av-wrap">
          <div className="profile-av">{initials}</div>
          <div className="pane-name">{member.name}</div>
          <div className="pane-sub">{member.position} • {member.role}</div>
        </div>
        
        <div className="pane-section">
          <div className="ps-lbl">Contact Details</div>
          <div className="ps-row">
            <span className="ps-key">Email</span>
            <span className="ps-val">{member.email}</span>
          </div>
          <div className="ps-row">
            <span className="ps-key">Phone</span>
            <span className="ps-val">{member.phone}</span>
          </div>
        </div>
        
        <div className="pane-section">
          <div className="ps-lbl">
            <History size={14} /> Performance Log
          </div>
          <div className="activity-list activity-list-scroll">
            {activities.length > 0 ? (
              activities.map((a, i) => (
                <div key={i} className="activity-item">
                  <div className="a-icon-wrap">
                    <Clock size={12} />
                  </div>
                  <div className="a-info">
                    <div className="a-desc">
                      <strong>{a.type}</strong> on {a.contactName}
                    </div>
                    <div className="a-date">{a.desc} • {a.date}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="ps-notes-empty">No activity recorded.</div>
            )}
          </div>
        </div>
        
        {isAdmin && member.name !== "Divyesh Mangla" && (
          <div className="modal-footer-border">
            {!isConfirmingRemove ? (
              <div className="admin-actions">
                <button className="admin-btn" onClick={() => onToggleAdmin(member.id)}>
                  <ShieldCheck size={16} /> 
                  {member.role === 'Admin' ? 'Revoke Admin' : 'Make Admin'}
                </button>
                <button className="remove-btn-outline" onClick={() => setIsConfirmingRemove(true)}>
                  <UserX size={16} /> Remove User
                </button>
              </div>
            ) : (
              <div className="remove-confirm-row">
                <button className="cancel-btn" onClick={() => setIsConfirmingRemove(false)}>
                  Cancel
                </button>
                <button className="confirm-btn" onClick={() => { onRemove(member.id); onClose(); }}>
                  Confirm Remove
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
