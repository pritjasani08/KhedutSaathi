/**
 * Utility to map and normalize farmer profile crop names to official market database commodity names.
 */

// Canonical mappings for exact resolutions and aliases
const ALIAS_MAP = {
  // Cotton variants
  'cottonseed': 'Cotton',
  'cotton': 'Cotton',
  'kapas': 'Cotton',
  
  // Groundnut variants
  'groundnut': 'Groundnut',
  'peanut': 'Groundnut',
  'mungfali': 'Groundnut',
  
  // Rice/Paddy variants
  'rice': 'Rice',
  'paddy': 'Rice',
  'dangar': 'Rice',
  
  // Wheat variants
  'wheat': 'Wheat',
  'gehu': 'Wheat',
  
  // Additional common crops
  'maize': 'Maize',
  'corn': 'Maize',
  'mustard': 'Mustard',
  'soybean': 'Soyabean',
  'soyabean': 'Soyabean',
  'bajra': 'Bajra',
  'pearl millet': 'Bajra',
  'chana': 'Gram',
  'gram': 'Gram',
  'chickpea': 'Gram',
  'tur': 'Arhar (Tur/Red Gram)',
  'arhar': 'Arhar (Tur/Red Gram)',
  'pigeon pea': 'Arhar (Tur/Red Gram)'
};

/**
 * Normalizes a raw crop name from a user profile into the official mandi database commodity name.
 * @param {string} rawCropName - The crop name from the profile (e.g. "cottonseed")
 * @returns {string} The normalized commodity name, or the original name properly capitalized if no mapping exists
 */
export const normalizeCommodity = (rawCropName) => {
  if (!rawCropName || typeof rawCropName !== 'string') return '';
  
  const normalizedInput = rawCropName.toLowerCase().trim();
  
  // Return alias if exists
  if (ALIAS_MAP[normalizedInput]) {
    return ALIAS_MAP[normalizedInput];
  }
  
  // Fallback: capitalize each word
  return normalizedInput
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
