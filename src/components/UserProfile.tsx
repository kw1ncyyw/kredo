/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RoutePath, Language, AppTheme, UserProfile } from '../types';
import { i18nDict } from '../messages';
import { ShieldCheck, FileText, Camera, Upload, CheckCircle2, ChevronRight, AlertCircle, Mail, Phone, Building2, UserRound, BadgeCheck, CalendarDays, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserProfileProps {
  user: UserProfile;
  lang: Language;
  theme: AppTheme;
  updateProfile: (profile: Partial<UserProfile>) => void;
  triggerValidationSystem: () => void;
  setRoute?: (route: RoutePath) => void;
}

export default function UserProfileSettings({
  user,
  lang,
  theme,
  updateProfile,
  triggerValidationSystem,
  setRoute,
}: UserProfileProps) {
  const t = i18nDict[lang];

  const kycLoc = {
    ua: {
      subtitle: 'Оновлюйте ваші реквізити для коректного формування ескроу-угод та квитанцій.',
      identVerify: 'Онлайн-ідентифікація',
      verifiedPartner: 'Верифікований партнер',
      verifiedDesc: 'Профіль успішно підтверджено. Вам доступні будь-які ліміти для великих комерційних угод.',
      actionReq: 'Потрібна дія',
      actionDesc: 'Пройдіть миттєву перевірку для авторизації великих бізнес-ескроу угод.',
      btnVerify: 'Пройти верифікацію',
      chooseDoc: 'Виберіть ідентифікаційний документ',
      passportScan: 'Паспорт громадян.',
      driverLicense: 'Посвідчення водія',
      proceedScan: 'Перейти до сканування',
      scanDoc: 'Наведіть камеру на документ',
      alignDoc: 'Помістіть вибраний документ у поле зору камери для автоматичного розпізнавання.',
      submitData: 'Надіслати скан для перевірки',
      successVerify: 'Верифікацію завершено',
      successDesc: 'Біометричні дані збігаються. Ваш акаунт KREDO успішно верифіковано.',
      closeLimits: 'Закрити',
      complianceDesc: 'Акаунт верифіковано. Ліміти на фінансові угоди повністю знято.',
      companyPlaceholder: 'ФОП / Назва Вашої компанії',
      updatedSuccess: 'Профіль успішно оновлено!',
      personalInfo: 'Особиста інформація',
      accountEmail: 'Email акаунта',
      verificationStatus: 'Статус верифікації',
      fullNameCard: 'Повне ім’я',
      phoneCard: 'Номер телефону',
      organizationCard: 'Організація',
      createdDate: 'Дата створення',
      editDetails: 'Редагувати дані',
    },
    en: {
      subtitle: 'Keep your business details accurate for automated escrows and receipts.',
      identVerify: 'Identity Verification',
      verifiedPartner: 'Verified Partner',
      verifiedDesc: 'Profile successfully verified. High-volume business bounds are now fully unlocked.',
      actionReq: 'Action Required',
      actionDesc: 'Complete quick verification to authorize active high-volume business escrow agreements.',
      btnVerify: 'Complete verification',
      chooseDoc: 'Choose Doc of Identity',
      passportScan: 'Passport Scan',
      driverLicense: `Driver's License`,
      proceedScan: 'Proceed to Scan',
      scanDoc: 'Scan your document',
      alignDoc: 'Align your selected Document inside the camera scanner border correctly.',
      submitData: 'Submit capture data',
      successVerify: 'Verification Successful',
      successDesc: 'Biometric mapping matches credentials perfectly. Your Client profile is upgraded.',
      closeLimits: 'Close & Apply bounds',
      complianceDesc: 'Account fully verified compliance. High-volume escrow operations unlocked.',
      companyPlaceholder: 'Self-employed / Company Legal Name',
      updatedSuccess: 'Profile updated successfully!',
      personalInfo: 'Personal information',
      accountEmail: 'Account email',
      verificationStatus: 'Verification status',
      fullNameCard: 'Full name',
      phoneCard: 'Phone number',
      organizationCard: 'Organization',
      createdDate: 'Created date',
      editDetails: 'Edit details',
    },
    ru: {
      subtitle: 'Обновляйте ваши реквизиты для корректного формирования эскроу-соглашений и квитанций.',
      identVerify: 'Идентификация личности',
      verifiedPartner: 'Верифицированный партнер',
      verifiedDesc: 'Профиль успешно подтвержден. Вам доступны любые лимиты для крупных коммерческих сделок.',
      actionReq: 'Требуется действие',
      actionDesc: 'Пройдите быструю верификацию для авторизации крупных бизнес эскроу-соглашений.',
      btnVerify: 'Пройти верификацию',
      chooseDoc: 'Выберите документ идентификации',
      passportScan: 'Скан паспорта',
      driverLicense: 'Водительские права',
      proceedScan: 'Перейти к сканированию',
      scanDoc: 'Наведите камеру на документ',
      alignDoc: 'Разместите выбранный документ в поле зрения камеры для автоматического считывания.',
      submitData: 'Отправить скан на проверку',
      successVerify: 'Верификация завершена',
      successDesc: 'Биометрические данные совпадают. Ваш аккаунт KREDO успешно верифицирован.',
      closeLimits: 'Закрыть',
      complianceDesc: 'Аккаунт верифицирован. Лимиты на финансовые сделки полностью сняты.',
      companyPlaceholder: 'ИП / Юридическое название компании',
      updatedSuccess: 'Профиль успешно обновлен!',
      personalInfo: 'Личная информация',
      accountEmail: 'Email аккаунта',
      verificationStatus: 'Статус верификации',
      fullNameCard: 'Полное имя',
      phoneCard: 'Номер телефона',
      organizationCard: 'Организация',
      createdDate: 'Дата создания',
      editDetails: 'Редактировать данные',
    }
  }[lang] || {
    subtitle: 'Keep your business details accurate for automated escrows and receipts.',
    identVerify: 'Identity Verification',
    verifiedPartner: 'Verified Partner',
    verifiedDesc: 'Profile successfully verified. High-volume business bounds are now fully unlocked.',
    actionReq: 'Action Required',
    actionDesc: 'Complete quick verification to authorize active high-volume business escrow agreements.',
    btnVerify: 'Complete verification',
    chooseDoc: 'Choose Doc of Identity',
    passportScan: 'Passport Scan',
    driverLicense: `Driver's License`,
    proceedScan: 'Proceed to Scan',
    scanDoc: 'Scan your document',
    alignDoc: 'Align your selected Document inside the camera scanner border correctly.',
    submitData: 'Submit capture data',
    successVerify: 'Verification Successful',
    successDesc: 'Biometric mapping matches credentials perfectly. Your Client profile is upgraded.',
    closeLimits: 'Close & Apply bounds',
    complianceDesc: 'Account fully verified compliance. High-volume escrow operations unlocked.',
    companyPlaceholder: 'Self-employed / Company Legal Name',
    updatedSuccess: 'Profile updated successfully!',
    personalInfo: 'Personal information',
    accountEmail: 'Account email',
    verificationStatus: 'Verification status',
    fullNameCard: 'Full name',
    phoneCard: 'Phone number',
    organizationCard: 'Organization',
    createdDate: 'Created date',
    editDetails: 'Edit details',
  };

  // Form states
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [companyName, setCompanyName] = useState(user.companyName || '');
  const [country, setCountry] = useState(user.country || 'Ukraine');

  // Interactive KYC progress
  const [kycProgress, setKycProgress] = useState(false);
  const [kycStep, setKycStep] = useState(1); // 1: choose, 2: scan, 3: completed
  const [docType, setDocType] = useState('passport');
  const [doneSuccess, setDoneSuccess] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      phone,
      companyName,
      country,
    });
    setDoneSuccess(true);
    setEditing(false);
    setTimeout(() => setDoneSuccess(false), 2000);
  };

  const executeKycVerification = () => {
    if (setRoute) {
      setRoute('verification');
    } else {
      setKycProgress(true);
      setKycStep(1);
    }
  };

  const handleStepNext = () => {
    if (kycStep < 3) {
      setKycStep(kycStep + 1);
    } else {
      setKycProgress(false);
      triggerValidationSystem();
    }
  };

  return (
    <div className="w-full py-4">
      <div className="max-w-6xl mx-auto">
        
        <div className={`mb-8 flex flex-col gap-5 rounded-[2rem] border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 ${
          theme === 'dark' ? 'border-white/[0.08] bg-[#101010]' : 'border-stone-200 bg-white shadow-sm'
        }`}>
          <div>
            <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-stone-900'
            }`}>
              {t.profile.title}
            </h1>
            <p className="text-sm mt-2 text-stone-500">
              {kycLoc.subtitle}
            </p>
          </div>
          <button type="button" onClick={() => setEditing((value) => !value)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-white hover:bg-emerald-600">
            <Pencil className="h-4 w-4" />{kycLoc.editDetails}
          </button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { label: kycLoc.accountEmail, value: user.email, icon: Mail },
            { label: kycLoc.fullNameCard, value: user.fullName, icon: UserRound },
            { label: kycLoc.phoneCard, value: user.phone, icon: Phone },
            { label: kycLoc.organizationCard, value: user.companyName, icon: Building2 },
            { label: kycLoc.verificationStatus, value: user.verified ? kycLoc.verifiedPartner : kycLoc.actionReq, icon: BadgeCheck },
            { label: kycLoc.createdDate, value: user.joinedAt, icon: CalendarDays },
          ].map(({ label, value, icon: Icon }) => (
            <article key={label} className={`rounded-3xl border p-5 ${
              theme === 'dark' ? 'border-white/[0.08] bg-[#0d0d0d]' : 'border-stone-200 bg-white shadow-sm'
            }`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500"><Icon className="h-5 w-5" /></span>
              <p className="mt-4 text-sm font-semibold text-stone-500">{label}</p>
              <p className="mt-1 break-words text-base font-black">{value || '—'}</p>
            </article>
          ))}
        </div>

        {/* Form Container */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Inputs Section */}
          <form onSubmit={handleSave} className={`lg:col-span-3 rounded-[2rem] p-6 sm:p-8 border space-y-6 ${
            theme === 'dark' ? 'bg-[#0d0d0d] border-white/[0.08]' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <div><h2 className="text-xl font-black">{kycLoc.personalInfo}</h2><p className="mt-1 text-sm text-stone-500">{kycLoc.subtitle}</p></div>
            
            {doneSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{kycLoc.updatedSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-stone-500">
                {t.profile.fullName}
              </label>
              <input
                type="text"
                required
                disabled={!editing}
                id="profile-fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full text-xs font-semibold px-4 py-3 rounded-xl border transition-all ${
                  theme === 'dark'
                    ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                    : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-950'
                }`}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-stone-500">
                {t.profile.phone}
              </label>
              <input
                type="text"
                required
                disabled={!editing}
                id="profile-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full text-xs font-semibold px-4 py-3 rounded-xl border transition-all ${
                  theme === 'dark'
                    ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                    : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-950'
                }`}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-stone-500">
                {t.profile.company}
              </label>
              <input
                type="text"
                id="profile-company"
                disabled={!editing}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={kycLoc.companyPlaceholder}
                className={`w-full text-xs font-semibold px-4 py-3 rounded-xl border transition-all ${
                  theme === 'dark'
                    ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                    : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-950'
                }`}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-stone-500">
                {t.profile.country}
              </label>
              <input
                type="text"
                required
                disabled={!editing}
                id="profile-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={`w-full text-xs font-semibold px-4 py-3 rounded-xl border transition-all ${
                  theme === 'dark'
                    ? 'bg-stone-950 border-stone-900/65 text-white focus:border-stone-500'
                    : 'bg-stone-50 border-stone-200 text-stone-900'
                }`}
              />
            </div>

            {editing && <button
              id="profile-save-btn"
              type="submit"
              className={`w-full py-4 mt-2 rounded-xl text-sm font-bold transition-all shadow-md hover:-translate-y-0.5 ${
                theme === 'dark'
                  ? 'bg-white text-black hover:bg-stone-200'
                  : 'bg-black text-white hover:bg-stone-900'
              }`}
            >
              {t.profile.saveBtn}
            </button>}
          </form>

          {/* KYC Simple Box */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500">
              {kycLoc.identVerify}
            </h3>

            <div className={`rounded-[2rem] p-6 border text-center ${
              theme === 'dark' ? 'bg-[#0d0d0d] border-white/[0.08]' : 'bg-white border-stone-200 shadow-sm'
            }`}>
              {user.verified ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <ShieldCheck className="h-8 w-8" />
                    </div>
                  </div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>{kycLoc.verifiedPartner}</h4>
                  <p className="text-[11px] leading-relaxed text-stone-500">
                    {kycLoc.complianceDesc}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                      <AlertCircle className="h-8 w-8" />
                    </div>
                  </div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>{kycLoc.actionReq}</h4>
                  <p className="text-[11px] leading-relaxed text-stone-500 mb-4">
                    {kycLoc.actionDesc}
                  </p>
                  <button
                    type="button"
                    onClick={executeKycVerification}
                    className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider border hover:scale-[1.01] transition-all duration-300 shadow-sm ${
                      theme === 'dark'
                        ? 'border-stone-850 hover:bg-stone-900 bg-stone-950/40 text-stone-300'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    {kycLoc.btnVerify}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* KYC Scan Check overlay */}
      <AnimatePresence>
        {kycProgress && (
          <motion.div
            key="kyc-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <div className={`max-w-md w-full rounded-3xl p-6 border relative ${
              theme === 'dark' ? 'bg-[#0f0f0f] border-stone-800' : 'bg-white border-stone-200'
            }`}>
              
              <button
                onClick={() => setKycProgress(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-stone-450"
              >
                ✕
              </button>

              {kycStep === 1 && (
                <div className="space-y-5 text-center">
                  <div className="flex justify-center mb-2">
                    <FileText className="h-10 w-10 text-stone-400" />
                  </div>
                  <h3 className={`text-lg font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>
                    {kycLoc.chooseDoc}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs font-bold text-stone-400 mt-4">
                    <button
                      type="button"
                      onClick={() => setDocType('passport')}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        docType === 'passport' ? 'border-stone-400 text-white bg-white/10' : 'border-stone-800 text-stone-500 hover:text-white'
                      }`}
                    >
                      {kycLoc.passportScan}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocType('license')}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        docType === 'license' ? 'border-stone-400 text-white bg-white/10' : 'border-stone-800 text-stone-500 hover:text-white'
                      }`}
                    >
                      {kycLoc.driverLicense}
                    </button>
                  </div>
                  <button
                    onClick={handleStepNext}
                    className="w-full mt-6 py-3 bg-white text-black font-bold text-xs rounded-xl hover:bg-stone-200 inline-flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>{kycLoc.proceedScan}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {kycStep === 2 && (
                <div className="space-y-5 text-center">
                  <div className="flex justify-center mb-2">
                    <div className="p-4 rounded-full border border-dashed border-stone-500 animate-spin text-stone-500">
                      <Camera className="h-10 w-10" />
                    </div>
                  </div>
                  <h3 className={`text-lg font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>
                    {kycLoc.scanDoc}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-stone-500">
                    {kycLoc.alignDoc}
                  </p>
                  <div className={`mx-auto h-40 w-60 rounded-2xl border-2 border-dashed flex justify-center items-center relative ${
                    theme === 'dark' ? 'border-stone-800 bg-stone-900/30' : 'border-stone-200 bg-stone-50'
                  }`}>
                    <div className="absolute top-0 inset-x-0 h-0.5 bg-emerald-500 shadow-md shadow-emerald-500/50 animate-bounce" />
                    <Upload className="h-8 w-8 text-stone-500 opacity-25" />
                  </div>
                  <button
                    onClick={handleStepNext}
                    className="w-full mt-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    {kycLoc.submitData}
                  </button>
                </div>
              )}

              {kycStep === 3 && (
                <div className="space-y-5 text-center">
                  <div className="flex justify-center mb-2">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  </div>
                  <h3 className={`text-lg font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>
                    {kycLoc.successVerify}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-stone-500 max-w-sm mx-auto">
                    {kycLoc.successDesc}
                  </p>
                  <button
                    onClick={handleStepNext}
                    className="w-full mt-6 py-3 bg-white text-black font-bold text-xs rounded-xl hover:bg-stone-200 cursor-pointer"
                  >
                    {kycLoc.closeLimits}
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
