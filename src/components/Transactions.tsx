/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RoutePath, Language, AppTheme, EscrowDeal, DealStatus, DealRole } from '../types';
import { i18nDict } from '../messages';
import { Search, MessageSquare, Send, CheckCircle, Clock, AlertTriangle, XCircle, Landmark, PlusCircle, ShieldCheck } from 'lucide-react';

interface TransactionsProps {
  deals: EscrowDeal[];
  lang: Language;
  theme: AppTheme;
  updateDealStatus: (dealId: string, status: DealStatus, systemMsg?: string) => void;
  sendDealMessage: (dealId: string, text: string, sender: 'user' | 'partner' | 'system') => void;
  selectedDealId: string;
  setSelectedDealId: (id: string | '') => void;
  setRoute: (route: RoutePath) => void;
}

export default function Transactions({
  deals = [],
  lang,
  theme,
  updateDealStatus,
  sendDealMessage,
  selectedDealId,
  setSelectedDealId,
  setRoute,
}: TransactionsProps) {
  const t = i18nDict[lang];
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const replyTimerRef = useRef<number | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | DealRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | DealStatus>('all');

  // Chat message textbox
  const [messageText, setMessageText] = useState('');

  const activeDeal = useMemo(
    () => deals.find((deal) => deal.id === selectedDealId) || deals[0] || null,
    [deals, selectedDealId],
  );

  // Auto scroll chat to bottom when messages list changes
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeDeal?.messages?.length, selectedDealId]);

  // Set the selected deal if none selected
  useEffect(() => {
    if (!selectedDealId && deals.length > 0) {
      setSelectedDealId(deals[0].id);
    }
  }, [deals, selectedDealId, setSelectedDealId]);

  useEffect(() => () => {
    if (replyTimerRef.current) window.clearTimeout(replyTimerRef.current);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeDeal) return;

    sendDealMessage(activeDeal.id, messageText.trim(), 'user');
    setMessageText('');

    // Trigger mock partner/arbiter automated realistic responses to demonstrate high fidelity
    if (replyTimerRef.current) window.clearTimeout(replyTimerRef.current);
    replyTimerRef.current = window.setTimeout(() => {
      let mockReply = '';
      if (activeDeal.status === 'created') {
        mockReply = `Alright, I reviewed the conditions of "${activeDeal.title}". Let me know once you fund the deposition so I can prepare delivery in my local inventory.`;
      } else if (activeDeal.status === 'funded') {
        mockReply = `Deposit confirmed. Thank you! I already started working on "${activeDeal.title}". Expect delivery soon.`;
      } else if (activeDeal.status === 'delivered') {
        mockReply = `I submitted the deliverables. Please check and click "Accept & Release Funds" to complete the transaction. Let me know if you need adjustments.`;
      } else if (activeDeal.status === 'disputed') {
        mockReply = `[KREDO Arbitrator Assignment]: I have joined the channel to review specifications. Please submit physical proof docs or correspondence logs here.`;
      } else {
        mockReply = `Deal completed. Good doing business with you!`;
      }

      sendDealMessage(activeDeal.id, mockReply, activeDeal.status === 'disputed' ? 'system' : 'partner');
    }, 1500);
  };

  // Dispatch Action triggers
  const executePay = (dealId: string) => {
    updateDealStatus(dealId, 'funded', `Transaction Funded. Escrow of ${formatMoney(activeDeal?.amount || 0)} secured in KREDO transit vault.`);
  };

  const executeDeliver = (dealId: string) => {
    updateDealStatus(dealId, 'delivered', 'Seller marked the deal of service as DELIVERED. Buyer inspection phase is now active.');
  };

  const executeRelease = (dealId: string) => {
    updateDealStatus(dealId, 'released', 'Buyer APPROVED deliverables. KREDO dispatched total funds to the Seller.');
  };

  const executeDispute = (dealId: string) => {
    updateDealStatus(dealId, 'disputed', 'A dispute protocol has been INITIATED by customer. KREDO mediator assigned.');
  };

  const executeCancel = (dealId: string) => {
    updateDealStatus(dealId, 'cancelled', 'Agreement of trade has been CANCELLED and deleted from active registers.');
  };

  // Filters calculation
  const filteredDeals = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return deals.filter((deal) => {
      const matchesSearch = !normalizedSearch
        || deal.title.toLowerCase().includes(normalizedSearch)
        || deal.partnerName.toLowerCase().includes(normalizedSearch);
      const matchesRole = roleFilter === 'all' || deal.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [deals, roleFilter, searchTerm, statusFilter]);

  const emptyState = {
    ua: {
      title: 'У вас ще немає угод',
      text: 'Створіть першу безпечну угоду та відстежуйте її статус у кабінеті.',
      button: 'Створити угоду',
      noResults: 'За вибраними фільтрами угод не знайдено.',
    },
    ru: {
      title: 'У вас пока нет сделок',
      text: 'Создайте первую безопасную сделку и отслеживайте её статус в кабинете.',
      button: 'Создать сделку',
      noResults: 'По выбранным фильтрам сделки не найдены.',
    },
    en: {
      title: 'You have no deals yet',
      text: 'Create your first secure deal and track its status from your account.',
      button: 'Create a deal',
      noResults: 'No deals match the selected filters.',
    },
  }[lang];

  const formatMoney = (val: number, curStr: string = 'USD') => {
    return new Intl.NumberFormat(lang === 'ua' ? 'uk-UA' : 'en-US', {
      style: 'currency',
      currency: activeDeal?.currency || curStr,
      maximumFractionDigits: 0
    }).format(val);
  };

  // Status rendering metadata maps
  const statusLabels: Record<DealStatus, string> = {
    created: t.deals.statusCreated,
    funded: t.deals.statusFunded,
    delivered: t.deals.statusDelivered,
    released: t.deals.statusReleased,
    disputed: t.deals.statusDisputed,
    cancelled: t.deals.statusCancelled,
  };

  const statusColors: Record<DealStatus, string> = {
    created: 'bg-stone-500/10 text-stone-400 border-stone-500/20',
    funded: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    delivered: 'bg-blue-500/10 text-blue-500 border-blue-505/20',
    released: 'bg-stone-300/10 text-stone-400 border-stone-800',
    disputed: 'bg-red-500/10 text-red-500 border-red-500/20',
    cancelled: 'bg-stone-900 border-transparent text-stone-600',
  };

  return (
    <div className={theme === 'dark' ? 'text-stone-100' : 'text-stone-900'}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header Grid */}
        <div className={`mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-[2rem] border p-6 sm:p-8 ${
          theme === 'dark' ? 'border-white/[0.08] bg-[#101010]' : 'border-stone-200 bg-white shadow-sm'
        }`}>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>
              {t.deals.all}
            </h1>
            <p className={`text-sm mt-2 max-w-2xl leading-6 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
              {lang === 'ua' ? 'Репозиторій безпечних угод ескроу. Перевіряйте статус або відкривайте підтверджені файли чатів з партнерами.' : lang === 'ru' ? 'Репозиторий безопасных сделок эскроу. Отслеживайте статус или загружайте файлы чатов.' : 'Secure Escrow agreements repository tracking. Review status or open secured partner chat files.'}
            </p>
          </div>
        </div>

        {/* Big Dashboard splits */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Filterable transactions list (Grid size 5) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Search controls & Filters */}
            <div className={`rounded-2xl border p-3.5 flex flex-col gap-3 ${
              theme === 'dark' ? 'bg-[#0b0b0b]/75 border-white/[0.07]' : 'bg-white/80 border-stone-200/80 shadow-sm'
            }`}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                <input
                  type="text"
                  placeholder={t.deals.searchPl}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full text-xs font-semibold pl-9 pr-4 py-2.5 rounded-xl border transition-all ${
                    theme === 'dark'
                      ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-550'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-stone-900'
                  }`}
                />
              </div>

              {/* Filters dropdown row */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1.5">{t.deals.filterRole}:</label>
                  <select
                    value={roleFilter}
                    onChange={(e: any) => setRoleFilter(e.target.value)}
                    className={`w-full text-sm font-semibold px-3 py-2.5 rounded-xl border appearance-none transition-all ${
                      theme === 'dark' ? 'bg-stone-950 border-stone-900 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                    }`}
                  >
                    <option value="all">{lang === 'ua' ? 'Всі ролі' : lang === 'ru' ? 'Все роли' : 'All Roles'}</option>
                    <option value="buyer">{lang === 'ua' ? 'Я Покупець' : lang === 'ru' ? 'Я Покупатель' : 'I am Buyer'}</option>
                    <option value="seller">{lang === 'ua' ? 'Я Продавець' : lang === 'ru' ? 'Я Продавец' : 'I am Seller'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1.5">{t.deals.filterStatus}:</label>
                  <select
                    value={statusFilter}
                    onChange={(e: any) => setStatusFilter(e.target.value)}
                    className={`w-full text-sm font-semibold px-3 py-2.5 rounded-xl border appearance-none transition-all ${
                      theme === 'dark' ? 'bg-stone-950 border-stone-900 text-white' : 'bg-stone-50 border-stone-200 text-stone-900'
                    }`}
                  >
                    <option value="all">{lang === 'ua' ? 'Всі статуси' : lang === 'ru' ? 'Все статусы' : 'All statuses'}</option>
                    <option value="created">{t.deals.statusCreated}</option>
                    <option value="funded">{t.deals.statusFunded}</option>
                    <option value="delivered">{t.deals.statusDelivered}</option>
                    <option value="released">{t.deals.statusReleased}</option>
                    <option value="disputed">{t.deals.statusDisputed}</option>
                    <option value="cancelled">{t.deals.statusCancelled}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List entries */}
            <div className="space-y-3 max-h-[70vh] overflow-y-auto no-scrollbar pr-1">
              {filteredDeals.length === 0 ? (
                <div className={`rounded-[1.5rem] border p-5 ${
                  theme === 'dark' ? 'border-stone-900 text-stone-500' : 'border-stone-200 text-stone-400'
                }`}>
                  <p className="text-center text-sm font-semibold">{deals.length === 0 ? emptyState.title : emptyState.noResults}</p>
                  {deals.length === 0 && (
                    <div className="mt-5 space-y-3" aria-hidden="true">
                      {[0, 1].map((item) => (
                        <div key={item} className={`rounded-2xl border p-4 ${
                          theme === 'dark' ? 'border-white/[0.06] bg-white/[0.025]' : 'border-stone-200 bg-stone-50'
                        }`}>
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-2">
                              <div className="h-3 w-28 rounded-full bg-stone-500/15" />
                              <div className="h-2.5 w-20 rounded-full bg-stone-500/10" />
                            </div>
                            <div className="space-y-2">
                              <div className="ml-auto h-3 w-16 rounded-full bg-emerald-500/10" />
                              <div className="ml-auto h-2.5 w-12 rounded-full bg-stone-500/10" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                filteredDeals.map((deal) => {
                  const isSelect = deal.id === activeDeal?.id;
                  const isBuyer = deal.role === 'buyer';
                  return (
                    <div
                      key={deal.id}
                      onClick={() => setSelectedDealId(deal.id)}
                      id={`list-deal-card-${deal.id}`}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between select-none ${
                        isSelect
                          ? theme === 'dark'
                            ? 'bg-stone-950 border-white text-white shadow-md'
                            : 'bg-stone-102 bg-white border-black text-black shadow-md'
                          : theme === 'dark'
                          ? 'bg-[#080808]/50 border-stone-900 hover:border-stone-700 text-stone-300'
                          : 'bg-white border-stone-200 hover:border-stone-300 text-stone-900 shadow-sm'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 pr-2">
                        <span className="block text-xs font-bold truncate tracking-tight">{deal.title}</span>
                        <span className={`block text-[10px] ${theme === 'dark' && !isSelect ? 'text-stone-500' : 'text-stone-400'}`}>
                          {isBuyer ? t.deals.buyer : t.deals.seller} • {deal.partnerName}
                        </span>
                      </div>

                      <div className="text-right flex flex-col justify-between items-end shrink-0">
                        <span className="text-xs font-bold">{new Intl.NumberFormat(lang === 'ua' ? 'uk-UA' : 'en-US', { style: 'currency', currency: deal.currency, maximumFractionDigits: 0 }).format(deal.amount)}</span>
                        <span className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded mt-1.5 border ${statusColors[deal.status]}`}>
                          {statusLabels[deal.status]}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Rich details summary and chat console (Grid size 7) */}
          <div className="lg:col-span-7">
            {activeDeal ? (
              <div className={`rounded-2xl border overflow-hidden ${
                theme === 'dark' ? 'bg-[#080808] border-stone-900 text-stone-300' : 'bg-white border-stone-200 text-stone-900 shadow-sm'
              }`}>
                
                {/* Header panel */}
                <div className={`p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  theme === 'dark' ? 'border-stone-900 bg-stone-950/40' : 'border-stone-200 bg-stone-50/50'
                }`}>
                  <div>
                    <span className={`text-[10px] uppercase font-bold tracking-widest pl-2 py-0.5 border-l-2 border-stone-500 inline-block mb-1.5 ${theme === 'dark' ? 'text-stone-550 text-stone-500' : 'text-stone-400'}`}>
                      {activeDeal.category}
                    </span>
                    <h2 className={`text-lg font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>
                      {activeDeal.title}
                    </h2>
                    <p className={`text-[10px] mt-0.5 font-sans ${theme === 'dark' ? 'text-stone-500' : 'text-stone-400'}`}>
                      {t.deals.dealUuid}: <span className="font-mono">{activeDeal.id}</span>
                    </p>
                  </div>

                  {/* Cash size representation */}
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500 block">{t.deals.valueInEscrow}</span>
                    <span className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>
                      {formatMoney(activeDeal.amount)}
                    </span>
                  </div>
                </div>

                {/* Info and action panel summaries */}
                <div className="p-6 space-y-6">
                  
                  {/* Descriptions block */}
                  <div className="space-y-1.5 leading-relaxed text-xs">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500 block">{t.deals.termsSpecs}</span>
                    <p className={`${theme === 'dark' ? 'text-stone-350 text-stone-300' : 'text-stone-700'}`}>{activeDeal.description}</p>
                  </div>

                  {/* Transaction Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl border bg-stone-500/5 border-stone-500/10">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-stone-500 block mb-0.5">{t.deals.counterpartyInfo}</span>
                      <strong className={`block ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>{activeDeal.partnerName}</strong>
                      <span className="font-mono text-[10px] block truncate">{activeDeal.partnerEmail}</span>
                    </div>

                    <div className="p-3.5 rounded-xl border bg-stone-500/5 border-stone-500/10">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-stone-500 block mb-0.5">{t.deals.deliveryTime}</span>
                      <strong className={`block ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>{activeDeal.deliveryDays} {t.deals.daysMax}</strong>
                      <span className="text-[10px] block">{t.deals.agreementTimeframe}</span>
                    </div>

                    <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl border bg-stone-500/5 border-stone-500/10">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-stone-500 block mb-0.5">{t.deals.transactionStatus}</span>
                      <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded mt-0.5 border ${statusColors[activeDeal.status]}`}>
                        {statusLabels[activeDeal.status]}
                      </span>
                    </div>
                  </div>

                  {/* ACTION CONTROLS TRANSITION NODES */}
                  <div className={`p-5 rounded-2xl border text-center relative overflow-hidden flex flex-col justify-center items-center ${
                    theme === 'dark' ? 'bg-stone-900/15 border-stone-900/60' : 'bg-stone-50 border-stone-200'
                  }`}>
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-4">
                      <Clock className="h-4 w-4" />
                      <span>{t.deals.actionCenter}</span>
                    </div>

                    {/* Logic checks according to status */}
                    {activeDeal.status === 'created' && (
                      <div className="space-y-4 w-full max-w-sm">
                        {activeDeal.role === 'buyer' ? (
                          <>
                            <p className="text-xs text-stone-500">
                              {t.deals.reviewTermsDescription}
                            </p>
                            <button
                              id="btn-pay-escrow"
                              onClick={() => executePay(activeDeal.id)}
                              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2"
                            >
                              <Landmark className="h-4 w-4" />
                              <span>{t.deals.actionPay}</span>
                            </button>
                          </>
                        ) : (
                          <div className="p-4 rounded-xl border border-dashed border-stone-300 text-xs text-stone-500 text-center">
                            {t.deals.waitPaymentDescription}
                          </div>
                        )}
                        <button
                          id="btn-cancel-created"
                          onClick={() => executeCancel(activeDeal.id)}
                          className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-xl transition-colors shrink-0"
                        >
                          {t.deals.actionCancel}
                        </button>
                      </div>
                    )}

                    {activeDeal.status === 'funded' && (
                      <div className="space-y-4 w-full max-w-sm">
                        {activeDeal.role === 'seller' ? (
                          <>
                            <p className="text-xs text-stone-500">
                              {t.deals.waitEscrowDescription}
                            </p>
                            <button
                              id="btn-deliver-service"
                              onClick={() => executeDeliver(activeDeal.id)}
                              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
                            >
                              {t.deals.actionDeliver}
                            </button>
                          </>
                        ) : (
                          <div className="p-4 rounded-xl border border-dashed border-emerald-300 text-xs text-emerald-500 text-center font-medium bg-emerald-500/5 border-emerald-500/10">
                            {t.deals.waitBuyerDescription}
                          </div>
                        )}
                        <button
                          id="btn-dispute-funded"
                          onClick={() => executeDispute(activeDeal.id)}
                          className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold rounded-xl transition-colors"
                        >
                          {t.deals.actionDispute}
                        </button>
                      </div>
                    )}

                    {activeDeal.status === 'delivered' && (
                      <div className="space-y-4 w-full max-w-sm">
                        {activeDeal.role === 'buyer' ? (
                          <>
                            <p className="text-xs text-stone-500">
                              {t.deals.sellerSubmitted} <br/> {t.deals.examineQuality}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <button
                                id="btn-release-approved"
                                onClick={() => executeRelease(activeDeal.id)}
                                className="py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center space-x-1"
                              >
                                <span>{t.deals.actionRelease}</span>
                              </button>
                              <button
                                id="btn-dispute-delivered"
                                onClick={() => executeDispute(activeDeal.id)}
                                className="py-3 px-4 bg-red-500/10 hover:bg-red-500/25 text-red-500 font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center"
                              >
                                {t.deals.actionDispute}
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="p-4 rounded-xl border border-dashed border-blue-302 text-xs text-blue-500 text-center font-medium bg-blue-500/5 border-blue-500/10">
                            {lang === 'ua' ? 'Очікування перевірки результатів покупцем. Будь ласка, зачекайте.' : lang === 'ru' ? 'Ожидание проверки результатов покупателем. Пожалуйста, подождите.' : 'Awaiting buyer inspection. Please check back shortly.'}
                          </div>
                        )}
                      </div>
                    )}

                    {activeDeal.status === 'disputed' && (
                      <div className="p-4.5 rounded-xl border bg-red-500/5 border-red-500/10 text-xs text-red-500 font-medium max-w-md space-y-3">
                        <p className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <strong>{t.deals.disputeDesc}</strong>
                        </p>
                        {activeDeal.role === 'buyer' && (
                          <button
                            id="btn-release-underdispute"
                            onClick={() => executeRelease(activeDeal.id)}
                            className="w-full mt-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[11px] uppercase rounded-lg transition-colors"
                          >
                            {t.deals.withdrawRelease}
                          </button>
                        )}
                      </div>
                    )}

                    {activeDeal.status === 'released' && (
                      <div className="p-4.5 rounded-xl border bg-stone-500/5 border-stone-800/40 text-xs text-stone-500 font-medium max-w-sm flex items-center space-x-3 justify-center select-none">
                        <CheckCircle className="h-5 w-5 text-stone-500 shrink-0" />
                        <span>{t.deals.transactionCompleted}</span>
                      </div>
                    )}

                    {activeDeal.status === 'cancelled' && (
                      <div className="p-4.5 rounded-xl border bg-stone-900 border-transparent text-xs text-stone-505 font-medium max-w-sm flex items-center space-x-3 justify-center select-none">
                        <XCircle className="h-5 w-5 text-stone-605 shrink-0" />
                        <span>
                          {lang === 'ua'
                            ? 'Цю захищену угоду скасовано. Проведення платежів недоступне.'
                            : lang === 'ru'
                              ? 'Эта защищённая сделка отменена. Проведение платежей недоступно.'
                              : 'This secured agreement was cancelled. Payments are unavailable.'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* SECURED CHAT INTERFACE & Timeline logs */}
                  <div className="space-y-3 pt-4 border-t border-stone-500/10">
                    <div className="flex items-center space-x-2 pointer-events-none mb-2">
                      <MessageSquare className="h-4 w-4 text-stone-500" />
                      <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Encrypted Deal Messenger</span>
                    </div>

                    {/* Messages frame */}
                    <div className={`rounded-xl border p-4 max-h-60 overflow-y-auto no-scrollbar space-y-3 min-h-36 ${
                      theme === 'dark' ? 'bg-stone-950 border-stone-900' : 'bg-stone-50 border-stone-200'
                    }`}>
                      {activeDeal.messages?.map((msg) => {
                        const isUser = msg.sender === 'user';
                        const isSys = msg.sender === 'system';

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isUser ? 'items-end' : isSys ? 'items-center' : 'items-start'}`}
                          >
                            <div className={`max-w-[85%] rounded-xl px-3.5 py-2 text-xs font-semibold leading-relaxed ${
                              isUser
                                ? theme === 'dark'
                                  ? 'bg-white text-black'
                                  : 'bg-black text-white'
                                : isSys
                                ? 'bg-amber-500/10 border border-amber-500/20 text-stone-500 text-[10px] text-center w-full max-w-xs'
                                : theme === 'dark'
                                ? 'bg-stone-900 text-stone-200'
                                : 'bg-white border text-stone-850'
                            }`}>
                              {msg.text}
                            </div>
                            <span className="text-[9px] text-stone-550 text-stone-500 font-medium px-1 mt-0.5">
                              {isSys ? t.deals.secureProtocol : isUser ? t.deals.you : activeDeal.partnerName} • {msg.timestamp || t.deals.justNow}
                            </span>
                          </div>
                        );
                      })}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Inbox input form console */}
                    {activeDeal.status !== 'cancelled' && activeDeal.status !== 'released' && (
                      <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <input
                          type="text"
                          id="chat-textbox-input"
                          placeholder={t.deals.chatPl}
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          className={`flex-1 text-xs font-semibold px-4 py-2.5 rounded-lg border transition-all ${
                            theme === 'dark'
                              ? 'bg-stone-950 border-stone-900 text-white focus:border-stone-500'
                              : 'bg-white border-stone-200 text-stone-900 focus:border-stone-900'
                          }`}
                        />
                        <button
                          id="chat-send-btn"
                          type="submit"
                          className={`p-2.5 rounded-lg transition-transform hover:scale-[1.02] ${
                            theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
                          }`}
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </form>
                    )}

                  </div>

                </div>

              </div>
            ) : (
              <div className={`relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden rounded-[2rem] border px-6 py-12 text-center ${
                theme === 'dark'
                  ? 'border-white/[0.08] bg-[#0b0b0b] shadow-[0_24px_70px_-45px_rgba(52,211,153,0.55)]'
                  : 'border-stone-200 bg-white shadow-[0_24px_70px_-45px_rgba(5,150,105,0.4)]'
              }`}>
                <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
                <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border ${
                  theme === 'dark'
                    ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                    : 'border-emerald-500/15 bg-emerald-50 text-emerald-700'
                }`}>
                  <ShieldCheck className="h-9 w-9" />
                </div>
                <h2 className={`text-2xl font-black tracking-tight ${
                  theme === 'dark' ? 'text-white' : 'text-stone-950'
                }`}>
                  {emptyState.title}
                </h2>
                <p className={`mt-3 max-w-md text-sm leading-6 ${
                  theme === 'dark' ? 'text-stone-400' : 'text-stone-600'
                }`}>
                  {emptyState.text}
                </p>
                <button
                  type="button"
                  onClick={() => setRoute('create-deal')}
                  className={`mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold transition-all hover:-translate-y-0.5 ${
                    theme === 'dark'
                      ? 'bg-white text-black hover:bg-stone-100'
                      : 'bg-stone-950 text-white hover:bg-stone-800'
                  }`}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>{emptyState.button}</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
