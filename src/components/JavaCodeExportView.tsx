import React, { useState } from 'react';
import { Code2, Copy, Check, FileCode, Database, Shield, Server, Terminal } from 'lucide-react';
import { ENTITY_DATA } from '../entityData';

export const JavaCodeExportView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('CirculationService');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const codeFiles: Record<
    string,
    { title: string; path: string; category: string; code: string; desc: string }
  > = {
    CirculationService: {
      title: 'CirculationService.java',
      path: 'src/main/java/com/library/service/CirculationService.java',
      category: 'Service Layer',
      desc: 'Atomic issue and return transactions with stock decrement/increment and fine invocation.',
      code: `package com.library.service;

import com.library.entity.*;
import com.library.repository.*;
import com.library.exception.BookUnavailableException;
import com.library.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

@Service
public class CirculationService {

    private final BorrowTransactionRepository transactionRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final FineCalculatorService fineCalculatorService;

    public CirculationService(BorrowTransactionRepository transactionRepository,
                              BookRepository bookRepository,
                              MemberRepository memberRepository,
                              UserRepository userRepository,
                              FineCalculatorService fineCalculatorService) {
        this.transactionRepository = transactionRepository;
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.fineCalculatorService = fineCalculatorService;
    }

    @Transactional
    public BorrowTransaction issueBook(Long bookId, Long memberId, Long librarianUserId, String notes) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + bookId));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with ID: " + memberId));

        User librarian = userRepository.findById(librarianUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Librarian user not found"));

        if (member.getStatus() != MemberStatus.ACTIVE) {
            throw new IllegalStateException("Member account is inactive. Books cannot be issued.");
        }

        if (book.getAvailableQuantity() <= 0) {
            throw new BookUnavailableException("Book is currently unavailable. All copies are checked out.");
        }

        // Atomic decrement
        book.setAvailableQuantity(book.getAvailableQuantity() - 1);
        bookRepository.save(book);

        LocalDate issueDate = LocalDate.now();
        LocalDate dueDate = issueDate.plusDays(14); // Standard 14-day checkout

        BorrowTransaction tx = new BorrowTransaction(book, member, librarian, issueDate, dueDate);
        tx.setNotes(notes);
        return transactionRepository.save(tx);
    }

    @Transactional
    public BorrowTransaction returnBook(Long transactionId) {
        BorrowTransaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (tx.getStatus() == TransactionStatus.RETURNED) {
            throw new IllegalStateException("Book has already been returned.");
        }

        LocalDate returnDate = LocalDate.now();
        tx.setReturnDate(returnDate);
        tx.setStatus(TransactionStatus.RETURNED);

        // Atomic increment
        Book book = tx.getBook();
        book.setAvailableQuantity(book.getAvailableQuantity() + 1);
        bookRepository.save(book);

        // Calculate and attach late fine if overdue
        fineCalculatorService.processReturnFine(tx);

        return transactionRepository.save(tx);
    }
}`
    },

    FineCalculatorService: {
      title: 'FineCalculatorService.java',
      path: 'src/main/java/com/library/service/FineCalculatorService.java',
      category: 'Service Layer',
      desc: 'Centralized ₹5.00/day overdue penalty calculation engine.',
      code: `package com.library.service;

import com.library.entity.BorrowTransaction;
import com.library.entity.Fine;
import com.library.entity.FineStatus;
import com.library.repository.FineRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;

@Service
public class FineCalculatorService {

    private final FineRepository fineRepository;

    @Value("\${library.fine.rate-per-day:5.00}")
    private BigDecimal fineRatePerDay;

    public FineCalculatorService(FineRepository fineRepository) {
        this.fineRepository = fineRepository;
    }

    public Fine processReturnFine(BorrowTransaction transaction) {
        if (transaction.getReturnDate() == null || transaction.getDueDate() == null) {
            return null;
        }

        long daysLate = ChronoUnit.DAYS.between(transaction.getDueDate(), transaction.getReturnDate());

        if (daysLate > 0) {
            BigDecimal fineAmount = fineRatePerDay.multiply(BigDecimal.valueOf(daysLate));
            Fine fine = new Fine(transaction, (int) daysLate, fineAmount);
            fine.setPaidStatus(FineStatus.UNPAID);
            return fineRepository.save(fine);
        }

        return null;
    }

    public BigDecimal calculateEstimatedFine(BorrowTransaction transaction) {
        if (transaction.getDueDate() == null) return BigDecimal.ZERO;
        long daysLate = ChronoUnit.DAYS.between(transaction.getDueDate(), java.time.LocalDate.now());
        if (daysLate <= 0) return BigDecimal.ZERO;
        return fineRatePerDay.multiply(BigDecimal.valueOf(daysLate));
    }
}`
    },

    SecurityConfig: {
      title: 'SecurityConfig.java',
      path: 'src/main/java/com/library/config/SecurityConfig.java',
      category: 'Security',
      desc: 'Spring Security 6 configuration with BCrypt hashing and role-based access control.',
      code: `package com.library.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/css/**", "/js/**", "/images/**", "/login").permitAll()
                .requestMatchers("/admin/**", "/authors/**", "/categories/**", "/reports/**").hasRole("ADMIN")
                .requestMatchers("/librarian/**").hasAnyRole("ADMIN", "LIBRARIAN")
                .requestMatchers("/circulation/**", "/books/**", "/members/**").hasAnyRole("ADMIN", "LIBRARIAN")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/dashboard", true)
                .permitAll()
            )
            .logout(logout -> logout
                .logoutSuccessUrl("/login?logout")
                .permitAll()
            );

        return http.build();
    }
}`
    },

    CirculationController: {
      title: 'CirculationController.java',
      path: 'src/main/java/com/library/controller/CirculationController.java',
      category: 'Controller Layer',
      desc: 'Spring MVC Controller routing checkout and return requests.',
      code: `package com.library.controller;

import com.library.service.CirculationService;
import com.library.repository.BorrowTransactionRepository;
import com.library.repository.BookRepository;
import com.library.repository.MemberRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/circulation")
public class CirculationController {

    private final CirculationService circulationService;
    private final BorrowTransactionRepository transactionRepo;
    private final BookRepository bookRepo;
    private final MemberRepository memberRepo;

    public CirculationController(CirculationService circulationService,
                                 BorrowTransactionRepository transactionRepo,
                                 BookRepository bookRepo,
                                 MemberRepository memberRepo) {
        this.circulationService = circulationService;
        this.transactionRepo = transactionRepo;
        this.bookRepo = bookRepo;
        this.memberRepo = memberRepo;
    }

    @GetMapping
    public String listTransactions(Model model) {
        model.addAttribute("transactions", transactionRepo.findAll());
        model.addAttribute("books", bookRepo.findAll());
        model.addAttribute("members", memberRepo.findAll());
        return "circulation/list";
    }

    @PostMapping("/issue")
    public String issueBook(@RequestParam Long bookId,
                            @RequestParam Long memberId,
                            @RequestParam(required = false) String notes,
                            RedirectAttributes redirectAttributes) {
        try {
            // In production, fetch currently authenticated user ID from SecurityContextHolder
            circulationService.issueBook(bookId, memberId, 1L, notes);
            redirectAttributes.addFlashAttribute("successMessage", "Book issued successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/circulation";
    }

    @PostMapping("/return/{id}")
    public String returnBook(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            circulationService.returnBook(id);
            redirectAttributes.addFlashAttribute("successMessage", "Book returned successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/circulation";
    }
}`
    },

    MySQL_Schema: {
      title: 'schema.sql (MySQL 8 DDL)',
      path: 'src/main/resources/schema.sql',
      category: 'Database Scripts',
      desc: 'Full relational MySQL 8 schema script with 3NF tables, foreign keys, and indexes.',
      code: `-- ===================================================================
-- LIBRARY MANAGEMENT SYSTEM - MYSQL 8 RELATIONAL DATABASE DDL
-- ===================================================================

CREATE DATABASE IF NOT EXISTS library_management 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE library_management;

-- 1. Authors Table
CREATE TABLE IF NOT EXISTS authors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    biography TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- 3. Books Table
CREATE TABLE IF NOT EXISTS books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    author_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    publisher VARCHAR(150) NOT NULL,
    publication_year INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity >= 0),
    available_quantity INT NOT NULL CHECK (available_quantity >= 0),
    shelf_number VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_books_author FOREIGN KEY (author_id) REFERENCES authors(id),
    CONSTRAINT fk_books_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 4. Members Table
CREATE TABLE IF NOT EXISTS members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_code VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    membership_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

-- 5. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- 7. User Roles Junction Table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 8. Borrow Transactions Table
CREATE TABLE IF NOT EXISTS borrow_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    book_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    issued_by_user_id BIGINT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE NULL,
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    CONSTRAINT fk_bt_book FOREIGN KEY (book_id) REFERENCES books(id),
    CONSTRAINT fk_bt_member FOREIGN KEY (member_id) REFERENCES members(id),
    CONSTRAINT fk_bt_user FOREIGN KEY (issued_by_user_id) REFERENCES users(id)
);

-- 9. Fines Table
CREATE TABLE IF NOT EXISTS fines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT NOT NULL UNIQUE,
    overdue_days INT NOT NULL,
    fine_amount DECIMAL(10,2) NOT NULL,
    paid_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    payment_date TIMESTAMP NULL,
    CONSTRAINT fk_fines_transaction FOREIGN KEY (transaction_id) REFERENCES borrow_transactions(id) ON DELETE CASCADE
);`
    }
  };

  const current = codeFiles[selectedFile] || codeFiles['CirculationService'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="theme-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded text-xs font-mono font-bold"
                style={{
                  backgroundColor: 'var(--color-primary-soft)',
                  color: 'var(--color-primary-text)',
                  border: '1px solid var(--color-primary-border)'
                }}
              >
                SPRING BOOT 3 SOURCE CODE
              </span>
              <span className="text-xs theme-muted">Java 17 • Maven • MySQL 8</span>
            </div>
            <h2 className="text-xl font-bold theme-title mt-1.5 flex items-center gap-2">
              <Code2 className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              Complete Java Backend Codebase &amp; Architecture
            </h2>
            <p className="text-xs theme-muted mt-1 max-w-2xl leading-relaxed">
              Inspect the exact production-ready Java classes, services, controllers, security configurations, and MySQL DDL. Copy each file directly to your local project directory.
            </p>
          </div>

          <div
            className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl border shrink-0 font-mono"
            style={{
              backgroundColor: 'var(--color-bg-card-subtle)',
              borderColor: 'var(--color-border)'
            }}
          >
            <Terminal className="w-4 h-4" style={{ color: 'var(--color-status-success)' }} />
            <span className="theme-muted">Build:</span>
            <code className="font-bold" style={{ color: 'var(--color-status-success)' }}>
              mvn clean install
            </code>
          </div>
        </div>
      </div>

      {/* File Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(codeFiles).map((key) => {
          const file = codeFiles[key];
          const isSelected = selectedFile === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedFile(key)}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition flex items-center gap-2"
              style={{
                backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-bg-card)',
                color: isSelected ? '#ffffff' : 'var(--color-text-body)',
                border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`
              }}
            >
              <FileCode className="w-3.5 h-3.5 opacity-70" />
              <span>{file.title}</span>
            </button>
          );
        })}
      </div>

      {/* Code Viewer Card */}
      <div className="theme-card rounded-2xl p-6 space-y-4">
        <div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold theme-title font-mono">{current.title}</h3>
              <span
                className="text-xs px-2.5 py-0.5 rounded font-mono"
                style={{
                  backgroundColor: 'var(--color-primary-soft)',
                  color: 'var(--color-primary-text)',
                  border: '1px solid var(--color-primary-border)'
                }}
              >
                {current.category}
              </span>
            </div>
            <p className="text-xs theme-muted mt-1">{current.desc}</p>
            <div className="text-[11px] font-mono theme-muted mt-0.5">Location: {current.path}</div>
          </div>

          <button
            onClick={() => copyCode(current.code, current.title)}
            className="theme-btn-primary flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl font-medium shadow-xs shrink-0"
          >
            {copiedKey === current.title ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Java Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content Box */}
        <pre
          className="p-4 rounded-xl border font-mono text-xs overflow-x-auto max-h-[550px] leading-relaxed"
          style={{
            backgroundColor: 'var(--color-bg-card-subtle)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-main)'
          }}
        >
          <code>{current.code}</code>
        </pre>
      </div>
    </div>
  );
};
