import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KycDossier, ConducteurListe, TrafficStats } from '../models';
import {environment} from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = `${environment.baseUrl}/api/v1/regulateur`;

  // ── KYC ─

  getKycEnAttente(): Observable<KycDossier[]> {
    return this.http.get<KycDossier[]>(`${this.base}/kyc/en-attente`);
  }

  getTousKyc(): Observable<KycDossier[]> {
    return this.http.get<KycDossier[]>(`${this.base}/kyc/tous`);
  }

  approuverKyc(id: number): Observable<{ status: string; message: string }> {
    return this.http.post<{ status: string; message: string }>(`${this.base}/kyc/${id}/approuver`, {});
  }

  rejeterKyc(id: number, motifRejet: string): Observable<{ status: string; message: string }> {
    return this.http.post<{ status: string; message: string }>(`${this.base}/kyc/${id}/rejeter`, { motifRejet });
  }

  // ── TRAFIC LIVE ─

  getTrafic(): Observable<TrafficStats> {
    return this.http.get<TrafficStats>(`${this.base}/trafic`);
  }

  // ── GESTION CONDUCTEURS ───────────────────────────────────────────────────

  getConducteurs(): Observable<ConducteurListe[]> {
    return this.http.get<ConducteurListe[]>(`${this.base}/conducteurs`);
  }

  bloquerConducteur(id: number, motif?: string): Observable<{ status: string; message: string }> {
    return this.http.post<{ status: string; message: string }>(`${this.base}/conducteurs/${id}/bloquer`, { motif });
  }

  debloquerConducteur(id: number): Observable<{ status: string; message: string }> {
    return this.http.post<{ status: string; message: string }>(`${this.base}/conducteurs/${id}/debloquer`, {});
  }
}
