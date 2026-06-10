/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react';
import { AppTheme, Language, UserProfile } from '../types';
import { i18nDict } from '../messages';
import { isSupabaseConfigured, KredoAuth, KredoMfaFactor } from '../supabase';

interface SecurityViewProps {
  user: UserProfile;
  lang: Language;
  theme: AppTheme;
}

type Enrollment = {
  factorId: string;
  qrCode: string;
  secret: string;
  uri: string;
};

async function resolveQrImage(qrCode: string | undefined, uri: string | undefined): Promise<string> {
  const source = qrCode?.trim() || '';
  if (source.startsWith('data:image/')) return source;
  if (source.startsWith('<svg') || source.startsWith('<?xml')) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
  }
  if (source.startsWith('otpauth://')) {
    return QRCode.toDataURL(source, { width: 320, margin: 1, errorCorrectionLevel: 'M' });
  }
  if (uri?.startsWith('otpauth://')) {
    return QRCode.toDataURL(uri, { width: 320, margin: 1, errorCorrectionLevel: 'M' });
  }
  throw new Error('Supabase did not return a supported QR image or otpauth URI.');
}

export default function SecurityView({ user, lang, theme }: SecurityViewProps) {
  const t = i18nDict[lang].security;
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState([false, false, false]);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [factors, setFactors] = useState<KredoMfaFactor[]>([]);
  const [mfaLoading, setMfaLoading] = useState(true);
  const [mfaActionLoading, setMfaActionLoading] = useState(false);
  const [mfaMessage, setMfaMessage] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaDebugError, setMfaDebugError] = useState('');
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [enrollmentCode, setEnrollmentCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [showDisableForm, setShowDisableForm] = useState(false);

  const cardClass = theme === 'dark'
    ? 'border-stone-800 bg-[#090909] shadow-[0_20px_60px_rgba(0,0,0,0.25)]'
    : 'border-stone-200 bg-white shadow-[0_18px_50px_rgba(28,25,23,0.07)]';
  const inputClass = theme === 'dark'
    ? 'border-stone-800 bg-stone-950 text-white focus:border-emerald-500/70'
    : 'border-stone-200 bg-stone-50 text-stone-950 focus:border-emerald-500';

  const loadFactors = async () => {
    setMfaLoading(true);
    try {
      const result = await KredoAuth.listTotpFactors(lang);
      if (result.error) {
        console.error('Unable to load MFA factors:', {
          message: result.error,
          supabaseError: result.debugError,
          sessionExpired: result.sessionExpired,
        });
        setMfaError(result.error || t.mfaLoadError);
        setMfaDebugError(result.debugError || '');
      } else {
        setFactors(result.factors);
        setMfaDebugError('');
      }
    } catch (error: any) {
      console.error('Unexpected MFA status loading error:', error);
      setMfaError(t.mfaUnexpectedError);
      setMfaDebugError(error?.message || String(error));
    } finally {
      setMfaLoading(false);
    }
  };

  useEffect(() => {
    void loadFactors();
  }, []);

  const togglePasswordVisibility = (index: number) => {
    setPasswordVisibility((current) => current.map((visible, itemIndex) => (
      itemIndex === index ? !visible : visible
    )));
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(t.fillFields);
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError(t.passwordLength);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t.passwordsMismatch);
      return;
    }

    setPasswordLoading(true);
    try {
      const result = await KredoAuth.changePassword(user.email, currentPassword, newPassword, lang);
      if (!result.success) {
        setPasswordError(result.error || t.unexpectedError);
        return;
      }
      setPasswordMessage(t.passwordUpdated);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password update failed:', error);
      setPasswordError(t.unexpectedError);
    } finally {
      setPasswordLoading(false);
    }
  };

  const startEnrollment = async () => {
    setMfaActionLoading(true);
    setMfaError('');
    setMfaDebugError('');
    setMfaMessage('');
    try {
      const result = await KredoAuth.enrollTotp(lang);
      if (!result.factorId || !result.secret) {
        console.error('MFA enrollment failed:', {
          message: result.error,
          supabaseError: result.debugError,
          sessionExpired: result.sessionExpired,
        });
        setMfaError(result.error || t.mfaEnrollError);
        setMfaDebugError(result.debugError || '');
        return;
      }

      try {
        const qrImage = await resolveQrImage(result.qrCode, result.uri);
        setEnrollment({
          factorId: result.factorId,
          qrCode: qrImage,
          secret: result.secret,
          uri: result.uri || '',
        });
      } catch (qrError: any) {
        console.error('Unable to render Supabase MFA QR code:', qrError, result);
        setMfaError(t.mfaQrError);
        setMfaDebugError(qrError?.message || String(qrError));
        await KredoAuth.discardTotpEnrollment(result.factorId);
      }
    } catch (error: any) {
      console.error('Unexpected MFA enrollment UI error:', error);
      setMfaError(t.mfaUnexpectedError);
      setMfaDebugError(error?.message || String(error));
    } finally {
      setMfaActionLoading(false);
    }
  };

  const cancelEnrollment = async () => {
    if (enrollment) await KredoAuth.discardTotpEnrollment(enrollment.factorId);
    setEnrollment(null);
    setEnrollmentCode('');
    setMfaError('');
    setMfaDebugError('');
  };

  const confirmEnrollment = async () => {
    if (!enrollment || !/^\d{6}$/.test(enrollmentCode)) {
      setMfaError(t.invalidCode);
      return;
    }
    setMfaActionLoading(true);
    setMfaError('');
    setMfaDebugError('');
    try {
      const result = await KredoAuth.verifyTotpFactor(enrollment.factorId, enrollmentCode, lang);
      if (!result.success) {
        console.error('MFA verification failed:', {
          message: result.error,
          supabaseError: result.debugError,
          sessionExpired: result.sessionExpired,
        });
        setMfaError(result.error || t.invalidCode);
        setMfaDebugError(result.debugError || '');
      } else {
        setEnrollment(null);
        setEnrollmentCode('');
        setMfaMessage(t.mfaEnabled);
        await loadFactors();
      }
    } catch (error: any) {
      console.error('Unexpected MFA verification UI error:', error);
      setMfaError(t.mfaUnexpectedError);
      setMfaDebugError(error?.message || String(error));
    } finally {
      setMfaActionLoading(false);
    }
  };

  const disableMfa = async () => {
    const factor = factors[0];
    if (!factor || !/^\d{6}$/.test(disableCode)) {
      setMfaError(t.invalidCode);
      return;
    }
    setMfaActionLoading(true);
    setMfaError('');
    setMfaDebugError('');
    try {
      const result = await KredoAuth.unenrollTotp(factor.id, disableCode, lang);
      if (!result.success) {
        console.error('MFA disable failed:', {
          message: result.error,
          supabaseError: result.debugError,
          sessionExpired: result.sessionExpired,
        });
        setMfaError(result.error || t.invalidCode);
        setMfaDebugError(result.debugError || '');
      } else {
        setDisableCode('');
        setShowDisableForm(false);
        setMfaMessage(t.mfaDisabled);
        await loadFactors();
      }
    } catch (error: any) {
      console.error('Unexpected MFA disable UI error:', error);
      setMfaError(t.mfaUnexpectedError);
      setMfaDebugError(error?.message || String(error));
    } finally {
      setMfaActionLoading(false);
    }
  };

  const formatDate = (value: string) => new Intl.DateTimeFormat(
    lang === 'ua' ? 'uk-UA' : lang === 'ru' ? 'ru-RU' : 'en-US',
    { dateStyle: 'medium' },
  ).format(new Date(value));

  return (
    <div className={theme === 'dark' ? 'text-stone-100' : 'text-stone-900'}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{t.title}</h1>
          <p className={`mt-2 max-w-2xl text-sm leading-6 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
            {t.subtitle}
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm font-semibold text-amber-600">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{t.supabaseRequired}</span>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-2">
          <form onSubmit={handlePasswordChange} className={`rounded-[28px] border p-5 sm:p-7 ${cardClass}`}>
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-500">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-black">{t.modifyTitle}</h2>
                <p className={`mt-1 text-sm leading-5 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                  {t.passwordDescription}
                </p>
              </div>
            </div>

            {passwordMessage && <StatusMessage success text={passwordMessage} />}
            {passwordError && <StatusMessage text={passwordError} />}

            <div className="space-y-4">
              {[
                [t.currPassword, currentPassword, setCurrentPassword],
                [t.newPassword, newPassword, setNewPassword],
                [t.confirmPassword, confirmPassword, setConfirmPassword],
              ].map(([label, value, setter], index) => (
                <label key={String(label)} className="block">
                  <span className={`mb-2 block text-sm font-bold ${theme === 'dark' ? 'text-stone-300' : 'text-stone-700'}`}>
                    {String(label)}
                  </span>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                    <input
                      type={passwordVisibility[index] ? 'text' : 'password'}
                      value={String(value)}
                      onChange={(event) => (setter as React.Dispatch<React.SetStateAction<string>>)(event.target.value)}
                      autoComplete={index === 0 ? 'current-password' : 'new-password'}
                      disabled={passwordLoading || !isSupabaseConfigured}
                      className={`min-h-12 w-full rounded-2xl border py-3 pl-11 pr-12 text-sm font-semibold outline-none transition ${inputClass}`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(index)}
                      className="absolute right-3 top-1/2 min-h-10 min-w-10 -translate-y-1/2 rounded-xl p-2 text-stone-500 hover:bg-stone-500/10"
                      aria-label={passwordVisibility[index] ? t.hidePassword : t.showPassword}
                    >
                      {passwordVisibility[index] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={passwordLoading || !isSupabaseConfigured}
              className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {passwordLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.btnUpdate}
            </button>
          </form>

          <section className={`rounded-[28px] border p-5 sm:p-7 ${cardClass}`}>
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-500">
                <Smartphone className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-black">{t.twoFactor}</h2>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${
                    factors.length ? 'bg-emerald-500/10 text-emerald-500' : 'bg-stone-500/10 text-stone-500'
                  }`}>
                    {factors.length ? t.mfaStatusEnabled : t.mfaStatusDisabled}
                  </span>
                </div>
                <p className={`mt-1 text-sm leading-5 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                  {t.twoFactorSub}
                </p>
              </div>
            </div>

            {mfaMessage && <StatusMessage success text={mfaMessage} />}
            {mfaError && <StatusMessage text={mfaError} />}
            {import.meta.env.DEV && mfaDebugError && (
              <details className={`mb-5 rounded-2xl border p-3 text-xs ${
                theme === 'dark' ? 'border-amber-500/20 bg-amber-500/5 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}>
                <summary className="cursor-pointer font-bold">{t.technicalDetails}</summary>
                <code className="mt-2 block break-words whitespace-pre-wrap">{mfaDebugError}</code>
              </details>
            )}

            {mfaLoading ? (
              <div className="flex min-h-44 items-center justify-center text-stone-500">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : enrollment ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-black">{t.scanQrTitle}</h3>
                  <button type="button" onClick={() => void cancelEnrollment()} className="min-h-10 min-w-10 rounded-xl p-2 text-stone-500 hover:bg-stone-500/10">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className={`text-sm leading-6 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>{t.scanQrDescription}</p>
                <div className="mx-auto w-fit rounded-3xl bg-white p-4 shadow-sm">
                  <img
                    src={enrollment.qrCode}
                    alt={t.qrAlt}
                    className="h-48 w-48"
                    onError={() => {
                      console.error('Browser failed to render the generated Supabase MFA QR image.');
                      setMfaError(t.mfaQrError);
                      setMfaDebugError('The generated QR image could not be decoded by the browser.');
                    }}
                  />
                </div>
                <div>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">{t.manualSecret}</span>
                  <code className={`block break-all rounded-2xl border p-3 text-center text-sm font-black tracking-wider ${
                    theme === 'dark' ? 'border-stone-800 bg-stone-950' : 'border-stone-200 bg-stone-50'
                  }`}>{enrollment.secret}</code>
                </div>
                <CodeInput value={enrollmentCode} onChange={setEnrollmentCode} label={t.enterAuthCode} theme={theme} />
                <button type="button" onClick={() => void confirmEnrollment()} disabled={mfaActionLoading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-500 disabled:opacity-50">
                  {mfaActionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t.verifyAndEnable}
                </button>
              </div>
            ) : factors.length ? (
              <div className="space-y-5">
                <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-stone-800 bg-stone-950' : 'border-stone-200 bg-stone-50'}`}>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-sm font-black">{factors[0].friendlyName}</p>
                      <p className="mt-1 text-xs text-stone-500">{t.enabledOn}: {formatDate(factors[0].createdAt)}</p>
                    </div>
                  </div>
                </div>
                {showDisableForm ? (
                  <div className="space-y-4">
                    <CodeInput value={disableCode} onChange={setDisableCode} label={t.disableCodePrompt} theme={theme} />
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => { setShowDisableForm(false); setDisableCode(''); }} className={`min-h-12 rounded-2xl border px-4 text-sm font-black ${theme === 'dark' ? 'border-stone-800' : 'border-stone-200'}`}>
                        {t.cancel}
                      </button>
                      <button type="button" onClick={() => void disableMfa()} disabled={mfaActionLoading} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 text-sm font-black text-white disabled:opacity-50">
                        {mfaActionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {t.disable2fa}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowDisableForm(true)} className={`min-h-12 w-full rounded-2xl border px-5 py-3 text-sm font-black transition ${
                    theme === 'dark' ? 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10' : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                  }`}>
                    {t.disable2fa}
                  </button>
                )}
              </div>
            ) : (
              <button type="button" onClick={() => void startEnrollment()} disabled={mfaActionLoading || !isSupabaseConfigured} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-500 disabled:opacity-50">
                {mfaActionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.enable2fa}
              </button>
            )}
          </section>
        </div>

        <section className={`rounded-[28px] border p-5 sm:p-7 ${cardClass}`}>
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-stone-500/10 p-3 text-stone-500">
              <Clock3 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black">{t.activeSessions}</h2>
              <p className={`mt-1 text-sm leading-6 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>{t.activeSessionsPlaceholder}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusMessage({ text, success = false }: { text: string; success?: boolean }) {
  return (
    <div className={`mb-5 flex items-start gap-2 rounded-2xl border p-3 text-sm font-semibold ${
      success
        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
        : 'border-rose-500/20 bg-rose-500/10 text-rose-500'
    }`}>
      {success ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
      <span>{text}</span>
    </div>
  );
}

function CodeInput({
  value,
  onChange,
  label,
  theme,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  theme: AppTheme;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
        className={`min-h-12 w-full rounded-2xl border px-4 text-center font-mono text-lg font-black tracking-[0.35em] outline-none transition ${
          theme === 'dark'
            ? 'border-stone-800 bg-stone-950 text-white focus:border-emerald-500/70'
            : 'border-stone-200 bg-stone-50 text-stone-950 focus:border-emerald-500'
        }`}
      />
    </label>
  );
}
