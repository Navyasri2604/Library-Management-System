import React, { useState } from 'react';
import { BookOpen, Shield, Lock, User as UserIcon, ArrowRight, Palette, Check } from 'lucide-react';
import { LibraryStorageService } from '../services/storage';
import { User } from '../types';
import { useTheme, THEME_OPTIONS } from '../context/ThemeContext';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { currentTheme, setTheme, themeMeta } = useTheme();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    const matched = LibraryStorageService.login(username.trim());
    if (matched) {
      onLoginSuccess(matched);
    } else {
      setError('Invalid username or password. Use demo credentials below.');
    }
  };

  const handleQuickLogin = (userRole: 'ROLE_ADMIN' | 'ROLE_LIBRARIAN') => {
    if (userRole === 'ROLE_ADMIN') {
      setUsername('admin');
      setPassword('Admin@123');
      const user = LibraryStorageService.login('admin');
      if (user) onLoginSuccess(user);
    } else {
      setUsername('librarian');
      setPassword('Librarian@123');
      const user = LibraryStorageService.login('librarian');
      if (user) onLoginSuccess(user);
    }
  };

  return (
    <div className="min-h-screen theme-canvas flex flex-col justify-center items-center p-6 transition-colors duration-200">
      {/* Theme Selector Floater at top right */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 p-1 rounded-xl theme-card shadow-xs">
        {THEME_OPTIONS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={`Switch to ${t.name}`}
            className="w-6 h-6 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
            style={{
              backgroundColor: t.previewColor,
              outline: currentTheme === t.id ? '2px solid var(--color-primary)' : 'none',
              outlineOffset: '2px'
            }}
          >
            {currentTheme === t.id && <Check className="w-3.5 h-3.5 text-white" />}
          </button>
        ))}
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-white shadow-md transition-colors"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight theme-title">Library Management System</h1>
          <p className="text-xs theme-muted">
            Spring Security authentication &amp; role-based circulation control
          </p>
        </div>

        {/* Login Box */}
        <div className="theme-card rounded-2xl p-6 sm:p-8 shadow-md">
          {error && (
            <div
              className="mb-4 p-3 rounded-xl border text-xs"
              style={{
                backgroundColor: 'var(--color-status-danger-bg)',
                borderColor: 'var(--color-status-danger-border)',
                color: 'var(--color-status-danger)'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold theme-title block mb-1.5">Username</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 theme-muted absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or librarian"
                  className="theme-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold theme-title block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 theme-muted absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="theme-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="theme-btn-primary w-full py-2.5 rounded-xl font-semibold text-xs transition shadow-xs flex items-center justify-center gap-2 mt-2"
            >
              <span>Sign In to System</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Development Quick Accounts */}
          <div
            className="mt-6 pt-5 border-t space-y-2"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="text-[11px] font-semibold theme-muted block uppercase tracking-wider text-center">
              Quick Test Credentials
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('ROLE_ADMIN')}
                className="theme-card-subtle p-2.5 rounded-xl border text-left transition hover:opacity-90"
              >
                <div className="font-semibold theme-title flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                  Admin
                </div>
                <div className="text-[10px] theme-muted font-mono mt-0.5">admin / Admin@123</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('ROLE_LIBRARIAN')}
                className="theme-card-subtle p-2.5 rounded-xl border text-left transition hover:opacity-90"
              >
                <div className="font-semibold theme-title flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--color-status-success)' }} />
                  Librarian
                </div>
                <div className="text-[10px] theme-muted font-mono mt-0.5">librarian / Librarian@123</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs theme-muted">
          Java 17 · Spring Boot 3 · Spring Security · MySQL 8
        </div>
      </div>
    </div>
  );
};
