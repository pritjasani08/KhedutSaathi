import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';
import Home from './pages/Home/Home';

// Eagerly loaded routes
import ExpertPanel from './pages/ExpertPanel/ExpertPanel';
import SmartIrrigation from './pages/SmartIrrigation/SmartIrrigation';
import CropMarket from './pages/CropMarket/CropMarket';
import Features from './pages/Features/Features';
import Login from './pages/Auth/Login/Login';
import Register from './pages/Auth/Register/Register';
import ForgotPassword from './pages/Auth/ForgotPassword/ForgotPassword';
import PlaceholderPage from './pages/Placeholder/PlaceholderPage';
import Profile from './pages/Profile/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Deals from './pages/Deals/Deals';

// Lazy loaded routes (Code Splitting)
const CropDiagnosis = lazy(() => import('./pages/CropDiagnosis/CropDiagnosis'));
const MarketHub = lazy(() => import('./pages/MarketHub/MarketHub'));
const AgriMarketplace = lazy(() => import('./pages/AgriMarketplace/AgriMarketplace'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard/SellerDashboard'));
const Resources = lazy(() => import('./pages/Resources/Resources'));
const NewsDetail = lazy(() => import('./pages/Resources/NewsDetail'));
const SchemeDetail = lazy(() => import('./pages/Resources/SchemeDetail'));
const About = lazy(() => import('./pages/About/About'));
const KhedutAI = lazy(() => import('./pages/KhedutAI/KhedutAI'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const NewDashboard = lazy(() => import('./features/dashboard/Dashboard'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

/* Page transition wrapper with Suspense fallback */
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </motion.div>
  );
}

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
        <Route path="/market-prices" element={<PageWrapper><MarketHub /></PageWrapper>} />
        <Route path="/agri-marketplace" element={<PageWrapper><AgriMarketplace /></PageWrapper>} />
        <Route path="/seller-dashboard" element={<Navigate to="/seller-dashboard/products" replace />} />
        <Route path="/seller-dashboard/:tab" element={<PageWrapper><SellerDashboard /></PageWrapper>} />
        <Route path="/crop-market" element={<ProtectedRoute><PageWrapper><CropMarket /></PageWrapper></ProtectedRoute>} />

        <Route path="/smart-irrigation" element={<PageWrapper><SmartIrrigation /></PageWrapper>} />
        <Route path="/features" element={<PageWrapper><Features /></PageWrapper>} />
        <Route path="/resources" element={<PageWrapper><Resources /></PageWrapper>} />
        <Route path="/resources/news/:id" element={<PageWrapper><NewsDetail /></PageWrapper>} />
        <Route path="/resources/schemes/:id" element={<PageWrapper><SchemeDetail /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
        <Route path="/profile" element={<ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>} />
        <Route path="/dashboard-legacy" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><NewDashboard /></PageWrapper></ProtectedRoute>} />
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

function AppContent() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
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
    </QueryClientProvider>
  );
}
