export type PhoneCountry = {
  name: string;
  iso: string;
  dialCode: string;
  minDigits: number;
  maxDigits: number;
};

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { name: 'Ukraine', iso: 'UA', dialCode: '+380', minDigits: 9, maxDigits: 9 },
  { name: 'Romania', iso: 'RO', dialCode: '+40', minDigits: 9, maxDigits: 9 },
  { name: 'Poland', iso: 'PL', dialCode: '+48', minDigits: 9, maxDigits: 9 },
  { name: 'Germany', iso: 'DE', dialCode: '+49', minDigits: 7, maxDigits: 12 },
  { name: 'United States', iso: 'US', dialCode: '+1', minDigits: 10, maxDigits: 10 },
  { name: 'United Kingdom', iso: 'GB', dialCode: '+44', minDigits: 9, maxDigits: 10 },
  { name: 'France', iso: 'FR', dialCode: '+33', minDigits: 9, maxDigits: 9 },
  { name: 'Italy', iso: 'IT', dialCode: '+39', minDigits: 8, maxDigits: 11 },
  { name: 'Spain', iso: 'ES', dialCode: '+34', minDigits: 9, maxDigits: 9 },
  { name: 'Austria', iso: 'AT', dialCode: '+43', minDigits: 7, maxDigits: 13 },
  { name: 'Belgium', iso: 'BE', dialCode: '+32', minDigits: 8, maxDigits: 9 },
  { name: 'Bulgaria', iso: 'BG', dialCode: '+359', minDigits: 7, maxDigits: 9 },
  { name: 'Canada', iso: 'CA', dialCode: '+1', minDigits: 10, maxDigits: 10 },
  { name: 'Croatia', iso: 'HR', dialCode: '+385', minDigits: 8, maxDigits: 9 },
  { name: 'Cyprus', iso: 'CY', dialCode: '+357', minDigits: 8, maxDigits: 8 },
  { name: 'Czechia', iso: 'CZ', dialCode: '+420', minDigits: 9, maxDigits: 9 },
  { name: 'Denmark', iso: 'DK', dialCode: '+45', minDigits: 8, maxDigits: 8 },
  { name: 'Estonia', iso: 'EE', dialCode: '+372', minDigits: 7, maxDigits: 8 },
  { name: 'Finland', iso: 'FI', dialCode: '+358', minDigits: 7, maxDigits: 12 },
  { name: 'Greece', iso: 'GR', dialCode: '+30', minDigits: 10, maxDigits: 10 },
  { name: 'Hungary', iso: 'HU', dialCode: '+36', minDigits: 8, maxDigits: 9 },
  { name: 'Ireland', iso: 'IE', dialCode: '+353', minDigits: 7, maxDigits: 9 },
  { name: 'Latvia', iso: 'LV', dialCode: '+371', minDigits: 8, maxDigits: 8 },
  { name: 'Lithuania', iso: 'LT', dialCode: '+370', minDigits: 8, maxDigits: 8 },
  { name: 'Luxembourg', iso: 'LU', dialCode: '+352', minDigits: 6, maxDigits: 11 },
  { name: 'Moldova', iso: 'MD', dialCode: '+373', minDigits: 8, maxDigits: 8 },
  { name: 'Netherlands', iso: 'NL', dialCode: '+31', minDigits: 9, maxDigits: 9 },
  { name: 'Norway', iso: 'NO', dialCode: '+47', minDigits: 8, maxDigits: 8 },
  { name: 'Portugal', iso: 'PT', dialCode: '+351', minDigits: 9, maxDigits: 9 },
  { name: 'Slovakia', iso: 'SK', dialCode: '+421', minDigits: 9, maxDigits: 9 },
  { name: 'Slovenia', iso: 'SI', dialCode: '+386', minDigits: 8, maxDigits: 8 },
  { name: 'Sweden', iso: 'SE', dialCode: '+46', minDigits: 7, maxDigits: 10 },
  { name: 'Switzerland', iso: 'CH', dialCode: '+41', minDigits: 9, maxDigits: 9 },
  { name: 'Turkey', iso: 'TR', dialCode: '+90', minDigits: 10, maxDigits: 10 },
  { name: 'Georgia', iso: 'GE', dialCode: '+995', minDigits: 9, maxDigits: 9 },
  { name: 'Israel', iso: 'IL', dialCode: '+972', minDigits: 8, maxDigits: 9 },
  { name: 'United Arab Emirates', iso: 'AE', dialCode: '+971', minDigits: 8, maxDigits: 9 },
  { name: 'Australia', iso: 'AU', dialCode: '+61', minDigits: 9, maxDigits: 9 },
  { name: 'New Zealand', iso: 'NZ', dialCode: '+64', minDigits: 8, maxDigits: 10 },
  { name: 'Japan', iso: 'JP', dialCode: '+81', minDigits: 9, maxDigits: 10 },
];

export function formatNationalPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
}
