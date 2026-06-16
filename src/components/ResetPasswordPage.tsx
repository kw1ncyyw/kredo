/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react';
import { AppTheme, Language, RoutePath } from '../types';
import { i18nDict } from '../messages';
import { KredoAuth } from '../supabase';
import { isSafePasswordCharset, normalizePasswordInput, passwordCharsetError } from '../passwordPolicy';

interface ResetPasswordPageProps {
  lang: Language;
  theme: AppTheme;
  setRoute: (route: RoutePath) => void;
}

export default function ResetPasswordPage({ lang, theme, setRoute }: ResetPasswordPageProps) {
  const t = i18nDict[lang].security;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const cleanedPassword = normalizePasswordInput(password);
    const cleanedConfirmPassword = normalizePasswordInput(confirmPassword);

    if (!cleanedPassword || !cleanedConfirmPassword) {
      setError(t.fillFields);
      return;
    }
    if (!isSafePasswordCharset(cleanedPassword) || !isSafePasswordCharset(cleanedConfirmPassword)) {
      setError(passwordCharsetError(lang));
      return;
    }
    if (cleanedPassword.length < 8) {
      setError(t.passwordLength);
      return;
    }
    if (cleanedPassword !== cleanedConfirmPassword) {
      setError(t.passwordsMismatch);
      return;
    }

    setLoading(true);
    try {
      const result = await KredoAuth.updateRecoveryPassword(cleanedPassword, lang);
      if (!result.success) {
        setError(result.error || t.unexpectedError);
        return;
      }
      setSuccess(t.passwordUpdated);
      setPassword('');
      setConfirmPassword('');
      window.setTimeout(() => setRoute('login'), 1200);
    } catch (requestError) {
      console.error('Password recovery update failed:', requestError);
      setError(t.unexpectedError);
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = theme === 'dark'
    ? 'border-stone-800 bg-stone-950 text-white focus:border-emerald-500/70'
    : 'border-stone-200 bg-stone-50 text-stone-950 focus:border-emerald-500';

  return (
    <main className={`flex min-h-screen items-center justify-center px-4 pb-16 pt-28 ${theme === 'dark' ? 'bg-[#030303]' : 'bg-stone-50'}`}>
      <div className={`w-full max-w-md rounded-[28px] border p-6 sm:p-8 ${
        theme === 'dark'
          ? 'border-stone-800 bg-[#090909] shadow-[0_24px_70px_rgba(0,0,0,0.35)]'
          : 'border-stone-200 bg-white shadow-[0_24px_70px_rgba(28,25,23,0.09)]'
      }`}>
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 w-fit rounded-2xl bg-emerald-500/10 p-3 text-emerald-500">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <h1 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>{t.resetTitle}</h1>
          <p className={`mt-2 text-sm leading-6 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>{t.resetDescription}</p>
        </div>

        {error && (
          <div className="mb-5 flex gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm font-semibold text-rose-500">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-5 flex gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-500">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            {
              label: t.newPassword,
              value: password,
              setValue: setPassword,
              visible: showPassword,
              setVisible: setShowPassword,
            },
            {
              label: t.confirmPassword,
              value: confirmPassword,
              setValue: setConfirmPassword,
              visible: showConfirmPassword,
              setVisible: setShowConfirmPassword,
            },
          ].map((field) => (
            <label key={field.label} className="block">
              <span className={`mb-2 block text-sm font-bold ${theme === 'dark' ? 'text-stone-300' : 'text-stone-700'}`}>{field.label}</span>
              <div className="relative">
                <input
                  type={field.visible ? 'text' : 'password'}
                  value={field.value}
                  onChange={(event) => field.setValue(event.target.value)}
                  autoComplete="new-password"
                  disabled={loading || !!success}
                  className={`min-h-12 w-full rounded-2xl border px-4 pr-12 text-sm font-semibold outline-none transition ${fieldClass}`}
                />
                <button
                  type="button"
                  onClick={() => field.setVisible(!field.visible)}
                  className="absolute right-3 top-1/2 min-h-10 min-w-10 -translate-y-1/2 rounded-xl p-2 text-stone-500 hover:bg-stone-500/10"
                  aria-label={field.visible ? t.hidePassword : t.showPassword}
                >
                  {field.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
          ))}

          <button type="submit" disabled={loading || !!success} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-500 disabled:opacity-50">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.saveNewPassword}
          </button>
        </form>
      </div>
    </main>
  );
}
