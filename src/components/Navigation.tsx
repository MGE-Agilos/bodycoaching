'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language, LANGUAGE_LABELS } from '../i18n/translations';

const LANGUAGES: Language[] = ['en', 'fr', 'nl'];

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  const NAV_ITEMS = [
    { href: '/', label: t.nav.dashboard, icon: '🏠' },
    { href: '/training', label: t.nav.training, icon: '📅' },
    { href: '/workouts', label: t.nav.workouts, icon: '💪' },
    { href: '/nutrition', label: t.nav.nutrition, icon: '🥗' },
    { href: '/goals', label: t.nav.goals, icon: '🎯' },
    { href: '/analytics', label: t.nav.analytics, icon: '📊' },
    { href: '/exercises', label: t.nav.exercises, icon: '🏋️' },
    { href: '/profile', label: t.nav.profile, icon: '👤' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '/bodycoaching' || pathname === '/bodycoaching/';
    }
    return pathname?.includes(href.replace('/', ''));
  };

  const handleLangSelect = (lang: Language) => {
    setLanguage(lang);
    setLangOpen(false);
  };

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-3">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-sky-400 shrink-0">
            <span className="text-xl">🏊🚴🏃</span>
            <span className="hidden sm:block">BodyCoaching</span>
          </Link>

          {/* Desktop nav */}
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

          <div className="flex items-center gap-1">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(v => !v)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                aria-label={t.common.language}
              >
                <span className="text-base">🌐</span>
                <span className="hidden sm:block uppercase text-xs font-bold">{language}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 min-w-[130px]">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      onClick={() => handleLangSelect(lang)}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                        lang === language
                          ? 'bg-sky-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <span className="uppercase text-xs font-bold w-5">{lang}</span>
                      <span>{LANGUAGE_LABELS[lang]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-md hover:bg-slate-700 transition-colors"
              onClick={() => { setOpen(!open); setLangOpen(false); }}
              aria-label="Toggle menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`block h-0.5 bg-white transition-all ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-0.5 bg-white transition-all ${open ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-white transition-all ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
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
