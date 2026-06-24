const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to q=agriculture...');
    await page.goto('https://www.myscheme.gov.in/search?q=agriculture', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    await page.waitForSelector('a[href^="/schemes/"]', { timeout: 15000 });
    
    const count = await page.evaluate(() => {
      return document.querySelectorAll('a[href^="/schemes/"]').length;
    });
    
    console.log('Found schemes:', count);
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await browser.close();
  }
})();
