import { User, Author, Category, Book, Member, BorrowTransaction, Fine } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    username: 'admin',
    fullName: 'System Administrator',
    email: 'admin@library.com',
    phone: '+91 98765 43210',
    role: 'ROLE_ADMIN',
    enabled: true
  },
  {
    id: 2,
    username: 'librarian',
    fullName: 'Chief Librarian',
    email: 'librarian@library.com',
    phone: '+91 98765 43211',
    role: 'ROLE_LIBRARIAN',
    enabled: true
  }
];

export const INITIAL_AUTHORS: Author[] = [
  {
    id: 1,
    name: 'Robert C. Martin',
    biography: 'Known as "Uncle Bob", software engineer and author of Agile Software Development and Clean Code.',
    createdAt: '2024-01-10'
  },
  {
    id: 2,
    name: 'Joshua Bloch',
    biography: 'Former Chief Java Architect at Google, author of Effective Java, and key contributor to Java Collections Framework.',
    createdAt: '2024-01-12'
  },
  {
    id: 3,
    name: 'Martin Fowler',
    biography: 'Chief Scientist at ThoughtWorks, expert in software design, microservices, and author of Refactoring.',
    createdAt: '2024-01-15'
  },
  {
    id: 4,
    name: 'Thomas H. Cormen',
    biography: 'Professor Emeritus of Computer Science at Dartmouth College and co-author of Introduction to Algorithms (CLRS).',
    createdAt: '2024-01-18'
  },
  {
    id: 5,
    name: 'Martin Kleppmann',
    biography: 'Researcher in distributed systems at University of Cambridge and author of Designing Data-Intensive Applications.',
    createdAt: '2024-01-20'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'Software Engineering', description: 'Clean architecture, design patterns, testing, and agile practices.' },
  { id: 2, name: 'Java Programming', description: 'Core Java, JVM internals, multithreading, and Spring Framework.' },
  { id: 3, name: 'Algorithms & Data Structures', description: 'Complexity analysis, graph theory, dynamic programming, and sorting.' },
  { id: 4, name: 'Distributed Systems', description: 'Storage engines, replication, consensus, partitioning, and reliability.' },
  { id: 5, name: 'Database Engineering', description: 'Relational 3NF schemas, indexing, transactions, and SQL query tuning.' }
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 1,
    isbn: '978-0132350884',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    authorId: 1,
    categoryId: 1,
    publisher: 'Prentice Hall',
    publicationYear: 2008,
    quantity: 6,
    availableQuantity: 4,
    shelfNumber: 'Aisle-3, Rack-A',
    createdAt: '2024-01-10'
  },
  {
    id: 2,
    isbn: '978-0134685991',
    title: 'Effective Java (3rd Edition)',
    authorId: 2,
    categoryId: 2,
    publisher: 'Addison-Wesley Professional',
    publicationYear: 2017,
    quantity: 5,
    availableQuantity: 3,
    shelfNumber: 'Aisle-3, Rack-B',
    createdAt: '2024-01-12'
  },
  {
    id: 3,
    isbn: '978-0134757599',
    title: 'Refactoring: Improving the Design of Existing Code',
    authorId: 3,
    categoryId: 1,
    publisher: 'Addison-Wesley',
    publicationYear: 2018,
    quantity: 4,
    availableQuantity: 4,
    shelfNumber: 'Aisle-3, Rack-C',
    createdAt: '2024-01-15'
  },
  {
    id: 4,
    isbn: '978-0262033848',
    title: 'Introduction to Algorithms (CLRS)',
    authorId: 4,
    categoryId: 3,
    publisher: 'MIT Press',
    publicationYear: 2009,
    quantity: 8,
    availableQuantity: 6,
    shelfNumber: 'Aisle-1, Rack-D',
    createdAt: '2024-01-18'
  },
  {
    id: 5,
    isbn: '978-1449373320',
    title: 'Designing Data-Intensive Applications',
    authorId: 5,
    categoryId: 4,
    publisher: "O'Reilly Media",
    publicationYear: 2017,
    quantity: 5,
    availableQuantity: 2,
    shelfNumber: 'Aisle-2, Rack-A',
    createdAt: '2024-01-20'
  },
  {
    id: 6,
    isbn: '978-0134494166',
    title: 'Clean Architecture: A Craftsman\'s Guide to Software Structure',
    authorId: 1,
    categoryId: 1,
    publisher: 'Prentice Hall',
    publicationYear: 2017,
    quantity: 4,
    availableQuantity: 0,
    shelfNumber: 'Aisle-3, Rack-A',
    createdAt: '2024-01-25'
  }
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 1,
    memberCode: 'MEM-2024-001',
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 91234 56789',
    address: 'Flat 402, Green Glen Layout, Bellandur, Bangalore',
    membershipDate: '2024-01-05',
    status: 'ACTIVE'
  },
  {
    id: 2,
    memberCode: 'MEM-2024-002',
    fullName: 'Ananya Patel',
    email: 'ananya.patel@example.com',
    phone: '+91 92345 67890',
    address: 'B-12, Sector 62, Noida, Uttar Pradesh',
    membershipDate: '2024-01-10',
    status: 'ACTIVE'
  },
  {
    id: 3,
    memberCode: 'MEM-2024-003',
    fullName: 'Vikram Verma',
    email: 'vikram.verma@example.com',
    phone: '+91 93456 78901',
    address: 'Plot 88, Jubilee Hills, Hyderabad',
    membershipDate: '2024-02-01',
    status: 'ACTIVE'
  },
  {
    id: 4,
    memberCode: 'MEM-2024-004',
    fullName: 'Neha Kulkarni',
    email: 'neha.kulkarni@example.com',
    phone: '+91 94567 89012',
    address: '14/B, Kothrud, Pune, Maharashtra',
    membershipDate: '2024-02-15',
    status: 'INACTIVE'
  }
];

// Today reference: 2026-09-26
export const INITIAL_TRANSACTIONS: BorrowTransaction[] = [
  {
    id: 1,
    bookId: 1, // Clean Code
    memberId: 1, // Rahul
    issuedByUserId: 2, // Librarian
    issueDate: '2026-09-18',
    dueDate: '2026-10-02',
    returnDate: null,
    status: 'ISSUED',
    notes: 'Issued in pristine condition'
  },
  {
    id: 2,
    bookId: 2, // Effective Java
    memberId: 2, // Ananya
    issuedByUserId: 2,
    issueDate: '2026-09-20',
    dueDate: '2026-10-04',
    returnDate: null,
    status: 'ISSUED',
    notes: 'Reference copy'
  },
  {
    id: 3,
    bookId: 5, // Designing Data-Intensive Apps
    memberId: 3, // Vikram
    issuedByUserId: 2,
    issueDate: '2026-09-01',
    dueDate: '2026-09-15', // Due 11 days ago! Overdue!
    returnDate: null,
    status: 'OVERDUE',
    notes: 'Late reminder SMS sent'
  },
  {
    id: 4,
    bookId: 4, // CLRS Algorithms
    memberId: 1, // Rahul
    issuedByUserId: 2,
    issueDate: '2026-08-10',
    dueDate: '2026-08-24',
    returnDate: '2026-08-28', // Returned 4 days late
    status: 'RETURNED',
    notes: 'Returned with minor wear'
  }
];

export const INITIAL_FINES: Fine[] = [
  {
    id: 1,
    transactionId: 4, // Rahul returned 4 days late: 4 * 5 = 20
    overdueDays: 4,
    fineAmount: 20.0,
    paidStatus: 'PAID',
    paymentDate: '2026-08-28 14:30:00'
  },
  {
    id: 2,
    transactionId: 3, // Vikram's overdue book: 11 days late * 5 = 55
    overdueDays: 11,
    fineAmount: 55.0,
    paidStatus: 'UNPAID',
    paymentDate: null
  }
];
