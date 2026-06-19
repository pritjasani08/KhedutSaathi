import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Thermometer, Droplets, CloudRain, Wind,
  CheckCircle2, XCircle, Clock, Gauge,
  CloudSun, MapPin, AlertTriangle, CloudOff, Info, Target, ListChecks, CalendarClock, PlayCircle
} from 'lucide-react';
import { getIrrigationAdvice } from '../../services/irrigationApi';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function SmartIrrigation() {
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    // Check local storage for cached data immediately
    const cachedString = localStorage.getItem('lastIrrigationAdvice');
    if (cachedString) {
      try {
        const cached = JSON.parse(cachedString);
        setData(cached.data);
        setLastUpdated(cached.timestamp);
        setLoading(false); // Stop main loading instantly
      } catch (e) {
        console.error('Failed to parse cached irrigation data', e);
      }
    }
    
    // Always fetch fresh data in background
    fetchAdvice(!!cachedString);
  }, []);

  const fetchAdvice = (hasCache) => {
    if (!hasCache) setLoading(true);
    else setIsRefreshing(true);
    
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      setIsRefreshing(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // You could pass the selected crop from state here if the UI has a crop selector.
          const crop = "Crops"; 
          
          const adviceData = await getIrrigationAdvice(latitude, longitude, crop);
          
          setData(adviceData);
          
          const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          setLastUpdated(now);
          
          // Cache only successful responses
          localStorage.setItem('lastIrrigationAdvice', JSON.stringify({
            data: adviceData,
            timestamp: now
          }));

          setLoading(false);
          setIsRefreshing(false);
        } catch (err) {
          console.error("Error fetching irrigation advice:", err);
          if (!hasCache) {
             setError("Failed to fetch smart irrigation data. Please try again.");
          }
          setLoading(false);
          setIsRefreshing(false);
        }
      },
      (geoError) => {
        console.error("Geolocation error:", geoError);
        if (!hasCache) {
          setError("Location access denied. Please enable location to get precise irrigation advice.");
        }
        setLoading(false);
        setIsRefreshing(false);
      }
    );
  };

  const renderSkeleton = () => (
    <div className="min-h-screen gradient-bg pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-pulse">
          <div className="h-6 w-32 bg-slate-200 rounded-full mx-auto mb-4"></div>
          <div className="h-10 w-3/4 max-w-lg bg-slate-200 rounded-lg mx-auto mb-4"></div>
          <div className="h-4 w-1/2 bg-slate-200 rounded-full mx-auto"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card p-6 h-32 rounded-xl"></div>
          ))}
        </div>
        <div className="glass-card p-8 mb-12 h-40 animate-pulse"></div>
        <div className="grid md:grid-cols-2 gap-5 mb-12 animate-pulse">
          {[1, 2, 3, 4].map(i => (
             <div key={i} className="glass-card p-6 h-32 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading && !data) {
    return renderSkeleton();
  }

  if (error && !data) {
    return (
      <div className="min-h-screen gradient-bg pt-24 pb-16 flex items-center justify-center">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Oops! Something went wrong.</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => fetchAdvice(false)}
            className="btn-primary w-full justify-center"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { location, weather, recommendation, farmerAction, forecast, confidence } = data;

  const weatherCards = {
    temperature: { value: `${weather.temperature}°C`, label: 'Temperature', icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
    humidity: { value: `${weather.humidity}%`, label: 'Humidity', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    rainProbability: { value: `${weather.rainProbability}%`, label: 'Rain Probability', icon: CloudRain, color: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-100' },
    windSpeed: { value: `${weather.windSpeed} km/h`, label: 'Wind Speed', icon: Wind, color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-100' },
  };

  const isPositiveRec = recommendation.status === 'IRRIGATION_RECOMMENDED';
  const isWaitRec = recommendation.status === 'WAIT_AND_MONITOR' || recommendation.status === 'DELAY_IRRIGATION';

  const recIcon = isPositiveRec ? CheckCircle2 : (isWaitRec ? Clock : XCircle);
  const recColor = isPositiveRec ? 'text-green-600' : (isWaitRec ? 'text-amber-600' : 'text-red-600');
  const recBg = isPositiveRec ? 'bg-green-50' : (isWaitRec ? 'bg-amber-50' : 'bg-red-50');
  const recBorder = isPositiveRec ? 'border-green-200' : (isWaitRec ? 'border-amber-200' : 'border-red-200');

  // Confidence Styling
  let confColor = 'text-green-600';
  let confBg = 'bg-green-500';
  let confBorder = 'border-green-200';
  if (confidence?.level === 'Medium') {
    confColor = 'text-amber-600';
    confBg = 'bg-amber-500';
    confBorder = 'border-amber-200';
  } else if (confidence?.level === 'Low') {
    confColor = 'text-red-600';
    confBg = 'bg-red-500';
    confBorder = 'border-red-200';
  }

  return (
    <div className="min-h-screen gradient-bg pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        
        {/* Header & Location */}
        <motion.div
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="text-center mb-12"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100/60 text-sky-600 text-sm font-semibold mb-4">
            <Droplets className="w-4 h-4" /> Live Weather Intelligence
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-4">
            {t('smartIrrigation.title') || "Smart Irrigation Advisor"}
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-slate-500 text-lg max-w-2xl mx-auto mb-6">
            Data-driven decisions for optimal crop hydration and water conservation.
          </motion.p>
          
          <motion.div variants={fadeUp} custom={3} className="flex flex-wrap items-center justify-center gap-4">
            <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 glass-card rounded-full border border-slate-200">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="font-medium text-slate-700">
                {location.name !== "Unknown" ? location.name : `Lat: ${location.lat.toFixed(2)}, Lon: ${location.lon.toFixed(2)}`}
              </span>
              <span className="text-xs text-slate-400 ml-2">(Current Location)</span>
            </div>
            
            {lastUpdated && (
              <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 bg-white/50 px-3 py-1.5 rounded-full border border-slate-200/60">
                {isRefreshing ? (
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                Last Updated: {lastUpdated}
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Hero Recommendation Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`mb-8 rounded-3xl p-8 border ${recBorder} ${recBg} shadow-sm overflow-hidden relative`}
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            {isPositiveRec ? <Droplets className="w-32 h-32 text-green-600" /> : <CloudOff className="w-32 h-32 text-red-600" />}
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-white shadow-sm shrink-0`}>
              {React.createElement(recIcon, { className: `w-10 h-10 ${recColor}` })}
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className={`font-display text-3xl font-bold mb-2 ${recColor}`}>
                {recommendation.title}
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-slate-700 font-medium text-lg">
                <Info className="w-5 h-5 shrink-0" />
                <p>{recommendation.reason}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Confidence & Explainability Section */}
        {confidence && (
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="mb-12 grid md:grid-cols-3 gap-5"
          >
            {/* Confidence Score Bar */}
            <motion.div variants={fadeUp} className={`glass-card p-6 border ${confBorder} md:col-span-1 flex flex-col justify-center items-center text-center`}>
              <Target className={`w-8 h-8 mb-3 ${confColor}`} />
              <p className="text-sm text-slate-500 font-semibold mb-1">Recommendation Confidence</p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className={`font-display text-4xl font-bold ${confColor}`}>{confidence.score}%</span>
                <span className={`text-sm font-bold px-2 py-1 rounded-md ${confColor.replace('text-', 'bg-').replace('600', '100')}`}>{confidence.level}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${confidence.score}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-2.5 rounded-full ${confBg}`}
                ></motion.div>
              </div>
            </motion.div>

            {/* Explainability Factors */}
            <motion.div variants={fadeUp} className="glass-card p-6 border border-slate-200 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <ListChecks className="w-5 h-5 text-slate-600" />
                <h3 className="font-display font-bold text-lg text-slate-800">Why we recommend this</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {confidence.factors.map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-600 font-medium leading-tight">{factor}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Farmer Action Summary */}
        {farmerAction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 glass-card p-6 border border-slate-200 shadow-sm"
          >
            <h3 className="font-display font-bold text-lg text-slate-800 mb-5 flex items-center gap-2">
               <PlayCircle className="w-5 h-5 text-primary" /> Farmer Action Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="pt-4 md:pt-0 md:px-4 flex flex-col items-center text-center">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Today's Action</p>
                <p className={`font-bold text-lg ${recColor}`}>{farmerAction.todayAction}</p>
              </div>
              <div className="pt-4 md:pt-0 md:px-4 flex flex-col items-center text-center">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Next Recommended Check</p>
                <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                  <CalendarClock className="w-5 h-5 text-indigo-500" />
                  {farmerAction.nextCheckTime}
                </div>
              </div>
              <div className="pt-4 md:pt-0 md:px-4 flex flex-col items-center text-center">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Estimated Water Saving</p>
                <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                  <Gauge className="w-5 h-5 text-blue-500" />
                  {farmerAction.waterSaving}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Current Weather */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="mb-12"
        >
          <motion.h2 variants={fadeUp} className="font-display text-xl font-bold text-body mb-6 flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-primary" />
            Current Conditions
          </motion.h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {Object.entries(weatherCards).map(([key, data], i) => (
              <motion.div
                key={key}
                variants={fadeUp}
                custom={i}
                className={`glass-card p-6 card-hover border ${data.border}`}
              >
                <div className={`w-14 h-14 ${data.bg} rounded-2xl flex items-center justify-center mb-4`}>
                  <data.icon className={`w-7 h-7 ${data.color}`} />
                </div>
                <p className="text-xs text-slate-500 font-medium mb-1">{data.label}</p>
                <p className="font-display text-2xl font-bold text-body">{data.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Actionable Details (Best Time) */}
        {recommendation.bestTime && (
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="mb-12"
          >
            <motion.div variants={fadeUp} className="glass-card p-6 card-hover border border-violet-100 max-w-md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Best Time to Irrigate</p>
                  <p className="font-display font-bold text-xl text-violet-700">{recommendation.bestTime}</p>
                  <p className="text-sm text-slate-500 mt-2">Optimal conditions for maximum absorption and lowest evaporation.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 3-Day Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card p-6 mb-12"
        >
          <h3 className="font-display text-lg font-bold text-body mb-5">3-Day Irrigation Forecast</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forecast.map((day, i) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-5 rounded-xl transition-all duration-300 border flex items-center justify-between
                  ${day.recommendation === "Irrigate" ? 'bg-green-50 border-green-100' : 
                    day.recommendation === "Don't Irrigate" ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">{day.day}</p>
                  <p className="font-bold text-2xl text-slate-900">{day.temp}</p>
                  <p className="text-xs text-slate-500 mt-1">Rain Prob: {day.rain}%</p>
                </div>
                <div className="text-right">
                  {day.recommendation === "Irrigate" && <CheckCircle2 className="w-8 h-8 text-green-500 ml-auto mb-2" />}
                  {day.recommendation === "Don't Irrigate" && <XCircle className="w-8 h-8 text-red-500 ml-auto mb-2" />}
                  {day.recommendation === "Delay" && <Clock className="w-8 h-8 text-amber-500 ml-auto mb-2" />}
                  <span className={`text-sm font-bold ${
                    day.recommendation === "Irrigate" ? "text-green-700" : 
                    day.recommendation === "Don't Irrigate" ? "text-red-700" : "text-amber-700"
                  }`}>{day.recommendation}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
