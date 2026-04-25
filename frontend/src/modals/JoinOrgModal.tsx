import { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import type { Organization } from '../types';

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
  const [error, setError] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadOrgs = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await onDiscover();
        if (active) {
          setOrgs(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load organizations');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadOrgs();

    return () => {
      active = false;
    };
  }, [onDiscover]);

  const handleRequest = async (id: string) => {
    try {
      setPendingId(id);
      setError('');
      await onJoin(id);
      setRequestedIds(prev => [...prev, id]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send join request');
    } finally {
      setPendingId(null);
    }
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
                  <div className="requested-tag" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', marginLeft: 16 }}>
                    <Check size={14} style={{ marginRight: 4 }} /> Request Sent!
                  </div>
                ) : (
                  <button className="create-btn" disabled={pendingId === o.id} onClick={() => void handleRequest(o.id!)} style={{ padding: '8px 16px', fontSize: 13, width: 'auto', marginLeft: 16, flexShrink: 0 }}>
                    {pendingId === o.id ? 'Sending...' : 'Request to Join'}
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state">No organizations found.</div>
          )}
        </div>
        {error && <div className="error-banner">{error}</div>}

        <div className="modal-footer" style={{ marginTop: 20 }}>
          <button className="cancel-modal-btn" onClick={onClose} style={{ width: '100%' }}>Close</button>
        </div>
      </div>
    </div>
  );
};
