import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Landmark, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import SchemeCard from '../shared/SchemeCard';
import SkeletonCard from '../shared/SkeletonCard';

export default function RecommendedSchemesWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: schemes, isLoading, isError } = useQuery({
    queryKey: ['recommended-schemes', user?.id],
    queryFn: async () => {
      // It passes state, district, crop implicitly via backend if logged in
      const res = await apiClient.get('/schemes/recommendations', { params: { limit: 3 } });
      if (res.data.success === false) throw new Error('Failed to fetch recommendations');
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-3xl p-6 shadow-card"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-heading">Recommended Schemes</h2>
            <p className="text-sm text-slate-500">Based on your crop and state</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/resources', { state: { activeTab: 'schemes' } })}
          className="text-sm font-medium text-primary hover:text-primary-600 transition-colors flex items-center gap-1"
        >
          View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <SkeletonCard index={1} />
            <SkeletonCard index={2} />
            <SkeletonCard index={3} />
          </>
        ) : isError ? (
          <div className="col-span-full text-center py-6 text-slate-500">
            Failed to load recommendations
          </div>
        ) : schemes && schemes.length > 0 ? (
          schemes.map((scheme, idx) => (
            <SchemeCard 
              key={scheme.id}
              id={scheme.id}
              title={scheme.name}
              description={scheme.description}
              slug={scheme.slug}
              eligibility={scheme.beneficiary_keywords}
              applyLink={scheme.official_url}
              index={idx} 
            />
          ))
        ) : (
          <div className="col-span-full text-center py-6 text-slate-500">
            No specific recommendations right now. Check all schemes.
          </div>
        )}
      </div>
    </motion.div>
  );
}
