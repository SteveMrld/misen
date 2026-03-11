export default function MaintenancePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#080B14',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      padding: '40px 24px',
      textAlign: 'center',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 32 }}>
        <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: '0.15em', color: '#C56A2D' }}>MISEN</span>
      </div>

      {/* Icône */}
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        background: 'rgba(197,106,45,0.1)',
        border: '1px solid rgba(197,106,45,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, marginBottom: 32,
      }}>
        🎬
      </div>

      {/* Titre */}
      <h1 style={{
        fontSize: 24, fontWeight: 800, color: '#FFFFFF',
        marginBottom: 12, letterSpacing: '-0.02em',
      }}>
        Nouvelle version en cours
      </h1>

      {/* Sous-titre */}
      <p style={{
        fontSize: 14, color: '#64748B', maxWidth: 360,
        lineHeight: 1.6, marginBottom: 40,
      }}>
        MISEN est en cours de mise à jour.<br />
        La plateforme sera de nouveau disponible très prochainement.
      </p>

      {/* Badge statut */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 16px', borderRadius: 100,
        background: 'rgba(108,77,255,0.08)',
        border: '1px solid rgba(108,77,255,0.15)',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#6C4DFF',
          boxShadow: '0 0 8px rgba(108,77,255,0.6)',
          display: 'inline-block',
          animation: 'pulse 2s infinite',
        }} />
        <span style={{ fontSize: 12, color: '#8B6FFF', fontWeight: 600 }}>
          Mise à jour en cours…
        </span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
