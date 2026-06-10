/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RoutePath, Language, AppTheme } from '../types';
import { i18nDict } from '../messages';
import { Shield, Mail } from 'lucide-react';

interface FooterProps {
  currentRoute: RoutePath;
  setRoute: (route: RoutePath) => void;
  lang: Language;
  theme: AppTheme;
}

export default function Footer({ currentRoute, setRoute, lang, theme }: FooterProps) {
  const t = i18nDict[lang];

  const handleLinkClick = (route: RoutePath) => {
    if (currentRoute === route) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setRoute(route);
    }
  };

  const handleScrollToSection = (sectionId: string) => {
    setRoute('home');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  return (
    <footer
      className={`border-t pt-16 pb-12 transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-[#030303] border-stone-900 text-stone-400'
          : 'bg-stone-50 border-stone-200 text-stone-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Logo & Slogan Column */}
          <div className="lg:col-span-2 space-y-6">
            <div
              onClick={() => handleLinkClick('home')}
              className="flex items-center space-x-2.5 cursor-pointer group w-fit"
            >
              <div className={`p-2 rounded-lg ${
                theme === 'dark' ? 'bg-stone-900 border border-stone-850' : 'bg-stone-105 bg-white border border-stone-200'
              }`}>
                <Shield className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`} />
              </div>
              <span className={`text-xl font-bold tracking-tight font-sans ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>
                KREDO
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              {t.footer.tagline}
            </p>
            <a
              href="mailto:kredo.support.ua@gmail.com"
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                theme === 'dark'
                  ? 'border-stone-800 bg-stone-900/60 text-stone-300 hover:border-stone-700 hover:text-white'
                  : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:text-stone-950'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>kredo.support.ua@gmail.com</span>
            </a>
          </div>

          {/* Sitemaps */}
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${
              theme === 'dark' ? 'text-stone-300' : 'text-stone-900'
            }`}>
              {t.footer.colCompany}
            </h3>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <button
                  onClick={() => handleLinkClick('about')}
                  className={`hover:transition-all text-left cursor-pointer ${theme === 'dark' ? 'hover:text-white' : 'hover:text-stone-900'}`}
                >
                  {lang === 'ua' ? 'Про KREDO' : lang === 'ru' ? 'О KREDO' : 'About KREDO'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('business-info')}
                  className={`hover:transition-all text-left cursor-pointer ${theme === 'dark' ? 'hover:text-white' : 'hover:text-stone-900'}`}
                >
                  {lang === 'ua' ? 'Юридичні реквізити' : lang === 'ru' ? 'Юридические реквизиты' : 'Business Info'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('security')}
                  className={`hover:transition-all text-left cursor-pointer ${theme === 'dark' ? 'hover:text-white' : 'hover:text-stone-900'}`}
                >
                  {t.footer.security}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${
              theme === 'dark' ? 'text-stone-300' : 'text-stone-900'
            }`}>
              {t.footer.colLegal}
            </h3>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <button
                  onClick={() => handleLinkClick('terms')}
                  className={`hover:transition-all ${theme === 'dark' ? 'hover:text-white' : 'hover:text-stone-900'}`}
                >
                  {t.footer.terms}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('privacy')}
                  className={`hover:transition-all ${theme === 'dark' ? 'hover:text-white' : 'hover:text-stone-900'}`}
                >
                  {t.footer.privacy}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('disputes')}
                  className={`hover:transition-all ${theme === 'dark' ? 'hover:text-white' : 'hover:text-stone-900'}`}
                >
                  {t.footer.disputePolicy}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${
              theme === 'dark' ? 'text-stone-300' : 'text-stone-900'
            }`}>
              {t.footer.help}
            </h3>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <button
                  onClick={() => handleLinkClick('faq')}
                  className={`hover:transition-all ${theme === 'dark' ? 'hover:text-white' : 'hover:text-stone-900'}`}
                >
                  {t.faq.title}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('contact')}
                  className={`hover:transition-all ${theme === 'dark' ? 'hover:text-white' : 'hover:text-stone-900'}`}
                >
                  {t.nav.contact}
                </button>
              </li>
              <li className="flex items-start space-x-2 text-xs">
                <Mail className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <a href="mailto:kredo.support.ua@gmail.com" className="font-mono hover:underline">kredo.support.ua@gmail.com</a>
              </li>
            </ul>
          </div>

        </div>

        <hr className={`my-8 ${theme === 'dark' ? 'border-stone-900' : 'border-stone-205 border-stone-200'}`} />

        <div className="flex flex-col md:flex-row items-center justify-between text-xs font-medium space-y-4 md:space-y-0">
          <p className="text-center md:text-left leading-relaxed">
            {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
