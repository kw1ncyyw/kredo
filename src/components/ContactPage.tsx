/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Language, AppTheme } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import { KredoData, isSupabaseConfigured } from '../supabase';

interface ContactPageProps {
  lang: Language;
  theme: AppTheme;
}

export default function ContactPage({ lang, theme }: ContactPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General question');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Localization labels
  const data = {
    ua: {
      tag: 'КОНТАКТИ',
      title: 'Служба підтримки KREDO',
      desc: 'З усіх питань звертайтеся до служби підтримки або скористайтеся контактною формою.',
      nameLabel: 'Ваше ім’я',
      emailLabel: 'Електронна адреса',
      subLabel: 'Тема звернення',
      msgLabel: 'Повідомлення',
      subGeneral: 'Загальне питання',
      subTx: 'Підтримка транзакцій / ескроу',
      subKyc: 'Верифікація особи (KYC)',
      subLegal: 'Юридичний запит та арбітраж',
      subPartnership: 'Партнерство та інтеграція',
      submitBtn: 'Надіслати',
      infoTitle: 'Служба підтримки',
      infoEmail: 'kredo.support.ua@gmail.com',
      successTitle: 'Запит надіслано успішно!',
      successDesc: 'Дякуємо! Наш менеджер або юрист зв’яжеться з вами найближчим часом.',
      validationError: 'Перевірте всі поля та email.',
      missingKeyError: 'Контактна форма тимчасово недоступна. Зверніться до служби підтримки.',
      sendError: 'Не вдалося надіслати звернення. Спробуйте пізніше.',
      saveError: 'Не вдалося зберегти звернення. Спробуйте ще раз.',
      sending: 'Надсилання...',
      another: 'Надіслати ще одне звернення',
    },
    en: {
      tag: 'CONTACT US',
      title: 'KREDO Legal Support Desk',
      desc: 'For all questions, contact support or use the contact form.',
      nameLabel: 'Your name',
      emailLabel: 'Email address',
      subLabel: 'Inquiry type',
      msgLabel: 'Explain your deal terms or questions',
      subGeneral: 'General question',
      subTx: 'Transaction support',
      subKyc: 'Identity verification',
      subLegal: 'Legal question',
      subPartnership: 'Partnership',
      submitBtn: 'Submit Inquiry',
      infoTitle: 'Support',
      infoEmail: 'kredo.support.ua@gmail.com',
      successTitle: 'Inquiry Submitted Successfully!',
      successDesc: 'Thank you! Our support team will contact you as soon as possible.',
      validationError: 'Check all fields and the email address.',
      missingKeyError: 'The contact form is temporarily unavailable. Please contact support.',
      sendError: 'We could not send your request. Please try again later.',
      saveError: 'We could not save your request. Please try again.',
      sending: 'Sending...',
      another: 'Submit another request',
    },
    ru: {
      tag: 'КОНТАКТЫ',
      title: 'Служба поддержки KREDO',
      desc: 'По всем вопросам обращайтесь в службу поддержки или используйте контактную форму.',
      nameLabel: 'Ваше имя',
      emailLabel: 'Электронная почта',
      subLabel: 'Тип запроса',
      msgLabel: 'Опишите условия сделки или вопрос',
      subGeneral: 'Общий вопрос',
      subTx: 'Поддержка транзакций / эскроу',
      subKyc: 'Верификация личности (KYC)',
      subLegal: 'Юридический запрос',
      subPartnership: 'Партнерство и интеграция',
      submitBtn: 'Отправить запрос',
      infoTitle: 'Служба поддержки',
      infoEmail: 'kredo.support.ua@gmail.com',
      successTitle: 'Запрос успешно отправлен!',
      successDesc: 'Спасибо! Юрист дежурной смены или дежурный менеджер свяжется с вами в течение 15 минут.',
      validationError: 'Проверьте все поля и email.',
      missingKeyError: 'Контактная форма временно недоступна. Обратитесь в службу поддержки.',
      sendError: 'Не удалось отправить обращение. Попробуйте позже.',
      saveError: 'Не удалось сохранить обращение. Попробуйте ещё раз.',
      sending: 'Отправка...',
      another: 'Отправить ещё одно обращение',
    }
  };

  const t = data[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setSubmitError(t.validationError);
      return;
    }

    const accessKey = (import.meta as any).env?.VITE_WEB3FORMS_ACCESS_KEY?.trim();
    if (!accessKey) {
      setSubmitError(t.missingKeyError);
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      if (isSupabaseConfigured) {
        const saveResult = await KredoData.submitContactRequest({
          name: name.trim(),
          email: email.trim(),
          topic: subject,
          message: message.trim(),
          destination_email: 'kredo.support.ua@gmail.com',
        });
        if (!saveResult.success) {
          setSubmitError(t.saveError);
          return;
        }
      }

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          name: name.trim(),
          email: email.trim(),
          topic: subject,
          message: message.trim(),
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error('web3forms_failed');
      }
    } catch {
      setSubmitError(t.sendError);
      return;
    } finally {
      setSubmitting(false);
    }

    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs uppercase tracking-widest font-bold text-emerald-500 block mb-2">
          {t.tag}
        </span>
        <h1 className={`text-3xl md:text-5xl font-black mt-1 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
          {t.title}
        </h1>
        <p className={`mt-4 text-xs sm:text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
          {t.desc}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`rounded-xl p-6 sm:p-8 border ${
            theme === 'dark' ? 'bg-stone-900/40 border-stone-850' : 'bg-stone-50 border-stone-200'
          }`}>
            <h2 className={`text-lg font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
              {t.infoTitle}
            </h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5 text-emerald-400' : 'bg-stone-100 text-stone-900'}`}>
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                    {t.desc}
                  </p>
                  <a href="mailto:kredo.support.ua@gmail.com" className={`text-base font-bold hover:underline ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
                    {t.infoEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`rounded-xl p-6 sm:p-8 border shadow-xl ${
                  theme === 'dark' ? 'bg-stone-900/40 border-stone-850' : 'bg-white border-stone-200'
                }`}
              >
                <div className="space-y-5">
                  {submitError && (
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-500">
                      {submitError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                        {t.nameLabel}
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full rounded-xl border px-3.5 py-3 text-sm font-semibold focus:outline-none focus:ring-1 ${
                          theme === 'dark'
                            ? 'bg-stone-950 border-stone-800 text-white focus:border-white focus:ring-white/20'
                            : 'bg-white border-stone-200 text-stone-900 focus:border-stone-900 focus:ring-stone-900/10'
                        }`}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                        {t.emailLabel}
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full rounded-xl border px-3.5 py-3 text-sm font-semibold focus:outline-none focus:ring-1 ${
                          theme === 'dark'
                            ? 'bg-stone-950 border-stone-800 text-white focus:border-white focus:ring-white/20'
                            : 'bg-white border-stone-200 text-stone-900 focus:border-stone-900 focus:ring-stone-900/10'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Subject Dropdown */}
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                      {t.subLabel}
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-3 text-sm font-semibold focus:outline-none focus:ring-1 ${
                        theme === 'dark'
                          ? 'bg-stone-950 border-stone-800 text-white focus:border-white focus:ring-white/20'
                          : 'bg-white border-stone-200 text-stone-900 focus:border-stone-900 focus:ring-stone-900/10'
                      }`}
                    >
                      <option value="General question" className={theme === 'dark' ? 'bg-stone-950' : ''}>{t.subGeneral}</option>
                      <option value="Transaction support" className={theme === 'dark' ? 'bg-stone-950' : ''}>{t.subTx}</option>
                      <option value="Identity verification" className={theme === 'dark' ? 'bg-stone-950' : ''}>{t.subKyc}</option>
                      <option value="Legal question" className={theme === 'dark' ? 'bg-stone-950' : ''}>{t.subLegal}</option>
                      <option value="Partnership" className={theme === 'dark' ? 'bg-stone-950' : ''}>{t.subPartnership}</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                      {t.msgLabel}
                    </label>
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className={`w-full rounded-xl border px-3.5 py-3 text-sm font-medium focus:outline-none focus:ring-1 ${
                        theme === 'dark'
                          ? 'bg-stone-950 border-stone-800 text-white focus:border-white focus:ring-white/20'
                          : 'bg-white border-stone-200 text-stone-900 focus:border-stone-900 focus:ring-stone-900/10'
                      }`}
                    />
                  </div>

                  {/* CTA button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold border transition-all duration-350 shadow-sm flex items-center justify-center space-x-2.5 cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-white text-black hover:bg-stone-205 border-white font-black'
                        : 'bg-black text-white hover:bg-stone-900 border-black'
                    }`}
                  >
                    <span>{submitting ? t.sending : t.submitBtn}</span>
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-xl p-8 border text-center ${
                  theme === 'dark' ? 'bg-stone-900/40 border-stone-850' : 'bg-white border-stone-200'
                }`}
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-500">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                </div>
                <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
                  {t.successTitle}
                </h3>
                <p className={`text-sm leading-relaxed max-w-md mx-auto mb-6 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-605'}`}>
                  {t.successDesc}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                    theme === 'dark' ? 'bg-stone-800 text-stone-200 hover:bg-stone-700' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {t.another}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
