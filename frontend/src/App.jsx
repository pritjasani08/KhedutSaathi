import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';
import Home from './pages/Home/Home';
import CropDiagnosis from './pages/CropDiagnosis/CropDiagnosis';
import MarketHub from './pages/MarketHub/MarketHub';
import ExpertPanel from './pages/ExpertPanel/ExpertPanel';
import SmartIrrigation from './pages/SmartIrrigation/SmartIrrigation';
import AgriMarketplace from './pages/AgriMarketplace/AgriMarketplace';
import Features from './pages/Features/Features';
import Resources from './pages/Resources/Resources';
import About from './pages/About/About';

/* Page transition wrapper */
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/crop-health" element={<PageWrapper><CropDiagnosis /></PageWrapper>} />
        <Route path="/market-prices" element={<PageWrapper><MarketHub /></PageWrapper>} />
        <Route path="/crop-planning" element={<PageWrapper><ExpertPanel /></PageWrapper>} />
        <Route path="/expert-help" element={<PageWrapper><ExpertPanel /></PageWrapper>} />
        <Route path="/smart-irrigation" element={<PageWrapper><SmartIrrigation /></PageWrapper>} />
        <Route path="/agri-marketplace" element={<PageWrapper><AgriMarketplace /></PageWrapper>} />
        <Route path="/features" element={<PageWrapper><Features /></PageWrapper>} />
        <Route path="/resources" element={<PageWrapper><Resources /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }

  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          <Navbar />
          <main className="flex-1">
            <AnimatedRoutes />
          </main>
          <Footer />
          <ChatbotWidget />
        </div>
      </Router>
    </ThemeProvider>
  );
}
