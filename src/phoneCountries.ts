export type PhoneCountry = {
  name: string;
  iso: string;
  dialCode: string;
  minDigits: number;
  maxDigits: number;
  example: string;
};

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { name: 'Ukraine', iso: 'UA', dialCode: '+380', minDigits: 9, maxDigits: 9, example: '+380 67 123 45 67' },
  { name: 'Romania', iso: 'RO', dialCode: '+40', minDigits: 9, maxDigits: 9, example: '+40 712 345 678' },
  { name: 'Poland', iso: 'PL', dialCode: '+48', minDigits: 9, maxDigits: 9, example: '+48 512 345 678' },
  { name: 'Germany', iso: 'DE', dialCode: '+49', minDigits: 7, maxDigits: 12, example: '+49 151 23456789' },
  { name: 'Moldova', iso: 'MD', dialCode: '+373', minDigits: 8, maxDigits: 8, example: '+373 621 12 345' },
  { name: 'Czech Republic', iso: 'CZ', dialCode: '+420', minDigits: 9, maxDigits: 9, example: '+420 601 123 456' },
  { name: 'Slovakia', iso: 'SK', dialCode: '+421', minDigits: 9, maxDigits: 9, example: '+421 901 123 456' },
  { name: 'Hungary', iso: 'HU', dialCode: '+36', minDigits: 8, maxDigits: 9, example: '+36 20 123 4567' },
  { name: 'France', iso: 'FR', dialCode: '+33', minDigits: 9, maxDigits: 9, example: '+33 6 12 34 56 78' },
  { name: 'Italy', iso: 'IT', dialCode: '+39', minDigits: 8, maxDigits: 11, example: '+39 312 345 6789' },
  { name: 'Spain', iso: 'ES', dialCode: '+34', minDigits: 9, maxDigits: 9, example: '+34 612 345 678' },
  { name: 'Portugal', iso: 'PT', dialCode: '+351', minDigits: 9, maxDigits: 9, example: '+351 912 345 678' },
  { name: 'Netherlands', iso: 'NL', dialCode: '+31', minDigits: 9, maxDigits: 9, example: '+31 6 12345678' },
  { name: 'Belgium', iso: 'BE', dialCode: '+32', minDigits: 8, maxDigits: 9, example: '+32 470 12 34 56' },
  { name: 'United Kingdom', iso: 'GB', dialCode: '+44', minDigits: 9, maxDigits: 10, example: '+44 7400 123456' },
  { name: 'United States', iso: 'US', dialCode: '+1', minDigits: 10, maxDigits: 10, example: '+1 415 555 2671' },
  { name: 'Canada', iso: 'CA', dialCode: '+1', minDigits: 10, maxDigits: 10, example: '+1 416 555 2671' },
  { name: 'Turkey', iso: 'TR', dialCode: '+90', minDigits: 10, maxDigits: 10, example: '+90 532 123 45 67' },
  { name: 'Georgia', iso: 'GE', dialCode: '+995', minDigits: 9, maxDigits: 9, example: '+995 555 12 34 56' },
  { name: 'Lithuania', iso: 'LT', dialCode: '+370', minDigits: 8, maxDigits: 8, example: '+370 612 34567' },
  { name: 'Latvia', iso: 'LV', dialCode: '+371', minDigits: 8, maxDigits: 8, example: '+371 2123 4567' },
  { name: 'Estonia', iso: 'EE', dialCode: '+372', minDigits: 7, maxDigits: 8, example: '+372 5123 4567' },
  { name: 'Austria', iso: 'AT', dialCode: '+43', minDigits: 7, maxDigits: 13, example: '+43 664 123456' },
  { name: 'Bulgaria', iso: 'BG', dialCode: '+359', minDigits: 7, maxDigits: 9, example: '+359 888 123 456' },
  { name: 'Croatia', iso: 'HR', dialCode: '+385', minDigits: 8, maxDigits: 9, example: '+385 91 234 5678' },
  { name: 'Cyprus', iso: 'CY', dialCode: '+357', minDigits: 8, maxDigits: 8, example: '+357 96 123456' },
  { name: 'Denmark', iso: 'DK', dialCode: '+45', minDigits: 8, maxDigits: 8, example: '+45 20 12 34 56' },
  { name: 'Finland', iso: 'FI', dialCode: '+358', minDigits: 7, maxDigits: 12, example: '+358 40 123 4567' },
  { name: 'Greece', iso: 'GR', dialCode: '+30', minDigits: 10, maxDigits: 10, example: '+30 691 234 5678' },
  { name: 'Ireland', iso: 'IE', dialCode: '+353', minDigits: 7, maxDigits: 9, example: '+353 85 123 4567' },
  { name: 'Luxembourg', iso: 'LU', dialCode: '+352', minDigits: 6, maxDigits: 11, example: '+352 621 123 456' },
  { name: 'Norway', iso: 'NO', dialCode: '+47', minDigits: 8, maxDigits: 8, example: '+47 412 34 567' },
  { name: 'Slovenia', iso: 'SI', dialCode: '+386', minDigits: 8, maxDigits: 8, example: '+386 31 234 567' },
  { name: 'Sweden', iso: 'SE', dialCode: '+46', minDigits: 7, maxDigits: 10, example: '+46 70 123 45 67' },
  { name: 'Switzerland', iso: 'CH', dialCode: '+41', minDigits: 9, maxDigits: 9, example: '+41 79 123 45 67' },
  { name: 'Israel', iso: 'IL', dialCode: '+972', minDigits: 8, maxDigits: 9, example: '+972 50 123 4567' },
  { name: 'United Arab Emirates', iso: 'AE', dialCode: '+971', minDigits: 8, maxDigits: 9, example: '+971 50 123 4567' },
  { name: 'Australia', iso: 'AU', dialCode: '+61', minDigits: 9, maxDigits: 9, example: '+61 412 345 678' },
  { name: 'New Zealand', iso: 'NZ', dialCode: '+64', minDigits: 8, maxDigits: 10, example: '+64 21 123 4567' },
  { name: 'Japan', iso: 'JP', dialCode: '+81', minDigits: 9, maxDigits: 10, example: '+81 90 1234 5678' },
];

export function formatNationalPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
}

export function countryFlag(iso: string): string {
  return iso
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function normalizeInternationalPhone(country: PhoneCountry, nationalValue: string): string {
  const dialDigits = phoneDigits(country.dialCode);
  const digits = phoneDigits(nationalValue);
  const withoutDialCode = digits.startsWith(dialDigits) ? digits.slice(dialDigits.length) : digits;
  return `${country.dialCode}${withoutDialCode}`;
}

export function isValidNationalPhone(country: PhoneCountry, nationalValue: string): boolean {
  const dialDigits = phoneDigits(country.dialCode);
  const digits = phoneDigits(nationalValue);
  const withoutDialCode = digits.startsWith(dialDigits) ? digits.slice(dialDigits.length) : digits;
  return withoutDialCode.length >= country.minDigits && withoutDialCode.length <= country.maxDigits;
}

export function parseInternationalPhone(value: string, fallbackCountry = PHONE_COUNTRIES[0]) {
  const normalized = value.trim();
  const digits = phoneDigits(normalized);
  const match = PHONE_COUNTRIES
    .slice()
    .sort((a, b) => phoneDigits(b.dialCode).length - phoneDigits(a.dialCode).length)
    .find((country) => digits.startsWith(phoneDigits(country.dialCode)));
  const country = match || fallbackCountry;
  const dialDigits = phoneDigits(country.dialCode);
  const nationalDigits = digits.startsWith(dialDigits) ? digits.slice(dialDigits.length) : digits;
  return {
    country,
    national: formatNationalPhone(nationalDigits),
    international: `${country.dialCode}${nationalDigits}`,
  };
}
