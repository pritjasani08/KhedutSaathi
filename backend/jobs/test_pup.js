const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('https://www.myscheme.gov.in/search', { waitUntil: 'networkidle2' });
  
  await page.type('input[type="text"]', 'agriculture');
  await page.keyboard.press('Enter');
  
  await new Promise(r => setTimeout(r, 5000));
  
  const html = await page.evaluate(() => {
    // Find the link
    const link = document.querySelector('a[href^="/schemes/"]');
    if (link) {
      // Go up a few levels to find the card container
      return link.closest('div.border, li') ? link.closest('div.border, li').outerHTML : link.parentElement.parentElement.parentElement.outerHTML;
    }
    return "No cards found";
  });
  
  console.log(html);
  
  await browser.close();
})();
