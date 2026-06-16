/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppTheme, Language } from '../types';
import {
  countryFlag,
  formatNationalPhone,
  isValidNationalPhone,
  normalizeInternationalPhone,
  PHONE_COUNTRIES,
  PhoneCountry,
} from '../phoneCountries';
import { ChevronDown, Search } from 'lucide-react';

interface PhoneNumberInputProps {
  lang: Language;
  theme: AppTheme;
  label: string;
  value: string;
  countryName: string;
  disabled?: boolean;
  error?: string;
  onChange: (payload: {
    country: PhoneCountry;
    countryName: string;
    national: string;
    international: string;
    isValid: boolean;
  }) => void;
  onBlur?: () => void;
}

const localeByLang: Record<Language, string> = {
  ua: 'uk',
  ru: 'ru',
  en: 'en',
};

export default function PhoneNumberInput({
  lang,
  theme,
  label,
  value,
  countryName,
  disabled = false,
  error,
  onChange,
  onBlur,
}: PhoneNumberInputProps) {
  const fallback = PHONE_COUNTRIES[0];
  const selectedCountry = PHONE_COUNTRIES.find((country) => country.name === countryName) || fallback;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const groupRef = useRef<HTMLDivElement>(null);
  const displayNames = useMemo(
    () => new Intl.DisplayNames([localeByLang[lang]], { type: 'region' }),
    [lang],
  );

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (groupRef.current && !groupRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [open]);

  const localizedName = (country: PhoneCountry) => displayNames.of(country.iso) || country.name;
  const filteredCountries = PHONE_COUNTRIES.filter((country) => {
    const haystack = `${country.name} ${localizedName(country)} ${country.iso} ${country.dialCode}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  const updatePhone = (country: PhoneCountry, nationalValue: string) => {
    const formattedNational = formatNationalPhone(nationalValue);
    onChange({
      country,
      countryName: country.name,
      national: formattedNational,
      international: normalizeInternationalPhone(country, formattedNational),
      isValid: isValidNationalPhone(country, formattedNational),
    });
  };

  const helperText = lang === 'ua'
    ? 'Приклад'
    : lang === 'ru'
      ? 'Пример'
      : 'Example';

  return (
    <div ref={groupRef} className="relative">
      <label className={`mb-1.5 block text-[11px] font-bold uppercase tracking-wider ${
        theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
      }`}>
        {label}
      </label>
      <div className={`relative flex min-h-13 items-stretch overflow-visible rounded-2xl border transition-all focus-within:border-emerald-500/70 ${
        error
          ? 'border-red-500'
          : theme === 'dark'
            ? 'border-stone-850 bg-stone-950'
            : 'border-stone-200 bg-stone-50'
      } ${disabled ? 'opacity-70' : ''}`}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((value) => !value)}
          className={`flex min-h-13 shrink-0 items-center gap-2 rounded-l-2xl border-r px-3 text-left text-xs font-bold transition-colors sm:min-w-40 ${
            theme === 'dark'
              ? 'border-stone-850 text-stone-200 hover:bg-white/[0.04]'
              : 'border-stone-200 text-stone-800 hover:bg-white'
          }`}
          aria-expanded={open}
        >
          <span className="text-lg leading-none">{countryFlag(selectedCountry.iso)}</span>
          <span className="hidden max-w-24 truncate sm:block">{localizedName(selectedCountry)}</span>
          <span className="font-black text-emerald-500">{selectedCountry.dialCode}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-stone-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <input
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel-national"
          disabled={disabled}
          value={value}
          onBlur={onBlur}
          onChange={(event) => updatePhone(selectedCountry, event.target.value)}
          placeholder={selectedCountry.example}
          className={`min-w-0 flex-1 rounded-r-2xl bg-transparent px-3 py-3 text-sm font-semibold outline-none ${
            theme === 'dark' ? 'text-white placeholder:text-stone-600' : 'text-stone-950 placeholder:text-stone-400'
          }`}
        />
      </div>

      {open && !disabled && (
        <div className={`absolute left-0 right-0 top-full z-40 mt-2 max-h-72 overflow-hidden rounded-2xl border shadow-2xl ${
          theme === 'dark'
            ? 'border-stone-800 bg-[#111] text-stone-100 shadow-black/40'
            : 'border-stone-200 bg-white text-stone-900 shadow-stone-200/70'
        }`}>
          <div className={`flex items-center gap-2 border-b px-3 py-2 ${
            theme === 'dark' ? 'border-stone-800' : 'border-stone-100'
          }`}>
            <Search className="h-4 w-4 text-stone-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={lang === 'ua' ? 'Пошук країни' : lang === 'ru' ? 'Поиск страны' : 'Search country'}
              className={`w-full bg-transparent py-2 text-sm font-semibold outline-none ${
                theme === 'dark' ? 'text-white placeholder:text-stone-600' : 'text-stone-900 placeholder:text-stone-400'
              }`}
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1.5">
            {filteredCountries.map((country) => (
              <button
                key={`${country.iso}-${country.dialCode}`}
                type="button"
                onClick={() => {
                  setOpen(false);
                  setQuery('');
                  updatePhone(country, value);
                }}
                className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition-colors ${
                  selectedCountry.iso === country.iso
                    ? theme === 'dark'
                      ? 'bg-emerald-400/10 text-emerald-200'
                      : 'bg-emerald-50 text-emerald-800'
                    : theme === 'dark'
                      ? 'text-stone-300 hover:bg-white/[0.05]'
                      : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span className="text-lg">{countryFlag(country.iso)}</span>
                <span className="min-w-0 flex-1 truncate">{localizedName(country)}</span>
                <span className="font-black text-emerald-500">{country.dialCode}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className={`mt-1.5 text-[11px] font-semibold ${
        error ? 'text-red-500' : theme === 'dark' ? 'text-stone-500' : 'text-stone-500'
      }`}>
        {error || `${helperText}: ${selectedCountry.example}`}
      </p>
    </div>
  );
}
