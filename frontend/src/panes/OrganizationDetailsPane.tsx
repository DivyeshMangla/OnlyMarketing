// OrganizationDetailsPane.tsx — Side pane component; allows editing of organization assets and outreach message templates.
import { useState, useEffect, useRef } from 'react';
import type { Organization } from '../types';
import { X, FileText, Upload, Check, Download, Trash2 } from 'lucide-react';

interface OrganizationDetailsPaneProps {
  org: Organization | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Organization>) => void;
}

/**
 * Slide-out pane for managing organization-level assets (proposals) and templates.
 */
export const OrganizationDetailsPane = ({ org, onClose, onUpdate }: OrganizationDetailsPaneProps) => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [localData, setLocalData] = useState<Partial<Organization>>({});
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (org) {
      setLocalData(org);
      setIsSaved(false);
    }
  }, [org?.id]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!org) return;
    onUpdate(org.id, localData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
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
                <div className="pane-sub">Settings & Templates</div>
              </div>
            </div>
          </div>
          <div className="pane-content">
            <div className="pane-section">
              <div className="ps-lbl">Marketing Proposal (PDF)</div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".pdf" 
                style={{ display: 'none' }} 
              />
              <div className="file-upload-zone" onClick={() => !localData.proposalFileName && fileInputRef.current?.click()}>
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
                      <button className="file-action-btn del" onClick={handleClearFile} title="Remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="file-info text-muted">
                    <Upload size={20} /> Click to upload PDF
                  </div>
                )}
              </div>
            </div>
            
            <div className="pane-section">
              <div className="ps-lbl">Email Template</div>
              <textarea 
                className="ps-notes-area template-area-email" 
                value={localData.emailTemplate || ''} 
                onChange={e => setLocalData({...localData, emailTemplate: e.target.value})} 
                placeholder="Hi {{poc_name}}..." 
              />
            </div>
            
            <div className="pane-section">
              <div className="ps-lbl">WhatsApp Template</div>
              <textarea 
                className="ps-notes-area template-area-small" 
                value={localData.whatsappTemplate || ''} 
                onChange={e => setLocalData({...localData, whatsappTemplate: e.target.value})} 
                placeholder="Hey {{poc_name}}!" 
              />
            </div>
            
            <div className="pane-section">
              <div className="ps-lbl">Instagram Template</div>
              <textarea 
                className="ps-notes-area template-area-small" 
                value={localData.instaTemplate || ''} 
                onChange={e => setLocalData({...localData, instaTemplate: e.target.value})} 
                placeholder="Hi there!" 
              />
            </div>
            
            <button className="save-notes-btn save-settings-btn" onClick={handleSave}>
              {isSaved ? <><Check size={14} style={{marginRight: 6}}/> Settings Saved</> : 'Save Settings'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
