import React, { useMemo } from 'react';
import {
  Bell,
  CreditCard,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Shield,
  ShieldAlert,
  User,
} from 'lucide-react';
import { AppTheme, Language, RoutePath, SystemNotification, UserProfile } from '../types';

interface AccountLayoutProps {
  children: React.ReactNode;
  currentRoute: RoutePath;
  setRoute: (route: RoutePath) => void;
  user: UserProfile;
  notifications: SystemNotification[];
  theme: AppTheme;
  lang: Language;
  profileRoleLoading?: boolean;
}

export default function AccountLayout({
  children,
  currentRoute,
  setRoute,
  user,
  notifications,
  theme,
  lang,
  profileRoleLoading = false,
}: AccountLayoutProps) {
  const unreadCount = useMemo(
    () => notifications.reduce((count, notification) => count + (notification.read ? 0 : 1), 0),
    [notifications],
  );
  const labels = useMemo(() => ({
    ua: {
      account: 'Особистий кабінет',
      dashboard: 'Панель керування',
      transactions: 'Угоди',
      createDeal: 'Створити угоду',
      verification: 'Верифікація',
      notifications: 'Сповіщення',
      profile: 'Мій профіль',
      settings: 'Налаштування',
      admin: 'Адмін-панель',
      roleLoading: 'Перевіряємо роль',
    },
    ru: {
      account: 'Личный кабинет',
      dashboard: 'Панель управления',
      transactions: 'Сделки',
      createDeal: 'Создать сделку',
      verification: 'Верификация',
      notifications: 'Уведомления',
      profile: 'Мой профиль',
      settings: 'Настройки',
      admin: 'Админ-панель',
      roleLoading: 'Проверяем роль',
    },
    en: {
      account: 'Client account',
      dashboard: 'Dashboard',
      transactions: 'Deals',
      createDeal: 'Create deal',
      verification: 'Verification',
      notifications: 'Notifications',
      profile: 'My profile',
      settings: 'Settings',
      admin: 'Admin Panel',
      roleLoading: 'Checking role',
    },
  }[lang]), [lang]);

  const items = useMemo(() => [
    { route: 'dashboard' as RoutePath, label: labels.dashboard, icon: LayoutDashboard },
    { route: 'transactions' as RoutePath, label: labels.transactions, icon: CreditCard },
    { route: 'create-deal' as RoutePath, label: labels.createDeal, icon: PlusCircle },
    { route: 'verification' as RoutePath, label: labels.verification, icon: Shield },
    { route: 'notifications' as RoutePath, label: labels.notifications, icon: Bell, badge: unreadCount },
    { route: 'profile' as RoutePath, label: labels.profile, icon: User },
    ...(user.role === 'admin'
      ? [{ route: 'admin' as RoutePath, label: labels.admin, icon: ShieldAlert }]
      : []),
    { route: 'settings' as RoutePath, label: labels.settings, icon: Settings },
  ], [labels, unreadCount, user.role]);
  const statusLabels = {
    ua: {
      'Not Started': 'Не розпочато',
      'Pending Review': 'Очікує перевірки',
      Verified: 'Підтверджено',
      Rejected: 'Відхилено',
    },
    ru: {
      'Not Started': 'Не начато',
      'Pending Review': 'Ожидает проверки',
      Verified: 'Подтверждено',
      Rejected: 'Отклонено',
    },
    en: {
      'Not Started': 'Not started',
      'Pending Review': 'Pending review',
      Verified: 'Verified',
      Rejected: 'Rejected',
    },
  }[lang];
  const displayedKycStatus = statusLabels[user.kyc_status || 'Not Started'];

  return (
    <div className={`min-h-[calc(100vh-4rem)] pt-16 ${
      theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-stone-50 text-stone-950'
    }`}>
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-7 sm:py-7 lg:px-10">
        <header className={`relative overflow-hidden rounded-[2rem] border p-5 shadow-[0_18px_60px_-36px_rgba(16,185,129,0.45)] sm:p-6 ${
          theme === 'dark'
            ? 'border-white/10 bg-[#0d0d0d]/95'
            : 'border-stone-200/80 bg-white/95'
        }`}>
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-500">{labels.account}</p>
              <p className="mt-1 truncate text-lg font-black sm:text-xl">{user.fullName || user.email}</p>
            </div>
            <div className={`hidden rounded-2xl border px-4 py-2 text-right sm:block ${
              theme === 'dark' ? 'border-stone-800 bg-stone-900/60' : 'border-stone-200 bg-stone-50'
            }`}>
              <p className="max-w-64 truncate text-xs font-semibold">{user.email}</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                {displayedKycStatus}
              </p>
            </div>
          </div>

          <nav
            className={`no-scrollbar mt-5 flex min-h-[62px] gap-2 overflow-x-auto rounded-2xl border p-2 ${
              theme === 'dark'
                ? 'border-white/[0.07] bg-black/25 shadow-inner'
                : 'border-stone-200/80 bg-stone-50/80 shadow-inner shadow-stone-200/40'
            }`}
            aria-label={labels.account}
          >
            {items.map(({ route, label, icon: Icon, badge }) => {
              const active = currentRoute === route || (route === 'settings' && currentRoute === 'security');
              return (
                <button
                  key={route}
                  type="button"
                  onClick={() => setRoute(route)}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                    active
                      ? theme === 'dark'
                        ? 'border-emerald-400/30 bg-emerald-400/12 text-emerald-200 shadow-[0_8px_24px_-14px_rgba(52,211,153,0.9)]'
                        : 'border-emerald-500/20 bg-emerald-50 text-emerald-800 shadow-[0_8px_24px_-16px_rgba(5,150,105,0.65)]'
                      : theme === 'dark'
                        ? 'border-white/[0.07] bg-white/[0.035] text-stone-400 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07] hover:text-white'
                        : 'border-stone-200/80 bg-white/80 text-stone-600 hover:-translate-y-0.5 hover:border-stone-300 hover:bg-white hover:text-stone-950 hover:shadow-sm'
                  }`}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                    active
                      ? 'bg-emerald-500/15'
                      : theme === 'dark' ? 'bg-white/[0.05]' : 'bg-stone-100'
                  }`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span>{label}</span>
                  {!!badge && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                      active ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500 text-white'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
            {profileRoleLoading && (
              <div className={`flex min-h-[44px] shrink-0 items-center rounded-full border px-4 py-2.5 text-sm font-bold ${
                theme === 'dark'
                  ? 'border-white/[0.07] bg-white/[0.025] text-stone-500'
                  : 'border-stone-200/80 bg-white/60 text-stone-400'
              }`}>
                {labels.roleLoading}
              </div>
            )}
          </nav>
        </header>

        <main id="app-main-view" className="account-content animate-fade-in py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
