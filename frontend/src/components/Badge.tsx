import type { ContactStatus } from '../types';
import { STATUS_MAP } from '../lib/constants';

interface BadgeProps {
  status: ContactStatus;
}

export const Badge = ({ status }: BadgeProps) => {
  const { cls, lbl } = STATUS_MAP[status];
  return (
    <span className={`bdg ${cls}`}>
      <span className="bdg-dot" />
      {lbl}
    </span>
  );
};
