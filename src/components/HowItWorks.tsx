/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language, AppTheme } from '../types';
import { i18nDict } from '../messages';
import { PenTool, DollarSign, UserPlus, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface HowItWorksProps {
  lang: Language;
  theme: AppTheme;
}

export default function HowItWorks({ lang, theme }: HowItWorksProps) {
  const t = i18nDict[lang];

  const steps = [
    {
      num: '01',
      title: t.how.step1Title,
      desc: t.how.step1Desc,
      icon: PenTool,
    },
    {
      num: '02',
      title: t.how.step2Title,
      desc: t.how.step2Desc,
      icon: DollarSign,
    },
    {
      num: '03',
      title: t.how.step3Title,
      desc: t.how.step3Desc,
      icon: UserPlus,
    },
    {
      num: '04',
      title: t.how.step4Title,
      desc: t.how.step4Desc,
      icon: ShieldCheck,
    },
    {
      num: '05',
      title: t.how.step5Title,
      desc: t.how.step5Desc,
      icon: CheckCircle2,
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <section
      id="how-it-works"
      className={`py-24 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#080808]' : 'bg-white'
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
            className={`text-3xl md:text-4xl font-bold tracking-tight font-sans ${
              theme === 'dark' ? 'text-white' : 'text-stone-900'
            }`}
          >
            {t.how.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`mt-4 text-base md:text-lg ${
              theme === 'dark' ? 'text-stone-450 text-stone-400' : 'text-stone-500'
            }`}
          >
            {t.how.subtitle}
          </motion.p>
        </div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 relative"
        >
          {/* Timeline Connector Line */}
          <div className={`hidden lg:block absolute top-[68px] left-[15%] right-[15%] h-px z-0 ${
            theme === 'dark' ? 'bg-stone-850 bg-stone-900' : 'bg-stone-200'
          }`} />

          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                viewport={{ once: true }}
                className={`relative z-10 rounded-2xl p-6 transition-all duration-300 group overflow-hidden border ${
                  theme === 'dark'
                    ? 'bg-stone-950/40 border-stone-900 hover:border-stone-700/60 hover:bg-stone-950 shadow-md'
                    : 'bg-stone-50 border-stone-200/65 hover:border-stone-300 hover:bg-white shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  {/* Icon Frame */}
                  <div className={`p-4 rounded-xl transition-all duration-500 ${
                    theme === 'dark'
                      ? 'bg-stone-900 text-white border border-stone-800 group-hover:scale-105'
                      : 'bg-white text-stone-900 border border-stone-150 group-hover:scale-105 shadow-sm'
                  }`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  {/* Step Code */}
                  <span className={`text-4xl font-extrabold tracking-tight select-none opacity-15 font-mono ${
                    theme === 'dark' ? 'text-white' : 'text-black'
                  }`}>
                    {step.num}
                  </span>
                </div>

                {/* Info titles */}
                <h3 className={`text-lg font-bold tracking-tight mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-stone-900'
                }`}>
                  {step.title}
                </h3>
                <p className={`text-sm leading-relaxed ${
                  theme === 'dark' ? 'text-stone-400' : 'text-stone-500'
                }`}>
                  {step.desc}
                </p>
                
                {/* Visual Accent Hover Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-500 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
