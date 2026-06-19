const Parser = require('rss-parser');
const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');

const parser = new Parser();
const cache = new NodeCache({ stdTTL: 900 }); // 15 minutes TTL

// Helper to determine category based on keywords
function determineCategory(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  
  if (text.includes('market') || text.includes('price') || text.includes('export') || text.includes('msp') || text.includes('trade')) {
    return 'Market';
  }
  if (text.includes('weather') || text.includes('monsoon') || text.includes('rain') || text.includes('climate') || text.includes('imd')) {
    return 'Weather';
  }
  if (text.includes('government') || text.includes('subsidy') || text.includes('scheme') || text.includes('policy') || text.includes('minister') || text.includes('cabinet')) {
    return 'Government';
  }
  if (text.includes('technology') || text.includes('drone') || text.includes('app') || text.includes('ai ') || text.includes('digital') || text.includes('startup')) {
    return 'Technology';
  }
  if (text.includes('disease') || text.includes('pest') || text.includes('armyworm') || text.includes('fertilizer') || text.includes('soil') || text.includes('health') || text.includes('crop')) {
    return 'Crop Health';
  }
  
  return 'Agriculture'; // Default fallback
}

// Extract image from content or enclosure if available
function extractImage(item) {
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  
  // Try extracting from content string if it contains an img tag
  const content = item.content || item['content:encoded'] || '';
  const imgRegex = /<img[^>]+src="?([^"\s]+)"?\s*\/>/g;
  const match = imgRegex.exec(content);
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}

const getNews = async (req, res) => {
  try {
    const cachedNews = cache.get('agri_news');
    if (cachedNews) {
      return res.status(200).json({ success: true, data: cachedNews, cached: true });
    }

    // Google News RSS Feed tailored for Agriculture in India
    const feedUrl = 'https://news.google.com/rss/search?q=agriculture+OR+farming+OR+crop+OR+irrigation+IN&hl=en-IN&gl=IN&ceid=IN:en';
    
    const feed = await parser.parseURL(feedUrl);
    
    const formattedNews = feed.items.slice(0, 20).map((item, index) => {
      // Create a short excerpt from content snippet or title
      let excerpt = item.contentSnippet || item.content || item.title;
      if (excerpt.length > 150) {
        excerpt = excerpt.substring(0, 150) + '...';
      }

      // Google News puts source in source tag or within title " - SourceName"
      let source = item.source || 'Agri News';
      let title = item.title;
      
      if (title.includes(' - ')) {
        const parts = title.split(' - ');
        source = parts.pop();
        title = parts.join(' - ');
      }

      return {
        id: `news-${index}-${Date.now()}`,
        title: title,
        date: new Date(item.pubDate || item.isoDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }),
        source: source,
        category: determineCategory(title, excerpt),
        excerpt: excerpt,
        link: item.link,
        image: extractImage(item) // May be null, frontend should handle fallback
      };
    });

    // Save to cache
    cache.set('agri_news', formattedNews);

    res.status(200).json({ success: true, data: formattedNews, cached: false });
  } catch (error) {
    console.error('Error fetching RSS news:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch agricultural news.' });
  }
};

const getSchemes = (req, res) => {
  try {
    const filePath = path.join(__dirname, '../data/schemes.json');
    const fileData = fs.readFileSync(filePath, 'utf8');
    const schemes = JSON.parse(fileData);
    
    res.status(200).json({ success: true, data: schemes });
  } catch (error) {
    console.error('Error reading schemes file:', error);
    res.status(500).json({ success: false, message: 'Failed to load government schemes.' });
  }
};

module.exports = {
  getNews,
  getSchemes
};
