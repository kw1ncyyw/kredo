/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { RoutePath, Language, AppTheme } from '../types';
import { i18nDict } from '../messages';
import { Shield, Menu, X, Globe, User, LogOut, Sun, Moon, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  currentRoute: RoutePath;
  setRoute: (route: RoutePath) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: AppTheme;
  toggleTheme: () => void;
  isLoggedIn: boolean;
  logout: () => void;
  setLanguageByPrefix: (prefix: string) => void;
}

export default function Navbar({
  currentRoute,
  setRoute,
  lang,
  setLang,
  theme,
  toggleTheme,
  isLoggedIn,
  logout,
  setLanguageByPrefix,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const t = i18nDict[lang];

  // Track scroll position for header glassmorphism transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside clicks
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    setLanguageByPrefix(newLang);
    setLangDropdownOpen(false);
  };

  const navItems: Array<{ label: string; action: RoutePath; isPublicSection: boolean }> = [
    { label: t.nav.home, action: 'home', isPublicSection: true },
    { label: t.nav.howItWorks, action: 'how-it-works', isPublicSection: true },
    { label: t.nav.solutions, action: 'solutions', isPublicSection: true },
    { label: t.nav.pricing, action: 'pricing', isPublicSection: true },
    { label: t.nav.payments, action: 'payments', isPublicSection: true },
    { label: t.nav.security, action: 'security', isPublicSection: true },
    { label: t.nav.faq, action: 'faq', isPublicSection: true },
    { label: t.nav.contact, action: 'contact', isPublicSection: true },
  ];

  const handleNavClick = (action: RoutePath, isPublicSection: boolean) => {
    setMobileMenuOpen(false);
    setLangDropdownOpen(false);
    setUserDropdownOpen(false);

    if (action === 'login' || action === 'register') {
      setRoute(action);
      window.dispatchEvent(new CustomEvent('kredo-auth-mode', { detail: action }));
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    
    if (currentRoute === action) {
      // Same-page smooth scroll if navigating to the same route or section on it
      const element = document.getElementById(action);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Different page/route navigation: change the route state immediately.
      // App.tsx's useEffect will handle resetting the scroll to top of the page instantly.
      setRoute(action);
    }
  };

  const languageLabels = {
    ua: 'Українська',
    en: 'English',
    ru: 'Русский',
  };

  return (
    <nav
      id="main-nav"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? theme === 'dark'
            ? 'bg-[#0a0a0a]/90 border-b border-stone-800/90 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-2xl'
            : 'bg-white/95 border-b border-stone-300 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-2xl'
          : theme === 'dark'
          ? 'bg-transparent border-b border-transparent'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            onClick={() => handleNavClick('home', true)}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
              whileHover={{ scale: 1.08, rotate: 12 }}
              className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-stone-800 to-stone-900 border border-stone-700 shadow-lg' 
                  : 'bg-gradient-to-br from-stone-100 to-white border border-stone-300 shadow-md'
              }`}
            >
              <Shield className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`} />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`text-2xl font-black tracking-wider transition-colors duration-305 font-sans ${
                theme === 'dark' ? 'text-white' : 'text-stone-950'
              }`}
            >
              KREDO
            </motion.span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, idx) => {
              const isActive = currentRoute === item.action;
              return (
                <motion.button
                  key={item.action}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  id={`nav-item-${item.action}`}
                  onClick={() => handleNavClick(item.action, true)}
                  className={`px-2.5 xl:px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'bg-stone-900 text-white shadow-sm'
                      : theme === 'dark'
                      ? 'text-stone-400 hover:text-white hover:bg-white/5'
                      : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
                  }`}
                >
                  {item.label}
                </motion.button>
              );
            })}
          </div>

          {/* Right actions */}
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            className="hidden lg:flex items-center space-x-3"
          >
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              id="theme-toggler"
              className={`p-2 rounded-lg transition-all duration-200 ${
                theme === 'dark'
                  ? 'text-stone-400 hover:text-white hover:bg-stone-900 border border-stone-900'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                id="language-dropdown-btn"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-200 ${
                  theme === 'dark'
                    ? 'border-stone-800 text-stone-300 hover:text-white hover:bg-stone-900 bg-stone-950/40'
                    : 'border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 bg-white/50'
                }`}
              >
                <Globe className="h-4 w-4" />
                <span className="uppercase">{lang}</span>
              </button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    key="lang-dropdown"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 mt-2 w-40 rounded-xl shadow-xl border overflow-hidden p-1.5 ${
                      theme === 'dark'
                        ? 'bg-[#0f0f0f] border-stone-800 text-white'
                        : 'bg-white border-stone-200 text-stone-900'
                    }`}
                  >
                    {(['ua', 'en', 'ru'] as Language[]).map((l) => (
                      <button
                        key={l}
                        onClick={() => changeLanguage(l)}
                        id={`lang-select-${l}`}
                        className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors flex justify-between items-center ${
                          lang === l
                            ? theme === 'dark'
                              ? 'bg-white/10 text-white'
                              : 'bg-stone-900 text-white'
                            : theme === 'dark'
                            ? 'hover:bg-white/5 text-stone-400 hover:text-white'
                            : 'hover:bg-stone-100 text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        <span>{languageLabels[l]}</span>
                        <span className="text-[10px] opacity-75 uppercase">{l}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Account Context mapping */}
            {isLoggedIn ? (
              <div className="relative flex items-center space-x-2" ref={userRef}>
                <button
                  id="dashboard-entry-btn"
                  onClick={() => handleNavClick('dashboard', false)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    currentRoute === 'dashboard'
                      ? theme === 'dark'
                        ? 'bg-white text-black'
                        : 'bg-black text-white'
                      : theme === 'dark'
                      ? 'text-white hover:bg-stone-900 border border-stone-800'
                      : 'text-stone-900 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {t.nav.dashboard}
                </button>

                <div className="relative">
                  <button
                    id="user-profile-toggle-btn"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={`p-2 rounded-full border transition-all duration-300 ${
                      theme === 'dark'
                        ? 'border-stone-800 bg-stone-900 text-stone-300 hover:text-white'
                        : 'border-stone-200 bg-stone-100 text-stone-700 hover:text-black'
                    }`}
                  >
                    <User className="h-4 w-4" />
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        key="user-dropdown"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl border overflow-hidden p-1.5 ${
                          theme === 'dark'
                            ? 'bg-[#0f0f0f] border-stone-800 text-white'
                            : 'bg-white border-stone-200 text-stone-900'
                        }`}
                      >
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleNavClick('profile', false);
                          }}
                          id="nav-user-profile"
                          className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center space-x-2 ${
                            theme === 'dark' ? 'hover:bg-white/5 text-stone-300 hover:text-white' : 'hover:bg-stone-100 text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          <User className="h-3.5 w-3.5" />
                          <span>{t.profile.title}</span>
                        </button>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleNavClick('settings', false);
                          }}
                          id="nav-user-settings"
                          className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center space-x-2 ${
                            theme === 'dark' ? 'hover:bg-white/5 text-stone-300 hover:text-white' : 'hover:bg-stone-100 text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          <Briefcase className="h-3.5 w-3.5" />
                          <span>{t.settings.title}</span>
                        </button>
                        <hr className={`my-1 ${theme === 'dark' ? 'border-stone-800' : 'border-stone-200'}`} />
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          id="nav-user-logout"
                          className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-2 text-red-500 hover:bg-red-500/10"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>{t.nav.logout}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  id="navbar-login-btn"
                  onClick={() => handleNavClick('login', false)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    theme === 'dark'
                      ? 'text-stone-300 hover:text-white bg-transparent hover:bg-stone-900 border border-stone-850'
                      : 'text-stone-700 hover:text-stone-950 bg-transparent hover:bg-stone-100 border border-stone-250'
                  }`}
                >
                  {t.nav.login}
                </button>
                <button
                  id="navbar-register-btn"
                  onClick={() => handleNavClick('register', false)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                    theme === 'dark'
                      ? 'text-black hover:bg-stone-200 bg-white'
                      : 'text-white hover:bg-stone-900 bg-black'
                  }`}
                >
                  {t.nav.register}
                </button>
              </div>
            )}
 
            <button
              id="navbar-create-deal-btn"
              onClick={() => handleNavClick(isLoggedIn ? 'create-deal' : 'login', false)}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-350 shadow-sm hover:scale-[1.02] ${
                theme === 'dark'
                  ? 'bg-white text-black hover:bg-stone-100'
                  : 'bg-black text-white hover:bg-stone-900'
              }`}
            >
              {t.nav.createDeal}
            </button>
          </motion.div>

          {/* Mobile Hamburguer button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-200 ${
                theme === 'dark' ? 'text-stone-400 bg-stone-900' : 'text-stone-600 bg-stone-100'
              }`}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-btn"
              type="button"
              aria-expanded={mobileMenuOpen}
              className={`relative z-[60] min-h-11 min-w-11 p-2 rounded-lg transition-all duration-200 touch-manipulation ${
                theme === 'dark' ? 'text-white' : 'text-stone-900'
              }`}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className={`relative z-[55] lg:hidden border-t overflow-hidden ${
              theme === 'dark' ? 'bg-[#080808] border-stone-900' : 'bg-white border-stone-200'
            }`}
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.action}
                  id={`mobile-nav-item-${item.action}`}
                  onClick={() => handleNavClick(item.action, true)}
                  className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
                    currentRoute === item.action
                      ? theme === 'dark'
                        ? 'bg-white/10 text-white'
                        : 'bg-stone-900 text-white'
                      : theme === 'dark'
                      ? 'text-stone-400 hover:text-white hover:bg-white/5'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <hr className={`my-3 ${theme === 'dark' ? 'border-stone-900' : 'border-stone-100'}`} />

              {/* Mobile Language Selection */}
              <div className="px-4 py-2">
                <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${
                  theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  {t.settings.language}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(['ua', 'en', 'ru'] as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => changeLanguage(l)}
                      id={`mobile-lang-select-${l}`}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        lang === l
                          ? theme === 'dark'
                            ? 'bg-white text-black'
                            : 'bg-black text-white'
                          : theme === 'dark'
                          ? 'bg-stone-900 text-stone-400 hover:text-white'
                          : 'bg-stone-100 text-stone-600 hover:text-stone-950'
                      }`}
                    >
                      {languageLabels[l].split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 space-y-2">
                {isLoggedIn ? (
                  <>
                    <button
                      id="mobile-dashboard-entry-btn"
                      onClick={() => handleNavClick('dashboard', false)}
                      className={`w-full py-2.5 text-center rounded-lg text-sm font-bold ${
                        theme === 'dark' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-900'
                      }`}
                    >
                      {t.nav.dashboard}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleNavClick('profile', false)}
                        className={`py-2 text-center rounded-lg text-xs font-semibold ${
                          theme === 'dark' ? 'bg-stone-950 text-stone-300' : 'bg-stone-50 text-stone-600'
                        }`}
                      >
                        {t.profile.title}
                      </button>
                      <button
                        onClick={logout}
                        className="py-2 text-center rounded-lg text-xs font-semibold bg-red-500/10 text-red-500"
                      >
                        {t.nav.logout}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      id="mobile-login-entry-btn"
                      onClick={() => handleNavClick('login', false)}
                      type="button"
                      className={`block min-h-12 w-full touch-manipulation rounded-xl border px-4 py-3 text-center text-base font-bold ${
                        theme === 'dark'
                          ? 'border-stone-700 bg-stone-900 text-white'
                          : 'border-stone-300 bg-white text-stone-900'
                      }`}
                    >
                      {t.nav.login}
                    </button>
                    <button
                      id="mobile-register-entry-btn"
                      onClick={() => handleNavClick('register', false)}
                      type="button"
                      className={`block min-h-12 w-full touch-manipulation rounded-xl px-4 py-3 text-center text-base font-bold shadow-md ${
                        theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
                      }`}
                    >
                      {t.nav.register}
                    </button>
                  </div>
                )}

                <button
                  id="mobile-create-deal-btn"
                  onClick={() => handleNavClick(isLoggedIn ? 'create-deal' : 'login', false)}
                  className={`block w-full text-center py-3 rounded-lg text-sm font-bold shadow-md ${
                    theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
                  }`}
                >
                  {t.nav.createDeal}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
