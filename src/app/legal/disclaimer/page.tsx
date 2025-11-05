export default function DisclaimerPage() {
  return (
    <main style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '32px 20px',
      color: 'var(--text-primary)'
    }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>Disclaimer</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
        VERA is an AI assistant designed to support nervous system co-regulation and emotional wellbeing.
        VERA is not a medical device, does not diagnose conditions, and is not a substitute for professional
        mental health care, therapy, or medical advice.
      </p>

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>No Medical or Therapeutic Advice</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
        Content provided by VERA is for informational and support purposes only. Always seek the advice of
        your physician, licensed mental health professional, or other qualified provider with any questions
        you may have regarding a medical condition or mental health concern.
      </p>

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>Crisis Situations</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
        If you are in crisis, in danger, or thinking about harming yourself or others, call your local emergency
        number (e.g., 911 in the U.S.) or the <strong>988 Suicide & Crisis Lifeline</strong> right now. You can also text
        <strong> HOME</strong> to <strong>741741</strong> (U.S.). VERA is not suitable for emergency or crisis support.
      </p>

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginTop: '24px', marginBottom: '8px' }}>Limitations</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
        As an AI system, VERA may generate incorrect or incomplete information. Do not rely on VERA for decisions
        that could result in injury, harm, or significant adverse outcomes. Use your judgment and consult
        qualified professionals when needed.
      </p>

      <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginTop: '28px' }}>
        This page is provided for general information only and does not constitute legal advice.
      </p>
    </main>
  );
}
