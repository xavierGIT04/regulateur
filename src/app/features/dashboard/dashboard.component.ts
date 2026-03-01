import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { TrafficStats, KycDossier } from '../../core/models';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);

  today = new Date();
  loading = signal(false);
  loadingKyc = signal(false);
  traffic = signal<TrafficStats | null>(null);
  kycPending = signal<KycDossier[]>([]);

  private refreshInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.loadAll();
    this.refreshInterval = setInterval(() => this.loadTraffic(), 30_000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  refresh(): void { this.loadAll(); }

  private loadAll(): void {
    this.loadTraffic();
    this.loadKyc();
  }

  private loadTraffic(): void {
    this.loading.set(true);
    this.api.getTrafic().subscribe({
      next: d => { this.traffic.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  private loadKyc(): void {
    this.loadingKyc.set(true);
    this.api.getKycEnAttente().subscribe({
      next: d => { this.kycPending.set(d); this.loadingKyc.set(false); },
      error: () => this.loadingKyc.set(false)
    });
  }

  initials(nom: string, prenom: string): string {
    return ((prenom?.[0] ?? '') + (nom?.[0] ?? '')).toUpperCase();
  }

  avatarColor(nom: string): string {
    const colors = ['#FF6B00','#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444'];
    return colors[(nom?.charCodeAt(0) ?? 0) % colors.length];
  }

  statutBadge(statut: string): string {
    const map: Record<string, string> = {
      'EN_COURS': 'badge-info',
      'ACCEPTEE': 'badge-success',
      'EN_ATTENTE': 'badge-warning',
      'TERMINEE': 'badge-gray',
    };
    return map[statut] ?? 'badge-gray';
  }
}
