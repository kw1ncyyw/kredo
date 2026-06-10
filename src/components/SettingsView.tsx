/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RoutePath, Language, AppTheme } from '../types';
import { i18nDict } from '../messages';
import { ShieldCheck, Save, CheckCircle2, ChevronRight, Languages, SunMoon, BellRing } from 'lucide-react';

interface SettingsViewProps {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: AppTheme;
  toggleTheme: () => void;
  setLanguageByPrefix: (prefix: string) => void;
  setRoute: (route: RoutePath) => void;
}

export default function SettingsView({
  lang,
  setLang,
  theme,
  toggleTheme,
  setLanguageByPrefix,
  setRoute,
}: SettingsViewProps) {
  const t = i18nDict[lang];

  // Settings states
  const [twoFactor, setTwoFactor] = useState(true);
  const [marketing, setMarketing] = useState(false);

  // Status alerts
  const [alertSuccess, setAlertSuccess] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAlertSuccess(t.settings.saveSuccess);
    setTimeout(() => setAlertSuccess(''), 2500);
  };

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    setLanguageByPrefix(newLang);
    setAlertSuccess(t.settings.saveSuccess);
    setTimeout(() => setAlertSuccess(''), 2000);
  };

  return (
    <div className={theme === 'dark' ? 'text-stone-100' : 'text-stone-900'}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header Title */}
        <div className={`mb-8 rounded-[2rem] border p-6 sm:p-8 ${
          theme === 'dark' ? 'border-white/[0.08] bg-[#101010]' : 'border-stone-200 bg-white shadow-sm'
        }`}>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-stone-90c text-stone-950'
          }`}>
            {t.settings.title}
          </h1>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
            {t.settings.subtitle}
          </p>
        </div>

        {/* Configurations Grid splits */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Main options inputs forms (Col size 3) */}
          <form onSubmit={handleSave} className="lg:col-span-3 space-y-5">
            <section className={`rounded-[2rem] p-6 sm:p-8 border ${
            theme === 'dark' ? 'bg-[#0d0d0d] border-white/[0.08]' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            
            {/* Show update success alerts */}
            {alertSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-504/20 text-emerald-500 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{alertSuccess}</span>
              </div>
            )}

            {/* General interface language or color mapping */}
            <div className="space-y-5">
              <div className="flex items-center gap-3"><Languages className="h-5 w-5 text-emerald-500" /><h3 className="text-lg font-black">{t.settings.language}</h3></div>

              {/* Language selection */}
              <div>
                <label className="block text-xs font-semibold mb-2">{t.settings.language}</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(['ua', 'en', 'ru'] as Language[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => handleLangChange(l)}
                      className={`min-h-12 rounded-xl font-bold border transition-all ${
                        lang === l
                          ? theme === 'dark'
                            ? 'bg-white text-black border-white'
                            : 'bg-black text-white border-black'
                          : theme === 'dark'
                          ? 'bg-stone-950 border-stone-900 text-stone-400 hover:text-white'
                          : 'bg-stone-50 border-stone-200 text-stone-505 hover:text-stone-950'
                      }`}
                    >
                      {l === 'ua' ? 'Українська' : l === 'en' ? 'English' : 'Русский'}
                    </button>
                  ))}
                </div>
              </div>

            </div>
            </section>

            <section className={`rounded-[2rem] p-6 sm:p-8 border ${
              theme === 'dark' ? 'bg-[#0d0d0d] border-white/[0.08]' : 'bg-white border-stone-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-3 mb-5"><SunMoon className="h-5 w-5 text-emerald-500" /><h3 className="text-lg font-black">{t.settings.theme}</h3></div>
              <div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={theme === 'dark' ? toggleTheme : undefined}
                    className={`min-h-12 px-3 rounded-xl font-bold border transition-all ${
                      theme === 'light'
                        ? 'bg-black text-white border-black'
                        : 'bg-stone-950 border-stone-900 text-stone-400 hover:text-white'
                    }`}
                  >
                    {t.settings.themeLight}
                  </button>
                  <button
                    type="button"
                    onClick={theme === 'light' ? toggleTheme : undefined}
                    className={`min-h-12 px-3 rounded-xl font-bold border transition-all ${
                      theme === 'dark'
                        ? 'bg-white text-black border-white'
                        : 'bg-stone-50 border-stone-200 text-stone-605'
                    }`}
                  >
                    {t.settings.themeDark}
                  </button>
                </div>
              </div>
            </section>

            <section className={`rounded-[2rem] p-6 sm:p-8 border ${
              theme === 'dark' ? 'bg-[#0d0d0d] border-white/[0.08]' : 'bg-white border-stone-200 shadow-sm'
            }`}>
            <div className="space-y-4">
              <div className="flex items-center gap-3"><BellRing className="h-5 w-5 text-emerald-500" /><h3 className="text-lg font-black">{lang === 'ua' ? 'Налаштування сповіщень' : lang === 'ru' ? 'Настройки уведомлений' : 'Notification preferences'}</h3></div>

              {/* 2-Factor check toggle */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border bg-stone-500/[0.04] border-stone-500/10">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide tracking-tight">{t.settings.twoFactor}</label>
                  <span className="text-sm text-stone-500 font-medium block mt-1">{lang === 'ua' ? 'Додатковий захист важливих дій в акаунті.' : lang === 'ru' ? 'Дополнительная защита важных действий в аккаунте.' : 'Extra protection for important account actions.'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFactor(!twoFactor)}
                  className={`px-3 py-1 rounded-md text-[10px] uppercase font-extrabold transition-colors tracking-widest ${
                    twoFactor
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-stone-500/10 text-stone-400'
                  }`}
                >
                  {twoFactor ? t.settings.statusActive : t.settings.statusDisabled}
                </button>
              </div>

              {/* Newsletter Toggle */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border bg-stone-500/[0.04] border-stone-500/10">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide tracking-tight">{t.settings.marketing}</label>
                  <span className="text-sm text-stone-500 font-medium block mt-1">{lang === 'ua' ? 'Отримувати корисні оновлення та новини KREDO.' : lang === 'ru' ? 'Получать полезные обновления и новости KREDO.' : 'Receive useful KREDO updates and product news.'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMarketing(!marketing)}
                  className={`px-3 py-1 rounded-md text-[10px] uppercase font-extrabold transition-colors tracking-widest ${
                    marketing
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-stone-500/10 text-stone-400'
                  }`}
                >
                  {marketing ? t.settings.statusActive : t.settings.statusDisabled}
                </button>
              </div>
            </div>
            </section>

            <button
              id="settings-options-save-btn"
              type="submit"
              className={`w-full py-4 rounded-xl text-sm font-bold transition-all shadow-md hover:-translate-y-0.5 ${
                theme === 'dark'
                  ? 'bg-white text-black hover:bg-stone-105'
                  : 'bg-black text-white hover:bg-stone-903'
              }`}
            >
              <Save className="h-4 w-4 inline-block mr-1.5" />
              <span>{t.settings.btnSave}</span>
            </button>

          </form>

          {/* Account security */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className={`text-xs font-bold uppercase tracking-widest ${
              theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
            }`}>
              {lang === 'ua' ? 'Безпека акаунта' : lang === 'ru' ? 'Безопасность аккаунта' : 'Account security'}
            </h3>

            <div className={`rounded-[2rem] p-6 border ${
              theme === 'dark' ? 'bg-[#0d0d0d] border-white/[0.08]' : 'bg-white border-stone-200 shadow-sm'
            }`}>
              <div className="flex items-center space-x-2 mb-3">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-bold">
                  {lang === 'ua' ? 'Пароль і захист' : lang === 'ru' ? 'Пароль и защита' : 'Password and protection'}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-stone-500 mb-5">
                {lang === 'ua' ? 'Керуйте паролем, двофакторним захистом та активними сесіями.' : lang === 'ru' ? 'Управляйте паролем, двухфакторной защитой и активными сессиями.' : 'Manage your password, two-factor protection, and active sessions.'}
              </p>
              <button
                type="button"
                onClick={() => setRoute('security')}
                className="flex w-full items-center justify-between rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600"
              >
                <span>{lang === 'ua' ? 'Відкрити налаштування безпеки' : lang === 'ru' ? 'Открыть настройки безопасности' : 'Open security settings'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
