// Organizations.tsx — Page component; displays a grid of organizations for management and template editing.
import type { Organization } from '../types';
import { Plus, Building, ChevronRight } from 'lucide-react';

interface OrganizationsProps {
  orgs: Organization[];
  onSelect: (o: Organization) => void;
  onAddClick: () => void;
}

/**
 * Organizations management page showing a grid of all registered fests.
 */
export const Organizations = ({ orgs, onSelect, onAddClick }: OrganizationsProps) => (
  <div className="page">
    <div className="page-title">Organizations</div>
    <div className="page-sub">Manage fests and their outreach templates here.</div>
    <div className="page-toolbar">
      <button className="add-btn" onClick={onAddClick}>
        <Plus size={16} style={{ marginRight: 8 }} /> Add New Organization
      </button>
    </div>
    <div className="team-grid">
      {orgs.map((o) => (
        <div key={o.id} className="member-card org-card" onClick={() => onSelect(o)}>
          <div className="mc-top">
            <div className="mc-av mc-av-org">
              <Building size={24} />
            </div>
            <div>
              <div className="mc-name">{o.name}</div>
              <div className="mc-role">{o.proposalFileName ? 'Proposal Attached' : 'No Proposal'}</div>
            </div>
          </div>
          <div className="mc-footer">
            <div className="mc-hint">Click to edit templates</div>
            <ChevronRight size={16} className="mc-arrow" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
