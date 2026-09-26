import React, { useState } from 'react';
import {
  DollarSign,
  Search,
  CheckCircle,
  Clock,
  ShieldCheck,
  Ban,
  Check,
  Filter
} from 'lucide-react';
import { LibraryStorageService } from '../services/storage';
import { FineStatus, RoleType } from '../types';

interface FinesViewProps {
  role: RoleType;
}

export const FinesView: React.FC<FinesViewProps> = ({ role }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | FineStatus>('ALL');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fines = LibraryStorageService.getFines();
  const transactions = LibraryStorageService.getTransactions();
  const books = LibraryStorageService.getBooks();
  const members = LibraryStorageService.getMembers();

  const handlePay = (fineId: number) => {
    try {
      const fine = LibraryStorageService.payFine(fineId);
      setToastMsg(`Fine #${fine.id} of ₹${fine.fineAmount.toFixed(2)} marked as PAID.`);
      setTimeout(() => setToastMsg(null), 3000);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleWaive = (fineId: number) => {
    if (!window.confirm('Are you sure you want to waive this fine?')) return;
    try {
      const fine = LibraryStorageService.waiveFine(fineId);
      setToastMsg(`Fine #${fine.id} marked as WAIVED.`);
      setTimeout(() => setToastMsg(null), 3000);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const totalAmount = fines.reduce((sum, f) => sum + f.fineAmount, 0);
  const unpaidAmount = fines.filter((f) => f.paidStatus === 'UNPAID').reduce((sum, f) => sum + f.fineAmount, 0);
  const paidAmount = fines.filter((f) => f.paidStatus === 'PAID').reduce((sum, f) => sum + f.fineAmount, 0);

  const filteredFines = fines.filter((f) => {
    const tx = transactions.find((t) => t.id === f.transactionId);
    const book = tx ? books.find((b) => b.id === tx.bookId) : null;
    const member = tx ? members.find((m) => m.id === tx.memberId) : null;

    const matchesSearch =
      f.id.toString().includes(searchTerm.toLowerCase()) ||
      (book && book.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member && member.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member && member.memberCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || f.paidStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className="border px-4 py-3 rounded-xl text-xs flex items-center gap-2"
          style={{
            backgroundColor: 'var(--color-status-success-bg)',
            borderColor: 'var(--color-status-success-border)',
            color: 'var(--color-status-success)'
          }}
        >
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold theme-title flex items-center gap-2">
          <DollarSign className="w-5 h-5" style={{ color: 'var(--color-status-warning)' }} />
          Fines &amp; Late Fee Collection
        </h2>
        <p className="text-xs theme-muted mt-0.5">
          Automatic ₹5.00/day penalty assessments, cash settlement logs, and waiver audits.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="theme-card p-5 rounded-2xl space-y-1">
          <span className="text-xs uppercase tracking-wider font-semibold theme-muted">
            Total Assessed Fines
          </span>
          <div className="text-2xl font-extrabold theme-title font-mono tabular-nums">
            ₹{totalAmount.toFixed(2)}
          </div>
          <div className="text-[11px] theme-muted">{fines.length} total assessment records</div>
        </div>

        <div className="theme-card p-5 rounded-2xl space-y-1">
          <span
            className="text-xs uppercase tracking-wider font-semibold"
            style={{ color: 'var(--color-status-warning)' }}
          >
            Unpaid / Pending Dues
          </span>
          <div
            className="text-2xl font-extrabold font-mono tabular-nums"
            style={{ color: 'var(--color-status-warning)' }}
          >
            ₹{unpaidAmount.toFixed(2)}
          </div>
          <div className="text-[11px] theme-muted">
            {fines.filter((f) => f.paidStatus === 'UNPAID').length} unpaid patron tickets
          </div>
        </div>

        <div className="theme-card p-5 rounded-2xl space-y-1">
          <span
            className="text-xs uppercase tracking-wider font-semibold"
            style={{ color: 'var(--color-status-success)' }}
          >
            Collected Revenue
          </span>
          <div
            className="text-2xl font-extrabold font-mono tabular-nums"
            style={{ color: 'var(--color-status-success)' }}
          >
            ₹{paidAmount.toFixed(2)}
          </div>
          <div className="text-[11px] theme-muted">
            {fines.filter((f) => f.paidStatus === 'PAID').length} settled tickets
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="theme-card rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 theme-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by fine ID, member name, card code, or book title..."
            className="theme-input w-full pl-10 pr-4 py-2 rounded-xl text-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="theme-input rounded-xl px-3 py-2 text-xs"
        >
          <option value="ALL">All Payment Statuses</option>
          <option value="UNPAID">UNPAID Tickets</option>
          <option value="PAID">PAID Settlements</option>
          <option value="WAIVED">WAIVED Exemptions</option>
        </select>
      </div>

      {/* Fines Table */}
      <div className="theme-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="theme-table-head font-mono border-b">
              <tr>
                <th className="p-3.5">Fine ID</th>
                <th className="p-3.5">Loan Reference</th>
                <th className="p-3.5">Patron Member</th>
                <th className="p-3.5">Book Title</th>
                <th className="p-3.5">Overdue Days</th>
                <th className="p-3.5">Fine Amount</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Settlement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {filteredFines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center theme-muted text-xs">
                    No fine records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredFines.map((f) => {
                  const tx = transactions.find((t) => t.id === f.transactionId);
                  const book = tx ? books.find((b) => b.id === tx.bookId) : null;
                  const member = tx ? members.find((m) => m.id === tx.memberId) : null;

                  return (
                    <tr key={f.id} className="theme-table-row">
                      <td className="p-3.5 font-mono font-semibold theme-muted tabular-nums">#{f.id}</td>
                      <td
                        className="p-3.5 font-mono font-medium tabular-nums"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        Loan #{f.transactionId}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold theme-title">{member?.fullName}</div>
                        <div className="text-[11px] font-mono theme-muted tabular-nums">{member?.memberCode}</div>
                      </td>
                      <td className="p-3.5 max-w-xs truncate theme-title">
                        {book ? book.title : `Book #${tx?.bookId}`}
                      </td>
                      <td
                        className="p-3.5 font-mono tabular-nums font-medium"
                        style={{ color: 'var(--color-status-warning)' }}
                      >
                        {f.overdueDays} days @ ₹5/d
                      </td>
                      <td className="p-3.5 font-mono font-bold text-sm theme-title tabular-nums">
                        ₹{f.fineAmount.toFixed(2)}
                      </td>
                      <td className="p-3.5 text-center">
                        {f.paidStatus === 'UNPAID' && (
                          <span
                            className="px-2.5 py-0.5 rounded text-[11px] font-semibold"
                            style={{
                              backgroundColor: 'var(--color-status-danger-bg)',
                              color: 'var(--color-status-danger)',
                              border: '1px solid var(--color-status-danger-border)'
                            }}
                          >
                            UNPAID
                          </span>
                        )}
                        {f.paidStatus === 'PAID' && (
                          <span
                            className="px-2.5 py-0.5 rounded text-[11px] font-semibold"
                            style={{
                              backgroundColor: 'var(--color-status-success-bg)',
                              color: 'var(--color-status-success)',
                              border: '1px solid var(--color-status-success-border)'
                            }}
                          >
                            PAID
                          </span>
                        )}
                        {f.paidStatus === 'WAIVED' && (
                          <span
                            className="px-2.5 py-0.5 rounded text-[11px] font-semibold"
                            style={{
                              backgroundColor: 'var(--color-bg-card-subtle)',
                              color: 'var(--color-text-muted)',
                              border: '1px solid var(--color-border)'
                            }}
                          >
                            WAIVED
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {f.paidStatus === 'UNPAID' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handlePay(f.id)}
                              className="px-2.5 py-1 rounded-lg text-white font-semibold text-[11px] transition shadow-xs"
                              style={{ backgroundColor: 'var(--color-status-success)' }}
                            >
                              Collect ₹{f.fineAmount}
                            </button>
                            <button
                              onClick={() => handleWaive(f.id)}
                              className="theme-btn-secondary px-2 py-1 rounded-lg font-medium text-[11px]"
                            >
                              Waive
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] theme-muted font-mono">
                            {f.paymentDate ? f.paymentDate.split(' ')[0] : 'Settled'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
