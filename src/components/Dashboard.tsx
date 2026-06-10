/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Bell, ChevronRight, CircleUserRound, CreditCard, Headphones, Plus, ShieldCheck, ShieldAlert } from 'lucide-react';
import { RoutePath, Language, AppTheme, UserProfile, EscrowDeal, SystemNotification } from '../types';
import { i18nDict } from '../messages';

interface DashboardProps {
  user: UserProfile;
  deals: EscrowDeal[];
  notifications: SystemNotification[];
  setRoute: (route: RoutePath) => void;
  lang: Language;
  theme: AppTheme;
  setSelectedDealId: (id: string) => void;
}

export default function Dashboard({
  user,
  deals = [],
  notifications = [],
  setRoute,
  lang,
  theme,
}: DashboardProps) {
  const t = i18nDict[lang];
  const { activeDeals, activeVolume } = useMemo(() => {
    const active = deals.filter((deal) => !['released', 'cancelled'].includes(deal.status));
    return {
      activeDeals: active,
      activeVolume: active.reduce((sum, deal) => sum + deal.amount, 0),
    };
  }, [deals]);
  const premiumCard = theme === 'dark'
    ? 'bg-[#0d0d0d] border-white/[0.08] shadow-[0_22px_65px_-48px_rgba(52,211,153,0.35)]'
    : 'bg-white border-stone-200 shadow-[0_22px_65px_-48px_rgba(5,150,105,0.35)]';
  const copy = {
    ua: {
      subtitle: 'Керуйте угодами, верифікацією та підтримкою в одному місці.',
      statusTitle: 'Статус верифікації',
      verified: 'Особу підтверджено',
      pending: 'Верифікацію ще не завершено',
      statusAction: 'Продовжити верифікацію',
      activeTitle: 'Активні угоди',
      activeText: (count: number) => `${count} активних угод`,
      notificationsTitle: 'Останні сповіщення',
      quickTitle: 'Швидкі дії',
      create: 'Створити угоду',
      verify: 'Продовжити верифікацію',
      support: 'Звернутися до підтримки',
      transactions: 'Переглянути транзакції',
      empty: 'Нових сповіщень немає.',
      emptyText: 'Тут з’являться важливі оновлення щодо угод і верифікації.',
    },
    ru: {
      subtitle: 'Управляйте сделками, верификацией и поддержкой в одном месте.',
      statusTitle: 'Статус верификации',
      verified: 'Личность подтверждена',
      pending: 'Верификация ещё не завершена',
      statusAction: 'Продолжить верификацию',
      activeTitle: 'Активные сделки',
      activeText: (count: number) => `${count} активных сделок`,
      notificationsTitle: 'Последние уведомления',
      quickTitle: 'Быстрые действия',
      create: 'Создать сделку',
      verify: 'Продолжить верификацию',
      support: 'Обратиться в поддержку',
      transactions: 'Посмотреть транзакции',
      empty: 'Новых уведомлений нет.',
      emptyText: 'Здесь появятся важные обновления по сделкам и верификации.',
    },
    en: {
      subtitle: 'Manage deals, verification, and support in one place.',
      statusTitle: 'Verification status',
      verified: 'Identity verified',
      pending: 'Verification is not complete',
      statusAction: 'Continue verification',
      activeTitle: 'Active deals',
      activeText: (count: number) => `${count} active deals`,
      notificationsTitle: 'Latest notifications',
      quickTitle: 'Quick actions',
      create: 'Create deal',
      verify: 'Continue verification',
      support: 'Contact support',
      transactions: 'View transactions',
      empty: 'There are no new notifications.',
      emptyText: 'Important deal and verification updates will appear here.',
    },
  }[lang];

  const money = useMemo(() => new Intl.NumberFormat(
    lang === 'ua' ? 'uk-UA' : lang === 'ru' ? 'ru-RU' : 'en-US',
    {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    },
  ).format(activeVolume), [activeVolume, lang]);

  const actions = [
    { label: copy.create, route: 'create-deal' as RoutePath, icon: Plus },
    { label: copy.verify, route: 'verification' as RoutePath, icon: ShieldCheck },
    { label: copy.support, route: 'contact' as RoutePath, icon: Headphones },
    { label: copy.transactions, route: 'transactions' as RoutePath, icon: CreditCard },
  ];

  return (
    <div className={theme === 'dark' ? 'text-white' : 'text-stone-950'}>
      <div className="mx-auto max-w-[1500px] space-y-7">
        <section className={`rounded-[2rem] border p-8 shadow-sm sm:p-10 ${premiumCard}`}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <CircleUserRound className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t.dash.welcome}{user.fullName}</h1>
                <p className="mt-2 text-base text-stone-500">{copy.subtitle}</p>
              </div>
            </div>
            <button onClick={() => setRoute('profile')} className={`rounded-2xl px-6 py-3.5 text-sm font-bold transition ${
              theme === 'dark' ? 'bg-white text-black hover:bg-stone-200' : 'bg-stone-950 text-white hover:bg-stone-800'
            }`}>
              {t.profile.title}
            </button>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className={`rounded-[2rem] border p-8 shadow-sm ${premiumCard}`}>
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-stone-500">{copy.statusTitle}</p>
                <h2 className="mt-4 text-2xl font-black">{user.verified ? copy.verified : copy.pending}</h2>
              </div>
              {user.verified
                ? <ShieldCheck className="h-10 w-10 text-emerald-500" />
                : <ShieldAlert className="h-10 w-10 text-amber-500" />}
            </div>
            {!user.verified && (
              <button onClick={() => setRoute('verification')} className="mt-8 flex w-full items-center justify-between rounded-2xl bg-emerald-500 px-5 py-4 text-base font-bold text-white hover:bg-emerald-600">
                {copy.statusAction}<ChevronRight className="h-5 w-5" />
              </button>
            )}
          </section>

          <section className={`rounded-[2rem] border p-8 shadow-sm ${premiumCard}`}>
            <p className="text-sm font-bold uppercase tracking-widest text-stone-500">{copy.activeTitle}</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-4xl font-black">{money}</h2>
                <p className="mt-2 text-base text-stone-500">{copy.activeText(activeDeals.length)}</p>
              </div>
              <CreditCard className="h-10 w-10 text-emerald-500" />
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_1.9fr]">
          <section>
            <h2 className="mb-4 text-lg font-black">{copy.quickTitle}</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {actions.map(({ label, route, icon: Icon }) => (
                <button key={route} onClick={() => setRoute(route)} className={`flex items-center justify-between rounded-2xl border p-5 text-left text-base font-bold shadow-sm transition hover:border-emerald-500/50 hover:shadow-md ${premiumCard}`}>
                  <span className="flex items-center gap-4"><span className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500"><Icon className="h-5 w-5" /></span>{label}</span>
                  <ChevronRight className="h-5 w-5 text-stone-400" />
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black">{copy.notificationsTitle}</h2>
              <button onClick={() => setRoute('notifications')} className="text-sm font-bold text-emerald-500">{t.dash.viewAll}</button>
            </div>
            <div className={`rounded-[2rem] border p-6 shadow-sm ${premiumCard}`}>
              {notifications.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center text-center text-stone-500">
                  <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500"><Bell className="h-6 w-6" /></span>
                  <p className="text-lg font-black">{copy.empty}</p>
                  <p className="mt-2 max-w-sm text-sm leading-6">{copy.emptyText}</p>
                </div>
              ) : notifications.slice(0, 4).map((notification) => (
                <button key={notification.id} onClick={() => setRoute('notifications')} className={`block w-full border-b py-4 text-left last:border-0 ${
                  theme === 'dark' ? 'border-stone-800' : 'border-stone-200'
                }`}>
                  <span className="block text-base font-bold">{notification.title[lang]}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-stone-500">{notification.description[lang]}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
