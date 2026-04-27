import React from 'react';
import { UserPlus, AlertTriangle, CalendarDays } from 'lucide-react';
import type { PatientStats } from '../../services/patients';

interface Props {
  stats: PatientStats;
  loading?: boolean;
}

export const KpiCards: React.FC<Props> = ({ stats, loading }) => (
  <div className="adm-kpi-grid">
    {[
      { val: stats.enregistres, label: "Patients enregistrés aujourd'hui", icon: <UserPlus size={16} />,      cls: 'adm-kpi-blue'   },
      { val: stats.nouveaux,    label: 'Nouveaux patients créés',           icon: <UserPlus size={16} />,      cls: 'adm-kpi-orange' },
      { val: stats.critiques,   label: 'Admissions critiques',              icon: <AlertTriangle size={16} />, cls: 'adm-kpi-danger' },
      { val: stats.mois,        label: 'Patients ce mois-ci',              icon: <CalendarDays size={16} />,  cls: 'adm-kpi-green'  },
    ].map(s => (
      <div key={s.label} className={`adm-kpi ${s.cls}`}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <p className="adm-kpi-lbl" style={{ marginBottom: 0 }}>{s.label}</p>
          <span style={{ opacity: 0.6 }}>{s.icon}</span>
        </div>
        <div className="adm-kpi-val">{loading ? '…' : s.val}</div>
      </div>
    ))}
  </div>
);