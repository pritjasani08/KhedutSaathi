import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
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
import Login from './pages/Auth/Login/Login';
import Register from './pages/Auth/Register/Register';
import PlaceholderPage from './pages/Placeholder/PlaceholderPage';
import KhedutAI from './pages/KhedutAI/KhedutAI';

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
        <Route path="/crop-recommendation" element={<PageWrapper><ExpertPanel /></PageWrapper>} />
        <Route path="/crop-health" element={<PageWrapper><CropDiagnosis /></PageWrapper>} />
        <Route path="/market-prices" element={<PageWrapper><MarketHub /></PageWrapper>} />
        <Route path="/smart-irrigation" element={<PageWrapper><SmartIrrigation /></PageWrapper>} />
        <Route path="/agri-marketplace" element={<PageWrapper><AgriMarketplace /></PageWrapper>} />
        <Route path="/features" element={<PageWrapper><Features /></PageWrapper>} />
        <Route path="/resources" element={<PageWrapper><Resources /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/khedut-ai" element={<PageWrapper><KhedutAI /></PageWrapper>} />
        
        {/* Placeholder Routes */}
        <Route path="/expert-help" element={<PageWrapper><PlaceholderPage title="Expert Help" /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function ScrollToTop() {
  useLocation();
  
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }

  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
              <Navbar />
              <main className="flex-1">
                <AnimatedRoutes />
              </main>
              <Footer />
              <ChatbotWidget />
            </div>
          </Router>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
