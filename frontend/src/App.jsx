import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
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
import SellerDashboard from './pages/SellerDashboard/SellerDashboard';
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
import NewDashboard from './features/dashboard/Dashboard';
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
        
        {/* Seller Only Routes */}
        <Route path="/seller-dashboard" element={<ProtectedRoute allowedRoles={['seller']}><Navigate to="/seller-dashboard/products" replace /></ProtectedRoute>} />
        <Route path="/seller-dashboard/:tab" element={<ProtectedRoute allowedRoles={['seller']}><PageWrapper><SellerDashboard /></PageWrapper></ProtectedRoute>} />
        
        {/* Buyer Only Routes */}
        <Route path="/crop-market" element={<ProtectedRoute allowedRoles={['buyer']}><PageWrapper><CropMarket /></PageWrapper></ProtectedRoute>} />
        
        {/* Farmer Marketplace (Farmer buys from sellers) */}
        <Route path="/agri-marketplace" element={<ProtectedRoute allowedRoles={['farmer']}><PageWrapper><AgriMarketplace /></PageWrapper></ProtectedRoute>} />
        
        <Route path="/smart-irrigation" element={<PageWrapper><SmartIrrigation /></PageWrapper>} />
        <Route path="/features" element={<PageWrapper><Features /></PageWrapper>} />
        <Route path="/resources" element={<PageWrapper><Resources /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/profile" element={<ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>} />
        
        {/* Farmer Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['farmer']}><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/dashboard-new" element={<ProtectedRoute allowedRoles={['farmer']}><PageWrapper><NewDashboard /></PageWrapper></ProtectedRoute>} />
        
        {/* Deals Route (For both Farmer and Buyer) */}
        <Route path="/deals" element={<ProtectedRoute allowedRoles={['farmer', 'buyer']}><PageWrapper><Deals /></PageWrapper></ProtectedRoute>} />
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

function AppContent() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <AnimatedRoutes />
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <Router>
              <ScrollToTop />
              <AppContent />
            </Router>
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
