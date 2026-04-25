'use client';

import { AppProvider } from '../context/AppContext';
import { LanguageProvider } from '../context/LanguageContext';
import Navigation from './Navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AppProvider>
        <Navigation />
        <main className="min-h-screen bg-slate-50">
          {children}
        </main>
      </AppProvider>
    </LanguageProvider>
  );
}
