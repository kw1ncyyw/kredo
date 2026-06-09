/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, AppTheme } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, ArrowRightLeft, DollarSign, Percent, ShieldCheck, CheckCircle } from 'lucide-react';

interface CommissionCalculatorProps {
  lang: Language;
  theme: AppTheme;
  onInitiateDeal?: (amount: number, role: 'buyer' | 'seller', category: string) => void;
}

export default function CommissionCalculator({ lang, theme, onInitiateDeal }: CommissionCalculatorProps) {
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [asset, setAsset] = useState<string>('digital');
  const [amountStr, setAmountStr] = useState<string>('5000');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'UAH'>('USD');

  // Parse calculations
  const amount = Math.max(0, parseFloat(amountStr) || 0);
  const feeRate = 0.02; // Fixed 2%
  const serviceFee = amount * feeRate;

  // Buying: Buyer pays amount + fee. Seller gets amount.
  // Selling: Buyer pays amount. Seller gets amount - fee (fee is deducted from seller proceeds).
  const totalBuyerPays = role === 'buyer' ? amount + serviceFee : amount;
  const totalSellerReceives = role === 'seller' ? amount - serviceFee : amount;

  // Localization labels
  const dict = {
    ua: {
      calcTitle: 'Калькулятор комісії KREDO',
      calcSubtitle: 'Миттєвий та прозорий розрахунок вартості ескроу за фіксованою ставкою 2%',
      sideLabel: 'Яка ваша роль в угоді?',
      buyer: 'Я купую (плачу кошти)',
      seller: 'Я продаю (отримую кошти)',
      assetLabel: 'Тип активу',
      amountLabel: 'Сума угоди',
      resultTitle: 'Результати розрахунку',
      amountValue: 'Заявлена сума:',
      feeValue: 'Комісія сервісу (2%):',
      buyerWillPay: 'Покупець сплачує:',
      sellerWillGet: 'Продавець отримає на рахунок:',
      ctaBtn: 'Ініціювати ескроу-угоду',
      trustedNote: 'Кошти зберігатимуться на зашифрованому ескроу-рахунку KREDO до підтвердження умов.',
      assets: {
        vehicle: 'Автомобіль / Транспорт',
        apartment: 'Нерухомість / Квартира',
        business: 'Готовий бізнес / Компанія',
        jewelry: 'Ювелірні вироби / Люкс',
        domain: 'Доменне ім\'я / IP-адреси',
        digital: 'Цифровий товар / SaaS / Код',
        service: 'Послуги / Фріланс контракт',
        other: 'Інше',
      }
    },
    en: {
      calcTitle: 'KREDO Escrow Fee Calculator',
      calcSubtitle: 'Instant, transparent escrow fee calculation at a flat 2% rate',
      sideLabel: 'What is your role in this deal?',
      buyer: 'I am Buying (Send funds)',
      seller: 'I am Selling (Receive funds)',
      assetLabel: 'Asset Type',
      amountLabel: 'Transaction Amount',
      resultTitle: 'Calculation details',
      amountValue: 'Declared value:',
      feeValue: 'Service commission (2%):',
      buyerWillPay: 'Buyer pays in total:',
      sellerWillGet: 'Seller receives in total:',
      ctaBtn: 'Initiate Escrow Deal',
      trustedNote: 'Funds are securely held in KREDO transit escrow account until conditions are met.',
      assets: {
        vehicle: 'Vehicle / Automotive',
        apartment: 'Apartments / Real Estate',
        business: 'Corporate / Completed Business',
        jewelry: 'Jewelry / High-end Assets',
        domain: 'Domain Name / IP Assets',
        digital: 'Digital Product / SaaS / Code',
        service: 'Professional Services / Freelance',
        other: 'Other',
      }
    },
    ru: {
      calcTitle: 'Калькулятор комиссии KREDO',
      calcSubtitle: 'Мгновенный и прозрачный расчет стоимости эскроу по фиксированной тарифной ставке 2%',
      sideLabel: 'Какова ваша роль в сделке?',
      buyer: 'Я покупаю (плачу средства)',
      seller: 'Я продаю (получаю средства)',
      assetLabel: 'Тип актива',
      amountLabel: 'Сумма сделки',
      resultTitle: 'Результаты расчета',
      amountValue: 'Заявленная сумма:',
      feeValue: 'Комиссия сервиса (2%):',
      buyerWillPay: 'Покупатель оплачивает:',
      sellerWillGet: 'Продавец получит на счет:',
      ctaBtn: 'Запустить безопасную сделку',
      trustedNote: 'Средства будут надежно заблокированы на защищенном эскроу-счете KREDO до выполнения условий.',
      assets: {
        vehicle: 'Автомобиль / Транспорт',
        apartment: 'Недвижимость / Квартира',
        business: 'Готовый бизнес / Компания',
        jewelry: 'Ювелирные изделия / Люкс',
        domain: 'Доменное имя / IP-адреса',
        digital: 'Цифровой товар / SaaS / Код',
        service: 'Услуги / Фриланс контракт',
        other: 'Другое',
      }
    }
  };

  const t = dict[lang];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(lang === 'ua' ? 'uk-UA' : lang === 'ru' ? 'ru-RU' : 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handleCreateOffer = () => {
    if (onInitiateDeal) {
      onInitiateDeal(amount, role, t.assets[asset as keyof typeof t.assets]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
        className={`w-full rounded-2xl md:rounded-3xl p-6 sm:p-10 border transition-all duration-300 relative overflow-hidden shadow-2xl ${
          theme === 'dark'
            ? 'bg-stone-900/50 border-stone-800 backdrop-blur-xl'
            : 'bg-white border-stone-200/80 shadow-stone-200/60'
        }`}
      >
        {/* Subtle decorative background gradient accent */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

        {/* Calculator Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-200/10 dark:border-stone-800/60">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5 text-emerald-400' : 'bg-stone-100 text-stone-900'}`}>
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <h3 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
                {t.calcTitle}
              </h3>
              <p className={`text-xs mt-1 font-medium ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>
                {t.calcSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-stone-100 dark:bg-stone-950 p-1 rounded-lg border border-stone-200/40 dark:border-stone-850">
            {(['USD', 'EUR', 'UAH'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  currency === curr
                    ? theme === 'dark'
                      ? 'bg-white text-black'
                      : 'bg-stone-900 text-white'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>

        {/* Calculator Split Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Form control side (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            {/* 1. Deal Role radio */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                {t.sideLabel}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`flex items-center justify-center space-x-2.5 px-4 py-3.5 rounded-xl border font-semibold text-sm transition-all text-center ${
                    role === 'buyer'
                      ? theme === 'dark'
                        ? 'border-white bg-white/5 text-white'
                        : 'border-stone-900 bg-stone-50 text-stone-900'
                      : theme === 'dark'
                      ? 'border-stone-800 text-stone-500 hover:text-stone-300 hover:bg-stone-950/20'
                      : 'border-stone-200 text-stone-500 hover:text-stone-850 hover:bg-stone-50'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${role === 'buyer' ? 'bg-emerald-500' : 'bg-stone-600'}`} />
                  <span>{t.buyer}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`flex items-center justify-center space-x-2.5 px-4 py-3.5 rounded-xl border font-semibold text-sm transition-all text-center ${
                    role === 'seller'
                      ? theme === 'dark'
                        ? 'border-white bg-white/5 text-white'
                        : 'border-stone-900 bg-stone-50 text-stone-900'
                      : theme === 'dark'
                      ? 'border-stone-800 text-stone-500 hover:text-stone-300 hover:bg-stone-950/20'
                      : 'border-stone-200 text-stone-500 hover:text-stone-850 hover:bg-stone-50'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${role === 'seller' ? 'bg-teal-500' : 'bg-stone-600'}`} />
                  <span>{t.seller}</span>
                </button>
              </div>
            </div>

            {/* 2. Asset type dropdown & amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                  {t.assetLabel}
                </label>
                <select
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-3 text-sm font-semibold focus:outline-none focus:ring-1 ${
                    theme === 'dark'
                      ? 'bg-stone-950 border-stone-800 text-white focus:border-white focus:ring-white/20'
                      : 'bg-white border-stone-200 text-stone-900 focus:border-stone-900 focus:ring-stone-900/10'
                  }`}
                >
                  {Object.entries(t.assets).map(([key, label]) => (
                    <option key={key} value={key} className={theme === 'dark' ? 'bg-stone-950 text-white' : 'bg-white text-stone-900'}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                  {t.amountLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>
                      {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₴'}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    min="1"
                    placeholder="5000"
                    className={`w-full rounded-xl border pl-9 pr-4 py-3 text-sm font-bold focus:outline-none focus:ring-1 ${
                      theme === 'dark'
                        ? 'bg-stone-950 border-stone-800 text-white focus:border-white focus:ring-white/20'
                        : 'bg-white border-stone-200 text-stone-900 focus:border-stone-900 focus:ring-stone-900/10'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Note */}
            <div className={`p-4 rounded-xl flex items-start space-x-3 border-l-2 border-emerald-500 ${
              theme === 'dark' ? 'bg-emerald-500/5' : 'bg-emerald-50/50'
            }`}>
              <ShieldCheck className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <p className={`text-[11px] leading-relaxed font-medium ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                {t.trustedNote}
              </p>
            </div>

          </div>

          {/* Calculations Results side (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className={`rounded-xl px-5 py-6 sm:p-6 flex flex-col justify-between h-full border ${
              theme === 'dark'
                ? 'bg-stone-950/40 border-stone-850'
                : 'bg-stone-50 border-stone-200/60 shadow-inner'
            }`}>
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider block mb-4 pb-2 border-b border-stone-200/10 dark:border-stone-800/60 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>
                  {t.resultTitle}
                </span>

                <div className="space-y-4">
                  {/* Declared amount */}
                  <div className="flex justify-between items-center text-xs">
                    <span className={theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}>{t.amountValue}</span>
                    <span className={`font-bold ${theme === 'dark' ? 'text-stone-300' : 'text-stone-700'}`}>{formatCurrency(amount)}</span>
                  </div>

                  {/* Commission info */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center space-x-1">
                      <span className={theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}>{t.feeValue}</span>
                    </span>
                    <span className="font-bold text-emerald-500">+{formatCurrency(serviceFee)}</span>
                  </div>

                  <hr className="border-stone-200/10 dark:border-stone-850" />

                  {/* Total Buyer */}
                  <div className="space-y-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                      role === 'buyer' ? 'text-emerald-500' : theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                    }`}>
                      {t.buyerWillPay}
                    </span>
                    <span className={`text-lg sm:text-xl font-bold block ${
                      role === 'buyer' 
                        ? theme === 'dark' ? 'text-white' : 'text-stone-950'
                        : theme === 'dark' ? 'text-stone-400' : 'text-stone-600'
                    }`}>
                      {formatCurrency(totalBuyerPays)}
                    </span>
                  </div>

                  {/* Total Seller */}
                  <div className="space-y-1.5 mt-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                      role === 'seller' ? 'text-emerald-500' : theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                    }`}>
                      {t.sellerWillGet}
                    </span>
                    <span className={`text-lg sm:text-xl font-bold block ${
                      role === 'seller' 
                        ? theme === 'dark' ? 'text-white' : 'text-stone-950'
                        : theme === 'dark' ? 'text-stone-400' : 'text-stone-600'
                    }`}>
                      {formatCurrency(totalSellerReceives)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleCreateOffer}
                className={`w-full mt-6 py-3.5 px-4 rounded-xl text-xs font-bold border transition-all duration-350 shadow-sm flex items-center justify-center space-x-2.5 ${
                  theme === 'dark'
                    ? 'bg-white text-black hover:bg-stone-200 border-white font-black'
                    : 'bg-black text-white hover:bg-stone-900 border-black'
                }`}
              >
                <span>{t.ctaBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
