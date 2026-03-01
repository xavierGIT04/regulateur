// ═══════════════════════════════════════════════════════════════
// MODELS — TripApp Régulateur
// ═══════════════════════════════════════════════════════════════

export interface AuthResponse {
  id: string;
  username: string;
  roles: { authority: string }[] | string[];
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface KycDossier {
  conducteurId: number;
  nom: string;
  prenom: string;
  telephone: string;
  photoProfil?: string;
  photoPermis?: string;
  photoCni?: string;
  photoVehicule?: string;
  numeroPermis?: string;
  immatriculation?: string;
  typeVehicule?: 'ZEM' | 'TAXI';
  estValideParAdmin: boolean;
  statutService?: string;
  noteMoyenne?: number;
}

export interface ConducteurListe {
  conducteurId: number;
  nom: string;
  prenom: string;
  telephone: string;
  photoProfil?: string;
  estValideParAdmin: boolean;
  statutService?: string;
  noteMoyenne?: number;
  totalCourses?: number;
  immatriculation?: string;
  typeVehicule?: 'ZEM' | 'TAXI';
}

export interface CourseResumee {
  courseId: number;
  statut: string;
  passagerNom?: string;
  conducteurNom?: string;
  departAdresse?: string;
  destinationAdresse?: string;
  dateCommande?: string;
  prixFinal?: number;
  prixEstime?: number;
  distanceKm?: number;
}

export interface TrafficStats {
  coursesEnCours: number;
  coursesEnAttente: number;
  conducteursDispo: number;
  coursesTermineesAujourdhui: number;
  gainsTotauxAujourdhui: number;
  coursesActives: CourseResumee[];
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
