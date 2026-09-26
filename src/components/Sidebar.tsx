import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Repeat,
  DollarSign,
  FolderTree,
  FileText,
  Code2,
  ShieldAlert
} from 'lucide-react';
import { RoleType } from '../types';

export type NavTab =
  | 'dashboard'
  | 'books'
  | 'members'
  | 'circulation'
  | 'fines'
  | 'taxonomy'
  | 'reports'
  | 'java-code';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  role: RoleType;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, role }) => {
  const isAdmin = role === 'ROLE_ADMIN';

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    adminOnly?: boolean;
    badge?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'circulation',
      label: 'Issue & Return',
      icon: <Repeat className="w-4 h-4" />,
      badge: 'Core'
    },
    {
      id: 'books',
      label: 'Books Inventory',
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      id: 'members',
      label: 'Patron Members',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'fines',
      label: 'Fines & Penalties',
      icon: <DollarSign className="w-4 h-4" />
    },
    {
      id: 'taxonomy',
      label: 'Authors & Categories',
      icon: <FolderTree className="w-4 h-4" />,
      adminOnly: true
    },
    {
      id: 'reports',
      label: 'Reports & Audits',
      icon: <FileText className="w-4 h-4" />,
      adminOnly: true
    },
    {
      id: 'java-code',
      label: 'Java Spring Boot Code',
      icon: <Code2 className="w-4 h-4" />,
      badge: 'Source'
    }
  ];

  return (
    <aside
      className="w-full md:w-64 border-r p-4 shrink-0 flex flex-col justify-between transition-colors duration-200"
      style={{
        backgroundColor: 'var(--color-bg-sidebar)',
        borderColor: 'var(--color-border)'
      }}
    >
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider theme-muted">
          {isAdmin ? 'Admin Console' : 'Circulation Desk'}
        </div>

        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) {
            return (
              <div
                key={item.id}
                className="px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-not-allowed select-none opacity-40"
                style={{ color: 'var(--color-text-muted)' }}
                title="Admin privilege required"
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
            );
          }

          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150"
              style={{
                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--color-text-body)',
                fontWeight: isActive ? 600 : 500,
                boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.08)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-card-subtle)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div className="flex items-center gap-2.5">
                <span style={{ color: isActive ? '#ffffff' : 'var(--color-primary)' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium"
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--color-primary-soft)',
                    color: isActive ? '#ffffff' : 'var(--color-primary-text)'
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Role Notice Card */}
      <div
        className="mt-6 p-3 rounded-xl border text-[11px] space-y-1.5 transition-colors"
        style={{
          backgroundColor: 'var(--color-bg-card-subtle)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-muted)'
        }}
      >
        <div className="flex items-center justify-between font-semibold theme-title">
          <span>Active Role</span>
          <span
            className="font-mono text-[10px] px-1.5 py-0.5 rounded font-bold uppercase"
            style={{
              backgroundColor: 'var(--color-status-success-bg)',
              color: 'var(--color-status-success)',
              border: '1px solid var(--color-status-success-border)'
            }}
          >
            {isAdmin ? 'ADMIN' : 'LIBRARIAN'}
          </span>
        </div>
        <p className="text-[10px] leading-relaxed theme-muted">
          {isAdmin
            ? 'Full access to book inventory, taxonomy, financial reports, and settings.'
            : 'Access to book searching, patron management, issuing, returning, and fines.'}
        </p>
      </div>
    </aside>
  );
};
