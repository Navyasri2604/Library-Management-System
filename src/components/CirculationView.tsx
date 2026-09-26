import React, { useState } from 'react';
import {
  Repeat,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Check,
  X,
  DollarSign,
  AlertCircle,
  Calendar,
  UserCheck,
  BookOpen
} from 'lucide-react';
import { LibraryStorageService } from '../services/storage';
import { RoleType, TransactionStatus, Fine } from '../types';

interface CirculationViewProps {
  role: RoleType;
  isIssueModalOpen: boolean;
  onCloseIssueModal: () => void;
  returnModalTxId: number | null;
  onCloseReturnModal: () => void;
  preSelectedBookId?: number | null;
}

export const CirculationView: React.FC<CirculationViewProps> = ({
  role,
  isIssueModalOpen,
  onCloseIssueModal,
  returnModalTxId,
  onCloseReturnModal,
  preSelectedBookId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TransactionStatus>('ALL');

  // Issue Form State
  const [selectedMemberId, setSelectedMemberId] = useState<number>(1);
  const [selectedBookId, setSelectedBookId] = useState<number>(preSelectedBookId || 1);
  const [notes, setNotes] = useState('');
  const [issueError, setIssueError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Return Form State
  const [activeReturnTxId, setActiveReturnTxId] = useState<number | null>(returnModalTxId);
  const [returnResult, setReturnResult] = useState<{ fine: Fine | null } | null>(null);
  const [returnError, setReturnError] = useState<string | null>(null);

  const transactions = LibraryStorageService.getTransactions();
  const books = LibraryStorageService.getBooks();
  const members = LibraryStorageService.getMembers();

  // If returnModalTxId prop changes, update local state
  React.useEffect(() => {
    setActiveReturnTxId(returnModalTxId);
  }, [returnModalTxId]);

  // If preSelectedBookId prop changes, update local state
  React.useEffect(() => {
    if (preSelectedBookId) {
      setSelectedBookId(preSelectedBookId);
    }
  }, [preSelectedBookId]);

  // Selected entities preview for Issue Form
  const selectedBook = books.find((b) => b.id === selectedBookId);
  const selectedMember = members.find((m) => m.id === selectedMemberId);

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIssueError(null);

    try {
      const tx = LibraryStorageService.issueBook(selectedBookId, selectedMemberId, notes.trim());
      setSuccessToast(`Book issued successfully! Transaction #${tx.id} generated. Due date is ${tx.dueDate}.`);
      onCloseIssueModal();
      setNotes('');
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      setIssueError(err.message || 'Issue failed');
    }
  };

  const handleReturnSubmit = (txId: number) => {
    setReturnError(null);
    try {
      const res = LibraryStorageService.returnBook(txId);
      setReturnResult(res);
      setSuccessToast(
        res.fine
          ? `Book returned! Overdue fine of ₹${res.fine.fineAmount.toFixed(2)} assessed (${res.fine.overdueDays} days @ ₹5/day).`
          : 'Book returned on time! Available quantity restored with zero fines.'
      );
      setTimeout(() => {
        setSuccessToast(null);
        setActiveReturnTxId(null);
        onCloseReturnModal();
        setReturnResult(null);
      }, 3000);
    } catch (err: any) {
      setReturnError(err.message || 'Return failed');
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const book = books.find((b) => b.id === t.bookId);
    const member = members.find((m) => m.id === t.memberId);

    const matchesSearch =
      t.id.toString().includes(searchTerm.toLowerCase()) ||
      (book && book.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (book && book.isbn.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member && member.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member && member.memberCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate live return preview values
  const returnTx = transactions.find((t) => t.id === activeReturnTxId);
  const returnBook = returnTx ? books.find((b) => b.id === returnTx.bookId) : null;
  const returnMember = returnTx ? members.find((m) => m.id === returnTx.memberId) : null;

  let overdueDaysCalc = 0;
  let fineCalc = 0;
  if (returnTx) {
    const today = new Date().toISOString().split('T')[0];
    const dueTime = new Date(returnTx.dueDate).getTime();
    const returnTime = new Date(today).getTime();
    const diff = Math.ceil((returnTime - dueTime) / (1000 * 60 * 60 * 24));
    overdueDaysCalc = Math.max(0, diff);
    fineCalc = overdueDaysCalc * 5.0;
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div
          className="border px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-sm"
          style={{
            backgroundColor: 'var(--color-status-success-bg)',
            borderColor: 'var(--color-status-success-border)',
            color: 'var(--color-status-success)'
          }}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold theme-title flex items-center gap-2">
            <Repeat className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            Circulation Desk: Issue &amp; Return Engine
          </h2>
          <p className="text-xs theme-muted mt-0.5">
            Atomic inventory decrement/increment, 14-day checkout periods, and ₹5/day fine calculations.
          </p>
        </div>

        <button
          onClick={() => {
            setIssueError(null);
            onCloseIssueModal(); // toggle
          }}
          className="theme-btn-primary px-4 py-2.5 font-semibold text-xs rounded-xl flex items-center gap-2 shrink-0 shadow-xs"
        >
          <Repeat className="w-4 h-4" />
          <span>Issue a Book Now</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('ALL')}
          className="px-3.5 py-1.5 rounded-xl text-xs font-medium transition"
          style={{
            backgroundColor: statusFilter === 'ALL' ? 'var(--color-primary)' : 'var(--color-bg-card)',
            color: statusFilter === 'ALL' ? '#ffffff' : 'var(--color-text-body)',
            border: `1px solid ${statusFilter === 'ALL' ? 'var(--color-primary)' : 'var(--color-border)'}`
          }}
        >
          All Records ({transactions.length})
        </button>
        <button
          onClick={() => setStatusFilter('ISSUED')}
          className="px-3.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
          style={{
            backgroundColor: statusFilter === 'ISSUED' ? 'var(--color-primary)' : 'var(--color-bg-card)',
            color: statusFilter === 'ISSUED' ? '#ffffff' : 'var(--color-primary-text)',
            border: `1px solid ${statusFilter === 'ISSUED' ? 'var(--color-primary)' : 'var(--color-border)'}`
          }}
        >
          <Clock className="w-3.5 h-3.5" />
          Active Loans ({transactions.filter((t) => t.status === 'ISSUED').length})
        </button>
        <button
          onClick={() => setStatusFilter('OVERDUE')}
          className="px-3.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
          style={{
            backgroundColor: statusFilter === 'OVERDUE' ? 'var(--color-status-danger)' : 'var(--color-bg-card)',
            color: statusFilter === 'OVERDUE' ? '#ffffff' : 'var(--color-status-danger)',
            border: `1px solid ${statusFilter === 'OVERDUE' ? 'var(--color-status-danger)' : 'var(--color-border)'}`
          }}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Overdue Loans ({transactions.filter((t) => t.status === 'OVERDUE').length})
        </button>
        <button
          onClick={() => setStatusFilter('RETURNED')}
          className="px-3.5 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
          style={{
            backgroundColor: statusFilter === 'RETURNED' ? 'var(--color-status-success)' : 'var(--color-bg-card)',
            color: statusFilter === 'RETURNED' ? '#ffffff' : 'var(--color-status-success)',
            border: `1px solid ${statusFilter === 'RETURNED' ? 'var(--color-status-success)' : 'var(--color-border)'}`
          }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Returned History ({transactions.filter((t) => t.status === 'RETURNED').length})
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 theme-muted absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by transaction ID, book title, ISBN, member name, or card code..."
          className="theme-input w-full pl-10 pr-4 py-2 rounded-xl text-xs"
        />
      </div>

      {/* Transactions Table */}
      <div className="theme-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="theme-table-head font-mono border-b">
              <tr>
                <th className="p-3.5">Loan ID</th>
                <th className="p-3.5">Book Title &amp; ISBN</th>
                <th className="p-3.5">Borrowing Patron</th>
                <th className="p-3.5">Issue Date</th>
                <th className="p-3.5">Due Date</th>
                <th className="p-3.5">Return Date</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Circulation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center theme-muted text-xs">
                    No circulation transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const book = books.find((b) => b.id === tx.bookId);
                  const member = members.find((m) => m.id === tx.memberId);
                  const isReturned = tx.status === 'RETURNED';

                  return (
                    <tr key={tx.id} className="theme-table-row">
                      <td className="p-3.5 font-mono font-semibold theme-muted tabular-nums">#{tx.id}</td>
                      <td className="p-3.5">
                        <div className="font-semibold theme-title">{book ? book.title : `Book #${tx.bookId}`}</div>
                        <div className="text-[11px] font-mono theme-muted tabular-nums">{book?.isbn}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-medium theme-title">{member ? member.fullName : `Member #${tx.memberId}`}</div>
                        <div className="text-[11px] font-mono theme-muted tabular-nums">{member?.memberCode}</div>
                      </td>
                      <td className="p-3.5 font-mono theme-muted tabular-nums">{tx.issueDate}</td>
                      <td className="p-3.5 font-mono theme-muted tabular-nums font-semibold">{tx.dueDate}</td>
                      <td className="p-3.5 font-mono theme-muted tabular-nums">{tx.returnDate || '—'}</td>
                      <td className="p-3.5 text-center">
                        {tx.status === 'ISSUED' && (
                          <span
                            className="px-2.5 py-0.5 rounded text-[11px] font-semibold"
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
                            className="px-2.5 py-0.5 rounded text-[11px] font-semibold"
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
                            className="px-2.5 py-0.5 rounded text-[11px] font-semibold"
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
                      <td className="p-3.5 text-right">
                        {!isReturned ? (
                          <button
                            onClick={() => setActiveReturnTxId(tx.id)}
                            className="theme-btn-primary px-3 py-1 rounded-lg text-[11px] font-medium transition shadow-xs"
                          >
                            Process Return
                          </button>
                        ) : (
                          <span className="text-[11px] theme-muted font-mono">Restocked</span>
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

      {/* ISSUE BOOK MODAL */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="theme-card rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
          >
            <div
              className="flex items-center justify-between p-5 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h3 className="font-bold theme-title text-base flex items-center gap-2">
                <Repeat className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                Issue Book to Patron
              </h3>
              <button onClick={onCloseIssueModal} className="theme-muted hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="p-6 space-y-4">
              {issueError && (
                <div
                  className="p-3 rounded-xl border text-xs flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--color-status-danger-bg)',
                    borderColor: 'var(--color-status-danger-border)',
                    color: 'var(--color-status-danger)'
                  }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{issueError}</span>
                </div>
              )}

              {/* Member Selection */}
              <div>
                <label className="text-xs font-semibold theme-title block mb-1">
                  Select Patron / Member *
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(parseInt(e.target.value))}
                  className="theme-input w-full px-3 py-2.5 rounded-xl text-xs"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberCode}) — Status: {m.status}
                    </option>
                  ))}
                </select>

                {selectedMember && selectedMember.status !== 'ACTIVE' && (
                  <div
                    className="mt-1 text-[11px] flex items-center gap-1 font-medium"
                    style={{ color: 'var(--color-status-danger)' }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Warning: Account is INACTIVE. System will prevent checkout.</span>
                  </div>
                )}
              </div>

              {/* Book Selection */}
              <div>
                <label className="text-xs font-semibold theme-title block mb-1">
                  Select Book to Issue *
                </label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(parseInt(e.target.value))}
                  className="theme-input w-full px-3 py-2.5 rounded-xl text-xs"
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} — {b.availableQuantity} available ({b.shelfNumber})
                    </option>
                  ))}
                </select>

                {selectedBook && (
                  <div className="mt-2 p-3 rounded-xl theme-card-subtle flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold theme-title">{selectedBook.title}</div>
                      <div className="text-[11px] theme-muted font-mono">
                        ISBN: {selectedBook.isbn} • Shelf: {selectedBook.shelfNumber}
                      </div>
                    </div>
                    <div>
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-mono font-bold"
                        style={{
                          backgroundColor: selectedBook.availableQuantity > 0
                            ? 'var(--color-status-success-bg)'
                            : 'var(--color-status-danger-bg)',
                          color: selectedBook.availableQuantity > 0
                            ? 'var(--color-status-success)'
                            : 'var(--color-status-danger)',
                          border: `1px solid ${
                            selectedBook.availableQuantity > 0
                              ? 'var(--color-status-success-border)'
                              : 'var(--color-status-danger-border)'
                          }`
                        }}
                      >
                        {selectedBook.availableQuantity > 0
                          ? `${selectedBook.availableQuantity} in stock`
                          : 'UNAVAILABLE'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout Terms Preview */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl theme-card-subtle text-xs">
                <div>
                  <span className="theme-muted block text-[11px]">Issue Date:</span>
                  <span className="font-mono font-medium theme-title">
                    {new Date().toISOString().split('T')[0]} (Today)
                  </span>
                </div>
                <div>
                  <span className="theme-muted block text-[11px]">Due Date:</span>
                  <span className="font-mono font-medium" style={{ color: 'var(--color-primary)' }}>
                    {(() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 14);
                      return d.toISOString().split('T')[0];
                    })()}{' '}
                    (+14 Days)
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold theme-title block mb-1">
                  Circulation Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Standard loan, copy in mint condition"
                  className="theme-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div
                className="flex items-center justify-end gap-2 pt-3 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <button
                  type="button"
                  onClick={onCloseIssueModal}
                  className="px-4 py-2 text-xs theme-muted hover:opacity-80 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedBook?.availableQuantity === 0 || selectedMember?.status !== 'ACTIVE'}
                  className="theme-btn-primary px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs rounded-xl shadow-xs"
                >
                  Confirm &amp; Issue Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN BOOK MODAL WITH FINE ENGINE */}
      {activeReturnTxId && returnTx && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="theme-card rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
          >
            <div
              className="flex items-center justify-between p-5 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h3 className="font-bold theme-title text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                Process Book Return #{returnTx.id}
              </h3>
              <button
                onClick={() => {
                  setActiveReturnTxId(null);
                  onCloseReturnModal();
                }}
                className="theme-muted hover:opacity-80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {returnError && (
                <div
                  className="p-3 rounded-xl border text-xs flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--color-status-danger-bg)',
                    borderColor: 'var(--color-status-danger-border)',
                    color: 'var(--color-status-danger)'
                  }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{returnError}</span>
                </div>
              )}

              {/* Book & Member Info */}
              <div className="theme-card-subtle p-4 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="theme-muted">Book:</span>
                  <span className="font-semibold theme-title">{returnBook?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-muted">ISBN:</span>
                  <span className="font-mono theme-title">{returnBook?.isbn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-muted">Patron:</span>
                  <span className="theme-title">
                    {returnMember?.fullName} ({returnMember?.memberCode})
                  </span>
                </div>
                <div
                  className="flex justify-between border-t pt-2"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <span className="theme-muted">Agreed Due Date:</span>
                  <span
                    className="font-mono font-semibold"
                    style={{ color: 'var(--color-status-warning)' }}
                  >
                    {returnTx.dueDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-muted">Actual Return Date:</span>
                  <span className="font-mono font-semibold theme-title">
                    {new Date().toISOString().split('T')[0]} (Today)
                  </span>
                </div>
              </div>

              {/* Automated Fine Engine Calculation Card */}
              <div
                className="p-4 rounded-xl border text-xs space-y-2"
                style={{
                  backgroundColor: overdueDaysCalc > 0 ? 'var(--color-status-warning-bg)' : 'var(--color-status-success-bg)',
                  borderColor: overdueDaysCalc > 0 ? 'var(--color-status-warning-border)' : 'var(--color-status-success-border)'
                }}
              >
                <div className="flex items-center justify-between font-bold">
                  <span
                    className="flex items-center gap-1.5"
                    style={{
                      color: overdueDaysCalc > 0 ? 'var(--color-status-warning)' : 'var(--color-status-success)'
                    }}
                  >
                    {overdueDaysCalc > 0 ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>{overdueDaysCalc > 0 ? 'Overdue Return Detected' : 'Returned On Time'}</span>
                  </span>
                  <span
                    className="font-mono text-sm tabular-nums"
                    style={{
                      color: overdueDaysCalc > 0 ? 'var(--color-status-warning)' : 'var(--color-status-success)'
                    }}
                  >
                    {overdueDaysCalc > 0 ? `${overdueDaysCalc} Overdue Day(s)` : '0 Days Late'}
                  </span>
                </div>

                <div className="text-[11px] theme-muted">
                  {overdueDaysCalc > 0 ? (
                    <div>
                      Calculation: <span className="font-mono">{overdueDaysCalc} days × ₹5.00/day</span> ={' '}
                      <span
                        className="font-bold font-mono text-sm tabular-nums"
                        style={{ color: 'var(--color-status-warning)' }}
                      >
                        ₹{fineCalc.toFixed(2)}
                      </span>
                      <p className="text-[10px] theme-muted mt-1">
                        An UNPAID fine record will be generated automatically for patron billing.
                      </p>
                    </div>
                  ) : (
                    <div>No late penalty assessed. Book will be restored directly to shelf.</div>
                  )}
                </div>
              </div>

              <div
                className="flex items-center justify-end gap-2 pt-3 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveReturnTxId(null);
                    onCloseReturnModal();
                  }}
                  className="px-4 py-2 text-xs theme-muted hover:opacity-80 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={() => handleReturnSubmit(returnTx.id)}
                  className="theme-btn-primary px-5 py-2 font-semibold text-xs rounded-xl shadow-xs"
                >
                  Confirm Return &amp; Restore Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
