/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Language, AppTheme, UserProfile } from '../types';
import { ShieldCheck, ShieldAlert, Key, Lock, CheckCircle2, History, AlertTriangle } from 'lucide-react';
import { hashPassword, KredoAuth } from '../supabase';
import { i18nDict } from '../messages';

interface SecurityViewProps {
  user: UserProfile;
  lang: Language;
  theme: AppTheme;
}

export default function SecurityView({ user, lang, theme }: SecurityViewProps) {
  const t = i18nDict[lang];

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [tfaEnabled, setTfaEnabled] = useState(true);

  // Active simulated sessions logs using translation dictionary
  const locationKyiv = lang === 'ua' ? 'Київ, Україна' : lang === 'ru' ? 'Киев, Украина' : 'Kyiv, Ukraine';
  const locationLviv = lang === 'ua' ? 'Львів, Україна' : lang === 'ru' ? 'Львов, Украина' : 'Lviv, Ukraine';
  const chromeDevice = lang === 'ua' ? 'Браузер Chrome (macOS)' : lang === 'ru' ? 'Браузер Chrome (macOS)' : 'Chrome browser (macOS)';
  const safariDevice = lang === 'ua' ? 'Браузер Safari (iPhone)' : lang === 'ru' ? 'Браузер Safari (iPhone)' : 'Safari browser (iPhone)';
  const activityLogs = [
    { id: 1, action: t.security.logSession, ipAddress: '194.44.15.112', time: `${t.security.today}, 14:48`, location: locationKyiv, device: chromeDevice },
    { id: 2, action: t.security.logKyc, ipAddress: '194.44.15.112', time: `${t.security.yesterday}, 09:12`, location: locationKyiv, device: chromeDevice },
    { id: 3, action: t.security.logPwdChange, ipAddress: '93.75.121.22', time: lang === 'ua' ? '1 червня, 11:32' : lang === 'ru' ? '1 июня, 11:32' : 'June 1, 11:32', location: locationLviv, device: safariDevice },
  ];

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError(t.security.fillFields);
      return;
    }

    if (newPassword.length < 6) {
      setError(t.security.passwordLength);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError(t.security.passwordsMismatch);
      return;
    }

    setLoading(true);

    try {
      // Access users hash lists
      const users = KredoAuth.getRegisteredUsers();
      const currentHashed = await hashPassword(currentPassword);
      const newHashed = await hashPassword(newPassword);

      if (user.email === 'demo@kredo.com') {
        // Special case for demo
        if (currentPassword !== 'password') {
          setError(t.security.currentPassMismatch);
          setLoading(false);
          return;
        }
        setSuccess(t.security.demoSuccess);
      } else {
        const foundIndex = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
        if (foundIndex === -1) {
          setError(lang === 'ua' ? 'Помилка ідентифікаційної інформації.' : lang === 'ru' ? 'Ошибка идентификационной информации.' : 'Identity details mismatch.');
          setLoading(false);
          return;
        }

        if (users[foundIndex].passwordHash !== currentHashed) {
          setError(t.security.currentPassMismatch);
          setLoading(false);
          return;
        }

        // Apply new hashed password safely – never store passwords in plaintext!
        KredoAuth.updateSimulatedUser(user.email, { passwordHash: newHashed });
        setSuccess(t.security.successSync);
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(t.security.unexpectedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={theme === 'dark' ? 'text-stone-100' : 'text-stone-900'}>
      <div className="max-w-5xl mx-auto">
        
        {/* Header Title */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-stone-950'
          }`}>
            {t.security.title}
          </h1>
          <p className={`text-xs sm:text-sm mt-1.5 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>
            {t.security.subtitle}
          </p>
        </div>

        {/* Configurations grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Main Credentials Modification form */}
          <form onSubmit={handlePasswordReset} className={`lg:col-span-3 rounded-2xl p-6 sm:p-8 border space-y-4 ${
            theme === 'dark' ? 'bg-[#080808]/90 border-stone-900 shadow-md' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <h3 className="text-xs font-black uppercase tracking-wider text-rose-500 flex items-center space-x-1.5 mb-4">
              <Lock className="h-4 w-4" />
              <span>{t.security.modifyTitle}</span>
            </h3>

            {success && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
              }`}>
                {t.security.currPassword}
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full text-xs font-semibold px-4 py-3 rounded-xl border transition-all ${
                  theme === 'dark'
                    ? 'bg-stone-950 border-stone-900/60 text-white focus:border-stone-500'
                    : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-950'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
              }`}>
                {t.security.newPassword}
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t.security.placeholderNewPass}
                className={`w-full text-xs font-semibold px-4 py-3 rounded-xl border transition-all ${
                  theme === 'dark'
                    ? 'bg-stone-950 border-stone-900/60 text-white focus:border-stone-505'
                    : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-950'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
              }`}>
                {t.security.confirmPassword}
              </label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder={t.security.placeholderConfirmPass}
                className={`w-full text-xs font-semibold px-4 py-3 rounded-xl border transition-all ${
                  theme === 'dark'
                    ? 'bg-stone-950 border-stone-900/60 text-white focus:border-stone-505'
                    : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-950'
                }`}
              />
            </div>

            <button
              id="security-password-reset-btn"
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 mt-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:scale-[1.01] ${
                theme === 'dark'
                  ? 'bg-white text-black hover:bg-stone-200'
                  : 'bg-black text-white hover:bg-stone-900'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {t.security.btnUpdate}
            </button>
          </form>

          {/* Verification, 2FA Toggles and Session histories column */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className={`text-xs font-bold uppercase tracking-widest ${
              theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
            }`}>
              {t.security.complianceMetrics}
            </h3>

            {/* 2FA check indicators */}
            <div className={`rounded-xl p-5 border text-center ${
              theme === 'dark' ? 'bg-[#080808] border-stone-900' : 'bg-white border-stone-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-left">
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-stone-900 text-teal-400' : 'bg-stone-100 text-teal-600'}`}>
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>{t.security.twoFactor}</h4>
                    <span className="text-[10px] text-stone-505 text-stone-500">{t.security.twoFactorSub}</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded text-[9px] uppercase font-bold tracking-wider bg-stone-500/10 text-stone-400 border border-stone-500/20 select-none">
                  {lang === 'ua' ? 'Незабаром' : lang === 'ru' ? 'Скоро' : 'Coming soon'}
                </span>
              </div>
            </div>

            {/* Simulated Session Logs list */}
            <div className={`rounded-xl p-5 border ${
              theme === 'dark' ? 'bg-[#080808] border-stone-900' : 'bg-white border-stone-200'
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center space-x-1.5 text-stone-500">
                <History className="h-4 w-4 text-stone-500" />
                <span>{t.security.logsTitle}</span>
              </h4>

              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div key={log.id} className="text-left pb-3 border-b border-stone-500/5 last:border-0 last:pb-0">
                    <span className={`block text-[11px] font-bold ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>
                      {log.action}
                    </span>
                    <span className="block text-[10px] text-stone-505 text-stone-500 mt-0.5">
                      {log.ipAddress} • {log.location}
                    </span>
                    <span className="block text-[9px] text-stone-500 mt-0.5 select-none font-mono">
                      {log.time} • {log.device}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
