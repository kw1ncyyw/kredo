/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { RoutePath, Language, AppTheme, UserProfile, EscrowDeal, SystemNotification } from '../types';
import { 
  ShieldAlert, ShieldCheck, Eye, Check, X, Users, CreditCard, Mail, 
  Settings, Search, Clock, ArrowUpRight, ArrowDownLeft, AlertCircle, 
  Trash2, Filter, RefreshCw, Send, Lock, Unlock, Database, HelpCircle
} from 'lucide-react';
import { KredoData, isSupabaseConfigured } from '../supabase';

interface AdminPanelProps {
  user: UserProfile;
  lang: Language;
  theme: AppTheme;
  setRoute: (route: RoutePath) => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  notifications: SystemNotification[];
}

export default function AdminPanel({
  user,
  lang,
  theme,
  setRoute,
  updateProfile,
  notifications,
}: AdminPanelProps) {
  // If user is not an admin, we forbid viewing!
  if (user.role !== 'admin') {
    return (
      <div className={`p-12 text-center max-w-lg mx-auto my-24 rounded-3xl border ${
        theme === 'dark' ? 'bg-[#0f0e13] border-red-950 text-red-400' : 'bg-red-50 border-red-100 text-red-700 shadow-lg'
      }`}>
        <ShieldAlert className="h-16 w-16 mx-auto mb-4 text-red-500 animate-bounce" />
        <h2 className="text-lg font-black uppercase tracking-widest">{lang === 'ua' ? 'ДОСТУП ЗАБОРОНЕНО' : lang === 'ru' ? 'ДОСТУП ЗАПРЕЩЕН' : 'ACCESS DENIED'}</h2>
        <p className="text-xs font-semibold mt-3 text-stone-500 leading-relaxed">
          {lang === 'ua' ? 'Цей розділ призначений лише для сертифікованих адміністраторів KREDO.' : lang === 'ru' ? 'Этот раздел предназначен только для сертифицированных администраторов KREDO.' : 'This administrative dashboard is restricted to authorized credentials.'}
        </p>
        <button 
          onClick={() => setRoute('dashboard')}
          className="mt-6 px-6 py-2.5 bg-red-500 hover:bg-red-650 text-white font-black uppercase tracking-widest text-[10px] rounded-xl transition-all"
        >
          {lang === 'ua' ? 'Панель користувача' : lang === 'ru' ? 'Личный кабинет' : 'User Dashboard'}
        </button>
      </div>
    );
  }

  // Active Admin Sub-Tab
  const [activeTab, setActiveTab] = useState<'kyc' | 'users' | 'contacts' | 'transactions' | 'settings'>('kyc');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Status Filter
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Load Simulators database or Seed them
  const [kycRequests, setKycRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('kredo_kyc_requests_db');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const seed = [
      {
        id: 'kyc-2026-001',
        user_id: 'u-2',
        full_name: 'Марічка Ковальчук',
        email: 'kovalchuk.marina@ukr.net',
        document_type: 'passport',
        document_number: 'UA480921',
        document_front_url: 'passport_scan_kovalchuk.png',
        selfie_url: 'selfie_kovalchuk.jpg',
        status: 'Pending Review',
        admin_notes: '',
        created_at: new Date(Date.now() - 3600000 * 2.5).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 2.5).toISOString()
      },
      {
        id: 'kyc-2026-002',
        user_id: 'u-1',
        full_name: 'Олег Вовченко',
        email: 'vovchenko.oleg@gmail.com',
        document_type: 'international',
        document_number: 'FR998312',
        document_front_url: 'intl_passport_vovchenko.jpg',
        selfie_url: 'selfie_vovchenko.jpg',
        status: 'Verified',
        admin_notes: 'Verified against State register. Matches perfectly.',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: 'kyc-2026-003',
        user_id: 'u-5',
        full_name: 'Дарія Шостак',
        email: 'shostak.dariya@kredo.inc',
        document_type: 'driver',
        document_number: 'DRX091238',
        document_front_url: 'driver_lic_shostak.png',
        selfie_url: 'selfie_shostak.jpg',
        status: 'Rejected',
        admin_notes: 'Image is too low resolution, numbers are not visible.',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ];
    localStorage.setItem('kredo_kyc_requests_db', JSON.stringify(seed));
    return seed;
  });

  const [usersDb, setUsersDb] = useState<any[]>(() => {
    const saved = localStorage.getItem('kredo_users_db');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const seed = [
      { id: 'u-admin', email: 'admin@kredo.co.ua', fullName: 'Костянтин (Адмін)', country: 'Ukraine', phone: '+380-44-123-4567', joinedAt: '2026-01-01', balance: 50000, role: 'admin', verified: true },
      { id: 'u-1', email: 'vovchenko.oleg@gmail.com', fullName: 'Олег Вовченко', country: 'Ukraine', phone: '+380-67-200-1122', joinedAt: '2026-03-01', balance: 45000, role: 'user', verified: true },
      { id: 'u-2', email: 'kovalchuk.marina@ukr.net', fullName: 'Марічка Ковальчук', country: 'Ukraine', phone: '+380-93-145-8899', joinedAt: '2026-05-15', balance: 135000, role: 'user', verified: false },
      { id: 'u-3', email: 'taras.shevchenko@gmail.com', fullName: 'Тарас Шевченко', country: 'Ukraine', phone: '+380-50-666-4444', joinedAt: '2026-06-01', balance: 800, role: 'user', verified: false },
      { id: 'u-4', email: 'p.poroshenko@chocolate.ua', fullName: 'Петро Рошен', country: 'Ukraine', phone: '+380-67-555-5555', joinedAt: '2026-01-20', balance: 9945000, role: 'user', verified: true },
      { id: 'u-5', email: 'shostak.dariya@kredo.inc', fullName: 'Дарія Шостак', country: 'Ukraine', phone: '+380-68-990-2211', joinedAt: '2026-06-05', balance: 0, role: 'user', verified: false }
    ];
    localStorage.setItem('kredo_users_db', JSON.stringify(seed));
    return seed;
  });

  const [contactRequests, setContactRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('kredo_contact_requests_db');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const seed = [
      {
        id: 'contact-001',
        name: 'Роман Пилипенко',
        email: 'roman.p@ukr.net',
        topic: 'dispute',
        message: 'Продавець надіслав не ту версію вихідного коду (SaaS). Код містить помилки та незавершені модулі. Прошу зупинити виплату з ескроу угоди #tx-2238!',
        status: 'pending',
        created_at: new Date(Date.now() - 3600000 * 8).toISOString()
      },
      {
        id: 'contact-002',
        name: 'Марічка Ковальчук',
        email: 'kovalchuk.marina@ukr.net',
        topic: 'kyc',
        message: 'Не підходить формат паспорта HEIC з мого iPhone, довелося конвертувати на зовнішньому сайті. Чи безпечно це?',
        status: 'resolved',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        id: 'contact-003',
        name: 'Артем Дяченко',
        email: 'd.artem@lexar-partners.co.ua',
        topic: 'legal',
        message: 'Надсилаємо шаблони оновлених договорів для послуги юридичного захисту угод KREDO Escrow. Потрібен підпис директора.',
        status: 'pending',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ];
    localStorage.setItem('kredo_contact_requests_db', JSON.stringify(seed));
    return seed;
  });

  const [transactions, setTransactions] = useState<any[]>(() => {
    const saved = localStorage.getItem('kredo_deals_db');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const seed = [
      { id: 'tx-2239', buyer: 'user@kredo.com', seller: 'kovalchuk.marina@ukr.net', item: 'Розробка Web-порталу на React', status: 'funded', amount: 80000, date: '2026-06-07' },
      { id: 'tx-2238', buyer: 'vovchenko.oleg@gmail.com', seller: 'user@kredo.com', item: 'Постачання обладнання для серверів', status: 'released', amount: 45000, date: '2026-06-04' },
      { id: 'tx-2237', buyer: 'taras.shevchenko@gmail.com', seller: 'p.poroshenko@chocolate.ua', item: 'Юридичні послуги LEXAR', status: 'created', amount: 12000, date: '2026-06-02' }
    ];
    localStorage.setItem('kredo_deals_db', JSON.stringify(seed));
    return seed;
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    KredoData.listAdminData().then((result) => {
      if (!active || !result.success) return;
      setKycRequests(result.kyc || []);
      setContactRequests(result.contacts || []);
      setUsersDb((result.profiles || []).map((profile: any) => ({
        ...profile,
        fullName: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email,
        joinedAt: profile.created_at?.split('T')[0] || '',
        verified: profile.kyc_status === 'Verified',
        balance: 0,
      })));
    });
    return () => { active = false; };
  }, []);

  // Admin notes inputs by applicant ID
  const [adminNotesByKycId, setAdminNotesByKycId] = useState<{[key: string]: string}>({});

  // SMTP Info State
  const [smtpConfig, setSmtpConfig] = useState(() => {
    const saved = localStorage.getItem('kredo_smtp_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      sender: 'kredo.support.ua@gmail.com',
      service: 'Web3Forms contact delivery',
      verificationCodesEnabled: true,
      alertsEnabled: true,
      lastStatus: 'Configured in environment'
    };
  });

  useEffect(() => {
    localStorage.setItem('kredo_smtp_config', JSON.stringify(smtpConfig));
  }, [smtpConfig]);

  // Handle Approve KYC
  const approveKyc = async (id: string, userId: string) => {
    const notes = adminNotesByKycId[id]?.trim() || (
      lang === 'ua'
        ? 'Документи перевірено адміністратором KREDO.'
        : lang === 'ru'
          ? 'Документы проверены администратором KREDO.'
          : 'Documents verified by a KREDO administrator.'
    );
    if (isSupabaseConfigured) {
      const result = await KredoData.reviewKyc({ id, userId, status: 'Verified', note: notes });
      if (!result.success) {
        alert(lang === 'ua' ? 'Не вдалося оновити KYC.' : lang === 'ru' ? 'Не удалось обновить KYC.' : 'Could not update KYC.');
        return;
      }
    }
    const updatedRequests = kycRequests.map(r => {
      if (r.id === id) {
        return { ...r, status: 'Verified', admin_notes: notes, updated_at: new Date().toISOString() };
      }
      return r;
    });
    setKycRequests(updatedRequests);
    localStorage.setItem('kredo_kyc_requests_db', JSON.stringify(updatedRequests));

    // Update users database
    const updatedUsers = usersDb.map(u => {
      if (u.id === userId) {
        return { ...u, verified: true, kyc_status: 'Verified', kyc_notes: notes };
      }
      return u;
    });
    setUsersDb(updatedUsers);
    localStorage.setItem('kredo_users_db', JSON.stringify(updatedUsers));

    // Push system notification for user (simulate writing to localStorage notifications)
    const simulatedNotifications = JSON.parse(localStorage.getItem('kredo_notifications_db') || '[]');
    simulatedNotifications.push({
      id: `notif-${Date.now()}`,
      user_id: userId,
      title: lang === 'ua' ? 'Акаунт верифіковано' : lang === 'ru' ? 'Аккаунт верифицирован' : 'Account Vetted',
      message: `${lang === 'ua' ? 'Вашу верифікацію підтверджено.' : lang === 'ru' ? 'Ваша верификация подтверждена.' : 'Your verification has been approved.'} ${notes}`,
      type: 'security',
      read: false,
      created_at: new Date().toISOString()
    });
    localStorage.setItem('kredo_notifications_db', JSON.stringify(simulatedNotifications));

    // If currently logged user was approved, update current instance
    if (user.id === userId) {
      updateProfile({ verified: true, kyc_status: 'Verified', kyc_notes: notes });
      const currentKycState = JSON.parse(localStorage.getItem('kredo_kyc_state') || '{}');
      currentKycState.status = 'Verified';
      currentKycState.adminNotes = notes;
      currentKycState.reviewDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
      localStorage.setItem('kredo_kyc_state', JSON.stringify(currentKycState));
    }

    alert(lang === 'ua' ? 'Статус KYC успішно оновлено: ПІДТВЕРДЖЕНО' : lang === 'ru' ? 'Статус KYC успешно обновлен: ПОДТВЕРЖДЕНО' : 'KYC requested APPROVED successfully');
  };

  // Handle Reject KYC
  const rejectKyc = async (id: string, userId: string) => {
    const notes = adminNotesByKycId[id]?.trim() || '';
    if (!notes.trim()) {
      alert(lang === 'ua' ? 'Коментар про відхилення обов\'язковий!' : lang === 'ru' ? 'Комментарий о причинах отклонения обязателен!' : 'Remarks explaining the rejection details are mandatory!');
      return;
    }
    if (isSupabaseConfigured) {
      const result = await KredoData.reviewKyc({ id, userId, status: 'Rejected', note: notes });
      if (!result.success) {
        alert(lang === 'ua' ? 'Не вдалося оновити KYC.' : lang === 'ru' ? 'Не удалось обновить KYC.' : 'Could not update KYC.');
        return;
      }
    }

    const updatedRequests = kycRequests.map(r => {
      if (r.id === id) {
        return { ...r, status: 'Rejected', admin_notes: notes, updated_at: new Date().toISOString() };
      }
      return r;
    });
    setKycRequests(updatedRequests);
    localStorage.setItem('kredo_kyc_requests_db', JSON.stringify(updatedRequests));

    // Update users database
    const updatedUsers = usersDb.map(u => {
      if (u.id === userId) {
        return { ...u, verified: false, kyc_status: 'Rejected', kyc_notes: notes };
      }
      return u;
    });
    setUsersDb(updatedUsers);
    localStorage.setItem('kredo_users_db', JSON.stringify(updatedUsers));

    // Push system notification for user (simulate writing to localStorage notifications)
    const simulatedNotifications = JSON.parse(localStorage.getItem('kredo_notifications_db') || '[]');
    simulatedNotifications.push({
      id: `notif-${Date.now()}`,
      user_id: userId,
      title: lang === 'ua' ? 'KYC відхилено' : lang === 'ru' ? 'KYC отклонено' : 'KYC Investigation Rejected',
      message: `${lang === 'ua' ? 'Верифікацію відхилено. Перевірте коментар адміністратора.' : lang === 'ru' ? 'Верификация отклонена. Проверьте комментарий администратора.' : 'Verification rejected. Check the administrator comment.'} ${notes}`,
      type: 'security',
      read: false,
      created_at: new Date().toISOString()
    });
    localStorage.setItem('kredo_notifications_db', JSON.stringify(simulatedNotifications));

    // If currently logged user was rejected, update current instance
    if (user.id === userId) {
      updateProfile({ verified: false, kyc_status: 'Rejected', kyc_notes: notes });
      const currentKycState = JSON.parse(localStorage.getItem('kredo_kyc_state') || '{}');
      currentKycState.status = 'Rejected';
      currentKycState.adminNotes = notes;
      currentKycState.reviewDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
      localStorage.setItem('kredo_kyc_state', JSON.stringify(currentKycState));
    }

    alert(lang === 'ua' ? 'Заявку KYC відхилено' : lang === 'ru' ? 'Заявка KYC отклонена' : 'KYC request REJECTED successfully');
  };

  // Toggle Contact Request status
  const toggleContactStatus = async (cid: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'resolved' : 'pending';
    if (isSupabaseConfigured) {
      const result = await KredoData.updateContactStatus(cid, nextStatus);
      if (!result.success) {
        alert(lang === 'ua' ? 'Не вдалося оновити звернення.' : lang === 'ru' ? 'Не удалось обновить обращение.' : 'Could not update the request.');
        return;
      }
    }
    const updated = contactRequests.map(c => {
      if (c.id === cid) {
        return { ...c, status: nextStatus };
      }
      return c;
    });
    setContactRequests(updated);
    localStorage.setItem('kredo_contact_requests_db', JSON.stringify(updated));
  };

  // Actions for Escrow Ledger Panel
  const handleModifyTransactionStatus = (txId: string, nextStatus: string) => {
    const updated = transactions.map(t => {
      if (t.id === txId) {
        return { ...t, status: nextStatus };
      }
      return t;
    });
    setTransactions(updated);
    localStorage.setItem('kredo_deals_db', JSON.stringify(updated));
    alert(lang === 'ua' ? `Статус транзакції ${txId} оновлено.` : lang === 'ru' ? `Статус транзакции ${txId} обновлён.` : `Transaction ${txId} status updated.`);
  };

  // Translatable texts for admin panel
  const i18n = {
    ua: {
      adminHeader: 'Панель модератора — KREDO Backoffice',
      adminSub: 'Центральний шлюз контролю відповідності вимогам безпеки регулятора.',
      metricUsers: 'Захищені користувачі',
      metricEscrow: 'Сума в ескроу',
      metricPendingKyc: 'Очікують верифікації',
      metricOpenContacts: 'Відкриті запити',
      tabKyc: 'Запити KYC',
      tabUsers: 'Користувачі',
      tabContacts: 'Запити підтримки',
      tabTx: 'Транзакції',
      tabSettings: 'Налаштування',
      searchPlaceholder: 'Пошук за іменем, email або реквізитами...',
      statusAll: 'Усі статуси',
      statusPending: 'На розгляді',
      statusVerified: 'Підтверджено',
      statusRejected: 'Відхилено',
      applicantName: 'Заявник',
      docType: 'Тип документа',
      docNumber: 'Номер документа',
      submittedDate: 'Дата подання',
      docFiles: 'Файли документів',
      viewPassport: '📄 Переглянути паспорт',
      viewSelfie: '📷 Переглянути селфі',
      commentsLabel: 'Адміністративні примітки / Причина відхилення',
      approveBtn: 'Затвердити',
      rejectBtn: 'Відхилити',
      unresolvedSupport: 'Невирішені тикети',
      supportTopic: 'Тема / Категорія запиту',
      msgBody: 'Текст повідомлення',
      resolvedBtn: 'Вирішено',
      pendingBtn: 'У роботі',
      destinationMail: 'Надіслано на пошту відділу:',
      ruleTitle: 'Доставка звернень через Web3Forms:',
      ruleDetails: 'Звернення зберігаються в Supabase та надсилаються до служби підтримки через Web3Forms.',
      roleLabel: 'Роль',
      verifyStatus: 'Статус верифікації',
      makeAdmin: 'Надати роль Адміна',
      makeUser: 'Зробити звичайним користувачем',
      verifiedText: 'ВЕРИФІКОВАНО',
      unverifiedText: 'НЕ ПІДТВЕРДЖЕНО',
      smtpTitle: 'Конфігурація Web3Forms',
      smtpHost: 'Адреса служби підтримки',
      smtpStatus: 'Статус підключення',
      smtpAlerts: 'Адміністративні оповіщення',
      smtpCodesEnabled: 'Сповіщення Web3Forms активовано',
      saveSmtp: 'Зберегти конфігурацію',
    },
    en: {
      adminHeader: 'System Back-Office Administration Portal',
      adminSub: 'Secure centralized control panel to audit, moderate, and inspect customer telemetry.',
      metricUsers: 'Secured Members',
      metricEscrow: 'Volume in Escrow',
      metricPendingKyc: 'Pending KYC Checks',
      metricOpenContacts: 'Open Tickets',
      tabKyc: 'KYC Requests',
      tabUsers: 'Users',
      tabContacts: 'Contact Requests',
      tabTx: 'Transactions',
      tabSettings: 'Settings',
      searchPlaceholder: 'Search by full name, email, transaction records...',
      statusAll: 'All Compliance statuses',
      statusPending: 'Pending Review',
      statusVerified: 'Fully Verified',
      statusRejected: 'Declined Drafts',
      applicantName: 'Applicant Profile',
      docType: 'Doc Type',
      docNumber: 'Doc Reference',
      submittedDate: 'Submission Date',
      docFiles: 'Dossier Files',
      viewPassport: '📄 View Passport Scan',
      viewSelfie: '📷 View Selfie Photo',
      commentsLabel: 'Moderator Audit Notes / Reason for Refusal',
      approveBtn: 'Grant Clearance',
      rejectBtn: 'Refuse Entry',
      unresolvedSupport: 'Open Support Requests',
      supportTopic: 'Support Subject Category',
      msgBody: 'Inquiry Text Content',
      resolvedBtn: 'Mark Handled',
      pendingBtn: 'Restore Active',
      destinationMail: 'Processed to department email:',
      ruleTitle: 'Web3Forms request delivery:',
      ruleDetails: 'Requests are stored in Supabase and delivered to support through Web3Forms.',
      roleLabel: 'Access Role',
      verifyStatus: 'Vetting status',
      makeAdmin: 'Assign Admin Role',
      makeUser: 'Demote to Standard User',
      verifiedText: 'VERIFIED COMPLIANT',
      unverifiedText: 'UNVERIFIED PREVENTED',
      smtpTitle: 'Web3Forms Configuration',
      smtpHost: 'Support Address',
      smtpStatus: 'Active Mail Status',
      smtpAlerts: 'Dispatch Security Admins Alerts',
      smtpCodesEnabled: 'Web3Forms Notifications Enabled',
      saveSmtp: 'Save Configuration Settings',
    },
    ru: {
      adminHeader: 'Панель модератора — KREDO Backoffice',
      adminSub: 'Центральный шлюз контроля соответствия требованиям безопасности регулятора.',
      metricUsers: 'Защищенные пользователи',
      metricEscrow: 'Сумма в эскроу',
      metricPendingKyc: 'Ожидают верификации',
      metricOpenContacts: 'Открытые запросы',
      tabKyc: 'Запросы KYC',
      tabUsers: 'Пользователи',
      tabContacts: 'Запросы поддержки',
      tabTx: 'Транзакции',
      tabSettings: 'Настройки',
      searchPlaceholder: 'Поиск по имени, email или реквизитам...',
      statusAll: 'Все статусы',
      statusPending: 'На рассмотрении',
      statusVerified: 'Подтверждено',
      statusRejected: 'Отклонено',
      applicantName: 'Заявитель',
      docType: 'Тип документа',
      docNumber: 'Номер документа',
      submittedDate: 'Дата подачи',
      docFiles: 'Файлы документов',
      viewPassport: '📄 Посмотреть паспорт',
      viewSelfie: '📷 Посмотреть селфи',
      commentsLabel: 'Административные примечания / Причина отклонения',
      approveBtn: 'Утвердить',
      rejectBtn: 'Отклонить',
      unresolvedSupport: 'Неразрешенные тикеты',
      supportTopic: 'Тема / Категория запроса',
      msgBody: 'Текст сообщения',
      resolvedBtn: 'Решено',
      pendingBtn: 'В работе',
      destinationMail: 'Отправлено на почту отдела:',
      ruleTitle: 'Доставка обращений через Web3Forms:',
      ruleDetails: 'Обращения сохраняются в Supabase и отправляются в службу поддержки через Web3Forms.',
      roleLabel: 'Роль',
      verifyStatus: 'Статус верификации',
      makeAdmin: 'Назначить Админом',
      makeUser: 'Сделать обычным пользователем',
      verifiedText: 'ВЕРИФИЦИРОВАН',
      unverifiedText: 'НЕ ПОДТВЕРЖДЕН',
      smtpTitle: 'Конфигурация Web3Forms',
      smtpHost: 'Адрес службы поддержки',
      smtpStatus: 'Статус подключения',
      smtpAlerts: 'Административные оповещения',
      smtpCodesEnabled: 'Уведомления Web3Forms активированы',
      saveSmtp: 'Сохранить настройки',
    }
  }[lang] || {
    adminHeader: 'System Back-Office Administration Portal',
    adminSub: 'Secure centralized control panel to audit, moderate, and inspect customer telemetry.',
    metricUsers: 'Secured Members',
    metricEscrow: 'Volume in Escrow',
    metricPendingKyc: 'Pending KYC Checks',
    metricOpenContacts: 'Open Tickets',
    tabKyc: 'KYC Requests',
    tabUsers: 'Users',
    tabContacts: 'Contact Requests',
    tabTx: 'Transactions',
    tabSettings: 'Settings',
    searchPlaceholder: 'Search by full name, email, transaction records...',
    statusAll: 'All Compliance statuses',
    statusPending: 'Pending Review',
    statusVerified: 'Fully Verified',
    statusRejected: 'Declined Drafts',
    applicantName: 'Applicant Profile',
    docType: 'Doc Type',
    docNumber: 'Doc Reference',
    submittedDate: 'Submission Date',
    docFiles: 'Dossier Files',
    viewPassport: '📄 View Passport Scan',
    viewSelfie: '📷 View Selfie Photo',
    commentsLabel: 'Moderator Audit Notes / Reason for Refusal',
    approveBtn: 'Grant Clearance',
    rejectBtn: 'Refuse Entry',
    unresolvedSupport: 'Open Support Requests',
    supportTopic: 'Support Subject Category',
    msgBody: 'Inquiry Text Content',
    resolvedBtn: 'Mark Handled',
    pendingBtn: 'Restore Active',
    destinationMail: 'Processed to department email:',
    ruleTitle: 'Automated Subject Routing Rules (Kredo Directives):',
    ruleDetails: 'All queries are processed server-side and routed securely to departmental email addresses, hiding private access keys entirely.',
    roleLabel: 'Access Role',
    verifyStatus: 'Vetting status',
    makeAdmin: 'Assign Admin Role',
    makeUser: 'Demote to Standard User',
    verifiedText: 'VERIFIED COMPLIANT',
    unverifiedText: 'UNVERIFIED PREVENTED',
    smtpTitle: 'SMTP Mail Dispatcher Configuration',
    smtpHost: 'SMTP Sender Relay Host',
    smtpStatus: 'Active Mail Status',
    smtpAlerts: 'Dispatch Security Admins Alerts',
    smtpCodesEnabled: 'Verification Code Emails Enabled',
    saveSmtp: 'Save Configuration Settings',
  };

  // Helper mapping values for email goals on subject
  const getSubjectDestinationEmail = (topic: string) => {
    return 'kredo.support.ua@gmail.com';
  };

  const openPrivateKycFile = async (path: string) => {
    if (!isSupabaseConfigured) {
      alert(path);
      return;
    }
    const signedUrl = await KredoData.createSignedKycUrl(path);
    if (signedUrl) {
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert(lang === 'ua' ? 'Не вдалося відкрити приватний файл.' : lang === 'ru' ? 'Не удалось открыть приватный файл.' : 'Could not open the private file.');
    }
  };

  const getSubjectTitleLocalized = (topic: string) => {
    const maps: { [key: string]: { [key: string]: string } } = {
      billing: { ua: '💸 Фінансові питання', ru: '💸 Финансовые вопросы', en: '💸 Billing Inquiries' },
      tech: { ua: '🔧 Технічна підтримка', ru: '🔧 Техническая поддержка', en: '🔧 Technical Support' },
      general: { ua: '💬 Загальні запитання', ru: '💬 Общие вопросы', en: '💬 General Inquiries' },
      kyc: { ua: '🛡️ Перевірка документів', ru: '🛡️ Проверка документов', en: '🛡️ Document KYC Verification' },
      docs: { ua: '🗄️ Завантаження файлів', ru: '🗄️ Загрузка файлов', en: '🗄️ Upload Queries' },
      legal: { ua: '⚖️ Юридичний аудит (LEXAR)', ru: '⚖️ Юридический аудит (LEXAR)', en: '⚖️ Legal Audit (LEXAR)' },
      dispute: { ua: '🚨 Диспут та врегулювання', ru: '🚨 Диспут и урегулирование', en: '🚨 Escrow Disputes' },
      'General question': { ua: 'Загальне питання', ru: 'Общий вопрос', en: 'General question' },
      'Transaction support': { ua: 'Підтримка транзакцій', ru: 'Поддержка транзакций', en: 'Transaction support' },
      'Identity verification': { ua: 'Верифікація особи', ru: 'Верификация личности', en: 'Identity verification' },
      'Legal question': { ua: 'Юридичне питання', ru: 'Юридический вопрос', en: 'Legal question' },
      Partnership: { ua: 'Партнерство', ru: 'Партнёрство', en: 'Partnership' },
    };
    return maps[topic]?.[lang] || topic;
  };

  // Counting totals for cards display
  const {
    totalVerifiedSaves,
    pendingRequestsTotal,
    openContactsTotal,
    activeEscrowDealsVolume,
  } = useMemo(() => ({
    totalVerifiedSaves: usersDb.filter(u => u.verified).length,
    pendingRequestsTotal: kycRequests.filter(r => r.status === 'Pending Review').length,
    openContactsTotal: contactRequests.filter(c => c.status === 'pending').length,
    activeEscrowDealsVolume: transactions
      .filter(t => t.status === 'funded')
      .reduce((acc, t) => acc + (t.amount || 0), 0),
  }), [contactRequests, kycRequests, transactions, usersDb]);

  // Filters logic for KYC Requests
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredKyc = useMemo(() => kycRequests.filter(r => {
    const matchesSearch = !normalizedSearch
      || r.full_name?.toLowerCase().includes(normalizedSearch)
      || r.email?.toLowerCase().includes(normalizedSearch)
      || r.document_number?.toLowerCase().includes(normalizedSearch);
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [kycRequests, normalizedSearch, statusFilter]);

  // Filters logic for Users Database
  const filteredUsers = useMemo(() => usersDb.filter(u => (
    !normalizedSearch
    || u.fullName?.toLowerCase().includes(normalizedSearch)
    || u.email?.toLowerCase().includes(normalizedSearch)
    || u.phone?.toLowerCase().includes(normalizedSearch)
  )), [normalizedSearch, usersDb]);

  // Filters for Contact Requests
  const filteredContacts = useMemo(() => contactRequests.filter(c => {
    const matchesQuery = !normalizedSearch
      || c.name?.toLowerCase().includes(normalizedSearch)
      || c.email?.toLowerCase().includes(normalizedSearch)
      || c.message?.toLowerCase().includes(normalizedSearch);
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'PENDING' ? c.status === 'pending' : c.status === 'resolved');
    return matchesQuery && matchesStatus;
  }), [contactRequests, normalizedSearch, statusFilter]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4 animate-fade-in pb-16">
      
      {/* Top Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-stone-500/10 pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h1 className={`text-xl font-black uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
              {i18n.adminHeader}
            </h1>
          </div>
          <p className="text-xs text-stone-500 font-semibold mt-1">
            {i18n.adminSub}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <span className="h-2 w-2 rounded-full bg-emerald-505 animate-pulse"></span>
          <span className="text-[10px] uppercase font-black tracking-widest text-stone-500">
            {lang === 'ua' ? 'РЕЖИМ АДМІНІСТРАТОРА' : lang === 'ru' ? 'РЕЖИМ АДМИНИСТРАТОРА' : 'ADMIN PRIVILEGES'}
          </span>
          <button 
            onClick={() => setRoute('dashboard')}
            className={`px-3 py-1.5 rounded-lg border text-[10px] uppercase font-extrabold tracking-widest transition-all ${
              theme === 'dark' ? 'border-stone-800 hover:bg-stone-900 text-stone-300' : 'border-stone-200 hover:bg-stone-50 text-stone-800'
            }`}
          >
            {lang === 'ua' ? 'Кабінет користувача' : lang === 'ru' ? 'Личный кабинет' : 'Client Desk'}
          </button>
        </div>
      </div>

      {/* Top KPIs Row Blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className={`p-5 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#0f0e13] border-stone-900 text-stone-400' : 'bg-white border-stone-200 text-stone-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-black text-stone-500">{i18n.metricUsers}</span>
            <Users className="h-4 w-4 text-sky-500" />
          </div>
          <span className={`block text-xl font-normal tracking-tight mt-2.5 ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>
            {totalVerifiedSaves} <span className="text-xs font-semibold text-stone-500">/ {usersDb.length}</span>
          </span>
        </div>

        {/* KPI 2 */}
        <div className={`p-5 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#0f0e13] border-stone-900 text-stone-400' : 'bg-white border-stone-200 text-stone-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-black text-stone-500">{i18n.metricEscrow}</span>
            <CreditCard className="h-4 w-4 text-emerald-500" />
          </div>
          <span className={`block text-xl font-normal tracking-tight mt-2.5 text-emerald-505`}>
            {activeEscrowDealsVolume.toLocaleString('uk-UA')} <span className="text-xs font-semibold">UAH</span>
          </span>
        </div>

        {/* KPI 3 */}
        <div className={`p-5 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#0f0e13] border-stone-900 text-stone-400' : 'bg-white border-stone-200 text-stone-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-black text-stone-500">{i18n.metricPendingKyc}</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <span className={`block text-xl font-normal tracking-tight mt-2.5 ${
            pendingRequestsTotal > 0 ? 'text-amber-500 font-extrabold animate-pulse' : (theme === 'dark' ? 'text-white' : 'text-stone-950')
          }`}>
            {pendingRequestsTotal}
          </span>
        </div>

        {/* KPI 4 */}
        <div className={`p-5 rounded-2xl border ${
          theme === 'dark' ? 'bg-[#0f0e13] border-stone-900 text-stone-400' : 'bg-white border-stone-200 text-stone-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-black text-stone-500">{i18n.metricOpenContacts}</span>
            <Mail className="h-4 w-4 text-indigo-500" />
          </div>
          <span className={`block text-xl font-normal tracking-tight mt-2.5 ${
            openContactsTotal > 0 ? 'text-indigo-500 font-extrabold' : (theme === 'dark' ? 'text-white' : 'text-stone-950')
          }`}>
            {openContactsTotal}
          </span>
        </div>

      </div>

      {/* Main Control Panel Layout Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation panel columns (3) */}
        <div className="lg:col-span-3 space-y-2">
          
          <button 
            onClick={() => { setActiveTab('kyc'); setStatusFilter('ALL'); setSearchQuery(''); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
              activeTab === 'kyc'
                ? 'bg-emerald-500 border-emerald-600 text-white shadow-md'
                : theme === 'dark'
                ? 'bg-stone-900/40 border-stone-900 text-stone-400 hover:text-white hover:bg-stone-900'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{i18n.tabKyc}</span>
            </div>
            {pendingRequestsTotal > 0 && (
              <span className="h-5 min-w-5 flex items-center justify-center text-[9px] px-1 bg-red-500 text-white font-black rounded-full">
                {pendingRequestsTotal}
              </span>
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
              activeTab === 'users'
                ? 'bg-emerald-500 border-emerald-600 text-white shadow-md'
                : theme === 'dark'
                ? 'bg-stone-900/40 border-stone-900 text-stone-400 hover:text-white hover:bg-stone-900'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Users className="h-4 w-4 shrink-0" />
              <span>{i18n.tabUsers}</span>
            </div>
          </button>

          <button 
            onClick={() => { setActiveTab('contacts'); setStatusFilter('ALL'); setSearchQuery(''); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
              activeTab === 'contacts'
                ? 'bg-emerald-500 border-emerald-600 text-white shadow-md'
                : theme === 'dark'
                ? 'bg-stone-900/40 border-stone-900 text-stone-400 hover:text-white hover:bg-stone-900'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 shrink-0" />
              <span>{i18n.tabContacts}</span>
            </div>
            {openContactsTotal > 0 && (
              <span className="h-5 min-w-5 flex items-center justify-center text-[9px] px-1 bg-indigo-500 text-white font-black rounded-full">
                {openContactsTotal}
              </span>
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('transactions'); setSearchQuery(''); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
              activeTab === 'transactions'
                ? 'bg-emerald-500 border-emerald-600 text-white shadow-md'
                : theme === 'dark'
                ? 'bg-stone-900/40 border-stone-900 text-stone-400 hover:text-white hover:bg-stone-900'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <CreditCard className="h-4 w-4 shrink-0" />
              <span>{i18n.tabTx}</span>
            </div>
          </button>

          <button 
            onClick={() => { setActiveTab('settings'); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
              activeTab === 'settings'
                ? 'bg-emerald-500 border-emerald-600 text-white shadow-md'
                : theme === 'dark'
                ? 'bg-stone-900/40 border-stone-900 text-stone-400 hover:text-white hover:bg-stone-900'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Settings className="h-4 w-4 shrink-0" />
              <span>{i18n.tabSettings}</span>
            </div>
          </button>

        </div>

        {/* Content Workspace columns (9) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Global search/filters bar (Hidden in Settings tab) */}
          {activeTab !== 'settings' && (
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between ${
              theme === 'dark' ? 'bg-[#0f0e13] border-stone-900' : 'bg-white border-stone-200 shadow-sm'
            }`}>
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-550" />
                <input 
                  type="text"
                  placeholder={i18n.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl border focus:outline-hidden focus:ring-0 ${
                    theme === 'dark'
                      ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-500'
                  }`}
                />
              </div>

              {(activeTab === 'kyc' || activeTab === 'contacts') && (
                <div className="flex items-center space-x-2 shrink-0">
                  <Filter className="h-3.5 w-3.5 text-stone-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`text-[11px] uppercase font-bold tracking-wider px-3 py-2 rounded-xl border focus:outline-hidden ${
                      theme === 'dark'
                        ? 'bg-stone-950 border-stone-850 text-white'
                        : 'bg-stone-50 border-stone-105 text-stone-805'
                    }`}
                  >
                    <option value="ALL">{i18n.statusAll}</option>
                    {activeTab === 'kyc' ? (
                      <>
                        <option value="Pending Review">{i18n.statusPending}</option>
                        <option value="Verified">{i18n.statusVerified}</option>
                        <option value="Rejected">{i18n.statusRejected}</option>
                      </>
                    ) : (
                      <>
                        <option value="PENDING">{lang === 'ua' ? 'В роботі' : lang === 'ru' ? 'В работе' : 'Active Inquiry'}</option>
                        <option value="RESOLVED">{lang === 'ua' ? 'Вирішено' : lang === 'ru' ? 'Решено' : 'Handled'}</option>
                      </>
                    )}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: KYC REQUESTS */}
          {activeTab === 'kyc' && (
            <div className="space-y-6">
              {filteredKyc.length === 0 ? (
                <div className={`p-12 text-center rounded-3xl border ${
                  theme === 'dark' ? 'bg-[#0f0e13] border-stone-900' : 'bg-white border-stone-200'
                }`}>
                  <ShieldCheck className="h-10 w-10 text-stone-400 mx-auto mb-3" />
                  <span className="block font-black uppercase tracking-wider text-xs text-stone-500">
                    {lang === 'ua' ? 'Запитів не виявлено' : lang === 'ru' ? 'Запросов не обнаружено' : 'No requests matched search'}
                  </span>
                </div>
              ) : (
                filteredKyc.map((req) => (
                  <div 
                    key={req.id}
                    className={`rounded-3xl border overflow-hidden ${
                      theme === 'dark' ? 'bg-[#0f0e13] border-stone-900' : 'bg-white border-stone-200 shadow-sm'
                    }`}
                  >
                    {/* Header bar of card */}
                    <div className={`px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 ${
                      theme === 'dark' ? 'bg-stone-900/20 border-stone-850' : 'bg-stone-50 border-stone-105'
                    }`}>
                      <div>
                        <span className={`block text-xs font-black uppercase tracking-wide ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
                          {req.full_name}
                        </span>
                        <span className="block text-[10px] text-stone-500 font-bold mt-0.5">{req.email}</span>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <span className={`text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full ${
                          req.status === 'Verified' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : req.status === 'Rejected' 
                            ? 'bg-red-500/10 text-red-550' 
                            : 'bg-amber-500/10 text-amber-500 animate-pulse'
                        }`}>
                          {req.status === 'Verified' ? i18n.statusVerified : req.status === 'Rejected' ? i18n.statusRejected : i18n.statusPending}
                        </span>
                        <span className="text-[9px] text-stone-500 font-semibold uppercase tracking-wider">
                          ID: {req.id}
                        </span>
                      </div>
                    </div>

                    {/* Content view of KYC record */}
                    <div className="p-6 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs border-b border-stone-500/10 pb-4">
                        <div>
                          <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest">{i18n.docType}</span>
                          <span className={`block font-extrabold capitalize mt-1 ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
                            {req.document_type === 'passport' 
                              ? (lang === 'ua' ? 'Паспорт (ID)' : lang === 'ru' ? 'Паспорт (ID)' : 'Passport / ID')
                              : req.document_type === 'driver'
                              ? (lang === 'ua' ? 'Посвідчення водія' : lang === 'ru' ? 'Вод. права' : 'Driver License')
                              : (lang === 'ua' ? 'Закордонний паспорт' : lang === 'ru' ? 'Заграничный' : 'Intl Passport')
                            }
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest">{i18n.docNumber}</span>
                          <span className="block font-black tracking-wide text-emerald-505 uppercase mt-1">
                            {req.document_number || '—'}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest">{i18n.submittedDate}</span>
                          <span className={`block font-semibold mt-1 ${theme === 'dark' ? 'text-stone-300' : 'text-stone-705'}`}>
                            {new Date(req.created_at).toLocaleDateString('uk-UA')} {new Date(req.created_at).toLocaleTimeString('uk-UA', {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>

                      {/* Grid containing Document Files & Previews */}
                      <div className="space-y-4">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-stone-500">
                          {lang === 'ua' ? 'ВЕРИФІКАЦІЙНИЙ ДОСЬЄ & ПОСИЛАННЯ ПРЕВ’Ю' : lang === 'ru' ? 'ВЕРИФИКАЦИОННОЕ ДОСЬЕ &ССЫЛКИ ПРЕВЬЮ' : 'VERIFICATION DOSSIER & PHOTO PREVIEWS'}
                        </span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* 1. Document File Upload & Preview */}
                          <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                            theme === 'dark' ? 'bg-stone-950/60 border-stone-900 hover:border-emerald-500/30' : 'bg-stone-50/70 border-stone-200 hover:border-emerald-500/30 shadow-3xs'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-base">📄</span>
                                <span className={`text-[11px] font-mono font-bold tracking-tight ${theme === 'dark' ? 'text-stone-200' : 'text-stone-800'}`}>
                                  {req.document_front_url}
                                </span>
                              </div>
                              <a 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); openPrivateKycFile(req.document_front_url); }}
                                className="text-[10px] text-emerald-550 border border-emerald-500/20 hover:bg-emerald-500/10 px-2.5 py-1 rounded-lg font-black uppercase tracking-widest transition-all shrink-0"
                              >
                                {lang === 'ua' ? 'завантажити' : lang === 'ru' ? 'скачать' : 'download'}
                              </a>
                            </div>

                            {/* ID Document Visual Preview Frame */}
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-stone-800 bg-stone-900 select-none group">
                              <button
                                type="button"
                                onClick={() => openPrivateKycFile(req.document_front_url)}
                                className="absolute inset-0 flex items-center justify-center text-xs font-bold text-stone-300"
                              >
                                {i18n.viewPassport}
                              </button>
                              {/* HUD Scanning Lines */}
                              <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/40 pointer-events-none"></div>
                              <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/70 border border-emerald-500/30 rounded-md text-[8px] font-mono uppercase text-emerald-400 tracking-wider">
                                {lang === 'ua' ? 'Бланк документа' : lang === 'ru' ? 'Бланк документа' : 'OCR Vetting Source'}
                              </div>
                              {/* Hologram OCR Box */}
                              <div className="absolute inset-x-8 top-1/4 bottom-1/4 border border-dashed border-emerald-500/40 animate-pulse flex items-center justify-center">
                                <div className="text-[8px] font-mono text-emerald-400/80 bg-black/50 px-1.5 py-0.5 rounded tracking-widest uppercase">
                                  {req.document_number || (lang === 'ua' ? 'ОБРОБКА' : lang === 'ru' ? 'ОБРАБОТКА' : 'PROCESSING')}
                                </div>
                              </div>
                              {/* Subtle glass effect banner */}
                              <div className="absolute bottom-0 inset-x-0 bg-black/85 p-2 border-t border-white/5 text-[9px] font-mono text-stone-400 flex justify-between">
                                <span>{lang === 'ua' ? 'ТИП' : lang === 'ru' ? 'ТИП' : 'TYPE'}: {req.document_type?.toUpperCase()}</span>
                                <span className="text-emerald-400 font-bold">{lang === 'ua' ? 'ФАЙЛ ГОТОВИЙ' : lang === 'ru' ? 'ФАЙЛ ГОТОВ' : 'FILE READY'}</span>
                              </div>
                            </div>
                          </div>

                          {/* 2. Selfie Image Check & Face Match Preview */}
                          <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                            theme === 'dark' ? 'bg-stone-950/60 border-stone-900 hover:border-emerald-500/30' : 'bg-stone-50/70 border-stone-200 hover:border-emerald-500/30 shadow-3xs'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-base">📷</span>
                                <span className={`text-[11px] font-mono font-bold tracking-tight ${theme === 'dark' ? 'text-stone-200' : 'text-stone-800'}`}>
                                  {req.selfie_url}
                                </span>
                              </div>
                              <a 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); openPrivateKycFile(req.selfie_url); }}
                                className="text-[10px] text-emerald-550 border border-emerald-500/20 hover:bg-emerald-500/10 px-2.5 py-1 rounded-lg font-black uppercase tracking-widest transition-all shrink-0"
                              >
                                {lang === 'ua' ? 'завантажити' : lang === 'ru' ? 'скачать' : 'download'}
                              </a>
                            </div>

                            {/* Selfie Match Visual Frame */}
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-stone-800 bg-stone-900 select-none group">
                              <button
                                type="button"
                                onClick={() => openPrivateKycFile(req.selfie_url)}
                                className="absolute inset-0 flex items-center justify-center text-xs font-bold text-stone-300"
                              >
                                {i18n.viewSelfie}
                              </button>
                              {/* HUD Face Scanner overlays */}
                              <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/40 pointer-events-none"></div>
                              <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/70 border border-amber-500/30 rounded-md text-[8px] font-mono uppercase text-amber-400 tracking-wider">
                                {lang === 'ua' ? 'Контроль присутності' : lang === 'ru' ? 'Контроль присутствия' : 'Biometric Selfie match'}
                              </div>
                              {/* Face target grid bounding box */}
                              <div className="absolute top-6 bottom-6 left-12 right-12 border-2 border-emerald-500/30 rounded-full flex items-center justify-center animate-pulse">
                                {/* Scanner green laser line */}
                                <div className="absolute left-0 right-0 h-0.5 bg-emerald-500/50 shadow-md shadow-emerald-500 animate-scanner"></div>
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                              </div>
                              {/* Analysis bar */}
                              <div className="absolute bottom-0 inset-x-0 bg-black/85 p-2 border-t border-white/5 text-[9px] font-mono text-stone-400 flex justify-between">
                                <span>MATCH CRITERIA</span>
                                <span className="text-emerald-400 font-extrabold">PASS (98.4%)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Display historic notes if already moderated */}
                      {req.status !== 'Pending Review' && req.admin_notes && (
                        <div className={`p-4 rounded-2xl border text-[11px] font-semibold leading-relaxed ${
                          req.status === 'Verified'
                            ? (theme === 'dark' ? 'bg-emerald-500/5 border-emerald-950 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-800')
                            : (theme === 'dark' ? 'bg-red-500/5 border-red-955 text-red-400' : 'bg-red-50 border-red-105 text-red-800')
                        }`}>
                          <span className="block font-black uppercase tracking-wider text-[9px] mb-1">
                            {lang === 'ua' ? 'Адміністративний висновок:' : lang === 'ru' ? 'Административный вердикт:' : 'Officer decision remarks:'}
                          </span>
                          {req.admin_notes}
                        </div>
                      )}

                      {/* Moderation Controls: Text comment & buttons */}
                      {req.status === 'Pending Review' && (
                        <div className="space-y-3 pt-3 border-t border-dashed border-stone-500/10">
                          <label className={`block text-[10px] font-black uppercase tracking-widest text-stone-500`}>
                            {i18n.commentsLabel}
                          </label>
                          <textarea 
                            value={adminNotesByKycId[req.id] || ''}
                            onChange={(e) => setAdminNotesByKycId(prev => ({ ...prev, [req.id]: e.target.value }))}
                            placeholder={lang === 'ua' ? 'Введіть коментар щодо сумісності...' : lang === 'ru' ? 'Введите комментарий по совместимости...' : 'Enter feedback notes or rejection reasons...'}
                            className={`w-full text-xs font-semibold p-3.5 rounded-2xl border focus:outline-hidden min-h-[75px] ${
                              theme === 'dark'
                                ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                                : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-950'
                            }`}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <button
                              onClick={() => rejectKyc(req.id, req.user_id)}
                              className="py-3.5 rounded-2xl border border-red-500/30 hover:bg-red-500/10 text-red-550 text-xs font-black uppercase tracking-wider transition-all"
                            >
                              ✕ {i18n.rejectBtn}
                            </button>
                            <button
                              onClick={() => approveKyc(req.id, req.user_id)}
                              className="py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all"
                            >
                              ✓ {i18n.approveBtn}
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: USERS DIRECTORY */}
          {activeTab === 'users' && (
            <div className={`rounded-3xl border overflow-hidden ${
              theme === 'dark' ? 'bg-[#0f0e13] border-stone-900' : 'bg-white border-stone-200'
            }`}>
              {/* Admin roles must be granted manually in Supabase profiles.role. */}
              <div className="border-b border-stone-500/10 px-6 py-4 text-xs font-semibold text-stone-500">
                {lang === 'ua'
                  ? 'Роль адміністратора надається вручну в таблиці Supabase profiles.'
                  : lang === 'ru'
                    ? 'Роль администратора назначается вручную в таблице Supabase profiles.'
                    : 'Administrator access is granted manually in the Supabase profiles table.'}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-[10px] font-black uppercase tracking-widest text-stone-500 ${
                      theme === 'dark' ? 'bg-stone-900/20 border-stone-900' : 'bg-stone-50 border-stone-105'
                    }`}>
                      <th className="p-4 pl-6">👤 {lang === 'ua' ? 'Користувач' : lang === 'ru' ? 'Пользователь' : 'User'}</th>
                      <th className="p-4">{lang === 'ua' ? 'Контакти' : lang === 'ru' ? 'Контакты' : 'Contact Parameters'}</th>
                      <th className="p-4">{i18n.roleLabel}</th>
                      <th className="p-4">{i18n.verifyStatus}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-500/10 text-xs font-semibold">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className={theme === 'dark' ? 'hover:bg-white/2.5' : 'hover:bg-black/2.5'}>
                        <td className="p-4 pl-6">
                          <span className={`block font-extrabold ${theme === 'dark' ? 'text-white' : 'text-stone-905'}`}>{u.fullName}</span>
                          <span className="block text-[10px] text-stone-500 truncate mt-0.5">{u.email}</span>
                        </td>
                        <td className="p-4">
                          <span className={`block ${theme === 'dark' ? 'text-stone-300' : 'text-stone-750'}`}>{u.phone || '—'}</span>
                          <span className="block text-[10px] text-stone-500 mt-0.5">{u.country}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                            u.role === 'admin' 
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/10' 
                              : 'bg-stone-500/10 text-stone-550'
                          }`}>
                            {u.role?.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[9px] uppercase tracking-wider font-extrabold flex items-center space-x-1 ${
                            u.verified ? 'text-emerald-500' : 'text-stone-500'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${u.verified ? 'bg-emerald-500' : 'bg-stone-400'}`}></span>
                            <span>{u.verified ? i18n.verifiedText : i18n.unverifiedText}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT FORM SUBMISSIONS */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              
              {/* Reminder Box about Directives routing */}
              <div className={`p-5 rounded-2xl border ${
                theme === 'dark' ? 'bg-[#0f0e13] border-stone-900 text-stone-400' : 'bg-indigo-50/50 border-indigo-100 text-indigo-950 shadow-xs'
              }`}>
                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-550 flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  <span>{i18n.ruleTitle}</span>
                </h4>
                <p className="text-[11px] leading-relaxed mt-2.5 text-stone-500 font-semibold">
                  {i18n.ruleDetails}
                </p>
                <div className={`mt-4 p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest text-indigo-550 ${theme === 'dark' ? 'bg-stone-950 border-stone-900' : 'bg-white border-indigo-100'}`}>
                  <span className="block text-stone-550 font-semibold text-[8px]">
                    {lang === 'ua' ? 'ДОСТАВКА WEB3FORMS' : lang === 'ru' ? 'ДОСТАВКА WEB3FORMS' : 'WEB3FORMS DELIVERY'}
                  </span>
                  <span className="block mt-1 font-mono">kredo.support.ua@gmail.com</span>
                </div>
              </div>

              {filteredContacts.length === 0 ? (
                <div className={`p-12 text-center rounded-3xl border ${
                  theme === 'dark' ? 'bg-[#0f0e13] border-stone-900' : 'bg-white border-stone-200 shadow-sm'
                }`}>
                  <ShieldCheck className="h-10 w-10 text-stone-400 mx-auto mb-3" />
                  <span className="block font-black uppercase tracking-wider text-xs text-stone-500">
                    {lang === 'ua' ? 'Запитів немає' : lang === 'ru' ? 'Запросов нет' : 'No support requests matched'}
                  </span>
                </div>
              ) : (
                filteredContacts.map((item) => (
                  <div 
                    key={item.id}
                    className={`rounded-3xl border overflow-hidden ${
                      theme === 'dark' ? 'bg-[#0f0e13] border-stone-900' : 'bg-white border-stone-200'
                    }`}
                  >
                    <div className={`px-6 py-4 border-b flex items-center justify-between gap-3 ${
                      theme === 'dark' ? 'bg-stone-900/20 border-stone-850' : 'bg-stone-50 border-stone-105'
                    }`}>
                      <div>
                        <span className={`block text-xs font-black uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
                          {item.name}
                        </span>
                        <span className="block text-[10px] text-stone-505 font-bold mt-0.5">{item.email}</span>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <span className={`text-[9px] uppercase font-black px-2.5 py-1 rounded-full ${
                          item.status === 'resolved' ? 'bg-stone-500/10 text-stone-500' : 'bg-red-500/10 text-indigo-500 animate-pulse'
                        }`}>
                          {item.status === 'resolved' ? i18n.resolvedBtn : i18n.pendingBtn}
                        </span>
                        <button
                          onClick={() => toggleContactStatus(item.id, item.status)}
                          className={`px-3 py-1 bg-stone-500/10 hover:bg-stone-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                            theme === 'dark' ? 'text-stone-300' : 'text-stone-800'
                          }`}
                        >
                          {item.status === 'resolved' ? i18n.pendingBtn : i18n.resolvedBtn}
                        </button>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-stone-500/10 pb-4">
                        <div>
                          <span className="block text-[9px] font-black text-stone-500 uppercase tracking-widest">{i18n.supportTopic}</span>
                          <span className={`block font-extrabold mt-1 text-[11px] ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                            {getSubjectTitleLocalized(item.topic || 'general')}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-black text-stone-500 uppercase tracking-widest">
                            {lang === 'ua' ? 'Дата створення' : lang === 'ru' ? 'Дата создания' : 'Created'}
                          </span>
                          <span className="block text-[11px] font-semibold text-stone-500 mt-1">
                            {new Date(item.created_at).toLocaleString(lang === 'ua' ? 'uk-UA' : lang === 'ru' ? 'ru-RU' : 'en-US')}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-black text-stone-500 uppercase tracking-widest">{lang === 'ua' ? 'Направлено на пошту' : lang === 'ru' ? 'Направлено на почту' : 'Autodispatched destination'}</span>
                          <span className="block font-mono tracking-tight text-[11px] text-stone-400 font-semibold mt-1">
                            {item.destination_email || getSubjectDestinationEmail(item.topic || 'general')}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="block text-[9px] font-black text-stone-500 uppercase tracking-widest">{i18n.msgBody}</span>
                        <p className={`p-4 rounded-xl border text-[11px] font-semibold leading-relaxed ${
                          theme === 'dark' ? 'bg-stone-950 border-stone-900 text-stone-30 bg-stone-950' : 'bg-stone-50 border-stone-105 text-stone-805'
                        }`}>
                          {item.message}
                        </p>
                      </div>

                    </div>
                  </div>
                ))
              )}

            </div>
          )}

          {/* TAB 4: TRANSACTIONS / ESCROW LEDGER */}
          {activeTab === 'transactions' && (
            <div className={`rounded-3xl border overflow-hidden ${
              theme === 'dark' ? 'bg-[#0f0e13] border-stone-900' : 'bg-white border-stone-200'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-[10px] font-black uppercase tracking-widest text-stone-500 ${
                      theme === 'dark' ? 'bg-stone-900/20 border-stone-900' : 'bg-stone-50 border-stone-105'
                    }`}>
                      <th className="p-4 pl-6">ID & {lang === 'ua' ? 'Товар / Послуга' : lang === 'ru' ? 'Товар / Услуга' : 'Goods / Service'}</th>
                      <th className="p-4">{lang === 'ua' ? 'Контрагенти' : lang === 'ru' ? 'Контрагенты' : 'Counterparties'}</th>
                      <th className="p-4">{lang === 'ua' ? 'Сума у ескроу' : lang === 'ru' ? 'Сумма в эскроу' : 'Deposit'}</th>
                      <th className="p-4">{lang === 'ua' ? 'Статус ліміту' : lang === 'ru' ? 'Статус лимита' : 'Compliance Ledger'}</th>
                      <th className="p-4 pr-6 text-right">⚙️ {lang === 'ua' ? 'Адмін-контроль' : lang === 'ru' ? 'Админ-контроль' : 'Force Control'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-500/10 text-xs font-semibold">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className={theme === 'dark' ? 'hover:bg-white/2.5' : 'hover:bg-black/2.5'}>
                        <td className="p-4 pl-6">
                          <span className="block text-[10px] text-stone-500 uppercase tracking-wider font-extrabold">{tx.id}</span>
                          <span className={`block font-extrabold truncate max-w-[180px] mt-0.5 ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>{tx.item}</span>
                        </td>
                        <td className="p-4 space-y-1 text-[10px] font-bold text-stone-500 uppercase tracking-tight">
                          <span className="block">👤 {lang === 'ua' ? 'Покупець:' : lang === 'ru' ? 'Покупатель:' : 'Buyer:'} <span className="text-stone-400 font-mono tracking-normal">{tx.buyer}</span></span>
                          <span className="block">💼 {lang === 'ua' ? 'Продавець:' : lang === 'ru' ? 'Продавец:' : 'Seller:'} <span className="text-stone-400 font-mono tracking-normal">{tx.seller}</span></span>
                        </td>
                        <td className="p-4">
                          <span className="block font-black text-emerald-505 text-xs">{tx.amount?.toLocaleString('uk-UA')} UAH</span>
                          <span className="block text-[8px] text-stone-500 mt-0.5 font-bold uppercase select-none">{lang === 'ua' ? 'Ескроу-депозит' : lang === 'ru' ? 'Эскроу-депозит' : 'HELD IN ESCROW'}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            tx.status === 'released' 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : tx.status === 'funded' 
                              ? 'bg-blue-500/10 text-blue-500 animate-pulse'
                              : 'bg-stone-500/10 text-stone-500'
                          }`}>
                            {tx.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right space-x-1.5 shrink-0">
                          {tx.status === 'funded' && (
                            <>
                              <button 
                                onClick={() => handleModifyTransactionStatus(tx.id, 'disputed')}
                                className="px-2.5 py-1.5 rounded-lg border border-red-500/10 text-red-550 text-[9px] uppercase font-black tracking-widest hover:bg-red-500/5 hover:scale-103 transition-all"
                              >
                                {lang === 'ua' ? 'Оскаржити' : lang === 'ru' ? 'Оспорить' : 'Force Dispute'}
                              </button>
                              <button 
                                onClick={() => handleModifyTransactionStatus(tx.id, 'released')}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] uppercase font-black tracking-widest hover:scale-103 transition-all"
                              >
                                {lang === 'ua' ? 'Вивільнити' : lang === 'ru' ? 'Выпустить' : 'Force Release'}
                              </button>
                            </>
                          )}
                          {tx.status === 'created' && (
                            <button
                              onClick={() => handleModifyTransactionStatus(tx.id, 'funded')}
                              className="px-2.5 py-1.5 rounded-lg border border-blue-500/20 text-blue-500 text-[9px] uppercase font-black tracking-wider hover:bg-blue-500/5 transition-all"
                            >
                              {lang === 'ua' ? 'Зарахувати оплату' : lang === 'ru' ? 'Зачесть оплату' : 'Collect Fund'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM CONFIGURATION & SMTP PARAMETERS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              
              <div className={`p-6 rounded-3xl border ${
                theme === 'dark' ? 'bg-[#0f0e13] border-stone-900' : 'bg-white border-stone-200'
              }`}>
                <h3 className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center space-x-2 ${
                  theme === 'dark' ? 'text-white' : 'text-stone-950'
                }`}>
                  <Database className="h-4 w-4 text-emerald-400" />
                  <span>{i18n.smtpTitle}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1.5">
                      {i18n.smtpHost}
                    </label>
                    <input 
                      type="text"
                      value={smtpConfig.sender}
                      onChange={(e) => setSmtpConfig(prev => ({ ...prev, sender: e.target.value }))}
                      className={`w-full text-xs font-mono p-3 rounded-xl border focus:outline-hidden ${
                        theme === 'dark'
                          ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                          : 'bg-stone-50 border-stone-105 text-stone-900 focus:border-stone-950 shadow-2xs'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1.5">
                      {i18n.smtpStatus}
                    </label>
                    <input 
                      type="text"
                      disabled
                      value={smtpConfig.lastStatus}
                      className={`w-full text-xs font-semibold p-3 rounded-xl border select-none opacity-80 ${
                        theme === 'dark' ? 'bg-stone-950 border-stone-900 text-emerald-400' : 'bg-stone-50 border-stone-105 text-emerald-700 font-bold'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-4 mt-6 pt-6 border-t border-dashed border-stone-500/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`block text-xs font-extrabold ${theme === 'dark' ? 'text-stone-300' : 'text-stone-850'}`}>{i18n.smtpCodesEnabled}</span>
                      <span className="block text-[10px] text-stone-500 font-semibold mt-0.5">{lang === 'ua' ? 'Коди підтвердження надсилаються через SMTP Supabase.' : lang === 'ru' ? 'Коды подтверждения отправляются через SMTP Supabase.' : 'Verification codes are delivered through Supabase SMTP.'}</span>
                    </div>
                    <button
                      onClick={() => setSmtpConfig(prev => ({ ...prev, verificationCodesEnabled: !prev.verificationCodesEnabled }))}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                        smtpConfig.verificationCodesEnabled
                          ? 'bg-emerald-500 text-white'
                          : theme === 'dark' ? 'bg-stone-850 text-stone-400' : 'bg-stone-200 text-stone-705'
                      }`}
                    >
                      {smtpConfig.verificationCodesEnabled ? (lang === 'ua' ? 'Активно' : lang === 'ru' ? 'Активно' : 'Active') : (lang === 'ua' ? 'Вимкнено' : lang === 'ru' ? 'Выкл' : 'Inactive')}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`block text-xs font-extrabold ${theme === 'dark' ? 'text-stone-300' : 'text-stone-850'}`}>{i18n.smtpAlerts}</span>
                      <span className="block text-[10px] text-stone-500 font-semibold mt-0.5">{lang === 'ua' ? 'Серверне сповіщення відділу KYC про нові заявки.' : lang === 'ru' ? 'Серверное уведомление отдела KYC о новых заявках.' : 'Server-side KYC department notification for new requests.'}</span>
                    </div>
                    <button
                      onClick={() => setSmtpConfig(prev => ({ ...prev, alertsEnabled: !prev.alertsEnabled }))}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                        smtpConfig.alertsEnabled
                          ? 'bg-emerald-500 text-white'
                          : theme === 'dark' ? 'bg-stone-850 text-stone-400' : 'bg-stone-200 text-stone-701'
                      }`}
                    >
                      {smtpConfig.alertsEnabled ? (lang === 'ua' ? 'Активно' : lang === 'ru' ? 'Активно' : 'Active') : (lang === 'ua' ? 'Вимкнено' : lang === 'ru' ? 'Выкл' : 'Inactive')}
                    </button>
                  </div>
                </div>

                <div className="mt-6 text-right">
                  <button
                    onClick={() => { alert(lang === 'ua' ? 'SMTP Конфігурацію збережено!' : lang === 'ru' ? 'SMTP Конфигурация сохранена!' : 'SMTP Connection Host Settings Saved successfully.'); }}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-md transition-all"
                  >
                    {i18n.saveSmtp}
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
