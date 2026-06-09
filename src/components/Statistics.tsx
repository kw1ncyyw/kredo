/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { Language, AppTheme } from '../types';
import { i18nDict } from '../messages';
import { motion, useInView } from 'motion/react';

interface StatisticsProps {
  lang: Language;
  theme: AppTheme;
}

export default function Statistics({ lang, theme }: StatisticsProps) {
  const t = i18nDict[lang];
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });

  // State for counters
  const [dealsCount, setDealsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [protectedCount, setProtectedCount] = useState(0);
  const [countriesCount, setCountriesCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime = Date.now();
    const duration = 2000; // 2 seconds

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (outQuad)
      const ease = progress * (2 - progress);

      setDealsCount(Math.floor(ease * 148));
      setUsersCount(Math.floor(ease * 240));
      setProtectedCount(Math.floor(ease * 910));
      setCountriesCount(Math.floor(ease * 115));

      if (progress === 1) {
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView]);

  const stats = [
    {
      value: `${dealsCount}`,
      suffix: t.stats.suffixThousands,
      label: t.stats.dealsTitle,
    },
    {
      value: `${usersCount}`,
      suffix: t.stats.suffixThousands,
      label: t.stats.usersTitle,
    },
    {
      value: `$${protectedCount}`,
      suffix: t.stats.suffixMillions,
      label: t.stats.protectedTitle,
    },
    {
      value: `${countriesCount}`,
      suffix: '+',
      label: t.stats.countriesTitle,
    },
  ];

  return (
    <section
      id="pricing"
      ref={containerRef}
      className={`py-24 transition-colors duration-300 relative overflow-hidden ${
        theme === 'dark' ? 'bg-[#030303]' : 'bg-stone-50'
      }`}
    >
      {/* Decorative clean background mesh line */}
      <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] ${
        theme === 'dark' ? 'bg-stone-900/40' : 'bg-stone-200/40'
      }`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="text-center"
            >
              {/* Animated Counters */}
              <div className="flex items-baseline justify-center">
                <span className={`text-4xl sm:text-5xl md:text-6xl font-bold font-sans tracking-tight ${
                  theme === 'dark' ? 'text-white' : 'text-stone-950'
                }`}>
                  {stat.value}
                </span>
                <span className={`text-xl sm:text-2xl font-bold font-sans tracking-tight ml-0.5 ${
                  theme === 'dark' ? 'text-stone-400' : 'text-stone-500'
                }`}>
                  {stat.suffix}
                </span>
              </div>

              {/* Title metric label */}
              <p className={`mt-3 text-xs sm:text-sm font-semibold uppercase tracking-wider ${
                theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
              }`}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
