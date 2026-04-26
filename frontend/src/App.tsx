// App.tsx — Main application entry point for the frontend; manages routing, global state, and modal orchestration.
import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LayoutGrid, 
  Table2, 
  Users, 
  Menu, 
  ChevronRight, 
  Building,
  Search
} from 'lucide-react';

// Types
import type {
  Page,
  MessagePreviewState,
  CreateContactPayload,
  ContactStatus,
  Organization,
  MemberStatus,
  OrgRole,
  UserProfile,
} from './types';

// Hooks
import { useAuth } from './features/auth/useAuth';
import { useContacts } from './features/contacts/useContacts';
import { useOrganizations } from './features/organizations/useOrganizations';
import { useTeam } from './features/team/useTeam';

// Utils
import { getInitials } from './lib/userUtils';
import { getMemberActivities } from './lib/contactUtils';

// Components & Pages
import { Dashboard } from './pages/Dashboard';
import { AllContacts } from './pages/AllContacts';
import { TeamMembers } from './pages/TeamMembers';
import { Organizations } from './pages/Organizations';
import { Login } from './pages/Login';
import { ApolloSearch } from './pages/ApolloSearch';

// Modals & Panes
import { AddOrgModal } from './modals/AddOrgModal';
import { AddConModal } from './modals/AddConModal';
import { ProfModal } from './modals/ProfModal';
import { TeamMod } from './modals/TeamMod';
import { MessagePreviewModal } from './modals/MessagePreviewModal';
import { JoinOrgModal } from './modals/JoinOrgModal';
import { DetailsPane } from './panes/DetailsPane';
import { OrganizationDetailsPane } from './panes/OrganizationDetailsPane';

/**
 * Root application component.
 */
export default function App() {
  // ─── Hooks & State ──────────────────────────────────────────────────────────
  const { userProfile, isAuthenticated, loading: authLoading, login, logout, updateProfile } = useAuth();
  
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [expanded, setExpanded] = useState(false);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

  const { 
    organizations, 
    addOrg, 
    updateOrg, 
    discoverOrgs, 
    joinRequest, 
    updateMember: updateOrgMember, 
    removeMember: removeOrgMember,
    removeOrg,
    initialized: organizationsReady
  } = useOrganizations();
  const { contacts, addContact, updateContact, removeContact, fetchContactDetails } = useContacts(activeOrgId);
  const { team, toggleAdmin, removeMember } = useTeam();

  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [viewingMemberId, setViewingMemberId] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<MessagePreviewState | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !organizationsReady) {
      return;
    }
    setActiveOrgId((current) => {
      if (organizations.length === 0) {
        return 'none';
      }
      if (!current) {
        return organizations[0].id;
      }
      if (current === 'none') {
        return current;
      }
      return organizations.some((organization) => organization.id === current)
        ? current
        : organizations[0].id;
    });
  }, [isAuthenticated, organizations, organizationsReady]);

  useEffect(() => {
    if (selectedOrgId && !organizations.some((organization) => organization.id === selectedOrgId)) {
      setSelectedOrgId(null);
    }
  }, [organizations, selectedOrgId]);

  useEffect(() => {
    if (selectedContactId && !contacts.some((contact) => contact.id === selectedContactId)) {
      setSelectedContactId(null);
    }
  }, [contacts, selectedContactId]);

  // ─── Derived State ──────────────────────────────────────────────────────────
  const activeOrg = useMemo(() => organizations.find(o => o.id === activeOrgId) || null, [organizations, activeOrgId]);
  
  const processedContacts = useMemo(() => contacts.map(c => ({
    ...c,
    mine: c.addedById ? c.addedById === userProfile?.id : c.addedBy === userProfile?.name
  })), [contacts, userProfile?.id, userProfile?.name]);

  const selectedContact = useMemo(() => processedContacts.find(c => c.id === selectedContactId) || null, [processedContacts, selectedContactId]);
  const editingOrg = useMemo(() => organizations.find(o => o.id === selectedOrgId) || null, [organizations, selectedOrgId]);
  const viewingMember = useMemo(() => team.find(m => m.id === viewingMemberId) || null, [team, viewingMemberId]);
  const viewingMemberActivities = useMemo(() => {
    if (!viewingMember) return [];
    return [
      ...(viewingMember.activities ?? []),
      ...getMemberActivities(contacts, viewingMember.name),
    ];
  }, [contacts, viewingMember]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleAddContact = async (data: CreateContactPayload) => {
    const targetOrgId = activeOrgId || 'none';
    await addContact({ ...data, orgId: targetOrgId });
    setShowAddModal(false);
  };

  const handleSelectContact = (id: string | null) => {
    setSelectedContactId(id);
    if (id) {
      fetchContactDetails(id);
    }
  };

  const handleAddOrg = async (name: string) => {
    const newOrg = await addOrg(name);
    if (!activeOrgId || activeOrgId === 'none') setActiveOrgId(newOrg.id);
    setShowAddOrgModal(false);
  };

  const handleToggleAdmin = async (id: string) => {
    const member = team.find(m => m.id === id);
    if (!member) return;
    await toggleAdmin(id, member.role);
  };

  const handleNotesChange = useCallback(async (notes: string) => {
    if (!selectedContactId) return undefined;
    return updateContact(selectedContactId, { notes });
  }, [selectedContactId, updateContact]);

  const handleStatusChange = useCallback(async (status: ContactStatus) => {
    if (!selectedContactId) return undefined;
    return updateContact(selectedContactId, { status });
  }, [selectedContactId, updateContact]);

  const handleRemoveContact = useCallback(async (id: string) => {
    await removeContact(id);
  }, [removeContact]);

  const handleUpdateOrg = useCallback(async (id: string, updates: Partial<Organization>) => {
    return updateOrg(id, updates);
  }, [updateOrg]);

  const handleUpdateOrgMember = useCallback(async (orgId: string, userId: string, status?: MemberStatus, role?: OrgRole) => {
    return updateOrgMember(orgId, userId, status, role);
  }, [updateOrgMember]);

  const handleRemoveOrgMember = useCallback(async (orgId: string, userId: string) => {
    return removeOrgMember(orgId, userId);
  }, [removeOrgMember]);

  const handleRemoveOrg = useCallback(async (id: string) => {
    await removeOrg(id);
  }, [removeOrg]);

  const handleJoinRequest = useCallback(async (id: string) => {
    await joinRequest(id);
  }, [joinRequest]);

  const handleProfileSave = useCallback(async (profileUpdates: Partial<UserProfile>) => {
    return updateProfile(profileUpdates ?? {});
  }, [updateProfile]);

  const handleLogActivity = useCallback(async (type: string, desc: string) => {
    if (!selectedContact) return undefined;
    return updateContact(selectedContact.id, { newActivity: { type, desc } });
  }, [selectedContact, updateContact]);

  const handleActionClick = (type: string) => {
    if (!activeOrg) return;
    const template = type === 'Gmail' ? activeOrg.emailTemplate : type === 'WhatsApp' ? activeOrg.whatsappTemplate : activeOrg.instaTemplate;
    setActivePreview({ type, template });
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  if (authLoading) return null; 
  if (!isAuthenticated) return <Login onLogin={login} />;

  const userInitials = getInitials(userProfile?.name);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${expanded ? 'expanded' : 'collapsed'}`}>
        <div className="sidebar-item" style={{ marginBottom: 12, position: 'relative' }}>
          <button className="menu-btn" onClick={() => setExpanded(!expanded)} aria-label="Toggle Menu"><Menu size={20} /></button>
          {expanded && (
            <div className="org-switcher" onClick={() => setShowOrgDropdown(!showOrgDropdown)}>
              <span className="org-name">{activeOrg?.name || 'None / Personal'}</span>
              <ChevronRight size={14} className={`dropdown-chevron ${showOrgDropdown ? 'open' : ''}`} />
              {showOrgDropdown && (
                <div className="org-dropdown">
                  <div 
                    className={`org-option ${activeOrgId === 'none' ? 'active' : ''}`} 
                    onClick={(e) => { e.stopPropagation(); setActiveOrgId('none'); setShowOrgDropdown(false); }}
                  >
                    None / Personal
                  </div>
                  {organizations.map(o => (
                    <div 
                      key={o.id} 
                      className={`org-option ${activeOrgId === o.id ? 'active' : ''}`} 
                      onClick={(e) => { e.stopPropagation(); setActiveOrgId(o.id); setShowOrgDropdown(false); }}
                    >
                      {o.name}
                    </div>
                  ))}
                  <div 
                    className="org-option org-add-new" 
                    onClick={(e) => { e.stopPropagation(); setShowJoinModal(true); setShowOrgDropdown(false); }}
                  >
                    + Join New
                  </div>
                  {userProfile?.role === 'Admin' && (
                    <div 
                      className="org-option org-add-new" 
                      onClick={(e) => { e.stopPropagation(); setShowAddOrgModal(true); setShowOrgDropdown(false); }}
                    >
                      + Add New
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <nav className="sidebar-nav">
          <button className={`sidebar-item ${activePage === 'dashboard' ? 'active' : ''}`} onClick={() => { setActivePage('dashboard'); setSelectedContactId(null); setSelectedOrgId(null); }}><LayoutGrid />{expanded && <span className="sidebar-label">Dashboard</span>}</button>
          {userProfile?.role === 'Admin' && (
            <>
              <button className={`sidebar-item ${activePage === 'analytics' ? 'active' : ''}`} onClick={() => { setActivePage('analytics'); setSelectedContactId(null); setSelectedOrgId(null); }}><Table2 />{expanded && <span className="sidebar-label">Analytics</span>}</button>
              <button className={`sidebar-item ${activePage === 'apollo' ? 'active' : ''}`} onClick={() => { setActivePage('apollo'); setSelectedContactId(null); setSelectedOrgId(null); }}><Search />{expanded && <span className="sidebar-label">Apollo Search</span>}</button>
              <button className={`sidebar-item ${activePage === 'team' ? 'active' : ''}`} onClick={() => { setActivePage('team'); setSelectedContactId(null); setSelectedOrgId(null); }}><Users />{expanded && <span className="sidebar-label">Team Members</span>}</button>
            </>
          )}
          {(userProfile?.role === 'Admin' || organizations.some(o => o.members.some(m => m.userId === userProfile?.id && (m.role === 'Owner' || m.role === 'Admin')))) && (
            <button className={`sidebar-item ${activePage === 'organizations' ? 'active' : ''}`} onClick={() => { setActivePage('organizations'); setSelectedContactId(null); setSelectedOrgId(null); }}><Building />{expanded && <span className="sidebar-label">Organizations</span>}</button>
          )}
        </nav>
        <div className="s-spacer" />
        <div className="sidebar-item sidebar-user-btn" onClick={() => setShowProfileModal(true)}>
          <div className="s-av">{userInitials}</div>
          {expanded && <span className="sidebar-label sidebar-user-name">{userProfile?.name}</span>}
        </div>
      </aside>

      <main className="main">
        {activePage === 'dashboard' && <Dashboard contacts={processedContacts} onSelect={handleSelectContact} onAddClick={() => setShowAddModal(true)} />}
        {activePage === 'analytics' && <AllContacts contacts={processedContacts} onSelect={handleSelectContact} onAddClick={() => setShowAddModal(true)} />}
        {activePage === 'apollo' && <ApolloSearch />}
        {activePage === 'team' && <TeamMembers team={team} onViewProfile={(m) => setViewingMemberId(m.id)} />}
        {activePage === 'organizations' && <Organizations orgs={organizations} onSelect={(o) => setSelectedOrgId(o.id)} onAddClick={() => setShowAddOrgModal(true)} />}
      </main>

      <DetailsPane 
        contact={selectedContact} 
        onClose={() => handleSelectContact(null)} 
        onNotesChange={handleNotesChange} 
        onRemove={handleRemoveContact} 
        onStatusChange={handleStatusChange} 
        onActionClick={handleActionClick} 
      />
      
      <OrganizationDetailsPane 
        org={editingOrg} 
        userProfile={userProfile}
        onClose={() => setSelectedOrgId(null)} 
        onUpdate={handleUpdateOrg} 
        onUpdateMember={handleUpdateOrgMember}
        onRemoveMember={handleRemoveOrgMember}
        onRemoveOrg={handleRemoveOrg}
      />
      
      {showAddModal && <AddConModal onClose={() => setShowAddModal(false)} onAdd={handleAddContact} hasOrg={true} />}
      {showAddOrgModal && <AddOrgModal onClose={() => setShowAddOrgModal(false)} onAdd={handleAddOrg} />}
      {showJoinModal && <JoinOrgModal onClose={() => setShowJoinModal(false)} onDiscover={discoverOrgs} onJoin={handleJoinRequest} />}
      {showProfileModal && userProfile && <ProfModal profile={userProfile} onClose={() => setShowProfileModal(false)} onSave={handleProfileSave} onLogout={logout} />}
      
      {viewingMember && (
        <TeamMod 
          member={viewingMember} 
          activities={viewingMemberActivities} 
          isAdmin={userProfile?.role === 'Admin'} 
          onClose={() => setViewingMemberId(null)} 
          onToggleAdmin={handleToggleAdmin} 
          onRemove={removeMember} 
        />
      )}
      
      {activePreview && selectedContact && activeOrg && (
        <MessagePreviewModal 
          type={activePreview.type} 
          template={activePreview.template} 
          contact={selectedContact} 
          user={userProfile!} 
          org={activeOrg} 
          onClose={() => setActivePreview(null)} 
          onLogActivity={handleLogActivity}
        />
      )}
    </div>
  );
}
