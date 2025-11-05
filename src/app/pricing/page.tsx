// src/app/pricing/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SubscriptionManagement from '@/components/subscription/SubscriptionManagement';

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Continue your journey with VERA
          </p>
        </div>
        
        <SubscriptionManagement />
      </div>
    </div>
  );
}
