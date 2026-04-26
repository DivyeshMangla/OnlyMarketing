// ApolloSearch.tsx — Admin-only Apollo.io company confirmation and people search page.
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Building2, ExternalLink, Loader2, Search, Users } from 'lucide-react';
import type { ApolloCompany, ApolloContact } from '../types';
import { useApolloSearch } from '../features/apollo/useApolloSearch';

function getCompanyInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'CO';
}

function openApolloProfile(contact: ApolloContact): void {
  window.open(contact.apolloUrl, '_blank', 'noopener,noreferrer');
}

function CompanyLogo({ company }: { company: ApolloCompany }) {
  const [failed, setFailed] = useState(false);

  if (company.logoUrl && !failed) {
    return (
      <img
        src={company.logoUrl}
        alt=""
        className="apollo-company-logo"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="apollo-company-logo apollo-company-logo-fallback">
      {getCompanyInitials(company.name)}
    </div>
  );
}

function CompanyConfirmation({
  company,
  onConfirm,
  loading,
}: {
  company: ApolloCompany;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <section className="apollo-confirm">
      <div className="apollo-confirm-main">
        <CompanyLogo company={company} />
        <div className="apollo-company-copy">
          <div className="apollo-section-kicker">Confirm Company</div>
          <div className="apollo-company-name">{company.name}</div>
          <div className="apollo-company-meta">
            <span>{company.domain || 'Domain unavailable'}</span>
            <span>{company.size || 'Size unavailable'}</span>
          </div>
        </div>
      </div>
      <button className="add-btn apollo-confirm-btn" onClick={onConfirm} disabled={loading}>
        {loading ? <Loader2 size={16} className="spin-icon" /> : <Users size={16} className="btn-icon" />}
        Find Contacts
      </button>
    </section>
  );
}

function ContactRow({ contact }: { contact: ApolloContact }) {
  return (
    <button
      type="button"
      className="apollo-contact-row"
      onClick={() => openApolloProfile(contact)}
      title={`Open ${contact.name} in Apollo`}
    >
      <div className="td">
        <div className="contact-cell">
          <div className="c-av shared">{getCompanyInitials(contact.name)}</div>
          <div>
            <div className="c-name">{contact.name}</div>
            <div className="c-co">{contact.title || 'Title unavailable'}</div>
          </div>
        </div>
      </div>
      <div className="td text-very-muted">{contact.location || 'Unavailable'}</div>
      <div className="td">
        <span className={`bdg ${contact.hasEmail ? 'bn' : 'bw'}`}>
          <span className="bdg-dot" />
          {contact.hasEmail ? 'Email Available' : 'No Email'}
        </span>
      </div>
      <div className="td">
        <span className={`bdg ${contact.hasPhone ? 'bn' : 'bw'}`}>
          <span className="bdg-dot" />
          {contact.hasPhone ? 'Phone Available' : 'No Phone'}
        </span>
      </div>
      <div className="td apollo-open-cell">
        <ExternalLink size={16} />
      </div>
    </button>
  );
}

export const ApolloSearch = () => {
  const [query, setQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<ApolloCompany | null>(null);
  const {
    companies,
    contacts,
    searchCompanies,
    fetchContacts,
    resetCompanies,
    resetContacts,
    companyLoading,
    contactsLoading,
    companyError,
    contactsError,
  } = useApolloSearch();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2 || companyLoading) return;

    setSelectedCompany(null);
    resetContacts();
    const result = await searchCompanies(trimmed);
    setSelectedCompany(result.companies[0] ?? null);
  };

  const handleCompanySelect = (company: ApolloCompany) => {
    setSelectedCompany(company);
    resetContacts();
  };

  const handleConfirmCompany = async () => {
    if (!selectedCompany || contactsLoading) return;
    await fetchContacts({
      organizationId: selectedCompany.id,
      domain: selectedCompany.domain,
      companyName: selectedCompany.name,
    });
  };

  const hasCompanyResults = companies.length > 0;

  return (
    <div className="page">
      <div className="page-title">Apollo Search</div>
      <div className="page-sub">Find India-based sponsorship contacts by company.</div>

      <form className="apollo-search-bar" onSubmit={handleSubmit}>
        <div className="apollo-search-input-wrap">
          <Search size={18} className="apollo-search-icon" />
          <input
            className="srch apollo-search-input"
            placeholder="Company name"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              if (!event.target.value.trim()) {
                setSelectedCompany(null);
                resetCompanies();
                resetContacts();
              }
            }}
          />
        </div>
        <button className="add-btn apollo-search-btn" disabled={companyLoading || query.trim().length < 2}>
          {companyLoading ? <Loader2 size={16} className="spin-icon" /> : <Search size={16} className="btn-icon" />}
          Search
        </button>
      </form>

      {companyError && <div className="error-banner">{companyError}</div>}

      {selectedCompany && (
        <CompanyConfirmation
          company={selectedCompany}
          onConfirm={handleConfirmCompany}
          loading={contactsLoading}
        />
      )}

      {hasCompanyResults && (
        <div className="apollo-company-options">
          {companies.map((company) => (
            <button
              key={company.id}
              type="button"
              className={`apollo-company-option ${selectedCompany?.id === company.id ? 'active' : ''}`}
              onClick={() => handleCompanySelect(company)}
            >
              <Building2 size={16} />
              <span>{company.name}</span>
              <span>{company.domain || 'No domain'}</span>
            </button>
          ))}
        </div>
      )}

      {contactsError && <div className="error-banner">{contactsError}</div>}

      <div className="tbl-wrap apollo-results-wrap">
        <div className="tbl-toolbar">
          <div>
            <div className="apollo-results-title">Contacts</div>
            <div className="apollo-results-sub">
              {selectedCompany ? selectedCompany.name : 'No company selected'}
            </div>
          </div>
        </div>

        <div className="tbl-head apollo-contact-grid">
          <div className="th">Contact</div>
          <div className="th">Location</div>
          <div className="th">Email</div>
          <div className="th">Phone</div>
          <div className="th">Apollo</div>
        </div>

        <div className="tbl-body">
          {contactsLoading ? (
            <div className="empty-state">
              <Loader2 size={20} className="spin-icon" />
            </div>
          ) : contacts.length > 0 ? (
            contacts.map((contact) => (
              <ContactRow key={contact.id} contact={contact} />
            ))
          ) : (
            <div className="empty-state">
              {selectedCompany ? 'No contacts loaded yet.' : 'Search and confirm a company.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
