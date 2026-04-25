// TeamMembers.tsx — Page component; displays a grid of all team members and their system roles.
import type { TeamMember } from '../types';
import { UserCircle } from 'lucide-react';

interface TeamMembersProps {
  team: TeamMember[];
  onViewProfile: (m: TeamMember) => void;
}

/**
 * Team directory page for viewing and managing member permissions.
 */
export const TeamMembers = ({ team, onViewProfile }: TeamMembersProps) => (
  <div className="page">
    <div className="page-title">Team Members</div>
    <div className="page-sub">Manage your team members and their permissions here.</div>
    <div className="team-grid">
      {team.map((m) => (
        <div key={m.id} className="member-card">
          <div className="mc-top">
            <div className="mc-av">
              <UserCircle size={28} color="#a78bfa" strokeWidth={1.5} />
            </div>
            <div>
              <div className="mc-name">{m.name}</div>
              <div className="mc-role">{m.position} • {m.role}</div>
            </div>
          </div>
          <div className="mc-btns">
            <button className="mc-btn mc-view" onClick={() => onViewProfile(m)}>
              View Profile
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
