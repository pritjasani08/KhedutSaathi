import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
};

// Simple string hasher for deterministic fallback selection
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Map categories to their specific fallback images using title hash for variety
const getFallbackImage = (category, title) => {
  const normalizedCat = category?.toLowerCase() || '';
  const hash = hashString(title || '');
  
  if (normalizedCat.includes('agriculture')) {
    return `/images/news-fallbacks/agriculture-${(hash % 5) + 1}.jpg`;
  }
  if (normalizedCat.includes('weather')) {
    return `/images/news-fallbacks/weather-${(hash % 4) + 1}.jpg`;
  }
  if (normalizedCat.includes('market')) {
    return `/images/news-fallbacks/market-${(hash % 4) + 1}.jpg`;
  }
  if (normalizedCat.includes('government')) {
    return `/images/news-fallbacks/government-${(hash % 3) + 1}.jpg`;
  }
  if (normalizedCat.includes('health') || normalizedCat.includes('disease') || normalizedCat.includes('pest')) {
    return `/images/news-fallbacks/crop-health-${(hash % 4) + 1}.jpg`;
  }
  
  // Generic fallback
  return '/images/news-fallbacks/default.jpg';
};

export default function NewsCard({ title, date, category, excerpt, image, source, link, index = 0 }) {
  const fallbackImg = getFallbackImage(category, title);
  const [imgSrc, setImgSrc] = useState(image || fallbackImg);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(image || fallbackImg);
    setHasError(false);
  }, [image, fallbackImg]);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallbackImg);
      setHasError(true);
    }
  };

  return (
    <motion.div variants={fadeUp} custom={index} className="glass-card overflow-hidden card-hover group flex flex-col h-full">
      <div className="relative h-48 overflow-hidden bg-slate-200 dark:bg-slate-800">
        <img 
          src={imgSrc} 
          alt={title} 
          onError={handleError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 dark:brightness-90" 
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-surface/90 dark:bg-slate-800/90 backdrop-blur-sm text-primary text-xs font-bold rounded-full shadow-sm">
            {category}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-3">
          <Calendar className="w-4 h-4" />
          <span>{date}</span>
          {source && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span className="font-medium truncate">{source}</span>
            </>
          )}
        </div>
        
        <h3 className="font-display text-xl font-bold text-body mb-3 line-clamp-2">
          {title}
        </h3>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 flex-1 line-clamp-3">
          {excerpt}
        </p>
        
        <a 
          href={link || "#"}
          target={link ? "_blank" : "_self"}
          rel="noopener noreferrer"
          className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-300 mt-auto"
        >
          Read More
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </a>
      </div>
    </motion.div>
  );
}
