import React from 'react';
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
}

export default function AccountLayout({
  children,
  currentRoute,
  setRoute,
  user,
  notifications,
  theme,
  lang,
}: AccountLayoutProps) {
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const labels = {
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
      admin: 'Admin panel',
    },
  }[lang];

  const items = [
    { route: 'dashboard' as RoutePath, label: labels.dashboard, icon: LayoutDashboard },
    { route: 'transactions' as RoutePath, label: labels.transactions, icon: CreditCard },
    { route: 'create-deal' as RoutePath, label: labels.createDeal, icon: PlusCircle },
    { route: 'verification' as RoutePath, label: labels.verification, icon: Shield },
    { route: 'notifications' as RoutePath, label: labels.notifications, icon: Bell, badge: unreadCount },
    { route: 'profile' as RoutePath, label: labels.profile, icon: User },
    { route: 'settings' as RoutePath, label: labels.settings, icon: Settings },
    ...(user.role === 'admin'
      ? [{ route: 'admin' as RoutePath, label: labels.admin, icon: ShieldAlert }]
      : []),
  ];
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
        <header className={`rounded-[1.75rem] border p-5 shadow-sm sm:p-6 ${
          theme === 'dark'
            ? 'border-stone-800 bg-[#0d0d0d]'
            : 'border-stone-200 bg-white'
        }`}>
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

          <nav className="no-scrollbar mt-5 flex gap-2 overflow-x-auto border-t border-stone-500/10 pt-4" aria-label={labels.account}>
            {items.map(({ route, label, icon: Icon, badge }) => {
              const active = currentRoute === route || (route === 'settings' && currentRoute === 'security');
              return (
                <button
                  key={route}
                  type="button"
                  onClick={() => setRoute(route)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    active
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm'
                      : theme === 'dark'
                        ? 'border-stone-800 bg-stone-900/70 text-stone-300 hover:border-stone-700 hover:text-white'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300 hover:bg-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  {!!badge && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                      active ? 'bg-white/20 text-white' : 'bg-rose-500 text-white'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </header>

        <main id="app-main-view" className="account-content animate-fade-in py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
