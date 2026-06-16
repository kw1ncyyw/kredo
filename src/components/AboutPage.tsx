/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language, AppTheme } from '../types';
import { ShieldCheck, Scale, Award, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface AboutPageProps {
  lang: Language;
  theme: AppTheme;
}

export default function AboutPage({ lang, theme }: AboutPageProps) {
  const content = {
    ua: {
      tag: 'ХТО МИ Є',
      title: 'Про платформу KREDO',
      subtitle: 'Сучасна технологічна ескроу-інфраструктура для безпеки вашого бізнесу.',
      desc1: 'KREDO — це технологічна платформа для юридично зрозумілої координації угод між контрагентами. Ми допомагаємо зменшити ризики шахрайства, невиконання зобов’язань та фінансових втрат при купівлі-продажу послуг, цифрових та матеріальних активів.',
      desc2: 'KREDO фіксує умови угоди, координує етапи виконання та відображає платіжний статус, який обробляється підключеним платіжним партнером.',
      
      partnersTitle: 'Наші партнери',
      partnerName: 'Адвокатське об’єднання «LEXAR»',
      partnerRole: 'Юридичний партнер KREDO',
      partnerDesc: 'KREDO співпрацює із професійними юридичними партнерами для супроводу складних та міжнародних угод. LEXAR забезпечує:',
      partnerFeatures: [
        'аналіз документів',
        'юридичну експертизу',
        'оцінку ризиків',
        'правовий супровід'
      ],
      
      trustSlogan: 'KREDO — ваша третя сторона довіри.',
      
      metricsTitle: 'Наші цінності',
      val1Title: 'Правова чистота',
      val1Desc: 'Усі інтеграції та шаблони договорів опрацьовані провідними юристами.',
      val2Title: 'Безпека активів',
      val2Desc: 'Платіжний процес проєктується через підключених партнерів без зберігання коштів клієнтів на стороні KREDO.',
      val3Title: 'Об’єктивний арбітраж',
      val3Desc: 'Швидке вирішення спорів за участю ліцензованих медіаторів.',
    },
    en: {
      tag: 'WHO WE ARE',
      title: 'About KREDO Platform',
      subtitle: 'Technology infrastructure for clear, secure deal coordination.',
      desc1: 'KREDO is a technology platform for legally clear deal coordination between counterparties. We help reduce fraud, non-performance, and loss risks when purchasing services, digital products, and physical assets.',
      desc2: 'KREDO records deal terms, coordinates fulfillment stages, and displays payment status processed by a connected payment partner.',
      
      partnersTitle: 'Our partners',
      partnerName: 'LEXAR Law Association',
      partnerRole: 'Legal Partner of KREDO',
      partnerDesc: 'KREDO cooperates with professional legal partners to support complex and international transactions. LEXAR ensures:',
      partnerFeatures: [
        'document analysis',
        'legal expertise',
        'risk assessment',
        'legal support'
      ],
      
      trustSlogan: 'KREDO — your trusted third party.',
      
      metricsTitle: 'Our Values',
      val1Title: 'Legal Compliance',
      val1Desc: 'All system workflows and agreement structures are verified by top lawyers.',
      val2Title: 'Asset Safety',
      val2Desc: 'The payment process is designed through connected partners without KREDO storing client funds.',
      val3Title: 'Fair Arbitration',
      val3Desc: 'Swift, objective dispute mediation handled by certified experts.',
    },
    ru: {
      tag: 'КТО МЫ',
      title: 'О платформе KREDO',
      subtitle: 'Современная технологичная эскроу-инфраструктура для безопасности вашего бизнеса.',
      desc1: 'KREDO — технологическая платформа для юридически понятной координации сделок между контрагентами. Мы помогаем снизить риски мошенничества, невыполнения обязательств и денежных потерь при покупке услуг, цифровых и физических активов.',
      desc2: 'KREDO фиксирует условия сделки, координирует этапы выполнения и отображает платежный статус, который обрабатывается подключенным платежным партнером.',
      
      partnersTitle: 'Наши партнеры',
      partnerName: 'Адвокатское объединение «LEXAR»',
      partnerRole: 'Юридический партнер KREDO',
      partnerDesc: 'KREDO сотрудничает с профессиональными юридическими партнерами для сопровождения сложных и международных сделок. LEXAR обеспечивает:',
      partnerFeatures: [
        'анализ документов',
        'юридическую экспертизу',
        'оценку рисков',
        'правовое сопровождение'
      ],
      
      trustSlogan: 'KREDO — ваша третья сторона доверия.',
      
      metricsTitle: 'Наши ценности',
      val1Title: 'Правовая чистота',
      val1Desc: 'Все рабочие процессы и шаблоны договоров выверены профессиональными юристами.',
      val2Title: 'Безопасность активов',
      val2Desc: 'Платежный процесс проектируется через подключенных партнеров без хранения средств клиентов на стороне KREDO.',
      val3Title: 'Объективный арбитраж',
      val3Desc: 'Быстрое и справедливое урегулирование споров с участием независимых медиаторов.',
    }
  };

  const t = content[lang] || content.ua;

  return (
    <div className={`min-h-screen py-24 sm:py-32 transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#030303] text-stone-100' : 'bg-stone-50 text-stone-850'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header section */}
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
            {t.tag}
          </span>
          <h1 className={`text-3xl md:text-5xl font-extrabold mt-4 tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-stone-900'
          }`}>
            {t.title}
          </h1>
          <p className={`mt-3 text-xs sm:text-sm font-medium max-w-xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-stone-400' : 'text-stone-600'
          }`}>
            {t.subtitle}
          </p>
        </div>

        {/* Story Text Box */}
        <div className={`rounded-3xl p-6 sm:p-10 border mb-12 leading-relaxed text-xs sm:text-sm font-medium ${
          theme === 'dark' ? 'bg-stone-900/30 border-stone-900' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <p className="mb-4 text-stone-550">{t.desc1}</p>
          <p className="text-stone-550">{t.desc2}</p>
        </div>

        {/* Partners block (The exact LEXAR prompt requirement) */}
        <div className="mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-6 text-center">
            {t.partnersTitle}
          </h2>

          <div className={`rounded-3xl p-8 border hover:scale-[1.01] transition-all duration-300 relative overflow-hidden ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-stone-900/60 to-stone-950/80 border-stone-850 shadow-lg' 
              : 'bg-white border-stone-200 shadow-md'
          }`}>
            <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className={`p-4 rounded-2xl shrink-0 ${
                theme === 'dark' ? 'bg-stone-900 text-emerald-400 border border-stone-800' : 'bg-stone-100 text-stone-900 border border-stone-200'
              }`}>
                <Scale className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold tracking-tight ${
                  theme === 'dark' ? 'text-white' : 'text-stone-900'
                }`}>
                  {t.partnerName}
                </h3>
                <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest mt-1">
                  {t.partnerRole}
                </p>
                <p className={`mt-3 text-xs sm:text-sm leading-relaxed ${
                  theme === 'dark' ? 'text-stone-400' : 'text-stone-600'
                }`}>
                  {t.partnerDesc}
                </p>
                <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                  {t.partnerFeatures.map((feat, index) => (
                    <li key={index} className="flex items-center space-x-2 text-stone-500 font-semibold">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Values grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className={`p-6 rounded-2xl border ${
            theme === 'dark' ? 'bg-stone-900/20 border-stone-900' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>{t.val1Title}</h4>
            <p className="text-xs text-stone-500 leading-relaxed font-semibold">{t.val1Desc}</p>
          </div>
          <div className={`p-6 rounded-2xl border ${
            theme === 'dark' ? 'bg-stone-900/20 border-stone-900' : 'bg-white border-stone-205 shadow-sm'
          }`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>{t.val2Title}</h4>
            <p className="text-xs text-stone-500 leading-relaxed font-semibold">{t.val2Desc}</p>
          </div>
          <div className={`p-6 rounded-2xl border ${
            theme === 'dark' ? 'bg-stone-900/20 border-stone-900' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>{t.val3Title}</h4>
            <p className="text-xs text-stone-500 leading-relaxed font-semibold">{t.val3Desc}</p>
          </div>
        </div>

        {/* Third Party Trust Central Slogan Banner */}
        <div className="text-center py-8 border-t border-dashed border-stone-550/15">
          <p className={`text-base sm:text-lg font-black tracking-wide ${
            theme === 'dark' ? 'text-white bg-white/5' : 'text-stone-950 bg-stone-100'
          } rounded-2xl py-5 px-6 inline-block`}>
            {t.trustSlogan}
          </p>
        </div>

      </div>
    </div>
  );
}
