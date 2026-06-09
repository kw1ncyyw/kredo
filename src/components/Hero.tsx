/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RoutePath, Language, AppTheme } from '../types';
import { i18nDict } from '../messages';
import { CheckCircle2, ChevronRight, Play } from 'lucide-react';
import { motion, useAnimation } from 'motion/react';

interface HeroProps {
  setRoute: (route: RoutePath) => void;
  lang: Language;
  theme: AppTheme;
  isLoggedIn: boolean;
}

export default function Hero({ setRoute, lang, theme, isLoggedIn }: HeroProps) {
  const t = i18nDict[lang];
  const [videoLoaded, setVideoLoaded] = useState(false);

  const handlePrimaryClick = () => {
    if (isLoggedIn) {
      setRoute('create-deal');
    } else {
      setRoute('login');
    }
  };

  const handleSecondaryClick = () => {
    const howSection = document.getElementById('how-it-works');
    if (howSection) {
      howSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      setRoute('how-it-works');
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-[92vh] w-full flex items-center justify-center overflow-hidden pt-18"
    >
      {/* Autoplay Video Background (No dark overlay or gradient to keep clean) */}
      <div className="absolute inset-0 w-full h-full z-0 select-none pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          id="hero-bg-video"
          onLoadedData={() => setVideoLoaded(true)}
          className="w-full h-full object-cover animate-fade-in"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
        />
        {/* Subtle blur loading placeholder */}
        {!videoLoaded && (
          <div className="absolute inset-0 bg-stone-900 transition-opacity duration-1000" />
        )}
      </div>

      {/* Hero Interactive Text Content container (Safe-guarded legibility) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center flex flex-col items-center">
        
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full backdrop-blur-md bg-black/45 border border-white/20 text-white text-[11px] font-semibold uppercase tracking-wider"
        >
          <CheckCircle2 className="h-3 w-3 text-white animate-pulse" />
          <span>{t.hero.badge}</span>
        </motion.div>

        {/* Updated Unified Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-sans font-bold tracking-tight text-white drop-shadow-md mb-6 leading-tight select-none max-w-4xl"
          style={{ textShadow: '0 2px 12px rgba(0, 0, 0, 0.5)' }}
        >
          {t.hero.title || "Secure transactions for valuable assets"}
        </motion.h1>

        {/* Dynamic Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl font-normal tracking-wide leading-relaxed mb-10"
          style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.65)' }}
        >
          {t.hero.subtitle}
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button
            id="hero-primary-btn"
            onClick={handlePrimaryClick}
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold bg-white text-black hover:bg-stone-100 rounded-xl transition-all duration-300 shadow-xl flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
          >
            <span>{t.hero.primaryBtn}</span>
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            id="hero-secondary-btn"
            onClick={handleSecondaryClick}
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold bg-black/45 hover:bg-black/60 text-white border border-white/20 hover:border-white rounded-xl transition-all duration-300 backdrop-blur-md flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>{t.hero.secondaryBtn}</span>
          </button>
        </motion.div>

      </div>

      {/* Subtle indicator of clean look at the bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 animate-bounce cursor-pointer opacity-75 hidden sm:block" onClick={handleSecondaryClick}>
        <div className="w-5 h-8 rounded-full border border-white/30 flex justify-center p-1">
          <div className="w-0.5 h-1.5 rounded-full bg-white animate-scroll" />
        </div>
      </div>
    </section>
  );
}
