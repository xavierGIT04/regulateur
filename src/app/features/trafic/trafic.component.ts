import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { TrafficStats, CourseResumee } from '../../core/models';

@Component({
  selector: 'app-trafic',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './trafic.component.html',
  styleUrl: './trafic.component.scss',
})
export class TraficComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);

  loading = signal(false);
  traffic = signal<TrafficStats | null>(null);
  countdown = signal(100);

  private refreshInterval?: ReturnType<typeof setInterval>;
  private countdownInterval?: ReturnType<typeof setInterval>;
  private readonly REFRESH_DELAY = 20_000;

  ngOnInit(): void {
    this.loadTrafic();
    this.refreshInterval = setInterval(() => {
      this.loadTrafic();
      this.countdown.set(100);
    }, this.REFRESH_DELAY);

    this.countdownInterval = setInterval(() => {
      this.countdown.update(v => Math.max(0, v - (100 / (this.REFRESH_DELAY / 1000))));
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval)   clearInterval(this.refreshInterval);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }

  refresh(): void {
    this.loadTrafic();
    this.countdown.set(100);
  }

  private loadTrafic(): void {
    this.loading.set(true);
    this.api.getTrafic().subscribe({
      next: d => { this.traffic.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  statutBadge(s: string): string {
    const map: Record<string, string> = {
      'EN_COURS':   'badge-info',
      'ACCEPTEE':   'badge-success',
      'EN_ATTENTE': 'badge-warning',
      'TERMINEE':   'badge-gray',
    };
    return map[s] ?? 'badge-gray';
  }

  formatStatut(s: string): string {
    const map: Record<string, string> = {
      'EN_COURS':   'En cours',
      'ACCEPTEE':   'Acceptée',
      'EN_ATTENTE': 'En attente',
      'TERMINEE':   'Terminée',
    };
    return map[s] ?? s;
  }
}
