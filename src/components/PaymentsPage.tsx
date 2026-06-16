/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppTheme, Language } from '../types';
import { i18nDict } from '../messages';
import { MarketplacePlatformsSection, PaymentMethodsShowcase } from './PaymentMethods';
import { ArrowRight, CircleHelp, FileCheck2, ShieldCheck } from 'lucide-react';

interface PaymentsPageProps {
  lang: Language;
  theme: AppTheme;
}

export default function PaymentsPage({ lang, theme }: PaymentsPageProps) {
  const copy = i18nDict[lang].payments;
  const cardClass = theme === 'dark'
    ? 'border-white/[0.08] bg-[#0d0d0d] text-stone-100'
    : 'border-stone-200 bg-white text-stone-950 shadow-sm';

  return (
    <div className={`pt-24 pb-16 ${theme === 'dark' ? 'text-stone-100' : 'text-stone-900'}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className={`relative overflow-hidden rounded-[2rem] border p-6 sm:p-8 ${cardClass}`}>
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent" />
          <div className="max-w-3xl">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-emerald-500">
              {copy.pageEyebrow}
            </p>
            <h1 className={`mt-3 text-3xl font-black tracking-tight sm:text-5xl ${
              theme === 'dark' ? 'text-white' : 'text-stone-950'
            }`}>
              {copy.pageTitle}
            </h1>
            <p className={`mt-4 max-w-2xl text-sm leading-7 sm:text-base ${
              theme === 'dark' ? 'text-stone-400' : 'text-stone-600'
            }`}>
              {copy.pageSubtitle}
            </p>
          </div>
        </section>

        <div className="mt-8">
          <PaymentMethodsShowcase lang={lang} theme={theme} />
        </div>

        <div className="mt-8">
          <MarketplacePlatformsSection lang={lang} theme={theme} />
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className={`rounded-[1.75rem] border p-6 ${cardClass}`}>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <FileCheck2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-emerald-500">
                  {copy.flowEyebrow}
                </p>
                <h2 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>
                  {copy.flowTitle}
                </h2>
              </div>
            </div>
            <ol className="space-y-3">
              {copy.flowSteps.map((step: string, index: number) => (
                <li key={step} className={`flex gap-3 rounded-2xl border p-4 ${
                  theme === 'dark' ? 'border-white/[0.06] bg-white/[0.025]' : 'border-stone-200 bg-stone-50'
                }`}>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">
                    {index + 1}
                  </span>
                  <span className={`text-sm font-semibold leading-6 ${
                    theme === 'dark' ? 'text-stone-300' : 'text-stone-700'
                  }`}>
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-6">
            <div className={`rounded-[1.75rem] border p-6 ${cardClass}`}>
              <div className="mb-4 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <h2 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>
                  {copy.legalTitle}
                </h2>
              </div>
              <p className={`text-sm font-semibold leading-7 ${
                theme === 'dark' ? 'text-stone-400' : 'text-stone-600'
              }`}>
                {copy.legalLong}
              </p>
            </div>

            <div className={`rounded-[1.75rem] border p-6 ${cardClass}`}>
              <div className="mb-4 flex items-center gap-3">
                <CircleHelp className="h-5 w-5 text-emerald-500" />
                <h2 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>
                  {copy.faqTitle}
                </h2>
              </div>
              <div className="space-y-3">
                {copy.faqItems.map((item: { q: string; a: string }) => (
                  <details
                    key={item.q}
                    className={`group rounded-2xl border p-4 ${
                      theme === 'dark' ? 'border-white/[0.06] bg-white/[0.025]' : 'border-stone-200 bg-stone-50/80'
                    }`}
                  >
                    <summary className={`flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-black ${
                      theme === 'dark' ? 'text-white' : 'text-stone-950'
                    }`}>
                      {item.q}
                      <ArrowRight className="h-4 w-4 shrink-0 text-emerald-500 transition-transform group-open:rotate-90" />
                    </summary>
                    <p className={`mt-3 text-sm font-medium leading-6 ${
                      theme === 'dark' ? 'text-stone-400' : 'text-stone-600'
                    }`}>
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
