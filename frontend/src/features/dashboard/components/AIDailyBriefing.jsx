import React, { useState } from 'react';
import { 
  CloudRain, TrendingDown, TrendingUp, Droplets, Info, ArrowRight, Zap, Target, 
  FileText, CheckCircle2, ShieldAlert, ThumbsUp, ThumbsDown, Clock, AlertCircle, 
  Landmark, BarChart2, Check, Sparkles
} from 'lucide-react';
import { useMarketIntelligence } from '../hooks/useMarketIntelligence';
import { useAIBriefing } from '../hooks/useAIBriefing';
import { Link } from 'react-router-dom';
import SectionLoader from '../../../components/shared/SectionLoader';

const getRelativeTime = (timestamp) => {
  if (!timestamp || timestamp === 'Live') return 'just now';
  if (typeof timestamp === 'string' && timestamp.includes('ago')) return timestamp;
  try {
    const diffMs = new Date().getTime() - new Date(timestamp).getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    return `${Math.round(diffMins / 60)} hours ago`;
  } catch(e) {
    return 'recently';
  }
};

const mapDecisionMetadata = (type) => {
  switch (type?.toUpperCase()) {
    case 'WEATHER':
      return { icon: CloudRain, link: '/smart-irrigation', actionText: 'View Weather', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    case 'MARKET':
      return { icon: TrendingUp, link: '/market-hub/live-prices', actionText: 'View Markets', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' };
    case 'DISEASE':
      return { icon: ShieldAlert, link: '/crop-health', actionText: 'View Health', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' };
    case 'SCHEME':
      return { icon: Landmark, link: '/resources', actionText: 'Check Schemes', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' };
    case 'YIELD':
      return { icon: BarChart2, link: '/crop-planner', actionText: 'View Planner', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' };
    default:
      return { icon: Sparkles, link: '/khedut-ai', actionText: 'View Details', color: 'text-primary', bg: 'bg-primary/10' };
  }
};

const SourcePill = ({ label, icon: Icon }) => (
  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300">
    {Icon && <Icon className="w-3.5 h-3.5 text-slate-500" />}
    {label}
  </div>
);

export default function AIDailyBriefing({ profile, weather, schemes }) {
  const { data: marketData, isLoading: isMarketLoading } = useMarketIntelligence(profile);
  const { data: aiBriefing, isLoading: isAILoading, isError: isAIError } = useAIBriefing();
  const [feedbackState, setFeedbackState] = useState(null);
  
  if (isAILoading || isMarketLoading || !weather) {
     return (
       <div className="glass-card mb-8 overflow-hidden shadow-sm border border-subtle">
         <SectionLoader message="Analyzing Farm Context..." minHeight="min-h-[250px]" />
       </div>
     );
  }

  let topDecision;
  let isFallback = false;
  let freshnessStr = 'just now';

  if (!isAIError && aiBriefing && aiBriefing.topDecision) {
    const aiDec = aiBriefing.topDecision;
    const meta = mapDecisionMetadata(aiDec.type);
    
    topDecision = {
      id: aiDec.id,
      title: aiDec.title,
      priority: aiDec.priority,
      confidence: aiDec.confidence,
      why: aiDec.reason || [],
      impact: aiDec.expectedImpact ? [aiDec.expectedImpact] : [],
      actionText: meta.actionText,
      link: meta.link,
      icon: meta.icon,
      color: meta.color,
      bg: meta.bg,
      sources: aiDec.sources || [],
      personalization_factors: aiDec.personalization_factors || []
    };
    freshnessStr = getRelativeTime(aiBriefing.generatedAt);
  } 
  else {
    isFallback = true;
    const recommendations = [];

    // Fallback deterministic logic...
    if (weather.rainProbability > 60) {
      recommendations.push({
        type: 'WEATHER',
        title: 'Delay Irrigation',
        priority: 'High',
        confidence: 90,
        why: [`Rain probability exceeds ${weather.rainProbability}%`, `Soil moisture is naturally maintained`],
        impact: ['Conserves water resources', 'Prevents root rot from waterlogging'],
      });
    } else if (weather.temperature > 35) {
       recommendations.push({
        type: 'WEATHER',
        title: `Increase Irrigation for ${profile?.primary_crop || 'Crops'}`,
        priority: 'High',
        confidence: 85,
        why: [`Temperatures reaching ${weather.temperature}°C`, `Accelerated evaporation rates detected`],
        impact: ['Prevents heat stress and canopy damage', 'Secures expected yield'],
      });
    }

    if (marketData?.status === 'success' && marketData.data) {
       const market = marketData.data;
       if (market.trend < -2) {
         recommendations.push({
           type: 'MARKET',
           title: 'Hold Crop Sales',
           priority: 'Medium',
           confidence: 88,
           why: [`Local prices for ${market.commodity} have dropped ${Math.abs(market.trend).toFixed(1)}%`, 'Historical patterns suggest temporary dip'],
           impact: ['Maximizes profit by timing the market', 'Avoids underselling inventory'],
         });
       } else if (market.trend > 2) {
          recommendations.push({
           type: 'MARKET',
           title: 'Favorable Selling Window',
           priority: 'High',
           confidence: 95,
           why: [`Prices for ${market.commodity} are up ${market.trend.toFixed(1)}%`, `Strong local demand detected`],
           impact: [`Capture highest price of ₹${market.bestPrice}/Qtl`, 'Optimize seasonal revenue'],
         });
       }
    }

    if (schemes?.data?.length > 0) {
       recommendations.push({
        type: 'SCHEME',
        title: `${schemes.data.length} Eligible Schemes`,
        priority: 'Low',
        confidence: 98,
        why: [`Matched profile: ${profile?.farmer_category || 'farmer'} in ${profile?.state || 'state'}`],
        impact: [`Access up to ₹${schemes.totalBenefit?.toLocaleString() || 'Unknown'} in support`],
       });
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'GENERAL',
        title: 'Optimal Farming Conditions',
        priority: 'Low',
        confidence: 99,
        why: ['Weather and local market conditions are stable'],
        impact: ['Continue regular scheduled farm operations without disruption'],
      });
    }

    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
    recommendations.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
    
    const fallbackDec = recommendations[0];
    const meta = mapDecisionMetadata(fallbackDec.type);
    
    topDecision = {
      ...fallbackDec,
      icon: meta.icon,
      color: meta.color,
      bg: meta.bg,
      link: meta.link,
      actionText: meta.actionText,
      sources: [{name: 'Local Rules engine'}, {name: 'Live APIs'}]
    };
  }

  const Icon = topDecision.icon;

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 overflow-hidden relative group">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
         <div className="flex items-center gap-2">
           <Sparkles className="w-5 h-5 text-primary" />
           <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-base">
             Today's Top Recommendation
           </h2>
         </div>
         
         <div className="flex items-center gap-3">
           {topDecision.personalization_factors && topDecision.personalization_factors.length > 0 && (
             <span className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-xs font-medium text-indigo-700 dark:text-indigo-400">
               <Sparkles className="w-3 h-3" />
               Personalized for You
             </span>
           )}
           {isFallback && (
             <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-200/50 dark:bg-slate-800 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400" title="AI Engine Offline. Using local rules.">
               <AlertCircle className="w-3.5 h-3.5" />
               Offline AI
             </span>
           )}
           <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
             <Clock className="w-3.5 h-3.5" />
             Updated {freshnessStr}
           </span>
         </div>
      </div>

      <div className="p-6 md:p-8">
         {/* Main Recommendation Title & Meta */}
         <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div className="flex-1">
               <div className="flex items-center gap-3 mb-3">
                 <div className={`p-2 rounded-xl ${topDecision.bg}`}>
                   <Icon className={`w-6 h-6 ${topDecision.color}`} />
                 </div>
                 <span className={`uppercase tracking-wider text-xs font-bold px-2 py-1 rounded-md ${
                    topDecision.priority?.toUpperCase() === 'HIGH' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                    topDecision.priority?.toUpperCase() === 'MEDIUM' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                 }`}>
                   {topDecision.priority} Priority
                 </span>
               </div>
               
               <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white leading-tight">
                 {topDecision.title}
               </h3>
            </div>
            
            {/* Trust/Confidence Module */}
            <div className="shrink-0 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 flex flex-col items-start min-w-[200px]">
               <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Confidence Score</span>
               <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-3xl font-display font-bold text-slate-800 dark:text-slate-100">{topDecision.confidence}%</span>
                  <span className="text-sm font-medium text-slate-500">/ High</span>
               </div>
               
               <div className="w-full">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Calculated Using</span>
                 <div className="flex flex-wrap gap-1.5">
                   {topDecision.sources.map((src, idx) => (
                     <SourcePill key={idx} label={src.name} icon={CheckCircle2} />
                   ))}
                   {topDecision.sources.length === 0 && (
                     <SourcePill label="Farm Context" icon={CheckCircle2} />
                   )}
                 </div>
               </div>
            </div>
         </div>

         {/* Detailed Explanation Grid */}
         <div className="grid md:grid-cols-2 gap-6 mb-8">
            
            {/* Why Section */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
               <h4 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-3 text-sm uppercase tracking-wider">
                 <Info className="w-4 h-4 text-primary" /> Why?
               </h4>
               <ul className="space-y-2.5">
                 {Array.isArray(topDecision.why) ? topDecision.why.map((reason, idx) => (
                   <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                     <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                     <span>{reason}</span>
                   </li>
                 )) : (
                   <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                     <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                     <span>{topDecision.why}</span>
                   </li>
                 )}
               </ul>
            </div>

            {/* Impact Section */}
            <div className="bg-green-50/50 dark:bg-green-900/10 p-5 rounded-2xl border border-green-100 dark:border-green-900/20">
               <h4 className="flex items-center gap-2 font-bold text-green-800 dark:text-green-400 mb-3 text-sm uppercase tracking-wider">
                 <Target className="w-4 h-4 text-green-600" /> Expected Impact
               </h4>
               <ul className="space-y-2.5">
                 {Array.isArray(topDecision.impact) ? topDecision.impact.map((imp, idx) => (
                   <li key={idx} className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300 leading-relaxed">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                     <span>{imp}</span>
                   </li>
                 )) : (
                   <li className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300 leading-relaxed">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                     <span>{topDecision.impact}</span>
                   </li>
                 )}
               </ul>
            </div>

         </div>

         {/* Personalization Section */}
         {topDecision.personalization_factors && topDecision.personalization_factors.length > 0 && (
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/20 mb-8 mt-[-1rem]">
               <h4 className="flex items-center gap-2 font-bold text-indigo-800 dark:text-indigo-400 mb-2 text-sm">
                 Why this is personalized for you
               </h4>
               <ul className="space-y-1.5">
                 {topDecision.personalization_factors.map((factor, idx) => (
                   <li key={idx} className="text-sm text-indigo-700 dark:text-indigo-300">
                     {factor}
                   </li>
                 ))}
               </ul>
            </div>
         )}

         {/* Footer Actions */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <Link to={topDecision.link} className="btn-primary !py-2.5 !px-6 text-sm inline-flex items-center justify-center gap-2 shadow-sm rounded-xl hover:shadow-md transition-shadow">
              {topDecision.actionText} <ArrowRight className="w-4 h-4" />
            </Link>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-500 mr-2">Was this useful?</span>
              <button 
                onClick={() => setFeedbackState('up')}
                className={`p-2 rounded-lg border transition-colors ${feedbackState === 'up' ? 'bg-primary/10 border-primary text-primary' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                aria-label="Helpful"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setFeedbackState('down')}
                className={`p-2 rounded-lg border transition-colors ${feedbackState === 'down' ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-900/20 dark:border-rose-800/50' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                aria-label="Not Helpful"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
         </div>

      </div>
    </section>
  );
}
