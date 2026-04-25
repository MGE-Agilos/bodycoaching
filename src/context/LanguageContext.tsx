'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import translations, { Language, Translations } from '../i18n/translations';

const LANG_KEY = 'bc_language';
const DEFAULT_LANG: Language = 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANG);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANG_KEY) as Language | null;
      if (stored && (stored === 'en' || stored === 'fr' || stored === 'nl')) {
        setLanguageState(stored);
      }
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANG_KEY, lang);
    }
  }, []);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
