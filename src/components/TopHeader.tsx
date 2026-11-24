import React, { useEffect, useRef, useState } from 'react';
import { Menu, ChevronLeft, Sun, Moon, Computer, Check } from 'lucide-react';
import { ThemeMode } from '../services/storage';

interface TopHeaderProps {
  onToggleMobileMenu: () => void;
  canGoBack: boolean;
  onGoBack: () => void;
  theme: ThemeMode;
  onChangeTheme: (mode: ThemeMode) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleMobileMenu,
  canGoBack,
  onGoBack,
  theme,
  onChangeTheme,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/50 p-2 backdrop-blur divshadow sm:p-4">
      <div className="flex items-center gap-2 rounded-lg bg-background/50 py-2 sm:px-2 md:ml-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Open navigation menu"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-10 w-10 xl:hidden cursor-pointer"
        >
          <Menu className="h-6 w-6" />
        </button>

        {canGoBack && (
          <button
            type="button"
            onClick={onGoBack}
            className="flex items-center gap-2 text-sm font-medium hover:text-[#5a4bda] dark:hover:text-[#29ff94] transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-muted/60"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
        )}
      </div>

      {/* Theme Switcher Dropdown */}
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen((o) => !o)}
          className="rounded-md p-2 hover:bg-muted transition-colors cursor-pointer"
          aria-label="Theme"
          aria-haspopup="menu"
          aria-expanded={dropdownOpen}
        >
          {theme === 'LIGHT' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {dropdownOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-2 z-50 min-w-[14rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onChangeTheme('LIGHT');
                setDropdownOpen(false);
              }}
              className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
              {theme === 'LIGHT' && <Check className="ml-auto h-4 w-4 text-[#5a4bda]" />}
            </button>
            <div className="-mx-1 my-1 h-px bg-muted" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onChangeTheme('DARK');
                setDropdownOpen(false);
              }}
              className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
              {theme === 'DARK' && <Check className="ml-auto h-4 w-4 text-[#29ff94]" />}
            </button>
            <div className="-mx-1 my-1 h-px bg-muted" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onChangeTheme('SYSTEM');
                setDropdownOpen(false);
              }}
              className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Computer className="mr-2 h-4 w-4" />
              <span>System</span>
              {theme === 'SYSTEM' && <Check className="ml-auto h-4 w-4 text-[#5a4bda]" />}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
