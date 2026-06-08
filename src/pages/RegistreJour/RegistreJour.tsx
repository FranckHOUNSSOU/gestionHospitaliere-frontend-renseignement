import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Search, BookOpen, UserPlus,
  AlertTriangle, ChevronDown, ChevronRight,
  Phone, Calendar, User, MapPin, Shield, Edit2, Trash2, X, Save,
} from 'lucide-react';
import { patientsData, type Patient } from '../../services/patients';

const AVATAR_COLORS = ['#388bfd', '#3fb950', '#7c3aed', '#d29922', '#f85149'];

const initials = (nom: string, prenom: string) =>
  `${nom[0] ?? '?'}${prenom[0] ?? ''}`.toUpperCase();

function heure(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function dateComplete(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

type TypeFilter = 'all' | 'nouveau' | 'critique';

interface EditForm {
  nom: string; prenom: string; nomJeuneFille: string;
  sexe: 'M' | 'F' | 'Autre'; dateNaissance: string;
  lieuNaissance: string; nationalite: string; langue: string;
  adresse: string; ville: string; pays: string;
  telephoneMobile: string; telephoneFixe: string; email: string;
}

export default function RegistreJour() {
  const [patients,    setPatients]    = useState<Patient[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [search,      setSearch]      = useState('');
  const [typeFilter,  setTypeFilter]  = useState<TypeFilter>('all');
  const [expanded,    setExpanded]    = useState<string | null>(null);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [editForm,    setEditForm]    = useState<EditForm>({ nom: '', prenom: '', nomJeuneFille: '', sexe: 'M', dateNaissance: '', lieuNaissance: '', nationalite: '', langue: '', adresse: '', ville: '', pays: '', telephoneMobile: '', telephoneFixe: '', email: '' });
  const [editSaving,  setEditSaving]  = useState(false);
  const [editErr,     setEditErr]     = useState<string | null>(null);
  const [deleteId,    setDeleteId]    = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await patientsData.fetchPatientsToday();
      setPatients(data);
      setLastRefresh(new Date());
    } catch {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [load]);

  const total = patients.length;

  /* ── Filtres ────────────────────────────────────────────────── */
  const filtered = patients.filter(p => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || `${p.nom} ${p.prenom} ${p.numeroIpp}`.toLowerCase().includes(q);
    const isCritique  = p.numeroIpp.startsWith('IPP-PROV');
    const matchType   =
      typeFilter === 'all' ||
      (typeFilter === 'critique' &&  isCritique) ||
      (typeFilter === 'nouveau'  && !isCritique);
    return matchSearch && matchType;
  });

  /* ── Actions ─────────────────────────────────────────────────── */
  function openEdit(p: Patient) {
    setEditPatient(p);
    setEditForm({
      nom: p.nom, prenom: p.prenom, nomJeuneFille: p.nomJeuneFille ?? '',
      sexe: p.sexe, dateNaissance: p.dateNaissance?.slice(0, 10) ?? '',
      lieuNaissance: p.lieuNaissance ?? '', nationalite: p.nationalite ?? '', langue: p.langue ?? '',
      adresse: p.adresse ?? '', ville: p.ville ?? '', pays: p.pays ?? '',
      telephoneMobile: p.telephoneMobile ?? '', telephoneFixe: p.telephoneFixe ?? '', email: p.email ?? '',
    });
    setEditErr(null);
  }

  async function handleSaveEdit() {
    if (!editPatient) return;
    if (!editForm.nom.trim() || !editForm.prenom.trim()) { setEditErr('Nom et prénom sont obligatoires.'); return; }
    setEditSaving(true); setEditErr(null);
    try {
      const updated = await patientsData.modifier(editPatient.id, {
        nom:            editForm.nom.trim(),
        prenom:         editForm.prenom.trim(),
        nomJeuneFille:  editForm.nomJeuneFille.trim()  || undefined,
        sexe:           editForm.sexe,
        dateNaissance:  editForm.dateNaissance         || undefined,
        lieuNaissance:  editForm.lieuNaissance.trim()  || undefined,
        nationalite:    editForm.nationalite.trim()    || undefined,
        langue:         editForm.langue.trim()         || undefined,
        adresse:        editForm.adresse.trim()        || undefined,
        ville:          editForm.ville.trim()          || undefined,
        pays:           editForm.pays.trim()           || undefined,
        telephoneMobile:editForm.telephoneMobile.trim()|| undefined,
        telephoneFixe:  editForm.telephoneFixe.trim()  || undefined,
        email:          editForm.email.trim()          || undefined,
      } as any);
      setPatients(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
      setEditPatient(null);
    } catch (e: any) { setEditErr(e?.message ?? 'Erreur lors de la modification.'); }
    finally { setEditSaving(false); }
  }

  async function handleDelete(id: string) {
    setDeleteLoading(true);
    try {
      await patientsData.supprimer(id);
      setPatients(prev => prev.filter(p => p.id !== id));
      setDeleteId(null);
    } catch (e: any) {
      alert(e?.message ?? 'Impossible de supprimer ce patient.');
    } finally { setDeleteLoading(false); }
  }

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--c-t0)', margin: 0 }}>
            Registre du jour
          </p>
          <p style={{ fontSize: 13, color: 'var(--c-t2)', margin: '4px 0 0' }}>
            {dateComplete(new Date().toISOString())}
            {' · '}
            <span style={{ color: 'var(--c-t3)' }}>
              Actualisé à {heure(lastRefresh.toISOString())}
            </span>
          </p>
        </div>
        <button
          className="adm-btn"
          onClick={load}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw
            size={13}
            style={{ animation: loading ? 'spin 0.7s linear infinite' : undefined }}
          />
          Actualiser
        </button>
      </div>

      {/* Tableau */}
      <div className="adm-card">

        {/* Filtres */}
        <div className="adm-card-head" style={{ gap: 10, flexWrap: 'wrap' }}>
          <div className="adm-search" style={{ flex: 1, minWidth: 200 }}>
            <span className="adm-search-icon"><Search size={13} /></span>
            <input
              className="adm-search-input"
              placeholder="Nom, prénom ou IPP…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="adm-view-toggle">
            {(['all', 'nouveau', 'critique'] as const).map(t => (
              <button
                key={t}
                className={`adm-view-btn${typeFilter === t ? ' active' : ''}`}
                onClick={() => setTypeFilter(t)}
              >
                {t === 'all' ? 'Tous' : t === 'nouveau' ? 'Nouveaux' : 'Critiques'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 64 }}>Heure</th>
                <th>Patient</th>
                <th>IPP</th>
                <th>Type</th>
                <th>Profil</th>
                <th>Enregistré par</th>
                <th style={{ width: 32 }} />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--c-t3)' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', margin: '0 auto 12px',
                      border: '3px solid var(--c-bdr)', borderTopColor: 'var(--c-accent)',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Chargement…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 12, background: 'var(--c-surf2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 14px',
                    }}>
                      <BookOpen size={24} color="var(--c-t3)" />
                    </div>
                    <p style={{ fontWeight: 600, color: 'var(--c-t1)', marginBottom: 4 }}>
                      {total === 0 ? 'Aucun patient enregistré aujourd\'hui' : 'Aucun résultat pour ce filtre'}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--c-t3)' }}>
                      {total === 0
                        ? 'Les patients accueillis apparaîtront ici en temps réel'
                        : 'Modifiez les filtres pour afficher d\'autres entrées'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => {
                  const isCritique = p.numeroIpp.startsWith('IPP-PROV');
                  const isExpanded = expanded === p.id;
                  return (
                    <React.Fragment key={p.id}>
                      <tr
                        onClick={() => setExpanded(isExpanded ? null : p.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Heure */}
                        <td>
                          <span className="adm-cell-mono" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--c-t0)' }}>
                            {heure(p.createdAt)}
                          </span>
                        </td>

                        {/* Patient */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                              background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 700, color: '#fff',
                            }}>
                              {initials(p.nom, p.prenom)}
                            </div>
                            <div>
                              <p className="adm-cell-name" style={{ marginBottom: 0 }}>
                                {p.nom} {p.prenom}
                              </p>
                              {p.dateNaissance && (
                                <p className="adm-cell-mono" style={{ fontSize: 10.5, color: 'var(--c-t3)', marginTop: 2 }}>
                                  {new Date(p.dateNaissance).toLocaleDateString('fr-FR')}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* IPP */}
                        <td>
                          <span
                            className={`adm-tag ${isCritique ? 'adm-t-red' : 'adm-t-blue'}`}
                            style={{ fontSize: 10.5, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.3px' }}
                          >
                            {p.numeroIpp}
                          </span>
                        </td>

                        {/* Type */}
                        <td>
                          {isCritique ? (
                            <span className="adm-tag adm-t-red" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <AlertTriangle size={10} /> Critique
                            </span>
                          ) : (
                            <span className="adm-tag adm-t-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <UserPlus size={10} /> Nouveau
                            </span>
                          )}
                        </td>

                        {/* Statut profil */}
                        <td>
                          <span className={`adm-tag ${p.statutProfil === 'Complet' ? 'adm-t-green' : 'adm-t-amber'}`}>
                            {p.statutProfil}
                          </span>
                        </td>

                        {/* Enregistré par */}
                        <td>
                          <span style={{ fontSize: 12, color: 'var(--c-t2)' }}>
                            {p.creePar ? `${p.creePar.prenom} ${p.creePar.nom}` : '—'}
                          </span>
                        </td>

                        {/* Expand */}
                        <td style={{ textAlign: 'center' }}>
                          {isExpanded
                            ? <ChevronDown size={14} color="var(--c-t3)" />
                            : <ChevronRight size={14} color="var(--c-t3)" />
                          }
                        </td>
                      </tr>

                      {/* Ligne détail dépliable */}
                      {isExpanded && (
                        <tr style={{ background: 'var(--c-surf2)' }}>
                          <td colSpan={7} style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 12 }}>
                              {p.telephoneMobile && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--c-t1)' }}>
                                  <Phone size={12} color="var(--c-t3)" />
                                  {p.telephoneMobile}
                                </span>
                              )}
                              {p.dateNaissance && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--c-t1)' }}>
                                  <Calendar size={12} color="var(--c-t3)" />
                                  Né(e) le {new Date(p.dateNaissance).toLocaleDateString('fr-FR')}
                                </span>
                              )}
                              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--c-t1)' }}>
                                <User size={12} color="var(--c-t3)" />
                                {p.sexe === 'M' ? 'Masculin' : p.sexe === 'F' ? 'Féminin' : 'Autre'}
                              </span>
                              {p.adresse && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--c-t1)' }}>
                                  <MapPin size={12} color="var(--c-t3)" />
                                  {p.adresse}
                                </span>
                              )}
                              {p.contactsUrgence.length > 0 && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--c-t1)' }}>
                                  <Shield size={12} color="var(--c-t3)" />
                                  Urgence : {p.contactsUrgence[0].prenom} {p.contactsUrgence[0].nom}
                                  {' · '}{p.contactsUrgence[0].telephone}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                              <button
                                onClick={e => { e.stopPropagation(); openEdit(p); }}
                                className="adm-btn"
                                style={{ height: 30, fontSize: 11, gap: 5 }}
                              >
                                <Edit2 size={12} /> Modifier
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); setDeleteId(p.id); }}
                                className="adm-btn"
                                style={{ height: 30, fontSize: 11, gap: 5, color: '#dc2626', borderColor: '#dc2626' }}
                              >
                                <Trash2 size={12} /> Supprimer
                              </button>
                            </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pied de tableau */}
        {!loading && filtered.length > 0 && (
          <div style={{
            padding: '10px 16px', borderTop: '1px solid var(--c-bdr)',
            fontSize: 11, color: 'var(--c-t3)', textAlign: 'right',
          }}>
            {filtered.length} entrée{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
            {filtered.length !== total && ` · ${total} au total aujourd'hui`}
          </div>
        )}
      </div>

      {/* Modal édition */}
      {editPatient && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setEditPatient(null); }}>
          <div style={{ background: 'var(--c-bg)', borderRadius: 12, width: '100%', maxWidth: 520, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--c-bdr)' }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>Modifier le dossier</p>
              <button onClick={() => setEditPatient(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: '65vh' }}>
              {editErr && <div style={{ fontSize: 12, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px' }}>{editErr}</div>}

              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--c-t3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Identité</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="adm-form-field">
                  <label className="adm-label">Nom *</label>
                  <input className="adm-input" value={editForm.nom} onChange={e => setEditForm(f => ({ ...f, nom: e.target.value }))} />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Prénom *</label>
                  <input className="adm-input" value={editForm.prenom} onChange={e => setEditForm(f => ({ ...f, prenom: e.target.value }))} />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Nom de jeune fille</label>
                  <input className="adm-input" value={editForm.nomJeuneFille} onChange={e => setEditForm(f => ({ ...f, nomJeuneFille: e.target.value }))} />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Sexe</label>
                  <select className="adm-input" value={editForm.sexe} onChange={e => setEditForm(f => ({ ...f, sexe: e.target.value as 'M' | 'F' | 'Autre' }))}>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Date de naissance</label>
                  <input type="date" className="adm-input" value={editForm.dateNaissance} onChange={e => setEditForm(f => ({ ...f, dateNaissance: e.target.value }))} />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Lieu de naissance</label>
                  <input className="adm-input" value={editForm.lieuNaissance} onChange={e => setEditForm(f => ({ ...f, lieuNaissance: e.target.value }))} />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Nationalité</label>
                  <input className="adm-input" value={editForm.nationalite} onChange={e => setEditForm(f => ({ ...f, nationalite: e.target.value }))} />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Langue</label>
                  <input className="adm-input" value={editForm.langue} onChange={e => setEditForm(f => ({ ...f, langue: e.target.value }))} />
                </div>
              </div>

              <p style={{ margin: '4px 0 0', fontSize: 11, fontWeight: 700, color: 'var(--c-t3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Coordonnées</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="adm-form-field" style={{ gridColumn: '1 / -1' }}>
                  <label className="adm-label">Adresse</label>
                  <input className="adm-input" value={editForm.adresse} onChange={e => setEditForm(f => ({ ...f, adresse: e.target.value }))} />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Ville</label>
                  <input className="adm-input" value={editForm.ville} onChange={e => setEditForm(f => ({ ...f, ville: e.target.value }))} />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Pays</label>
                  <input className="adm-input" value={editForm.pays} onChange={e => setEditForm(f => ({ ...f, pays: e.target.value }))} />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Téléphone mobile</label>
                  <input className="adm-input" placeholder="+229 97…" value={editForm.telephoneMobile} onChange={e => setEditForm(f => ({ ...f, telephoneMobile: e.target.value }))} />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Téléphone fixe</label>
                  <input className="adm-input" placeholder="+229 21…" value={editForm.telephoneFixe} onChange={e => setEditForm(f => ({ ...f, telephoneFixe: e.target.value }))} />
                </div>
                <div className="adm-form-field" style={{ gridColumn: '1 / -1' }}>
                  <label className="adm-label">Email</label>
                  <input className="adm-input" type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '12px 20px', borderTop: '1px solid var(--c-bdr)' }}>
              <button onClick={() => setEditPatient(null)} className="adm-btn" style={{ height: 34 }}>Annuler</button>
              <button onClick={handleSaveEdit} disabled={editSaving} className="adm-btn adm-btn-primary" style={{ height: 34, gap: 6 }}>
                <Save size={13} /> {editSaving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', padding: 16 }}>
          <div style={{ background: 'var(--c-bg)', borderRadius: 12, width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', padding: 24 }}>
            <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 15 }}>Confirmer la suppression</p>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--c-t2)' }}>
              Ce dossier sera définitivement supprimé. Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteId(null)} className="adm-btn" style={{ height: 34 }}>Annuler</button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleteLoading}
                style={{ height: 34, padding: '0 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Trash2 size={13} /> {deleteLoading ? 'Suppression…' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
