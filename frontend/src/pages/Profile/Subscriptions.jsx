import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Shield, Star, Crown, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PLANS = [
  {
    id: 'free',
    name: 'Free Plan',
    description: 'Perfect for farmers who want to explore KhedutSaathi before upgrading.',
    price: '₹0',
    duration: '/ Lifetime',
    badge: 'Best for New Farmers',
    badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    buttonText: 'Current Plan',
    buttonVariant: 'btn-secondary opacity-70 cursor-default',
    features: [
      'Limited Crop Disease Predictions',
      'Limited Crop Recommendations',
      'Limited Yield Predictions',
      'Limited Khedut AI queries',
      'Limited Government Scheme searches',
      'Limited Weather & Mandi Prices',
      'Basic Farmer Dashboard features',
      'Limited access to smart farming tools',
    ]
  },
  {
    id: 'monthly',
    name: 'KhedutSaathi Pro (Monthly)',
    description: 'Unlock unlimited access to all AI and premium smart farming tools.',
    price: '₹99',
    duration: '/ Month',
    badge: 'Most Popular',
    badgeColor: 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300',
    highlighted: true,
    buttonText: 'Upgrade Now',
    buttonVariant: 'btn-primary shadow-lg shadow-primary/20 hover:-translate-y-0.5',
    features: [
      'Unlimited Crop Disease Detection',
      'Unlimited Crop Recommendation',
      'Unlimited Yield Prediction',
      'Unlimited Khedut AI usage',
      'Unlimited Government Scheme access',
      'Unlimited Live Mandi Prices',
      'Unlimited Weather Intelligence',
      'Full Smart Irrigation support',
      'Access to Crop Insurance Assistant',
      'Full Farmer Dashboard access',
      'Priority feature access'
    ]
  },
  {
    id: 'yearly',
    name: 'KhedutSaathi Pro (Yearly)',
    description: 'Get all the benefits of Pro with our best value pricing for long-term farming.',
    price: '₹999',
    duration: '/ Year',
    badge: 'Best Value',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    highlighted: true,
    savings: 'You save ₹189 per year',
    buttonText: 'Get Best Deal',
    buttonVariant: 'bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-3 px-6 font-bold shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 transition-all',
    features: [
      'Everything in Monthly Plan',
      'Priority access to future premium features',
      'Best value for dedicated farmers',
      'Guaranteed price lock for 12 months'
    ]
  }
];

const COMPARISON_FEATURES = [
  { name: 'Crop Disease Detection', free: 'Limited', monthly: 'Unlimited', yearly: 'Unlimited' },
  { name: 'Crop Recommendation', free: 'Limited', monthly: 'Unlimited', yearly: 'Unlimited' },
  { name: 'Yield Prediction', free: 'Limited', monthly: 'Unlimited', yearly: 'Unlimited' },
  { name: 'Khedut AI', free: 'Limited', monthly: 'Unlimited', yearly: 'Unlimited' },
  { name: 'Live Mandi Prices', free: 'Limited', monthly: 'Unlimited', yearly: 'Unlimited' },
  { name: 'Government Schemes', free: 'Limited', monthly: 'Unlimited', yearly: 'Unlimited' },
  { name: 'Weather Intelligence', free: 'Limited', monthly: 'Unlimited', yearly: 'Unlimited' },
  { name: 'Smart Irrigation', free: false, monthly: true, yearly: true },
  { name: 'Crop Insurance Assistant', free: false, monthly: true, yearly: true },
  { name: 'Premium Features', free: false, monthly: true, yearly: true },
];

export default function Subscriptions() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen gradient-bg pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-light text-sm font-semibold rounded-full mb-4">
              <Crown className="w-4 h-4" />
              KhedutSaathi Premium
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-heading mb-6">
              Upgrade Your Farming Journey
            </h1>
            <p className="text-body text-lg opacity-80">
              Choose a plan that fits your needs. Access powerful AI tools, smart irrigation, and priority support to maximize your yield and profits.
            </p>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 max-w-6xl mx-auto">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`glass-card relative flex flex-col p-8 rounded-3xl ${
                plan.highlighted 
                  ? 'border-primary dark:border-primary-500/50 shadow-xl shadow-primary/10' 
                  : 'border-subtle'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${plan.badgeColor}`}>
                    {plan.badge}
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-display font-bold text-heading mb-2">{plan.name}</h3>
                <p className="text-sm text-body opacity-80 h-10">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-display font-bold text-heading">{plan.price}</span>
                  <span className="text-body font-medium mb-1">{plan.duration}</span>
                </div>
                {plan.savings && (
                  <p className="text-green-600 dark:text-green-400 text-sm font-semibold">{plan.savings}</p>
                )}
              </div>

              <div className="flex-1 mb-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm text-heading">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className={`w-full ${plan.buttonVariant}`}>
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-5xl mx-auto mb-20"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-heading mb-4">Compare Plans</h2>
            <p className="text-body">See exactly what is included in every tier.</p>
          </div>
          
          <div className="glass-card overflow-hidden rounded-3xl border border-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-surface-muted/50 border-b border-subtle">
                    <th className="p-6 text-sm font-bold text-heading uppercase tracking-wider w-2/5">Feature</th>
                    <th className="p-6 text-sm font-bold text-heading text-center uppercase tracking-wider w-1/5">Free</th>
                    <th className="p-6 text-sm font-bold text-primary text-center uppercase tracking-wider w-1/5">Monthly</th>
                    <th className="p-6 text-sm font-bold text-amber-600 dark:text-amber-500 text-center uppercase tracking-wider w-1/5">Yearly</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle">
                  {COMPARISON_FEATURES.map((feature, idx) => (
                    <tr key={idx} className="hover:bg-surface-muted/30 transition-colors">
                      <td className="p-5 text-sm font-semibold text-heading">{feature.name}</td>
                      
                      <td className="p-5 text-center">
                        {typeof feature.free === 'boolean' ? (
                          feature.free ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-slate-300 dark:text-slate-600 mx-auto" />
                        ) : (
                          <span className="text-sm text-slate-500 font-medium">{feature.free}</span>
                        )}
                      </td>
                      
                      <td className="p-5 text-center bg-primary-50/30 dark:bg-primary-900/10">
                        {typeof feature.monthly === 'boolean' ? (
                          feature.monthly ? <Check className="w-5 h-5 text-primary mx-auto" /> : <X className="w-5 h-5 text-slate-300 dark:text-slate-600 mx-auto" />
                        ) : (
                          <span className="text-sm text-primary font-bold">{feature.monthly}</span>
                        )}
                      </td>

                      <td className="p-5 text-center bg-amber-50/50 dark:bg-amber-900/10">
                        {typeof feature.yearly === 'boolean' ? (
                          feature.yearly ? <Check className="w-5 h-5 text-amber-500 mx-auto" /> : <X className="w-5 h-5 text-slate-300 dark:text-slate-600 mx-auto" />
                        ) : (
                          <span className="text-sm text-amber-600 dark:text-amber-500 font-bold">{feature.yearly}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Marketplace Commission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass-card border border-subtle rounded-3xl p-8 md:p-12 bg-gradient-to-br from-surface to-surface-muted/50">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="shrink-0 w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                <Shield className="w-10 h-10" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-display font-bold text-heading mb-3">Marketplace Commission Policy</h3>
                <p className="text-body mb-6">
                  KhedutSaathi charges a small platform commission to maintain and improve marketplace services. Total marketplace charges are transparently displayed during all transactions.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-surface rounded-2xl p-5 border border-subtle shadow-sm">
                    <p className="text-sm font-bold text-heading uppercase tracking-wider mb-2">Seller Commission</p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-primary">2.5%</span>
                      <p className="text-xs text-body leading-tight">platform commission is charged when a seller successfully sells products.</p>
                    </div>
                  </div>
                  <div className="bg-surface rounded-2xl p-5 border border-subtle shadow-sm">
                    <p className="text-sm font-bold text-heading uppercase tracking-wider mb-2">Buyer Commission</p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-primary">2.5%</span>
                      <p className="text-xs text-body leading-tight">platform commission is charged when a buyer successfully purchases products.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-xl text-sm">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Example Transaction:</p>
                    <p>If produce is sold for ₹1000, the commission for the seller is ₹25, and the commission for the buyer is ₹25.</p>
                    <p className="mt-2 font-medium opacity-80">KhedutSaathi follows transparent pricing with no hidden charges.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
