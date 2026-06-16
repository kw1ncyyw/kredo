/**
 * Free local KREDO support assistant.
 * Future AI integration must go through a trusted server endpoint or Supabase Edge Function.
 * Do not place paid AI API keys or service-role keys in frontend code.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Bot, CheckCircle2, ChevronRight, Clock, DollarSign, Headphones, MessageCircle, Send, X } from 'lucide-react';
import { AppTheme, Language, RoutePath, UserProfile } from '../types';
import { KredoData } from '../supabase';
import { i18nDict } from '../messages';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};

type SupportChatWidgetProps = {
  lang: Language;
  theme: AppTheme;
  user: UserProfile | null;
  setRoute: (route: RoutePath) => void;
};

function matchAnswer(text: string, t: typeof i18nDict.ua.supportChat) {
  const q = text.toLowerCase();
  if (/(створ|созда|create|deal|угод|сделк)/.test(q)) return t.answers.create;
  if (/(як працю|как работ|how|works|kredo)/.test(q)) return t.answers.how;
  if (/(коміс|комисс|fee|2%|процент)/.test(q)) return t.answers.fee;
  if (/(оплат|payment|visa|mastercard|apple|google|iban|sepa|swift|плат)/.test(q)) return t.answers.payment;
  if (/(kyc|вериф|verify|document|документ|паспорт)/.test(q)) return t.answers.kyc;
  if (/(акаунт|аккаунт|profile|профіл|парол|password|reset|скин|сброс)/.test(q)) return q.includes('reset') || q.includes('парол') || q.includes('password') ? t.answers.reset : t.answers.account;
  if (/(email|емейл|почт|пошт|код|otp)/.test(q)) return t.answers.email;
  if (/(спір|спор|dispute|претенз|claim)/.test(q)) return t.answers.disputes;
  if (/(годин|час|hours|agent|агент|support|підтрим|поддерж)/.test(q)) return t.answers.hours;
  return t.handoff;
}

export default function SupportChatWidget({ lang, theme, user, setRoute }: SupportChatWidgetProps) {
  const t = i18nDict[lang].supportChat;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'chat' | 'handoff'>('chat');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    topic: '',
    message: '',
  });
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', text: t.welcome },
  ]);

  useEffect(() => {
    setMessages((current) => current.map((message) => (
      message.id === 'welcome' ? { ...message, text: t.welcome } : message
    )));
    setNotice('');
  }, [t.welcome]);

  const panel = theme === 'dark'
    ? 'border-white/10 bg-[#0d0d0d] text-white shadow-[0_24px_80px_-32px_rgba(16,185,129,0.6)]'
    : 'border-stone-200 bg-white text-stone-950 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]';
  const soft = theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-stone-200 bg-stone-50';
  const muted = theme === 'dark' ? 'text-stone-400' : 'text-stone-600';

  const quickButtons = useMemo(() => [
    { label: t.createDeal, action: () => setRoute(user ? 'create-deal' : 'login') },
    { label: t.how, text: t.answers.how },
    { label: t.fee, text: t.answers.fee },
    { label: t.payment, text: t.answers.payment },
    { label: t.kyc, text: t.answers.kyc },
    { label: t.agent, action: () => setMode('handoff') },
  ], [t, setRoute, user]);

  const pushAssistant = (text: string) => {
    setMessages((current) => [...current, { id: `a-${Date.now()}`, role: 'assistant', text }]);
  };

  const ask = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages((current) => [...current, { id: `u-${Date.now()}`, role: 'user', text: clean }]);
    setInput('');
    window.setTimeout(() => pushAssistant(matchAnswer(clean, t)), 150);
  };

  const submitHandoff = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice('');
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      topic: form.topic.trim(),
      message: form.message.trim(),
    };
    if (!payload.name || !payload.email || !payload.topic || !payload.message) {
      setNotice(t.required);
      return;
    }
    setLoading(true);
    const result = await KredoData.submitSupportRequest({
      ...payload,
      userId: user?.id,
      pageUrl: window.location.href,
      chatHistory: messages.map((item) => `${item.role}: ${item.text}`).join('\n'),
    });
    setLoading(false);
    if (!result.success) {
      setNotice(t.error);
      return;
    }
    setNotice(t.success);
    setMessages((current) => [...current, { id: `a-${Date.now()}`, role: 'assistant', text: t.success }]);
    setMode('chat');
    setForm((current) => ({ ...current, topic: '', message: '' }));
  };

  return (
    <div className="fixed bottom-5 right-4 z-[70] sm:bottom-6 sm:right-6">
      {open && (
        <section className={`mb-4 flex max-h-[calc(100vh-7rem)] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-[2rem] border ${panel}`}>
          <header className="flex items-center justify-between gap-3 border-b border-stone-500/10 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-black">{t.title}</h2>
                <p className={`text-[11px] font-semibold ${muted}`}>{t.subtitle}</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className={`rounded-full border p-2 ${soft}`} aria-label={t.close}>
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm font-semibold leading-5 ${
                  message.role === 'user'
                    ? 'bg-emerald-500 text-white'
                    : theme === 'dark' ? 'bg-white/[0.06] text-stone-200' : 'bg-stone-100 text-stone-700'
                }`}>
                  {message.text}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-500/10 p-4">
            {mode === 'chat' ? (
              <>
                <div className="mb-3 flex flex-wrap gap-2">
                  {quickButtons.map((button) => (
                    <button
                      key={button.label}
                      type="button"
                      onClick={() => button.action ? button.action() : pushAssistant(button.text || '')}
                      className={`rounded-full border px-3 py-2 text-[11px] font-black transition hover:-translate-y-0.5 ${soft}`}
                    >
                      {button.label}
                    </button>
                  ))}
                </div>
                <form onSubmit={(event) => { event.preventDefault(); ask(input); }} className="flex gap-2">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={t.placeholder}
                    className={`min-h-12 flex-1 rounded-2xl border px-4 text-sm font-semibold outline-none focus:border-emerald-500 ${
                      theme === 'dark' ? 'border-white/10 bg-black/30 text-white' : 'border-stone-200 bg-white text-stone-900'
                    }`}
                  />
                  <button type="submit" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                <p className={`mt-3 flex items-center gap-2 text-[11px] font-semibold ${muted}`}>
                  <Clock className="h-3.5 w-3.5" />
                  {t.scope}
                </p>
              </>
            ) : (
              <form onSubmit={submitHandoff} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black">{t.formTitle}</h3>
                  <button type="button" onClick={() => setMode('chat')} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${soft}`}>{t.backToChat}</button>
                </div>
                <p className={`rounded-2xl border p-3 text-xs font-semibold leading-5 ${soft}`}>
                  {t.handoff}
                </p>
                {(['name', 'email', 'topic'] as const).map((field) => (
                  <input
                    key={field}
                    value={form[field]}
                    onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                    placeholder={t[field]}
                    className={`min-h-11 w-full rounded-2xl border px-4 text-sm font-semibold outline-none focus:border-emerald-500 ${
                      theme === 'dark' ? 'border-white/10 bg-black/30 text-white' : 'border-stone-200 bg-white text-stone-900'
                    }`}
                  />
                ))}
                <textarea
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  placeholder={t.message}
                  className={`min-h-24 w-full rounded-2xl border p-4 text-sm font-semibold outline-none focus:border-emerald-500 ${
                    theme === 'dark' ? 'border-white/10 bg-black/30 text-white' : 'border-stone-200 bg-white text-stone-900'
                  }`}
                />
                {notice && <p className={`rounded-2xl border p-3 text-xs font-bold ${notice === t.success ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500' : 'border-amber-500/20 bg-amber-500/10 text-amber-500'}`}>{notice}</p>}
                <button disabled={loading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 text-sm font-black text-white disabled:opacity-60">
                  {loading ? <Clock className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {t.submit}
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_18px_45px_-18px_rgba(16,185,129,0.9)] transition hover:-translate-y-1 sm:h-16 sm:w-16"
        aria-label={t.title}
      >
        {open ? <ChevronRight className="h-6 w-6" /> : <DollarSign className="h-7 w-7" />}
        <span className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/60 bg-white text-emerald-600 shadow-sm">
          <MessageCircle className="h-3.5 w-3.5" />
        </span>
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-stone-950 text-[10px] font-black text-white">
          <Headphones className="h-3 w-3" />
        </span>
      </button>
    </div>
  );
}
