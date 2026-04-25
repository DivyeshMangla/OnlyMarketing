// AllContacts.tsx — Page component; displays a searchable list of all contacts with analytics stats.
import { useState, useMemo } from 'react';
import type { Contact } from '../types';
import { TableRow } from '../components/TableRow';
import { Plus, ChevronRight } from 'lucide-react';
import { getContactStats, searchContacts } from '../lib/contactUtils';

interface AllContactsProps {
  contacts: Contact[];
  onSelect: (id: string) => void;
  onAddClick: () => void;
}

/**
 * Main contacts list page with search and summary statistics.
 */
export const AllContacts = ({ contacts, onSelect, onAddClick }: AllContactsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const stats = useMemo(() => getContactStats(contacts), [contacts]);
  const filteredContacts = useMemo(() => searchContacts(contacts, searchQuery), [contacts, searchQuery]);

  return (
    <div className="page">
      <div className="page-title">All Contacts & Analytics</div>
      <div className="page-sub">Overview of all outreach contacts and their current status</div>
      
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-lbl">Total Contacts</div>
          <div className="stat-val">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">In The Works</div>
          <div className="stat-val">{stats.inTheWorks}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Denied</div>
          <div className="stat-val">{stats.denied}</div>
        </div>
      </div>
      
      <div className="tbl-wrap">
        <div className="tbl-toolbar">
          <input 
            className="srch" 
            placeholder="Search contacts…" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="button" className="fbtn" disabled>
            Status
            <ChevronRight size={14} className="chevron-icon chevron-icon-open" />
          </button>
          <button className="add-btn ml-auto" onClick={onAddClick}>
            <Plus size={16} className="btn-icon" /> Add Contact
          </button>
        </div>
        
        <div className="tbl-head ac">
          <div className="th">Contact</div>
          <div className="th">Email</div>
          <div className="th">Phone</div>
          <div className="th">Status</div>
          <div className="th">Added</div>
        </div>
        
        <div className="tbl-body">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((c) => (
              <TableRow key={c.id} contact={c} onClick={() => onSelect(c.id)} />
            ))
          ) : (
            <div className="empty-state">No contacts found.</div>
          )}
        </div>
      </div>
    </div>
  );
};
