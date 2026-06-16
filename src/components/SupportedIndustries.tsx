/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language, AppTheme } from '../types';
import { i18nDict } from '../messages';
import { Laptop, Globe, Car, Binary, ArrowRightLeft, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

interface SupportedIndustriesProps {
  lang: Language;
  theme: AppTheme;
  hideHeader?: boolean;
}

export default function SupportedIndustries({ lang, theme, hideHeader = false }: SupportedIndustriesProps) {
  const t = i18nDict[lang];

  const categories = [
    {
      title: t.industries.freelanceTitle,
      desc: t.industries.freelanceDesc,
      icon: Laptop,
    },
    {
      title: t.industries.domainsTitle,
      desc: t.industries.domainsDesc,
      icon: Globe,
    },
    {
      title: t.industries.vehiclesTitle,
      desc: t.industries.vehiclesDesc,
      icon: Car,
    },
    {
      title: t.industries.digitalTitle,
      desc: t.industries.digitalDesc,
      icon: Binary,
    },
    {
      title: t.industries.servicesTitle,
      desc: t.industries.servicesDesc,
      icon: ArrowRightLeft,
    },
    {
      title: t.industries.ecommerceTitle,
      desc: t.industries.ecommerceDesc,
      icon: ShoppingBag,
    },
  ];

  return (
    <section
      id="solutions"
      className={`py-24 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#080808]' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        {!hideHeader && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5 }}
              className={`text-3xl md:text-4xl font-bold tracking-tight ${
                theme === 'dark' ? 'text-white' : 'text-stone-900'
              }`}
            >
              {t.industries.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`mt-4 text-base md:text-lg ${
                theme === 'dark' ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              {t.industries.subtitle}
            </motion.p>
          </div>
        )}

        {/* Categories Bento Grid / Traditional Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className={`group rounded-2xl p-6 border relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-stone-950/20 border-stone-900 hover:border-stone-850 hover:bg-stone-950/80 shadow-md'
                    : 'bg-stone-50 border-stone-200 hover:border-stone-300 hover:bg-white shadow-sm hover:shadow-md'
                }`}
              >
                
                {/* Sector Icon & Accent Glow */}
                <div className="flex items-start justify-between mb-8">
                  <div className={`p-3.5 rounded-xl transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-stone-900 text-stone-200'
                      : 'bg-white text-stone-905 border border-stone-150'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] font-bold tracking-widest uppercase py-0.5 px-2 rounded-full ${
                    theme === 'dark' ? 'bg-stone-850 text-stone-500' : 'bg-stone-150 text-stone-500'
                  }`}>
                    {t.industries.badge}
                  </span>
                </div>

                {/* Info Text */}
                <div className="space-y-2.5">
                  <h3 className={`text-lg font-bold tracking-tight ${
                    theme === 'dark' ? 'text-white' : 'text-stone-900'
                  }`}>
                    {cat.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${
                    theme === 'dark' ? 'text-stone-405 text-stone-400' : 'text-stone-500'
                  }`}>
                    {cat.desc}
                  </p>
                </div>

                {/* Absolute background accent */}
                <div className={`absolute -right-8 -bottom-8 rounded-full h-24 w-24 opacity-5 pointer-events-none transition-transform duration-500 group-hover:scale-150 ${
                  theme === 'dark' ? 'bg-white' : 'bg-black'
                }`} />

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
