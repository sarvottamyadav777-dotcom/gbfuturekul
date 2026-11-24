import React from 'react';
import {
  BookOpen,
  Sparkles,
  Layers3,
  History,
  GraduationCap,
  X,
} from 'lucide-react';
import { BRAND_LOGO, BRAND_NAME } from '../services/api';

export type NavSection =
  | 'study'
  | 'batches'
  | 'mybatches'
  | 'history'
  | 'contact';

interface SidebarProps {
  activeNav: NavSection;
  onSelectNav: (nav: NavSection) => void;
  onOpenTelegramModal: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onSelectNav,
  onOpenTelegramModal,
  isMobileOpen,
  onCloseMobile,
}) => {
  const handleNavClick = (nav: NavSection) => {
    onSelectNav(nav);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] transition-opacity xl:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`z-50 w-64 bg-background border-r shadow-md transform transition-transform duration-200 ease-in-out fixed top-0 left-0 h-full xl:fixed xl:top-0 xl:left-0 xl:translate-x-0 xl:h-screen xl:z-40 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Sidebar Brand Header */}
        <div className="p-4 border-b sticky top-0 bg-background z-10 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => handleNavClick('batches')}
            className="flex items-center gap-3 min-w-0 text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full dark:bg-foreground overflow-hidden shrink-0 border border-border">
              <img
                src={BRAND_LOGO}
                alt={`${BRAND_NAME} logo`}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-semibold text-foreground truncate">
              {BRAND_NAME}
            </span>
            <GraduationCap className="w-5 h-5 text-[#5a4bda] shrink-0" />
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            className="xl:hidden rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-2 space-y-2 overflow-y-auto h-[calc(100vh-5rem)]">
          <button
            type="button"
            onClick={() => handleNavClick('study')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-sm transition-colors duration-200 ${
              activeNav === 'study'
                ? 'bg-foreground/90 !text-background font-medium'
                : 'text-foreground hover:bg-foreground/15'
            }`}
          >
            <BookOpen
              className={`w-5 h-5 flex-shrink-0 ${
                activeNav === 'study' ? 'text-background' : 'text-[#5a4bda]'
              }`}
            />
            <span>Study</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('batches')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-sm transition-colors duration-200 ${
              activeNav === 'batches'
                ? 'bg-foreground/90 !text-background font-medium'
                : 'text-foreground hover:bg-foreground/15'
            }`}
          >
            <Sparkles
              className={`w-5 h-5 flex-shrink-0 ${
                activeNav === 'batches' ? 'text-background' : 'text-[#5a4bda]'
              }`}
            />
            <span>Batches</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('mybatches')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-sm transition-colors duration-200 ${
              activeNav === 'mybatches'
                ? 'bg-foreground/90 !text-background font-medium'
                : 'text-foreground hover:bg-foreground/15'
            }`}
          >
            <Layers3
              className={`w-5 h-5 flex-shrink-0 ${
                activeNav === 'mybatches' ? 'text-background' : 'text-[#5a4bda]'
              }`}
            />
            <span>My Batches</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-sm transition-colors duration-200 ${
              activeNav === 'history'
                ? 'bg-foreground/90 !text-background font-medium'
                : 'text-foreground hover:bg-foreground/15'
            }`}
          >
            <History
              className={`w-5 h-5 flex-shrink-0 ${
                activeNav === 'history' ? 'text-background' : 'text-[#5a4bda]'
              }`}
            />
            <span>History</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onCloseMobile();
              onOpenTelegramModal();
            }}
            className="w-full flex items-center text-foreground gap-3 px-4 py-3 rounded-lg cursor-pointer text-sm transition-colors duration-200 hover:bg-foreground/15"
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 flex-shrink-0" aria-hidden="true">
              <path
                d="M16.9 3.25 14.55 16c-.18.9-.68 1.12-1.38.7l-3.58-2.64-1.73 1.66c-.19.19-.35.35-.72.35l.26-3.65 6.64-6c.29-.26-.06-.4-.45-.14l-8.2 5.16-3.53-1.1c-.77-.24-.78-.77.16-1.14L15.82 3.9c.64-.24 1.2.15 1.08-.65Z"
                stroke="#5a4bda"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Join Telegram</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('contact')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-sm transition-colors duration-200 ${
              activeNav === 'contact'
                ? 'bg-foreground/90 !text-background font-medium'
                : 'text-foreground hover:bg-foreground/15'
            }`}
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 flex-shrink-0" aria-hidden="true">
              <path
                d="M10 10.25a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Z"
                stroke={activeNav === 'contact' ? 'currentColor' : '#5a4bda'}
                strokeWidth="1.35"
              />
              <path
                d="M4.3 16.2c.55-2.6 2.55-4.15 5.7-4.15s5.15 1.55 5.7 4.15"
                stroke={activeNav === 'contact' ? 'currentColor' : '#5a4bda'}
                strokeWidth="1.35"
                strokeLinecap="round"
              />
              <path
                d="M3.15 3.6h2.1M14.75 3.6h2.1"
                stroke={activeNav === 'contact' ? 'currentColor' : '#5a4bda'}
                strokeWidth="1.35"
                strokeLinecap="round"
              />
            </svg>
            <span>Contact Us</span>
          </button>
        </nav>
      </aside>
    </>
  );
};
