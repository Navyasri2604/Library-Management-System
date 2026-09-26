import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  DollarSign,
  ArrowUpRight,
  Repeat,
  PlusCircle,
  FileText
} from 'lucide-react';
import { LibraryStorageService } from '../services/storage';
import { RoleType } from '../types';

interface DashboardViewProps {
  role: RoleType;
  onNavigate: (tab: any) => void;
  onOpenIssueModal: () => void;
  onOpenReturnModal: (txId?: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  role,
  onNavigate,
  onOpenIssueModal,
  onOpenReturnModal
}) => {
  const stats = LibraryStorageService.getStatistics();
  const transactions = LibraryStorageService.getTransactions().slice(0, 5);
  const books = LibraryStorageService.getBooks();
  const members = LibraryStorageService.getMembers();

  const isAdmin = role === 'ROLE_ADMIN';

  // Availability percentage
  const availabilityRate = stats.totalBooksCopies > 0
    ? Math.round((stats.availableBooks / stats.totalBooksCopies) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className="theme-card rounded-2xl p-6 relative overflow-hidden transition-colors"
        style={{
          borderLeft: '4px solid var(--color-primary)'
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold"
                style={{
                  backgroundColor: 'var(--color-primary-soft)',
                  color: 'var(--color-primary-text)',
                  border: '1px solid var(--color-primary-border)'
                }}
              >
                {isAdmin ? 'ADMINISTRATOR DASHBOARD' : 'LIBRARIAN CIRCULATION DESK'}
              </span>
              <span className="text-xs theme-muted">Live Database</span>
            </div>
            <h2 className="text-2xl font-bold theme-title mt-1.5">
              Welcome to Library Management System
            </h2>
            <p className="text-xs theme-muted mt-1 max-w-xl leading-relaxed">
              Real-time monitoring of catalog inventory, patron checkouts, overdue tracking, and automated fine calculation.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenIssueModal}
              className="px-4 py-2.5 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center gap-2"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Repeat className="w-4 h-4" />
              <span>Issue Book</span>
            </button>
            <button
              onClick={() => onOpenReturnModal()}
              className="px-4 py-2.5 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center gap-2"
              style={{ backgroundColor: 'var(--color-status-success)' }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Return Book</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => onNavigate('books')}
                className="theme-btn-secondary px-4 py-2.5 text-xs font-medium rounded-xl flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                <span>Add Book</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overdue Alert banner if any */}
      {stats.overdueBooks > 0 && (
        <div
          className="rounded-xl p-4 flex items-center justify-between gap-4 border transition-colors"
          style={{
            backgroundColor: 'var(--color-status-warning-bg)',
            borderColor: 'var(--color-status-warning-border)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'rgba(217, 119, 6, 0.15)',
                color: 'var(--color-status-warning)'
              }}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div
                className="text-xs font-bold"
                style={{ color: 'var(--color-status-warning)' }}
              >
                Action Required: {stats.overdueBooks} Overdue Borrow Transaction(s)
              </div>
              <div className="text-[11px] theme-muted">
                Books passed their 14-day due date are accruing fines at ₹5 per overdue day.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('circulation')}
            className="px-3 py-1.5 text-white font-semibold text-xs rounded-lg transition shrink-0"
            style={{ backgroundColor: 'var(--color-status-warning)' }}
          >
            Review Overdues
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Available Books */}
        <div className="theme-card p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs theme-muted">
            <span>Available on Shelves</span>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: 'var(--color-status-success-bg)',
                color: 'var(--color-status-success)'
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold theme-title font-mono tabular-nums">
            {stats.availableBooks}{' '}
            <span className="text-xs theme-muted font-normal">/ {stats.totalBooksCopies} copies</span>
          </div>
          <div
            className="w-full rounded-full h-1.5 overflow-hidden"
            style={{ backgroundColor: 'var(--color-bg-card-subtle)' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${availabilityRate}%`,
                backgroundColor: 'var(--color-status-success)'
              }}
            ></div>
          </div>
          <div className="text-[11px] theme-muted flex justify-between">
            <span>{availabilityRate}% Ready to Issue</span>
            <span>{stats.totalBookTitles} Titles</span>
          </div>
        </div>

        {/* Card 2: Issued Books */}
        <div className="theme-card p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs theme-muted">
            <span>Currently Issued</span>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: 'var(--color-primary-soft)',
                color: 'var(--color-primary)'
              }}
            >
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold theme-title font-mono tabular-nums">
            {stats.issuedBooks}
          </div>
          <div className="text-[11px] font-medium" style={{ color: 'var(--color-primary)' }}>
            Active patron circulation loans
          </div>
        </div>

        {/* Card 3: Overdue Books */}
        <div className="theme-card p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs theme-muted">
            <span>Overdue Returns</span>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: 'var(--color-status-warning-bg)',
                color: 'var(--color-status-warning)'
              }}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div
            className="text-2xl font-extrabold font-mono tabular-nums"
            style={{ color: 'var(--color-status-warning)' }}
          >
            {stats.overdueBooks}
          </div>
          <div className="text-[11px] theme-muted">
            Subject to late penalty
          </div>
        </div>

        {/* Card 4: Total Members */}
        <div className="theme-card p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs theme-muted">
            <span>Registered Patrons</span>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: 'var(--color-primary-soft)',
                color: 'var(--color-primary)'
              }}
            >
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold theme-title font-mono tabular-nums">
            {stats.totalMembers}
          </div>
          <div
            className="text-[11px] font-medium"
            style={{ color: 'var(--color-status-success)' }}
          >
            {stats.activeMembers} Active Accounts
          </div>
        </div>
      </div>

      {/* Admin Specific Financial Cards */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="theme-card p-5 rounded-2xl space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold theme-muted">Total Fines Assessed</span>
            <div className="text-2xl font-extrabold theme-title font-mono tabular-nums">
              ₹{stats.totalFinesAmount.toFixed(2)}
            </div>
            <div className="text-[11px] theme-muted">Across {stats.totalFinesCount} fine assessments</div>
          </div>

          <div className="theme-card p-5 rounded-2xl space-y-1">
            <span
              className="text-xs uppercase tracking-wider font-semibold"
              style={{ color: 'var(--color-status-warning)' }}
            >
              Uncollected Penalties
            </span>
            <div
              className="text-2xl font-extrabold font-mono tabular-nums"
              style={{ color: 'var(--color-status-warning)' }}
            >
              ₹{stats.unpaidFinesAmount.toFixed(2)}
            </div>
            <div className="text-[11px] theme-muted">Awaiting patron settlement</div>
          </div>

          <div className="theme-card p-5 rounded-2xl space-y-1">
            <span
              className="text-xs uppercase tracking-wider font-semibold"
              style={{ color: 'var(--color-status-success)' }}
            >
              Total Fines Collected
            </span>
            <div
              className="text-2xl font-extrabold font-mono tabular-nums"
              style={{ color: 'var(--color-status-success)' }}
            >
              ₹{stats.paidFinesAmount.toFixed(2)}
            </div>
            <div className="text-[11px] theme-muted">Verified cash/receipt settlement</div>
          </div>
        </div>
      )}

      {/* Recent Circulation Transactions Table */}
      <div className="theme-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold theme-title text-base">Recent Circulation Transactions</h3>
            <p className="text-xs theme-muted mt-0.5">Real-time book issue and return audit stream</p>
          </div>
          <button
            onClick={() => onNavigate('circulation')}
            className="text-xs font-semibold flex items-center gap-1 hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div
          className="overflow-x-auto rounded-xl border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <table className="w-full text-left text-xs">
            <thead className="theme-table-head font-mono border-b">
              <tr>
                <th className="p-3">Loan ID</th>
                <th className="p-3">Book Title</th>
                <th className="p-3">Member</th>
                <th className="p-3">Issue Date</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {transactions.map((tx) => {
                const book = books.find((b) => b.id === tx.bookId);
                const member = members.find((m) => m.id === tx.memberId);
                return (
                  <tr key={tx.id} className="theme-table-row">
                    <td className="p-3 font-mono font-semibold theme-muted">#{tx.id}</td>
                    <td className="p-3 font-medium theme-title max-w-xs truncate">
                      {book ? book.title : `Book #${tx.bookId}`}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      {member ? member.fullName : `Member #${tx.memberId}`}
                    </td>
                    <td className="p-3 font-mono theme-muted tabular-nums">{tx.issueDate}</td>
                    <td className="p-3 font-mono theme-muted tabular-nums">{tx.dueDate}</td>
                    <td className="p-3">
                      {tx.status === 'ISSUED' && (
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-semibold"
                          style={{
                            backgroundColor: 'var(--color-primary-soft)',
                            color: 'var(--color-primary-text)',
                            border: '1px solid var(--color-primary-border)'
                          }}
                        >
                          ISSUED
                        </span>
                      )}
                      {tx.status === 'OVERDUE' && (
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-semibold"
                          style={{
                            backgroundColor: 'var(--color-status-danger-bg)',
                            color: 'var(--color-status-danger)',
                            border: '1px solid var(--color-status-danger-border)'
                          }}
                        >
                          OVERDUE
                        </span>
                      )}
                      {tx.status === 'RETURNED' && (
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-semibold"
                          style={{
                            backgroundColor: 'var(--color-status-success-bg)',
                            color: 'var(--color-status-success)',
                            border: '1px solid var(--color-status-success-border)'
                          }}
                        >
                          RETURNED
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {tx.status !== 'RETURNED' ? (
                        <button
                          onClick={() => onOpenReturnModal(tx.id)}
                          className="px-2.5 py-1 rounded text-white font-medium text-[11px] transition shadow-xs"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                          Return Book
                        </button>
                      ) : (
                        <span className="text-[11px] theme-muted font-mono">
                          {tx.returnDate || 'Completed'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
