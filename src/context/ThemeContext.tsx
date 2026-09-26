import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'oxford' | 'parchment' | 'bootstrap' | 'emerald' | 'obsidian';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  category: 'light' | 'dark' | 'warm';
  previewColor: string;
  badge: string;
  description: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'oxford',
    name: 'Oxford Navy',
    category: 'light',
    previewColor: '#2563eb',
    badge: 'Clean Light',
    description: 'Modern academic light theme with crisp white cards, sapphire blue accents, and deep navy text.'
  },
  {
    id: 'parchment',
    name: 'Scholarly Parchment',
    category: 'warm',
    previewColor: '#15803d',
    badge: 'Heritage',
    description: 'Classical university library palette with warm ivory paper, forest pine green, and burnished amber.'
  },
  {
    id: 'bootstrap',
    name: 'Spring Enterprise',
    category: 'light',
    previewColor: '#0d6efd',
    badge: 'Bootstrap 5',
    description: 'Corporate Spring Boot & Bootstrap 5 aesthetic with crisp royal blue and high-contrast tables.'
  },
  {
    id: 'emerald',
    name: 'Emerald Botanic',
    category: 'light',
    previewColor: '#059669',
    badge: 'Fresh Sage',
    description: 'Modern botanical green palette with crisp mint undertones, forest accents, and gentle contrast.'
  },
  {
    id: 'obsidian',
    name: 'Obsidian Midnight',
    category: 'dark',
    previewColor: '#3b82f6',
    badge: 'Executive Dark',
    description: 'Refined deep midnight slate for low-light environments with electric blue highlights.'
  }
];

interface ThemeContextType {
  currentTheme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themeMeta: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentThemeState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('lms_color_theme');
      if (saved && THEME_OPTIONS.some(t => t.id === saved)) {
        return saved as ThemeId;
      }
    } catch {
      // fallback
    }
    return 'oxford'; // default to crisp Oxford Navy light theme
  });

  const setTheme = (theme: ThemeId) => {
    setCurrentThemeState(theme);
    try {
      localStorage.setItem('lms_color_theme', theme);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const themeMeta = THEME_OPTIONS.find(t => t.id === currentTheme) || THEME_OPTIONS[0];

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themeMeta }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
