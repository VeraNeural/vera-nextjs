// src/components/subscription/SubscriptionManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

interface SubscriptionData {
  subscription_status: string | null;
  subscription_plan: string | null;
  subscription_current_period_end: string | null;
  trial_end: string | null;
}

export default function SubscriptionManagement() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('subscription_status, subscription_plan, subscription_current_period_end, trial_end')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setSubscription(data);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: 'monthly' | 'yearly') => {
    setActionLoading(true);
    try {
      const priceId = plan === 'monthly' 
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY 
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY;

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Upgrade failed:', err);
      alert('Failed to start upgrade process');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Failed to open portal:', err);
      alert('Failed to open billing portal');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    );
  }

  const isActive = subscription?.subscription_status === 'active';
  const isTrialing = subscription?.subscription_status === 'trialing';
  const trialEnd = subscription?.trial_end ? new Date(subscription.trial_end) : null;
  const trialExpired = trialEnd && trialEnd < new Date();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Current Status */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscription Status</h2>
        
        <div className="flex items-start gap-4">
          {isActive ? (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span className="font-semibold">Active Subscription</span>
            </div>
          ) : isTrialing && !trialExpired ? (
            <div className="flex items-center gap-2 text-blue-600">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Free Trial Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">No Active Subscription</span>
            </div>
          )}
        </div>

        {subscription?.subscription_plan && (
          <div className="mt-4 text-gray-600">
            <p className="capitalize">Plan: {subscription.subscription_plan}</p>
          </div>
        )}

        {subscription?.subscription_current_period_end && (
          <div className="mt-2 text-gray-600">
            <p>Renews: {new Date(subscription.subscription_current_period_end).toLocaleDateString()}</p>
          </div>
        )}

        {trialEnd && !trialExpired && (
          <div className="mt-2 text-gray-600">
            <p>Trial ends: {trialEnd.toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Manage Subscription</h3>
        
        {isActive ? (
          <button
            onClick={handleManageSubscription}
            disabled={actionLoading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {actionLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Manage Billing'
            )}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-purple-200 rounded-xl p-6 hover:border-purple-400 transition-colors">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Monthly</h4>
                <p className="text-3xl font-bold text-purple-600 mb-4">$12<span className="text-lg text-gray-500">/mo</span></p>
                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Unlimited conversations
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Voice & image support
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    All therapeutic modes
                  </li>
                </ul>
                <button
                  onClick={() => handleUpgrade('monthly')}
                  disabled={actionLoading}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Loading...' : 'Subscribe Monthly'}
                </button>
              </div>

              <div className="border-2 border-purple-500 rounded-xl p-6 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                  BEST VALUE
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Yearly</h4>
                <p className="text-3xl font-bold text-purple-600 mb-1">$99<span className="text-lg text-gray-500">/yr</span></p>
                <p className="text-sm text-green-600 font-semibold mb-4">Save $45/year</p>
                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Unlimited conversations
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Voice & image support
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    All therapeutic modes
                  </li>
                </ul>
                <button
                  onClick={() => handleUpgrade('yearly')}
                  disabled={actionLoading}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Loading...' : 'Subscribe Yearly'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
