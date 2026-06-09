/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Language, AppTheme } from '../types';
import { i18nDict } from '../messages';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQAccordionProps {
  lang: Language;
  theme: AppTheme;
}

export default function FAQAccordion({ lang, theme }: FAQAccordionProps) {
  const t = i18nDict[lang];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className={`py-24 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#080808]' : 'bg-white'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header Title */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`text-3xl font-bold tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-stone-903 text-stone-900'
            }`}
          >
            {t.faq.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`mt-4 text-sm sm:text-base ${
              theme === 'dark' ? 'text-stone-400' : 'text-stone-500'
            }`}
          >
            {t.faq.subtitle}
          </motion.p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? theme === 'dark'
                      ? 'bg-stone-950/70 border-stone-800 shadow-md'
                      : 'bg-stone-50/80 border-stone-300/80 shadow-sm'
                    : theme === 'dark'
                    ? 'bg-stone-950/20 border-stone-900/60 hover:border-stone-800'
                    : 'bg-transparent border-stone-200 hover:border-stone-300'
                }`}
              >
                {/* Accordion trigger button */}
                <button
                  onClick={() => handleToggle(idx)}
                  id={`faq-toggle-${idx}`}
                  className="w-full text-left px-5 sm:px-6 py-5 flex items-center justify-between font-sans hover:transition-all"
                >
                  <span className={`text-sm sm:text-base font-semibold tracking-wide pr-4 ${
                    isOpen
                      ? theme === 'dark'
                        ? 'text-white'
                        : 'text-stone-950'
                      : theme === 'dark'
                      ? 'text-stone-304 text-stone-300 hover:text-white'
                      : 'text-stone-701 text-stone-700 hover:text-stone-900'
                  }`}>
                    {faq.q}
                  </span>
                  
                  {/* Icon Indicator */}
                  <div className={`p-1.5 rounded-lg border transition-all duration-300 ${
                    isOpen
                      ? theme === 'dark'
                        ? 'bg-white text-black border-white'
                        : 'bg-black text-white border-black'
                      : theme === 'dark'
                      ? 'border-stone-800 text-stone-400'
                      : 'border-stone-200 text-stone-500'
                  }`}>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Expanded content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key={`faq-content-${idx}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className={`px-5 sm:px-6 pb-5 text-sm leading-relaxed border-t pt-4 ${
                        theme === 'dark'
                          ? 'text-stone-400 border-stone-900'
                          : 'text-stone-605 text-stone-600 border-stone-200'
                      }`}>
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
