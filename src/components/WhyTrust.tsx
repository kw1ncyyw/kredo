/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language, AppTheme } from '../types';
import { i18nDict } from '../messages';
import { ShieldCheck, Scale, FileText, UserCheck, Gavel, HelpCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface WhyTrustProps {
  lang: Language;
  theme: AppTheme;
}

export default function WhyTrust({ lang, theme }: WhyTrustProps) {
  const t = i18nDict[lang];

  // Map of 6 highly realistic and legal-centric trust cards
  const cards = [
    {
      title: t.trust.secureTitle,
      desc: t.trust.secureDesc,
      icon: Scale, // Professional legal partners
    },
    {
      title: t.trust.fraudTitle,
      desc: t.trust.fraudDesc,
      icon: FileText, // Reliable lawyers available / contract drafts
    },
    {
      title: t.trust.fastTitle,
      desc: t.trust.fastDesc,
      icon: ShieldAlert, // Fraud protection
    },
    {
      title: t.trust.transparentTitle,
      desc: t.trust.transparentDesc,
      icon: UserCheck, // Verified users (KYC)
    },
    {
      title: t.trust.supportTitle,
      desc: t.trust.supportDesc,
      icon: Gavel, // Dispute support / protected arbitration
    },
    {
      title: t.trust.verifiedTitle,
      desc: t.trust.verifiedDesc,
      icon: ShieldCheck, // Secure workflow step-by-step
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <section
      id="security"
      className={`py-20 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#030303]' : 'bg-stone-50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-stone-900'
            }`}
          >
            {t.trust.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`mt-4 text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-stone-400' : 'text-stone-605 text-stone-600'
            }`}
          >
            {t.trust.subtitle}
          </motion.p>
        </div>

        {/* Why Trust Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`rounded-xl p-6 sm:p-8 border transition-all duration-300 hover:-translate-y-1 ${
                  theme === 'dark'
                    ? 'bg-stone-900/45 border-stone-905 border-stone-850 hover:border-stone-700/60 shadow-md'
                    : 'bg-white border-stone-200/85 hover:border-stone-300 shadow-sm'
                }`}
              >
                
                {/* Icon wrapper */}
                <div className={`p-3 rounded-xl mb-6 inline-block ${
                  theme === 'dark'
                    ? 'bg-white/5 text-emerald-400 border border-stone-800'
                    : 'bg-stone-100 text-stone-900 border border-stone-200/50'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className={`text-base font-bold tracking-tight mb-2.5 ${
                  theme === 'dark' ? 'text-white' : 'text-stone-900'
                }`}>
                  {card.title}
                </h3>
                
                <p className={`text-xs sm:text-sm leading-relaxed ${
                  theme === 'dark' ? 'text-stone-400' : 'text-stone-550 text-stone-605 text-stone-600'
                }`}>
                  {card.desc}
                </p>

              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
