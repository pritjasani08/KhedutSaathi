const puppeteer = require('puppeteer');
const supabase = require('../config/supabaseClient');

const URLS = [
  { url: 'https://www.myscheme.gov.in/search/category/Agriculture,Rural%20%26%20Environment', name: 'Agriculture Category' },
  { url: 'https://www.myscheme.gov.in/search/ministry/Ministry%20of%20Agriculture%20and%20Farmers%20Welfare', name: 'Agri Ministry' },
  { url: 'https://www.myscheme.gov.in/search/ministry/Ministry%20of%20Fisheries,%20Animal%20Husbandry%20and%20Dairying', name: 'Fisheries Ministry' },
  { url: 'https://www.myscheme.gov.in/search/ministry/Ministry%20of%20Rural%20Development', name: 'Rural Ministry' },
  { url: 'https://www.myscheme.gov.in/search/state/Gujarat', name: 'Gujarat' },
  { url: 'https://www.myscheme.gov.in/search/state/Maharashtra', name: 'Maharashtra' },
  { url: 'https://www.myscheme.gov.in/search/state/Uttar%20Pradesh', name: 'Uttar Pradesh' },
  { url: 'https://www.myscheme.gov.in/search/state/Madhya%20Pradesh', name: 'Madhya Pradesh' },
  { url: 'https://www.myscheme.gov.in/search/state/Rajasthan', name: 'Rajasthan' },
  { url: 'https://www.myscheme.gov.in/search/state/Karnataka', name: 'Karnataka' },
  { url: 'https://www.myscheme.gov.in/search/state/Tamil%20Nadu', name: 'Tamil Nadu' },
  { url: 'https://www.myscheme.gov.in/search/state/Haryana', name: 'Haryana' },
  { url: 'https://www.myscheme.gov.in/search/state/Punjab', name: 'Punjab' },
  { url: 'https://www.myscheme.gov.in/search/state/Assam', name: 'Assam' },
  { url: 'https://www.myscheme.gov.in/search/state/Kerala', name: 'Kerala' },
  { url: 'https://www.myscheme.gov.in/search/state/Bihar', name: 'Bihar' },
  { url: 'https://www.myscheme.gov.in/search/state/Andhra%20Pradesh', name: 'Andhra Pradesh' },
  { url: 'https://www.myscheme.gov.in/search/state/Telangana', name: 'Telangana' },
  { url: 'https://www.myscheme.gov.in/search/state/Odisha', name: 'Odisha' },
  { url: 'https://www.myscheme.gov.in/search/state/West%20Bengal', name: 'West Bengal' },
  { url: 'https://www.myscheme.gov.in/search/state/Chhattisgarh', name: 'Chhattisgarh' },
  { url: 'https://www.myscheme.gov.in/search/state/Himachal%20Pradesh', name: 'Himachal Pradesh' },
  { url: 'https://www.myscheme.gov.in/search/state/Uttarakhand', name: 'Uttarakhand' },
  { url: 'https://www.myscheme.gov.in/search/state/Jharkhand', name: 'Jharkhand' }
];

const AGRI_TERMS = [
  'agriculture', 'farmer', 'irrigation', 'horticulture', 'animal husbandry', 
  'fisheries', 'crop', 'kisan', 'tractor', 'seed', 'fertilizer', 'dairy', 'soil', 'fpo', 'kcc', 'krishi', 'gramin', 'rural'
];

const REJECTED_TERMS = [
  'marriage', 'women welfare', 'pension', 'artist', 'hostel', 
  'scholarship', 'disability', 'social welfare', 'handicap', 'orphan', 'widow'
];

const scrapeSchemes = async () => {
  console.log('Launching Puppeteer for directory-based extraction...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const processedSchemes = [];
  const uniqueSlugs = new Set();

  for (const cat of URLS) {
    if (processedSchemes.length >= 150) {
      console.log('Reached target of 150+ schemes. Stopping scraping.');
      break;
    }
    
    console.log(`\nScraping directory: ${cat.name}`);
    const page = await browser.newPage();
    
    try {
      try {
        await page.goto(cat.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      } catch (e) {
        console.log(`Goto timeout for ${cat.name}, continuing to extract DOM...`);
      }
      await new Promise(r => setTimeout(r, 4000));
      
      // We will loop through up to 5 pages per directory
      for (let pageNum = 1; pageNum <= 5; pageNum++) {
        
        const schemesOnPage = await page.evaluate((categoryName) => {
          const results = [];
          const links = document.querySelectorAll('a[href^="/schemes/"]');
          
          links.forEach(link => {
            const href = link.getAttribute('href');
            const slug = href.replace('/schemes/', '');
            
            const nameEl = link.querySelector('span');
            const name = nameEl ? nameEl.innerText.trim() : link.innerText.trim();
            
            const parent = link.closest('.flex-col') || link.parentElement?.parentElement;
            if (!parent) return;
            
            let stateOrDept = 'Central';
            const deptEl = parent.querySelector('h2[role="button"]');
            if (deptEl) {
              stateOrDept = deptEl.innerText.trim();
            }
            
            let description = '';
            const descEl = parent.querySelector('span.line-clamp-2');
            if (descEl) {
              const ariaLabel = descEl.getAttribute('aria-label');
              if (ariaLabel && ariaLabel.startsWith('Brief description:')) {
                description = ariaLabel.replace('Brief description:', '').trim();
              } else {
                description = descEl.innerText.trim();
              }
            }
            
            results.push({ slug, name, description, stateOrDept, categoryName });
          });
          
          return results;
        }, cat.name);
        
        let validOnPage = 0;
        for (const item of schemesOnPage) {
          if (!item.slug || !item.name) continue;
          if (uniqueSlugs.has(item.slug)) continue;
          
          const combinedText = `${item.name.toLowerCase()} ${item.description.toLowerCase()} ${item.stateOrDept.toLowerCase()}`;
          
          // Strict rejection
          if (REJECTED_TERMS.some(term => combinedText.includes(term))) continue;
          
          // Must match at least one agri term if it's not from explicit Agri directories
          const isExplicitAgri = cat.name.includes('Agriculture') || cat.name.includes('Fisheries') || cat.name.includes('Rural');
          if (!isExplicitAgri && !AGRI_TERMS.some(term => combinedText.includes(term))) {
             continue; // Skip non-agri schemes from state directories
          }
          
          uniqueSlugs.add(item.slug);
          validOnPage++;
          
          const isState = item.stateOrDept !== 'Central' && !item.stateOrDept.toLowerCase().includes('ministry');
          const state = isState ? item.stateOrDept : 'All India';
          const department = !isState ? item.stateOrDept : 'State Government';
          const level = isState ? 'State' : 'Central';
          
          const beneficiary_keywords = [];
          if (combinedText.includes('farmer') || combinedText.includes('kisan') || combinedText.includes('krishi')) beneficiary_keywords.push('farmer');
          if (combinedText.includes('women') || combinedText.includes('mahila')) beneficiary_keywords.push('women');
          if (beneficiary_keywords.length === 0) beneficiary_keywords.push('farmer');
          
          const crop_keywords = [];
          if (combinedText.includes('wheat')) crop_keywords.push('wheat');
          if (combinedText.includes('rice') || combinedText.includes('paddy')) crop_keywords.push('rice');
          if (combinedText.includes('cotton')) crop_keywords.push('cotton');
          
          processedSchemes.push({
            slug: item.slug,
            name: item.name,
            description: item.description,
            state: state,
            department: department,
            category: 'Agriculture',
            level: level,
            tags: ['Agriculture', level],
            official_url: `https://www.myscheme.gov.in/schemes/${item.slug}`,
            crop_keywords: crop_keywords,
            beneficiary_keywords: beneficiary_keywords
          });
        }
        
        console.log(`Page ${pageNum}: Scraped ${schemesOnPage.length} raw, ${validOnPage} passed agri filters. Total unique agri schemes so far: ${processedSchemes.length}`);
        
        // Try to click "Next"
        const hasNext = await page.evaluate(() => {
          // Look for an SVG path that looks like a right arrow inside a button, or a button with aria-label="Next page"
          const buttons = Array.from(document.querySelectorAll('button'));
          for (const btn of buttons) {
            if (btn.disabled) continue;
            const aria = btn.getAttribute('aria-label');
            if (aria && aria.toLowerCase().includes('next')) {
              btn.click();
              return true;
            }
          }
          // Some sites use text ">"
          const lis = Array.from(document.querySelectorAll('li'));
          for (const li of lis) {
            if (li.innerText.includes('Next') || li.innerText === '>') {
              const clickable = li.querySelector('button') || li.querySelector('a');
              if (clickable && !clickable.disabled) {
                clickable.click();
                return true;
              }
            }
          }
          return false;
        });
        
        if (hasNext) {
          await new Promise(r => setTimeout(r, 3000)); // Wait for page data to update
        } else {
          break; // No next button, move to next directory
        }
      }
      
    } catch (err) {
      console.error(`Error scraping ${cat.url}:`, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  
  console.log(`\nSuccessfully compiled ${processedSchemes.length} strict agriculture-relevant schemes.`);
  
  if (processedSchemes.length === 0) {
    console.error('No schemes matched the agriculture filters. Aborting upsert.');
    return;
  }

  console.log('Clearing old mixed dataset from Supabase...');
  const { error: deleteError } = await supabase.from('schemes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error('Failed to clear old schemes:', deleteError);
  }

  let successCount = 0;
  let errorCount = 0;
  const BATCH_SIZE = 50;
  for (let i = 0; i < processedSchemes.length; i += BATCH_SIZE) {
    const batch = processedSchemes.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('schemes').upsert(batch, { onConflict: 'slug', ignoreDuplicates: false });
    if (error) {
      console.error(`Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message);
      errorCount += batch.length;
    } else {
      successCount += batch.length;
      console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(processedSchemes.length / BATCH_SIZE)}`);
    }
  }

  console.log('\n--- Sync Summary ---');
  console.log(`Total Scraped (Filtered): ${processedSchemes.length}`);
  console.log(`Successfully Upserted: ${successCount}`);
  console.log(`Failed to Upsert: ${errorCount}`);
  
  const { count, error: countError } = await supabase.from('schemes').select('*', { count: 'exact', head: true });
  if (!countError) {
    console.log(`Total schemes in database now: ${count}`);
  }
};

scrapeSchemes();
