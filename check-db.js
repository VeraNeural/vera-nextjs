const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dscuttqnroyqigunymxh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzY3V0dHFucm95cWlndW55bXhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjMwMTg4NiwiZXhwIjoyMDc3ODc3ODg2fQ.fY0P_J345yd0cWHFtZpF22XHh18O9AUv_xYrFarjIcU'
);

async function checkDatabase() {
  console.log('🔍 Checking database structure...\n');

  // Check users table
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  console.log('✅ Users table:', usersError ? '❌ ' + usersError.message : '✅ EXISTS');
  if (users && users.length > 0) {
    console.log('   Columns:', Object.keys(users[0]));
  }

  // Check threads table
  const { data: threads, error: threadsError } = await supabase
    .from('threads')
    .select('*')
    .limit(1);
  
  console.log('✅ Threads table:', threadsError ? '❌ ' + threadsError.message : '✅ EXISTS');
  if (threads && threads.length > 0) {
    console.log('   Columns:', Object.keys(threads[0]));
  }

  // Check messages table
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .limit(1);
  
  console.log('✅ Messages table:', messagesError ? '❌ ' + messagesError.message : '✅ EXISTS');
  if (messages && messages.length > 0) {
    console.log('   Columns:', Object.keys(messages[0]));
  }

  // Count records
  const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { count: threadCount } = await supabase.from('threads').select('*', { count: 'exact', head: true });
  const { count: messageCount } = await supabase.from('messages').select('*', { count: 'exact', head: true });

  console.log('\n📊 Record counts:');
  console.log('   Users:', userCount || 0);
  console.log('   Threads:', threadCount || 0);
  console.log('   Messages:', messageCount || 0);
}

checkDatabase().catch(console.error);
