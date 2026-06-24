import React, { Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDashboardOverview } from './hooks/useDashboardQueries';
import { DashboardSkeleton, NewsSkeleton } from './skeletons/Skeletons';
import { ErrorBoundary } from './components/ErrorBoundary';
import { motion } from 'framer-motion';
import { Package, TrendingUp, CheckCircle, Tag } from 'lucide-react';

import { 
  WelcomeHeader, 
  FarmSummaryCard, 
  ProfileCompletionCard,
  WeatherCard,
  MarketCard,
  SchemesCard,
  QuickActions,
  StatCard
} from './components/DashboardCards';

// Lazy loaded sections
const NewsSection = React.lazy(() => import('./components/Sections').then(module => ({ default: module.NewsSection })));
const AIChatsSection = React.lazy(() => import('./components/Sections').then(module => ({ default: module.AIChatsSection })));
const DiagnosesSection = React.lazy(() => import('./components/Sections').then(module => ({ default: module.DiagnosesSection })));
const ListingsSection = React.lazy(() => import('./components/Sections').then(module => ({ default: module.ListingsSection })));
const OrdersSection = React.lazy(() => import('./components/Sections').then(module => ({ default: module.OrdersSection })));

import RecommendedSchemesWidget from '../../components/dashboard/RecommendedSchemesWidget';

const Dashboard = () => {
  const { user } = useAuth();
  
  // 1. Fetch Group A (Profile, Stats, Listings, Orders) in one request!
  const { data: overview, isLoading: isOverviewLoading, error: overviewError } = useDashboardOverview();

  if (overviewError) {
    return (
      <div className="min-h-screen pt-24 pb-16 gradient-bg flex items-center justify-center">
        <div className="glass-card p-8 text-center border-red-200">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-500 mb-4">{overviewError.message}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  const { profile, completionPercentage, stats, listings, orders } = overview || {};
  const isFarmer = user?.user_type === 'farmer';

  return (
    <div className="min-h-screen pt-24 pb-16 gradient-bg">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <WelcomeHeader user={user} />

        {isFarmer ? (
          <>
            {/* Group A UI (Resolved instantly with overview) */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <FarmSummaryCard profile={profile} isLoading={isOverviewLoading} />
              <ProfileCompletionCard completionPercentage={completionPercentage} isLoading={isOverviewLoading} />
            </div>

            <div className="mb-8">
              <ErrorBoundary>
                <RecommendedSchemesWidget />
              </ErrorBoundary>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <ErrorBoundary>
                <WeatherCard profile={profile} />
              </ErrorBoundary>
              
              <ErrorBoundary>
                <MarketCard profile={profile} />
              </ErrorBoundary>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <ErrorBoundary>
                <SchemesCard profile={profile} />
              </ErrorBoundary>
            </div>

            <QuickActions />

            <ErrorBoundary>
              <Suspense fallback={<div className="glass-card p-6 h-48 animate-pulse bg-slate-200/50 mb-8"></div>}>
                <ListingsSection listings={listings} isLoading={isOverviewLoading} />
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
              <Suspense fallback={<NewsSkeleton />}>
                <NewsSection profile={profile} />
              </Suspense>
            </ErrorBoundary>

            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <ErrorBoundary>
                <Suspense fallback={<div className="glass-card p-6 h-32 animate-pulse bg-slate-200/50"></div>}>
                  <AIChatsSection profileData={profile} />
                </Suspense>
              </ErrorBoundary>

              <ErrorBoundary>
                <Suspense fallback={<div className="glass-card p-6 h-32 animate-pulse bg-slate-200/50"></div>}>
                  <DiagnosesSection />
                </Suspense>
              </ErrorBoundary>
            </div>
            
          </>
        ) : null}

        <h2 className="font-display text-2xl font-bold text-heading mb-6">Marketplace Activities</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {user?.user_type === 'farmer' ? (
            <>
              <StatCard title="Total Listings" value={stats?.totalListings || 0} icon={Package} color="blue" delay={0} />
              <StatCard title="Active Listings" value={stats?.activeListings || 0} icon={TrendingUp} color="green" delay={1} />
              <StatCard title="Sold Listings" value={stats?.soldListings || 0} icon={CheckCircle} color="amber" delay={2} />
              <StatCard title="Total Deals" value={stats?.totalDeals || 0} icon={Tag} color="purple" delay={3} />
            </>
          ) : (
            <>
              <StatCard title="Bids Placed" value={stats?.totalBidsPlaced || 0} icon={Tag} color="blue" delay={0} />
              <StatCard title="Accepted Purchases" value={stats?.acceptedPurchases || 0} icon={CheckCircle} color="green" delay={1} />
            </>
          )}
        </div>

        {isFarmer ? (
          <ErrorBoundary>
            <Suspense fallback={<div className="glass-card p-6 h-48 animate-pulse bg-slate-200/50 mb-8"></div>}>
              <OrdersSection orders={orders} isLoading={isOverviewLoading} />
            </Suspense>
          </ErrorBoundary>
        ) : (
          /* Buyer Dashboard View: My Bids */
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="font-display text-xl font-bold text-heading mb-4">My Placed Bids</h2>
              {!stats?.myBids || stats.myBids.length === 0 ? (
                <div className="glass-card p-8 text-center text-slate-500">You haven't placed any bids yet.</div>
              ) : (
                <div className="space-y-4">
                  {stats.myBids.map(bid => (
                    <div key={bid.id} className="glass-card p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-l-4 border-l-primary">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-lg text-heading">{bid.crop_listings?.crop_name || 'Unknown Crop'}</h3>
                          <span className={`badge ${bid.crop_listings?.status === 'SOLD' ? 'badge-success' : 'bg-blue-100 text-blue-700'}`}>
                            {bid.crop_listings?.status || 'UNKNOWN'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">Expected Price: ₹{bid.crop_listings?.expected_price}/Qtl</p>
                      </div>
                      <div className="text-left sm:text-right bg-primary/5 px-4 py-2 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">Your Bid Amount</p>
                        <p className="font-bold text-xl text-primary">₹{bid.bid_price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default Dashboard;
