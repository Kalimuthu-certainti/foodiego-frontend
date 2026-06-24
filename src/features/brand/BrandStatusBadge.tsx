import { Badge, type BadgeVariant } from '../../components/ui/badge';
import { BRAND_STATUS_LABELS } from '../../utils/constants';
import type { BrandStatus } from '../../types';

const VARIANTS: Record<BrandStatus, BadgeVariant> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

/** Coloured badge for a brand's approval status. */
export function BrandStatusBadge({ status }: { status: BrandStatus }) {
  return <Badge variant={VARIANTS[status]}>{BRAND_STATUS_LABELS[status]}</Badge>;
}
