/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RoutePath, Language, AppTheme, SystemNotification } from '../types';
import { i18nDict } from '../messages';
import { Calendar, Bell, Trash2, CheckSquare, ArrowUpRight, Inbox } from 'lucide-react';

interface NotificationsViewProps {
  notifications: SystemNotification[];
  lang: Language;
  theme: AppTheme;
  markAllRead: () => void;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
}

export default function NotificationsView({
  notifications = [],
  lang,
  theme,
  markAllRead,
  markAsRead,
  deleteNotification,
}: NotificationsViewProps) {
  const t = i18nDict[lang];
  const [selectedNotifId, setSelectedNotifId] = useState<string | null>(null);

  const handleOpenNotification = (notif: SystemNotification) => {
    setSelectedNotifId(notif.id);
    if (!notif.read) {
      markAsRead(notif.id);
    }
  };

  const selectedNotif = notifications.find(n => n.id === selectedNotifId);
  const copy = {
    ua: {
      emptyTitle: 'Сповіщень поки немає',
      emptyText: 'Тут з’являтимуться оновлення щодо ваших угод, верифікації та звернень.',
      open: 'Відкрити деталі',
      read: 'Прочитано',
      unread: 'Нове',
      type: 'Тип',
      types: { info: 'Інформація', success: 'Успіх', warning: 'Увага', alert: 'Важливо' },
    },
    ru: {
      emptyTitle: 'Уведомлений пока нет',
      emptyText: 'Здесь будут появляться обновления по вашим сделкам, верификации и обращениям.',
      open: 'Открыть детали',
      read: 'Прочитано',
      unread: 'Новое',
      type: 'Тип',
      types: { info: 'Информация', success: 'Успех', warning: 'Внимание', alert: 'Важно' },
    },
    en: {
      emptyTitle: 'No notifications yet',
      emptyText: 'Updates about your deals, verification, and support requests will appear here.',
      open: 'Open details',
      read: 'Read',
      unread: 'New',
      type: 'Type',
      types: { info: 'Information', success: 'Success', warning: 'Warning', alert: 'Important' },
    },
  }[lang];

  return (
    <div className={theme === 'dark' ? 'text-stone-100' : 'text-stone-900'}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header Title */}
        <div className={`mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 rounded-[2rem] border p-6 sm:p-8 ${
          theme === 'dark' ? 'border-white/[0.08] bg-[#101010]' : 'border-stone-200 bg-white shadow-sm'
        }`}>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>
              {t.notif.notifTitle}
            </h1>
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
              {t.notif.notifSubtitle}
            </p>
          </div>

          {/* Quick Action Button */}
          {notifications.length > 0 && (
            <button
              id="notifications-mark-read"
              onClick={markAllRead}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition-colors ${
                theme === 'dark' ? 'border-stone-800 bg-stone-900 text-stone-300 hover:text-white' : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-white'
              }`}
            >
              <CheckSquare className="h-4 w-4 shrink-0" />
              <span>{t.notif.markAll}</span>
            </button>
          )}
        </div>

        {/* Notifications list catalog */}
        {notifications.length === 0 ? (
          <div className={`relative overflow-hidden rounded-[2rem] p-10 sm:p-16 border text-center ${
            theme === 'dark' ? 'border-white/[0.08] bg-[#0d0d0d]' : 'border-stone-200 bg-white shadow-[0_22px_65px_-45px_rgba(5,150,105,0.4)]'
          }`}>
            <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-500/15 bg-emerald-500/[0.07] text-emerald-500">
              <Inbox className="h-9 w-9" />
            </span>
            <h2 className={`mt-6 text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>
              {copy.emptyTitle}
            </h2>
            <p className={`mx-auto mt-3 max-w-lg text-sm leading-6 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
              {copy.emptyText}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {notifications.map((notif) => (
              <article
                key={notif.id}
                id={`notif-${notif.id}`}
                onClick={() => handleOpenNotification(notif)}
                className={`rounded-[1.5rem] border p-5 sm:p-6 transition-all hover:-translate-y-0.5 ${
                  notif.read
                    ? theme === 'dark'
                      ? 'bg-[#0d0d0d] border-white/[0.07] text-stone-300'
                      : 'bg-white border-stone-200 text-stone-700 shadow-sm'
                    : theme === 'dark'
                    ? 'bg-emerald-500/[0.06] border-emerald-400/20 text-white shadow-md'
                    : 'bg-emerald-50/60 border-emerald-500/20 text-stone-950 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    theme === 'dark' ? 'bg-stone-900/80 text-stone-300' : 'bg-stone-100 text-stone-600'
                  }`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="block text-sm font-bold tracking-tight truncate">
                        {notif.title[lang]}
                      </span>
                      {!notif.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p className={`text-sm leading-6 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                      {notif.description[lang]}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-stone-500">
                      <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{notif.time}</span>
                      <span className="rounded-full border border-stone-500/15 px-2.5 py-1">{copy.type}: {copy.types[notif.type]}</span>
                      <span className={`rounded-full px-2.5 py-1 ${notif.read ? 'bg-stone-500/10' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {notif.read ? copy.read : copy.unread}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-stone-500/10 pt-4">
                  <button onClick={() => handleOpenNotification(notif)} className="inline-flex items-center gap-2 text-sm font-bold text-emerald-500">
                    {copy.open}<ArrowUpRight className="h-4 w-4" />
                  </button>
                  <button id={`delete-notif-${notif.id}`} onClick={() => deleteNotification(notif.id)} className="rounded-lg p-2 text-stone-500 hover:bg-red-500/10 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
      
      {/* Modal View */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
             onClick={() => setSelectedNotifId(null)}
        >
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl overflow-hidden ${
             theme === 'dark' ? 'bg-[#0a0a0a] border-stone-800' : 'bg-white border-stone-200'
          }`}
          onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest ${theme === 'dark' ? 'bg-stone-900 border-stone-800 text-stone-400' : 'bg-stone-100 border-stone-200 text-stone-600'}`}>
                {selectedNotif.type}
              </span>
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest flex items-center">
                <Calendar className="inline-block h-3 w-3 mr-1" />
                {selectedNotif.time || (lang === 'ua' ? 'Час не вказано' : lang === 'ru' ? 'Время не указано' : 'Time not specified')}
              </span>
            </div>
            
            <h3 className={`text-xl font-bold tracking-tight mb-2 ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
              {selectedNotif.title[lang]}
            </h3>
            
            <div className={`p-4 rounded-xl mt-4 text-sm font-medium leading-relaxed ${theme === 'dark' ? 'bg-stone-950 text-stone-400' : 'bg-stone-50 text-stone-700'}`}>
              {selectedNotif.description[lang]}
            </div>
            
            <button
              onClick={() => setSelectedNotifId(null)}
              className={`w-full mt-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                theme === 'dark' ? 'bg-stone-900 hover:bg-stone-800 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-900'
              }`}
            >
              {lang === 'ua' ? 'Закрити' : lang === 'ru' ? 'Закрыть' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
