/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { AppTheme, Language, RoutePath } from '../types';
import { i18nDict } from '../messages';
import {
  ChevronDown,
  Plus,
  WalletCards,
} from 'lucide-react';

interface PaymentProps {
  lang: Language;
  theme: AppTheme;
}

interface PaymentMethodsShowcaseProps extends PaymentProps {
  compact?: boolean;
}

interface PaymentHomeSectionProps extends PaymentProps {
  setRoute: (route: RoutePath) => void;
}

interface PaymentSummaryCardProps extends PaymentProps {
  amount: number;
  currency: 'USD' | 'EUR' | 'UAH';
  className?: string;
}

const platformItems = [
  { name: 'OLX', mark: 'OLX', noteKey: 'olx', color: '#002F34', darkColor: '#7DE3D1' },
  { name: 'AUTO.RIA', mark: 'AUTO', noteKey: 'autoRia', color: '#E30613', darkColor: '#FF6B73' },
  { name: 'DOM.RIA', mark: 'DOM', noteKey: 'domRia', color: '#00A651', darkColor: '#4ADE80' },
  { name: 'Prom', mark: 'Prom', noteKey: 'prom', color: '#6F2DBD', darkColor: '#C4B5FD' },
  { name: 'Rozetka Marketplace', mark: 'RZ', noteKey: 'rozetka', color: '#00A046', darkColor: '#86EFAC' },
  { name: 'Instagram Shop', mark: 'IG', noteKey: 'instagram', color: '#C13584', darkColor: '#F9A8D4' },
  { name: 'Facebook Marketplace', mark: 'f', noteKey: 'facebook', color: '#1877F2', darkColor: '#93C5FD' },
  { name: 'Telegram deal', mark: 'TG', noteKey: 'telegram', color: '#229ED9', darkColor: '#7DD3FC' },
  { name: 'Direct deal', mark: 'K', noteKey: 'custom', color: '#10B981', darkColor: '#6EE7B7' },
] as const;

const mainMethods = [
  { label: 'Visa', mark: 'visa', tooltipKey: 'visa', statusKey: 'partnerAvailable' },
  { label: 'Mastercard', mark: 'mastercard', tooltipKey: 'mastercard', statusKey: 'partnerAvailable' },
  { label: 'Apple Pay', mark: 'applePay', tooltipKey: 'applePay', statusKey: 'planned' },
  { label: 'Google Pay', mark: 'googlePay', tooltipKey: 'googlePay', statusKey: 'planned' },
  { labelKey: 'bankTransfer', mark: 'iban', tooltipKey: 'bankTransfer', statusKey: 'partnerAvailable' },
  { labelKey: 'sepaTransfer', mark: 'sepa', tooltipKey: 'sepa', statusKey: 'partnerAvailable' },
  { labelKey: 'swiftTransfer', mark: 'swift', tooltipKey: 'swift', statusKey: 'partnerAvailable' },
] as const;

type PaymentItem = typeof mainMethods[number];
type PlatformItem = typeof platformItems[number];

function getMethodLabel(item: PaymentItem, lang: Language) {
  const copy = i18nDict[lang].payments;
  return 'labelKey' in item ? copy[item.labelKey] : item.label;
}

function getPlatformName(item: PlatformItem, lang: Language) {
  const copy = i18nDict[lang].payments as any;
  return copy.platformLabels?.[item.noteKey] || item.name;
}

function PaymentMark({ mark, theme, compact = false }: { mark: string; theme: AppTheme; compact?: boolean }) {
  if (mark === 'visa') {
    return <span className={`${compact ? 'text-base' : 'text-lg'} font-black italic tracking-tighter text-[#1A1F71]`}>VISA</span>;
  }
  if (mark === 'mastercard') {
    return (
      <span className={`relative flex ${compact ? 'h-7 w-11' : 'h-8 w-13'} items-center justify-center`}>
        <span className={`absolute left-1.5 ${compact ? 'h-6 w-6' : 'h-7 w-7'} rounded-full bg-[#EB001B]`} />
        <span className={`absolute right-1.5 ${compact ? 'h-6 w-6' : 'h-7 w-7'} rounded-full bg-[#F79E1B] mix-blend-multiply`} />
      </span>
    );
  }
  if (mark === 'applePay') {
    return (
      <span className={`${compact ? 'text-base' : 'text-lg'} flex items-center gap-1 font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>
        <svg aria-hidden="true" viewBox="0 0 24 28" className={compact ? 'h-5 w-5' : 'h-6 w-6'} fill="currentColor">
          <path d="M18.7 14.9c0-3.1 2.5-4.6 2.6-4.7-1.4-2.1-3.7-2.4-4.5-2.4-1.9-.2-3.7 1.1-4.7 1.1s-2.5-1.1-4.1-1.1c-2.1 0-4 1.2-5.1 3.1-2.2 3.8-.6 9.5 1.6 12.6 1.1 1.5 2.3 3.2 4 3.1 1.6-.1 2.2-1 4.1-1s2.5 1 4.1 1c1.7 0 2.8-1.6 3.9-3.1 1.2-1.8 1.7-3.5 1.7-3.6-.1 0-3.5-1.3-3.6-5zM15.6 5.8c.9-1.1 1.5-2.6 1.3-4.1-1.3.1-2.9.9-3.8 2-.8 1-1.6 2.6-1.4 4 1.5.1 3-.8 3.9-1.9z" />
        </svg>
        Pay
      </span>
    );
  }
  if (mark === 'googlePay') {
    return (
      <span className="text-lg font-black tracking-tight">
        <span className="text-[#4285F4]">G</span><span className="text-[#DB4437]">o</span><span className="text-[#F4B400]">o</span><span className="text-[#4285F4]">g</span><span className="text-[#0F9D58]">l</span><span className="text-[#DB4437]">e</span><span className={`ml-1 ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>Pay</span>
      </span>
    );
  }
  if (mark === 'iban') return <span className={`${compact ? 'text-xs' : 'text-sm'} font-black tracking-[0.18em] text-emerald-600`}>IBAN</span>;
  if (mark === 'sepa') return <span className={`${compact ? 'text-xs' : 'text-sm'} font-black tracking-[0.18em] text-[#21468B]`}>SEPA</span>;
  if (mark === 'swift') return <span className={`${compact ? 'text-xs' : 'text-sm'} font-black tracking-[0.18em] text-[#7A1FA2]`}>SWIFT</span>;
  if (mark === 'liqpay') return <span className="text-sm font-black text-[#78BE20]">LiqPay</span>;
  if (mark === 'fondy') return <span className="text-sm font-black text-[#6D5DF6]">Fondy</span>;
  if (mark === 'stripe') return <span className="text-sm font-black text-[#635BFF]">stripe</span>;
  if (mark === 'mangopay') return <span className="text-sm font-black text-[#FF6B35]">Mango</span>;
  if (mark === 'shield') return <span className="text-xl font-black text-emerald-500">◇</span>;
  return <Plus className="h-5 w-5 text-emerald-500" />;
}

const MethodChip: React.FC<PaymentProps & {
  item: PaymentItem;
  open: boolean;
  onTap: () => void;
  onClose: () => void;
  compact?: boolean;
}> = ({
  item,
  lang,
  theme,
  open,
  onTap,
  onClose,
  compact = false,
}) => {
  const copy = i18nDict[lang].payments;
  const label = getMethodLabel(item, lang);
  const status = copy.statuses[item.statusKey];
  const tooltip = copy.methodTooltips[item.tooltipKey];

  return (
    <div
      role="img"
      tabIndex={0}
      onClick={onTap}
      onMouseLeave={onClose}
      onBlur={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onTap();
      }}
      title={`${label}: ${tooltip}`}
      aria-label={`${label}: ${tooltip}`}
      className={`group relative flex flex-col items-center justify-center gap-2 rounded-2xl border outline-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        compact ? 'h-18 min-w-21 px-3 py-2' : 'h-22 min-w-25 px-3 py-3'
      } ${
        theme === 'dark'
          ? 'border-white/[0.08] bg-white/[0.035] hover:border-emerald-400/25'
          : 'border-stone-200 bg-white hover:border-emerald-500/30 hover:shadow-emerald-900/5'
      }`}
    >
      <span className={`flex items-center justify-center rounded-xl ${
        compact ? 'h-9 min-w-13 px-2' : 'h-10 min-w-16 px-2.5'
      } ${
        theme === 'dark' ? 'border-white/[0.07] bg-stone-950' : 'border-stone-100 bg-stone-50'
      }`}>
        <PaymentMark mark={item.mark} theme={theme} compact={compact} />
      </span>
      <span className={`max-w-24 truncate text-center text-[10px] font-bold ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>{label}</span>
      <span className={`pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-48 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl border px-3 py-2 text-center text-[11px] font-semibold leading-4 opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 ${
        open ? 'opacity-100' : ''
      } ${
        theme === 'dark'
          ? 'border-stone-800 bg-[#111] text-stone-200'
          : 'border-stone-200 bg-white text-stone-700'
      }`}>
        <strong className="mb-1 block text-xs">{label}</strong>
        <span>{tooltip}</span>
        <span className="mt-1 block text-[10px] font-black uppercase tracking-wide text-emerald-500">{status}</span>
      </span>
    </div>
  );
};

function PlatformMark({ item, theme, compact = false }: { item: typeof platformItems[number]; theme: AppTheme; compact?: boolean }) {
  return (
    <span
      style={{ color: theme === 'dark' ? item.darkColor : item.color }}
      className={`${compact ? 'h-9 w-12 text-sm' : 'h-10 w-14 text-base'} flex items-center justify-center rounded-xl border border-stone-500/10 ${theme === 'dark' ? 'bg-stone-950' : 'bg-stone-50'} font-black`}
    >
      {item.mark}
    </span>
  );
}

function useTapTooltip() {
  const [openKey, setOpenKey] = useState('');
  const timeoutRef = useRef<number | null>(null);
  const openTooltip = (key: string) => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setOpenKey(key);
    timeoutRef.current = window.setTimeout(() => setOpenKey(''), 2200);
  };
  const closeTooltip = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setOpenKey('');
  };
  return { openKey, openTooltip, closeTooltip };
}

export function PaymentMethodsShowcase({ lang, theme, compact = false }: PaymentMethodsShowcaseProps) {
  const copy = i18nDict[lang].payments;
  const { openKey, openTooltip, closeTooltip } = useTapTooltip();
  const cardClass = theme === 'dark'
    ? 'border-white/[0.08] bg-[#0d0d0d] text-stone-100'
    : 'border-stone-200 bg-white text-stone-950 shadow-[0_20px_70px_-50px_rgba(5,150,105,0.45)]';

  return (
    <section className={`rounded-[1.75rem] border ${cardClass} ${compact ? 'p-5' : 'p-6 sm:p-8'}`}>
      <div>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-emerald-500">
            {copy.methodsEyebrow}
          </p>
          <h2 className={`mt-2 text-xl font-black tracking-tight sm:text-2xl ${
            theme === 'dark' ? 'text-white' : 'text-stone-950'
          }`}>
            {copy.methodsTitle}
          </h2>
          <p className={`mt-2 max-w-2xl ${compact ? 'text-xs' : 'text-sm'} leading-6 ${
              theme === 'dark' ? 'text-stone-400' : 'text-stone-600'
            }`}>
              {copy.methodsDescription}
            </p>
        </div>
      </div>

      <div className={`mt-6 flex flex-wrap ${compact ? 'gap-2.5' : 'gap-3'}`}>
        {mainMethods.map((item) => {
          const key = getMethodLabel(item, lang);
          return (
            <MethodChip
              key={key}
              item={item}
              lang={lang}
              theme={theme}
              compact={compact}
              open={openKey === key}
              onTap={() => openTooltip(key)}
              onClose={closeTooltip}
            />
          );
        })}
      </div>

      <p className={`mt-5 rounded-2xl border px-4 py-3 text-xs font-semibold leading-5 ${
        theme === 'dark'
          ? 'border-amber-400/15 bg-amber-400/[0.06] text-stone-300'
          : 'border-amber-200 bg-amber-50 text-stone-700'
      }`}>
        {copy.legalNote}
      </p>
    </section>
  );
}

export function PaymentHomeSection({ lang, theme, setRoute }: PaymentHomeSectionProps) {
  const copy = i18nDict[lang].payments;

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className={`mx-auto max-w-6xl rounded-[1.75rem] border p-5 sm:p-6 ${
          theme === 'dark' ? 'border-white/[0.08] bg-[#0d0d0d]' : 'border-stone-200 bg-white shadow-sm'
        }`}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-emerald-500">
              {copy.homeEyebrow}
            </p>
            <h2 className={`mt-2 text-xl font-black tracking-tight sm:text-2xl ${
              theme === 'dark' ? 'text-white' : 'text-stone-950'
            }`}>
              {copy.homeTitle}
            </h2>
            <p className={`mt-2 text-sm leading-6 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
              {copy.homeSubtitle}
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">
              {copy.methodsTitle}
            </p>
            <LogoStrip lang={lang} theme={theme} type="payments" />
          </div>
          <button
            type="button"
            onClick={() => setRoute('payments')}
            className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-5 text-sm font-bold transition-all hover:-translate-y-0.5 ${
              theme === 'dark' ? 'bg-white text-black hover:bg-stone-100' : 'bg-stone-950 text-white hover:bg-stone-800'
            }`}
          >
            {copy.viewPayments}
          </button>
        </div>
      </div>
    </section>
  );
}

export function LogoStrip({ lang, theme, type = 'payments' }: PaymentProps & { type?: 'payments' | 'platforms' | 'both' }) {
  const copy = i18nDict[lang].payments;
  const { openKey, openTooltip, closeTooltip } = useTapTooltip();
  const paymentSet = mainMethods.slice(0, 5);
  const platformSet = platformItems.slice(0, 6);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {(type === 'payments' || type === 'both') && paymentSet.map((item) => {
        const key = getMethodLabel(item, lang);
        return (
          <MethodChip
            key={key}
            item={item}
            lang={lang}
            theme={theme}
            compact
            open={openKey === key}
            onTap={() => openTooltip(key)}
            onClose={closeTooltip}
          />
        );
      })}
      {(type === 'platforms' || type === 'both') && platformSet.map((item) => {
        const tooltip = copy.platformTooltips[item.noteKey];
        const name = getPlatformName(item, lang);
        return (
          <div
            key={item.name}
            role="img"
            tabIndex={0}
            title={`${name}: ${tooltip}`}
            aria-label={`${name}: ${tooltip}`}
            onClick={() => openTooltip(item.name)}
            onMouseLeave={closeTooltip}
            onBlur={closeTooltip}
            className={`group relative flex min-h-[76px] w-[104px] flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-2 outline-none transition-all hover:-translate-y-0.5 hover:shadow-md ${
              theme === 'dark'
                ? 'border-white/[0.08] bg-white/[0.035] hover:border-emerald-400/25'
                : 'border-stone-200 bg-white hover:border-emerald-500/30'
            }`}
          >
            <PlatformMark item={item} theme={theme} compact />
            <span className={`max-w-full text-center text-[10px] font-bold leading-tight ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>{name}</span>
            <span className={`pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-48 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl border px-3 py-2 text-center text-[11px] font-semibold leading-4 opacity-0 shadow-xl transition-all group-hover:opacity-100 ${
              openKey === item.name ? 'opacity-100' : ''
            } ${theme === 'dark' ? 'border-stone-800 bg-[#111] text-stone-200' : 'border-stone-200 bg-white text-stone-700'}`}>
              <strong className="mb-1 block text-xs">{name}</strong>
              {tooltip}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function MarketplacePlatformsSection({ lang, theme }: PaymentProps) {
  const copy = i18nDict[lang].payments;
  const [expanded, setExpanded] = useState(false);
  const { openKey, openTooltip, closeTooltip } = useTapTooltip();
  const primaryItems = platformItems.slice(0, 6);
  const extraItems = platformItems.slice(6);

  const renderPlatformChip = (item: typeof platformItems[number]) => {
    const name = getPlatformName(item, lang);
    return (
      <div
        key={item.name}
        role="img"
        tabIndex={0}
        title={`${name}: ${copy.platformTooltips[item.noteKey]}`}
        aria-label={`${name}: ${copy.platformTooltips[item.noteKey]}`}
        onClick={() => openTooltip(item.name)}
        onMouseLeave={closeTooltip}
        onBlur={closeTooltip}
        className="group relative flex min-w-[82px] flex-col items-center gap-2 outline-none sm:min-w-[92px]"
      >
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md sm:h-16 sm:w-16 ${
          theme === 'dark'
            ? 'border-white/[0.08] bg-white/[0.04] group-hover:border-emerald-400/25'
            : 'border-stone-200 bg-white group-hover:border-emerald-500/30 group-hover:shadow-emerald-900/5'
        }`}>
          <PlatformMark item={item} theme={theme} compact />
        </div>
        <span className={`max-w-[92px] text-center text-[10px] font-bold leading-tight sm:text-[11px] ${
          theme === 'dark' ? 'text-stone-400 group-hover:text-stone-200' : 'text-stone-600 group-hover:text-stone-900'
        }`}>
          {name}
        </span>
        <span className={`pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-52 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl border px-3 py-2 text-center text-[11px] font-semibold leading-4 opacity-0 shadow-xl transition-all group-hover:opacity-100 ${
          openKey === item.name ? 'opacity-100' : ''
        } ${theme === 'dark' ? 'border-stone-800 bg-[#111] text-stone-200' : 'border-stone-200 bg-white text-stone-700'}`}>
          <strong className="mb-1 block text-xs">{name}</strong>
          {copy.platformTooltips[item.noteKey]}
        </span>
      </div>
    );
  };

  return (
    <section className={`rounded-[1.75rem] border p-5 sm:p-6 ${
      theme === 'dark'
        ? 'border-white/[0.08] bg-[#0d0d0d] text-stone-100'
        : 'border-stone-200 bg-white text-stone-950 shadow-[0_18px_60px_-52px_rgba(5,150,105,0.35)]'
    }`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-emerald-500">
            {copy.platformsEyebrow}
          </p>
          <h2 className={`mt-2 text-xl font-black tracking-tight sm:text-2xl ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>
            {copy.platformsTitle}
          </h2>
          <p className={`mt-2 max-w-3xl text-sm leading-6 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
            {copy.platformsDescription}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border px-4 text-xs font-black transition-all hover:-translate-y-0.5 ${
            theme === 'dark'
              ? 'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300 hover:border-emerald-400/40'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300'
          }`}
          aria-expanded={expanded}
        >
          <span className={`flex h-6 w-6 items-center justify-center rounded-full ${
            theme === 'dark' ? 'bg-emerald-400/10' : 'bg-white'
          }`}>
            <Plus className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-45' : ''}`} />
          </span>
          <span>{expanded ? copy.collapseProviders : copy.expandProviders}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-center gap-x-4 gap-y-5 sm:justify-start">
        {primaryItems.map(renderPlatformChip)}
      </div>

      <div className={`grid transition-all duration-300 ease-out ${
        expanded ? 'mt-5 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
      }`}>
        <div className="overflow-hidden">
          <div className={`flex flex-wrap items-start justify-center gap-x-4 gap-y-5 rounded-3xl border px-4 py-5 sm:justify-start ${
            theme === 'dark' ? 'border-white/[0.06] bg-white/[0.025]' : 'border-stone-200 bg-stone-50/70'
          }`}>
            {extraItems.map(renderPlatformChip)}
          </div>
        </div>
      </div>

      <p className={`mt-5 rounded-2xl border px-4 py-3 text-[11px] font-semibold leading-5 ${
        theme === 'dark'
          ? 'border-white/[0.06] bg-white/[0.025] text-stone-400'
          : 'border-stone-200 bg-stone-50/70 text-stone-500'
      }`}>
        {copy.platformsDisclaimer}
      </p>
    </section>
  );
}

export function PaymentSummaryCard({ lang, theme, amount, currency, className = '' }: PaymentSummaryCardProps) {
  const copy = i18nDict[lang].payments;
  const commission = Math.max(amount * 0.02, amount > 0 ? 15 : 0);
  const total = amount + commission;
  const formatMoney = (value: number) => new Intl.NumberFormat(lang === 'ua' ? 'uk-UA' : lang === 'ru' ? 'ru-RU' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 1,
  }).format(value);

  return (
    <div className={`rounded-[1.5rem] border p-5 ${
      theme === 'dark'
        ? 'border-white/[0.08] bg-[#0b0b0b] text-stone-100'
        : 'border-stone-200 bg-white text-stone-950 shadow-sm'
    } ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-emerald-500">{copy.summaryTitle}</p>
          <h3 className={`mt-2 text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>
            {copy.paymentStatus}
          </h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${
          theme === 'dark'
            ? 'border-amber-400/20 bg-amber-400/10 text-amber-200'
            : 'border-amber-200 bg-amber-50 text-amber-700'
        }`}>
          {copy.statuses.integrationProgress}
        </span>
      </div>

      <div className="space-y-3 text-sm font-semibold">
        <div className="flex items-center justify-between gap-4">
          <span className={theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}>{copy.dealAmount}</span>
          <span>{formatMoney(amount)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className={theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}>{copy.kredoCommission}</span>
          <span>{formatMoney(commission)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-stone-500/10 pt-3">
          <span className={theme === 'dark' ? 'text-stone-300' : 'text-stone-700'}>{copy.totalDue}</span>
          <span className="text-lg font-black">{formatMoney(total)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className={theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}>{copy.paymentMethod}</span>
          <span>{copy.connectedPartner}</span>
        </div>
      </div>

      <p className={`mt-4 rounded-2xl border px-4 py-3 text-xs font-semibold leading-5 ${
        theme === 'dark'
          ? 'border-stone-800 bg-white/[0.03] text-stone-400'
          : 'border-stone-200 bg-stone-50 text-stone-600'
      }`}>
        {copy.paymentUnavailable}
      </p>
      <button
        type="button"
        disabled
        className="mt-4 flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-xl bg-stone-500/10 text-sm font-bold text-stone-500"
      >
        {copy.payDeal}
      </button>
      <p className="mt-3 text-[11px] font-medium leading-5 text-stone-500">
        {copy.summaryLegalNote}
      </p>
    </div>
  );
}
