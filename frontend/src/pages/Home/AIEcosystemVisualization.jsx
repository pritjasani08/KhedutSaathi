import { motion } from 'framer-motion';
import { Sprout, ShieldCheck, BarChart3, TrendingUp, Store, Bot } from 'lucide-react';

// --- LOGO ALIGNMENT TWEAKS ---
// Since the visual artwork inside the logo file might not be perfectly symmetrical,
// you can adjust these values to nudge the logo until it looks perfectly centered.
const LOGO_NUDGE_X = "-1px"; // e.g., "-4px" moves it slightly left, "4px" moves it right
const LOGO_NUDGE_Y = "2px";  // e.g., "2px" moves it slightly down, "-2px" moves it up
const LOGO_SCALE = "1.06";   // Increase to zoom in and fill the circle more

const features = [
  // Top
  { id: 1, title: 'Crop Recommendation', desc: 'Plan the right crops', icon: <Sprout className="w-5 h-5 text-emerald-500" />, delay: 0 },
  // Upper Left
  { id: 6, title: 'Khedut AI', desc: 'Smart farming assistant', icon: <Bot className="w-5 h-5 text-primary" />, delay: 0.5 },
  // Upper Right
  { id: 2, title: 'Disease Detection', desc: 'Identify crop issues', icon: <ShieldCheck className="w-5 h-5 text-rose-500" />, delay: 0.1 },
  // Lower Left
  { id: 5, title: 'Agri Marketplace', desc: 'Buy & sell directly', icon: <Store className="w-5 h-5 text-violet-500" />, delay: 0.4 },
  // Lower Right
  { id: 3, title: 'Yield Prediction', desc: 'Predict harvest early', icon: <BarChart3 className="w-5 h-5 text-blue-500" />, delay: 0.2 },
  // Bottom
  { id: 4, title: 'Live Mandi Prices', desc: 'Real-time market rates', icon: <TrendingUp className="w-5 h-5 text-amber-500" />, delay: 0.3 },
];

const orbitPositions = [
  { left: "50%", top: "15%" },       // Top
  { left: "19.75%", top: "32.5%" },  // Upper Left
  { left: "80.25%", top: "32.5%" },  // Upper Right
  { left: "19.75%", top: "67.5%" },  // Lower Left
  { left: "80.25%", top: "67.5%" },  // Lower Right
  { left: "50%", top: "85%" },       // Bottom
];

const NodeCard = ({ feature, className }) => (
  <div className={`bg-white dark:bg-slate-800 border border-subtle shadow-xl rounded-xl p-4 flex items-start gap-4 w-60 z-20 hover:shadow-2xl hover:border-primary/50 transition-all duration-300 group ${className}`}>
    <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center shrink-0 border border-subtle group-hover:scale-110 group-hover:bg-primary/5 transition-all">
      {feature.icon}
    </div>
    <div className="flex flex-col text-left">
      <span className="text-[15px] font-bold text-heading leading-tight">{feature.title}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">{feature.desc}</span>
    </div>
  </div>
);

const LogoCenter = ({ size = "lg" }) => (
  <div className="relative z-20 flex flex-col items-center justify-center">
    {/* Pulsing AI Core rings */}
    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
    <div className="absolute -inset-6 bg-primary/15 rounded-full animate-pulse" />
    <div className="absolute -inset-12 bg-primary/5 rounded-full" />

    {/* Inner Circle (Core) */}
    <div className={`relative bg-white dark:bg-slate-900 border-[6px] border-primary/20 rounded-full shadow-[0_0_60px_rgba(34,197,94,0.4)] flex items-center justify-center overflow-hidden ${size === 'lg' ? 'w-64 h-64' : 'w-52 h-52'}`}>
      <img
        src="/logo-core.png"
        alt="KhedutSaathi Logo"
        className="w-full h-full object-contain"
        style={{ transform: `translate(${LOGO_NUDGE_X}, ${LOGO_NUDGE_Y}) scale(${LOGO_SCALE})` }}
      />
    </div>
  </div>
);

export default function AIEcosystemVisualization() {
  return (
    <div className="w-full flex items-center justify-center">
      {/* 1. Desktop Layout (lg and above): Tight Radial Ecosystem */}
      <div className="hidden lg:block relative w-[800px] h-[800px] shrink-0 origin-center scale-[0.65] xl:scale-[0.8] 2xl:scale-95">
        {/* Glowing Radial Connection Lines */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <defs>
            <radialGradient id="glowLines" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#22C55E" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.0" />
            </radialGradient>
          </defs>
          {orbitPositions.map((pos, i) => (
            <line
              key={i}
              x1="50%" y1="50%"
              x2={pos.left} y2={pos.top}
              stroke="url(#glowLines)"
              strokeWidth="4"
            />
          ))}
        </svg>

        {/* Center Logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <LogoCenter />
        </div>

        {/* Ecosystem Nodes (Positioned tightly around core) */}
        {features.map((feature, i) => (
          <div
            key={feature.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ left: orbitPositions[i].left, top: orbitPositions[i].top }}
          >
            {/* Framer Motion is placed INSIDE the absolute wrapper to prevent translate overwrites */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
              transition={{
                opacity: { delay: feature.delay, duration: 0.5 },
                scale: { delay: feature.delay, duration: 0.5 },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: feature.delay * 1.5 }
              }}
            >
              <NodeCard feature={feature} />
            </motion.div>
          </div>
        ))}
      </div>

      {/* 2. Tablet Layout (md to lg): Pyramid Grid */}
      <div className="hidden md:flex lg:hidden relative w-full max-w-3xl mx-auto flex-col items-center py-12">


        <div className="relative z-10 mb-12">
          <LogoCenter size="lg" />
        </div>

        <div className="grid grid-cols-2 w-full relative z-20 gap-y-10 gap-x-8 justify-items-center">
          {features.map((feature, i) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <NodeCard feature={feature} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. Mobile Layout (sm and below): Responsive Flow */}
      <div className="flex md:hidden flex-col items-center w-full gap-8 py-6 relative">
        <LogoCenter size="sm" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full relative z-10 px-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="w-full flex justify-center"
            >
              <NodeCard feature={feature} className="w-full max-w-[300px]" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
