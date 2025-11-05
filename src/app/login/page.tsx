import MagicLinkForm from '@/components/auth/MagicLinkForm';
import SocialLogin from '@/components/auth/SocialLogin';
import BreathingOrb from '@/components/orb/BreathingOrb';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6">
      {/* VERA Logo/Orb */}
      <div className="mb-8">
        <BreathingOrb size={200} />
      </div>

      {/* VERA Title */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-text-primary mb-2">
          VERA
        </h1>
        <p className="text-text-secondary">
          Your nervous system co-regulator
        </p>
      </div>

  {/* Social Login */}
  <SocialLogin />

  {/* Magic Link Form */}
      <MagicLinkForm />

      {/* Footer */}
      <div className="mt-12 text-center text-sm text-text-secondary">
        <p>No password needed. Just click the link we send you.</p>
      </div>
    </div>
  );
}
