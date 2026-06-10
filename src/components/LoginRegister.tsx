/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { RoutePath, Language, AppTheme, UserProfile } from '../types';
import { i18nDict } from '../messages';
import { ShieldAlert, Key, Mail, User, Phone, CheckCircle, Globe, RefreshCw, Lock, LayoutDashboard, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KredoAuth } from '../supabase';
import { formatNationalPhone, PHONE_COUNTRIES } from '../phoneCountries';

interface LoginRegisterProps {
  setRoute: (route: RoutePath) => void;
  lang: Language;
  theme: AppTheme;
  loginUser: (user: UserProfile) => void;
  isLoggedIn: boolean;
  initialViewState?: AuthViewState;
}

type AuthViewState = 'login' | 'register' | 'forgot-password' | 'email-verification' | 'mfa-challenge';
const EMAIL_OTP_BOX_COUNT = 8;

function normalizeEmailOtp(value: string): string {
  return value.replace(/\D/g, '').slice(0, EMAIL_OTP_BOX_COUNT);
}

export default function LoginRegister({
  setRoute,
  lang,
  theme,
  loginUser,
  isLoggedIn,
  initialViewState = 'login',
}: LoginRegisterProps) {
  const t = i18nDict[lang];
  const tr = t.auth;
  const [viewState, setViewState] = useState<AuthViewState>(initialViewState);

  useEffect(() => {
    setViewState(initialViewState);
  }, [initialViewState]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNational, setPhoneNational] = useState('');
  const [country, setCountry] = useState('Ukraine');
  const [rememberMe, setRememberMe] = useState(true);
  const [verificationCode, setVerificationCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const emailOtpIsValid = verificationCode.length === 6 || verificationCode.length === 8;
  const selectedPhoneCountry = PHONE_COUNTRIES.find((item) => item.name === country) || PHONE_COUNTRIES[0];
  const countryDisplayNames = new Intl.DisplayNames(
    [lang === 'ua' ? 'uk' : lang],
    { type: 'region' },
  );
  const phoneDigits = phoneNational.replace(/\D/g, '');
  const fullPhoneNumber = `${selectedPhoneCountry.dialCode}${phoneDigits}`;

  // CAPTCHA states
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');

  // Error & Status states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Sync first and last name to full name
  useEffect(() => {
    if (firstName || lastName) {
      setFullName(`${firstName} ${lastName}`.trim());
    }
  }, [firstName, lastName]);

  useEffect(() => {
    let interval: any;
    if (viewState === 'email-verification' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [viewState, timer]);

  // Generate a random CAPTCHA code
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // eye-friendly letters
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
    if (viewState !== 'register') {
      setFirstName('');
      setLastName('');
    }
  }, [viewState]);

  useEffect(() => {
    if (initialViewState !== 'login' || isLoggedIn) return;
    let active = true;
    KredoAuth.getPendingMfaFactor().then((factorId) => {
      if (active && factorId) {
        setMfaFactorId(factorId);
        setViewState('mfa-challenge');
      }
    });
    return () => {
      active = false;
    };
  }, [initialViewState, isLoggedIn]);

  const validateForm = () => {
    let tempErrors: { [key: string]: string } = {};

    if (viewState !== 'mfa-challenge') {
      if (!email) {
        tempErrors.email = t.auth.requiredError;
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        tempErrors.email = t.auth.emailError;
      }
    }

    if (viewState === 'login' || viewState === 'register') {
      if (!password) {
        tempErrors.password = t.auth.requiredError;
      } else if (password.length < 6) {
        tempErrors.password = t.auth.passwordLengthError;
      }

      // CAPTCHA verification
      if (!captchaInput) {
        tempErrors.captcha = t.auth.requiredError;
      } else if (captchaInput.toUpperCase() !== captchaCode) {
        tempErrors.captcha = tr.incorrectCaptcha;
      }
    }

    if (viewState === 'register') {
      if (!confirmPassword) {
        tempErrors.confirmPassword = t.auth.requiredError;
      } else if (confirmPassword !== password) {
        tempErrors.confirmPassword = t.auth.matchError;
      }

      if (!firstName.trim() || !lastName.trim()) {
        tempErrors.fullName = t.auth.requiredError;
      }

      if (
        phoneDigits.length < selectedPhoneCountry.minDigits
        || phoneDigits.length > selectedPhoneCountry.maxDigits
      ) {
        tempErrors.phone = tr.phoneInvalidError;
      }
    }

    if (viewState === 'email-verification') {
      if (!emailOtpIsValid) {
        tempErrors.verificationCode = tr.verificationCodeError;
      }
    }

    if (viewState === 'mfa-challenge' && !/^\d{6}$/.test(mfaCode)) {
      tempErrors.mfaCode = t.security.invalidCode;
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setAuthSuccessMsg('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (viewState === 'login') {
        const response = await KredoAuth.signIn(email, password, rememberMe, lang);
        if (response.success && response.mfaRequired && response.factorId) {
          setMfaFactorId(response.factorId);
          setMfaCode('');
          setViewState('mfa-challenge');
          setLoading(false);
          return;
        } else if (response.success && response.user) {
          setAuthSuccessMsg(t.auth.successLogin);
          setTimeout(() => {
            loginUser(response.user!);
            setRoute('dashboard');
          }, 800);
        } else {
          setGeneralError(response.error || tr.authFailed);
          generateCaptcha();
        }
      } else if (viewState === 'register') {
        const response = await KredoAuth.signUp(
          email,
          password,
          firstName.trim(),
          lastName.trim(),
          fullPhoneNumber,
          country,
          lang,
        );
        if (response.success && response.user && response.emailSent) {
          setAuthSuccessMsg(tr.accountCreated);
          setTimer(60);
          setVerificationCode('');
          setTimeout(() => {
            setViewState('email-verification');
            setLoading(false);
          }, 1000);
          return;
        } else {
          setGeneralError(response.error || tr.regFailed);
          generateCaptcha();
        }
      } else if (viewState === 'forgot-password') {
        const response = await KredoAuth.resetPassword(email, lang);
        if (response.success) {
          setAuthSuccessMsg(tr.recoverySent);
          setTimeout(() => {
            setViewState('login');
          }, 3000);
        } else {
          setGeneralError(response.error || tr.resetFailed);
        }
      } else if (viewState === 'email-verification') {
        const response = await KredoAuth.verifyEmailCode(email, normalizeEmailOtp(verificationCode), lang);
        if (response.success && response.user) {
          setAuthSuccessMsg(tr.identityVerified);
          setTimeout(() => {
            loginUser(response.user!);
            setRoute('dashboard');
          }, 800);
        } else {
          setGeneralError(response.error || tr.identityFailed);
        }
      } else if (viewState === 'mfa-challenge') {
        const response = await KredoAuth.verifyMfaLogin(mfaFactorId, mfaCode, lang);
        if (response.success && response.user) {
          setAuthSuccessMsg(t.security.mfaVerified);
          setTimeout(() => {
            loginUser(response.user!);
            setRoute('dashboard');
          }, 500);
        } else {
          setGeneralError(response.error || t.security.invalidCode);
        }
      }
    } catch (err: any) {
      console.error('Authentication request failed:', err);
      setGeneralError(tr.unexpectedError);
    } finally {
      // Toggle loading
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('demo@kredo.inc');
    setPassword('demopass123');
    setCaptchaInput(captchaCode);
  };

  return (
    <div className={`min-h-screen pt-28 pb-16 px-4 flex items-center justify-center transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#030303]' : 'bg-stone-50'
    }`}>
      <div className="w-full max-w-md">
        
        {/* Card housing the elements */}
        <div className={`rounded-3xl p-8 border ${
          theme === 'dark'
            ? 'bg-[#080808]/90 border-stone-800 shadow-[0_4px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl'
            : 'bg-white border-stone-200 shadow-xl'
        }`}>
          
          {/* Back link when not in default login view */}
          {viewState !== 'login' && (
            <div className="mb-4">
              <button
                onClick={() => {
                  if (viewState === 'mfa-challenge') {
                    void KredoAuth.signOut();
                    setMfaFactorId('');
                    setMfaCode('');
                  }
                  setViewState('login');
                  setErrors({});
                  setGeneralError('');
                  setAuthSuccessMsg('');
                }}
                className={`flex items-center space-x-1.5 text-xs font-bold transition-all transition-colors ${
                  theme === 'dark' ? 'text-stone-400 hover:text-white' : 'text-stone-500 hover:text-stone-950'
                }`}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{tr.backToLogin}</span>
              </button>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-black tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-stone-950'
            }`}>
              {viewState === 'login' && t.auth.loginTitle}
              {viewState === 'register' && t.auth.registerTitle}
              {viewState === 'forgot-password' && tr.passwordRecovery}
              {viewState === 'email-verification' && tr.securityProtection}
              {viewState === 'mfa-challenge' && t.security.twoFactor}
            </h2>
            <p className={`text-xs mt-1.5 font-medium ${
              theme === 'dark' ? 'text-stone-400' : 'text-stone-500'
            }`}>
              {viewState === 'login' && t.auth.loginSubtitle}
              {viewState === 'register' && t.auth.registerSubtitle}
              {viewState === 'forgot-password' && tr.enterVerifiedEmail}
              {viewState === 'email-verification' && tr.checkEmailSubmitCode}
              {viewState === 'mfa-challenge' && t.security.mfaLoginDescription}
            </p>
          </div>

          {/* Alert Success message */}
          {authSuccessMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{authSuccessMsg}</span>
            </div>
          )}

          {/* Alert Error message */}
          {generalError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name & Last Name (Register only) */}
            {viewState === 'register' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                    theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                  }`}>
                    {t.auth.firstNameLabel}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-500" />
                    <input
                      type="text"
                      id="auth-firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={t.auth.firstNamePlaceholder}
                      disabled={loading}
                      className={`w-full text-xs font-semibold pl-9 pr-3 py-3 rounded-xl border transition-all ${
                        theme === 'dark'
                          ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-900'
                      } ${errors.fullName ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                    theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                  }`}>
                    {t.auth.lastNameLabel}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-500" />
                    <input
                      type="text"
                      id="auth-lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={t.auth.lastNamePlaceholder}
                      disabled={loading}
                      className={`w-full text-xs font-semibold pl-9 pr-3 py-3 rounded-xl border transition-all ${
                        theme === 'dark'
                          ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-900'
                      } ${errors.fullName ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                  </div>
                </div>
              </div>
            )}
            {viewState === 'register' && errors.fullName && (
              <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.fullName}</p>
            )}

            {/* Email Field (Always visible except maybe during verification if we lock it, but standard keeps it available) */}
            {viewState !== 'email-verification' && (
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                  theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  {t.auth.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                  <input
                    type="email"
                    id="auth-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    disabled={loading}
                    className={`w-full text-xs font-semibold pl-10 pr-4 py-3 rounded-xl border transition-all ${
                      theme === 'dark'
                        ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                        : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-900'
                    } ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.email}</p>}
              </div>
            )}

            {viewState === 'register' && (
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                  theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  {t.auth.phoneLabel}
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(9rem,1fr)_minmax(0,1.25fr)]">
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 pointer-events-none" />
                    <select
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        setErrors((current) => ({ ...current, phone: '' }));
                      }}
                      disabled={loading}
                      aria-label={tr.countryCodeLabel}
                      className={`w-full appearance-none rounded-xl border py-3 pl-9 pr-2 text-xs font-semibold ${
                        theme === 'dark'
                          ? 'bg-stone-950 border-stone-900 text-white'
                          : 'bg-stone-50 border-stone-200 text-stone-900'
                      }`}
                    >
                      {PHONE_COUNTRIES.map((item) => (
                        <option key={item.iso} value={item.name}>
                          {countryDisplayNames.of(item.iso) || item.name} ({item.iso}) {item.dialCode}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                    <input
                      type="tel"
                      required
                      inputMode="tel"
                      autoComplete="tel-national"
                      value={phoneNational}
                      onChange={(e) => {
                        setPhoneNational(formatNationalPhone(e.target.value));
                        setErrors((current) => ({ ...current, phone: '' }));
                      }}
                      placeholder={tr.phonePlaceholder}
                      disabled={loading}
                      className={`w-full text-xs font-semibold pl-10 pr-4 py-3 rounded-xl border transition-all ${
                        theme === 'dark'
                          ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-900'
                      } ${errors.phone ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                  </div>
                </div>
                <p className="mt-1.5 text-[10px] font-semibold text-stone-500">
                  {countryDisplayNames.of(selectedPhoneCountry.iso) || selectedPhoneCountry.name} {selectedPhoneCountry.dialCode}
                </p>
                {errors.phone && <p className="mt-1 text-[10px] font-semibold text-red-500">{errors.phone}</p>}
              </div>
            )}

            {/* Password Field (Login & Register only) */}
            {(viewState === 'login' || viewState === 'register') && (
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                  theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  {t.auth.passwordLabel}
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="auth-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className={`w-full text-xs font-semibold pl-10 pr-10 py-3 rounded-xl border transition-all ${
                      theme === 'dark'
                        ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                        : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-900'
                    } ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-stone-700 bg-transparent border-0"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.password}</p>}
                
                {viewState === 'login' && (
                  <div className="text-right mt-1.5">
                    <button
                      type="button"
                      onClick={() => setViewState('forgot-password')}
                      className={`text-[11px] font-semibold hover:underline bg-transparent border-0 cursor-pointer ${
                        theme === 'dark' ? 'text-stone-400 hover:text-white' : 'text-stone-500 hover:text-stone-950'
                      }`}
                    >
                      {tr.forgotPassword}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password (Register only) */}
            {viewState === 'register' && (
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                  theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  {t.auth.confirmPassLabel}
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="auth-confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className={`w-full text-xs font-semibold pl-10 pr-10 py-3 rounded-xl border transition-all ${
                      theme === 'dark'
                        ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                        : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-900'
                    } ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-stone-700 bg-transparent border-0"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            {/* CAPTCHA section (Login & Register) */}
            {(viewState === 'login' || viewState === 'register') && (
              <div className={`p-4 rounded-2xl border ${
                theme === 'dark' ? 'bg-stone-950 border-stone-900' : 'bg-stone-50 border-stone-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                  }`}>
                    {tr.captchaVerify}
                  </span>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className={`p-1.5 rounded-lg border transition-all hover:rotate-180 duration-500 ${
                      theme === 'dark' ? 'border-stone-900 hover:bg-white/5 text-stone-400 hover:text-white' : 'border-stone-200 hover:bg-black/5 text-stone-600 hover:text-stone-950'
                    }`}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Styled Monospace visual code */}
                  <div className={`w-28 h-10 select-none rounded-xl font-mono text-lg font-black tracking-widest flex items-center justify-center border-2 border-dashed relative overflow-hidden ${
                    theme === 'dark' 
                      ? 'bg-stone-900 border-stone-800 text-stone-300' 
                      : 'bg-stone-100 border-stone-300 text-stone-800'
                  }`}>
                    {/* Background noise lines */}
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500/20 transform -rotate-12"></div>
                    <div className="absolute inset-x-0 top-1/4 h-0.5 bg-blue-500/20 transform rotate-6"></div>
                    <span className="relative z-10 skew-x-12 select-none pointer-events-none">{captchaCode}</span>
                  </div>

                  <input
                    type="text"
                    placeholder={tr.enterCode}
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    disabled={loading}
                    className={`flex-1 text-xs font-mono font-bold px-3 py-2.5 rounded-xl border transition-all ${
                      theme === 'dark'
                        ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                        : 'bg-white border-stone-200 text-stone-900 focus:border-stone-900'
                    } ${errors.captcha ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                </div>
                {errors.captcha && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.captcha}</p>}
              </div>
            )}

            {/* Email Verification Box */}
            {viewState === 'email-verification' && (
              <div className="space-y-4">
                <div>
                  <label className={`block text-[11px] font-bold uppercase tracking-wider mb-2 text-center ${
                    theme === 'dark' ? 'text-stone-400' : 'text-stone-500'
                  }`}>
                    {tr.verificationCodeTitle}
                  </label>
                  
                  <div className="mx-auto grid w-full max-w-[22rem] grid-cols-8 gap-1.5 sm:gap-2">
                    {Array.from({ length: EMAIL_OTP_BOX_COUNT }, (_, i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        value={verificationCode[i] || ''}
                        ref={(element) => { otpRefs.current[i] = element; }}
                        inputMode="numeric"
                        autoComplete={i === 0 ? 'one-time-code' : 'off'}
                        aria-label={`${tr.verificationCodeTitle} ${i + 1}`}
                        onChange={(e) => {
                          const rawDigits = normalizeEmailOtp(e.target.value);
                          if (rawDigits.length > 1) {
                            setVerificationCode(rawDigits);
                            otpRefs.current[Math.min(rawDigits.length, EMAIL_OTP_BOX_COUNT) - 1]?.focus();
                            return;
                          }

                          const digit = rawDigits.slice(-1);
                          const digits = verificationCode.split('');
                          if (digit) {
                            digits[i] = digit;
                          } else {
                            digits.splice(i, 1);
                          }
                          const nextCode = normalizeEmailOtp(digits.join(''));
                          setVerificationCode(nextCode);
                          setErrors((current) => ({ ...current, verificationCode: '' }));
                          if (digit && i < EMAIL_OTP_BOX_COUNT - 1) otpRefs.current[i + 1]?.focus();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !verificationCode[i] && i > 0) {
                            e.preventDefault();
                            otpRefs.current[i - 1]?.focus();
                          }
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedCode = normalizeEmailOtp(e.clipboardData.getData('text'));
                          if (pastedCode) {
                            setVerificationCode(pastedCode);
                            setErrors((current) => ({ ...current, verificationCode: '' }));
                            otpRefs.current[Math.min(pastedCode.length, EMAIL_OTP_BOX_COUNT) - 1]?.focus();
                          }
                        }}
                        id={`otp-input-${i}`}
                        disabled={loading}
                        className={`h-11 min-w-0 w-full rounded-lg border text-center font-mono text-base font-black transition-all sm:h-12 sm:rounded-xl sm:text-lg ${
                          theme === 'dark'
                            ? 'border-stone-800 bg-stone-950 text-white focus:border-emerald-500'
                            : 'border-stone-200 bg-stone-50 text-stone-950 focus:border-emerald-500'
                        }`}
                      />
                    ))}
                  </div>
                  {errors.verificationCode && <p className="text-[10px] text-red-500 text-center font-semibold mt-1">{errors.verificationCode}</p>}
                </div>

                <div className="flex flex-col items-center space-y-3">
                  <button
                    type="button"
                    onClick={async () => {
                        setLoading(true);
                        setGeneralError('');
                        try {
                          const response = await KredoAuth.resendSignupCode(email, lang);
                          if (response.success) {
                            setTimer(60);
                            setVerificationCode('');
                            setAuthSuccessMsg(tr.codeResent);
                            otpRefs.current[0]?.focus();
                          } else {
                            setGeneralError(response.error || tr.regFailed);
                          }
                        } finally {
                          setLoading(false);
                        }
                    }}
                    disabled={timer > 0 || loading}
                    className={`text-xs font-bold underline ${
                        timer > 0 ? 'text-stone-500 cursor-not-allowed' : 'text-emerald-500 hover:text-emerald-400'
                    }`}
                  >
                    {tr.resendCode} {timer > 0 ? `(${timer}s)` : ''}
                  </button>
                </div>
              </div>
            )}

            {viewState === 'mfa-challenge' && (
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${
                  theme === 'dark' ? 'text-stone-400' : 'text-stone-500'
                }`}>
                  {t.security.enterAuthCode}
                </label>
                <div className="relative">
                  <ShieldAlert className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={loading}
                    autoFocus
                    className={`w-full rounded-xl border py-3.5 pl-10 pr-4 text-center font-mono text-lg font-black tracking-[0.35em] outline-none transition ${
                      theme === 'dark'
                        ? 'border-stone-800 bg-stone-950 text-white focus:border-emerald-500/70'
                        : 'border-stone-200 bg-stone-50 text-stone-950 focus:border-emerald-500'
                    } ${errors.mfaCode ? 'border-rose-500' : ''}`}
                  />
                </div>
                {errors.mfaCode && <p className="mt-1.5 text-[11px] font-semibold text-rose-500">{errors.mfaCode}</p>}
              </div>
            )}

            {/* Reusable Remember Me & Submit (Login & Register and verification) */}
            {viewState === 'login' && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auth-remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 focus:ring-0 text-stone-900"
                />
                <label
                  htmlFor="auth-remember-me"
                  className={`text-xs font-semibold select-none cursor-pointer ${
                    theme === 'dark' ? 'text-stone-400' : 'text-stone-600'
                  }`}
                >
                  {tr.rememberMe}
                </label>
              </div>
            )}

            {/* Solid Submit Button */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading || (viewState === 'email-verification' && !emailOtpIsValid)}
              className={`w-full py-4 mt-2 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-[0.98] select-none uppercase tracking-wider flex items-center justify-center space-x-2 ${
                theme === 'dark'
                  ? 'bg-white text-black hover:bg-stone-200'
                  : 'bg-black text-white hover:bg-stone-900'
              } ${(loading || (viewState === 'email-verification' && !emailOtpIsValid)) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
              <span>
                {viewState === 'login' && t.auth.loginBtn}
                {viewState === 'register' && t.auth.registerBtn}
                {viewState === 'forgot-password' && tr.resetPassword}
                {viewState === 'email-verification' && tr.confirmVerification}
                {viewState === 'mfa-challenge' && t.security.verifyCode}
              </span>
            </button>
          </form>

          {/* Quick Demo Assist */}
          {viewState === 'login' && (
            <div className={`mt-6 p-4 rounded-2xl border border-dashed flex flex-col space-y-2 text-center ${
              theme === 'dark' ? 'border-stone-850 bg-stone-900/25' : 'border-stone-250 bg-stone-50'
            }`}>
              <div className="flex items-center justify-center space-x-1.5 text-stone-500 text-[10px] font-bold tracking-tight uppercase">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>{tr.demoSandbox}</span>
              </div>
              <p className={`text-[11px] font-semibold ${theme === 'dark' ? 'text-stone-450' : 'text-stone-550'}`}>
                {t.auth.demouser}
              </p>
              <button
                id="demo-fill-btn"
                onClick={handleDemoFill}
                className={`py-1.5 text-[10px] font-bold rounded-lg border uppercase hover:-translate-y-0.5 active:translate-y-0 transition-transform ${
                  theme === 'dark'
                    ? 'border-white/10 text-white hover:bg-white/5 bg-stone-900'
                    : 'border-black/10 text-black hover:bg-black/5 bg-white shadow-sm'
                }`}
              >
                {tr.autofillBtn}
              </button>
            </div>
          )}

          {/* Footer toggle */}
          {viewState !== 'email-verification' && viewState !== 'mfa-challenge' && (
            <div className="mt-8 text-center select-none text-xs">
              <button
                id="auth-toggle-view-btn"
                onClick={() => {
                  const targetState = viewState === 'login' ? 'register' : 'login';
                  setRoute(targetState);
                  setViewState(targetState);
                  setErrors({});
                  setGeneralError('');
                  setAuthSuccessMsg('');
                }}
                className={`font-semibold hover:underline bg-transparent border-0 cursor-pointer ${
                  theme === 'dark' ? 'text-stone-305 text-white/90' : 'text-stone-800 hover:text-stone-950'
                }`}
              >
                {viewState === 'login' ? t.auth.noAccount : t.auth.haveAccount}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
