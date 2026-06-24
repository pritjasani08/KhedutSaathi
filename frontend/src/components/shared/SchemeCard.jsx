import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Calendar, ArrowRight, ExternalLink, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBookmarks, useAddBookmark, useRemoveBookmark } from '../../hooks/useBookmarks';
import { useAuth } from '../../context/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
};

export default function SchemeCard({ id, title, description, eligibility = [], deadline, applyLink, slug, index = 0 }) {
  const { user } = useAuth();
  const { data: bookmarks } = useBookmarks();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();

  const isBookmarked = bookmarks?.some(b => b.slug === slug);

  const toggleBookmark = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to save schemes.");
      return;
    }
    if (isBookmarked) {
      removeBookmark.mutate(slug);
    } else {
      addBookmark.mutate(slug);
    }
  };

  return (
    <motion.div variants={fadeUp} custom={index} className="glass-card p-6 card-hover group flex flex-col h-full relative">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 text-primary rounded-xl flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2">
          {deadline && (
            <span className="px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Ends: {deadline}
            </span>
          )}
          {id && (
            <button 
              onClick={toggleBookmark}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked 
                  ? 'bg-primary-100 text-primary dark:bg-primary-900/50' 
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
              }`}
              title={isBookmarked ? "Remove Bookmark" : "Save Scheme"}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>
      
      <h3 className="font-display text-xl font-bold text-body mb-3 hover:text-primary transition-colors">
        {slug ? (
          <Link to={`/resources/schemes/${slug}`}>{title}</Link>
        ) : (
          title
        )}
      </h3>
      
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 flex-1">
        {description}
      </p>
      
      {eligibility && eligibility.length > 0 && (
        <div className="mb-6 space-y-2">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Eligibility</p>
          <ul className="space-y-1">
            {eligibility.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="flex gap-2 mt-auto pt-4">
        {slug && (
          <Link 
            to={`/resources/schemes/${slug}`}
            className="flex-1 btn-secondary py-2 text-sm flex items-center justify-center gap-2"
          >
            Details
          </Link>
        )}
        {applyLink && (
          <a 
            href={applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-2"
          >
            Apply <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </motion.div>
  );
}
