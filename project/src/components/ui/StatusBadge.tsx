import { genericStatusColors } from '@/config/statusConfig';

interface StatusBadgeProps {
  status: string;
  className?: string;
  label?: string;
}

export default function StatusBadge({ status, className = '', label }: StatusBadgeProps) {
  const colorClass = genericStatusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-700';
  const displayLabel = label || status.replace('-', ' ');

  return (
    <span className={`badge ${colorClass} capitalize ${className}`}>
      {displayLabel}
    </span>
  );
}
