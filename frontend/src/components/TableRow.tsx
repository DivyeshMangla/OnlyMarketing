import type { Contact } from '../types';
import { Badge } from './Badge';
import { getInitials } from '../lib/userUtils';

interface TableRowProps {
  contact: Contact;
  onClick: () => void;
}

export const TableRow = ({ contact, onClick }: TableRowProps) => {
  const initials = getInitials(contact.name);

  return (
    <div className="tbl-row ac clickable" onClick={onClick}>
      <div className="td">
        <div className="contact-cell">
          <div className={`c-av ${contact.mine ? 'mine' : 'shared'}`}>{initials}</div>
          <div>
            <div className="c-name">{contact.name}</div>
            <div className="c-co">{contact.position} at {contact.co}</div>
          </div>
        </div>
      </div>
      <div className="td text-very-muted">{contact.email}</div>
      <div className="td text-very-muted">{contact.phone}</div>
      <div className="td"><Badge status={contact.status} /></div>
      <div className="td text-date">{contact.date}</div>
    </div>
  );
};
