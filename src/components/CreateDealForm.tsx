/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RoutePath, Language, AppTheme, EscrowDeal, DealRole } from '../types';
import { i18nDict } from '../messages';
import { Sparkles, HelpCircle, AlertCircle, CheckCircle, ArrowRightLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface CreateDealFormProps {
  lang: Language;
  theme: AppTheme;
  addNewDeal: (deal: EscrowDeal) => void;
  setRoute: (route: RoutePath) => void;
}

const formT = {
  ua: {
    requiredParams: 'Будь ласка, заповніть усі необхідні поля.',
    sysMsgCreated: (amountStr: string) => `Створено захищену ескроу-угоду. Очікується депозит у розмірі ${amountStr} від Покупця.`,
    categories: ['Цифрові товари', 'Фріланс', 'Домени', 'Транспортні засоби', 'Послуги', 'Інша комерція'],
    whoPaysFee: 'Хто сплачує комісію KREDO?',
    half: 'Поділено 50/50 (Рекомендовано)',
    buyerPaysAll: 'Сплачує покупець (2.5%)',
    sellerPaysAll: 'Сплачує продавець (2.5%)',
    feeSettlementTitle: 'Розрахунок комісії та розрахунки',
    transparentMetrics: 'Прозора оцінка та розрахунки',
    baseEscrowAmount: 'Базова сума ескроу',
    totalEscrowFee: 'Комісія за ескроу-сервіс (2.5%)',
    feeDisclaimer: (minFeeStr: string) => `Комісія розраховується автоматично за ставкою 2.5%. Мінімальна вартість проведення ескроу-угоди становить ${minFeeStr}.`,
    buyerShare: 'Частка Покупця',
    sellerShare: 'Частка Продавця',
    totalBuyerPays: 'Всього до сплати Покупцем:',
    totalSellerReceives: 'Всього отримує Продавець:',
    arbitrationEnforced: 'Захист арбітражу задіяно:',
    arbitrationDesc: 'Усі умови, внесені до цієї форми, є обов’язковими для обох сторін. Сертифіковані юридичні арбітри вирішують суперечки впродовж 48 годин, спираючись виключно на специфікації цієї угоди.'
  },
  en: {
    requiredParams: 'Please fill out all required parameters.',
    sysMsgCreated: (amountStr: string) => `Secured escrow agreement formed. Awaiting deposit of ${amountStr} from the Buyer.`,
    categories: ['Digital products', 'Freelance', 'Domains', 'Vehicles', 'Services', 'E-commerce'],
    whoPaysFee: 'Who Pays KREDO Fee?',
    half: 'Divided 50/50 (Recommended)',
    buyerPaysAll: 'Buyer Pays All (2.5%)',
    sellerPaysAll: 'Seller Pays All (2.5%)',
    feeSettlementTitle: 'Fee Calculation & Settlement',
    transparentMetrics: 'Transparent Valuation Metrics',
    baseEscrowAmount: 'Base Escrow Amount',
    totalEscrowFee: 'Total Escrow Fee (2.5%)',
    feeDisclaimer: (minFeeStr: string) => `Fees are calculated automatically using our standard flat 2.5% rate. The minimum agreement processing charge is ${minFeeStr}.`,
    buyerShare: 'Buyer Share',
    sellerShare: 'Seller Share',
    totalBuyerPays: 'Total Buyer Pays:',
    totalSellerReceives: 'Total Seller Receives:',
    arbitrationEnforced: 'Arbitration Enforced:',
    arbitrationDesc: 'All conditions input in this form bind both parties. Certified legal arbiters handle disputes inside 48 hours referencing strictly the specifications stated in this catalog.'
  },
  ru: {
    requiredParams: 'Пожалуйста, заполните все обязательные поля.',
    sysMsgCreated: (amountStr: string) => `Создана защищенная эскроу-сделка. Ожидается депозит в размере ${amountStr} от Покупателя.`,
    categories: ['Цифровые товары', 'Фриланс', 'Домены', 'Транспорт', 'Услуги', 'Другая коммерция'],
    whoPaysFee: 'Кто оплачивает комиссию KREDO?',
    half: 'Разделено 50/50 (Рекомендовано)',
    buyerPaysAll: 'Оплачивает покупатель (2.5%)',
    sellerPaysAll: 'Оплачивает продавец (2.5%)',
    feeSettlementTitle: 'Расчет комиссии и взаиморасчеты',
    transparentMetrics: 'Прозрачная оценка и взаиморасчеты',
    baseEscrowAmount: 'Базовая сумма эскроу',
    totalEscrowFee: 'Комиссия за эскроу-сервис (2.5%)',
    feeDisclaimer: (minFeeStr: string) => `Комиссия рассчитывается автоматически по ставке 2.5%. Минимальная стоимость проведения эскроу-сделки составляет ${minFeeStr}.`,
    buyerShare: 'Доля Покупателя',
    sellerShare: 'Доля Продавца',
    totalBuyerPays: 'Всего к оплате Покупателем:',
    totalSellerReceives: 'Всего получает Продавец:',
    arbitrationEnforced: 'Защита арбитража задействована:',
    arbitrationDesc: 'Все условия, внесенные в эту форму, обязательны для обеих сторон. Сертифицированные юридические арбитры разрешают споры в течение 48 часов, опираясь исключительно на спецификации этой сделки.'
  }
};

export default function CreateDealForm({
  lang,
  theme,
  addNewDeal,
  setRoute,
}: CreateDealFormProps) {
  const t = i18nDict[lang];
  const tr = formT[lang] || formT.ua;

  // Form states
  const [title, setTitle] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [role, setRole] = useState<DealRole>('buyer');
  const [amount, setAmount] = useState<number | ''>('');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'UAH'>('USD');
  const [deliveryDays, setDeliveryDays] = useState<number>(3);
  const [category, setCategory] = useState(tr.categories[0] || 'Digital products');
  const [description, setDescription] = useState('');
  const [feePayer, setFeePayer] = useState<'buyer' | 'seller' | 'half'>('half');

  // Interactive feedback state
  const [formDoneMsg, setFormDoneMsg] = useState('');
  const [errorText, setErrorText] = useState('');

  // Fee estimations
  const numericAmount = amount ? Number(amount) : 0;
  const standardFee = Math.max(numericAmount * 0.025, 15); // 2.5% or min $15
  const buyerFeeAmount = feePayer === 'buyer' ? standardFee : feePayer === 'half' ? standardFee / 2 : 0;
  const sellerFeeAmount = feePayer === 'seller' ? standardFee : feePayer === 'half' ? standardFee / 2 : 0;
  
  const totalBuyerPays = role === 'buyer' ? (numericAmount + buyerFeeAmount) : buyerFeeAmount;
  const totalSellerReceives = role === 'seller' ? (numericAmount - sellerFeeAmount) : (numericAmount - sellerFeeAmount);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat(lang === 'ua' ? 'uk-UA' : 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 1
    }).format(val);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !partnerEmail || !partnerName || !amount || !description) {
      setErrorText(tr.requiredParams);
      return;
    }
    setErrorText('');

    const newDealItem: EscrowDeal = {
      id: `deal-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      amount: Number(amount),
      currency: currency,
      role: role,
      partnerEmail: partnerEmail.trim().toLowerCase(),
      partnerName: partnerName.trim(),
      status: 'created',
      createdAt: new Date().toISOString().split('T')[0],
      deliveryDays: Number(deliveryDays),
      category: category,
      messages: [
        {
          id: 'm-sys-1',
          sender: 'system',
          text: tr.sysMsgCreated(formatMoney(Number(amount))),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ],
    };

    setFormDoneMsg(t.createForm.successMsg);
    setTimeout(() => {
      addNewDeal(newDealItem);
      setRoute('dashboard');
    }, 1500);
  };

  return (
    <div className={theme === 'dark' ? 'text-stone-100' : 'text-stone-900'}>
      <div className="max-w-5xl mx-auto">
        
        {/* Title parameters */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-stone-950'
          }`}>
            {t.createForm.title}
          </h1>
          <p className={`text-xs sm:text-sm mt-1.5 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>
            {t.createForm.subtitle}
          </p>
        </div>

        {/* Create Deal Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Main Form Fields section */}
          <form onSubmit={handleCreate} className={`lg:col-span-3 rounded-2xl p-6 sm:p-8 border space-y-5 ${
            theme === 'dark' ? 'bg-[#080808] border-stone-900 shadow-md' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            
            {/* Show success / error messages */}
            {formDoneMsg && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-505/20 text-emerald-500 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{formDoneMsg}</span>
              </div>
            )}

            {errorText && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            {/* Title / Description */}
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  {t.createForm.dealTitle} *
                </label>
                <input
                  type="text"
                  required
                  id="deal-title"
                  placeholder={t.createForm.dealTitlePl}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full text-xs font-semibold px-4 py-3 rounded-xl border transition-all ${
                    theme === 'dark'
                      ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-900'
                  }`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  {t.createForm.description} *
                </label>
                <textarea
                  rows={4}
                  required
                  id="deal-desc"
                  placeholder={t.createForm.descriptionPl}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full text-xs font-semibold px-4 py-3 rounded-xl border transition-all resize-none ${
                    theme === 'dark'
                      ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-900'
                  }`}
                />
              </div>
            </div>

            <hr className={`my-4 ${theme === 'dark' ? 'border-stone-900' : 'border-stone-100'}`} />

            {/* Role of user */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${
                theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
              }`}>
                {t.createForm.roleLabel}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="choose-role-buyer"
                  onClick={() => setRole('buyer')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-2 ${
                    role === 'buyer'
                      ? theme === 'dark'
                        ? 'bg-white text-black border-white'
                        : 'bg-black text-white border-black'
                      : theme === 'dark'
                      ? 'bg-stone-950 border-stone-900 text-stone-400 hover:text-white'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-950'
                  }`}
                >
                  <ArrowRightLeft className="h-4 w-4 shrink-0" />
                  <span>{t.createForm.roleBuyer}</span>
                </button>
                <button
                  type="button"
                  id="choose-role-seller"
                  onClick={() => setRole('seller')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-2 ${
                    role === 'seller'
                      ? theme === 'dark'
                        ? 'bg-white text-black border-white'
                        : 'bg-black text-white border-black'
                      : theme === 'dark'
                      ? 'bg-stone-950 border-stone-900 text-stone-400 hover:text-white'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-950'
                  }`}
                >
                  <ArrowRightLeft className="h-4 w-4 shrink-0" />
                  <span>{t.createForm.roleSeller}</span>
                </button>
              </div>
            </div>

            {/* Counterparty settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  {t.createForm.partnerName} *
                </label>
                <input
                  type="text"
                  required
                  id="partner-name"
                  placeholder={t.createForm.partnerNamePl}
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className={`w-full text-xs font-semibold px-4 py-3 rounded-xl border transition-all ${
                    theme === 'dark'
                      ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  {t.createForm.partnerEmail} *
                </label>
                <input
                  type="email"
                  required
                  id="partner-email"
                  placeholder={t.createForm.partnerEmailPl}
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  className={`w-full text-xs font-semibold px-4 py-3 rounded-xl border transition-all ${
                    theme === 'dark'
                      ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-900'
                  }`}
                />
              </div>
            </div>

            {/* Value, Duration & Category */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  {t.createForm.amountLabel} *
                </label>
                <input
                  type="number"
                  required
                  id="deal-amount"
                  min="15"
                  placeholder="500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value !== '' ? Number(e.target.value) : '')}
                  className={`w-full text-xs font-semibold px-4 py-3 rounded-xl border transition-all ${
                    theme === 'dark'
                      ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  {t.createForm.currencyLabel}
                </label>
                <select
                  id="deal-currency"
                  value={currency}
                  onChange={(e: any) => setCurrency(e.target.value)}
                  className={`w-full text-xs font-semibold px-4 py-3 rounded-xl border appearance-none transition-all ${
                    theme === 'dark'
                      ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-900'
                  }`}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="UAH">UAH (₴)</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  {t.createForm.deliveryTime}
                </label>
                <input
                  type="number"
                  required
                  id="delivery-days"
                  min="1"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(Number(e.target.value))}
                  placeholder={t.createForm.deliveryTimePl}
                  className={`w-full text-xs font-semibold px-4 py-3 rounded-xl border transition-all ${
                    theme === 'dark'
                      ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  {t.createForm.category}
                </label>
                <select
                  id="deal-category-picker"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full text-xs font-semibold px-4 py-3 rounded-xl border appearance-none transition-all ${
                    theme === 'dark'
                      ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900'
                  }`}
                >
                  {tr.categories.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  {tr.whoPaysFee}
                </label>
                <select
                  id="fee-payer-picker"
                  value={feePayer}
                  onChange={(e: any) => setFeePayer(e.target.value)}
                  className={`w-full text-xs font-semibold px-4 py-3 rounded-xl border appearance-none transition-all ${
                    theme === 'dark'
                      ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900'
                  }`}
                >
                  <option value="half">{tr.half}</option>
                  <option value="buyer">{tr.buyerPaysAll}</option>
                  <option value="seller">{tr.sellerPaysAll}</option>
                </select>
              </div>
            </div>

            {/* Launch Button */}
            <button
              id="submit-deal-btn"
              type="submit"
              className={`w-full py-4 rounded-xl text-xs font-bold transition-all shadow-md hover:scale-[1.01] ${
                theme === 'dark'
                  ? 'bg-white text-black hover:bg-stone-100'
                  : 'bg-black text-white hover:bg-stone-900'
              }`}
            >
              {t.createForm.btnSubmit}
            </button>

          </form>

          {/* Interactive Fee Breakdown Side column */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className={`text-xs font-bold uppercase tracking-widest ${
              theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
            }`}>
              {tr.feeSettlementTitle}
            </h3>

            <div className={`rounded-2xl p-6 border ${
              theme === 'dark' ? 'bg-[#080808]/40 border-stone-900' : 'bg-white border-stone-200 shadow-sm'
            }`}>
              <div className="flex items-center space-x-2 text-stone-400 text-[10px] font-bold tracking-tight uppercase mb-4">
                <Sparkles className="h-4 w-4" />
                <span>{tr.transparentMetrics}</span>
              </div>

              <div className="space-y-4 text-xs font-medium">
                <div className="flex justify-between items-center pb-3 border-b border-stone-500/10">
                  <span className={`${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>{tr.baseEscrowAmount}</span>
                  <span className="font-semibold">{formatMoney(numericAmount)}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-stone-500/10">
                  <span className={`${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'} flex items-center`}>
                    {tr.totalEscrowFee}
                    <HelpCircle className="h-3 w-3 ml-1 opacity-50" />
                  </span>
                  <span className="font-semibold">{formatMoney(standardFee)}</span>
                </div>

                <div className="p-3.5 rounded-xl text-[11px] leading-relaxed mb-4 bg-stone-500/5 text-stone-400 border border-stone-500/10">
                  {tr.feeDisclaimer(formatMoney(15))}
                </div>

                {/* Role Specific Net calculations */}
                <div className="pt-2 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>{tr.buyerShare}</span>
                    <span className="font-bold">{formatMoney(buyerFeeAmount)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className={`${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>{tr.sellerShare}</span>
                    <span className="font-bold">{formatMoney(sellerFeeAmount)}</span>
                  </div>

                  <hr className={`my-3 ${theme === 'dark' ? 'border-stone-900' : 'border-stone-100'}`} />

                  {/* Ultimate net result summaries */}
                  {role === 'buyer' ? (
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-bold text-stone-400 uppercase tracking-widest text-[10px]">{tr.totalBuyerPays}</span>
                      <span className={`text-base font-black ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>{formatMoney(totalBuyerPays)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-bold text-stone-400 uppercase tracking-widest text-[10px]">{tr.totalSellerReceives}</span>
                      <span className={`text-base font-black ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>{formatMoney(totalSellerReceives)}</span>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Arbitration Disclosure */}
            <div className={`p-4 rounded-xl text-[11px] leading-relaxed flex items-start space-x-3 border shadow-sm ${
              theme === 'dark' ? 'bg-stone-950 border-stone-900 text-stone-400 shadow-none' : 'bg-white border-stone-200 text-stone-500'
            }`}>
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-stone-500" />
              <p>
                <strong>{tr.arbitrationEnforced}</strong> {tr.arbitrationDesc}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
