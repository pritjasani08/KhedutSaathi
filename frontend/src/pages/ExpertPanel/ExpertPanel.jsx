import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sprout, BarChart3, MapPin, Ruler, CheckCircle2, RefreshCw } from 'lucide-react';
import YieldPredictor from './YieldPredictor/YieldPredictor';
import AICropPlannerWorkspace from './AICropPlanner/AICropPlannerWorkspace';
import PageHero from '../../components/shared/PageHero';
import { useFarmContext } from '../../context/FarmContext';
import { useCrossModuleContext } from '../../context/CrossModuleContext';

export default function ExpertPanel() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('ai_planner');
  const { farmProfile } = useFarmContext();
  const { isModuleSynchronized } = useCrossModuleContext();

  const tabs = [
    { key: 'ai_planner', label: 'AI Crop Planner', icon: Sprout },
    { key: 'predictor', label: t('expertPanel.yieldPredictor') || 'Yield Predictor', icon: BarChart3 },
  ];

  const hasFarmContext = farmProfile.state || farmProfile.district || farmProfile.selectedCrop;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <PageHero
          title={t('expertPanel.title') || 'Crop Planner'}
          subtitle="AI powered crop planning and yield intelligence."
        >
          {/* Professional Workspace Switcher */}
          <div className="inline-flex items-center bg-white dark:bg-slate-900 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-800 relative z-10 mt-6 overflow-x-auto max-w-full">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2.5 px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 relative whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-primary shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-lg"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <tab.icon className={`w-4 h-4 relative z-10 ${activeTab === tab.key ? 'text-primary' : ''}`} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </PageHero>

        {/* Persistent Farm Profile Panel - Command Center */}
        {hasFarmContext && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} 
            className="mt-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
               <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Location</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {farmProfile.district || 'Any'}, {farmProfile.state || 'Any'}
                  </p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Ruler className="w-3 h-3"/> Area</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {farmProfile.farmArea ? `${farmProfile.farmArea} Hectares` : 'Not set'}
                  </p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Sprout className="w-3 h-3"/> Crop Focus</p>
                  <p className="text-sm font-semibold text-primary">
                    {farmProfile.selectedCrop || 'Not selected'}
                  </p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Season</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {farmProfile.season || 'Not set'}
                  </p>
               </div>
            </div>

            {/* Sync Status Panel */}
            <div className="shrink-0 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700 flex flex-col gap-2 min-w-[200px]">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sync Status</p>
                <div className="flex items-center gap-2 text-xs font-semibold">
                    {isModuleSynchronized('CropPlanner', farmProfile) ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500"/> : <RefreshCw className="w-3.5 h-3.5 text-slate-400"/>}
                    <span className={isModuleSynchronized('CropPlanner', farmProfile) ? "text-slate-700 dark:text-slate-300" : "text-slate-400"}>Crop Planner</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold">
                    {isModuleSynchronized('YieldPredictor', farmProfile) ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500"/> : <RefreshCw className="w-3.5 h-3.5 text-slate-400"/>}
                    <span className={isModuleSynchronized('YieldPredictor', farmProfile) ? "text-slate-700 dark:text-slate-300" : "text-slate-400"}>Yield Predictor</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold">
                    {isModuleSynchronized('SmartIrrigation', farmProfile) ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500"/> : <RefreshCw className="w-3.5 h-3.5 text-slate-400"/>}
                    <span className={isModuleSynchronized('SmartIrrigation', farmProfile) ? "text-slate-700 dark:text-slate-300" : "text-slate-400"}>Smart Irrigation</span>
                </div>
            </div>
          </motion.div>
        )}

        <div className="mt-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'ai_planner' ? (
              <AICropPlannerWorkspace />
            ) : (
              <YieldPredictor />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
