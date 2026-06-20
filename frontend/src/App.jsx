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
import CropMarket from './pages/CropMarket/CropMarket';
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

import Profile from './pages/Profile/Profile';

import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import Deals from './pages/Deals/Deals';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        
        {/* Farmer Only Routes */}
        <Route path="/crop-recommendation" element={<ProtectedRoute allowedRoles={['farmer']}><PageWrapper><ExpertPanel /></PageWrapper></ProtectedRoute>} />
        <Route path="/crop-health" element={<ProtectedRoute allowedRoles={['farmer']}><PageWrapper><CropDiagnosis /></PageWrapper></ProtectedRoute>} />
        
        {/* Market Intelligence & Marketplace Feed (accessible by both, but UI will restrict features) */}
        <Route path="/market-prices" element={<ProtectedRoute><PageWrapper><MarketHub /></PageWrapper></ProtectedRoute>} />
        <Route path="/agri-marketplace" element={<ProtectedRoute><PageWrapper><AgriMarketplace /></PageWrapper></ProtectedRoute>} />
        <Route path="/crop-market" element={<ProtectedRoute><PageWrapper><CropMarket /></PageWrapper></ProtectedRoute>} />
        
        <Route path="/smart-irrigation" element={<PageWrapper><SmartIrrigation /></PageWrapper>} />
        <Route path="/features" element={<PageWrapper><Features /></PageWrapper>} />
        <Route path="/resources" element={<PageWrapper><Resources /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/profile" element={<ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/deals" element={<ProtectedRoute><PageWrapper><Deals /></PageWrapper></ProtectedRoute>} />
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
