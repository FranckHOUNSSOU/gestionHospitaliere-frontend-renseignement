import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Search, BookOpen, UserPlus,
  AlertTriangle, ChevronDown, ChevronRight,
  Phone, Calendar, User, MapPin, Shield,
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

type TypeFilter   = 'all' | 'nouveau' | 'critique';
type StatutFilter = 'all' | 'Complet' | 'Incomplet';

export default function RegistreJour() {
  const [patients,    setPatients]    = useState<Patient[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [search,      setSearch]      = useState('');
  const [typeFilter,  setTypeFilter]  = useState<TypeFilter>('all');
  const [statutFilter,setStatutFilter]= useState<StatutFilter>('all');
  const [expanded,    setExpanded]    = useState<string | null>(null);

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
    const matchStatut = statutFilter === 'all' || p.statutProfil === statutFilter;
    return matchSearch && matchType && matchStatut;
  });

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
          <select
            className="adm-input"
            style={{ width: 'auto', padding: '6px 10px' }}
            value={statutFilter}
            onChange={e => setStatutFilter(e.target.value as StatutFilter)}
          >
            <option value="all">Tous les profils</option>
            <option value="Complet">Complet</option>
            <option value="Incomplet">Incomplet</option>
          </select>
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
