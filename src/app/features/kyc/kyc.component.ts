import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { KycDossier } from '../../core/models';

type FilterType = 'tous' | 'en_attente' | 'valides';

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './kyc.component.html',
  styleUrl: './kyc.component.scss'
})
export class KycComponent implements OnInit {
  private api   = inject(ApiService);
  private toast = inject(ToastService);

  loading      = signal(false);
  processingId = signal<number | null>(null);
  actionType   = signal<'approve' | 'reject' | null>(null);

  dossiers     = signal<KycDossier[]>([]);
  activeFilter = signal<FilterType>('en_attente');
  search = '';

  showRejectModal = signal(false);
  rejectTarget    = signal<KycDossier | null>(null);
  rejectMotif     = '';

  lightboxUrl   = signal<string | null>(null);
  lightboxTitle = signal('');

  get filterTabs() {
    const all     = this.dossiers();
    const pending = all.filter(d => !d.estValideParAdmin);
    const valid   = all.filter(d =>  d.estValideParAdmin);
    return [
      { label: 'En attente', value: 'en_attente' as FilterType, count: pending.length },
      { label: 'Validés',    value: 'valides'    as FilterType, count: valid.length   },
      { label: 'Tous',       value: 'tous'        as FilterType                        },
    ];
  }

  filtered = computed(() => {
    let list = this.dossiers();
    if (this.activeFilter() === 'en_attente') list = list.filter(d => !d.estValideParAdmin);
    if (this.activeFilter() === 'valides')    list = list.filter(d =>  d.estValideParAdmin);
    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      list = list.filter(d =>
        `${d.nom} ${d.prenom} ${d.telephone}`.toLowerCase().includes(q)
      );
    }
    return list;
  });

  ngOnInit(): void { this.loadDossiers(); }

  loadDossiers(): void {
    this.loading.set(true);
    this.api.getTousKyc().subscribe({
      next: d => { this.dossiers.set(d); this.loading.set(false); },
      error: () => {
        // Fallback: charger seulement les dossiers en attente
        this.api.getKycEnAttente().subscribe({
          next: d => { this.dossiers.set(d); this.loading.set(false); },
          error: () => { this.loading.set(false); this.toast.error('Impossible de charger les dossiers'); }
        });
      }
    });
  }

  approuver(d: KycDossier): void {
    this.processingId.set(d.conducteurId);
    this.actionType.set('approve');
    this.api.approuverKyc(d.conducteurId).subscribe({
      next: () => {
        this.toast.success(`Dossier de ${d.prenom} ${d.nom} approuvé ✓`);
        this.dossiers.update(list =>
          list.map(x => x.conducteurId === d.conducteurId ? { ...x, estValideParAdmin: true } : x)
        );
        this.processingId.set(null);
        this.actionType.set(null);
      },
      error: () => {
        this.toast.error('Erreur lors de l\'approbation');
        this.processingId.set(null);
        this.actionType.set(null);
      }
    });
  }

  openReject(d: KycDossier): void {
    this.rejectTarget.set(d);
    this.rejectMotif = '';
    this.showRejectModal.set(true);
  }

  confirmerRejet(): void {
    const d = this.rejectTarget();
    if (!d || !this.rejectMotif.trim()) return;
    this.processingId.set(d.conducteurId);
    this.actionType.set('reject');
    this.api.rejeterKyc(d.conducteurId, this.rejectMotif).subscribe({
      next: () => {
        this.toast.info(`Dossier de ${d.prenom} ${d.nom} rejeté`);
        this.dossiers.update(list => list.filter(x => x.conducteurId !== d.conducteurId));
        this.processingId.set(null);
        this.actionType.set(null);
        this.closeModals();
      },
      error: () => {
        this.toast.error('Erreur lors du rejet');
        this.processingId.set(null);
        this.actionType.set(null);
      }
    });
  }

  closeModals(): void {
    this.showRejectModal.set(false);
    this.rejectTarget.set(null);
  }

  openPhoto(url: string, title: string): void {
    this.lightboxUrl.set(url);
    this.lightboxTitle.set(title);
  }

  initials(nom: string, prenom: string): string {
    return ((prenom?.[0] ?? '') + (nom?.[0] ?? '')).toUpperCase();
  }

  avatarColor(nom: string): string {
    const colors = ['#FF6B00','#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444'];
    return colors[(nom?.charCodeAt(0) ?? 0) % colors.length];
  }
}
