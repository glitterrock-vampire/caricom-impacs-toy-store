// src/utils/location-utils.ts
const i18nCountries = require('i18n-iso-countries');

// CARICOM member countries with common name variations
const CARICOM_MEMBERS = {
  // Official names
  'Antigua and Barbuda': 'AG',
  'Bahamas': 'BS',
  'Barbados': 'BB',
  'Belize': 'BZ',
  'Dominica': 'DM',
  'Grenada': 'GD',
  'Guyana': 'GY',
  'Haiti': 'HT',
  'Jamaica': 'JM',
  'Montserrat': 'MS',
  'Saint Kitts and Nevis': 'KN',
  'Saint Lucia': 'LC',
  'Saint Vincent and the Grenadines': 'VC',
  'Suriname': 'SR',
  'Trinidad and Tobago': 'TT',
  
  // Common variations
  'Antigua & Barbuda': 'AG',
  'St. Kitts and Nevis': 'KN',
  'St. Lucia': 'LC',
  'St. Vincent and the Grenadines': 'VC',
  'St. Vincent & the Grenadines': 'VC',
  'Trinidad & Tobago': 'TT',
  'The Bahamas': 'BS'
} as const;

// CARICOM associate members
const ASSOCIATE_MEMBERS = {
  'Anguilla': 'AI',
  'Bermuda': 'BM',
  'British Virgin Islands': 'VG',
  'Cayman Islands': 'KY',
  'Turks and Caicos Islands': 'TC',
  'Turks & Caicos': 'TC'
} as const;

// Initialize countries
i18nCountries.registerLocale(require('i18n-iso-countries/langs/en.json'));

export function getCountryCode(countryName: string | null): string | null {
  if (!countryName) return null;
  
  // First check CARICOM members
  if (countryName in CARICOM_MEMBERS) {
    return CARICOM_MEMBERS[countryName as keyof typeof CARICOM_MEMBERS];
  }
  
  // Check associate members
  if (countryName in ASSOCIATE_MEMBERS) {
    return ASSOCIATE_MEMBERS[countryName as keyof typeof ASSOCIATE_MEMBERS];
  }
  
  // Try to get by standard country name
  const code = i18nCountries.getAlpha2Code(countryName, 'en');
  if (code) {
    // Verify the code is for a CARICOM country
    const countryName = i18nCountries.getName(code, 'en');
    if (countryName && countryName in CARICOM_MEMBERS) {
      return code;
    }
  }

  // Try common alternative names and partial matches
  const normalized = countryName.toLowerCase().trim();
  for (const [name, code] of Object.entries(CARICOM_MEMBERS)) {
    if (name.toLowerCase().includes(normalized) || 
        normalized.includes(name.toLowerCase())) {
      return code;
    }
  }

  // Check for common misspellings
  const misspellings: Record<string, string> = {
    'antigua': 'AG',
    'barbuda': 'AG',
    'bahamas': 'BS',
    'barbados': 'BB',
    'belize': 'BZ',
    'dominica': 'DM',
    'grenada': 'GD',
    'guyana': 'GY',
    'haiti': 'HT',
    'jamaica': 'JM',
    'montserrat': 'MS',
    'st kitts': 'KN',
    'st lucia': 'LC',
    'st vincent': 'VC',
    'surinam': 'SR',
    'suriname': 'SR',
    'trinidad': 'TT',
    'tobago': 'TT'
  };

  return misspellings[normalized] || null;
}

// Helper function to check if a country is a CARICOM member
export function isCaricomMember(countryName: string | null): boolean {
  if (!countryName) return false;
  return getCountryCode(countryName) !== null;
}

// Get all CARICOM country codes
export function getCaricomCountryCodes(): string[] {
  return Array.from(new Set(Object.values(CARICOM_MEMBERS)));
}

// Get all CARICOM country names
export function getCaricomCountryNames(): string[] {
  return Object.keys(CARICOM_MEMBERS).filter(
    (name, index, self) => self.indexOf(name) === index
  );
}