import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Landmark, AlertCircle, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

export default function SchemeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isEligible, setIsEligible] = useState(null);

  useEffect(() => {
    const fetchSchemeDetail = async () => {
      try {
        const res = await apiClient.get('/resources/schemes');
        if (res.data && res.data.success) {
          const found = res.data.data.find(s => s.id === id || s.id === parseInt(id));
          setScheme(found);
        }
      } catch (err) {
        console.error('Error fetching scheme:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemeDetail();
  }, [id]);

  useEffect(() => {
    if (user && user.user_type === 'farmer') {
      const token = localStorage.getItem('token');
      apiClient.get('/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.data && res.data.profile) {
          setProfile(res.data.profile);
        }
      })
      .catch(err => console.error("Error fetching profile", err));
    }
  }, [user]);

  useEffect(() => {
    if (scheme && profile) {
      let eligible = true;
      const { criteria } = scheme;
      
      if (criteria) {
        // State check
        if (criteria.state && !criteria.state.includes('All India') && profile.state) {
          if (!criteria.state.includes(profile.state)) {
            eligible = false;
          }
        }
        
        // Age check
        if (profile.age) {
          if (criteria.minAge && profile.age < criteria.minAge) eligible = false;
          if (criteria.maxAge && profile.age > criteria.maxAge) eligible = false;
        }
        
        // Gender check
        if (criteria.gender && !criteria.gender.includes('All') && profile.gender) {
          if (!criteria.gender.includes(profile.gender)) {
            eligible = false;
          }
        }
        
        // Land Size check
        if (profile.farm_size) {
          const farmSize = parseFloat(profile.farm_size);
          if (criteria.minLandSize && farmSize < criteria.minLandSize) eligible = false;
          if (criteria.maxLandSize && farmSize > criteria.maxLandSize) eligible = false;
        }
        
        // Category check
        if (criteria.farmerCategory && !criteria.farmerCategory.includes('All') && profile.farmer_category) {
          if (!criteria.farmerCategory.includes(profile.farmer_category)) {
            eligible = false;
          }
        }
        
        // Primary Crop check
        if (criteria.eligibleCrops && !criteria.eligibleCrops.includes('All') && profile.primary_crop) {
          if (!criteria.eligibleCrops.includes(profile.primary_crop)) {
            eligible = false;
          }
        }

        // Irrigation check
        if (criteria.eligibleIrrigation && !criteria.eligibleIrrigation.includes('All') && profile.irrigation_type) {
          if (!criteria.eligibleIrrigation.includes(profile.irrigation_type)) {
            eligible = false;
          }
        }
      }
      
      setIsEligible(eligible);
    }
  }, [scheme, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container-custom px-4 sm:px-6 lg:px-8 text-center pt-20">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-heading mb-4">Scheme Not Found</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">The government scheme you are looking for does not exist or may have been removed.</p>
          <Link to="/resources" state={{ activeTab: 'schemes' }} className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Resources
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <Link to="/resources" state={{ activeTab: 'schemes' }} className="inline-flex items-center gap-2 text-primary hover:underline mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Schemes
        </Link>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface rounded-3xl p-6 sm:p-10 shadow-sm border border-subtle">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Landmark className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                {scheme.category}
              </span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-heading mb-4">{scheme.title}</h1>
          <p className="text-xl text-primary font-semibold mb-8">{scheme.benefit}</p>
          
          <div className="grid sm:grid-cols-3 gap-6 mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <div>
              <p className="text-sm text-slate-500 mb-1">Deadline</p>
              <p className="font-semibold text-heading">{scheme.deadline}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Status</p>
              <p className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Active
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Eligibility</p>
              {isEligible === true && (
                <p className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Eligible
                </p>
              )}
              {isEligible === false && (
                <p className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Not Eligible
                </p>
              )}
              {isEligible === null && (
                <p className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <HelpCircle className="w-4 h-4" /> Login to Check
                </p>
              )}
            </div>
          </div>
          
          {scheme.description && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-heading mb-4">About the Scheme</h3>
              <p className="text-body leading-relaxed">{scheme.description}</p>
            </div>
          )}
          
          {scheme.eligibility && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-heading mb-4">Eligibility Criteria</h3>
              <ul className="list-disc pl-5 space-y-2 text-body">
                {Array.isArray(scheme.eligibility) ? scheme.eligibility.map((item, i) => (
                  <li key={i}>{item}</li>
                )) : <li>{scheme.eligibility}</li>}
              </ul>
            </div>
          )}
          
          {scheme.applyLink && (
            <div className="pt-6 border-t border-subtle">
              <a href={scheme.applyLink} target="_blank" rel="noopener noreferrer" className="btn-primary w-full sm:w-auto text-center block">
                Apply Now / Official Website
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
