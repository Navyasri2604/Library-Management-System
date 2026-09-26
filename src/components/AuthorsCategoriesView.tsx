import React, { useState } from 'react';
import {
  FolderTree,
  User,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  BookOpen
} from 'lucide-react';
import { LibraryStorageService } from '../services/storage';
import { Author, Category, RoleType } from '../types';

interface AuthorsCategoriesViewProps {
  role: RoleType;
}

export const AuthorsCategoriesView: React.FC<AuthorsCategoriesViewProps> = ({ role }) => {
  const [activeTab, setActiveTab] = useState<'authors' | 'categories'>('authors');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Author Modal State
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [authorBio, setAuthorBio] = useState('');
  const [authorError, setAuthorError] = useState<string | null>(null);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const authors = LibraryStorageService.getAuthors();
  const categories = LibraryStorageService.getCategories();
  const books = LibraryStorageService.getBooks();

  // Author Handlers
  const handleOpenAddAuthor = () => {
    setEditingAuthor(null);
    setAuthorName('');
    setAuthorBio('');
    setAuthorError(null);
    setIsAuthorModalOpen(true);
  };

  const handleOpenEditAuthor = (a: Author) => {
    setEditingAuthor(a);
    setAuthorName(a.name);
    setAuthorBio(a.biography);
    setAuthorError(null);
    setIsAuthorModalOpen(true);
  };

  const handleSaveAuthor = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthorError(null);
    if (!authorName.trim()) {
      setAuthorError('Author name is required.');
      return;
    }
    try {
      if (editingAuthor) {
        LibraryStorageService.updateAuthor(editingAuthor.id, authorName, authorBio);
        setToastMsg(`Author "${authorName}" updated successfully.`);
      } else {
        LibraryStorageService.addAuthor(authorName, authorBio);
        setToastMsg(`Author "${authorName}" added to system.`);
      }
      setIsAuthorModalOpen(false);
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      setAuthorError(err.message || 'Operation failed');
    }
  };

  const handleDeleteAuthor = (id: number, name: string) => {
    if (!window.confirm(`Delete author "${name}"?`)) return;
    try {
      LibraryStorageService.deleteAuthor(id);
      setToastMsg(`Author "${name}" deleted.`);
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Category Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDesc('');
    setCategoryError(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (c: Category) => {
    setEditingCategory(c);
    setCategoryName(c.name);
    setCategoryDesc(c.description || '');
    setCategoryError(null);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError(null);
    if (!categoryName.trim()) {
      setCategoryError('Category name is required.');
      return;
    }
    try {
      if (editingCategory) {
        LibraryStorageService.updateCategory(editingCategory.id, categoryName, categoryDesc);
        setToastMsg(`Category "${categoryName}" updated successfully.`);
      } else {
        LibraryStorageService.addCategory(categoryName, categoryDesc);
        setToastMsg(`Category "${categoryName}" created.`);
      }
      setIsCategoryModalOpen(false);
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      setCategoryError(err.message || 'Operation failed');
    }
  };

  const handleDeleteCategory = (id: number, name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      LibraryStorageService.deleteCategory(id);
      setToastMsg(`Category "${name}" deleted.`);
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold theme-title flex items-center gap-2">
            <FolderTree className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            Taxonomy: Authors &amp; Categories
          </h2>
          <p className="text-xs theme-muted mt-0.5">
            Maintain catalog classifications, book genres, and author biographies.
          </p>
        </div>

        {activeTab === 'authors' ? (
          <button
            onClick={handleOpenAddAuthor}
            className="theme-btn-primary px-4 py-2.5 font-semibold text-xs rounded-xl flex items-center gap-2 shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Author</span>
          </button>
        ) : (
          <button
            onClick={handleOpenAddCategory}
            className="theme-btn-primary px-4 py-2.5 font-semibold text-xs rounded-xl flex items-center gap-2 shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('authors')}
          className="px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2"
          style={{
            backgroundColor: activeTab === 'authors' ? 'var(--color-primary)' : 'var(--color-bg-card)',
            color: activeTab === 'authors' ? '#ffffff' : 'var(--color-text-body)',
            border: `1px solid ${activeTab === 'authors' ? 'var(--color-primary)' : 'var(--color-border)'}`
          }}
        >
          <User className="w-4 h-4" />
          <span>Authors Catalog ({authors.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className="px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2"
          style={{
            backgroundColor: activeTab === 'categories' ? 'var(--color-primary)' : 'var(--color-bg-card)',
            color: activeTab === 'categories' ? '#ffffff' : 'var(--color-text-body)',
            border: `1px solid ${activeTab === 'categories' ? 'var(--color-primary)' : 'var(--color-border)'}`
          }}
        >
          <FolderTree className="w-4 h-4" />
          <span>Genre Categories ({categories.length})</span>
        </button>
      </div>

      {/* Authors Content */}
      {activeTab === 'authors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {authors.map((a) => {
            const authorBooks = books.filter((b) => b.authorId === a.id);
            return (
              <div key={a.id} className="theme-card rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold theme-title text-sm">{a.name}</h3>
                    <span className="text-[11px] theme-muted font-mono">
                      Author #{a.id} • Added: {a.createdAt}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditAuthor(a)}
                      className="p-1.5 rounded-lg theme-muted hover:text-blue-600 transition"
                      title="Edit Author"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAuthor(a.id, a.name)}
                      className="p-1.5 rounded-lg hover:text-red-600 transition"
                      style={{ color: 'var(--color-status-danger)' }}
                      title="Delete Author"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs theme-title leading-relaxed opacity-90">{a.biography || 'No biography provided.'}</p>

                <div
                  className="pt-2 border-t flex items-center justify-between text-xs"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <span className="theme-muted flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                    <span>Published in Library:</span>
                  </span>
                  <span
                    className="font-mono px-2 py-0.5 rounded font-semibold text-[11px]"
                    style={{
                      backgroundColor: 'var(--color-primary-soft)',
                      color: 'var(--color-primary-text)',
                      border: '1px solid var(--color-primary-border)'
                    }}
                  >
                    {authorBooks.length} book(s)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Categories Content */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => {
            const catBooks = books.filter((b) => b.categoryId === c.id);
            return (
              <div key={c.id} className="theme-card rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold theme-title text-sm">{c.name}</h3>
                    <span className="text-[11px] theme-muted font-mono">
                      Category #{c.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditCategory(c)}
                      className="p-1.5 rounded-lg theme-muted hover:text-blue-600 transition"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(c.id, c.name)}
                      className="p-1.5 rounded-lg hover:text-red-600 transition"
                      style={{ color: 'var(--color-status-danger)' }}
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs theme-title opacity-90 leading-relaxed min-h-[36px]">
                  {c.description || 'General category classification.'}
                </p>

                <div
                  className="pt-2 border-t flex items-center justify-between text-xs"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <span className="theme-muted">Catalog Volume:</span>
                  <span
                    className="font-mono px-2 py-0.5 rounded font-semibold text-[11px]"
                    style={{
                      backgroundColor: 'var(--color-primary-soft)',
                      color: 'var(--color-primary-text)',
                      border: '1px solid var(--color-primary-border)'
                    }}
                  >
                    {catBooks.length} Titles
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Author Modal */}
      {isAuthorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="theme-card rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
          >
            <div
              className="flex items-center justify-between p-5 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h3 className="font-bold theme-title text-base">
                {editingAuthor ? 'Edit Author Profile' : 'Add New Author'}
              </h3>
              <button
                onClick={() => setIsAuthorModalOpen(false)}
                className="theme-muted hover:opacity-80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAuthor} className="p-6 space-y-4">
              {authorError && (
                <div
                  className="p-3 rounded-xl border text-xs flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--color-status-danger-bg)',
                    borderColor: 'var(--color-status-danger-border)',
                    color: 'var(--color-status-danger)'
                  }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authorError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold theme-title block mb-1">
                  Author Name *
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Robert C. Martin"
                  className="theme-input w-full px-3 py-2 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold theme-title block mb-1">
                  Biography &amp; Notable Works
                </label>
                <textarea
                  rows={3}
                  value={authorBio}
                  onChange={(e) => setAuthorBio(e.target.value)}
                  placeholder="Professional summary, notable awards, or credentials"
                  className="theme-input w-full px-3 py-2 rounded-xl text-xs"
                ></textarea>
              </div>

              <div
                className="flex items-center justify-end gap-2 pt-3 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <button
                  type="button"
                  onClick={() => setIsAuthorModalOpen(false)}
                  className="px-4 py-2 text-xs theme-muted hover:opacity-80 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="theme-btn-primary px-5 py-2 font-semibold text-xs rounded-xl shadow-xs"
                >
                  {editingAuthor ? 'Save Changes' : 'Add Author'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="theme-card rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95"
            style={{ backgroundColor: 'var(--color-bg-card)' }}
          >
            <div
              className="flex items-center justify-between p-5 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h3 className="font-bold theme-title text-base">
                {editingCategory ? 'Edit Category' : 'Create Genre Category'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="theme-muted hover:opacity-80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              {categoryError && (
                <div
                  className="p-3 rounded-xl border text-xs flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--color-status-danger-bg)',
                    borderColor: 'var(--color-status-danger-border)',
                    color: 'var(--color-status-danger)'
                  }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{categoryError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold theme-title block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Software Architecture"
                  className="theme-input w-full px-3 py-2 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold theme-title block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={categoryDesc}
                  onChange={(e) => setCategoryDesc(e.target.value)}
                  placeholder="Scope of literature encompassed by this genre"
                  className="theme-input w-full px-3 py-2 rounded-xl text-xs"
                ></textarea>
              </div>

              <div
                className="flex items-center justify-end gap-2 pt-3 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-xs theme-muted hover:opacity-80 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="theme-btn-primary px-5 py-2 font-semibold text-xs rounded-xl shadow-xs"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
