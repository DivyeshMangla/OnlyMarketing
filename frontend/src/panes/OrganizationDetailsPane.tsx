// OrganizationDetailsPane.tsx — Side pane component; allows editing of organization assets and outreach message templates.
import { useState, useEffect, useRef } from 'react';
import type { Organization, UserProfile, MemberStatus, OrgRole } from '../types';
import { X, FileText, Upload, Check, Download, Trash2, Shield, User } from 'lucide-react';

interface OrganizationDetailsPaneProps {
  org: Organization | null;
  userProfile: UserProfile | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Organization>) => Promise<Organization | undefined>;
  onUpdateMember: (orgId: string, userId: string, status?: MemberStatus, role?: OrgRole) => Promise<Organization | undefined>;
  onRemoveMember: (orgId: string, userId: string) => Promise<Organization | undefined>;
  onRemoveOrg: (id: string) => Promise<void>;
}

/**
 * Slide-out pane for managing organization-level assets (proposals), templates, and members.
 */
export const OrganizationDetailsPane = ({ 
  org, 
  userProfile, 
  onClose, 
  onUpdate, 
  onUpdateMember, 
  onRemoveMember,
  onRemoveOrg 
}: OrganizationDetailsPaneProps) => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [localData, setLocalData] = useState<Partial<Organization>>({});
  const [activeTab, setActiveTab] = useState<'settings' | 'members'>('settings');
  const [isSaved, setIsSaved] = useState(false);
  const [isRemovingOrg, setIsRemovingOrg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwner = org?.members.find(m => m.userId === userProfile?.id)?.role === 'Owner' || userProfile?.role === 'Admin';
  const isAdmin = org?.members.find(m => m.userId === userProfile?.id)?.role === 'Admin' || isOwner;
  const members = localData.members ?? org?.members ?? [];
  const pendingMembers = members.filter(m => m.status === 'Pending');
  const approvedMembers = members.filter(m => m.status === 'Approved');

  // ─── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (org) {
      setLocalData(org);
      setIsSaved(false);
      setIsRemovingOrg(false);
      setError('');
    }
  }, [org]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!org) return;
    try {
      setIsSubmitting(true);
      setError('');
      const updated = await onUpdate(org.id, localData);
      if (updated) {
        setLocalData(updated);
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrg = async () => {
    if (!org) return;
    try {
      setIsSubmitting(true);
      setError('');
      await onRemoveOrg(org.id);
      setIsRemovingOrg(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMember = async (userId: string, status?: MemberStatus, role?: OrgRole) => {
    if (!org) return;
    try {
      setIsSubmitting(true);
      setError('');
      const updated = await onUpdateMember(org.id, userId, status, role);
      if (updated) {
        setLocalData(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!org) return;
    try {
      setIsSubmitting(true);
      setError('');
      const updated = await onRemoveMember(org.id, userId);
      if (updated) {
        setLocalData(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Converts a selected file into a Base64 string for storage.
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setLocalData({ ...localData, proposalFileName: file.name, proposalData: result });
      }
    };
    reader.readAsDataURL(file);
  };

  /**
   * Triggers a browser download of the stored proposal asset.
   */
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!localData.proposalData || !localData.proposalFileName) return;
    
    const link = document.createElement('a');
    link.href = localData.proposalData;
    link.download = localData.proposalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Clears the current proposal asset from local state.
   */
  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalData({ ...localData, proposalFileName: '', proposalData: '' });
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`side-pane ${org ? 'open' : ''}`}>
      {org && (
        <>
          <div className="pane-header">
            <button className="close-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
            <div className="pane-top-info">
              <div>
                <div className="pane-name">{org.name}</div>
                <div className="pane-sub">{activeTab === 'settings' ? 'Settings & Templates' : 'Member Management'}</div>
              </div>
            </div>
            {isOwner && (
              <div className="pane-tabs">
                <button className={`p-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
                <button className={`p-tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>
                  Members {pendingMembers.length > 0 && <span className="p-badge-count">{pendingMembers.length}</span>}
                </button>
              </div>
            )}
          </div>
          <div className="pane-content">
            {activeTab === 'settings' ? (
              <>
                <div className="pane-section">
                  <div className="ps-lbl">Marketing Proposal (PDF)</div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept=".pdf" 
                    style={{ display: 'none' }} 
                  />
                  <div className="file-upload-zone" onClick={() => !localData.proposalFileName && isAdmin && fileInputRef.current?.click()}>
                    {localData.proposalFileName ? (
                      <div className="file-info-active">
                        <div className="file-main">
                          <FileText size={20} />
                          <span className="file-name-text">{localData.proposalFileName}</span>
                        </div>
                        <div className="file-actions">
                          <button className="file-action-btn dl" onClick={handleDownload} title="Download">
                            <Download size={16} />
                          </button>
                          {isAdmin && (
                            <button className="file-action-btn del" onClick={handleClearFile} title="Remove">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                    <div className="file-info text-muted">
                      <Upload size={20} /> {isAdmin ? 'Click to upload PDF' : 'No proposal uploaded'}
                    </div>
                  )}
                </div>
                </div>
                
                <div className="pane-section">
                  <div className="ps-lbl">Email Template</div>
                  <textarea 
                    className="ps-notes-area template-area-email" 
                    value={localData.emailTemplate || ''} 
                    disabled={!isAdmin || isSubmitting}
                    onChange={e => setLocalData({...localData, emailTemplate: e.target.value})} 
                    placeholder="Hi {{poc_name}}..." 
                  />
                </div>
                
                <div className="pane-section">
                  <div className="ps-lbl">WhatsApp Template</div>
                  <textarea 
                    className="ps-notes-area template-area-small" 
                    value={localData.whatsappTemplate || ''} 
                    disabled={!isAdmin || isSubmitting}
                    onChange={e => setLocalData({...localData, whatsappTemplate: e.target.value})} 
                    placeholder="Hey {{poc_name}}!" 
                  />
                </div>
                
                <div className="pane-section">
                  <div className="ps-lbl">Instagram Template</div>
                  <textarea 
                    className="ps-notes-area template-area-small" 
                    value={localData.instaTemplate || ''} 
                    disabled={!isAdmin || isSubmitting}
                    onChange={e => setLocalData({...localData, instaTemplate: e.target.value})} 
                    placeholder="Hi there!" 
                  />
                </div>
                
                {isAdmin && (
                  <button className="save-notes-btn save-settings-btn" onClick={() => void handleSave()} disabled={isSubmitting}>
                    {isSaved ? <><Check size={14} className="btn-icon" /> Settings Saved</> : isSubmitting ? 'Saving...' : 'Save Settings'}
                  </button>
                )}
                {error && <div className="error-banner">{error}</div>}
              </>
            ) : (
              <div className="pane-members-list">
                {pendingMembers.length > 0 && (
                  <div className="pane-section">
                    <div className="ps-lbl">Pending Requests</div>
                    {pendingMembers.map(m => (
                      <div key={m.userId} className="member-item-row">
                        <div className="m-info">
                          <div className="m-name">{m.user?.name || 'Unknown'}</div>
                          <div className="m-email">{m.user?.email || '-'}</div>
                        </div>
                        <div className="m-acts">
                          <button className="m-act-approve" onClick={() => void handleUpdateMember(m.userId, 'Approved')} disabled={isSubmitting}><Check size={16} /></button>
                          <button className="m-act-reject" onClick={() => void handleRemoveMember(m.userId)} disabled={isSubmitting}><X size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="pane-section">
                  <div className="ps-lbl">Approved Members</div>
                  {approvedMembers.length > 0 ? approvedMembers.map(m => (
                    <div key={m.userId} className="member-item-row">
                      <div className="m-info">
                        <div className="m-name">{m.user?.name || 'Unknown'} {m.userId === userProfile?.id && '(You)'}</div>
                        <div className="m-role-badge">
                          {m.role === 'Owner' ? <Shield size={12} className="btn-icon" /> : <User size={12} className="btn-icon" />}
                          {m.role}
                        </div>
                      </div>
                      <div className="m-acts">
                        {isOwner && m.role !== 'Owner' && (
                          <>
                            <select 
                              className="m-role-select" 
                              value={m.role} 
                              disabled={isSubmitting}
                              onChange={(e) => void handleUpdateMember(m.userId, undefined, e.target.value as OrgRole)}
                            >
                              <option value="Member">Member</option>
                              <option value="Admin">Admin</option>
                            </select>
                            <button className="m-act-remove" onClick={() => void handleRemoveMember(m.userId)} disabled={isSubmitting}><Trash2 size={14} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="ps-notes-empty">No approved members yet.</div>
                  )}
                </div>

                {isOwner && (
                  <div className="pane-footer pane-footer-inline">
                    {!isRemovingOrg ? (
                      <button className="remove-contact-btn" onClick={() => setIsRemovingOrg(true)}>
                        <Trash2 size={16} className="btn-icon" /> Delete Organization
                      </button>
                    ) : (
                      <div className="remove-confirm-row">
                        <button className="cancel-btn" onClick={() => setIsRemovingOrg(false)}>Cancel</button>
                        <button className="confirm-btn" onClick={() => void handleDeleteOrg()} disabled={isSubmitting}>
                          {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {error && <div className="error-banner">{error}</div>}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
