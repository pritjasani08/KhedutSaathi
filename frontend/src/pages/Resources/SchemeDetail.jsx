import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, BookmarkPlus, BookmarkCheck, CheckCircle2, FileText, Globe, MapPin, Tag } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

export default function SchemeDetails() {
  const { id: slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { data: scheme, isLoading, isError } = useQuery({
    queryKey: ['scheme', slug],
    queryFn: async () => {
      const res = await apiClient.get(`/schemes/${slug}`);
      if (res.data.success === false) throw new Error('Scheme not found');
      return res.data.data;
    }
  });

  // Verify if it's bookmarked
  useEffect(() => {
    if (user && scheme) {
      apiClient.get('/schemes/user/bookmarks', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(res => {
        if (res.data.success) {
          const found = res.data.data.find(b => b.slug === scheme.slug);
          setIsBookmarked(!!found);
        }
      }).catch(err => console.error(err));
    }
  }, [user, scheme]);

  const toggleBookmark = async () => {
    if (!user) {
      // Need to login
      navigate('/login');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      if (isBookmarked) {
        await apiClient.delete(`/schemes/bookmark/${scheme.slug}`, { headers });
        setIsBookmarked(false);
      } else {
        await apiClient.post('/schemes/bookmark', { scheme_slug: scheme.slug }, { headers });
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Error toggling bookmark', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center pt-32 bg-background">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !scheme) {
    return (
      <div className="min-h-screen flex flex-col items-center pt-32 bg-background">
        <h2 className="text-2xl font-bold text-heading">Scheme not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary font-medium flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          
          <button 
            onClick={toggleBookmark}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              isBookmarked 
                ? 'bg-primary/10 border-primary text-primary' 
                : 'bg-surface border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary'
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <BookmarkPlus className="w-5 h-5" />}
            <span className="text-sm font-medium">{isBookmarked ? 'Saved' : 'Save Scheme'}</span>
          </button>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-3xl p-8 md:p-10 shadow-card mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {scheme.level}
            </span>
            <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {scheme.state}
            </span>
            <span className="px-3 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {scheme.category}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-heading mb-6 max-w-4xl leading-tight">
            {scheme.name}
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed mb-8">
            {scheme.description}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            {scheme.official_url && (
              <a 
                href={scheme.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary py-3 px-8 text-base flex items-center gap-2"
              >
                Apply on Official Website
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <div className="text-sm text-slate-500 font-medium">
              Department: {scheme.department}
            </div>
          </div>
        </motion.div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface rounded-3xl p-8 shadow-card"
            >
              <h3 className="text-2xl font-bold text-heading mb-6 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                Target Beneficiaries & Eligibility
              </h3>
              
              {scheme.beneficiary_keywords && scheme.beneficiary_keywords.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scheme.beneficiary_keywords.map((kw, i) => (
                    <li key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                      <span className="text-slate-700 dark:text-slate-300 capitalize">{kw.replace(/-/g, ' ')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 italic">Information not currently available from the source.</p>
              )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-surface rounded-3xl p-8 shadow-card"
            >
              <h3 className="text-2xl font-bold text-heading mb-6 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                Benefits
              </h3>
              <p className="text-slate-500 italic">Information not currently available from the source.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-surface rounded-3xl p-8 shadow-card"
            >
              <h3 className="text-2xl font-bold text-heading mb-6 flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                Required Documents
              </h3>
              <p className="text-slate-500 italic">Information not currently available from the source.</p>
            </motion.div>

            {/* Applicable Crops */}
            {scheme.crop_keywords && scheme.crop_keywords.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-surface rounded-3xl p-8 shadow-card"
              >
                <h3 className="text-2xl font-bold text-heading mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary" />
                  Applicable Crops
                </h3>
                <div className="flex flex-wrap gap-2">
                  {scheme.crop_keywords.map((crop, i) => (
                    <span key={i} className="px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-medium capitalize">
                      {crop}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-surface rounded-3xl p-8 shadow-card"
            >
              <h3 className="text-2xl font-bold text-heading mb-6 flex items-center gap-3">
                <Globe className="w-6 h-6 text-primary" />
                Application Process
              </h3>
              {scheme.official_url ? (
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">Please visit the official government portal to apply or learn more about the application process.</p>
                  <a 
                    href={scheme.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary py-3 px-8 text-base flex items-center gap-2 inline-flex"
                  >
                    Go to Official Portal
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <p className="text-slate-500 italic">Information not currently available from the source.</p>
              )}
            </motion.div>

          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-primary/5 rounded-3xl p-8 border border-primary/10"
            >
              <h3 className="text-lg font-bold text-heading mb-4">Quick Facts</h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-500">State</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{scheme.state}</span>
                </li>
                <li className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-500">Category</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{scheme.category}</span>
                </li>
                <li className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-500">Department</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 text-right w-3/4">{scheme.department}</span>
                </li>
              </ul>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
