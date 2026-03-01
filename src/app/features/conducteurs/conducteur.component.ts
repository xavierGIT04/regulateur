import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { ConducteurListe } from '../../core/models';

type FilterType = 'tous' | 'actifs' | 'bloques';

@Component({
  selector: 'app-conducteurs',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './conducteur.component.html',
  styleUrl: './conducteur.component.scss',
})
export class ConducteurComponent implements OnInit {
  private api   = inject(ApiService);
  private toast = inject(ToastService);

  loading      = signal(false);
  processingId = signal<number | null>(null);
  conducteurs  = signal<ConducteurListe[]>([]);
  activeFilter = signal<FilterType>('tous');
  search = '';

  showBlockModal = signal(false);
  blockTarget    = signal<ConducteurListe | null>(null);
  blockMotif     = '';

  get filterTabs() {
    const all     = this.conducteurs();
    const actifs  = all.filter(c => c.statutService !== 'BLOQUE');
    const bloques = all.filter(c => c.statutService === 'BLOQUE');
    return [
      { label: 'Tous',    value: 'tous'    as FilterType, count: all.length     },
      { label: 'Actifs',  value: 'actifs'  as FilterType, count: actifs.length  },
      { label: 'Bloqués', value: 'bloques' as FilterType, count: bloques.length },
    ];
  }

  filtered = computed(() => {
    let list = this.conducteurs();
    if (this.activeFilter() === 'actifs')  list = list.filter(c => c.statutService !== 'BLOQUE');
    if (this.activeFilter() === 'bloques') list = list.filter(c => c.statutService === 'BLOQUE');
    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      list = list.filter(c => `${c.nom} ${c.prenom} ${c.telephone}`.toLowerCase().includes(q));
    }
    return list;
  });

  ngOnInit(): void { this.loadConducteurs(); }

  loadConducteurs(): void {
    this.loading.set(true);
    this.api.getConducteurs().subscribe({
      next: d => { this.conducteurs.set(d); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Impossible de charger les conducteurs'); }
    });
  }

  openBlockModal(c: ConducteurListe): void {
    this.blockTarget.set(c);
    this.blockMotif = '';
    this.showBlockModal.set(true);
  }

  closeModal(): void {
    this.showBlockModal.set(false);
    this.blockTarget.set(null);
  }

  confirmerBlocage(): void {
    const c = this.blockTarget();
    if (!c) return;
    this.processingId.set(c.conducteurId);
    this.api.bloquerConducteur(c.conducteurId, this.blockMotif || undefined).subscribe({
      next: () => {
        this.toast.info(`${c.prenom} ${c.nom} a été bloqué`);
        this.conducteurs.update(list =>
          list.map(x => x.conducteurId === c.conducteurId ? { ...x, statutService: 'BLOQUE' } : x)
        );
        this.processingId.set(null);
        this.closeModal();
      },
      error: () => { this.processingId.set(null); this.toast.error('Erreur lors du blocage'); }
    });
  }

  debloquer(c: ConducteurListe): void {
    this.processingId.set(c.conducteurId);
    this.api.debloquerConducteur(c.conducteurId).subscribe({
      next: () => {
        this.toast.success(`${c.prenom} ${c.nom} a été débloqué ✓`);
        this.conducteurs.update(list =>
          list.map(x => x.conducteurId === c.conducteurId ? { ...x, statutService: 'HORS_LIGNE' } : x)
        );
        this.processingId.set(null);
      },
      error: () => { this.processingId.set(null); this.toast.error('Erreur lors du déblocage'); }
    });
  }

  statutServiceBadge(s?: string): string {
    const map: Record<string, string> = {
      'EN_LIGNE':   'badge-success',
      'EN_COURSE':  'badge-info',
      'HORS_LIGNE': 'badge-gray',
      'BLOQUE':     'badge-danger',
    };
    return map[s ?? ''] ?? 'badge-gray';
  }

  initials(nom: string, prenom: string): string {
    return ((prenom?.[0] ?? '') + (nom?.[0] ?? '')).toUpperCase();
  }

  avatarColor(nom: string): string {
    const colors = ['#FF6B00','#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444'];
    return colors[(nom?.charCodeAt(0) ?? 0) % colors.length];
  }
}
