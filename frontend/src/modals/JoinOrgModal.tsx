import { useState, useEffect } from 'react';
import { X, Search, Send } from 'lucide-react';
import { Organization } from '../types';

interface JoinOrgModalProps {
  onClose: () => void;
  onDiscover: () => Promise<Partial<Organization>[]>;
  onJoin: (id: string) => Promise<void>;
}

export const JoinOrgModal = ({ onClose, onDiscover, onJoin }: JoinOrgModalProps) => {
  const [orgs, setOrgs] = useState<Partial<Organization>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [requestedIds, setRequestedIds] = useState<string[]>([]);

  useEffect(() => {
    onDiscover().then(data => {
      setOrgs(data);
      setLoading(false);
    });
  }, [onDiscover]);

  const handleRequest = async (id: string) => {
    await onJoin(id);
    setRequestedIds(prev => [...prev, id]);
  };

  const filteredOrgs = orgs.filter(o => o.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header-between">
          <div className="modal-title">Join Organization</div>
          <button className="close-btn-static" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="srch-wrap" style={{ marginTop: 16, marginBottom: 16 }}>
          <Search size={18} className="srch-icon" />
          <input 
            className="srch" 
            placeholder="Search organizations..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>

        <div className="org-join-list" style={{ maxHeight: 300, overflowY: 'auto' }}>
          {loading ? (
            <div className="empty-state">Loading...</div>
          ) : filteredOrgs.length > 0 ? (
            filteredOrgs.map(o => (
              <div key={o.id} className="org-join-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="org-join-info">
                  <div className="org-join-name" style={{ fontWeight: 600 }}>{o.name}</div>
                </div>
                {requestedIds.includes(o.id!) ? (
                  <div className="requested-tag" style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <Send size={12} style={{ marginRight: 4 }} /> Requested
                  </div>
                ) : (
                  <button className="create-btn" onClick={() => handleRequest(o.id!)} style={{ padding: '6px 12px', fontSize: 13 }}>
                    Request to Join
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state">No organizations found.</div>
          )}
        </div>

        <div className="modal-footer" style={{ marginTop: 20 }}>
          <button className="cancel-modal-btn" onClick={onClose} style={{ width: '100%' }}>Close</button>
        </div>
      </div>
    </div>
  );
};
