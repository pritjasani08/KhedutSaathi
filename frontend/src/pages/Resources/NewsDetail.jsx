import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, ExternalLink, AlertCircle } from 'lucide-react';
import apiClient from '../../services/apiClient';

export default function NewsDetail() {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        const res = await apiClient.get('/resources/agri-news');
        if (res.data && res.data.success) {
          const found = res.data.data.find(n => n.id === id || n.id === parseInt(id));
          setNewsItem(found);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewsDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container-custom px-4 sm:px-6 lg:px-8 text-center pt-20">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-heading mb-4">News Article Not Found</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">The news article you are looking for does not exist or may have been removed.</p>
          <Link to="/resources" state={{ activeTab: 'news' }} className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Resources
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <Link to="/resources" state={{ activeTab: 'news' }} className="inline-flex items-center gap-2 text-primary hover:underline mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to News
        </Link>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface rounded-3xl p-6 sm:p-10 shadow-sm border border-subtle">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded-full">
              {newsItem.category}
            </span>
            <span className="text-sm text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> {newsItem.date}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-heading mb-6">{newsItem.title}</h1>
          
          {newsItem.image && (
            <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8 bg-slate-100 dark:bg-slate-800">
              <img src={newsItem.image} alt={newsItem.title} className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <p className="text-body text-lg leading-relaxed">{newsItem.excerpt}</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-subtle">
            <div className="text-sm text-slate-500 font-medium">
              Source: <span className="text-heading font-bold">{newsItem.source}</span>
            </div>
            {newsItem.link && (
              <a href={newsItem.link} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center gap-2">
                Read Full Article <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
