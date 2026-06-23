import React, { useState, useEffect, useRef } from 'react';
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
  
  const [loading, setLoading] = useState(() => !localStorage.getItem('lastIrrigationAdvice'));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentCoords, setCurrentCoords] = useState(null);
  
  const [data, setData] = useState(() => {
    const cachedString = localStorage.getItem('lastIrrigationAdvice');
    if (cachedString) {
      try {
        return JSON.parse(cachedString).data;
      } catch (e) { return null; }
    }
    return null;
  });
  const [lastUpdated, setLastUpdated] = useState(() => {
    const cachedString = localStorage.getItem('lastIrrigationAdvice');
    if (cachedString) {
      try {
        return JSON.parse(cachedString).timestamp;
      } catch (e) { return null; }
    }
    return null;
  });

  // Prevent multiple simultaneous fetch calls during retries
  const fetchTimeoutRef = useRef(null);

  useEffect(() => {
    const cachedString = localStorage.getItem('lastIrrigationAdvice');
    fetchAdvice(!!cachedString, 1);
    
    return () => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, []);

  function fetchAdvice(hasCache, attempt = 1) {
    if (!hasCache) setLoading(true);
    else setIsRefreshing(true);
    
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      setIsRefreshing(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setCurrentCoords({ lat: latitude, lon: longitude });
          const crop = "Crops"; 
          
          const adviceData = await getIrrigationAdvice(latitude, longitude, crop);
          
          setData(adviceData);
          setRetryCount(0); // Reset on success
          
          const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          setLastUpdated(now);
          
          localStorage.setItem('lastIrrigationAdvice', JSON.stringify({
            data: adviceData,
            timestamp: now
          }));

          setLoading(false);
          setIsRefreshing(false);
        } catch (err) {
          console.error(`Error fetching irrigation advice (Attempt ${attempt}):`, err);
          
          if (attempt < 3) {
            setRetryCount(attempt);
            // Exponential backoff
            fetchTimeoutRef.current = setTimeout(() => {
               fetchAdvice(hasCache, attempt + 1);
            }, Math.pow(2, attempt) * 1000);
            return;
          }

          if (!hasCache) {
             setError("Unable to load irrigation recommendations right now. You can still explore irrigation guidelines and best practices while we reconnect.");
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
  }

  const renderSkeleton = () => (
    <>
      <div className="text-center mb-12 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4"></div>
        <div className="h-10 w-3/4 max-w-lg bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto mb-4"></div>
        <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto"></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card p-6 h-32 rounded-xl border dark:border-slate-700"></div>
        ))}
      </div>
      <div className="glass-card p-8 mb-12 h-40 animate-pulse border dark:border-slate-700"></div>
      <div className="grid md:grid-cols-2 gap-5 mb-12 animate-pulse">
        {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card p-6 h-32 rounded-xl border dark:border-slate-700"></div>
        ))}
      </div>
    </>
  );

  const displayLocation = data?.location 
    ? (data.location.name !== "Unknown" ? data.location.name : `Lat: ${data.location.lat.toFixed(2)}, Lon: ${data.location.lon.toFixed(2)}`)
    : currentCoords ? `Lat: ${currentCoords.lat.toFixed(2)}, Lon: ${currentCoords.lon.toFixed(2)}` : "Getting location...";

  const renderContent = () => {
    if (loading && !data) {
      return renderSkeleton();
    }

    if (error && !data) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="glass-card p-8 max-w-lg w-full text-center border dark:border-slate-700">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CloudOff className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Connection Issue</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
            {retryCount > 0 && retryCount < 3 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mb-4 animate-pulse">
                Retrying... (Attempt {retryCount} of 3)
              </p>
            )}
            <button 
              onClick={() => {
                if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
                setRetryCount(0);
                fetchAdvice(false, 1);
              }}
              className="btn-primary w-full justify-center"
              disabled={retryCount > 0 && retryCount < 3}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    // Validate that the data object actually contains the required fields
    if (!data || !data.location || !data.weather || !data.recommendation || !data.forecast) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="glass-card p-8 max-w-lg w-full text-center border dark:border-slate-700">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No Recommendations Available</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {data?.message || data?.error || "We don't have actionable irrigation recommendations for your location at this moment. You can check back later."}
            </p>
            <button 
              onClick={() => {
                localStorage.removeItem('lastIrrigationAdvice');
                if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
                setRetryCount(0);
                fetchAdvice(false, 1);
              }}
              className="btn-primary w-full justify-center"
            >
              Refresh Data
            </button>
          </div>
        </div>
      );
    }

    const { location, weather, recommendation, farmerAction, forecast, confidence } = data;

    const weatherCards = {
      temperature: { value: `${weather.temperature}°C`, label: 'Temperature', icon: Thermometer, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-100 dark:border-orange-900/30' },
      humidity: { value: `${weather.humidity}%`, label: 'Humidity', icon: Droplets, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-900/30' },
      rainProbability: { value: `${weather.rainProbability}%`, label: 'Rain Probability', icon: CloudRain, color: 'text-cyan-500 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-100 dark:border-cyan-900/30' },
      windSpeed: { value: `${weather.windSpeed} km/h`, label: 'Wind Speed', icon: Wind, color: 'text-teal-500 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-100 dark:border-teal-900/30' },
    };

    const isPositiveRec = recommendation.status === 'IRRIGATION_RECOMMENDED';
    const isWaitRec = recommendation.status === 'WAIT_AND_MONITOR' || recommendation.status === 'DELAY_IRRIGATION';

    const recIcon = isPositiveRec ? CheckCircle2 : (isWaitRec ? Clock : XCircle);
    const recColor = isPositiveRec ? 'text-green-600 dark:text-green-400' : (isWaitRec ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400');
    const recBg = isPositiveRec ? 'bg-green-50 dark:bg-green-900/20' : (isWaitRec ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20');
    const recBorder = isPositiveRec ? 'border-green-200 dark:border-green-900/30' : (isWaitRec ? 'border-amber-200 dark:border-amber-900/30' : 'border-red-200 dark:border-red-900/30');

    // Confidence Styling
    let confColor = 'text-green-600 dark:text-green-400';
    let confBg = 'bg-green-500 dark:bg-green-400';
    let confBorder = 'border-green-200 dark:border-green-900/30';
    let confBadgeBg = 'bg-green-100 dark:bg-green-900/40';
    
    if (confidence?.level === 'Medium') {
      confColor = 'text-amber-600 dark:text-amber-400';
      confBg = 'bg-amber-500 dark:bg-amber-400';
      confBorder = 'border-amber-200 dark:border-amber-900/30';
      confBadgeBg = 'bg-amber-100 dark:bg-amber-900/40';
    } else if (confidence?.level === 'Low') {
      confColor = 'text-red-600 dark:text-red-400';
      confBg = 'bg-red-500 dark:bg-red-400';
      confBorder = 'border-red-200 dark:border-red-900/30';
      confBadgeBg = 'bg-red-100 dark:bg-red-900/40';
    }

    return (
      <>
        {/* Hero Recommendation Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`mb-8 rounded-3xl p-8 border ${recBorder} ${recBg} shadow-sm overflow-hidden relative`}
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            {isPositiveRec ? <Droplets className="w-32 h-32 text-green-600 dark:text-green-500" /> : <CloudOff className="w-32 h-32 text-red-600 dark:text-red-500" />}
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm shrink-0 border border-slate-100 dark:border-slate-700`}>
              {React.createElement(recIcon, { className: `w-10 h-10 ${recColor}` })}
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className={`font-display text-3xl font-bold mb-2 ${recColor}`}>
                {recommendation.title}
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-slate-700 dark:text-slate-300 font-medium text-lg">
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
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-1">Recommendation Confidence</p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className={`font-display text-4xl font-bold ${confColor}`}>{confidence.score}%</span>
                <span className={`text-sm font-bold px-2 py-1 rounded-md ${confColor} ${confBadgeBg}`}>{confidence.level}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${confidence.score}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-2.5 rounded-full ${confBg}`}
                ></motion.div>
              </div>
            </motion.div>

            {/* Explainability Factors */}
            <motion.div variants={fadeUp} className="glass-card p-6 border border-slate-200 dark:border-slate-700 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <ListChecks className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h3 className="font-display font-bold text-lg text-slate-800 dark:text-slate-200">Why we recommend this</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {confidence.factors.map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-50/50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-tight">{factor}</p>
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
            className="mb-12 glass-card p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <h3 className="font-display font-bold text-lg text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
               <PlayCircle className="w-5 h-5 text-primary" /> Farmer Action Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-700">
              <div className="pt-4 md:pt-0 md:px-4 flex flex-col items-center text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-2">Today's Action</p>
                <p className={`font-bold text-lg ${recColor}`}>{farmerAction.todayAction}</p>
              </div>
              <div className="pt-4 md:pt-0 md:px-4 flex flex-col items-center text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-2">Next Recommended Check</p>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-lg">
                  <CalendarClock className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  {farmerAction.nextCheckTime}
                </div>
              </div>
              <div className="pt-4 md:pt-0 md:px-4 flex flex-col items-center text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-2">Estimated Water Saving</p>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-lg">
                  <Gauge className="w-5 h-5 text-blue-500 dark:text-blue-400" />
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
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{data.label}</p>
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
            <motion.div variants={fadeUp} className="glass-card p-6 card-hover border border-violet-100 dark:border-violet-900/30 max-w-md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/20 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Best Time to Irrigate</p>
                  <p className="font-display font-bold text-xl text-violet-700 dark:text-violet-400">{recommendation.bestTime}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Optimal conditions for maximum absorption and lowest evaporation.</p>
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
          className="glass-card p-6 mb-12 border border-slate-200 dark:border-slate-700"
        >
          <h3 className="font-display text-lg font-bold text-body mb-5">3-Day Irrigation Forecast</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forecast.map((day, i) => {
              const isIrrigate = day.recommendation === "Irrigate";
              const isDelay = day.recommendation === "Delay";
              const isDont = day.recommendation === "Don't Irrigate";
              
              const dayBg = isIrrigate ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30' : 
                            isDont ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30' : 
                                     'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30';
              
              const dayTextColor = isIrrigate ? "text-green-700 dark:text-green-400" : 
                                   isDont ? "text-red-700 dark:text-red-400" : "text-amber-700 dark:text-amber-400";
              
              return (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-5 rounded-xl transition-all duration-300 border flex items-center justify-between ${dayBg}`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{day.day}</p>
                  <p className="font-bold text-2xl text-slate-900 dark:text-slate-100">{day.temp}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Rain Prob: {day.rain}%</p>
                </div>
                <div className="text-right">
                  {isIrrigate && <CheckCircle2 className="w-8 h-8 text-green-500 dark:text-green-400 ml-auto mb-2" />}
                  {isDont && <XCircle className="w-8 h-8 text-red-500 dark:text-red-400 ml-auto mb-2" />}
                  {isDelay && <Clock className="w-8 h-8 text-amber-500 dark:text-amber-400 ml-auto mb-2" />}
                  <span className={`text-sm font-bold ${dayTextColor}`}>{day.recommendation}</span>
                </div>
              </motion.div>
            )})}
          </div>
        </motion.div>
      </>
    );
  };

  return (
    <div className="min-h-screen gradient-bg pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        
        {/* Persistent Header & Location */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-heading">{t('smartIrrigation.title') || "Smart Irrigation Advisor"}</h1>
            <p className="text-sm text-slate-500 mt-1">Data-driven decisions for optimal crop hydration and water conservation.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full border border-slate-200 dark:border-slate-700 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {displayLocation}
              </span>
            </div>
            
            {lastUpdated && (
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 px-3 py-2 rounded-full border border-slate-200/60 dark:border-slate-700/60">
                {isRefreshing ? (
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Clock className="w-3 h-3" />
                )}
                {lastUpdated}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Content: Skeleton, Error, Empty, or Data */}
        {renderContent()}

      </div>
    </div>
  );
}
