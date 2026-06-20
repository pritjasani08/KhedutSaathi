const { translate } = require('@vitalets/google-translate-api');

/**
 * Translate an array of strings.
 * Returns an array of objects: { original: '...', translated: '...' }
 */
async function translateArray(arr, lang) {
  if (!lang || lang === 'en') {
    return arr.map(item => ({ original: item, translated: item }));
  }
  
  try {
    const translatedArr = await Promise.all(
      arr.map(async (item) => {
        try {
          const res = await translate(item, { to: lang });
          return { original: item, translated: res.text };
        } catch (e) {
          console.error(`Error translating '${item}':`, e);
          return { original: item, translated: item };
        }
      })
    );
    return translatedArr;
  } catch (error) {
    console.error("Batch translation error:", error);
    return arr.map(item => ({ original: item, translated: item }));
  }
}

/**
 * Translate specific keys in an array of objects.
 */
async function translateObjects(arr, lang, keysToTranslate) {
  if (!lang || lang === 'en') return arr;
  
  try {
    const translatedArr = await Promise.all(
      arr.map(async (obj) => {
        const newObj = { ...obj };
        for (const key of keysToTranslate) {
          if (newObj[key]) {
            try {
              const res = await translate(newObj[key].toString(), { to: lang });
              newObj[key] = res.text;
            } catch (e) {
              // Ignore individual translation errors
            }
          }
        }
        return newObj;
      })
    );
    return translatedArr;
  } catch (error) {
    console.error("Batch object translation error:", error);
    return arr;
  }
}

module.exports = {
  translateArray,
  translateObjects
};
