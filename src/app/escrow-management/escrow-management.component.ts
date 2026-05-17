import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-escrow-management',
  templateUrl: './escrow-management.component.html',
  styleUrls: ['./escrow-management.component.css'],
})
export class EscrowManagementComponent implements OnInit {
  projects: any[] = [];
  cancellationRequests: any[] = [];
  pendingWorkSubmissions: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.error = null;
    forkJoin({
      escrow: this.adminService.getEscrowProjects(),
      cancellations: this.adminService.getCancellationRequests(),
      workSubmissions: this.adminService.getPendingWorkSubmissions(),
    }).subscribe({
      next: ({ escrow, cancellations, workSubmissions }) => {
        this.projects = escrow as any[];
        this.cancellationRequests = cancellations as any[];
        this.pendingWorkSubmissions = workSubmissions as any[];
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les données escrow.';
        this.loading = false;
      },
    });
  }

  ownerName(project: any): string {
    return project.owner?.name ?? '—';
  }

  freelancerName(project: any): string {
    if (project.acceptedFreelancer?.name) {
      return project.acceptedFreelancer.name;
    }
    if (project.selectedProposal?.freelancer?.name) {
      return project.selectedProposal.freelancer.name;
    }
    return 'Non assigné';
  }

  clientCancelReason(project: any): string {
    const r = project.cancellationReason;
    if (r && String(r).trim()) return String(r);
    return '—';
  }

  workDemoLink(p: any): string {
    const u = p?.adminWorkSubmission?.demoLink;
    return u && String(u).trim() ? String(u) : '';
  }

  workMessage(p: any): string {
    const m = p?.adminWorkSubmission?.message;
    return m && String(m).trim() ? String(m) : '—';
  }

  fileDownloadUrl(filename: string): string {
    if (!filename) return '#';
    return `${this.adminService.uploadsOrigin}/uploads/${encodeURIComponent(filename)}`;
  }

  amount(project: any): number {
    const n = Number(project.escrowAmount ?? project.budget ?? 0);
    return Number.isFinite(n) ? n : 0;
  }

  projectStatusLabel(status: string | undefined): string {
    const map: Record<string, string> = {
      open: 'Ouvert',
      in_progress: 'En cours',
      delivered: 'Livré',
      completed: 'Terminé',
      cancelled: 'Annulé',
      disputed: 'Litige',
    };
    return map[status ?? ''] ?? (status || '—');
  }

  paymentLabel(code: string | undefined): string {
    const map: Record<string, string> = {
      not_locked: 'Non verrouillé',
      escrow_locked: 'En escrow',
      released: 'Libéré',
      refunded: 'Remboursé',
    };
    return map[code ?? ''] ?? (code || '—');
  }

  badgeClass(code: string | undefined): string {
    switch (code) {
      case 'escrow_locked':
        return 'pill pill--warn';
      case 'released':
        return 'pill pill--ok';
      case 'refunded':
        return 'pill pill--muted';
      default:
        return 'pill';
    }
  }

  /** Libération : uniquement après validation client du livrable. */
  canRelease(project: any): boolean {
    const st = project?.adminWorkSubmission?.status;
    return (
      project?.paymentStatus === 'escrow_locked' &&
      !project?.cancellationRequested &&
      (st === 'client_approved' || st === 'approved')
    );
  }

  /** Remboursement manuel (hors file d’annulation). */
  canRefund(project: any): boolean {
    return (
      project?.paymentStatus === 'escrow_locked' &&
      !project?.cancellationRequested
    );
  }

  submissionPillLabel(project: any): string {
    const st = project?.adminWorkSubmission?.status;
    if (st === 'pending_client' || st === 'pending_review') return 'Attente client';
    if (st === 'client_approved' || st === 'approved') return 'Client OK — prêt';
    if (st === 'client_rejected' || st === 'rejected') return 'Refus client';
    return '—';
  }

  submissionPillClass(project: any): string {
    const st = project?.adminWorkSubmission?.status;
    if (st === 'pending_client' || st === 'pending_review') return 'pill pill--warn';
    if (st === 'client_approved' || st === 'approved') return 'pill pill--ok';
    if (st === 'client_rejected' || st === 'rejected') return 'pill pill--muted';
    return 'cell-muted';
  }

  onRelease(projectId: string): void {
    if (!confirm('Libérer les fonds escrow vers le wallet du freelancer ?')) return;
    this.adminService.releaseFunds(projectId).subscribe({
      next: () => this.loadProjects(),
      error: () => alert('Action refusée ou erreur serveur.'),
    });
  }

  onRefund(projectId: string): void {
    if (!confirm('Rembourser le client ?')) return;
    this.adminService.refundClient(projectId).subscribe({
      next: () => this.loadProjects(),
      error: () => alert('Remboursement impossible ou erreur serveur.'),
    });
  }

  onApproveCancellation(projectId: string): void {
    if (
      !confirm(
        'Approuver la demande ? Le montant en escrow sera rendu au wallet du client et la mission sera supprimée.',
      )
    )
      return;
    this.adminService.approveCancellation(projectId).subscribe({
      next: () => this.loadProjects(),
      error: () => alert('Action refusée ou erreur serveur.'),
    });
  }

  onRejectCancellation(projectId: string): void {
    const note = prompt('Motif du refus (optionnel, visible côté projet en base) :') ?? '';
    this.adminService.rejectCancellation(projectId, note).subscribe({
      next: () => this.loadProjects(),
      error: () => alert('Action refusée ou erreur serveur.'),
    });
  }
}
