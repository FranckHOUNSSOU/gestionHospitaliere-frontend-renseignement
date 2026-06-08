import client from './clients';

export interface ContactUrgence {
  nom: string;
  prenom: string;
  lienParente: string;
  telephone: string;
}

export interface Patient {
  id: string;
  numeroIpp: string;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F' | 'Autre';
  dateNaissance: string | null;
  adresse: string | null;
  telephoneMobile: string | null;
  email: string | null;
  statutProfil: 'Complet' | 'Incomplet';
  creePar: { id: string; nom: string; prenom: string } | null;
  contactsUrgence: ContactUrgence[];
  createdAt: string;
}

export interface PatientStats {
  enregistres: number;
  nouveaux: number;
  critiques: number;
  mois: number;
}

export interface AccueilPayload {
  nom: string;
  prenom: string;
  sexe: 'M' | 'F' | 'Autre';
  dateNaissance: string;
  adresse: string;
  telephoneMobile: string;
  contactUrgenceNom: string;
  contactUrgencePrenom: string;
  contactUrgenceLienParente: string;
  contactUrgenceTelephone: string;
  nomJeuneFille?: string;
  lieuNaissance?: string;
  nationalite?: string;
  langue?: string;
  ville?: string;
  pays?: string;
  telephoneFixe?: string;
  email?: string;
}

export interface CritiquePayload {
  nom?: string;
  prenom?: string;
  sexe?: 'M' | 'F' | 'Autre';
  dateNaissance?: string;
  ageEstime?: number;
  accompagnantNom?: string;
  accompagnantTelephone?: string;
  circonstancesAdmission?: string;
}

export type CompleterProfilPayload = Partial<AccueilPayload & {
  nomJeuneFille: string;
  lieuNaissance: string;
  nationalite: string;
  langue: string;
  ville: string;
  pays: string;
  telephoneFixe: string;
}>;

export const patientsData = {
  rechercher: async (q: string): Promise<Patient[]> => {
    const { data } = await client.get<Patient[]>(
      `/patients/recherche?q=${encodeURIComponent(q.trim())}`,
    );
    return data;
  },

  accueillir: async (payload: AccueilPayload): Promise<Patient> => {
    const { data } = await client.post<Patient>('/patients/accueil', payload);
    return data;
  },

  admettreEnUrgence: async (payload: CritiquePayload): Promise<Patient> => {
    const { data } = await client.post<Patient>('/patients/critique', payload);
    return data;
  },

  completerProfil: async (id: string, payload: CompleterProfilPayload): Promise<Patient> => {
    const { data } = await client.patch<Patient>(`/patients/${id}/completer`, payload);
    return data;
  },

  fetchPatientsToday: async (): Promise<Patient[]> => {
    const { data } = await client.get<Patient[]>('/patients');
    const todayStr = new Date().toISOString().slice(0, 10);
    return data
      .filter(p => p.createdAt.slice(0, 10) === todayStr)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  modifier: async (id: string, payload: Partial<AccueilPayload>): Promise<Patient> => {
    const { data } = await client.patch<Patient>(`/patients/${id}`, payload);
    return data;
  },

  supprimer: async (id: string): Promise<{ message: string }> => {
    const { data } = await client.delete<{ message: string }>(`/patients/${id}`);
    return data;
  },

  fetchStatsToday: async (): Promise<PatientStats> => {
    const { data } = await client.get<Patient[]>('/patients');

    const todayStr = new Date().toISOString().slice(0, 10); // "2025-04-24"
    const monthStr = new Date().toISOString().slice(0, 7);  // "2025-04"

    const nouveaux = data.filter(
      p => p.createdAt.slice(0, 10) === todayStr &&
           !p.numeroIpp.startsWith('IPP-PROV'),
    ).length;

    const critiques = data.filter(
      p => p.createdAt.slice(0, 10) === todayStr &&
           p.numeroIpp.startsWith('IPP-PROV'),
    ).length;

    const mois = data.filter(
      p => p.createdAt.slice(0, 7) === monthStr,
    ).length;

    return {
      enregistres: nouveaux + critiques,
      nouveaux,
      critiques,
      mois,
    };
  },
};
