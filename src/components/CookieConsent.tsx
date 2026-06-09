/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RoutePath, Language, AppTheme } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Cookie } from 'lucide-react';

interface CookieConsentProps {
  lang: Language;
  theme: AppTheme;
  setRoute: (route: RoutePath) => void;
}

export default function CookieConsent({ lang, theme, setRoute }: CookieConsentProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('kredo_cookie_consent');
    if (!consent) {
      // Delay slightly for premium entering motion rhythm
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleChoice = (choice: 'accepted' | 'declined') => {
    localStorage.setItem('kredo_cookie_consent', choice);
    setVisible(false);
  };

  const text = {
    ua: {
      title: 'Файли cookie та приватність',
      desc: 'Ми використовуємо функціональні файли cookie для безпечної автентифікації, збереження налаштувань вашого інтерфейсу та захисту ескроу-рахунків.',
      btnAccept: 'Дозволити',
      btnDecline: 'Відхилити',
      btnMore: 'Дізнатися більше',
    },
    en: {
      title: 'Cookies & Encryption',
      desc: 'We utilize critical cookies to verify your identity, secure active session environments, and guarantee escrow safety.',
      btnAccept: 'Accept',
      btnDecline: 'Decline',
      btnMore: 'Learn more',
    },
    ru: {
      title: 'Файлы cookie и конфиденциальность',
      desc: 'Мы используем функциональные файлы cookie для безопасной аутентификации, сохранения ваших настроек и защиты эскроу-аккаунтов.',
      btnAccept: 'Разрешить',
      btnDecline: 'Отклонить',
      btnMore: 'Узнать больше',
    }
  };

  const t = text[lang] || text.ua;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-md z-45"
        >
          <div className={`p-6 rounded-3xl border backdrop-blur-xl shadow-2xl transition-all ${
            theme === 'dark' 
              ? 'bg-[#0a0a0a]/95 border-stone-800 text-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.7)]' 
              : 'bg-white/95 border-stone-200 text-stone-900 shadow-[0_15px_40px_rgba(0,0,0,0.1)]'
          }`}>
            <div className="flex items-start space-x-4">
              <div className={`p-2.5 rounded-2xl shrink-0 ${
                theme === 'dark' ? 'bg-stone-900 text-emerald-400 border border-stone-850' : 'bg-stone-100 text-stone-850 border border-stone-200'
              }`}>
                <Cookie className="h-5 w-5" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500">
                  {t.title}
                </h4>
                <p className={`text-[11px] leading-relaxed font-semibold ${
                  theme === 'dark' ? 'text-stone-400' : 'text-stone-600'
                }`}>
                  {t.desc}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleChoice('accepted')}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-white text-black hover:bg-stone-200'
                    : 'bg-stone-950 text-white hover:bg-stone-850'
                }`}
              >
                {t.btnAccept}
              </button>
              
              <button
                type="button"
                onClick={() => handleChoice('declined')}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                  theme === 'dark'
                    ? 'border-stone-800 text-stone-400 hover:text-white hover:bg-white/5'
                    : 'border-stone-200 text-stone-600 hover:text-stone-950 hover:bg-stone-50'
                }`}
              >
                {t.btnDecline}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRoute('business-info');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all hover:underline cursor-pointer ml-auto shrink-0 ${
                  theme === 'dark' ? 'text-stone-500 hover:text-stone-300' : 'text-stone-550 hover:text-stone-800'
                }`}
              >
                {t.btnMore}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
