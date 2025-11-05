const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dscuttqnroyqigunymxh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzY3V0dHFucm95cWlndW55bXhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjMwMTg4NiwiZXhwIjoyMDc3ODc3ODg2fQ.fY0P_J345yd0cWHFtZpF22XHh18O9AUv_xYrFarjIcU'
);

async function checkTrial() {
  console.log('🔍 Checking trial data...\n');

  const { data: users, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    console.error('Error:', error);
    return;
  }

  users.forEach(user => {
    console.log('📧 User:', user.email);
    console.log('📅 Trial Start:', user.trial_start);
    console.log('⏰ Trial End:', user.trial_end);
    
    const now = new Date();
    const trialEnd = new Date(user.trial_end);
    const hoursRemaining = Math.floor((trialEnd - now) / (1000 * 60 * 60));
    
    console.log('⏳ Hours Remaining (calculated):', hoursRemaining);
    console.log('💳 Subscription Status:', user.subscription_status);
    console.log('---');
  });
}

checkTrial();
