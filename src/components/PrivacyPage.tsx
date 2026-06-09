/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language, AppTheme } from '../types';
import LegalPage from './LegalPage';

interface PrivacyPageProps {
  lang: Language;
  theme: AppTheme;
}

export default function PrivacyPage({ lang, theme }: PrivacyPageProps) {
  const content = {
    ua: {
      title: 'Конфіденційність',
      sections: [
        { title: 'Які дані збираються', content: 'Ми збираємо персональні дані, необхідні для верифікації та забезпечення безпеки угод.' },
        { title: 'Як використовуються дані', content: 'Дані використовуються виключно для цілей платформи KREDO.' },
        { title: 'Захист персональної інформації', content: 'Ваші дані зберігаються на захищених серверах за найвищими стандартами безпеки.' },
        { title: 'Cookies', content: 'Ми використовуємо cookies для покращення роботи платформи.' },
        { title: 'Передача даних третім сторонам', content: 'Дані не передаються третім сторонам, окрім випадків, передбачених законодавством.' },
        { title: 'Права користувача', content: 'Ви маєте право на доступ до своїх даних, виправлення або видалення.' }
      ]
    },
    en: {
      title: 'Privacy Policy',
      sections: [
        { title: 'What data is collected', content: 'We collect personal data necessary for verification and securing transactions.' },
        { title: 'How data is used', content: 'Data is used exclusively for the purposes of the KREDO platform.' },
        { title: 'Protection of personal information', content: 'Your data is stored on secure servers with the highest security standards.' },
        { title: 'Cookies', content: 'We use cookies to improve platform functionality.' },
        { title: 'Transfer of data to third parties', content: 'Data will not be transferred to third parties, except as required by law.' },
        { title: 'User rights', content: 'You have the right to access, correct, or delete your data.' }
      ]
    },
    ru: {
      title: 'Конфиденциальность',
      sections: [
        { title: 'Какие данные собираются', content: 'Мы собираем персональные данные, необходимые для верификации и обеспечения безопасности сделок.' },
        { title: 'Как используются данные', content: 'Данные используются исключительно для целей платформы KREDO.' },
        { title: 'Защита персональной информации', content: 'Ваши данные хранятся на защищенных серверах по самым высоким стандартам безопасности.' },
        { title: 'Cookies', content: 'Мы используем cookies для улучшения работы платформы.' },
        { title: 'Передача данных третьим сторонам', content: 'Данные не передаются третьим сторонам, кроме случаев, предусмотренных законодательством.' },
        { title: 'Права пользователя', content: 'Вы имеет право на доступ к своим данным, исправление или удаление.' }
      ]
    }
  };

  const t = content[lang] || content.ua;
  return <LegalPage lang={lang} theme={theme} title={t.title} sections={t.sections} />;
}
