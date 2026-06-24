import { useState } from 'react';
import { useLocationStore } from '../../store/locationStore';
import { LocationDropdown } from './LocationDropdown';

export const LocationDisplay = () => {
  const [open, setOpen] = useState(false);
  const areaName = useLocationStore((s) => s.areaName);

  return (
    <div className="relative hidden lg:block shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 cursor-pointer group"
      >
        <svg className="text-primary shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
        </svg>
        <div className="text-left">
          <div className="flex items-center gap-1 text-on-surface text-[13px] font-semibold group-hover:text-primary transition-colors">
            <span className="truncate max-w-[130px]">{areaName || 'Set location'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          <div className="text-[11px] text-on-surface-variant">Tap to change</div>
        </div>
      </button>
      {open && <LocationDropdown onClose={() => setOpen(false)} />}
    </div>
  );
};
