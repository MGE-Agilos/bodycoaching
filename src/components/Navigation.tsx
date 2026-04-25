'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: '🏠' },
  { href: '/training', label: 'Training', icon: '📅' },
  { href: '/workouts', label: 'Workouts', icon: '💪' },
  { href: '/nutrition', label: 'Nutrition', icon: '🥗' },
  { href: '/goals', label: 'Goals', icon: '🎯' },
  { href: '/analytics', label: 'Analytics', icon: '📊' },
  { href: '/exercises', label: 'Exercises', icon: '🏋️' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') {
      // Match exactly / or /bodycoaching or /bodycoaching/
      return pathname === '/' || pathname === '/bodycoaching' || pathname === '/bodycoaching/';
    }
    return pathname?.includes(href.replace('/', ''));
  };

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-3">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-sky-400 shrink-0">
            <span className="text-xl">🏊🚴🏃</span>
            <span className="hidden sm:block">BodyCoaching</span>
          </Link>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-slate-700 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-white transition-all ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block h-0.5 bg-white transition-all ${open ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-white transition-all ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden pb-3 pt-1 grid grid-cols-2 gap-1 border-t border-slate-700">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
                onClick={() => setOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
