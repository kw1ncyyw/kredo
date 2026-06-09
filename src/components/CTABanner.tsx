/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RoutePath, Language, AppTheme } from '../types';
import { i18nDict } from '../messages';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface CTABannerProps {
  setRoute: (route: RoutePath) => void;
  lang: Language;
  theme: AppTheme;
  isLoggedIn: boolean;
}

export default function CTABanner({ setRoute, lang, theme, isLoggedIn }: CTABannerProps) {
  const t = i18nDict[lang];

  const handleClick = () => {
    if (isLoggedIn) {
      setRoute('create-deal');
    } else {
      setRoute('login');
    }
  };

  return (
    <section
      id="contact"
      className={`py-24 transition-colors duration-300 relative overflow-hidden ${
        theme === 'dark' ? 'bg-[#030303]' : 'bg-stone-50'
      }`}
    >
      {/* Decorative clean ambient glows */}
      <div className={`absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none -mr-48 -mb-48 ${
        theme === 'dark' ? 'bg-white' : 'bg-black'
      }`} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className={`rounded-3xl p-10 sm:p-14 border text-center relative overflow-hidden ${
          theme === 'dark'
            ? 'glassmorphism bg-[#080808]/80 border-stone-850/80'
            : 'glassmorphism bg-white/80 border-stone-250/80 shadow-md'
        }`}>
          
          {/* Security Indicator */}
          <div className="flex justify-center mb-6">
            <div className={`p-3.5 rounded-full ${
              theme === 'dark' ? 'bg-stone-900 border border-stone-800' : 'bg-stone-100 border border-stone-200'
            }`}>
              <ShieldCheck className={`h-6 w-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
            </div>
          </div>

          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-stone-950'
          }`}>
            {t.cta.title}
          </h2>

          <p className={`text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-10 ${
            theme === 'dark' ? 'text-stone-400' : 'text-stone-505 text-stone-600'
          }`}>
            {t.cta.subtitle}
          </p>

          <button
            id="cta-deal-button"
            onClick={handleClick}
            className={`px-8 py-3.5 rounded-xl text-sm font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-300 inline-flex items-center space-x-2 ${
              theme === 'dark'
                ? 'bg-white text-black hover:bg-stone-105'
                : 'bg-black text-white hover:bg-stone-903'
            }`}
          >
            <span>{t.cta.btn}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          {/* Decorative fluid elements */}
          <div className={`absolute top-0 left-0 w-32 h-1 bg-gradient-to-r via-stone-500 to-transparent ${
            theme === 'dark' ? 'from-white' : 'from-black'
          }`} />

        </div>
      </div>
    </section>
  );
}
