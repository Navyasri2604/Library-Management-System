import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  DollarSign
} from 'lucide-react';
import { LibraryStorageService } from '../services/storage';

export const ReportsView: React.FC = () => {
  const [reportType, setReportType] = useState<
    'all_books' | 'available_books' | 'issued_books' | 'overdue_books' | 'members' | 'fines'
  >('all_books');

  const books = LibraryStorageService.getBooks();
  const authors = LibraryStorageService.getAuthors();
  const categories = LibraryStorageService.getCategories();
  const members = LibraryStorageService.getMembers();
  const transactions = LibraryStorageService.getTransactions();
  const fines = LibraryStorageService.getFines();

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'all_books' || reportType === 'available_books') {
      csvContent += 'ID,ISBN,Title,Author,Category,Quantity,AvailableQuantity,ShelfNumber\n';
      const targetBooks =
        reportType === 'available_books' ? books.filter((b) => b.availableQuantity > 0) : books;
      targetBooks.forEach((b) => {
        const a = authors.find((au) => au.id === b.authorId)?.name || '';
        const c = categories.find((ca) => ca.id === b.categoryId)?.name || '';
        csvContent += `"${b.id}","${b.isbn}","${b.title}","${a}","${c}","${b.quantity}","${b.availableQuantity}","${b.shelfNumber}"\n`;
      });
    } else if (reportType === 'fines') {
      csvContent += 'FineID,TransactionID,OverdueDays,Amount,Status,PaymentDate\n';
      fines.forEach((f) => {
        csvContent += `"${f.id}","${f.transactionId}","${f.overdueDays}","${f.fineAmount}","${f.paidStatus}","${f.paymentDate || ''}"\n`;
      });
    } else if (reportType === 'members') {
      csvContent += 'ID,MemberCode,FullName,Email,Phone,Status\n';
      members.forEach((m) => {
        csvContent += `"${m.id}","${m.memberCode}","${m.fullName}","${m.email}","${m.phone}","${m.status}"\n`;
      });
    } else {
      csvContent += 'TransactionID,BookID,MemberID,IssueDate,DueDate,Status\n';
      transactions.forEach((t) => {
        csvContent += `"${t.id}","${t.bookId}","${t.memberId}","${t.issueDate}","${t.dueDate}","${t.status}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `library_report_${reportType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold theme-title flex items-center gap-2">
            <FileText className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            Library Reports &amp; Audit Logs
          </h2>
          <p className="text-xs theme-muted mt-0.5">
            Statistical audits for inventory stock, circulation activity, overdue fines, and members.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="theme-btn-secondary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="theme-btn-primary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setReportType('all_books')}
          className="px-3.5 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
          style={{
            backgroundColor: reportType === 'all_books' ? 'var(--color-primary)' : 'var(--color-bg-card)',
            color: reportType === 'all_books' ? '#ffffff' : 'var(--color-text-body)',
            border: `1px solid ${reportType === 'all_books' ? 'var(--color-primary)' : 'var(--color-border)'}`
          }}
        >
          <BookOpen className="w-3.5 h-3.5" />
          All Books ({books.length})
        </button>
        <button
          onClick={() => setReportType('available_books')}
          className="px-3.5 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
          style={{
            backgroundColor: reportType === 'available_books' ? 'var(--color-primary)' : 'var(--color-bg-card)',
            color: reportType === 'available_books' ? '#ffffff' : 'var(--color-text-body)',
            border: `1px solid ${reportType === 'available_books' ? 'var(--color-primary)' : 'var(--color-border)'}`
          }}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Available Books ({books.filter((b) => b.availableQuantity > 0).length})
        </button>
        <button
          onClick={() => setReportType('issued_books')}
          className="px-3.5 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
          style={{
            backgroundColor: reportType === 'issued_books' ? 'var(--color-primary)' : 'var(--color-bg-card)',
            color: reportType === 'issued_books' ? '#ffffff' : 'var(--color-text-body)',
            border: `1px solid ${reportType === 'issued_books' ? 'var(--color-primary)' : 'var(--color-border)'}`
          }}
        >
          <Clock className="w-3.5 h-3.5" />
          Currently Issued ({transactions.filter((t) => t.status === 'ISSUED').length})
        </button>
        <button
          onClick={() => setReportType('overdue_books')}
          className="px-3.5 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
          style={{
            backgroundColor: reportType === 'overdue_books' ? 'var(--color-status-danger)' : 'var(--color-bg-card)',
            color: reportType === 'overdue_books' ? '#ffffff' : 'var(--color-status-danger)',
            border: `1px solid ${reportType === 'overdue_books' ? 'var(--color-status-danger)' : 'var(--color-border)'}`
          }}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Overdue Books ({transactions.filter((t) => t.status === 'OVERDUE').length})
        </button>
        <button
          onClick={() => setReportType('members')}
          className="px-3.5 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
          style={{
            backgroundColor: reportType === 'members' ? 'var(--color-primary)' : 'var(--color-bg-card)',
            color: reportType === 'members' ? '#ffffff' : 'var(--color-text-body)',
            border: `1px solid ${reportType === 'members' ? 'var(--color-primary)' : 'var(--color-border)'}`
          }}
        >
          <Users className="w-3.5 h-3.5" />
          Patrons ({members.length})
        </button>
        <button
          onClick={() => setReportType('fines')}
          className="px-3.5 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
          style={{
            backgroundColor: reportType === 'fines' ? 'var(--color-status-warning)' : 'var(--color-bg-card)',
            color: reportType === 'fines' ? '#ffffff' : 'var(--color-status-warning)',
            border: `1px solid ${reportType === 'fines' ? 'var(--color-status-warning)' : 'var(--color-border)'}`
          }}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Fines &amp; Penalties ({fines.length})
        </button>
      </div>

      {/* Report Tables Container */}
      <div className="theme-card rounded-2xl overflow-hidden p-1">
        {/* REPORT 1 & 2: BOOKS */}
        {(reportType === 'all_books' || reportType === 'available_books') && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="theme-table-head font-mono border-b">
                <tr>
                  <th className="p-3.5">ISBN</th>
                  <th className="p-3.5">Book Title</th>
                  <th className="p-3.5">Author</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Publisher</th>
                  <th className="p-3.5 text-center">Total Copies</th>
                  <th className="p-3.5 text-center">Available</th>
                  <th className="p-3.5">Shelf Location</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
                {books
                  .filter((b) => (reportType === 'available_books' ? b.availableQuantity > 0 : true))
                  .map((b) => {
                    const a = authors.find((au) => au.id === b.authorId);
                    const c = categories.find((ca) => ca.id === b.categoryId);
                    return (
                      <tr key={b.id} className="theme-table-row">
                        <td className="p-3.5 font-mono theme-muted font-semibold tabular-nums">{b.isbn}</td>
                        <td className="p-3.5 font-semibold theme-title">{b.title}</td>
                        <td className="p-3.5 theme-title">{a?.name}</td>
                        <td className="p-3.5" style={{ color: 'var(--color-primary)' }}>{c?.name}</td>
                        <td className="p-3.5 theme-muted">
                          {b.publisher} ({b.publicationYear})
                        </td>
                        <td className="p-3.5 text-center font-mono tabular-nums">{b.quantity}</td>
                        <td
                          className="p-3.5 text-center font-mono font-bold tabular-nums"
                          style={{ color: 'var(--color-status-success)' }}
                        >
                          {b.availableQuantity}
                        </td>
                        <td className="p-3.5 font-mono theme-muted tabular-nums">{b.shelfNumber}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 3 & 4: CIRCULATION (ISSUED & OVERDUE) */}
        {(reportType === 'issued_books' || reportType === 'overdue_books') && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="theme-table-head font-mono border-b">
                <tr>
                  <th className="p-3.5">Loan ID</th>
                  <th className="p-3.5">Book Title</th>
                  <th className="p-3.5">Patron Member</th>
                  <th className="p-3.5">Issue Date</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5">Estimated Late Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
                {transactions
                  .filter((t) => (reportType === 'overdue_books' ? t.status === 'OVERDUE' : t.status === 'ISSUED'))
                  .map((t) => {
                    const book = books.find((b) => b.id === t.bookId);
                    const member = members.find((m) => m.id === t.memberId);
                    return (
                      <tr key={t.id} className="theme-table-row">
                        <td className="p-3.5 font-mono theme-muted font-semibold tabular-nums">#{t.id}</td>
                        <td className="p-3.5 font-semibold theme-title">{book?.title}</td>
                        <td className="p-3.5 theme-title">
                          {member?.fullName} ({member?.memberCode})
                        </td>
                        <td className="p-3.5 font-mono theme-muted tabular-nums">{t.issueDate}</td>
                        <td
                          className="p-3.5 font-mono font-semibold tabular-nums"
                          style={{ color: 'var(--color-status-warning)' }}
                        >
                          {t.dueDate}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className="px-2.5 py-0.5 rounded text-[11px] font-semibold"
                            style={{
                              backgroundColor: t.status === 'OVERDUE'
                                ? 'var(--color-status-danger-bg)'
                                : 'var(--color-primary-soft)',
                              color: t.status === 'OVERDUE'
                                ? 'var(--color-status-danger)'
                                : 'var(--color-primary-text)',
                              border: `1px solid ${
                                t.status === 'OVERDUE'
                                  ? 'var(--color-status-danger-border)'
                                  : 'var(--color-primary-border)'
                              }`
                            }}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td
                          className="p-3.5 font-mono font-bold tabular-nums"
                          style={{
                            color: t.status === 'OVERDUE' ? 'var(--color-status-warning)' : 'var(--color-text-muted)'
                          }}
                        >
                          {t.status === 'OVERDUE' ? 'Accruing ₹5/day' : '₹0.00'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 5: PATRONS */}
        {reportType === 'members' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="theme-table-head font-mono border-b">
                <tr>
                  <th className="p-3.5">Card Code</th>
                  <th className="p-3.5">Full Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Membership Date</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Active Loans</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
                {members.map((m) => {
                  const activeLoans = transactions.filter(
                    (t) => t.memberId === m.id && t.status !== 'RETURNED'
                  ).length;
                  return (
                    <tr key={m.id} className="theme-table-row">
                      <td
                        className="p-3.5 font-mono font-semibold tabular-nums"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {m.memberCode}
                      </td>
                      <td className="p-3.5 font-semibold theme-title">{m.fullName}</td>
                      <td className="p-3.5 theme-title">{m.email}</td>
                      <td className="p-3.5 font-mono theme-muted tabular-nums">{m.phone}</td>
                      <td className="p-3.5 font-mono theme-muted tabular-nums">{m.membershipDate}</td>
                      <td className="p-3.5 text-center">
                        <span
                          className="px-2.5 py-0.5 rounded text-[11px] font-semibold"
                          style={{
                            backgroundColor: m.status === 'ACTIVE'
                              ? 'var(--color-status-success-bg)'
                              : 'var(--color-status-danger-bg)',
                            color: m.status === 'ACTIVE'
                              ? 'var(--color-status-success)'
                              : 'var(--color-status-danger)',
                            border: `1px solid ${
                              m.status === 'ACTIVE'
                                ? 'var(--color-status-success-border)'
                                : 'var(--color-status-danger-border)'
                            }`
                          }}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold theme-title tabular-nums">
                        {activeLoans}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 6: FINES AUDIT */}
        {reportType === 'fines' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="theme-table-head font-mono border-b">
                <tr>
                  <th className="p-3.5">Fine ID</th>
                  <th className="p-3.5">Loan Reference</th>
                  <th className="p-3.5">Patron</th>
                  <th className="p-3.5">Overdue Days</th>
                  <th className="p-3.5">Fine Rate</th>
                  <th className="p-3.5">Amount (₹)</th>
                  <th className="p-3.5 text-center">Paid Status</th>
                  <th className="p-3.5">Payment Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
                {fines.map((f) => {
                  const tx = transactions.find((t) => t.id === f.transactionId);
                  const member = tx ? members.find((m) => m.id === tx.memberId) : null;
                  return (
                    <tr key={f.id} className="theme-table-row">
                      <td className="p-3.5 font-mono theme-muted font-semibold tabular-nums">#{f.id}</td>
                      <td
                        className="p-3.5 font-mono font-medium tabular-nums"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        Loan #{f.transactionId}
                      </td>
                      <td className="p-3.5 theme-title">
                        {member ? `${member.fullName} (${member.memberCode})` : 'N/A'}
                      </td>
                      <td
                        className="p-3.5 font-mono font-medium tabular-nums"
                        style={{ color: 'var(--color-status-warning)' }}
                      >
                        {f.overdueDays} days
                      </td>
                      <td className="p-3.5 font-mono theme-muted">₹5.00 / day</td>
                      <td className="p-3.5 font-mono font-bold theme-title tabular-nums">
                        ₹{f.fineAmount.toFixed(2)}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className="px-2.5 py-0.5 rounded text-[11px] font-semibold"
                          style={{
                            backgroundColor: f.paidStatus === 'PAID'
                              ? 'var(--color-status-success-bg)'
                              : f.paidStatus === 'UNPAID'
                              ? 'var(--color-status-danger-bg)'
                              : 'var(--color-bg-card-subtle)',
                            color: f.paidStatus === 'PAID'
                              ? 'var(--color-status-success)'
                              : f.paidStatus === 'UNPAID'
                              ? 'var(--color-status-danger)'
                              : 'var(--color-text-muted)',
                            border: `1px solid ${
                              f.paidStatus === 'PAID'
                                ? 'var(--color-status-success-border)'
                                : f.paidStatus === 'UNPAID'
                                ? 'var(--color-status-danger-border)'
                                : 'var(--color-border)'
                            }`
                          }}
                        >
                          {f.paidStatus}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono theme-muted tabular-nums">
                        {f.paymentDate || <span className="opacity-50">Pending</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
