/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language, AppTheme } from '../types';
import LegalPage from './LegalPage';

interface DisputesPageProps {
  lang: Language;
  theme: AppTheme;
}

export default function DisputesPage({ lang, theme }: DisputesPageProps) {
  const content = {
    ua: {
      title: 'Вирішення спорів',
      sections: [
        { title: 'Подання звернення', content: 'У разі виникнення спору, ви можете подати звернення через кабінет угоди.' },
        { title: 'Розгляд ситуації', content: 'Команда арбітражу аналізує надані докази.' },
        { title: 'Юридичний аналіз', content: 'Проводиться детальний аналіз умов угоди та наданих матеріалів.' },
        { title: 'Медіація', content: 'Ми сприяємо діалогу між сторонами для досягнення домовленості.' },
        { title: 'Процес вирішення спору', content: 'Якщо діалог не допоміг, арбітр ухвалює обов’язкове рішення.' },
        { title: 'Контактна інформація', content: 'Для екстрених питань звертайтеся до нашої підтримки.' }
      ]
    },
    en: {
      title: 'Dispute Resolution',
      sections: [
        { title: 'Submitting a claim', content: 'In case of a dispute, you can submit a claim through the deal dashboard.' },
        { title: 'Situation review', content: 'The arbitration team analyzes provided evidence.' },
        { title: 'Legal analysis', content: 'A detailed analysis of deal terms and provided materials is performed.' },
        { title: 'Mediation', content: 'We facilitate dialogue between parties to reach an agreement.' },
        { title: 'Resolution process', content: 'If dialogue fails, an arbitrator makes a binding decision.' },
        { title: 'Contact information', content: 'For urgent matters, contact our support team.' }
      ]
    },
    ru: {
      title: 'Разрешение споров',
      sections: [
        { title: 'Подача обращения', content: 'В случае возникновения спора, вы можете подать обращение через кабинет сделки.' },
        { title: 'Рассмотрение ситуации', content: 'Команда арбитража анализирует предоставленные доказательства.' },
        { title: 'Юридический анализ', content: 'Проводится детальный анализ условий сделки и предоставленных материалов.' },
        { title: 'Медиация', content: 'Мы содействуем диалогу между сторонами для достижения договоренности.' },
        { title: 'Процесс разрешения спора', content: 'Если диалог не помог, арбитр принимает обязательное решение.' },
        { title: 'Контактная информация', content: 'Для экстренных вопросов обращайтесь в нашу поддержку.' }
      ]
    }
  };

  const t = content[lang] || content.ua;
  return <LegalPage lang={lang} theme={theme} title={t.title} sections={t.sections} />;
}
