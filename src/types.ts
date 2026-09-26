export type RoleType = 'ROLE_ADMIN' | 'ROLE_LIBRARIAN';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: RoleType;
  enabled: boolean;
}

export interface Author {
  id: number;
  name: string;
  biography: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Book {
  id: number;
  isbn: string;
  title: string;
  authorId: number;
  categoryId: number;
  publisher: string;
  publicationYear: number;
  quantity: number;
  availableQuantity: number;
  shelfNumber: string;
  createdAt: string;
}

export type MemberStatus = 'ACTIVE' | 'INACTIVE';

export interface Member {
  id: number;
  memberCode: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  membershipDate: string;
  status: MemberStatus;
}

export type TransactionStatus = 'ISSUED' | 'RETURNED' | 'OVERDUE';

export interface BorrowTransaction {
  id: number;
  bookId: number;
  memberId: number;
  issuedByUserId: number;
  issueDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  returnDate?: string | null;
  status: TransactionStatus;
  notes?: string;
}

export type FineStatus = 'UNPAID' | 'PAID' | 'WAIVED';

export interface Fine {
  id: number;
  transactionId: number;
  overdueDays: number;
  fineAmount: number;
  paidStatus: FineStatus;
  paymentDate?: string | null;
}
