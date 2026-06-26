import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Lock, Pencil, Plus, Upload } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge, type BadgeVariant } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { DataTable, type Column } from '../../components/DataTable';
import { MenuFormDialog, type MenuDialogMode } from './MenuFormDialog';
import { BulkImportDialog } from './BulkImportDialog';
import { ImportedMenuItems } from './ImportedMenuItems';
import * as menuApi from '../../services/menuApi';
import { CHANGE_REQUEST_STATUS_LABELS, QUERY_KEYS } from '../../utils/constants';
import { formatDateTime, truncate } from '../../utils/format';
import type { Brand, ChangeRequestStatus, MenuChangeRequest } from '../../types';

const STATUS_VARIANTS: Record<ChangeRequestStatus, BadgeVariant> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

/** Brand-detail "Menu" tab: submit the initial menu, then file change requests. */
export function MenuTab({ brand }: { brand: Brand }) {
  const [dialog, setDialog] = useState<MenuDialogMode | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const locked = brand.menu_locked;

  const { data: requests = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.menuChangeRequests(brand.id),
    queryFn: () => menuApi.listChangeRequests(brand.id),
  });

  const columns: Column<MenuChangeRequest>[] = [
    {
      key: 'id',
      header: 'Request',
      cell: (r) => <span className="font-mono text-xs text-slate-600">{truncate(r.id, 12)}</span>,
    },
    {
      key: 'items',
      header: 'Items',
      cell: (r) => <span className="text-slate-900">{r.items.length}</span>,
    },
    {
      key: 'reason',
      header: 'Reason',
      cell: (r) => <span className="text-slate-600">{r.reason ? truncate(r.reason, 48) : '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => (
        <Badge variant={STATUS_VARIANTS[r.status]}>{CHANGE_REQUEST_STATUS_LABELS[r.status]}</Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Filed',
      cell: (r) => <span className="text-slate-500">{formatDateTime(r.created_at)}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Menu</h2>
          <p className="mt-0.5 text-sm text-slate-500">Items, submissions, and change requests</p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3.5">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${locked ? 'bg-slate-100' : 'bg-brand-50'}`}>
              {locked ? (
                <Lock className="h-4.5 w-4.5 h-[18px] w-[18px] text-slate-400" />
              ) : (
                <Pencil className="h-[18px] w-[18px] text-brand-600" />
              )}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {locked ? 'Menu submitted' : 'Menu not submitted'}
              </p>
              <p className="text-sm text-slate-500">
                {locked
                  ? 'Locked — use change requests to propose edits.'
                  : 'Submit your menu to make it live. This will lock the menu.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setBulkOpen(true)}>
              <Upload className="h-4 w-4" />
              Bulk import
            </Button>
            {locked ? (
              <Button onClick={() => setDialog('change')}>
                <Pencil className="h-4 w-4" />
                Request change
              </Button>
            ) : (
              <Button onClick={() => setDialog('submit')}>
                <Plus className="h-4 w-4" />
                Submit menu
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <p className="mb-3 text-sm font-semibold text-slate-700">Change requests</p>
        <DataTable
          columns={columns}
          data={requests}
          rowKey={(r) => r.id}
          isLoading={isLoading}
          emptyTitle="No change requests"
          emptyDescription="Proposed menu changes will appear here with their review status."
        />
      </div>

      <ImportedMenuItems brandId={brand.id} />

      {dialog ? (
        <MenuFormDialog
          brandId={brand.id}
          mode={dialog}
          open={dialog !== null}
          onOpenChange={(open) => !open && setDialog(null)}
        />
      ) : null}

      <BulkImportDialog brandId={brand.id} open={bulkOpen} onOpenChange={setBulkOpen} />
    </div>
  );
}
