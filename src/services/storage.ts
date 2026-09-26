import {
  User,
  Author,
  Category,
  Book,
  Member,
  BorrowTransaction,
  Fine
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_AUTHORS,
  INITIAL_CATEGORIES,
  INITIAL_BOOKS,
  INITIAL_MEMBERS,
  INITIAL_TRANSACTIONS,
  INITIAL_FINES
} from '../mockData';

const STORAGE_KEYS = {
  USERS: 'lms_users_v1',
  AUTHORS: 'lms_authors_v1',
  CATEGORIES: 'lms_categories_v1',
  BOOKS: 'lms_books_v1',
  MEMBERS: 'lms_members_v1',
  TRANSACTIONS: 'lms_transactions_v1',
  FINES: 'lms_fines_v1',
  CURRENT_USER: 'lms_current_user_v1'
};

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Storage read error for key:', key, e);
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write error for key:', key, e);
  }
}

export class LibraryStorageService {
  // Current user / Session
  static getCurrentUser(): User | null {
    return getStorage<User | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]); // default to admin for instant exploration
  }

  static setCurrentUser(user: User | null): void {
    setStorage(STORAGE_KEYS.CURRENT_USER, user);
  }

  static login(username: string, role?: 'ROLE_ADMIN' | 'ROLE_LIBRARIAN'): User | null {
    const users = this.getUsers();
    let user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user && role) {
      user = users.find(u => u.role === role);
    }
    if (user) {
      this.setCurrentUser(user);
    }
    return user || null;
  }

  static logout(): void {
    this.setCurrentUser(null);
  }

  // Users
  static getUsers(): User[] {
    return getStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  // Authors
  static getAuthors(): Author[] {
    return getStorage<Author[]>(STORAGE_KEYS.AUTHORS, INITIAL_AUTHORS);
  }

  static addAuthor(name: string, biography: string): Author {
    const authors = this.getAuthors();
    const newAuthor: Author = {
      id: authors.length > 0 ? Math.max(...authors.map(a => a.id)) + 1 : 1,
      name: name.trim(),
      biography: biography.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    authors.unshift(newAuthor);
    setStorage(STORAGE_KEYS.AUTHORS, authors);
    return newAuthor;
  }

  static updateAuthor(id: number, name: string, biography: string): Author {
    const authors = this.getAuthors();
    const idx = authors.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Author not found');
    authors[idx] = { ...authors[idx], name: name.trim(), biography: biography.trim() };
    setStorage(STORAGE_KEYS.AUTHORS, authors);
    return authors[idx];
  }

  static deleteAuthor(id: number): void {
    const books = this.getBooks();
    const isUsed = books.some(b => b.authorId === id);
    if (isUsed) {
      throw new Error('Cannot delete author: Books written by this author exist in the catalog.');
    }
    const authors = this.getAuthors().filter(a => a.id !== id);
    setStorage(STORAGE_KEYS.AUTHORS, authors);
  }

  // Categories
  static getCategories(): Category[] {
    return getStorage<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  static addCategory(name: string, description: string): Category {
    const categories = this.getCategories();
    if (categories.some(c => c.name.toLowerCase() === name.trim().toLowerCase())) {
      throw new Error('A category with this name already exists.');
    }
    const newCat: Category = {
      id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
      name: name.trim(),
      description: description.trim()
    };
    categories.push(newCat);
    setStorage(STORAGE_KEYS.CATEGORIES, categories);
    return newCat;
  }

  static updateCategory(id: number, name: string, description: string): Category {
    const categories = this.getCategories();
    const idx = categories.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    categories[idx] = { ...categories[idx], name: name.trim(), description: description.trim() };
    setStorage(STORAGE_KEYS.CATEGORIES, categories);
    return categories[idx];
  }

  static deleteCategory(id: number): void {
    const books = this.getBooks();
    const isUsed = books.some(b => b.categoryId === id);
    if (isUsed) {
      throw new Error('Cannot delete category: Books linked to this category exist in the catalog.');
    }
    const categories = this.getCategories().filter(c => c.id !== id);
    setStorage(STORAGE_KEYS.CATEGORIES, categories);
  }

  // Books
  static getBooks(): Book[] {
    return getStorage<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
  }

  static addBook(bookData: Omit<Book, 'id' | 'createdAt' | 'availableQuantity'>): Book {
    const books = this.getBooks();
    if (books.some(b => b.isbn.trim() === bookData.isbn.trim())) {
      throw new Error('Duplicate ISBN: A book with this ISBN already exists.');
    }
    if (bookData.quantity < 1) {
      throw new Error('Quantity must be at least 1.');
    }
    const newBook: Book = {
      ...bookData,
      id: books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1,
      availableQuantity: bookData.quantity,
      createdAt: new Date().toISOString().split('T')[0]
    };
    books.unshift(newBook);
    setStorage(STORAGE_KEYS.BOOKS, books);
    return newBook;
  }

  static updateBook(id: number, updated: Partial<Book>): Book {
    const books = this.getBooks();
    const idx = books.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Book not found');

    const current = books[idx];
    if (updated.isbn && updated.isbn !== current.isbn && books.some(b => b.id !== id && b.isbn === updated.isbn)) {
      throw new Error('Duplicate ISBN error: another book with this ISBN exists.');
    }

    // Adjust availableQuantity if total quantity changed
    let newAvailable = current.availableQuantity;
    if (typeof updated.quantity === 'number') {
      const issuedCount = current.quantity - current.availableQuantity;
      if (updated.quantity < issuedCount) {
        throw new Error(`Cannot reduce quantity below currently issued copies (${issuedCount} copies currently out on loan).`);
      }
      newAvailable = updated.quantity - issuedCount;
    }

    books[idx] = {
      ...current,
      ...updated,
      availableQuantity: newAvailable
    };
    setStorage(STORAGE_KEYS.BOOKS, books);
    return books[idx];
  }

  static deleteBook(id: number): void {
    const transactions = this.getTransactions();
    const hasActiveLoan = transactions.some(t => t.bookId === id && t.status !== 'RETURNED');
    if (hasActiveLoan) {
      throw new Error('Cannot delete book: Copies of this book are currently checked out.');
    }
    const books = this.getBooks().filter(b => b.id !== id);
    setStorage(STORAGE_KEYS.BOOKS, books);
  }

  // Members
  static getMembers(): Member[] {
    return getStorage<Member[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
  }

  static addMember(data: Omit<Member, 'id' | 'membershipDate'>): Member {
    const members = this.getMembers();
    if (members.some(m => m.email.toLowerCase() === data.email.trim().toLowerCase())) {
      throw new Error('Duplicate Email: A member with this email already exists.');
    }
    if (members.some(m => m.memberCode.toLowerCase() === data.memberCode.trim().toLowerCase())) {
      throw new Error('Duplicate Member Code: A member with this code already exists.');
    }
    const newMember: Member = {
      ...data,
      id: members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1,
      membershipDate: new Date().toISOString().split('T')[0]
    };
    members.unshift(newMember);
    setStorage(STORAGE_KEYS.MEMBERS, members);
    return newMember;
  }

  static updateMember(id: number, data: Partial<Member>): Member {
    const members = this.getMembers();
    const idx = members.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Member not found');

    if (data.email && members.some(m => m.id !== id && m.email.toLowerCase() === data.email!.toLowerCase())) {
      throw new Error('Duplicate Email: Another member is using this email.');
    }

    members[idx] = { ...members[idx], ...data };
    setStorage(STORAGE_KEYS.MEMBERS, members);
    return members[idx];
  }

  static deleteMember(id: number): void {
    const transactions = this.getTransactions();
    const hasActive = transactions.some(t => t.memberId === id && t.status !== 'RETURNED');
    if (hasActive) {
      throw new Error('Cannot delete member: This patron currently has unreturned books.');
    }
    const members = this.getMembers().filter(m => m.id !== id);
    setStorage(STORAGE_KEYS.MEMBERS, members);
  }

  // Circulation: Issue Book
  static issueBook(bookId: number, memberId: number, notes?: string): BorrowTransaction {
    const books = this.getBooks();
    const bookIdx = books.findIndex(b => b.id === bookId);
    if (bookIdx === -1) throw new Error('Selected book not found');
    const book = books[bookIdx];

    const members = this.getMembers();
    const member = members.find(m => m.id === memberId);
    if (!member) throw new Error('Selected member not found');

    if (member.status !== 'ACTIVE') {
      throw new Error(`Member account is ${member.status}. Only ACTIVE members can borrow books.`);
    }

    if (book.availableQuantity <= 0) {
      throw new Error(`"${book.title}" is currently UNAVAILABLE. All copies are currently issued.`);
    }

    // Atomic transaction: decrease availableQuantity
    books[bookIdx].availableQuantity -= 1;
    setStorage(STORAGE_KEYS.BOOKS, books);

    // Dates
    const today = new Date();
    const issueDateStr = today.toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // standard 14 days
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const transactions = this.getTransactions();
    const newTx: BorrowTransaction = {
      id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
      bookId,
      memberId,
      issuedByUserId: this.getCurrentUser()?.id || 2,
      issueDate: issueDateStr,
      dueDate: dueDateStr,
      returnDate: null,
      status: 'ISSUED',
      notes: notes || 'Standard 14-day checkout'
    };

    transactions.unshift(newTx);
    setStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
    return newTx;
  }

  // Circulation: Return Book
  static returnBook(transactionId: number): { transaction: BorrowTransaction; fine: Fine | null } {
    const transactions = this.getTransactions();
    const txIdx = transactions.findIndex(t => t.id === transactionId);
    if (txIdx === -1) throw new Error('Transaction not found');
    const tx = transactions[txIdx];

    if (tx.status === 'RETURNED') {
      throw new Error('This book has already been returned.');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    tx.returnDate = todayStr;
    tx.status = 'RETURNED';

    // Increase book available quantity
    const books = this.getBooks();
    const bookIdx = books.findIndex(b => b.id === tx.bookId);
    if (bookIdx !== -1) {
      books[bookIdx].availableQuantity += 1;
      setStorage(STORAGE_KEYS.BOOKS, books);
    }

    // Fine calculation logic: ₹5 per overdue day
    const dueTime = new Date(tx.dueDate).getTime();
    const returnTime = new Date(todayStr).getTime();
    const diffDays = Math.ceil((returnTime - dueTime) / (1000 * 60 * 60 * 24));

    let createdFine: Fine | null = null;
    const overdueDays = Math.max(0, diffDays);

    if (overdueDays > 0) {
      const fineAmount = overdueDays * 5.0; // ₹5 per day
      const fines = this.getFines();
      createdFine = {
        id: fines.length > 0 ? Math.max(...fines.map(f => f.id)) + 1 : 1,
        transactionId: tx.id,
        overdueDays,
        fineAmount,
        paidStatus: 'UNPAID',
        paymentDate: null
      };
      fines.unshift(createdFine);
      setStorage(STORAGE_KEYS.FINES, fines);
    }

    transactions[txIdx] = tx;
    setStorage(STORAGE_KEYS.TRANSACTIONS, transactions);

    return { transaction: tx, fine: createdFine };
  }

  static getTransactions(): BorrowTransaction[] {
    return getStorage<BorrowTransaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  }

  // Fines
  static getFines(): Fine[] {
    return getStorage<Fine[]>(STORAGE_KEYS.FINES, INITIAL_FINES);
  }

  static payFine(fineId: number): Fine {
    const fines = this.getFines();
    const idx = fines.findIndex(f => f.id === fineId);
    if (idx === -1) throw new Error('Fine record not found');
    fines[idx].paidStatus = 'PAID';
    fines[idx].paymentDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setStorage(STORAGE_KEYS.FINES, fines);
    return fines[idx];
  }

  static waiveFine(fineId: number): Fine {
    const fines = this.getFines();
    const idx = fines.findIndex(f => f.id === fineId);
    if (idx === -1) throw new Error('Fine record not found');
    fines[idx].paidStatus = 'WAIVED';
    fines[idx].paymentDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setStorage(STORAGE_KEYS.FINES, fines);
    return fines[idx];
  }

  // Reset to original seed data
  static resetToDefault(): void {
    setStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    setStorage(STORAGE_KEYS.AUTHORS, INITIAL_AUTHORS);
    setStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    setStorage(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    setStorage(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
    setStorage(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    setStorage(STORAGE_KEYS.FINES, INITIAL_FINES);
    setStorage(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }

  // Aggregated Stats
  static getStatistics() {
    const books = this.getBooks();
    const members = this.getMembers();
    const transactions = this.getTransactions();
    const fines = this.getFines();

    const totalBooks = books.reduce((acc, b) => acc + b.quantity, 0);
    const availableBooks = books.reduce((acc, b) => acc + b.availableQuantity, 0);
    const issuedBooks = transactions.filter(t => t.status === 'ISSUED' || t.status === 'OVERDUE').length;
    const overdueBooks = transactions.filter(t => t.status === 'OVERDUE').length;
    const returnedBooks = transactions.filter(t => t.status === 'RETURNED').length;

    const totalFinesAmount = fines.reduce((acc, f) => acc + f.fineAmount, 0);
    const unpaidFinesAmount = fines.filter(f => f.paidStatus === 'UNPAID').reduce((acc, f) => acc + f.fineAmount, 0);
    const paidFinesAmount = fines.filter(f => f.paidStatus === 'PAID').reduce((acc, f) => acc + f.fineAmount, 0);

    return {
      totalBookTitles: books.length,
      totalBooksCopies: totalBooks,
      availableBooks,
      issuedBooks,
      overdueBooks,
      returnedBooks,
      totalMembers: members.length,
      activeMembers: members.filter(m => m.status === 'ACTIVE').length,
      totalFinesCount: fines.length,
      totalFinesAmount,
      unpaidFinesAmount,
      paidFinesAmount
    };
  }
}
