export default function TermsOfServicePage() {
  return (
    <main style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '32px 20px',
      color: 'var(--text-primary)'
    }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>Terms of Service</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
        By using VERA, you agree to these Terms. If you do not agree, please do not use the service.
      </p>

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>Use of Service</h2>
      <ul style={{ color: 'var(--text-secondary)', marginLeft: '18px', listStyle: 'disc' }}>
        <li>You must be at least 13 years old or the age of digital consent in your region.</li>
        <li>Do not use the service for unlawful, harmful, or abusive purposes.</li>
        <li>We may update features, restrict access, or discontinue parts of the service at our discretion.</li>
      </ul>

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>Accounts and Subscriptions</h2>
      <ul style={{ color: 'var(--text-secondary)', marginLeft: '18px', listStyle: 'disc' }}>
        <li>You are responsible for maintaining the confidentiality of your account.</li>
        <li>Paid plans are billed via our payment processor (e.g., Stripe). Pricing and features are listed in-app.</li>
        <li>Cancellation takes effect at the end of the current billing period. Refunds are handled per our policy and applicable law.</li>
      </ul>

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>AI and Content</h2>
      <ul style={{ color: 'var(--text-secondary)', marginLeft: '18px', listStyle: 'disc' }}>
        <li>AI-generated content may be inaccurate or incomplete. Use discretion and seek professional advice when needed.</li>
        <li>You retain rights to your content; you grant us a license to process it to provide the service.</li>
        <li>Do not upload content that infringes the rights of others or violates law.</li>
      </ul>

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>Disclaimers and Limitation of Liability</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
        The service is provided "as is" without warranties of any kind. To the fullest extent permitted by law, we disclaim
        all implied warranties and shall not be liable for indirect, incidental, special, consequential, or punitive damages.
      </p>

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>Changes to Terms</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
        We may update these Terms from time to time. Continued use after changes take effect constitutes acceptance.
      </p>

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>Contact</h2>
      <p style={{ color: 'var(--text-secondary)' }}>
        Questions? Contact us at support@veraneural.com.
      </p>

      <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginTop: '28px' }}>
        These Terms are provided as general information and should be reviewed by legal counsel for your specific needs.
      </p>
    </main>
  );
}
