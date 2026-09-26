export interface EntityItem {
  id: string;
  className: string;
  fileName: string;
  tableName: string;
  description: string;
  keyAnnotations: string[];
  relationships: string[];
  code: string;
}

export const ENTITY_DATA: Record<string, EntityItem> = {
  Book: {
    id: 'Book',
    className: 'Book',
    fileName: 'src/main/java/com/library/entity/Book.java',
    tableName: 'books',
    description: 'Core inventory model. Stores catalog metadata, shelf number, total physical stock, and dynamic available quantity.',
    keyAnnotations: ['@Entity', '@Table(name="books")', '@ManyToOne(fetch = FetchType.LAZY)', '@JoinColumn', '@PrePersist'],
    relationships: [
      'Many-to-One with Author (author_id FK)',
      'Many-to-One with Category (category_id FK)',
      'One-to-Many with BorrowTransaction'
    ],
    code: `package com.library.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Book Entity representing physical library catalog inventory.
 * 
 * Demonstrates:
 * - Unique constraint on standard ISBN
 * - Lazy relationships to Author and Category
 * - Quantity vs AvailableQuantity tracking
 */
@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "ISBN is required")
    @Column(name = "isbn", unique = true, nullable = false, length = 20)
    private String isbn;

    @NotBlank(message = "Title is required")
    @Column(name = "title", nullable = false)
    private String title;

    @NotNull(message = "Author is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private Author author;

    @NotNull(message = "Category is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @NotBlank(message = "Publisher is required")
    @Column(name = "publisher", nullable = false, length = 150)
    private String publisher;

    @NotNull(message = "Publication year is required")
    @Column(name = "publication_year", nullable = false)
    private Integer publicationYear;

    @NotNull(message = "Total quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @NotNull(message = "Available quantity is required")
    @Min(value = 0, message = "Available quantity cannot be negative")
    @Column(name = "available_quantity", nullable = false)
    private Integer availableQuantity;

    @NotBlank(message = "Shelf number is required")
    @Column(name = "shelf_number", nullable = false, length = 50)
    private String shelfNumber;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Book() {}

    public Book(String isbn, String title, Author author, Category category, String publisher,
                Integer publicationYear, Integer quantity, Integer availableQuantity, String shelfNumber) {
        this.isbn = isbn;
        this.title = title;
        this.author = author;
        this.category = category;
        this.publisher = publisher;
        this.publicationYear = publicationYear;
        this.quantity = quantity;
        this.availableQuantity = availableQuantity;
        this.shelfNumber = shelfNumber;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.availableQuantity == null) {
            this.availableQuantity = this.quantity;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Author getAuthor() { return author; }
    public void setAuthor(Author author) { this.author = author; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }

    public Integer getPublicationYear() { return publicationYear; }
    public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getAvailableQuantity() { return availableQuantity; }
    public void setAvailableQuantity(Integer availableQuantity) { this.availableQuantity = availableQuantity; }

    public String getShelfNumber() { return shelfNumber; }
    public void setShelfNumber(String shelfNumber) { this.shelfNumber = shelfNumber; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}`
  },

  BorrowTransaction: {
    id: 'BorrowTransaction',
    className: 'BorrowTransaction',
    fileName: 'src/main/java/com/library/entity/BorrowTransaction.java',
    tableName: 'borrow_transactions',
    description: 'Circulation transaction record linking Book, Member, and the issuing Librarian user.',
    keyAnnotations: ['@Entity', '@Table(name="borrow_transactions")', '@ManyToOne(fetch = FetchType.LAZY)', '@OneToOne', '@Enumerated'],
    relationships: [
      'Many-to-One with Book (book_id FK)',
      'Many-to-One with Member (member_id FK)',
      'Many-to-One with User (issued_by_user_id FK)',
      'One-to-One with Fine (optional fine record)'
    ],
    code: `package com.library.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * BorrowTransaction Entity tracking the complete checkout and return lifecycle.
 */
@Entity
@Table(name = "borrow_transactions")
public class BorrowTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Book reference is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @NotNull(message = "Member reference is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @NotNull(message = "Librarian reference is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by_user_id", nullable = false)
    private User issuedByUser;

    @NotNull(message = "Issue date is required")
    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @NotNull(message = "Due date is required")
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private TransactionStatus status;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @OneToOne(mappedBy = "transaction", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Fine fine;

    public BorrowTransaction() {}

    public BorrowTransaction(Book book, Member member, User issuedByUser, LocalDate issueDate, LocalDate dueDate) {
        this.book = book;
        this.member = member;
        this.issuedByUser = issuedByUser;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.status = TransactionStatus.ISSUED;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }

    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }

    public User getIssuedByUser() { return issuedByUser; }
    public void setIssuedByUser(User issuedByUser) { this.issuedByUser = issuedByUser; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

    public TransactionStatus getStatus() { return status; }
    public void setStatus(TransactionStatus status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Fine getFine() { return fine; }
    public void setFine(Fine fine) { this.fine = fine; }
}`
  },

  Fine: {
    id: 'Fine',
    className: 'Fine',
    fileName: 'src/main/java/com/library/entity/Fine.java',
    tableName: 'fines',
    description: 'Financial penalty assessment for overdue books (₹5/day).',
    keyAnnotations: ['@Entity', '@Table(name="fines")', '@OneToOne', '@JoinColumn(unique=true)', '@Enumerated'],
    relationships: ['One-to-One with BorrowTransaction (transaction_id FK, UNIQUE)'],
    code: `package com.library.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Fine Entity for recording penalties assessed on late circulation returns.
 */
@Entity
@Table(name = "fines")
public class Fine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false, unique = true)
    private BorrowTransaction transaction;

    @Column(name = "overdue_days", nullable = false)
    private Integer overdueDays;

    @Column(name = "fine_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal fineAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "paid_status", nullable = false, length = 20)
    private FineStatus paidStatus;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    public Fine() {}

    public Fine(BorrowTransaction transaction, Integer overdueDays, BigDecimal fineAmount) {
        this.transaction = transaction;
        this.overdueDays = overdueDays;
        this.fineAmount = fineAmount;
        this.paidStatus = FineStatus.UNPAID;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BorrowTransaction getTransaction() { return transaction; }
    public void setTransaction(BorrowTransaction transaction) { this.transaction = transaction; }

    public Integer getOverdueDays() { return overdueDays; }
    public void setOverdueDays(Integer overdueDays) { this.overdueDays = overdueDays; }

    public BigDecimal getFineAmount() { return fineAmount; }
    public void setFineAmount(BigDecimal fineAmount) { this.fineAmount = fineAmount; }

    public FineStatus getPaidStatus() { return paidStatus; }
    public void setPaidStatus(FineStatus paidStatus) { this.paidStatus = paidStatus; }

    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }
}`
  },

  Member: {
    id: 'Member',
    className: 'Member',
    fileName: 'src/main/java/com/library/entity/Member.java',
    tableName: 'members',
    description: 'Patron profile storing unique member card codes, contact info, and status (ACTIVE / INACTIVE).',
    keyAnnotations: ['@Entity', '@Table(name="members")', '@Column(unique=true)', '@Enumerated', '@PrePersist'],
    relationships: ['One-to-Many with BorrowTransaction'],
    code: `package com.library.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * Member Entity representing registered patrons (students, faculty, readers).
 */
@Entity
@Table(name = "members")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Member code is required")
    @Column(name = "member_code", unique = true, nullable = false, length = 30)
    private String memberCode;

    @NotBlank(message = "Full name is required")
    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Column(name = "email", unique = true, nullable = false, length = 120)
    private String email;

    @NotBlank(message = "Phone number is required")
    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @NotNull(message = "Membership date is required")
    @Column(name = "membership_date", nullable = false)
    private LocalDate membershipDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private MemberStatus status;

    public Member() {}

    public Member(String memberCode, String fullName, String email, String phone, String address, LocalDate membershipDate, MemberStatus status) {
        this.memberCode = memberCode;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.membershipDate = membershipDate;
        this.status = status;
    }

    @PrePersist
    protected void onCreate() {
        if (this.membershipDate == null) {
            this.membershipDate = LocalDate.now();
        }
        if (this.status == null) {
            this.status = MemberStatus.ACTIVE;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMemberCode() { return memberCode; }
    public void setMemberCode(String memberCode) { this.memberCode = memberCode; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public LocalDate getMembershipDate() { return membershipDate; }
    public void setMembershipDate(LocalDate membershipDate) { this.membershipDate = membershipDate; }

    public MemberStatus getStatus() { return status; }
    public void setStatus(MemberStatus status) { this.status = status; }
}`
  },

  User: {
    id: 'User',
    className: 'User',
    fileName: 'src/main/java/com/library/entity/User.java',
    tableName: 'users',
    description: 'System login accounts for Admins & Librarians with encrypted BCrypt password and Role associations.',
    keyAnnotations: ['@Entity', '@Table(name="users")', '@ManyToMany(fetch=FetchType.EAGER)', '@JoinTable', '@PrePersist'],
    relationships: ['Many-to-Many with Role via user_roles junction table'],
    code: `package com.library.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * User Entity representing system staff (Admins and Librarians).
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Username is required")
    @Column(name = "username", unique = true, nullable = false, length = 50)
    private String username;

    @NotBlank(message = "Password is required")
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @NotBlank(message = "Full name is required")
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    @Column(name = "email", unique = true, nullable = false, length = 100)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    public User() {}

    public User(String username, String password, String fullName, String email, String phone) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.enabled = true;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }
}`
  },

  Role: {
    id: 'Role',
    className: 'Role',
    fileName: 'src/main/java/com/library/entity/Role.java',
    tableName: 'roles',
    description: 'Spring Security Authority role (ROLE_ADMIN, ROLE_LIBRARIAN).',
    keyAnnotations: ['@Entity', '@Table(name="roles")', '@Id', '@Column(unique=true)'],
    relationships: ['Many-to-Many with User (inverse side)'],
    code: `package com.library.entity;

import jakarta.persistence.*;

/**
 * Role Entity representing Spring Security authority privileges.
 */
@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", unique = true, nullable = false, length = 50)
    private String name;

    @Column(name = "description", length = 255)
    private String description;

    public Role() {}

    public Role(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}`
  },

  Author: {
    id: 'Author',
    className: 'Author',
    fileName: 'src/main/java/com/library/entity/Author.java',
    tableName: 'authors',
    description: 'Catalog authors with bio and 1-to-Many relationship to published Books.',
    keyAnnotations: ['@Entity', '@Table(name="authors")', '@OneToMany(mappedBy="author")', '@PrePersist'],
    relationships: ['One-to-Many with Book (1 Author has Many Books)'],
    code: `package com.library.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Author Entity storing writers and their published book catalog.
 */
@Entity
@Table(name = "authors")
public class Author {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Author name is required")
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "biography", columnDefinition = "TEXT")
    private String biography;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Book> books = new ArrayList<>();

    public Author() {}

    public Author(String name, String biography) {
        this.name = name;
        this.biography = biography;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBiography() { return biography; }
    public void setBiography(String biography) { this.biography = biography; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<Book> getBooks() { return books; }
    public void setBooks(List<Book> books) { this.books = books; }
}`
  },

  Category: {
    id: 'Category',
    className: 'Category',
    fileName: 'src/main/java/com/library/entity/Category.java',
    tableName: 'categories',
    description: 'Book genres and taxonomies (e.g. Computer Science, Mathematics, Fiction).',
    keyAnnotations: ['@Entity', '@Table(name="categories")', '@OneToMany(mappedBy="category")', '@Column(unique=true)'],
    relationships: ['One-to-Many with Book (1 Category has Many Books)'],
    code: `package com.library.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

/**
 * Category Entity representing book genres and departments.
 */
@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Category name is required")
    @Column(name = "name", unique = true, nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 255)
    private String description;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Book> books = new ArrayList<>();

    public Category() {}

    public Category(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<Book> getBooks() { return books; }
    public void setBooks(List<Book> books) { this.books = books; }
}`
  },

  Enums: {
    id: 'Enums',
    className: 'TransactionStatus / FineStatus / MemberStatus',
    fileName: 'src/main/java/com/library/entity/ [3 Enum files]',
    tableName: 'Mapped via @Enumerated(EnumType.STRING)',
    description: 'Type-safe status enumerations replacing magic strings in the database.',
    keyAnnotations: ['@Enumerated(EnumType.STRING)'],
    relationships: ['Used in BorrowTransaction, Fine, and Member entities'],
    code: `// File 1: src/main/java/com/library/entity/TransactionStatus.java
package com.library.entity;

public enum TransactionStatus {
    ISSUED,
    RETURNED,
    OVERDUE
}

// -------------------------------------------------------------
// File 2: src/main/java/com/library/entity/FineStatus.java
package com.library.entity;

public enum FineStatus {
    UNPAID,
    PAID,
    WAIVED
}

// -------------------------------------------------------------
// File 3: src/main/java/com/library/entity/MemberStatus.java
package com.library.entity;

public enum MemberStatus {
    ACTIVE,
    INACTIVE
}`
  }
};
