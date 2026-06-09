/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language, AppTheme } from '../types';
import { FileText } from 'lucide-react';

interface LegalPageProps {
  lang: Language;
  theme: AppTheme;
  title: string;
  sections: { title: string; content: string }[];
}

export default function LegalPage({ lang, theme, title, sections }: LegalPageProps) {
  return (
    <div className={`min-h-screen py-24 sm:py-32 transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#030303] text-stone-100' : 'bg-stone-50 text-stone-850'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h1 className={`text-3xl md:text-5xl font-extrabold mt-4 tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-stone-900'
          }`}>
            {title}
          </h1>
        </div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index} className={`rounded-3xl p-6 sm:p-8 border ${
              theme === 'dark' ? 'bg-stone-900/30 border-stone-900' : 'bg-white border-stone-200 shadow-sm'
            }`}>
              <h2 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
                {section.title}
              </h2>
              <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
