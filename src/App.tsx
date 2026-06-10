/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useState, useEffect, useCallback, useRef } from 'react';
import { RoutePath, Language, AppTheme, UserProfile, EscrowDeal, SystemNotification, DealStatus } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import WhyTrust from './components/WhyTrust';
import SupportedIndustries from './components/SupportedIndustries';
import Statistics from './components/Statistics';
import FAQAccordion from './components/FAQAccordion';
import CTABanner from './components/CTABanner';
import LoginRegister from './components/LoginRegister';
import DashboardSettings from './components/Dashboard';
import CreateDealForm from './components/CreateDealForm';
import UserProfileSettings from './components/UserProfile';
import SettingsView from './components/SettingsView';
import NotificationsView from './components/NotificationsView';
import CommissionCalculator from './components/CommissionCalculator';
import ContactPage from './components/ContactPage';
import AccountLayout from './components/AccountLayout';
import SecurityView from './components/SecurityView';
import ResetPasswordPage from './components/ResetPasswordPage';
import AboutPage from './components/AboutPage';
import HowItWorksPage from './components/HowItWorksPage';
import BusinessInfoPage from './components/BusinessInfoPage';
import CookieConsent from './components/CookieConsent';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';
import DisputesPage from './components/DisputesPage';
import { KredoAuth, KredoData, isSupabaseConfigured, supabase } from './supabase';

const Transactions = lazy(() => import('./components/Transactions'));
const VerificationKYC = lazy(() => import('./components/VerificationKYC'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));

// Initial preloaded mock deals for beautiful simulation
const INITIAL_DEALS: EscrowDeal[] = [];

const INITIAL_NOTIFICATIONS: SystemNotification[] = [];

export default function App() {
  // 1. Language States
  const [lang, setLang] = useState<Language>('ua');

  // 2. Theme States
  const [theme, setTheme] = useState<AppTheme>('light');

  // 3. Routing States
  const [currentRoute, setRoute] = useState<RoutePath>('home');
  const [routingReady, setRoutingReady] = useState(false);

  // 4. Auth client state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // 5. Escrows & notific arrays
  const [deals, setDeals] = useState<EscrowDeal[]>(INITIAL_DEALS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);

  // 6. Selected deal trace state on transitions
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  const routeInitializationStarted = useRef(false);
  const sessionRestoreStarted = useRef(false);
  const notificationsLoadedFor = useRef<string | null>(null);

  // Auto path checking URL routing for `/ua`, `/en`, `/ru` prefixes
  useEffect(() => {
    if (routeInitializationStarted.current) return;
    routeInitializationStarted.current = true;

    const checkPathForLangAndRoute = () => {
      const pathname = window.location.pathname;
      const parts = pathname.split('/').filter(Boolean);
      let detectedLang: Language = 'ua';
      let detectedRoute: RoutePath = 'home';

      // 1. Parse language
      if (parts[0] === 'en' || parts[0] === 'ua' || parts[0] === 'ru') {
        detectedLang = parts[0] as Language;
      } else {
        // Retrieve or detect
        const stored = localStorage.getItem('safedeal_lang') as Language;
        if (stored === 'ua' || stored === 'en' || stored === 'ru') {
          detectedLang = stored;
        } else {
          // Detect browser locale
          const browserLang = navigator.language?.substring(0, 2).toLowerCase();
          detectedLang = (browserLang === 'uk' || browserLang === 'ua') ? 'ua' : browserLang === 'ru' ? 'ru' : 'ua'; // Standard default to Ukrainian
        }
      }

      // 2. Parse route
      if (parts[1]) {
        const routeCand = parts[1].toLowerCase();
        const validRoutes: RoutePath[] = [
          'home', 'security', 'solutions', 'pricing', 'faq', 'contact', 'reset-password',
          'login', 'register', 'dashboard', 'create-deal', 'transactions', 'profile',
          'notifications', 'settings', 'about', 'business-info', 'verification', 'terms', 'privacy', 'disputes', 'admin'
        ];
        if (validRoutes.includes(routeCand as RoutePath)) {
          detectedRoute = routeCand as RoutePath;
        }
      } else if (parts[0] && parts[0] !== 'en' && parts[0] !== 'ua' && parts[0] !== 'ru') {
        const routeCand = parts[0].toLowerCase();
        const validRoutes: RoutePath[] = [
          'home', 'security', 'solutions', 'pricing', 'faq', 'contact', 'reset-password',
          'login', 'register', 'dashboard', 'create-deal', 'transactions', 'profile',
          'notifications', 'settings', 'about', 'business-info', 'verification', 'terms', 'privacy', 'disputes', 'admin'
        ];
        if (validRoutes.includes(routeCand as RoutePath)) {
          detectedRoute = routeCand as RoutePath;
        }
      }

      setLang(detectedLang);
      localStorage.setItem('safedeal_lang', detectedLang);
      setRoute(detectedRoute);
      setRoutingReady(true);

      // Handle direct hash navigation on mount
      if (window.location.hash) {
        setTimeout(() => {
          const hashId = window.location.hash.substring(1);
          const element = document.getElementById(hashId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      } else {
        const finalRoutePart = detectedRoute === 'home' ? '' : `/${detectedRoute}`;
        window.history.replaceState(null, '', `/${detectedLang}${finalRoutePart}`);
      }
    };

    checkPathForLangAndRoute();
  }, []);

  // Update URL state
  useEffect(() => {
    if (!routingReady) return;
    const finalRoutePart = currentRoute === 'home' ? '' : `/${currentRoute}`;
    const expectedPath = `/${lang}${finalRoutePart}`;
    if (window.location.pathname !== expectedPath) {
      window.history.pushState(null, '', `${expectedPath}${window.location.hash || ''}`);
    }
  }, [currentRoute, lang, routingReady]);

  // Support browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      const parts = pathname.split('/').filter(Boolean);
      let detectedLang: Language = 'ua';
      let detectedRoute: RoutePath = 'home';

      if (parts[0] === 'en' || parts[0] === 'ua' || parts[0] === 'ru') {
        detectedLang = parts[0] as Language;
      }
      if (parts[1]) {
        const routeCand = parts[1].toLowerCase();
        const validRoutes: RoutePath[] = [
          'home', 'security', 'solutions', 'pricing', 'faq', 'contact', 'reset-password',
          'login', 'register', 'dashboard', 'create-deal', 'transactions', 'profile',
          'notifications', 'settings', 'about', 'business-info', 'verification', 'terms', 'privacy', 'disputes', 'admin'
        ];
        if (validRoutes.includes(routeCand as RoutePath)) {
          detectedRoute = routeCand as RoutePath;
        }
      }
      setLang(detectedLang);
      setRoute(detectedRoute);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Always reset scroll to the top of the window instantly on route change (navigation)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [currentRoute]);

  const setLanguageByPrefix = useCallback((newLang: string) => {
    localStorage.setItem('safedeal_lang', newLang);
    setLang(newLang as Language);
  }, []);

  // Restore local UI state and authentication once on initial mount.
  useEffect(() => {
    if (sessionRestoreStarted.current) return;
    sessionRestoreStarted.current = true;

    const storedDeals = localStorage.getItem('safedeal_deals');
    const storedNotifications = localStorage.getItem('safedeal_notifs');
    const storedTheme = localStorage.getItem('safedeal_theme') as AppTheme;

    try {
      if (storedDeals) setDeals(JSON.parse(storedDeals));
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
    } catch {
      localStorage.removeItem('safedeal_deals');
      localStorage.removeItem('safedeal_notifs');
    }
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      // Default to crisp light theme as per prompt design guidelines
      setTheme('light');
    }

    KredoAuth.restoreSession()
      .then(({user: restoredUser, expired, mfaRequired}) => {
       if (restoredUser) {
         setUser(restoredUser);
         setIsLoggedIn(true);
       } else if (mfaRequired) {
          setIsLoggedIn(false);
          setUser(null);
          setRoute('login');
       } else if (expired) {
          setIsLoggedIn(false);
          setUser(null);
          const routeLanguage = window.location.pathname.split('/').filter(Boolean)[0];
          alert(routeLanguage === 'ru'
            ? 'Сессия закончилась. Войдите снова.'
            : routeLanguage === 'en'
              ? 'Session expired. Please log in again.'
              : 'Сесія закінчилась. Увійдіть повторно.');
       }
      })
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsLoggedIn(false);
        setUser(null);
        setRoute('reset-password');
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (
      currentRoute === 'admin'
      && isLoggedIn
      && user
      && (!isSupabaseConfigured || user.role !== 'admin')
    ) {
      setRoute('dashboard');
    }
  }, [currentRoute, isLoggedIn, user]);

  // Save states modifications to local storage
  useEffect(() => {
    localStorage.setItem('safedeal_deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('safedeal_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (!isSupabaseConfigured || !user) {
      notificationsLoadedFor.current = null;
      return;
    }
    if (notificationsLoadedFor.current === user.id) return;
    notificationsLoadedFor.current = user.id;

    KredoData.listUserNotifications(user.id).then((result) => {
      if (!result.success) {
        notificationsLoadedFor.current = null;
        return;
      }
      const mapped: SystemNotification[] = result.notifications.map((item: any) => {
        const rejected = item.title?.toLowerCase().includes('rejected');
        return {
          id: String(item.id),
          title: {
            ua: rejected ? 'KYC відхилено' : 'KYC підтверджено',
            ru: rejected ? 'KYC отклонён' : 'KYC подтверждён',
            en: rejected ? 'KYC rejected' : 'KYC verified',
          },
          description: { ua: item.message, ru: item.message, en: item.message },
          time: item.created_at,
          read: !!item.is_read,
          type: rejected ? 'warning' : 'success',
        };
      });
      setNotifications(mapped);
    });
  }, [user?.id]);

  // Synchronize CSS class on HTML body tag for complete transitions
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#030303';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#fafafa';
    }
    localStorage.setItem('safedeal_theme', theme);
  }, [theme]);

  // UI Actions Dispatchers
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const loginUser = (profile: UserProfile) => {
    setUser(profile);
    setIsLoggedIn(true);
    localStorage.setItem('safedeal_user', JSON.stringify(profile));
  };

  const logout = () => {
    void KredoAuth.signOut();
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('safedeal_user');
    setRoute('home');
  };

  const addNewDeal = (deal: EscrowDeal) => {
    setDeals((currentDeals) => [deal, ...currentDeals]);

    // Create a matching notification log
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: {
        ua: 'Ініційовано нову угоду',
        en: 'New Escrow Initiated',
        ru: 'Инициирована новая сделка',
      },
      description: {
        ua: `Ви успішно створили угоду "${deal.title}" з контрагентом ${deal.partnerName}.`,
        en: `You successfully launched the secured escrow "${deal.title}" with partner ${deal.partnerName}.`,
        ru: `Вы успешно создали сделку "${deal.title}" с контрагентом ${deal.partnerName}.`,
      },
      time: new Date().toISOString().replace('T', ' ').split('.')[0].substring(0, 16),
      read: false,
      type: 'info',
    };

    setNotifications((currentNotifications) => [newNotif, ...currentNotifications]);
  };

  const updateDealStatus = (dealId: string, status: DealStatus, systemMsg?: string) => {
    setDeals((currentDeals) => currentDeals.map(deal => {
      if (deal.id === dealId) {
        let messages = [...deal.messages];
        if (systemMsg) {
          messages.push({
            id: `msg-sys-${Date.now()}`,
            sender: 'system',
            text: systemMsg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        }
        return {
          ...deal,
          status,
          messages,
        };
      }
      return deal;
    }));

    // Create a matching system notification log
    const match = deals.find(d => d.id === dealId);
    if (match) {
      const isRelease = status === 'released';
      const balanceChange = isRelease && match.role === 'seller' ? match.amount : 0;

      if (balanceChange > 0 && user) {
        const updatedProfile = { ...user, balance: user.balance + balanceChange };
        setUser(updatedProfile);
        localStorage.setItem('safedeal_user', JSON.stringify(updatedProfile));
      }

      const statusFriendly = {
        funded: { ua: 'Кошти задепоновано', en: 'Escrow Deposited Verified', ru: 'Депозит занесен' },
        delivered: { ua: 'Позначено як доставлено', en: 'Marked As Delivered', ru: 'Отмечено доставленным' },
        released: { ua: 'Кошти виплачено', en: 'Funds Released Dispensed', ru: 'Выплата осуществлена' },
        disputed: { ua: 'Спір активовано', en: 'Arbitration Dispute Active', ru: 'Активирован диспут' },
        cancelled: { ua: 'Угоду скасовано', en: 'Agreement Cancelled Dismissed', ru: 'Соглашение отменено' },
      };

      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        title: {
          ua: statusFriendly[status as keyof typeof statusFriendly]?.ua || 'Оновлення статусу',
          en: statusFriendly[status as keyof typeof statusFriendly]?.en || 'Escrow status update',
          ru: statusFriendly[status as keyof typeof statusFriendly]?.ru || 'Обновление статуса',
        },
        description: {
          ua: `Статус вашої угоди "${match.title}" оновлено на: ${status.toUpperCase()}.`,
          en: `Your transaction agreement status of "${match.title}" has been updated to: ${status.toUpperCase()}.`,
          ru: `Статус вашего соглашения "${match.title}" обновлен на: ${status.toUpperCase()}.`,
        },
        time: new Date().toISOString().replace('T', ' ').split('.')[0].substring(0, 16),
        read: false,
        type: status === 'disputed' ? 'warning' : status === 'released' ? 'success' : 'info',
      };

      setNotifications((currentNotifications) => [newNotif, ...currentNotifications]);
    }
  };

  const sendDealMessage = (dealId: string, text: string, sender: 'user' | 'partner' | 'system') => {
    setDeals((currentDeals) => currentDeals.map(deal => {
      if (deal.id === dealId) {
        return {
          ...deal,
          messages: [
            ...deal.messages,
            {
              id: `msg-${Date.now()}`,
              sender,
              text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ],
        };
      }
      return deal;
    }));
  };

  const updateProfile = (profileData: Partial<UserProfile>) => {
    if (user) {
      const updated = { ...user, ...profileData };
      setUser(updated);
      localStorage.setItem('safedeal_user', JSON.stringify(updated));
    }
  };

  const triggerValidationSystem = () => {
    if (user) {
      const updated = { ...user, verified: true };
      setUser(updated);
      localStorage.setItem('safedeal_user', JSON.stringify(updated));
    }
  };

  const markAllRead = () => {
    setNotifications((currentNotifications) => currentNotifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((currentNotifications) => currentNotifications.map(
      n => n.id === id ? { ...n, read: true } : n,
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications((currentNotifications) => currentNotifications.filter(n => n.id !== id));
  };

  // Main UI routing layouts blocks
  const renderPageContent = () => {
    switch (currentRoute) {
      case 'home':
        return (
          <>
            <Hero setRoute={setRoute} lang={lang} theme={theme} isLoggedIn={isLoggedIn} />
            
            {/* Embedded Calculator overlapping bottom hero */}
            <div className="relative z-20 -mt-16 pb-12">
              <CommissionCalculator 
                lang={lang} 
                theme={theme} 
                onInitiateDeal={(amount, role, category) => {
                  setRoute(isLoggedIn ? 'create-deal' : 'login');
                }} 
              />
            </div>

            <HowItWorks lang={lang} theme={theme} />
            <FAQAccordion lang={lang} theme={theme} />
          </>
        );
      case 'how-it-works':
        return <HowItWorksPage lang={lang} theme={theme} />;
      case 'terms':
        return <TermsPage lang={lang} theme={theme} />;
      case 'privacy':
        return <PrivacyPage lang={lang} theme={theme} />;
      case 'disputes':
        return <DisputesPage lang={lang} theme={theme} />;
      case 'security':
        return isLoggedIn && user ? (
          <SecurityView
            user={user}
            lang={lang}
            theme={theme}
          />
        ) : (
          <div className="pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 text-center mb-10">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                {lang === 'ua' ? 'БЕЗПЕКА' : lang === 'ru' ? 'БЕЗОПАСНОСТЬ' : 'SECURITY'}
              </span>
              <h1 className={`text-3xl md:text-5xl font-extrabold mt-3 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
                {lang === 'ua' ? 'Гарантії та юридичний захист' : lang === 'ru' ? 'Гарантии и юридическая защита' : 'Guarantees & Legal Protection'}
              </h1>
              <p className={`mt-3 text-xs sm:text-sm font-medium max-w-xl mx-auto ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                {lang === 'ua' ? 'Наша інфраструктура розроблена спільно з провідними експертами для забезпечення повної правової чистоти та захисту угод.' : lang === 'ru' ? 'Наша инфраструктура разработана совместно с ведущими экспертами для обеспечения полной правовой чистоты и защиты сделок.' : 'Our platform is designed in partnership with law professionals to guarantee compliance and lock out fraud risks.'}
              </p>
            </div>
            <WhyTrust lang={lang} theme={theme} />
          </div>
        );
      case 'solutions':
        return (
          <div className="pt-10">
            <SupportedIndustries lang={lang} theme={theme} hideHeader={false} />
            <Statistics lang={lang} theme={theme} />
          </div>
        );
      case 'pricing':
        return (
          <div className="pt-24 pb-16 font-sans">
            <div className="max-w-4xl mx-auto px-4 text-center mb-10">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                {lang === 'ua' ? 'Тарифи' : lang === 'ru' ? 'Тарифы' : 'Pricing'}
              </span>
              <h1 className={`text-3xl md:text-5xl font-extrabold mt-3 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
                {lang === 'ua' ? 'Прозора комісія 2%' : lang === 'ru' ? 'Прозрачная комиссия 2%' : 'Transparent 2% Flat Fee'}
              </h1>
              <p className={`mt-3 text-xs sm:text-sm font-medium max-w-xl mx-auto leading-relaxed ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                {lang === 'ua' ? 'Жодних прихованих платежів, підписок чи абонплати. Платіть лише за фактично завершені угоди.' : lang === 'ru' ? 'Никаких скрытых платежей, подписок или абонплаты. Платите только за фактически завершенные сделки.' : 'No hidden setup fees, recurring invoices or monthly charges. Only pay when your deal is successfully delivered.'}
              </p>
            </div>

            <div className="mb-14">
              <CommissionCalculator 
                lang={lang} 
                theme={theme} 
                onInitiateDeal={(amount, role, category) => {
                  setRoute(isLoggedIn ? 'create-deal' : 'login');
                }}
              />
            </div>

            <div className="max-w-3xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
              <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-stone-900/40 border-stone-850' : 'bg-white border-stone-200'}`}>
                <h3 className={`font-extrabold text-xs uppercase text-emerald-500 tracking-wider mb-2.5`}>
                  {lang === 'ua' ? 'Хто сплачує комісію?' : lang === 'ru' ? 'Кто оплачивает комиссию?' : 'Who pays the fee?'}
                </h3>
                <p className={`text-xs leading-relaxed font-semibold ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                  {lang === 'ua' ? 'Ви можете обрати це під час створення угоди. Комісія може бути повністю сплачена покупцем, повністю продавцем, або розділена навпіл (50/50).' : lang === 'ru' ? 'Вы можете выбрать это при создании сделки. Комиссия может быть полностью оплачена покупателем, полностью продавцом, или разделена поровну (50/50).' : 'You determine this when creating the deal terms. The commission can be paid by the buyer, deducted from the seller, or split equally (50/50) between both parties.'}
                </p>
              </div>
              <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-stone-900/40 border-stone-850' : 'bg-white border-stone-200'}`}>
                <h3 className={`font-extrabold text-xs uppercase text-emerald-500 tracking-wider mb-2.5`}>
                  {lang === 'ua' ? 'Для великих об’ємів' : lang === 'ru' ? 'Для больших объемов' : 'High Volume Transactions'}
                </h3>
                <p className={`text-xs leading-relaxed font-semibold ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                  {lang === 'ua' ? 'Для компаній та партнерів з об’ємами угод від $100,000 на місяць діють індивідуальні знижені тарифи. Зверніться до нашої правової служби.' : lang === 'ru' ? 'Для компаний и партнеров с объемом сделок от $100,000 в месяц действуют индивидуальные сниженные тарифы. Свяжитесь с нашей правовой службой.' : 'We provide volume discount brackets for corporate entities averaging over $100,000 in monthly transactions. Contact our account management team.'}
                </p>
              </div>
            </div>
          </div>
        );
      case 'faq':
        return (
          <div className="pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 text-center mb-10">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                {lang === 'ua' ? 'Питання' : lang === 'ru' ? 'Вопросы' : 'Knowledge Base'}
              </span>
              <h1 className={`text-3xl md:text-5xl font-extrabold mt-3 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
                {lang === 'ua' ? 'Довідковий центр' : lang === 'ru' ? 'Справочный центр' : 'Help & FAQ'}
              </h1>
              <p className={`mt-3 text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                {lang === 'ua' ? 'Швидкі відповіді на всі запитання про безпечне депонування.' : lang === 'ru' ? 'Быстрые ответы на все вопросы о безопасном депонировании.' : 'Instant explanations on absolute security, transit holds, and dispute resolutions.'}
              </p>
            </div>
            <FAQAccordion lang={lang} theme={theme} />
          </div>
        );
      case 'contact':
        return (
          <ContactPage lang={lang} theme={theme} />
        );
      case 'reset-password':
        return <ResetPasswordPage lang={lang} theme={theme} setRoute={setRoute} />;
      case 'login':
      case 'register':
        return (
          <LoginRegister
            setRoute={setRoute}
            lang={lang}
            theme={theme}
            loginUser={loginUser}
            isLoggedIn={isLoggedIn}
            initialViewState={currentRoute === 'register' ? 'register' : 'login'}
          />
        );
      case 'dashboard':
        return isLoggedIn && user ? (
          <DashboardSettings
            user={user}
            deals={deals}
            notifications={notifications}
            setRoute={setRoute}
            lang={lang}
            theme={theme}
            setSelectedDealId={setSelectedDealId}
          />
        ) : (
          <LoginRegister setRoute={setRoute} lang={lang} theme={theme} loginUser={loginUser} isLoggedIn={isLoggedIn} />
        );
      case 'create-deal':
        return isLoggedIn ? (
          <CreateDealForm
            lang={lang}
            theme={theme}
            addNewDeal={addNewDeal}
            setRoute={setRoute}
          />
        ) : (
          <LoginRegister setRoute={setRoute} lang={lang} theme={theme} loginUser={loginUser} isLoggedIn={isLoggedIn} />
        );
      case 'transactions':
        return isLoggedIn ? (
          <Transactions
            deals={deals}
            lang={lang}
            theme={theme}
            updateDealStatus={updateDealStatus}
            sendDealMessage={sendDealMessage}
            selectedDealId={selectedDealId}
            setSelectedDealId={setSelectedDealId}
            setRoute={setRoute}
          />
        ) : (
          <LoginRegister setRoute={setRoute} lang={lang} theme={theme} loginUser={loginUser} isLoggedIn={isLoggedIn} />
        );
      case 'profile':
        return isLoggedIn && user ? (
          <UserProfileSettings
            user={user}
            lang={lang}
            theme={theme}
            updateProfile={updateProfile}
            triggerValidationSystem={triggerValidationSystem}
            setRoute={setRoute}
          />
        ) : (
          <LoginRegister setRoute={setRoute} lang={lang} theme={theme} loginUser={loginUser} isLoggedIn={isLoggedIn} />
        );
      case 'verification':
        return isLoggedIn && user ? (
          <VerificationKYC
            user={user}
            lang={lang}
            theme={theme}
            updateProfile={updateProfile}
            triggerValidationSystem={triggerValidationSystem}
          />
        ) : (
          <LoginRegister setRoute={setRoute} lang={lang} theme={theme} loginUser={loginUser} isLoggedIn={isLoggedIn} />
        );
      case 'admin':
        return isLoggedIn && user ? (
          isSupabaseConfigured && user.role === 'admin' ? (
            <AdminPanel
              user={user}
              lang={lang}
              theme={theme}
              setRoute={setRoute}
              updateProfile={updateProfile}
              notifications={notifications}
            />
          ) : (
            <DashboardSettings
              user={user}
              deals={deals}
              notifications={notifications}
              setRoute={setRoute}
              lang={lang}
              theme={theme}
              setSelectedDealId={setSelectedDealId}
            />
          )
        ) : (
          <LoginRegister setRoute={setRoute} lang={lang} theme={theme} loginUser={loginUser} isLoggedIn={isLoggedIn} />
        );
      case 'settings':
        return isLoggedIn ? (
          <SettingsView
            lang={lang}
            setLang={setLang}
            theme={theme}
            toggleTheme={toggleTheme}
            setLanguageByPrefix={setLanguageByPrefix}
            setRoute={setRoute}
          />
        ) : (
          <LoginRegister setRoute={setRoute} lang={lang} theme={theme} loginUser={loginUser} isLoggedIn={isLoggedIn} />
        );
      case 'notifications':
        return isLoggedIn ? (
          <NotificationsView
            notifications={notifications}
            lang={lang}
            theme={theme}
            markAllRead={markAllRead}
            markAsRead={markAsRead}
            deleteNotification={deleteNotification}
          />
        ) : (
          <LoginRegister setRoute={setRoute} lang={lang} theme={theme} loginUser={loginUser} isLoggedIn={isLoggedIn} />
        );
      case 'about':
        return <AboutPage lang={lang} theme={theme} />;
      case 'business-info':
        return <BusinessInfoPage lang={lang} theme={theme} />;
      default:
        return <Hero setRoute={setRoute} lang={lang} theme={theme} isLoggedIn={isLoggedIn} />;
    }
  };

  const isDashboardRoute = isLoggedIn && [
    'dashboard',
    'transactions',
    'create-deal',
    'verification',
    'notifications',
    'profile',
    'security',
    'settings',
    'admin'
  ].includes(currentRoute);

  const protectedRoutes: RoutePath[] = [
    'dashboard',
    'transactions',
    'create-deal',
    'verification',
    'notifications',
    'profile',
    'security',
    'settings',
    'admin',
  ];
  const pageLoadingText = lang === 'ua'
    ? 'Завантаження кабінету...'
    : lang === 'ru'
      ? 'Загрузка кабинета...'
      : 'Loading account...';
  const pageFallback = (
    <div className="flex min-h-[320px] items-center justify-center">
      <div className={`rounded-2xl border px-5 py-3 text-sm font-semibold shadow-sm ${
        theme === 'dark'
          ? 'border-stone-800 bg-stone-900 text-stone-300'
          : 'border-stone-200 bg-white text-stone-600'
      }`}>
        {pageLoadingText}
      </div>
    </div>
  );

  if (routingReady && protectedRoutes.includes(currentRoute) && !authReady) {
    return (
      <div className={`min-h-screen pt-24 ${theme === 'dark' ? 'bg-[#030303]' : 'bg-stone-50'}`}>
        {pageFallback}
      </div>
    );
  }

  if (isDashboardRoute && user) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#030303]' : 'bg-stone-50'} transition-all duration-300 font-sans`}>
        <Navbar
          currentRoute={currentRoute}
          setRoute={setRoute}
          lang={lang}
          setLang={setLang}
          theme={theme}
          toggleTheme={toggleTheme}
          isLoggedIn={isLoggedIn}
          logout={logout}
          setLanguageByPrefix={setLanguageByPrefix}
        />
        <AccountLayout
            currentRoute={currentRoute}
            setRoute={setRoute}
            user={user}
            notifications={notifications}
            theme={theme}
            lang={lang}
        >
          <Suspense fallback={pageFallback}>
            {renderPageContent()}
          </Suspense>
        </AccountLayout>
        <CookieConsent lang={lang} theme={theme} setRoute={setRoute} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#030303]' : 'bg-stone-50'} transition-all duration-300 font-sans`}>
      <Navbar
        currentRoute={currentRoute}
        setRoute={setRoute}
        lang={lang}
        setLang={setLang}
        theme={theme}
        toggleTheme={toggleTheme}
        isLoggedIn={isLoggedIn}
        logout={logout}
        setLanguageByPrefix={setLanguageByPrefix}
      />
      <main id="app-main-view">
        <Suspense fallback={pageFallback}>
          {renderPageContent()}
        </Suspense>
      </main>
      <Footer currentRoute={currentRoute} setRoute={setRoute} lang={lang} theme={theme} />
      <CookieConsent lang={lang} theme={theme} setRoute={setRoute} />
    </div>
  );
}
