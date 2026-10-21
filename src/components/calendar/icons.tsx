// Placeholder icons. These get swapped for EDS icons once eds-core is installed.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      {children}
    </svg>
  );
}

export const VideoIcon = (p: IconProps) => (
  <Base {...p}><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></Base>
);
export const ChevronLeft = (p: IconProps) => <Base {...p}><path d="m15 18-6-6 6-6" /></Base>;
export const ChevronRight = (p: IconProps) => <Base {...p}><path d="m9 18 6-6-6-6" /></Base>;
export const PlusIcon = (p: IconProps) => <Base {...p}><path d="M12 5v14M5 12h14" /></Base>;
export const MoreIcon = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></Base>
);
export const ShareIcon = (p: IconProps) => <Base {...p}><path d="M12 15V3m0 0-4 4m4-4 4 4M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /></Base>;
export const ColumnsIcon = (p: IconProps) => (
  <Base {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 4v16M12 4v16M16 4v16" /></Base>
);
export const PanelIcon = (p: IconProps) => (
  <Base {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></Base>
);
export const SearchIcon = (p: IconProps) => <Base {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Base>;
export const CloseIcon = (p: IconProps) => <Base {...p}><path d="M18 6 6 18M6 6l12 12" /></Base>;
export const TrashIcon = (p: IconProps) => <Base {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></Base>;
export const ClockIcon = (p: IconProps) => <Base {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Base>;
export const UserIcon = (p: IconProps) => <Base {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Base>;
export const CheckIcon = (p: IconProps) => <Base {...p}><path d="m5 12 5 5L20 7" /></Base>;

export const CalendarNavIcon = (p: IconProps) => (
  <Base {...p}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></Base>
);
export const ListIcon = (p: IconProps) => <Base {...p}><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></Base>;
export const ChatIcon = (p: IconProps) => <Base {...p}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" /></Base>;
export const SmileIcon = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="12" r="9" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></Base>
);
export const NewsIcon = (p: IconProps) => <Base {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8M8 11h8M8 15h5" /></Base>;
export const CapIcon = (p: IconProps) => <Base {...p}><path d="m2 9 10-5 10 5-10 5L2 9Z" /><path d="M6 11v5c3 2 9 2 12 0v-5" /></Base>;
export const GearIcon = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></Base>
);
export const HelpIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden {...p}><circle cx="12" cy="12" r="10" fill="currentColor" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.4M12 17h.01" stroke="white" strokeWidth={1.8} strokeLinecap="round" fill="none" /></svg>
);
export const LogoIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}><path d="M12 2 9 8h2v3l-5-3-1 2 6 3.5V22h2v-8.5L19 10l-1-2-5 3V8h2l-3-6Z" /></svg>
);

export const GoogleIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden {...p}>
    <path fill="#4285F4" d="M22.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h6a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-7.9Z" />
    <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1-3.8 1-2.9 0-5.4-2-6.3-4.6H2v2.8A11 11 0 0 0 12 23Z" />
    <path fill="#FBBC05" d="M5.7 14c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7H2a11 11 0 0 0 0 9.9l3.7-2.8Z" />
    <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2 7l3.7 2.8C6.6 7.3 9.1 5.4 12 5.4Z" />
  </svg>
);
