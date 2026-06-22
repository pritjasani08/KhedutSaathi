const CACHE = new Map();

/**
 * Translates an array of strings to the target language.
 * Uses Google Translate public API.
 */
export const translateArray = async (texts, targetLang) => {
  if (!targetLang || targetLang === 'en' || !texts || texts.length === 0) return texts;

  const cacheKey = `${targetLang}-${JSON.stringify(texts)}`;
  if (CACHE.has(cacheKey)) return CACHE.get(cacheKey);

  try {
    // Join texts with pipe to translate as a single block
    const textStr = texts.join(' | ');
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(textStr)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data[0]) {
      // Reconstruct the translated string
      let translatedStr = data[0].map(s => s[0]).join('');
      // Split back by pipe
      let translatedArray = translatedStr.split(' | ').map(s => s.trim());
      
      // Clean up any empty strings that might have been introduced
      translatedArray = translatedArray.filter(Boolean);
      
      // If the lengths match, we confidently cache and return
      if (translatedArray.length === texts.length) {
        CACHE.set(cacheKey, translatedArray);
        return translatedArray;
      }
    }
  } catch (error) {
    console.error('Dynamic translation error:', error);
  }
  
  return texts; // fallback to original texts
};
