import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  CheckCircle,
  AlertCircle,
  X,
  Bookmark
} from 'lucide-react';
import { LibraryStorageService } from '../services/storage';
import { Book, RoleType, Author, Category } from '../types';

interface BooksViewProps {
  role: RoleType;
  onOpenIssueModalWithBook?: (bookId: number) => void;
}

export const BooksView: React.FC<BooksViewProps> = ({ role, onOpenIssueModalWithBook }) => {
  const isAdmin = role === 'ROLE_ADMIN';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [isbn, setIsbn] = useState('');
  const [title, setTitle] = useState('');
  const [authorId, setAuthorId] = useState<number>(1);
  const [categoryId, setCategoryId] = useState<number>(1);
  const [publisher, setPublisher] = useState('');
  const [publicationYear, setPublicationYear] = useState<number>(new Date().getFullYear());
  const [quantity, setQuantity] = useState<number>(3);
  const [shelfNumber, setShelfNumber] = useState('');

  const books = LibraryStorageService.getBooks();
  const authors = LibraryStorageService.getAuthors();
  const categories = LibraryStorageService.getCategories();

  const handleOpenAddModal = () => {
    setEditingBook(null);
    setIsbn(`978-0${Math.floor(100000000 + Math.random() * 900000000)}`);
    setTitle('');
    setAuthorId(authors[0]?.id || 1);
    setCategoryId(categories[0]?.id || 1);
    setPublisher('Standard Publishing');
    setPublicationYear(2023);
    setQuantity(5);
    setShelfNumber('Aisle-2, Shelf-B');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book: Book) => {
    setEditingBook(book);
    setIsbn(book.isbn);
    setTitle(book.title);
    setAuthorId(book.authorId);
    setCategoryId(book.categoryId);
    setPublisher(book.publisher);
    setPublicationYear(book.publicationYear);
    setQuantity(book.quantity);
    setShelfNumber(book.shelfNumber);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || !isbn.trim() || !publisher.trim() || !shelfNumber.trim()) {
      setErrorMsg('All fields marked with an asterisk are required.');
      return;
    }

    if (quantity < 1) {
      setErrorMsg('Quantity must be at least 1 copy.');
      return;
    }

    try {
      if (editingBook) {
        LibraryStorageService.updateBook(editingBook.id, {
          isbn: isbn.trim(),
          title: title.trim(),
          authorId,
          categoryId,
          publisher: publisher.trim(),
          publicationYear,
          quantity,
          shelfNumber: shelfNumber.trim()
        });
        setSuccessMsg(`Book "${title.trim()}" successfully updated.`);
      } else {
        LibraryStorageService.addBook({
          isbn: isbn.trim(),
          title: title.trim(),
          authorId,
          categoryId,
          publisher: publisher.trim(),
          publicationYear,
          quantity,
          shelfNumber: shelfNumber.trim()
        });
        setSuccessMsg(`Book "${title.trim()}" successfully cataloged.`);
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    }
  };

  const handleDeleteBook = (id: number, bookTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${bookTitle}"? This cannot be undone.`)) {
      try {
        LibraryStorageService.deleteBook(id);
        setSuccessMsg(`Book "${bookTitle}" deleted.`);
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err: any) {
        alert(err.message || 'Delete failed');
      }
    }
  };

  // Filter books
  const filteredBooks = books.filter((b) => {
    const author = authors.find((a) => a.id === b.authorId);
    const category = categories.find((c) => c.id === b.categoryId);

    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.shelfNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (author && author.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (category && category.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' || b.categoryId.toString() === selectedCategory;

    const matchesStock =
      stockFilter === 'ALL' ||
      (stockFilter === 'IN_STOCK' && b.availableQuantity > 0) ||
      (stockFilter === 'OUT_OF_STOCK' && b.availableQuantity === 0);

    return matchesSearch && matchesCategory && matchesStock;
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
            <BookOpen className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            Book Inventory Management
          </h2>
          <p className="text-xs theme-muted mt-0.5">
            Catalog search, physical shelf indexing, and real-time loan availability.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="theme-btn-primary px-4 py-2.5 font-semibold text-xs rounded-xl flex items-center gap-2 shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="theme-card rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 theme-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, ISBN, author, or shelf location..."
            className="theme-input w-full pl-10 pr-4 py-2 rounded-xl text-xs"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 theme-muted" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="theme-input rounded-xl px-3 py-2 text-xs"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Filter */}
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as any)}
          className="theme-input rounded-xl px-3 py-2 text-xs"
        >
          <option value="ALL">All Stock Statuses</option>
          <option value="IN_STOCK">In Stock (Available &gt; 0)</option>
          <option value="OUT_OF_STOCK">Out of Stock (0 Copies)</option>
        </select>
      </div>

      {/* Book Catalog Table */}
      <div className="theme-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="theme-table-head font-mono border-b">
              <tr>
                <th className="p-3.5">ISBN</th>
                <th className="p-3.5">Title &amp; Publisher</th>
                <th className="p-3.5">Author</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-center">Availability</th>
                <th className="p-3.5">Shelf Location</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center theme-muted text-xs">
                    No books found matching the current search criteria.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((b) => {
                  const author = authors.find((a) => a.id === b.authorId);
                  const category = categories.find((c) => c.id === b.categoryId);
                  const isAvailable = b.availableQuantity > 0;

                  return (
                    <tr key={b.id} className="theme-table-row">
                      <td className="p-3.5 font-mono font-semibold theme-muted tabular-nums">{b.isbn}</td>
                      <td className="p-3.5">
                        <div className="font-semibold theme-title">{b.title}</div>
                        <div className="text-[11px] theme-muted">
                          {b.publisher} ({b.publicationYear})
                        </div>
                      </td>
                      <td className="p-3.5 theme-title">
                        {author ? author.name : `Author #${b.authorId}`}
                      </td>
                      <td className="p-3.5">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-medium"
                          style={{
                            backgroundColor: 'var(--color-primary-soft)',
                            color: 'var(--color-primary-text)',
                            border: '1px solid var(--color-primary-border)'
                          }}
                        >
                          {category ? category.name : `Cat #${b.categoryId}`}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold tabular-nums"
                          style={{
                            backgroundColor: isAvailable
                              ? 'var(--color-status-success-bg)'
                              : 'var(--color-status-danger-bg)',
                            color: isAvailable
                              ? 'var(--color-status-success)'
                              : 'var(--color-status-danger)',
                            border: `1px solid ${
                              isAvailable
                                ? 'var(--color-status-success-border)'
                                : 'var(--color-status-danger-border)'
                            }`
                          }}
                        >
                          {b.availableQuantity} / {b.quantity} Available
                        </span>
                      </td>
                      <td className="p-3.5 font-mono theme-muted tabular-nums">{b.shelfNumber}</td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onOpenIssueModalWithBook && isAvailable && (
                            <button
                              onClick={() => onOpenIssueModalWithBook(b.id)}
                              className="px-2.5 py-1 rounded text-white text-[11px] font-medium transition shadow-xs"
                              style={{ backgroundColor: 'var(--color-status-success)' }}
                              title="Issue this book now"
                            >
                              Issue
                            </button>
                          )}

                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(b)}
                                className="p-1.5 rounded-lg theme-muted hover:text-blue-600 transition"
                                title="Edit Book"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteBook(b.id, b.title)}
                                className="p-1.5 rounded-lg hover:text-red-600 transition"
                                style={{ color: 'var(--color-status-danger)' }}
                                title="Delete Book"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
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

      {/* Add / Edit Book Modal */}
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
                {editingBook ? 'Edit Book Record' : 'Add New Book to Catalog'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="theme-muted hover:opacity-80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-6 space-y-4">
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

              <div>
                <label className="text-xs font-semibold theme-title block mb-1">
                  Book Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Clean Code"
                  className="theme-input w-full px-3 py-2 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold theme-title block mb-1">
                    ISBN *
                  </label>
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="978-0132350884"
                    className="theme-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold theme-title block mb-1">
                    Shelf Location *
                  </label>
                  <input
                    type="text"
                    value={shelfNumber}
                    onChange={(e) => setShelfNumber(e.target.value)}
                    placeholder="Aisle-3, Rack-A"
                    className="theme-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold theme-title block mb-1">
                    Author *
                  </label>
                  <select
                    value={authorId}
                    onChange={(e) => setAuthorId(parseInt(e.target.value))}
                    className="theme-input w-full px-3 py-2 rounded-xl text-xs"
                  >
                    {authors.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold theme-title block mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(parseInt(e.target.value))}
                    className="theme-input w-full px-3 py-2 rounded-xl text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-xs font-semibold theme-title block mb-1">
                    Copies (Total) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="theme-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-semibold theme-title block mb-1">
                    Year Published *
                  </label>
                  <input
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={publicationYear}
                    onChange={(e) => setPublicationYear(parseInt(e.target.value) || 2024)}
                    className="theme-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-semibold theme-title block mb-1">
                    Publisher *
                  </label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="Prentice Hall"
                    className="theme-input w-full px-3 py-2 rounded-xl text-xs"
                    required
                  />
                </div>
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
                  {editingBook ? 'Save Changes' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
