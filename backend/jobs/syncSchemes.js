const mySchemeService = require('../services/mySchemeService');
const schemeTransformer = require('../utils/schemeTransformer');
const supabase = require('../config/supabaseClient');

const KEYWORDS = [
  'farmer', 'agriculture', 'crop', 'irrigation', 'fertilizer', 
  'insurance', 'livestock', 'fisheries', 'horticulture', 'organic', 
  'soil', 'kisan', 'rural', 'loan', 'subsidy'
];

const logInfo = (message, meta = {}) => {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: 'INFO', message, ...meta }));
};

const logError = (message, meta = {}) => {
  console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: 'ERROR', message, ...meta }));
};

/**
 * Main sync job runner
 */
async function syncSchemes() {
  logInfo('Starting MyScheme sync job');
  let totalProcessed = 0;
  let totalUpserted = 0;
  let totalErrors = 0;

  for (const keyword of KEYWORDS) {
    let from = 0;
    const size = 20;
    let hasMore = true;

    logInfo(`Syncing keyword: ${keyword}`);

    while (hasMore) {
      try {
        const response = await mySchemeService.searchSchemes(keyword, from, size);
        const data = response.data || response.hits || [];
        // if response shape is hits.hits or similar, adjust. MyScheme usually wraps in generic response.
        const items = data.hits ? data.hits : Array.isArray(data) ? data : (response.items || []);

        if (items.length === 0) {
          hasMore = false;
          break;
        }

        const validSchemes = [];
        for (const item of items) {
          totalProcessed++;
          try {
            const transformed = schemeTransformer.transform(item);
            if (transformed) {
              transformed.last_synced = new Date().toISOString();
              validSchemes.push(transformed);
            }
          } catch (transformError) {
            logError(`Error transforming scheme`, { item, error: transformError.message });
            totalErrors++;
          }
        }

        if (validSchemes.length > 0) {
          // Upsert using onConflict slug
          const { data: upsertData, error: upsertError } = await supabase
            .from('schemes')
            .upsert(validSchemes, { onConflict: 'slug', ignoreDuplicates: false })
            .select('slug');

          if (upsertError) {
            logError('Supabase upsert failed', { error: upsertError });
            totalErrors++;
          } else {
            totalUpserted += upsertData.length;
            logInfo(`Upserted ${upsertData.length} schemes for keyword ${keyword}`);
          }
        }

        // Delay to avoid hitting rate limits too fast
        await new Promise(r => setTimeout(r, 1000));

        from += size;
        
        // Safety break if it's endlessly looping for some reason (e.g. max 200 items per keyword)
        if (from > 200) {
          hasMore = false;
        }
      } catch (error) {
        logError(`Failed to fetch schemes for keyword: ${keyword} at offset ${from}`, { error: error.message });
        hasMore = false; // Move to next keyword on persistent error
      }
    }
  }

  logInfo('MyScheme sync job completed', {
    totalProcessed,
    totalUpserted,
    totalErrors
  });
  
  return {
    success: true,
    totalProcessed,
    totalUpserted,
    totalErrors
  };
}

module.exports = syncSchemes;

// If run directly from CLI
if (require.main === module) {
  syncSchemes().then(() => {
    logInfo('CLI sync execution finished');
    process.exit(0);
  }).catch((err) => {
    logError('CLI sync execution failed', { error: err.message });
    process.exit(1);
  });
}
