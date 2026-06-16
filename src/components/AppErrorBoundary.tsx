import React from 'react';
import { Language } from '../types';

type AppErrorBoundaryState = {
  hasError: boolean;
};

const fallbackCopy = {
  ua: {
    message: 'Щось пішло не так. Оновіть сторінку або поверніться до входу.',
    refresh: 'Оновити сторінку',
    login: 'Повернутися до входу',
  },
  ru: {
    message: 'Что-то пошло не так. Обновите страницу или вернитесь к входу.',
    refresh: 'Обновить страницу',
    login: 'Вернуться ко входу',
  },
  en: {
    message: 'Something went wrong. Refresh the page or return to sign in.',
    refresh: 'Refresh page',
    login: 'Back to login',
  },
};

function detectLanguage(): Language {
  try {
    if (typeof window !== 'undefined') {
      const pathLang = window.location.pathname.split('/').filter(Boolean)[0];
      if (pathLang === 'ua' || pathLang === 'ru' || pathLang === 'en') return pathLang;
      const stored = window.localStorage?.getItem('safedeal_lang');
      if (stored === 'ua' || stored === 'ru' || stored === 'en') return stored;
    }
  } catch {
    return 'ua';
  }
  return 'ua';
}

export default class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('KREDO app render error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const lang = detectLanguage();
    const t = fallbackCopy[lang];
    const goLogin = () => {
      if (typeof window !== 'undefined') {
        window.location.href = `/${lang}/login`;
      }
    };
    const refresh = () => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    };

    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 text-stone-950">
        <section className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-6 text-center shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
            !
          </div>
          <p className="mt-4 text-base font-black">{t.message}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button onClick={refresh} className="min-h-12 rounded-2xl bg-stone-950 px-4 text-sm font-bold text-white">
              {t.refresh}
            </button>
            <button onClick={goLogin} className="min-h-12 rounded-2xl border border-stone-200 px-4 text-sm font-bold text-stone-800">
              {t.login}
            </button>
          </div>
        </section>
      </main>
    );
  }
}
