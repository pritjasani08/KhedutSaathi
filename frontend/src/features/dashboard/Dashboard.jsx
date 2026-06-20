import React, { Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDashboardOverview } from './hooks/useDashboardQueries';
import { DashboardSkeleton, NewsSkeleton } from './skeletons/Skeletons';
import { ErrorBoundary } from './components/ErrorBoundary';

import { 
  WelcomeHeader, 
  FarmSummaryCard, 
  ProfileCompletionCard,
  WeatherCard,
  MarketCard,
  SchemesCard
} from './components/DashboardCards';

// Lazy loaded sections
const NewsSection = React.lazy(() => import('./components/Sections').then(module => ({ default: module.NewsSection })));
const AIChatsSection = React.lazy(() => import('./components/Sections').then(module => ({ default: module.AIChatsSection })));
const DiagnosesSection = React.lazy(() => import('./components/Sections').then(module => ({ default: module.DiagnosesSection })));
const ListingsSection = React.lazy(() => import('./components/Sections').then(module => ({ default: module.ListingsSection })));
const OrdersSection = React.lazy(() => import('./components/Sections').then(module => ({ default: module.OrdersSection })));

const Dashboard = () => {
  const { user } = useAuth();
  
  // 1. Fetch Group A (Profile, Stats, Listings, Orders) in one request!
  const { data: overview, isLoading: isOverviewLoading, error: overviewError } = useDashboardOverview();

  // Handle global loading state (Only if we don't even have initial overview data)
  if (isOverviewLoading && !overview) {
    return <DashboardSkeleton />;
  }

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
              <FarmSummaryCard profile={profile} />
              <ProfileCompletionCard completionPercentage={completionPercentage} />
            </div>

            {/* Group B UI (Progressive parallel fetch triggered inside components via React Query) */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <ErrorBoundary>
                <WeatherCard profile={profile} />
              </ErrorBoundary>
              
              <ErrorBoundary>
                <MarketCard profile={profile} />
              </ErrorBoundary>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <ErrorBoundary>
                <SchemesCard profile={profile} />
              </ErrorBoundary>
              
              <ErrorBoundary>
                <Suspense fallback={<div className="glass-card p-6 h-32 animate-pulse bg-slate-200/50"></div>}>
                  <AIChatsSection profileData={profile} />
                </Suspense>
              </ErrorBoundary>
            </div>

            {/* Below The Fold UI */}
            <ErrorBoundary>
              <Suspense fallback={<div className="glass-card p-6 h-48 animate-pulse bg-slate-200/50 mb-8"></div>}>
                <ListingsSection listings={listings} />
              </Suspense>
            </ErrorBoundary>
            
            <ErrorBoundary>
              <Suspense fallback={<div className="glass-card p-6 h-48 animate-pulse bg-slate-200/50 mb-8"></div>}>
                <OrdersSection orders={orders} />
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
              <Suspense fallback={<NewsSkeleton />}>
                <NewsSection profile={profile} />
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary>
              <Suspense fallback={<div className="glass-card p-6 h-32 animate-pulse bg-slate-200/50"></div>}>
                <DiagnosesSection />
              </Suspense>
            </ErrorBoundary>
          </>
        ) : (
          /* Buyer Dashboard View */
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6 text-center border-primary-100">
                <p className="text-sm font-medium text-slate-500 mb-1">Total Bids Placed</p>
                <p className="text-4xl font-display font-bold text-primary">{stats?.totalBidsPlaced || 0}</p>
              </div>
              <div className="glass-card p-6 text-center border-green-100">
                <p className="text-sm font-medium text-slate-500 mb-1">Accepted Purchases</p>
                <p className="text-4xl font-display font-bold text-green-600">{stats?.acceptedPurchases || 0}</p>
              </div>
            </div>
            
            <ErrorBoundary>
              <Suspense fallback={<div className="glass-card p-6 h-48 animate-pulse bg-slate-200/50"></div>}>
                <OrdersSection orders={orders} />
              </Suspense>
            </ErrorBoundary>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default Dashboard;
