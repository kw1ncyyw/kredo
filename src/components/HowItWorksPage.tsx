
import React from 'react';
import { Language, AppTheme } from '../types';
import HowItWorks from './HowItWorks';

interface HowItWorksPageProps {
  lang: Language;
  theme: AppTheme;
}

export default function HowItWorksPage({ lang, theme }: HowItWorksPageProps) {
  return (
    <div className="pt-20">
      <HowItWorks lang={lang} theme={theme} />
    </div>
  );
}
