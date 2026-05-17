import { Component, OnInit } from '@angular/core';
import { AdminService, Project } from '../services/admin.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  loading = true;
  error = '';
  searchTerm = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      },
    });
  }

  get filteredProjects(): Project[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.projects;
    return this.projects.filter((p) => {
      const title = (p.title || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const status = (p.status || '').toLowerCase();
      const client = `${this.ownerName(p)} ${this.ownerEmail(p)}`.toLowerCase();
      return (
        title.includes(q) ||
        desc.includes(q) ||
        status.includes(q) ||
        client.includes(q)
      );
    });
  }

  countByStatus(status: string): number {
    return this.projects.filter((p) => p.status === status).length;
  }

  ownerName(p: Project): string {
    return (p.owner as { name?: string })?.name || 'Inconnu';
  }

  ownerEmail(p: Project): string {
    return (p.owner as { email?: string })?.email || '';
  }

  ownerInitial(p: Project): string {
    const name = this.ownerName(p);
    if (name === 'Inconnu') return '?';
    return name.trim().charAt(0).toUpperCase();
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      open: 'Ouvert',
      in_progress: 'En cours',
      completed: 'Terminé',
      disputed: 'Litige',
      cancelled: 'Annulé',
    };
    return map[status] || status;
  }

  statusPillClass(status: string): string {
    const map: Record<string, string> = {
      open: 'pill--open',
      in_progress: 'pill--progress',
      completed: 'pill--done',
      disputed: 'pill--disputed',
      cancelled: 'pill--cancelled',
    };
    return map[status] || 'pill--default';
  }

  deleteProject(id: string) {
    if (!confirm('Supprimer ce projet ?')) return;

    this.adminService.deleteProject(id).subscribe({
      next: () => {
        this.projects = this.projects.filter((p) => p._id !== id);
      },
      error: (err) => alert('Erreur : ' + err.message),
    });
  }
}
