export default function PrivacyPolicyPage() {
  return (
    <main style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '32px 20px',
      color: 'var(--text-primary)'
    }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Your privacy matters. This policy explains what information we collect, how we use it, and the choices you have.
      </p>

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>Information We Collect</h2>
      <ul style={{ color: 'var(--text-secondary)', marginLeft: '18px', listStyle: 'disc' }}>
        <li>Account data (e.g., email) to authenticate you.</li>
        <li>Usage data (e.g., timestamps, device/browser info) to improve reliability and performance.</li>
        <li>Conversation content you share to provide the service features you request.</li>
        <li>Billing details handled by our payment processor (e.g., Stripe) for subscriptions.</li>
      </ul>

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>How We Use Information</h2>
      <ul style={{ color: 'var(--text-secondary)', marginLeft: '18px', listStyle: 'disc' }}>
        <li>To operate and improve the app, including quality, safety, and feature development.</li>
        <li>To provide AI-assisted experiences (we may send content to model providers to generate responses).</li>
        <li>To manage subscriptions, payments, and customer support.</li>
        <li>To detect abuse, secure accounts, and comply with legal obligations.</li>
      </ul>

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>Sharing and Processors</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
        We use trusted service providers to deliver the app, such as hosting, databases, payment processing, and AI models.
        These may include (for example) Vercel, Supabase, Stripe, OpenAI, and Anthropic. We share only what’s necessary for
        the service to function, under appropriate agreements.
      </p>

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>Your Choices</h2>
      <ul style={{ color: 'var(--text-secondary)', marginLeft: '18px', listStyle: 'disc' }}>
        <li>Access, update, or delete your data where applicable by contacting support.</li>
        <li>Export your data upon request, where feasible.</li>
        <li>Adjust settings or stop using the service at any time.</li>
      </ul>

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>Data Retention</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
        We retain information as long as necessary to provide the service and for legitimate business purposes. Conversation
        data may be stored to improve continuity and user experience, unless you request deletion where supported.
      </p>

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>Contact</h2>
      <p style={{ color: 'var(--text-secondary)' }}>
        Questions or requests? Contact us at support@veraneural.com.
      </p>

      <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginTop: '28px' }}>
        This policy is provided for general information and may be updated over time. This is not legal advice.
      </p>
    </main>
  );
}
