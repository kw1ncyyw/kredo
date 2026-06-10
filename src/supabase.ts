/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { UserProfile, Language } from './types';
import { i18nDict } from './messages';

// Read environmental variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// True if user has configured real Supabase secrets
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Native secure SHA-256 password hashing.
 * Passwords are never stored in plaintext!
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.warn('Native Crypto Subtle not available, falling back to basic hash representation for environment safety:', error);
    // Safe fallback hash for legacy browsers or frame sandboxes
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return 'fallback-hash-' + hash.toString(16);
  }
}

function translateAuthError(errorMsg: string, lang: Language): string {
  const t = i18nDict[lang]?.auth || i18nDict.ua.auth;
  const msg = errorMsg.toLowerCase();

  if (msg.includes('invalid login credentials')) {
    return lang === 'ua' ? 'Неправильний email або пароль' : lang === 'ru' ? 'Неверный email или пароль' : 'Invalid email or password';
  }
  if (msg.includes('already registered') || msg.includes('already exists')) {
    return t.errorUserAlreadyExists || 'Account already exists';
  }
  if (msg.includes('token has expired') || msg.includes('expired')) {
    return lang === 'ua'
      ? 'Код застарів. Надішліть код повторно.'
      : lang === 'ru'
        ? 'Код устарел. Отправьте код повторно.'
        : 'Code expired. Resend the code.';
  }
  if (
    msg.includes('invalid message')
    || msg.includes('invalid token')
    || msg.includes('invalid otp')
    || msg.includes('invalid totp')
    || msg.includes('challenge')
  ) {
    return lang === 'ua' ? 'Неправильний код' : lang === 'ru' ? 'Неверный код' : 'Invalid code';
  }
  if (msg.includes('too many requests') || msg.includes('rate limit')) {
    return lang === 'ua'
      ? 'Забагато спроб. Спробуйте пізніше.'
      : lang === 'ru'
        ? 'Слишком много попыток. Попробуйте позже.'
        : 'Too many attempts. Please try again later.';
  }
  if (msg.includes('email not confirmed')) {
     return lang === 'ua' ? 'Email не підтверджено' : lang === 'ru' ? 'Email не подтвержден' : 'Email not confirmed';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
     return lang === 'ua' ? 'Помилка мережі. Перевірте підключення.' : lang === 'ru' ? 'Ошибка сети. Проверьте подключение.' : 'Network error. Check connection.';
  }
  if (msg.includes('sending email') || msg.includes('smtp')) {
     return lang === 'ua' ? 'Помилка відправки email. Спробуйте пізніше.' : lang === 'ru' ? 'Ошибка отправки email. Попробуйте позже.' : 'Failed to send email. Try again later.';
  }

  // Fallback
  return errorMsg;
}

// Simulated active session for fallback mode
const SESSION_KEY = 'kredo_simulated_session';
const REGISTERED_USERS_KEY = 'kredo_simulated_users';

export interface SimulatedUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  country: string;
  verified: boolean;
  joinedAt: string;
}

type ProfileRow = {
  role?: 'admin' | 'user' | null;
  email_verified?: boolean | null;
  kyc_status?: UserProfile['kyc_status'] | null;
  kyc_notes?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  organization_name?: string | null;
  country?: string | null;
};

export type KredoMfaFactor = {
  id: string;
  friendlyName: string;
  createdAt: string;
};

type KredoMfaResult = {
  success: boolean;
  error?: string;
  debugError?: string;
  sessionExpired?: boolean;
};

function translateMfaError(errorMessage: string, lang: Language): string {
  const t = i18nDict[lang]?.security || i18nDict.ua.security;
  const message = errorMessage.toLowerCase();

  if (
    message.includes('session')
    || message.includes('jwt')
    || message.includes('not authenticated')
    || message.includes('user not found')
  ) {
    return t.sessionExpired;
  }
  if (message.includes('factor') && (message.includes('already') || message.includes('exists'))) {
    return t.mfaFactorExists;
  }
  if (message.includes('maximum') || message.includes('too many')) {
    return t.mfaFactorLimit;
  }
  if (
    message.includes('invalid otp')
    || message.includes('invalid totp')
    || message.includes('invalid code')
    || message.includes('challenge')
  ) {
    return t.invalidCode;
  }
  return t.mfaUnexpectedError;
}

async function requireSupabaseSession(lang: Language): Promise<{
  sessionAvailable: boolean;
  error?: string;
  debugError?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      sessionAvailable: false,
      error: i18nDict[lang].security.supabaseRequired,
      debugError: 'Supabase client is not configured.',
    };
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Supabase Auth session check failed:', error);
    return {
      sessionAvailable: false,
      error: translateMfaError(error.message, lang),
      debugError: error.message,
    };
  }
  if (!data.session) {
    console.error('Supabase MFA session check failed: no active Auth session.');
    return {
      sessionAvailable: false,
      error: i18nDict[lang].security.sessionExpired,
      debugError: 'No active Supabase Auth session.',
    };
  }

  return { sessionAvailable: true };
}

async function getMfaRequirement(): Promise<{
  required: boolean;
  factorId?: string;
  error?: string;
}> {
  if (!supabase) return { required: false };

  const [{ data: factorsData, error: factorsError }, { data: aalData, error: aalError }] = await Promise.all([
    supabase.auth.mfa.listFactors(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);

  if (factorsError || aalError) {
    console.error('Supabase MFA assurance check failed:', {
      factorsError,
      assuranceLevelError: aalError,
    });
    return { required: false, error: factorsError?.message || aalError?.message };
  }

  const verifiedTotp = factorsData.totp.find((factor) => factor.status === 'verified');
  const required = (
    !!verifiedTotp
    && aalData.currentLevel === 'aal1'
    && aalData.nextLevel === 'aal2'
  );
  return { required, factorId: required ? verifiedTotp.id : undefined };
}

async function buildSupabaseProfile(authUser: any, fallback?: Partial<UserProfile>): Promise<UserProfile> {
  let profileRow: ProfileRow | null = null;

  if (supabase) {
    const { data } = await supabase
      .from('profiles')
      .select('role,email_verified,kyc_status,kyc_notes,first_name,last_name,phone,organization_name,country')
      .eq('id', authUser.id)
      .maybeSingle();
    profileRow = data as ProfileRow | null;
  }

  const databaseName = [profileRow?.first_name, profileRow?.last_name].filter(Boolean).join(' ').trim();
  const emailVerified = !!authUser.email_confirmed_at || !!profileRow?.email_verified;
  const kycStatus = profileRow?.kyc_status || fallback?.kyc_status || 'Not Started';

  return {
    id: authUser.id,
    email: authUser.email || fallback?.email || '',
    fullName: databaseName || authUser.user_metadata?.full_name || fallback?.fullName || authUser.email?.split('@')[0] || '',
    phone: profileRow?.phone || authUser.user_metadata?.phone || fallback?.phone || '',
    companyName: profileRow?.organization_name || fallback?.companyName || '',
    country: profileRow?.country || authUser.user_metadata?.country || fallback?.country || 'Ukraine',
    emailVerified,
    verified: kycStatus === 'Verified',
    joinedAt: authUser.created_at?.split('T')[0] || fallback?.joinedAt || new Date().toISOString().split('T')[0],
    balance: fallback?.balance || 0,
    role: profileRow?.role || 'user',
    kyc_status: kycStatus,
    kyc_notes: profileRow?.kyc_notes || undefined,
  };
}

/**
 * Authentication Service Wrapper supporting both Supabase and safe local hashing fallback
 */
export const KredoAuth = {
  isConfigured: () => isSupabaseConfigured,

  // Restore current session securely
  restoreSession: async (): Promise<{ user: UserProfile | null, expired: boolean; mfaRequired?: boolean }> => {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      const cachedProfile: UserProfile | null = sessionData ? JSON.parse(sessionData) : null;

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          localStorage.removeItem(SESSION_KEY);
          return { user: null, expired: !!cachedProfile };
        }
        const mfa = await getMfaRequirement();
        if (mfa.error) {
          console.error('Unable to verify MFA assurance level:', mfa.error);
          localStorage.removeItem(SESSION_KEY);
          return { user: null, expired: true };
        }
        if (mfa.required) {
          localStorage.removeItem(SESSION_KEY);
          return { user: null, expired: false, mfaRequired: true };
        }
        const userProfile = await buildSupabaseProfile(data.session.user, cachedProfile || undefined);
        localStorage.setItem(SESSION_KEY, JSON.stringify(userProfile));
        return { user: userProfile, expired: false };
      }

      return { user: cachedProfile, expired: false };
    } catch (e) {
      console.error('Error reading session:', e);
      return { user: null, expired: false };
    }
  },

  // Retrieve current user synchronously
  getCurrentUser: (): UserProfile | null => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        return JSON.parse(session);
      }
    } catch (e) {
      console.error('Error reading session:', e);
    }
    return null;
  },

  // Log Out
  signOut: async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(SESSION_KEY);
  },

  // Local Simulation User Lookup
  getRegisteredUsers: (): SimulatedUser[] => {
    try {
      const data = localStorage.getItem(REGISTERED_USERS_KEY);
      if (data) return JSON.parse(data);
    } catch (_) {}
    return [];
  },

  saveRegisteredUser: (user: SimulatedUser) => {
    const users = KredoAuth.getRegisteredUsers();
    users.push(user);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  },

  updateSimulatedUser: (email: string, updates: Partial<SimulatedUser>) => {
    const users = KredoAuth.getRegisteredUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
      
      // If currently logged in as this user, update session as well
      const current = KredoAuth.getCurrentUser();
      if (current && current.email.toLowerCase() === email.toLowerCase()) {
        const updatedProfile: UserProfile = {
          ...current,
          fullName: updates.fullName || current.fullName,
          phone: updates.phone || current.phone,
          country: updates.country || current.country,
          verified: updates.verified !== undefined ? updates.verified : current.verified,
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(updatedProfile));
      }
    }
  },

  // Sign In
  signIn: async (email: string, password: string, rememberMe = false, lang: Language = 'ua'): Promise<{
    success: boolean;
    error?: string;
    user?: UserProfile;
    mfaRequired?: boolean;
    factorId?: string;
  }> => {
    const cleanedEmail = email.trim().toLowerCase();
    const t = i18nDict[lang] || i18nDict.ua;

    // 1. Intercept demo accounts FIRST to bypass database checks and avoid conflict
    if (
      (cleanedEmail === 'demo@kredo.co.ua' || cleanedEmail === 'demo@kredo.com' || cleanedEmail === 'demo@kredo.inc') &&
      (password === 'password' || password === 'demopass123')
    ) {
      const profile: UserProfile = {
        id: 'u-demo',
        email: cleanedEmail,
        fullName: lang === 'ua' ? 'ТОВ Демо Корпорація' : lang === 'ru' ? 'ООО Демо Корпорация' : 'Demo Corporation LLC',
        phone: '+380 (50) 123-4567',
        country: 'Ukraine',
        verified: true,
        emailVerified: true,
        joinedAt: '2026-06-01',
        balance: 145000,
        role: 'user',
        kyc_status: 'Not Started',
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
      return { success: true, user: profile };
    }

    // 2. If Supabase is configured, use it!
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanedEmail,
          password: password,
        });
        if (error) {
          return { success: false, error: translateAuthError(error.message, lang) };
        }
        if (data && data.user) {
          const mfa = await getMfaRequirement();
          if (mfa.error) {
            await supabase.auth.signOut();
            return { success: false, error: translateAuthError(mfa.error, lang) };
          }
          if (mfa.required && mfa.factorId) {
            localStorage.removeItem(SESSION_KEY);
            return { success: true, mfaRequired: true, factorId: mfa.factorId };
          }
          const profile = await buildSupabaseProfile(data.user, { balance: 145000 });
          
          localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
          return { success: true, user: profile };
        }
      } catch (err: any) {
        return { success: false, error: translateAuthError(err.message || 'Network error', lang) };
      }
    }

    // 3. Fallback simulation (with Hashing!)
    const pHash = await hashPassword(password);

    // Check custom registered local simulation users
    const users = KredoAuth.getRegisteredUsers();
    const found = users.find(u => u.email.toLowerCase() === cleanedEmail);
    if (!found) {
      return { success: false, error: t.auth.errorUserNotExist || 'User does not exist. Check email or please Register.' };
    }

    if (found.passwordHash !== pHash) {
      return { success: false, error: t.auth.errorIncorrectPassword || 'Incorrect password. Passwords do not match.' };
    }

    const profile: UserProfile = {
      id: found.id,
      email: found.email,
      fullName: found.fullName,
      phone: found.phone,
      country: found.country,
      verified: found.verified,
      joinedAt: found.joinedAt,
      balance: 145000,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    return { success: true, user: profile };
  },

  // Sign Up / Register
  signUp: async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
    country: string,
    lang: Language = 'ua'
  ): Promise<{ success: boolean; emailSent: boolean; error?: string; user?: UserProfile }> => {
    const cleanedEmail = email.trim().toLowerCase();
    const t = i18nDict[lang] || i18nDict.ua;

    // 1. If Supabase is configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanedEmail,
          password: password,
          options: {
            data: {
              full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              phone: phone.trim(),
              country: country,
            },
          },
        });
        if (error) {
          return { success: false, emailSent: false, error: translateAuthError(error.message, lang) };
        }
        if (data && data.user) {
          if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
            return { success: false, emailSent: false, error: t.auth.errorUserAlreadyExists };
          }
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || cleanedEmail,
            fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
            phone: phone.trim(),
            country: country,
            verified: false,
            emailVerified: !!data.user.email_confirmed_at,
            joinedAt: new Date().toISOString().split('T')[0],
            balance: 0,
            role: 'user',
            kyc_status: 'Not Started',
          };
          
          return { success: true, emailSent: true, user: profile };
        }
      } catch (err: any) {
        return { success: false, emailSent: false, error: translateAuthError(err.message || 'Network error', lang) };
      }
    }

    return {
      success: false,
      emailSent: false,
      error: lang === 'ua'
        ? 'Реєстрація тимчасово недоступна: підключіть Supabase у змінних середовища.'
        : lang === 'ru'
          ? 'Регистрация временно недоступна: подключите Supabase в переменных окружения.'
          : 'Registration is unavailable until Supabase environment variables are configured.',
    };
  },

  // Reset password (Forgot password)
  resetPassword: async (email: string, lang: Language = 'ua'): Promise<{ success: boolean; error?: string }> => {
    const cleanedEmail = email.trim().toLowerCase();
    const t = i18nDict[lang] || i18nDict.ua;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanedEmail, {
        redirectTo: `${window.location.origin}/${lang}/reset-password`,
      });
      if (error) {
        return { success: false, error: translateAuthError(error.message, lang) };
      }
      return { success: true };
    }

    // Fallback simulation
    const users = KredoAuth.getRegisteredUsers();
    if (
      cleanedEmail !== 'demo@kredo.com' &&
      cleanedEmail !== 'demo@kredo.inc' &&
      cleanedEmail !== 'demo@kredo.co.ua' &&
      !users.some(u => u.email.toLowerCase() === cleanedEmail)
    ) {
      return { success: false, error: t.auth.errorEmailNotRegistered || 'Email not registered.' };
    }

    return { success: true };
  },

  getPendingMfaFactor: async (): Promise<string | null> => {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase session check before MFA login failed:', error);
      return null;
    }
    if (!data.session) return null;
    const result = await getMfaRequirement();
    if (result.error) {
      console.error('Unable to inspect MFA requirement:', result.error);
      return null;
    }
    return result.required ? result.factorId || null : null;
  },

  verifyMfaLogin: async (
    factorId: string,
    code: string,
    lang: Language = 'ua',
  ): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: i18nDict[lang].security.supabaseRequired };
    }

    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) {
        console.error('Supabase MFA login challenge failed:', challengeError);
        return { success: false, error: translateAuthError(challengeError.message, lang) };
      }
      const { data: verified, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });
      if (verifyError) {
        console.error('Supabase MFA login verification failed:', verifyError);
        return { success: false, error: translateAuthError(verifyError.message, lang) };
      }
      const profile = await buildSupabaseProfile(verified.user, { balance: 145000 });
      localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
      return { success: true, user: profile };
    } catch (error: any) {
      console.error('Unexpected Supabase MFA login error:', error);
      return { success: false, error: translateAuthError(error?.message || 'MFA verification failed', lang) };
    }
  },

  changePassword: async (
    email: string,
    currentPassword: string,
    newPassword: string,
    lang: Language = 'ua',
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: i18nDict[lang].security.supabaseRequired };
    }

    const reauthClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    const { error: reauthError } = await reauthClient.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (reauthError) {
      return { success: false, error: i18nDict[lang].security.currentPassMismatch };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { success: false, error: translateAuthError(error.message, lang) };
    }
    return { success: true };
  },

  updateRecoveryPassword: async (
    newPassword: string,
    lang: Language = 'ua',
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: i18nDict[lang].security.supabaseRequired };
    }
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return { success: false, error: i18nDict[lang].security.recoveryLinkInvalid };
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { success: false, error: translateAuthError(error.message, lang) };
    }
    await KredoAuth.signOut();
    return { success: true };
  },

  listTotpFactors: async (
    lang: Language = 'ua',
  ): Promise<{ factors: KredoMfaFactor[]; error?: string; debugError?: string; sessionExpired?: boolean }> => {
    const session = await requireSupabaseSession(lang);
    if (!session.sessionAvailable) {
      return {
        factors: [],
        error: session.error,
        debugError: session.debugError,
        sessionExpired: session.error === i18nDict[lang].security.sessionExpired,
      };
    }
    if (!supabase) return { factors: [], error: i18nDict[lang].security.supabaseRequired };
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      console.error('Supabase MFA listFactors failed:', error);
      return {
        factors: [],
        error: translateMfaError(error.message, lang),
        debugError: error.message,
      };
    }
    return {
      factors: data.totp
        .filter((factor) => factor.status === 'verified')
        .map((factor) => ({
          id: factor.id,
          friendlyName: factor.friendly_name || 'KREDO Authenticator',
          createdAt: factor.created_at,
        })),
    };
  },

  enrollTotp: async (lang: Language = 'ua'): Promise<{
    factorId?: string;
    qrCode?: string;
    secret?: string;
    uri?: string;
    error?: string;
    debugError?: string;
    sessionExpired?: boolean;
  }> => {
    const session = await requireSupabaseSession(lang);
    if (!session.sessionAvailable) {
      return {
        error: session.error,
        debugError: session.debugError,
        sessionExpired: session.error === i18nDict[lang].security.sessionExpired,
      };
    }
    if (!supabase) return { error: i18nDict[lang].security.supabaseRequired };

    try {
      const { data: existing, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) {
        console.error('Supabase MFA pre-enrollment listFactors failed:', listError);
        return {
          error: translateMfaError(listError.message, lang),
          debugError: listError.message,
        };
      }

      const staleFactors = existing.all.filter(
        (factor) => factor.factor_type === 'totp' && factor.status === 'unverified',
      );
      for (const factor of staleFactors) {
        const { error: cleanupError } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        if (cleanupError) {
          console.warn('Unable to remove unfinished Supabase MFA factor:', cleanupError);
        }
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'KREDO Authenticator',
      });
      if (error) {
        console.error('Supabase MFA enroll failed:', error);
        return {
          error: translateMfaError(error.message, lang),
          debugError: error.message,
        };
      }
      if (!data?.id || !data.totp?.secret || (!data.totp.qr_code && !data.totp.uri)) {
        const debugError = 'Supabase MFA enroll returned incomplete TOTP data.';
        console.error(debugError, data);
        return {
          error: i18nDict[lang].security.mfaQrError,
          debugError,
        };
      }

      return {
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        uri: data.totp.uri,
      };
    } catch (error: any) {
      const debugError = error?.message || String(error);
      console.error('Unexpected Supabase MFA enrollment error:', error);
      return {
        error: translateMfaError(debugError, lang),
        debugError,
      };
    }
  },

  discardTotpEnrollment: async (factorId: string): Promise<void> => {
    if (!supabase || !factorId) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) console.error('Unable to discard unfinished MFA enrollment:', error.message);
  },

  verifyTotpFactor: async (
    factorId: string,
    code: string,
    lang: Language = 'ua',
  ): Promise<KredoMfaResult> => {
    const session = await requireSupabaseSession(lang);
    if (!session.sessionAvailable) {
      return {
        success: false,
        error: session.error,
        debugError: session.debugError,
        sessionExpired: session.error === i18nDict[lang].security.sessionExpired,
      };
    }
    if (!supabase) return { success: false, error: i18nDict[lang].security.supabaseRequired };
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      console.error('Supabase MFA challenge failed:', challengeError);
      return {
        success: false,
        error: translateMfaError(challengeError.message, lang),
        debugError: challengeError.message,
      };
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });
    if (error) {
      console.error('Supabase MFA verify failed:', error);
      return {
        success: false,
        error: translateMfaError(error.message, lang),
        debugError: error.message,
      };
    }
    return { success: true };
  },

  unenrollTotp: async (
    factorId: string,
    code: string,
    lang: Language = 'ua',
  ): Promise<KredoMfaResult> => {
    const verified = await KredoAuth.verifyTotpFactor(factorId, code, lang);
    if (!verified.success) return verified;
    if (!supabase) return { success: false, error: i18nDict[lang].security.supabaseRequired };
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      console.error('Supabase MFA unenroll failed:', error);
      return {
        success: false,
        error: translateMfaError(error.message, lang),
        debugError: error.message,
      };
    }
    return { success: true };
  },

  verifyEmailCode: async (email: string, code: string, lang: Language = 'ua'): Promise<{ success: boolean; error?: string; user?: UserProfile }> => {
    const t = i18nDict[lang] || i18nDict.ua;

    if (!/^(?:\d{6}|\d{8})$/.test(code)) {
      return { success: false, error: t.auth.verificationCodeError };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: code,
          type: 'signup'
        });
        if (error) {
          return { success: false, error: translateAuthError(error.message, lang) };
        }
        if (!data.user) {
          return { success: false, error: t.auth.identityFailed };
        }

        const metadata = data.user.user_metadata || {};
        const firstName = String(metadata.first_name || '').trim();
        const lastName = String(metadata.last_name || '').trim();
        const phone = String(metadata.phone || '').trim();
        const country = String(metadata.country || 'Ukraine').trim();
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: data.user.email || email.trim().toLowerCase(),
            first_name: firstName,
            last_name: lastName,
            phone,
            organization_name: '',
            country,
            role: 'user',
            email_verified: true,
            kyc_status: 'Not Started',
          }, { onConflict: 'id' });
        if (profileError) {
          console.error('Verified user profile creation failed:', profileError);
          return {
            success: false,
            error: lang === 'ua'
              ? 'Email підтверджено, але не вдалося створити профіль. Спробуйте увійти повторно.'
              : lang === 'ru'
                ? 'Email подтверждён, но не удалось создать профиль. Попробуйте войти снова.'
                : 'Email was verified, but the profile could not be created. Please sign in again.',
          };
        }
        const profile = await buildSupabaseProfile(data.user);
        localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
        return { success: true, user: profile };
      } catch (err: any) {
        return { success: false, error: translateAuthError(err.message || 'Verification failed.', lang) };
      }
    }

    return {
      success: false,
      error: lang === 'ua'
        ? 'Перевірка коду недоступна без підключення Supabase.'
        : lang === 'ru'
          ? 'Проверка кода недоступна без подключения Supabase.'
          : 'Code verification requires a configured Supabase project.',
    };
  },

  resendSignupCode: async (email: string, lang: Language = 'ua'): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: lang === 'ua'
          ? 'Повторне надсилання коду недоступне без підключення Supabase.'
          : lang === 'ru'
            ? 'Повторная отправка кода недоступна без подключения Supabase.'
            : 'Resending the code requires a configured Supabase project.',
      };
    }
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });
      return error
        ? { success: false, error: translateAuthError(error.message, lang) }
        : { success: true };
    } catch (error: any) {
      return { success: false, error: translateAuthError(error.message || 'Network error', lang) };
    }
  },
};

export const KredoData = {
  updateOwnProfile: async (userId: string, profile: {
    fullName: string;
    phone: string;
    organizationName: string;
    country: string;
  }) => {
    if (!supabase) return { success: false, error: 'not_configured' };
    const names = profile.fullName.trim().split(/\s+/);
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: names[0] || '',
        last_name: names.slice(1).join(' '),
        phone: profile.phone.trim(),
        organization_name: profile.organizationName.trim(),
        country: profile.country.trim(),
      })
      .eq('id', userId);
    return error ? { success: false, error: error.message } : { success: true };
  },

  submitContactRequest: async (request: {
    name: string;
    email: string;
    topic: string;
    message: string;
  }) => {
    if (!supabase) return { success: false, error: 'not_configured' };
    const { error } = await supabase.from('contact_requests').insert({
      ...request,
      status: 'pending',
    });
    return error ? { success: false, error: error.message } : { success: true };
  },

  submitKycRequest: async (params: {
    user: UserProfile;
    documentType: string;
    documentNumber: string;
    passportFile: File;
    selfieFile: File;
  }) => {
    if (!supabase) return { success: false, error: 'not_configured' };
    const stamp = Date.now();
    const passportPath = `${params.user.id}/document_${stamp}.${params.passportFile.name.split('.').pop() || 'bin'}`;
    const selfiePath = `${params.user.id}/selfie_${stamp}.${params.selfieFile.name.split('.').pop() || 'bin'}`;

    const storage = supabase.storage.from('kyc-documents');
    const isMissingBucket = (message: string) => {
      const normalized = message.toLowerCase();
      return normalized.includes('bucket not found')
        || normalized.includes('bucket does not exist')
        || normalized.includes('not found');
    };

    try {
      const passportUpload = await storage.upload(passportPath, params.passportFile, { upsert: true });
      if (passportUpload.error) {
        return {
          success: false,
          error: passportUpload.error.message,
          code: isMissingBucket(passportUpload.error.message) ? 'bucket_missing' : 'document_upload_failed',
        };
      }

      const selfieUpload = await storage.upload(selfiePath, params.selfieFile, { upsert: true });
      if (selfieUpload.error) {
        await storage.remove([passportPath]);
        return {
          success: false,
          error: selfieUpload.error.message,
          code: isMissingBucket(selfieUpload.error.message) ? 'bucket_missing' : 'selfie_upload_failed',
        };
      }

      const now = new Date().toISOString();
      const { error } = await supabase.from('kyc_requests').upsert({
        user_id: params.user.id,
        full_name: params.user.fullName || params.user.email.split('@')[0],
        email: params.user.email,
        document_type: params.documentType,
        document_number: params.documentNumber,
        document_front_url: passportPath,
        selfie_url: selfiePath,
        status: 'Pending Review',
        admin_notes: '',
        updated_at: now,
      }, { onConflict: 'user_id' });

      if (error) {
        await storage.remove([passportPath, selfiePath]);
        return { success: false, error: error.message, code: 'request_save_failed' };
      }

      // The database trigger synchronizes profiles.kyc_status and creates the user notification.
      return { success: true, passportPath, selfiePath, createdAt: now };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'network_error',
        code: 'network_error',
      };
    }
  },

  listAdminData: async () => {
    if (!supabase) return { success: false, error: 'not_configured' };
    const [profiles, kyc, contacts] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('kyc_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_requests').select('*').order('created_at', { ascending: false }),
    ]);
    const error = profiles.error || kyc.error || contacts.error;
    return error
      ? { success: false, error: error.message }
      : { success: true, profiles: profiles.data || [], kyc: kyc.data || [], contacts: contacts.data || [] };
  },

  reviewKyc: async (request: { id: string | number; userId: string; status: 'Verified' | 'Rejected'; note: string }) => {
    if (!supabase) return { success: false, error: 'not_configured' };
    const { error: requestError } = await supabase
      .from('kyc_requests')
      .update({ status: request.status, admin_notes: request.note, updated_at: new Date().toISOString() })
      .eq('id', request.id);
    if (requestError) return { success: false, error: requestError.message };
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ kyc_status: request.status, kyc_notes: request.note })
      .eq('id', request.userId);
    if (profileError) return { success: false, error: profileError.message };
    const { error: notificationError } = await supabase.from('notifications').insert({
      user_id: request.userId,
      title: request.status === 'Verified' ? 'KYC verified' : 'KYC rejected',
      message: request.status === 'Verified'
        ? 'Вашу верифікацію підтверджено'
        : 'Верифікацію відхилено. Перевірте коментар адміністратора.',
      type: 'kyc',
    });
    return notificationError
      ? { success: false, error: notificationError.message }
      : { success: true };
  },

  updateContactStatus: async (id: string | number, status: 'pending' | 'resolved') => {
    if (!supabase) return { success: false, error: 'not_configured' };
    const { error } = await supabase.from('contact_requests').update({ status }).eq('id', id);
    return error ? { success: false, error: error.message } : { success: true };
  },

  listUserNotifications: async (userId: string) => {
    if (!supabase) return { success: false, error: 'not_configured', notifications: [] };
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    return error
      ? { success: false, error: error.message, notifications: [] }
      : { success: true, notifications: data || [] };
  },

  createSignedKycUrl: async (path: string) => {
    if (!supabase) return null;
    const { data } = await supabase.storage.from('kyc-documents').createSignedUrl(path, 300);
    return data?.signedUrl || null;
  },
};
