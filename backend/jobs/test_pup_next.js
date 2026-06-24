const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('https://www.myscheme.gov.in/search', { waitUntil: 'networkidle2' });
  
  let totalFound = 0;
  
  for (let i = 0; i < 5; i++) {
    const html = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href^="/schemes/"]');
      return links.length;
    });
    console.log(`Page ${i + 1}: Found ${html} schemes`);
    totalFound += html;
    
    // Try to find and click Next
    const nextClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find(b => b.innerText.includes('Next') || b.innerText.includes('>') || b.getAttribute('aria-label') === 'Next page');
      if (nextBtn && !nextBtn.disabled) {
        nextBtn.click();
        return true;
      }
      
      // Also try pagination SVG arrows
      const svgs = document.querySelectorAll('svg');
      for (const svg of svgs) {
        if (svg.parentElement.tagName === 'BUTTON') {
          // just guess it's a right arrow
        }
      }
      
      // Some paginations are list items
      const lis = Array.from(document.querySelectorAll('li'));
      const nextLi = lis.find(li => li.innerText.includes('Next') || li.innerText.includes('>'));
      if (nextLi) {
        const a = nextLi.querySelector('a') || nextLi.querySelector('button');
        if (a) {
          a.click();
          return true;
        }
      }
      
      return false;
    });
    
    console.log('Clicked next:', nextClicked);
    if (!nextClicked) break;
    
    await new Promise(r => setTimeout(r, 4000));
  }
  
  console.log('Total across pages:', totalFound);
  await browser.close();
})();
