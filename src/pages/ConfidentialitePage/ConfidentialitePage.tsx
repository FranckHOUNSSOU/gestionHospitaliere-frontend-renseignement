import { useState } from 'react';
import './ConfidentialitePage.css';
import { useAuth } from '../../context/AuthContext';
import client from '../../services/clients';

const ConfidentialitePage: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm]         = useState({ nouveau: '', confirmation: '' });
  const [showNew, setShowNew]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null); setSuccess(null);
    if (!form.nouveau.trim()) {
      setError('Veuillez saisir un nouveau mot de passe.'); return;
    }
    if (form.nouveau.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.'); return;
    }
    if (form.nouveau !== form.confirmation) {
      setError('Les mots de passe ne correspondent pas.'); return;
    }
    if (!user) return;

    setLoading(true);
    try {
      await client.patch(`/auth/users/${user.id}/reset-password`, {
        nouveauMotDePasse: form.nouveau,
      });
      setSuccess('Mot de passe modifié avec succès.');
      setForm({ nouveau: '', confirmation: '' });
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Erreur lors de la modification.');
    } finally {
      setLoading(false);
    }
  };

  const p = form.nouveau;
  const strength = [
    p.length >= 8,
    /[A-Z]/.test(p),
    /[0-9]/.test(p),
    /[^A-Za-z0-9]/.test(p),
  ].filter(Boolean).length;

  const strengthColor =
    strength === 0 ? 'var(--c-bdr)' :
    strength === 1 ? 'var(--c-red)'   :
    strength === 2 ? 'var(--c-amber)' :
                     'var(--c-green)';

  const strengthLabel =
    strength === 0 ? '' :
    strength === 1 ? 'Faible' :
    strength === 2 ? 'Moyen'  :
    strength === 3 ? 'Fort'   : 'Très fort';

  const rules = [
    { ok: p.length >= 8,           label: 'Au moins 8 caractères' },
    { ok: /[A-Z]/.test(p),         label: 'Au moins une majuscule' },
    { ok: /[0-9]/.test(p),         label: 'Au moins un chiffre' },
    { ok: /[^A-Za-z0-9]/.test(p),  label: 'Au moins un caractère spécial' },
  ];

  const canSubmit = !loading && p.length >= 8 && p === form.confirmation;

  const eyeBtnStyle: React.CSSProperties = {
    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--c-t3)', display: 'flex', alignItems: 'center', padding: 2,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* En-tête page */}
      <div>
        <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--c-t0)', margin: 0 }}>Confidentialité</p>
        <p style={{ fontSize: 13, color: 'var(--c-t2)', margin: '4px 0 0' }}>
          Gérez la sécurité de votre compte
        </p>
      </div>

      <div style={{ maxWidth: 520 }}>
        <div className="adm-card" style={{ overflow: 'hidden' }}>
          <div className="adm-card-head">
            <div>
              <p className="adm-card-title">Changer le mot de passe</p>
              <p className="adm-card-sub">Le nouveau mot de passe doit contenir au moins 8 caractères</p>
            </div>
          </div>
          <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {error   && <AlertBanner type="error"   message={error}   onClose={() => setError(null)}   />}
            {success && <AlertBanner type="success" message={success} onClose={() => setSuccess(null)} />}

            {/* Nouveau mot de passe */}
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--c-t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Nouveau mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={form.nouveau}
                  onChange={e => setForm(f => ({ ...f, nouveau: e.target.value }))}
                  className="adm-input"
                  style={{ width: '100%', paddingRight: 40 }}
                />
                <button type="button" onClick={() => setShowNew(v => !v)} style={eyeBtnStyle}>
                  <EyeIcon open={showNew} />
                </button>
              </div>
              {p.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--c-surf3)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${(strength / 4) * 100}%`,
                      background: strengthColor, borderRadius: 2,
                      transition: 'width .3s, background .3s',
                    }} />
                  </div>
                  {strengthLabel && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: strengthColor, minWidth: 55, textAlign: 'right' }}>
                      {strengthLabel}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Confirmation */}
            <div>
              <label style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--c-t3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Confirmer le mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConf ? 'text' : 'password'}
                  value={form.confirmation}
                  onChange={e => setForm(f => ({ ...f, confirmation: e.target.value }))}
                  className="adm-input"
                  style={{
                    width: '100%', paddingRight: 40,
                    borderColor: form.confirmation.length > 0 && form.confirmation !== form.nouveau
                      ? 'var(--c-red)' : undefined,
                  }}
                />
                <button type="button" onClick={() => setShowConf(v => !v)} style={eyeBtnStyle}>
                  <EyeIcon open={showConf} />
                </button>
              </div>
              {form.confirmation.length > 0 && form.confirmation !== form.nouveau && (
                <p style={{ fontSize: 11, color: 'var(--c-red)', marginTop: 4 }}>
                  Les mots de passe ne correspondent pas
                </p>
              )}
            </div>

            {/* Règles */}
            <div style={{ background: 'var(--c-surf2)', border: '1px solid var(--c-bdr)', borderRadius: 8, padding: '12px 14px' }}>
              <p style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--c-t2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Exigences
              </p>
              {rules.map(r => (
                <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    background: r.ok ? 'var(--c-green)' : 'var(--c-surf3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'background .2s',
                  }}>
                    {r.ok && (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: r.ok ? 'var(--c-green)' : 'var(--c-t2)', transition: 'color .2s' }}>
                    {r.label}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="adm-btn adm-btn-primary"
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{ opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
              >
                {loading ? 'Enregistrement…' : 'Changer le mot de passe'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfidentialitePage;

// ── Sous-composants ────────────────────────────────────────────────────────────

function AlertBanner({ type, message, onClose }: {
  type: 'error' | 'success'; message: string; onClose: () => void;
}) {
  const isErr = type === 'error';
  return (
    <div className={`adm-alert ${isErr ? 'adm-alert-danger' : 'adm-alert-success'}`}
      style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {isErr
        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M20 6L9 17l-5-5"/></svg>
      }
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16, lineHeight: 1, padding: '2px 4px' }}>×</button>
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
