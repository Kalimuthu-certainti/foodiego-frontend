export const SectionHeader = ({ title, subtitle, action, onAction }) => (
  <div className="flex items-end justify-between mb-5">
    <div>
      <h2 className="text-headline-md text-on-surface leading-tight">{title}</h2>
      {subtitle && (
        <p className="text-body-md text-on-surface-variant mt-0.5">{subtitle}</p>
      )}
    </div>
    {action && (
      <button
        onClick={onAction}
        className="text-label-md text-primary hover:underline flex items-center gap-1 shrink-0 ml-4 pb-0.5"
      >
        {action}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    )}
  </div>
);
