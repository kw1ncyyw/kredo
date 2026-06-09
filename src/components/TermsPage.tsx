/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language, AppTheme } from '../types';
import LegalPage from './LegalPage';

interface TermsPageProps {
  lang: Language;
  theme: AppTheme;
}

export default function TermsPage({ lang, theme }: TermsPageProps) {
  const content = {
    ua: {
      title: 'Умови використання',
      sections: [
        { title: 'Загальні положення', content: 'Ці Умови регулюють використання платформи KREDO. Використовуючи сервіс, ви погоджуєтеся з цими правилами.' },
        { title: 'Правила використання платформи', content: 'Користувач зобов’язується використовувати KREDO виключно для законних фінансових операцій.' },
        { title: 'Права та обов’язки сторін', content: 'Сторони несуть відповідальність за достовірність наданої інформації та виконання зобов’язань за угодами.' },
        { title: 'Обмеження відповідальності', content: 'KREDO діє як ескроу-агент і не несе відповідальності за якість товарів чи послуг, наданих сторонами.' },
        { title: 'Безпека акаунта', content: 'Користувач несе відповідальність за безпеку свого логіна та пароля.' },
        { title: 'Порядок використання сервісу', content: 'Компанія залишає за собою право змінювати правила користування сервісом з попереднім повідомленням.' }
      ]
    },
    en: {
      title: 'Terms of Use',
      sections: [
        { title: 'General Provisions', content: 'These Terms govern the use of the KREDO platform. By using the service, you agree to these rules.' },
        { title: 'Rules of Platform Use', content: 'The user agrees to use KREDO exclusively for legal financial transactions.' },
        { title: 'Rights and Obligations of Parties', content: 'Parties are responsible for the truthfulness of provided information and fulfillment of deal obligations.' },
        { title: 'Limitation of Liability', content: 'KREDO acts as an escrow agent and is not responsible for the quality of goods or services provided by the parties.' },
        { title: 'Account Security', content: 'The user is responsible for preserving the security of their login and password.' },
        { title: 'Order of Service Use', content: 'The company reserves the right to change the rules of using the service with prior notice.' }
      ]
    },
    ru: {
      title: 'Условия использования',
      sections: [
        { title: 'Общие положения', content: 'Настоящие Условия регулируют использование платформы KREDO. Используя сервис, вы соглашаетесь с данными правилами.' },
        { title: 'Правила использования платформы', content: 'Пользователь обязуется использовать KREDO исключительно для законных финансовых операций.' },
        { title: 'Права и обязанности сторон', content: 'Стороны несут ответственность за достоверность предоставленной информации и выполнение обязательств по сделкам.' },
        { title: 'Ограничение ответственности', content: 'KREDO действует как эскроу-агент и не несет ответственности за качество товаров или услуг, предоставленных сторонами.' },
        { title: 'Безопасность аккаунта', content: 'Пользователь несет ответственность за безопасность своего логина и пароля.' },
        { title: 'Порядок использования сервиса', content: 'Компания оставляет за собой право изменять правила использования сервиса с предварительным уведомлением.' }
      ]
    }
  };

  const t = content[lang] || content.ua;
  return <LegalPage lang={lang} theme={theme} title={t.title} sections={t.sections} />;
}
