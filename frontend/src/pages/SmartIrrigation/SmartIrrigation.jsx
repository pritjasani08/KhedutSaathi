import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Thermometer, Droplets, CloudRain, Wind,
  CheckCircle2, XCircle, Clock, Gauge,
  CloudSun, Sun, CloudDrizzle
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const weatherData = {
  temperature: { value: '32°C', trend: 'Warm', icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
  humidity: { value: '68%', trend: 'Moderate', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  rainfall: { value: '12mm', trend: 'Light', icon: CloudRain, color: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-100' },
  windSpeed: { value: '15 km/h', trend: 'Gentle', icon: Wind, color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-100' },
};

const recommendations = [
  {
    key: 'irrigateToday',
    answer: 'Yes — Recommended',
    positive: true,
    detail: 'Soil moisture is below optimal. Irrigate for 45 minutes in the early morning for best results.',
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  {
    key: 'rainExpected',
    answer: 'No — Clear skies expected',
    positive: false,
    detail: 'No rain forecasted in the next 48 hours. Consider supplemental irrigation for moisture-sensitive crops.',
    icon: XCircle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  {
    key: 'waterRequirement',
    answer: '4.5 Liters / sq. meter',
    positive: true,
    detail: 'Based on current temperature, humidity, and crop type (Wheat - Tillering Stage).',
    icon: Gauge,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    key: 'bestTime',
    answer: '5:30 AM — 7:00 AM',
    positive: true,
    detail: 'Early morning irrigation minimizes evaporation loss by 35% and promotes deep root growth.',
    icon: Clock,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
  },
];

const forecast = [
  { day: 'Today', icon: Sun, temp: '32°C', rain: '0%' },
  { day: 'Tomorrow', icon: CloudSun, temp: '30°C', rain: '10%' },
  { day: 'Wed', icon: CloudSun, temp: '29°C', rain: '20%' },
  { day: 'Thu', icon: CloudDrizzle, temp: '27°C', rain: '65%' },
  { day: 'Fri', icon: CloudRain, temp: '25°C', rain: '80%' },
];

export default function SmartIrrigation() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen gradient-bg pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="text-center mb-12"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100/60 text-sky-600 text-sm font-semibold mb-4">
            <Droplets className="w-4 h-4" /> Weather Intelligence
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-4">
            {t('smartIrrigation.title')}
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-slate-500 text-lg max-w-2xl mx-auto">
            {t('smartIrrigation.subtitle')}
          </motion.p>
        </motion.div>

        {/* Current Conditions */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="mb-12"
        >
          <motion.h2 variants={fadeUp} className="font-display text-xl font-bold text-body mb-6 flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-primary" />
            {t('smartIrrigation.currentConditions')}
          </motion.h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {Object.entries(weatherData).map(([key, data], i) => (
              <motion.div
                key={key}
                variants={fadeUp}
                custom={i}
                className={`glass-card p-6 card-hover border ${data.border}`}
              >
                <div className={`w-14 h-14 ${data.bg} rounded-2xl flex items-center justify-center mb-4`}>
                  <data.icon className={`w-7 h-7 ${data.color}`} />
                </div>
                <p className="text-xs text-slate-500 font-medium mb-1">{t(`smartIrrigation.${key}`)}</p>
                <p className="font-display text-2xl font-bold text-body">{data.value}</p>
                <p className={`text-sm font-medium mt-1 ${data.color}`}>{data.trend}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 5-Day Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card p-6 mb-12"
        >
          <h3 className="font-display text-lg font-bold text-body mb-5">5-Day Forecast</h3>
          <div className="grid grid-cols-5 gap-4">
            {forecast.map((day, i) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`text-center p-4 rounded-xl transition-all duration-300 ${
                  i === 0 ? 'bg-primary-50 border border-primary/20' : 'hover:bg-surface-muted'
                }`}
              >
                <p className={`text-sm font-semibold mb-2 ${i === 0 ? 'text-primary' : 'text-slate-600'}`}>{day.day}</p>
                <day.icon className={`w-8 h-8 mx-auto mb-2 ${i === 0 ? 'text-primary' : 'text-slate-400'}`} />
                <p className="font-bold text-body">{day.temp}</p>
                <p className="text-xs text-slate-500 mt-1">Rain: {day.rain}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.h2 variants={fadeUp} className="font-display text-xl font-bold text-body mb-6 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            {t('smartIrrigation.recommendations')}
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-5">
            {recommendations.map((rec, i) => (
              <motion.div
                key={rec.key}
                variants={fadeUp}
                custom={i}
                className={`glass-card p-6 card-hover border ${rec.border}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${rec.bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <rec.icon className={`w-6 h-6 ${rec.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-medium mb-1">{t(`smartIrrigation.${rec.key}`)}</p>
                    <p className={`font-display font-bold text-lg ${rec.color}`}>{rec.answer}</p>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">{rec.detail}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
