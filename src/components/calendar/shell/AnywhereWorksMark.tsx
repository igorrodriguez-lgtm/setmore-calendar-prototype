/** The AnywhereWorks tree mark shown at the top of live's menu (EDS has only the older "AW" logo). */
export function AnywhereWorksMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden className="shrink-0">
      <g stroke="#1d4a3a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2v16" />
        <path d="M4.5 7.5 10 3l5.5 4.5" />
        <path d="M3.5 12 10 7.5l6.5 4.5" />
      </g>
    </svg>
  );
}
