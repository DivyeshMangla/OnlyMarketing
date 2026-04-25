// Dashboard.tsx — Page component; provides a personalized view of contacts added by the current user.
import { useState } from 'react';
import type { Contact } from '../types';
import { TableRow } from '../components/TableRow';
import { Plus } from 'lucide-react';
import { filterMyContacts, searchContacts } from '../lib/contactUtils';

interface DashboardProps {
  contacts: Contact[];
  onSelect: (id: string) => void;
  onAddClick: () => void;
}

/**
 * Personalized dashboard showing only "My Contacts".
 */
export const Dashboard = ({ contacts, onSelect, onAddClick }: DashboardProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const myContacts = filterMyContacts(contacts);
  const filteredContacts = searchContacts(myContacts, searchQuery);

  return (
    <div className="page">
      <div className="page-title">Dashboard</div>
      <div className="page-sub">Contacts you've personally added</div>
      
      <div className="tbl-wrap">
        <div className="tbl-toolbar">
          <input 
            className="srch" 
            placeholder="Search your contacts…" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
