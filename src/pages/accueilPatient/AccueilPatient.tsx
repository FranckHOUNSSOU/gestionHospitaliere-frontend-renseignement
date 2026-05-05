import React, { useState, useEffect, useCallback } from 'react';
import './AccueilPatient.css';
import type { PatientType } from './types';
import { KpiCards } from './KpiCards';
import { TypeSelector } from './TypeSelector';
import { NouveauPatientForm } from './NouveauPatientForm';
import { AncienPatientSection } from './AncienPatientSection';
import { CritiqueFormSection } from './CritiqueFormSection';
import { patientsData } from '../../services/patients';
import type { PatientStats } from '../../services/patients';

const AccueilPatient: React.FC = () => {
  const [patientType, setPatientType] = useState<PatientType>(null);
  const [stats, setStats] = useState<PatientStats>({
    enregistres: 0,
    nouveaux: 0,
    critiques: 0,
    mois: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const refreshStats = useCallback(async () => {
    try {
      const s = await patientsData.fetchStatsToday();
      setStats(s);
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const handleSuccess = () => {
    refreshStats();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--c-t0)', margin: 0 }}>
          Accueil Patient
        </p>
        <p style={{ fontSize: 13, color: 'var(--c-t2)', margin: '4px 0 0' }}>
          Enregistrement et prise en charge des patients entrants
        </p>
      </div>

      <KpiCards stats={stats} loading={loadingStats} />

      <TypeSelector selected={patientType} onSelect={setPatientType} />
      {patientType === 'nouveau'  && <NouveauPatientForm  onSuccess={handleSuccess} />}
      {patientType === 'ancien'   && <AncienPatientSection />}
      {patientType === 'critique' && <CritiqueFormSection onSuccess={handleSuccess} />}
    </div>
  );
};

export default AccueilPatient;
