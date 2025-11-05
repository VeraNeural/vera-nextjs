// scripts/verify-setup.js
// Run with: node scripts/verify-setup.js

const fs = require('fs');
const path = require('path');

console.log('🔍 VERA Setup Verification\n');

// Check environment variables
console.log('📋 Checking Environment Variables...');
const envPath = path.join(__dirname, '..', '.env.local');
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
  'ELEVENLABS_API_KEY',
  'ELEVENLABS_VOICE_ID',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_PRICE_MONTHLY',
  'STRIPE_PRICE_YEARLY',
  'NEXT_PUBLIC_APP_URL',
];

let envCheck = true;
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  requiredEnvVars.forEach(varName => {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=\n`)) {
      console.log(`  ✅ ${varName}`);
    } else {
      console.log(`  ❌ ${varName} - MISSING OR EMPTY`);
      envCheck = false;
    }
  });
} else {
  console.log('  ❌ .env.local file not found!');
  envCheck = false;
}

// Check audio files
console.log('\n🎵 Checking Audio Files...');
const soundsPath = path.join(__dirname, '..', 'public', 'sounds');
const requiredSounds = ['rain.mp3', 'ocean.mp3', 'forest.mp3', 'wind.mp3', 'fire.mp3', 'night.mp3'];

let audioCheck = true;
if (fs.existsSync(soundsPath)) {
  requiredSounds.forEach(sound => {
    const soundFile = path.join(soundsPath, sound);
    if (fs.existsSync(soundFile)) {
      const stats = fs.statSync(soundFile);
      console.log(`  ✅ ${sound} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    } else {
      console.log(`  ⚠️  ${sound} - NOT FOUND (optional)`);
    }
  });
} else {
  console.log('  ⚠️  public/sounds/ directory not found');
  console.log('  ℹ️  Create it and add your Freesound downloads');
  audioCheck = false;
}

// Check critical files
console.log('\n📁 Checking Critical Files...');
const criticalFiles = [
  'src/app/api/chat/route.ts',
  'src/app/api/stripe/webhook/route.ts',
  'src/app/api/stripe/create-checkout/route.ts',
  'src/app/api/stripe/portal/route.ts',
  'src/lib/stripe/config.ts',
  'src/components/trial/TrialExpiredModal.tsx',
  'src/components/subscription/SubscriptionManagement.tsx',
  'supabase-subscription-migration.sql',
];

let filesCheck = true;
criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    filesCheck = false;
  }
});

// Check package.json dependencies
console.log('\n📦 Checking Dependencies...');
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
);

const requiredDeps = [
  'stripe',
  'lucide-react',
  '@anthropic-ai/sdk',
  'openai',
  '@supabase/supabase-js',
];

let depsCheck = true;
requiredDeps.forEach(dep => {
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  if (allDeps[dep]) {
    console.log(`  ✅ ${dep} (${allDeps[dep]})`);
  } else {
    console.log(`  ❌ ${dep} - NOT INSTALLED`);
    depsCheck = false;
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION SUMMARY\n');

const allChecks = [
  { name: 'Environment Variables', pass: envCheck },
  { name: 'Audio Files', pass: audioCheck },
  { name: 'Critical Files', pass: filesCheck },
  { name: 'Dependencies', pass: depsCheck },
];

allChecks.forEach(check => {
  console.log(`${check.pass ? '✅' : '❌'} ${check.name}`);
});

const allPassed = allChecks.every(c => c.pass);

console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('🎉 ALL CHECKS PASSED! Ready to test!');
  console.log('\n📝 Next steps:');
  console.log('   1. Run database migration in Supabase SQL Editor');
  console.log('   2. Start dev server: npm run dev');
  console.log('   3. Follow TESTING-GUIDE.md');
} else {
  console.log('⚠️  SOME CHECKS FAILED');
  console.log('\n📝 Fix the issues above, then run this script again');
}
console.log('='.repeat(50) + '\n');

process.exit(allPassed ? 0 : 1);
