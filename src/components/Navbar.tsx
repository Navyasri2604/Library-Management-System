import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, LogOut, RefreshCw, Shield, BookCheck, Palette, ChevronDown, Check } from 'lucide-react';
import { User, RoleType } from '../types';
import { useTheme, THEME_OPTIONS } from '../context/ThemeContext';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onSwitchRole: (role: RoleType) => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onSwitchRole,
  onResetData
}) => {
  const { currentTheme, setTheme, themeMeta } = useTheme();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="theme-navbar border-b sticky top-0 z-40 px-4 lg:px-8 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-colors duration-200"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-base sm:text-lg font-bold tracking-tight theme-title">
                Library Management System
              </span>
              <span
                className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase"
                style={{
                  backgroundColor: 'var(--color-primary-soft)',
                  color: 'var(--color-primary-text)',
                  border: '1px solid var(--color-primary-border)'
                }}
              >
                Spring Boot 3
              </span>
            </div>
            <p className="text-xs theme-muted hidden md:block">
              Java 17 · Spring Data JPA · MySQL 8 · Thymeleaf · Bootstrap 5
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* THEME / PALETTE COLOR SWITCHER */}
          <div className="relative" ref={themeDropdownRef}>
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-body)'
              }}
              title="Change Color Theme"
              aria-expanded={isThemeMenuOpen}
            >
              <div
                className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-xs"
                style={{ backgroundColor: themeMeta.previewColor }}
              />
              <span className="hidden sm:inline font-medium">{themeMeta.name}</span>
              <ChevronDown className="w-3 h-3 theme-muted" />
            </button>

            {isThemeMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl border shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider theme-muted border-b mb-1" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  Color Palettes
                </div>
                <div className="space-y-1">
                  {THEME_OPTIONS.map((theme) => {
                    const isSelected = currentTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setTheme(theme.id);
                          setIsThemeMenuOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors group"
                        style={{
                          backgroundColor: isSelected ? 'var(--color-primary-soft)' : 'transparent',
                          color: isSelected ? 'var(--color-primary-text)' : 'var(--color-text-body)'
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-xs group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: theme.previewColor }}
                          />
                          <div>
                            <div className="font-semibold">{theme.name}</div>
                            <div className="text-[10px] theme-muted">{theme.badge}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Role Switcher */}
          <div
            className="hidden md:flex items-center p-1 rounded-xl border text-xs"
            style={{
              backgroundColor: 'var(--color-bg-card-subtle)',
              borderColor: 'var(--color-border)'
            }}
          >
            <button
              onClick={() => onSwitchRole('ROLE_ADMIN')}
              className="px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 text-xs"
              style={{
                backgroundColor: currentUser?.role === 'ROLE_ADMIN' ? 'var(--color-primary)' : 'transparent',
                color: currentUser?.role === 'ROLE_ADMIN' ? '#ffffff' : 'var(--color-text-muted)'
              }}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => onSwitchRole('ROLE_LIBRARIAN')}
              className="px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 text-xs"
              style={{
                backgroundColor: currentUser?.role === 'ROLE_LIBRARIAN' ? 'var(--color-primary)' : 'transparent',
                color: currentUser?.role === 'ROLE_LIBRARIAN' ? '#ffffff' : 'var(--color-text-muted)'
              }}
            >
              <BookCheck className="w-3.5 h-3.5" />
              <span>Librarian</span>
            </button>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetData}
            title="Reset database to seed state"
            className="p-2 rounded-lg border transition text-xs flex items-center gap-1.5 hover:opacity-80"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-body)'
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-xs font-medium">Reset Data</span>
          </button>

          {/* User Profile Badge */}
          {currentUser && (
            <div
              className="flex items-center gap-2.5 pl-2 border-l"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold theme-title">{currentUser.fullName}</div>
                <div
                  className="text-[10px] font-mono font-medium"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {currentUser.role === 'ROLE_ADMIN' ? 'Administrator' : 'Librarian'}
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="px-2.5 py-1.5 rounded-lg border transition flex items-center gap-1 text-xs font-medium"
                style={{
                  backgroundColor: 'var(--color-status-danger-bg)',
                  borderColor: 'var(--color-status-danger-border)',
                  color: 'var(--color-status-danger)'
                }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
