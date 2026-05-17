import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AdminService } from '../services/admin.service';
import { ThemeService } from '../services/theme.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private projectChartInstance?: Chart;
  private userChartInstance?: Chart;

  @ViewChild('projectsChart') projectsChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('usersChart') usersChart!: ElementRef<HTMLCanvasElement>;

  stats: any = {
    users: { total: 0, clients: 0, freelancers: 0 },
    projects: { open: 0, inProgress: 0, completed: 0 },
    escrow: { total: 0 },
  };

  constructor(
    private adminService: AdminService,
    private theme: ThemeService,
  ) {}

  ngOnInit(): void {
    this.theme.dark$.subscribe(() => {
      if (this.stats?.users != null && this.projectsChart?.nativeElement) {
        setTimeout(() => {
          this.loadProjectsChart();
          this.loadUsersChart();
        }, 0);
      }
    });

    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        setTimeout(() => {
          this.loadProjectsChart();
          this.loadUsersChart();
        }, 0);
      },
      error: (err) => console.error(err),
    });
  }

  private adminCount(): number {
    const t = Number(this.stats.users?.total) || 0;
    const c = Number(this.stats.users?.clients) || 0;
    const f = Number(this.stats.users?.freelancers) || 0;
    return Math.max(0, t - c - f);
  }

  loadProjectsChart(): void {
    if (!this.projectsChart?.nativeElement) return;
    this.projectChartInstance?.destroy();

    const dark = this.theme.isDark();
    const textColor = dark ? '#e2e8f0' : '#334155';
    const gridColor = dark ? 'rgba(148,163,184,0.15)' : 'rgba(100,116,139,0.2)';

    const open = Number(this.stats.projects?.open) || 0;
    const progress = Number(this.stats.projects?.inProgress) || 0;
    const done = Number(this.stats.projects?.completed) || 0;

    this.projectChartInstance = new Chart(this.projectsChart.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Open', 'In progress', 'Completed'],
        datasets: [
          {
            label: 'Projects',
            data: [open, progress, done],
            backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4'],
            borderRadius: 10,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: dark ? '#0f172a' : '#fff',
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: gridColor,
            borderWidth: 1,
          },
        },
        layout: { padding: { top: 12, bottom: 16, left: 8, right: 8 } },
        datasets: {
          bar: {
            categoryPercentage: 0.55,
            barPercentage: 0.75,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: textColor,
              font: { size: 12, weight: 'bold' },
              maxRotation: 0,
              autoSkip: false,
            },
            offset: true,
          },
          y: {
            beginAtZero: true,
            suggestedMax: undefined,
            ticks: {
              color: textColor,
              precision: 0,
              stepSize: 1,
            },
            grid: { color: gridColor },
            border: { display: false },
          },
        },
      },
    });
  }

  loadUsersChart(): void {
    if (!this.usersChart?.nativeElement) return;
    this.userChartInstance?.destroy();

    const dark = this.theme.isDark();
    const textColor = dark ? '#e2e8f0' : '#334155';
    const clients = Number(this.stats.users?.clients) || 0;
    const freelancers = Number(this.stats.users?.freelancers) || 0;
    const admins = this.adminCount();

    this.userChartInstance = new Chart(this.usersChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Clients', 'Freelancers', 'Admins'],
        datasets: [
          {
            data: [clients, freelancers, admins],
            backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b'],
            hoverOffset: 8,
            borderWidth: dark ? 3 : 2,
            borderColor: dark ? '#0f172a' : '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '58%',
        layout: { padding: { bottom: 8, top: 4, left: 8, right: 8 } },
        plugins: {
          legend: {
            position: 'bottom',
            align: 'center',
            labels: {
              color: textColor,
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 16,
              font: { size: 12, weight: 'bold' },
            },
          },
          tooltip: {
            backgroundColor: dark ? '#0f172a' : '#fff',
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: dark ? 'rgba(148,163,184,0.3)' : 'rgba(100,116,139,0.3)',
            borderWidth: 1,
          },
        },
      },
    });
  }
}
