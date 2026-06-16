/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AppTheme, Language, RoutePath, SystemNotification, UserProfile } from '../types';
import {
  Bell,
  Check,
  ChevronRight,
  ClipboardList,
  FileCheck2,
  LayoutDashboard,
  Mail,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { KredoData, isAdminProfileRole, isSupabaseConfigured } from '../supabase';

interface AdminPanelProps {
  user: UserProfile;
  lang: Language;
  theme: AppTheme;
  setRoute: (route: RoutePath) => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  notifications: SystemNotification[];
}

type AdminTab = 'overview' | 'users' | 'deals' | 'kyc' | 'contacts' | 'notifications' | 'settings';

type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: NonNullable<UserProfile['role']>;
  kycStatus: string;
  emailVerified?: boolean;
  createdAt: string;
};

type AdminDeal = {
  id: string;
  buyer: string;
  seller: string;
  title: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
};

type AdminKyc = {
  id: string | number;
  user_id: string;
  full_name: string;
  email: string;
  status: 'Not Started' | 'Pending Review' | 'Verified' | 'Rejected';
  document_front_url?: string;
  selfie_url?: string;
  admin_notes?: string;
  created_at: string;
};

type AdminContact = {
  id: string | number;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: 'pending' | 'resolved';
  created_at: string;
};

const copy = {
  ua: {
    title: 'Адмін-панель KREDO',
    subtitle: 'Окремий простір для перегляду користувачів, угод, KYC та звернень.',
    accessDenied: 'Доступ заборонено',
    accessText: 'Цей розділ доступний лише адміністраторам KREDO.',
    back: 'Повернутися в кабінет',
    overview: 'Огляд',
    users: 'Користувачі',
    deals: 'Угоди',
    kyc: 'KYC-заявки',
    contacts: 'Звернення',
    notifications: 'Сповіщення',
    settings: 'Налаштування',
    totalUsers: 'Користувачі',
    totalDeals: 'Угоди',
    pendingKyc: 'KYC на перевірці',
    pendingContacts: 'Нові звернення',
    recentActivity: 'Остання активність',
    search: 'Пошук за email, іменем або статусом',
    email: 'Email',
    fullName: 'Ім’я',
    role: 'Роль',
    verification: 'Верифікація',
    createdAt: 'Створено',
    openProfile: 'Профіль',
    buyer: 'Покупець',
    seller: 'Продавець',
    amount: 'Сума',
    status: 'Статус',
    openDetails: 'Деталі',
    submitted: 'Подано',
    review: 'Перегляд',
    approve: 'Підтвердити',
    reject: 'Відхилити',
    notes: 'Коментар адміністратора',
    notesPlaceholder: 'Коротко опишіть рішення або причину відхилення',
    topic: 'Тема',
    message: 'Повідомлення',
    markResolved: 'Позначити вирішеним',
    restorePending: 'Повернути в роботу',
    adminOnly: 'Роль адміністратора призначається вручну в Supabase profiles.role.',
    dataNote: 'Дані доступні через RLS-політики тільки для адміністраторів.',
    empty: 'Нічого не знайдено',
    loadError: 'Не вдалося завантажити частину адмін-даних.',
    settingsText: 'Тут зібрані службові правила: RLS, приватний KYC bucket, ручне призначення admin-role та перевірка Vercel env vars.',
  },
  en: {
    title: 'KREDO Admin Panel',
    subtitle: 'A separate workspace for users, deals, KYC requests, and contact submissions.',
    accessDenied: 'Access denied',
    accessText: 'This area is available only to KREDO administrators.',
    back: 'Back to account',
    overview: 'Overview',
    users: 'Users',
    deals: 'Deals',
    kyc: 'KYC requests',
    contacts: 'Contact requests',
    notifications: 'Notifications',
    settings: 'Settings',
    totalUsers: 'Users',
    totalDeals: 'Deals',
    pendingKyc: 'Pending KYC',
    pendingContacts: 'Pending contacts',
    recentActivity: 'Recent activity',
    search: 'Search by email, name, or status',
    email: 'Email',
    fullName: 'Full name',
    role: 'Role',
    verification: 'Verification',
    createdAt: 'Created',
    openProfile: 'Profile',
    buyer: 'Buyer',
    seller: 'Seller',
    amount: 'Amount',
    status: 'Status',
    openDetails: 'Details',
    submitted: 'Submitted',
    review: 'Review',
    approve: 'Approve',
    reject: 'Reject',
    notes: 'Admin notes',
    notesPlaceholder: 'Briefly describe the decision or rejection reason',
    topic: 'Topic',
    message: 'Message',
    markResolved: 'Mark resolved',
    restorePending: 'Return to pending',
    adminOnly: 'Admin role is assigned manually in Supabase profiles.role.',
    dataNote: 'Data is available only to administrators through RLS policies.',
    empty: 'Nothing found',
    loadError: 'Could not load part of the admin data.',
    settingsText: 'Service checklist: RLS, private KYC bucket, manual admin-role assignment, and Vercel env var review.',
  },
  ru: {
    title: 'Админ-панель KREDO',
    subtitle: 'Отдельное пространство для пользователей, сделок, KYC и обращений.',
    accessDenied: 'Доступ запрещен',
    accessText: 'Этот раздел доступен только администраторам KREDO.',
    back: 'Вернуться в кабинет',
    overview: 'Обзор',
    users: 'Пользователи',
    deals: 'Сделки',
    kyc: 'KYC-заявки',
    contacts: 'Обращения',
    notifications: 'Уведомления',
    settings: 'Настройки',
    totalUsers: 'Пользователи',
    totalDeals: 'Сделки',
    pendingKyc: 'KYC на проверке',
    pendingContacts: 'Новые обращения',
    recentActivity: 'Последняя активность',
    search: 'Поиск по email, имени или статусу',
    email: 'Email',
    fullName: 'Имя',
    role: 'Роль',
    verification: 'Верификация',
    createdAt: 'Создано',
    openProfile: 'Профиль',
    buyer: 'Покупатель',
    seller: 'Продавец',
    amount: 'Сумма',
    status: 'Статус',
    openDetails: 'Детали',
    submitted: 'Подано',
    review: 'Проверка',
    approve: 'Подтвердить',
    reject: 'Отклонить',
    notes: 'Комментарий администратора',
    notesPlaceholder: 'Кратко опишите решение или причину отклонения',
    topic: 'Тема',
    message: 'Сообщение',
    markResolved: 'Отметить решенным',
    restorePending: 'Вернуть в работу',
    adminOnly: 'Роль администратора назначается вручную в Supabase profiles.role.',
    dataNote: 'Данные доступны только администраторам через RLS-политики.',
    empty: 'Ничего не найдено',
    loadError: 'Не удалось загрузить часть админ-данных.',
    settingsText: 'Служебный чеклист: RLS, приватный KYC bucket, ручное назначение admin-role и проверка Vercel env vars.',
  },
};

const fallbackUsers: AdminUser[] = [
  { id: 'user-1', email: 'buyer@example.com', fullName: 'Demo Buyer', role: 'user', kycStatus: 'Pending Review', emailVerified: true, createdAt: '2026-06-08' },
  { id: 'user-2', email: 'seller@example.com', fullName: 'Demo Seller', role: 'user', kycStatus: 'Not Started', emailVerified: false, createdAt: '2026-06-10' },
];

const fallbackDeals: AdminDeal[] = [
  { id: 'deal-1001', buyer: 'buyer@example.com', seller: 'seller@example.com', title: 'Website source code transfer', amount: 2500, currency: 'USD', status: 'created', createdAt: '2026-06-12' },
  { id: 'deal-1002', buyer: 'client@example.com', seller: 'agency@example.com', title: 'Marketing service package', amount: 42000, currency: 'UAH', status: 'delivered', createdAt: '2026-06-14' },
];

const fallbackKyc: AdminKyc[] = [
  { id: 'kyc-1', user_id: 'user-1', full_name: 'Demo Buyer', email: 'buyer@example.com', status: 'Pending Review', document_front_url: 'user-1/document.png', selfie_url: 'user-1/selfie.png', created_at: '2026-06-12T12:00:00Z' },
];

const fallbackContacts: AdminContact[] = [
  { id: 'contact-1', name: 'Олена', email: 'olena@example.com', topic: 'Transaction support', message: 'Потрібна допомога з умовами угоди.', status: 'pending', created_at: '2026-06-15T09:00:00Z' },
];

function formatDate(value?: string) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(amount || 0);
}

function statusClass(theme: AppTheme, status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('verified') || normalized.includes('resolved') || normalized.includes('released')) {
    return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  }
  if (normalized.includes('reject') || normalized.includes('disputed')) {
    return 'bg-red-500/10 text-red-500 border-red-500/20';
  }
  if (normalized.includes('pending') || normalized.includes('created')) {
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  }
  return theme === 'dark'
    ? 'bg-white/5 text-stone-300 border-white/10'
    : 'bg-stone-100 text-stone-600 border-stone-200';
}

export default function AdminPanel({
  user,
  lang,
  theme,
  setRoute,
  updateProfile,
  notifications,
}: AdminPanelProps) {
  const t = copy[lang];
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [search, setSearch] = useState('');
  const [loadError, setLoadError] = useState('');
  const [users, setUsers] = useState<AdminUser[]>(fallbackUsers);
  const [deals] = useState<AdminDeal[]>(fallbackDeals);
  const [kycRequests, setKycRequests] = useState<AdminKyc[]>(fallbackKyc);
  const [contacts, setContacts] = useState<AdminContact[]>(fallbackContacts);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const isAdmin = isAdminProfileRole(user.role);

  useEffect(() => {
    if (!isSupabaseConfigured || !isAdmin) return;
    let active = true;
    KredoData.listAdminData().then((result) => {
      if (!active) return;
      if (!result.success) {
        setLoadError(result.error || t.loadError);
        return;
      }
      setUsers((result.profiles || []).map((profile: any) => ({
        id: profile.id,
        email: profile.email || '',
        fullName: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email || '—',
        role: isAdminProfileRole(profile.role) ? 'admin' : 'user',
        kycStatus: profile.kyc_status || 'Not Started',
        emailVerified: profile.email_verified,
        createdAt: profile.created_at || '',
      })));
      setKycRequests(result.kyc || []);
      setContacts(result.contacts || []);
      setLoadError('');
    });
    return () => {
      active = false;
    };
  }, [isAdmin, t.loadError]);

  const query = search.trim().toLowerCase();
  const filteredUsers = useMemo(() => users.filter((item) => (
    !query || `${item.email} ${item.fullName} ${item.role} ${item.kycStatus}`.toLowerCase().includes(query)
  )), [query, users]);
  const filteredDeals = useMemo(() => deals.filter((item) => (
    !query || `${item.id} ${item.buyer} ${item.seller} ${item.title} ${item.status}`.toLowerCase().includes(query)
  )), [deals, query]);
  const filteredKyc = useMemo(() => kycRequests.filter((item) => (
    !query || `${item.full_name} ${item.email} ${item.status}`.toLowerCase().includes(query)
  )), [kycRequests, query]);
  const filteredContacts = useMemo(() => contacts.filter((item) => (
    !query || `${item.name} ${item.email} ${item.topic} ${item.status}`.toLowerCase().includes(query)
  )), [contacts, query]);

  const pendingKyc = kycRequests.filter((item) => item.status === 'Pending Review').length;
  const pendingContacts = contacts.filter((item) => item.status === 'pending').length;

  const activity = [
    ...kycRequests.slice(0, 3).map((item) => ({
      id: `kyc-${item.id}`,
      title: `${t.kyc}: ${item.full_name || item.email}`,
      meta: `${item.status} · ${formatDate(item.created_at)}`,
    })),
    ...contacts.slice(0, 3).map((item) => ({
      id: `contact-${item.id}`,
      title: `${t.contacts}: ${item.topic}`,
      meta: `${item.email} · ${formatDate(item.created_at)}`,
    })),
    ...notifications.slice(0, 3).map((item) => ({
      id: `notification-${item.id}`,
      title: item.title?.[lang] || item.title?.ua || '',
      meta: item.time || item.type,
    })),
  ].slice(0, 6);

  const approveKyc = async (request: AdminKyc) => {
    const note = notes[String(request.id)]?.trim() || (lang === 'ua' ? 'Документи перевірено.' : lang === 'ru' ? 'Документы проверены.' : 'Documents reviewed.');
    if (isSupabaseConfigured) {
      const result = await KredoData.reviewKyc({ id: request.id, userId: request.user_id, status: 'Verified', note });
      if (!result.success) {
        setLoadError(result.error || t.loadError);
        return;
      }
    }
    setKycRequests((current) => current.map((item) => item.id === request.id ? { ...item, status: 'Verified', admin_notes: note } : item));
    setUsers((current) => current.map((item) => item.id === request.user_id ? { ...item, kycStatus: 'Verified' } : item));
    if (request.user_id === user.id) updateProfile({ verified: true, kyc_status: 'Verified', kyc_notes: note });
  };

  const rejectKyc = async (request: AdminKyc) => {
    const note = notes[String(request.id)]?.trim();
    if (!note) {
      setLoadError(t.notesPlaceholder);
      return;
    }
    if (isSupabaseConfigured) {
      const result = await KredoData.reviewKyc({ id: request.id, userId: request.user_id, status: 'Rejected', note });
      if (!result.success) {
        setLoadError(result.error || t.loadError);
        return;
      }
    }
    setKycRequests((current) => current.map((item) => item.id === request.id ? { ...item, status: 'Rejected', admin_notes: note } : item));
    setUsers((current) => current.map((item) => item.id === request.user_id ? { ...item, kycStatus: 'Rejected' } : item));
    if (request.user_id === user.id) updateProfile({ verified: false, kyc_status: 'Rejected', kyc_notes: note });
  };

  const toggleContact = async (request: AdminContact) => {
    const next = request.status === 'pending' ? 'resolved' : 'pending';
    if (isSupabaseConfigured) {
      const result = await KredoData.updateContactStatus(request.id, next);
      if (!result.success) {
        setLoadError(result.error || t.loadError);
        return;
      }
    }
    setContacts((current) => current.map((item) => item.id === request.id ? { ...item, status: next } : item));
  };

  const openKycFile = async (path?: string) => {
    if (!path) return;
    if (!isSupabaseConfigured) {
      setLoadError(path);
      return;
    }
    const url = await KredoData.createSignedKycUrl(path);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shell = theme === 'dark' ? 'bg-[#080808] text-stone-100' : 'bg-stone-50 text-stone-900';
  const card = theme === 'dark'
    ? 'border-white/[0.08] bg-[#101010]'
    : 'border-stone-200 bg-white shadow-sm';
  const muted = theme === 'dark' ? 'text-stone-400' : 'text-stone-600';
  const tableHead = theme === 'dark' ? 'bg-white/[0.03] text-stone-400' : 'bg-stone-50 text-stone-500';

  if (!isAdmin) {
    return (
      <div className={`min-h-[50vh] px-4 py-10 ${shell}`}>
        <div className={`mx-auto max-w-lg rounded-[2rem] border p-8 text-center ${card}`}>
          <ShieldAlert className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="mt-4 text-2xl font-black">{t.accessDenied}</h1>
          <p className={`mt-2 text-sm ${muted}`}>{t.accessText}</p>
          <button onClick={() => setRoute('dashboard')} className="mt-6 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white">
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  const tabs: Array<{ key: AdminTab; label: string; icon: React.ElementType; count?: number }> = [
    { key: 'overview', label: t.overview, icon: LayoutDashboard },
    { key: 'users', label: t.users, icon: Users, count: users.length },
    { key: 'deals', label: t.deals, icon: ClipboardList, count: deals.length },
    { key: 'kyc', label: t.kyc, icon: FileCheck2, count: pendingKyc },
    { key: 'contacts', label: t.contacts, icon: Mail, count: pendingContacts },
    { key: 'notifications', label: t.notifications, icon: Bell },
    { key: 'settings', label: t.settings, icon: Settings },
  ];

  const renderEmpty = () => (
    <div className={`rounded-3xl border p-10 text-center ${card}`}>
      <p className={`text-sm font-semibold ${muted}`}>{t.empty}</p>
    </div>
  );

  return (
    <div className={`min-h-[60vh] ${shell}`}>
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <header className={`rounded-[2rem] border p-6 sm:p-8 ${card}`}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-emerald-500">Backoffice</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">{t.title}</h1>
              <p className={`mt-2 max-w-2xl text-sm leading-6 ${muted}`}>{t.subtitle}</p>
            </div>
            <button onClick={() => setRoute('dashboard')} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold ${
              theme === 'dark' ? 'border-white/10 bg-white/[0.04] text-white' : 'border-stone-200 bg-stone-50 text-stone-900'
            }`}>
              {t.back}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        {loadError && (
          <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-500">
            {loadError}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className={`rounded-[2rem] border p-3 ${card}`}>
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.key);
                      setSearch('');
                    }}
                    className={`flex min-h-12 w-full items-center justify-between rounded-2xl px-4 text-sm font-bold transition-all ${
                      active
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : theme === 'dark'
                          ? 'text-stone-400 hover:bg-white/[0.04] hover:text-white'
                          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </span>
                    {typeof tab.count === 'number' && tab.count > 0 && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? 'bg-white/20' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="space-y-6">
            {activeTab !== 'overview' && activeTab !== 'settings' && (
              <div className={`rounded-[1.5rem] border p-4 ${card}`}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t.search}
                    className={`min-h-12 w-full rounded-2xl border pl-11 pr-4 text-sm font-semibold outline-none ${
                      theme === 'dark' ? 'border-white/10 bg-black/20 text-white' : 'border-stone-200 bg-stone-50 text-stone-900'
                    }`}
                  />
                </div>
              </div>
            )}

            {activeTab === 'overview' && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: t.totalUsers, value: users.length, icon: Users },
                    { label: t.totalDeals, value: deals.length, icon: ClipboardList },
                    { label: t.pendingKyc, value: pendingKyc, icon: FileCheck2 },
                    { label: t.pendingContacts, value: pendingContacts, icon: Mail },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className={`rounded-[1.5rem] border p-5 ${card}`}>
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-extrabold uppercase tracking-widest ${muted}`}>{item.label}</p>
                          <Icon className="h-5 w-5 text-emerald-500" />
                        </div>
                        <p className="mt-4 text-3xl font-black">{item.value}</p>
                      </div>
                    );
                  })}
                </div>
                <section className={`rounded-[2rem] border p-6 ${card}`}>
                  <h2 className="text-xl font-black">{t.recentActivity}</h2>
                  <div className="mt-5 space-y-3">
                    {activity.length ? activity.map((item) => (
                      <div key={item.id} className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/[0.06] bg-white/[0.025]' : 'border-stone-200 bg-stone-50'}`}>
                        <p className="text-sm font-bold">{item.title}</p>
                        <p className={`mt-1 text-xs ${muted}`}>{item.meta}</p>
                      </div>
                    )) : renderEmpty()}
                  </div>
                </section>
              </>
            )}

            {activeTab === 'users' && (
              <section className={`overflow-hidden rounded-[2rem] border ${card}`}>
                <TableHeader columns={[t.email, t.fullName, t.role, t.verification, t.createdAt, '']} className={tableHead} />
                {filteredUsers.length ? filteredUsers.map((item) => (
                  <Row key={item.id}>
                    <Cell>{item.email}</Cell>
                    <Cell>{item.fullName}</Cell>
                    <Cell><Badge theme={theme} status={item.role} /></Cell>
                    <Cell><Badge theme={theme} status={item.kycStatus} /></Cell>
                    <Cell>{formatDate(item.createdAt)}</Cell>
                    <Cell><button onClick={() => setRoute('profile')} className="text-xs font-bold text-emerald-500">{t.openProfile}</button></Cell>
                  </Row>
                )) : renderEmpty()}
              </section>
            )}

            {activeTab === 'deals' && (
              <section className={`overflow-hidden rounded-[2rem] border ${card}`}>
                <TableHeader columns={[t.deals, t.buyer, t.seller, t.amount, t.status, t.createdAt]} className={tableHead} />
                {filteredDeals.length ? filteredDeals.map((item) => (
                  <Row key={item.id}>
                    <Cell>
                      <span className="font-black">{item.id}</span>
                      <span className={`mt-1 block text-xs ${muted}`}>{item.title}</span>
                      <button onClick={() => setRoute('transactions')} className="mt-2 text-xs font-bold text-emerald-500">{t.openDetails}</button>
                    </Cell>
                    <Cell>{item.buyer}</Cell>
                    <Cell>{item.seller}</Cell>
                    <Cell>{formatMoney(item.amount, item.currency)}</Cell>
                    <Cell><Badge theme={theme} status={item.status} /></Cell>
                    <Cell>{formatDate(item.createdAt)}</Cell>
                  </Row>
                )) : renderEmpty()}
              </section>
            )}

            {activeTab === 'kyc' && (
              <div className="space-y-4">
                {filteredKyc.length ? filteredKyc.map((item) => (
                  <section key={item.id} className={`rounded-[2rem] border p-5 ${card}`}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-black">{item.full_name || item.email}</h3>
                          <Badge theme={theme} status={item.status} />
                        </div>
                        <p className={`mt-1 text-sm ${muted}`}>{item.email} · {t.submitted}: {formatDate(item.created_at)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => openKycFile(item.document_front_url)} className="rounded-xl border border-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-500">{t.review}</button>
                        <button onClick={() => approveKyc(item)} className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white"><Check className="mr-1 inline h-3 w-3" />{t.approve}</button>
                        <button onClick={() => rejectKyc(item)} className="rounded-xl bg-red-500 px-3 py-2 text-xs font-bold text-white"><X className="mr-1 inline h-3 w-3" />{t.reject}</button>
                      </div>
                    </div>
                    <textarea
                      value={notes[String(item.id)] || item.admin_notes || ''}
                      onChange={(event) => setNotes((current) => ({ ...current, [String(item.id)]: event.target.value }))}
                      placeholder={t.notesPlaceholder}
                      className={`mt-4 min-h-24 w-full rounded-2xl border p-4 text-sm outline-none ${
                        theme === 'dark' ? 'border-white/10 bg-black/20 text-white' : 'border-stone-200 bg-stone-50 text-stone-900'
                      }`}
                    />
                  </section>
                )) : renderEmpty()}
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="space-y-4">
                {filteredContacts.length ? filteredContacts.map((item) => (
                  <section key={item.id} className={`rounded-[2rem] border p-5 ${card}`}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-black">{item.name}</h3>
                          <Badge theme={theme} status={item.status} />
                        </div>
                        <p className={`mt-1 text-sm ${muted}`}>{item.email} · {t.topic}: {item.topic} · {formatDate(item.created_at)}</p>
                      </div>
                      <button onClick={() => toggleContact(item)} className={`rounded-xl px-4 py-2 text-xs font-bold ${
                        item.status === 'pending' ? 'bg-emerald-500 text-white' : theme === 'dark' ? 'bg-white/10 text-white' : 'bg-stone-100 text-stone-800'
                      }`}>
                        {item.status === 'pending' ? t.markResolved : t.restorePending}
                      </button>
                    </div>
                    <p className={`mt-4 rounded-2xl border p-4 text-sm leading-6 ${theme === 'dark' ? 'border-white/[0.06] bg-white/[0.025] text-stone-300' : 'border-stone-200 bg-stone-50 text-stone-700'}`}>
                      {item.message}
                    </p>
                  </section>
                )) : renderEmpty()}
              </div>
            )}

            {activeTab === 'notifications' && (
              <section className={`rounded-[2rem] border p-6 ${card}`}>
                <h2 className="text-xl font-black">{t.notifications}</h2>
                <div className="mt-5 space-y-3">
                  {activity.length ? activity.map((item) => (
                    <div key={item.id} className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/[0.06] bg-white/[0.025]' : 'border-stone-200 bg-stone-50'}`}>
                      <p className="text-sm font-bold">{item.title}</p>
                      <p className={`mt-1 text-xs ${muted}`}>{item.meta}</p>
                    </div>
                  )) : renderEmpty()}
                </div>
              </section>
            )}

            {activeTab === 'settings' && (
              <section className={`rounded-[2rem] border p-6 ${card}`}>
                <h2 className="text-xl font-black">{t.settings}</h2>
                <p className={`mt-3 text-sm leading-6 ${muted}`}>{t.settingsText}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[t.adminOnly, t.dataNote].map((item) => (
                    <div key={item} className={`rounded-2xl border p-4 text-sm font-semibold ${theme === 'dark' ? 'border-white/[0.06] bg-white/[0.025] text-stone-300' : 'border-stone-200 bg-stone-50 text-stone-700'}`}>
                      <ShieldCheck className="mb-3 h-5 w-5 text-emerald-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function Badge({ theme, status }: { theme: AppTheme; status: string }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${statusClass(theme, status)}`}>
      {status}
    </span>
  );
}

function TableHeader({ columns, className }: { columns: string[]; className: string }) {
  return (
    <div className={`hidden grid-cols-6 gap-4 border-b px-5 py-3 text-[10px] font-black uppercase tracking-widest lg:grid ${className}`}>
      {columns.map((column) => <span key={column}>{column}</span>)}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-3 border-b border-stone-500/10 px-5 py-4 text-sm last:border-b-0 lg:grid-cols-6 lg:items-center">
      {children}
    </div>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return <div className="min-w-0 break-words text-sm font-semibold">{children}</div>;
}
