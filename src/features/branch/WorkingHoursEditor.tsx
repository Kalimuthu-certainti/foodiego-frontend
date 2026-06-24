import { Input } from '../../components/ui/input';
import { cn } from '../../utils/cn';
import { DAY_KEYS, DAY_LABELS } from '../../utils/constants';
import type { WorkingHoursValues } from '../../validators/branch';
import type { DayKey } from '../../types';

const DEFAULT_SLOT = { open: '10:00', close: '22:00' };

export interface WorkingHoursEditorProps {
  value: WorkingHoursValues;
  onChange: (value: WorkingHoursValues) => void;
}

/**
 * Per-day open/close editor. Each day is either closed (empty slot list) or
 * open with a single open–close window — the common case; the backend stores
 * the value as a slot array so this stays forward-compatible.
 */
export function WorkingHoursEditor({ value, onChange }: WorkingHoursEditorProps) {
  const setDay = (day: DayKey, slots: WorkingHoursValues[DayKey]) => {
    onChange({ ...value, [day]: slots });
  };

  return (
    <div className="flex flex-col divide-y divide-slate-100 rounded-md border border-slate-200">
      {DAY_KEYS.map((day) => {
        const slot = value[day]?.[0];
        const isOpen = Boolean(slot);
        return (
          <div key={day} className="flex items-center gap-3 px-3 py-2">
            <span className="w-24 text-sm font-medium text-slate-700">{DAY_LABELS[day]}</span>
            <button
              type="button"
              role="switch"
              aria-checked={isOpen}
              aria-label={`${DAY_LABELS[day]} ${isOpen ? 'open' : 'closed'}`}
              onClick={() => setDay(day, isOpen ? [] : [{ ...DEFAULT_SLOT }])}
              className={cn(
                'relative h-5 w-9 shrink-0 rounded-full transition-colors',
                isOpen ? 'bg-brand-600' : 'bg-slate-300',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                  isOpen ? 'translate-x-4' : 'translate-x-0.5',
                )}
              />
            </button>
            {isOpen && slot ? (
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={slot.open}
                  aria-label={`${DAY_LABELS[day]} opening time`}
                  onChange={(e) => setDay(day, [{ ...slot, open: e.target.value }])}
                  className="h-8 w-28"
                />
                <span className="text-slate-400">–</span>
                <Input
                  type="time"
                  value={slot.close}
                  aria-label={`${DAY_LABELS[day]} closing time`}
                  onChange={(e) => setDay(day, [{ ...slot, close: e.target.value }])}
                  className="h-8 w-28"
                />
              </div>
            ) : (
              <span className="text-sm text-slate-400">Closed</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** All-week-closed value, used as the form default. */
export function emptyWorkingHours(): WorkingHoursValues {
  return DAY_KEYS.reduce(
    (acc, day) => ({ ...acc, [day]: [] }),
    {} as WorkingHoursValues,
  );
}
