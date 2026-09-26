import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  History,
  Clock,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { LibraryStorageService } from '../services/storage';
import { Member, RoleType, MemberStatus } from '../types';

interface MembersViewProps {
  role: RoleType;
}

export const MembersView: React.FC<MembersViewProps> = ({ role }) => {
  const isAdmin = role === 'ROLE_ADMIN';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [historyMember, setHistoryMember] = useState<Member | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [memberCode, setMemberCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<MemberStatus>('ACTIVE');

  const members = LibraryStorageService.getMembers();
  const books = LibraryStorageService.getBooks();
  const transactions = LibraryStorageService.getTransactions();

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setMemberCode(`MEM-2024-${String(members.length + 1).padStart(3, '0')}`);
    setFullName('');
    setEmail('');
    setPhone('+91 ');
    setAddress('');
    setStatus('ACTIVE');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: Member) => {
    setEditingMember(member);
    setMemberCode(member.memberCode);
    setFullName(member.fullName);
    setEmail(member.email);
    setPhone(member.phone);
    setAddress(member.address || '');
    setStatus(member.status);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !memberCode.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('All fields marked with an asterisk are required.');
      return;
    }

    try {
      if (editingMember) {
        LibraryStorageService.updateMember(editingMember.id, {
          memberCode: memberCode.trim(),
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          status
        });
        setSuccessMsg(`Patron record "${fullName.trim()}" successfully updated.`);
      } else {
        LibraryStorageService.addMember({
          memberCode: memberCode.trim(),
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          status
        });
        setSuccessMsg(`Patron "${fullName.trim()}" successfully registered.`);
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    }
  };

  const handleDeleteMember = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to remove patron "${name}"?`)) {
      try {
        LibraryStorageService.deleteMember(id);
        setSuccessMsg(`Patron "${name}" deleted.`);
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err: any) {
        alert(err.message || 'Delete failed');
      }
    }
  };

  const handleToggleStatus = (member: Member) => {
    const newStatus: MemberStatus = member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      LibraryStorageService.updateMember(member.id, { status: newStatus });
      setSuccessMsg(`Patron status changed to ${newStatus}.`);
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  // Filter members
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successMsg && (
        <div
          className="border px-4 py-3 rounded-xl text-xs flex items-center gap-2"
          style={{
            backgroundColor: 'var(--color-status-success-bg)',
            borderColor: 'var(--color-status-success-border)',
            color: 'var(--color-status-success)'
          }}
        >
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold theme-title flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            Patron Member Management
          </h2>
          <p className="text-xs theme-muted mt-0.5">
            Student &amp; faculty library accounts, card identification, and circulation privileges.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="theme-btn-primary px-4 py-2.5 font-semibold text-xs rounded-xl flex items-center gap-2 shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Patron</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="theme-card rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 theme-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by patron name, membership code, email, or phone..."
            className="theme-input w-full pl-10 pr-4 py-2 rounded-xl text-xs"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="theme-input rounded-xl px-3 py-2 text-xs"
        >
          <option value="ALL">All Account Statuses</option>
          <option value="ACTIVE">ACTIVE (Borrowing Allowed)</option>
          <option value="INACTIVE">INACTIVE (Blocked / Suspended)</option>
        </select>
      </div>

      {/* Members Table */}
      <div className="theme-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="theme-table-head font-mono border-b">
              <tr>
                <th className="p-3.5">Card Code</th>
                <th className="p-3.5">Full Name</th>
                <th className="p-3.5">Email &amp; Phone</th>
                <th className="p-3.5">Membership Date</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center theme-muted text-xs">
                    No patrons found matching the current search criteria.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const isActive = m.status === 'ACTIVE';

                  return (
                    <tr key={m.id} className="theme-table-row">
                      <td
                        className="p-3.5 font-mono font-semibold tabular-nums"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {m.memberCode}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold theme-title">{m.fullName}</div>
                        <div className="text-[11px] theme-muted truncate max-w-xs">{m.address || 'Address on file'}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="theme-title">{m.email}</div>
                        <div className="text-[11px] font-mono theme-muted tabular-nums">{m.phone}</div>
                      </td>
                      <td className="p-3.5 font-mono theme-muted tabular-nums">{m.membershipDate}</td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleStatus(m)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition"
                          style={{
                            backgroundColor: isActive
                              ? 'var(--color-status-success-bg)'
                              : 'var(--color-status-danger-bg)',
                            color: isActive
                              ? 'var(--color-status-success)'
                              : 'var(--color-status-danger)',
                            border: `1px solid ${
                              isActive
                                ? 'var(--color-status-success-border)'
                                : 'var(--color-status-danger-border)'
                            }`
                          }}
                          title="Click to toggle account status"
                        >
                          {isActive ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                          <span>{m.status}</span>
                        </button>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setHistoryMember(m)}
                            className="theme-btn-secondary px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1"
                            title="View patron loans"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span>Loans</span>
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(m)}
                            className="p-1.5 rounded-lg theme-muted hover:text-blue-600 transition"
                            title="Edit Patron"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteMember(m.id, m.fullName)}
                              className="p-1.5 rounded-lg hover:text-red-600 transition"
                              style={{ color: 'var(--color-status-danger)' }}
                              title="Delete Patron"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Borrowing History Modal */}
      {historyMember && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="theme-card rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
          >
            <div
              className="flex items-center justify-between p-5 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div>
                <h3 className="font-bold theme-title text-base">
                  Borrowing History: {historyMember.fullName}
                </h3>
                <p className="text-xs theme-muted font-mono">
                  Card Code: {historyMember.memberCode} • Email: {historyMember.email}
                </p>
              </div>
              <button
                onClick={() => setHistoryMember(null)}
                className="theme-muted hover:opacity-80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {(() => {
                const memberLoans = transactions.filter((t) => t.memberId === historyMember.id);
                if (memberLoans.length === 0) {
                  return (
                    <div className="text-center py-8 theme-muted text-xs">
                      This patron has no borrowing transactions on record.
                    </div>
                  );
                }

                return (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {memberLoans.map((t) => {
                      const book = books.find((b) => b.id === t.bookId);
                      return (
                        <div
                          key={t.id}
                          className="theme-card-subtle p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-semibold theme-title">
                              {book ? book.title : `Book #${t.bookId}`}
                            </div>
                            <div className="text-[11px] theme-muted font-mono mt-0.5 tabular-nums">
                              Issued: {t.issueDate} • Due: {t.dueDate}
                              {t.returnDate && ` • Returned: ${t.returnDate}`}
                            </div>
                            {t.notes && <div className="text-[10px] theme-muted italic mt-0.5">{t.notes}</div>}
                          </div>

                          <div>
                            {t.status === 'ISSUED' && (
                              <span
                                className="px-2.5 py-1 rounded text-[11px] font-semibold"
                                style={{
                                  backgroundColor: 'var(--color-primary-soft)',
                                  color: 'var(--color-primary-text)',
                                  border: '1px solid var(--color-primary-border)'
                                }}
                              >
                                ACTIVE LOAN
                              </span>
                            )}
                            {t.status === 'OVERDUE' && (
                              <span
                                className="px-2.5 py-1 rounded text-[11px] font-semibold"
                                style={{
                                  backgroundColor: 'var(--color-status-danger-bg)',
                                  color: 'var(--color-status-danger)',
                                  border: '1px solid var(--color-status-danger-border)'
                                }}
                              >
                                OVERDUE
                              </span>
                            )}
                            {t.status === 'RETURNED' && (
                              <span
                                className="px-2.5 py-1 rounded text-[11px] font-semibold"
                                style={{
                                  backgroundColor: 'var(--color-status-success-bg)',
                                  color: 'var(--color-status-success)',
                                  border: '1px solid var(--color-status-success-border)'
                                }}
                              >
                                RETURNED
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div
              className="p-4 border-t flex justify-end"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-bg-card-subtle)'
              }}
            >
              <button
                onClick={() => setHistoryMember(null)}
                className="theme-btn-primary px-4 py-2 rounded-xl text-xs font-semibold shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="theme-card rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
          >
            <div
              className="flex items-center justify-between p-5 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h3 className="font-bold theme-title text-base">
                {editingMember ? 'Update Patron Record' : 'Register New Patron'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="theme-muted hover:opacity-80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="p-6 space-y-4">
              {errorMsg && (
                <div
                  className="p-3 rounded-xl border text-xs flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--color-status-danger-bg)',
                    borderColor: 'var(--color-status-danger-border)',
                    color: 'var(--color-status-danger)'
                  }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold theme-title block mb-1">
                    Member Code *
                  </label>
                  <input
                    type="text"
                    value={memberCode}
                    onChange={(e) => setMemberCode(e.target.value)}
                    placeholder="MEM-2024-001"
                    className="theme-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold theme-title block mb-1">
                    Account Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="theme-input w-full px-3 py-2 rounded-xl text-xs"
                  >
                    <option value="ACTIVE">ACTIVE (Borrowing Permitted)</option>
                    <option value="INACTIVE">INACTIVE (Locked)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold theme-title block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="theme-input w-full px-3 py-2 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold theme-title block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="theme-input w-full px-3 py-2 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold theme-title block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="theme-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold theme-title block mb-1">
                  Residential / Campus Address
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Room / Hostel, City, State"
                  className="theme-input w-full px-3 py-2 rounded-xl text-xs"
                ></textarea>
              </div>

              <div
                className="flex items-center justify-end gap-2 pt-3 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs theme-muted hover:opacity-80 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="theme-btn-primary px-5 py-2 font-semibold text-xs rounded-xl shadow-xs"
                >
                  {editingMember ? 'Save Changes' : 'Register Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
