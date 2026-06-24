const fs = require('fs');
const path = require('path');
const https = require('https');
const supabase = require('../config/supabaseClient');
const schemeTransformer = require('../utils/schemeTransformer');

const DATA_URL = 'https://raw.githubusercontent.com/ace-ify/adhikaar/main/frontend/src/data/schemes.json';

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch: ${res.statusCode}`));
        return;
      }
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

const extractArray = (field) => {
  if (Array.isArray(field)) return field.filter(Boolean);
  if (typeof field === 'string') return field.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

const seedSchemes = async () => {
  try {
    console.log('Fetching schemes data from:', DATA_URL);
    const schemesData = await fetchJson(DATA_URL);
    
    console.log(`Fetched ${schemesData.length} schemes. Processing...`);

    const processedSchemes = [];

    for (const item of schemesData) {
      if (!item || !item.schemeName) continue;
      
      const slug = item.slug || schemeTransformer.transform({ name: item.schemeName })?.slug || item.schemeName.toLowerCase().replace(/\s+/g, '-');
      const name = item.schemeName;
      const description = item.briefDescription || '';
      const state = item.stateName || 'All India';
      const department = item.nodalMinistryName || item.nodalDepartmentName || 'Government';
      const level = item.level || (state === 'All India' ? 'Central' : 'State');
      
      // Fallbacks
      const tags = extractArray(item.tags);
      let category = 'Agriculture'; // Default
      if (item.categoryName) {
        category = item.categoryName;
      } else if (tags.includes('Finance') || tags.includes('Banking')) {
        category = 'Finance';
      } else if (tags.includes('Health')) {
        category = 'Health';
      }
      
      const crop_keywords = tags.filter(t => ['wheat', 'rice', 'cotton', 'groundnut', 'sugarcane', 'millet', 'pulses', 'oilseeds', 'crop'].some(c => t.toLowerCase().includes(c)));
      const beneficiary_keywords = tags.filter(t => ['farmer', 'kisan', 'women', 'sc', 'st', 'marginal', 'rural', 'student', 'youth'].some(b => t.toLowerCase().includes(b)));
      
      if (beneficiary_keywords.length === 0 && (name.toLowerCase().includes('kisan') || name.toLowerCase().includes('krishi') || name.toLowerCase().includes('farmer'))) {
        beneficiary_keywords.push('farmer');
      }

      processedSchemes.push({
        slug,
        name,
        description,
        state,
        department,
        category,
        level,
        tags,
        official_url: item.schemeUrl || item.referenceUrl || '',
        crop_keywords,
        beneficiary_keywords
      });
    }

    console.log(`Successfully processed ${processedSchemes.length} schemes. Starting Supabase Upsert...`);

    let successCount = 0;
    let errorCount = 0;

    // Upsert in batches of 50
    const BATCH_SIZE = 50;
    for (let i = 0; i < processedSchemes.length; i += BATCH_SIZE) {
      const batch = processedSchemes.slice(i, i + BATCH_SIZE);
      const { data, error } = await supabase
        .from('schemes')
        .upsert(batch, { onConflict: 'slug', ignoreDuplicates: false });

      if (error) {
        console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error.message);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        console.log(`Inserted batch ${i / BATCH_SIZE + 1}/${Math.ceil(processedSchemes.length / BATCH_SIZE)}`);
      }
    }

    console.log('\n--- Sync Summary ---');
    console.log(`Total Schemes Fetched: ${schemesData.length}`);
    console.log(`Successfully Upserted: ${successCount}`);
    console.log(`Failed to Upsert: ${errorCount}`);
    
    // Verify total count
    const { count, error: countError } = await supabase
      .from('schemes')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Failed to get total count from Supabase:', countError);
    } else {
      console.log(`Total schemes in database now: ${count}`);
    }

  } catch (error) {
    console.error('Data seeding failed:', error);
  }
};

seedSchemes();
