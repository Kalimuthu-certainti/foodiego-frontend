import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge, type BadgeVariant } from '../../components/ui/badge';
import { DataTable, type Column } from '../../components/DataTable';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useToast } from '../../components/ui/toast';
import { InviteStaffDialog } from './InviteStaffDialog';
import * as staffApi from '../../services/staffApi';
import {
  MAPPING_STATUS_LABELS,
  QUERY_KEYS,
  ROLE_LABELS,
} from '../../utils/constants';
import { formatDate, truncate } from '../../utils/format';
import { getErrorMessage } from '../../utils/apiError';
import type { Mapping, MappingStatus } from '../../types';

const STATUS_VARIANTS: Record<MappingStatus, BadgeVariant> = {
  invited: 'warning',
  active: 'success',
  removed: 'muted',
};

/** Brand-detail "Staff" tab: list mappings, invite staff, and remove them. */
export function StaffTab({ brandId }: { brandId: string }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removing, setRemoving] = useState<Mapping | null>(null);

  const { data: staff = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.staff(brandId),
    queryFn: () => staffApi.listByBrand(brandId),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => staffApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.staff(brandId) });
      toast.success('Staff member removed.');
      setRemoving(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const scopeLabel = (m: Mapping): string => {
    if (m.branch_id) return `Branch ${truncate(m.branch_id, 8)}`;
    if (m.restaurant_id) return `Restaurant ${truncate(m.restaurant_id, 8)}`;
    return 'Brand-wide';
  };

  const columns: Column<Mapping>[] = [
    {
      key: 'user',
      header: 'Name',
      cell: (m) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{m.user_name ?? '—'}</span>
          {m.phone ? <span className="text-xs text-slate-500">{m.phone}</span> : null}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      cell: (m) => <span className="text-slate-900">{ROLE_LABELS[m.role]}</span>,
    },
    {
      key: 'scope',
      header: 'Scope',
      cell: (m) => <span className="text-slate-600">{scopeLabel(m)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (m) => (
        <Badge variant={STATUS_VARIANTS[m.status]}>{MAPPING_STATUS_LABELS[m.status]}</Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Invited',
      cell: (m) => <span className="text-slate-500">{formatDate(m.created_at)}</span>,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      headClassName: 'text-right',
      className: 'text-right',
      cell: (m) =>
        m.status === 'removed' ? null : (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Remove staff member"
            onClick={() => setRemoving(m)}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => setInviteOpen(true)}>
          <Plus className="h-4 w-4" />
          Invite staff
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={staff}
        rowKey={(m) => m.id}
        isLoading={isLoading}
        emptyTitle="No staff yet"
        emptyDescription="Invite restaurant managers, operators, or support staff to this brand."
        emptyAction={
          <Button onClick={() => setInviteOpen(true)}>
            <Plus className="h-4 w-4" />
            Invite staff
          </Button>
        }
      />

      <InviteStaffDialog brandId={brandId} open={inviteOpen} onOpenChange={setInviteOpen} />

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Remove staff member"
        description="Revoke this user's access to the brand? They will need to be re-invited."
        confirmLabel="Remove"
        loading={removeMutation.isPending}
        onConfirm={() => removing && removeMutation.mutate(removing.id)}
      />
    </div>
  );
}
