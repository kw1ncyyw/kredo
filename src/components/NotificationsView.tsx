/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RoutePath, Language, AppTheme, SystemNotification } from '../types';
import { i18nDict } from '../messages';
import { ShieldCheck, Calendar, Bell, Sliders, Trash2, CheckSquare } from 'lucide-react';
import { motion } from 'motion/react';

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

  return (
    <div className={theme === 'dark' ? 'text-stone-100' : 'text-stone-900'}>
      <div className="max-w-5xl mx-auto">
        
        {/* Header Title */}
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-500/10">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-stone-950'}`}>
              {t.notif.notifTitle}
            </h1>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-stone-500' : 'text-stone-400'}`}>
              {t.notif.notifSubtitle}
            </p>
          </div>

          {/* Quick Action Button */}
          {notifications.length > 0 && (
            <button
              id="notifications-mark-read"
              onClick={markAllRead}
              className={`text-xs font-bold uppercase tracking-wider inline-flex items-center space-x-1 hover:underline ${
                theme === 'dark' ? 'text-stone-300 hover:text-white' : 'text-stone-701 text-stone-700 hover:text-stone-955'
              }`}
            >
              <CheckSquare className="h-4 w-4 shrink-0" />
              <span>{t.notif.markAll}</span>
            </button>
          )}
        </div>

        {/* Notifications list catalog */}
        {notifications.length === 0 ? (
          <div className={`rounded-3xl p-14 border border-dashed text-center ${
            theme === 'dark' ? 'border-stone-900 bg-stone-950/20' : 'border-stone-200 bg-stone-50/50'
          }`}>
            <Bell className="h-10 w-10 text-stone-500 mx-auto mb-4" />
            <p className={`text-sm ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>
              {lang === 'ua' ? 'Немає нових сповіщень' : lang === 'ru' ? 'Нет новых уведомлений' : 'No new notifications'}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                id={`notif-${notif.id}`}
                onClick={() => handleOpenNotification(notif)}
                className={`p-5 rounded-2xl border flex items-start justify-between gap-4 transition-all cursor-pointer hover:scale-[1.01] ${
                  notif.read
                    ? theme === 'dark'
                      ? 'bg-[#080808]/40 border-stone-900/60 text-stone-401'
                      : 'bg-white/70 border-stone-200 text-stone-605 shadow-sm'
                    : theme === 'dark'
                    ? 'bg-[#080808]/90 border-white text-white shadow-md'
                    : 'bg-stone-50 border-black text-stone-905 shadow-sm'
                }`}
              >
                
                {/* Indicator Status & text info labels */}
                <div className="flex items-start space-x-4 min-w-0">
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
                    <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-stone-400' : 'text-stone-505 text-stone-500'}`}>
                      {notif.description[lang]}
                    </p>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-stone-500 block flex items-center space-x-1 pt-1.5">
                      <Calendar className="h-3 w-3" />
                      <span>{notif.time || (lang === 'ua' ? 'Час не вказано' : lang === 'ru' ? 'Время не указано' : 'Time not specified')}</span>
                    </span>
                  </div>
                </div>

                {/* Specific trash bin logs */}
                <button
                  id={`delete-notif-${notif.id}`}
                  onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-stone-500 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

              </div>
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
