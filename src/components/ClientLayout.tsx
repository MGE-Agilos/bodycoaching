'use client';

import { AppProvider } from '../context/AppContext';
import Navigation from './Navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <Navigation />
      <main className="min-h-screen bg-slate-50">
        {children}
      </main>
    </AppProvider>
  );
}
