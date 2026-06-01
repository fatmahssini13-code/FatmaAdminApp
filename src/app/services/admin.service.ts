import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'freelancer' | 'admin';
  isBlocked: boolean;
  balance?: number;
  createdAt?: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  paymentStatus: string;
  owner: Partial<User> | string;
  acceptedFreelancer?: Partial<User> | string;
  selectedProposal?: any;
  disputeReason?: string;
  createdAt: string;
}

export interface Stats {
  users:    { total: number; clients: number; freelancers: number };
  projects: { open: number; inProgress: number; completed: number };
  escrow:   { total: number };
}

@Injectable({ providedIn: 'root' })
export class AdminService {

  /** All admin routes live under `/api/admin`. */
  private readonly apiRoot = `${environment.apiOrigin.replace(/\/$/, '')}/api`;
  private readonly api = `${this.apiRoot}/admin`;

  /** Node origin (static files `/uploads/`, etc.). */
  get uploadsOrigin(): string {
    return environment.apiOrigin.replace(/\/$/, '');
  }

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('adminToken') ?? ''}`,
    });
  }

  // ─── STATS ──────────────────────────────────────────────────────────────────
  getStats(): Observable<Stats> {
    return this.http.get<Stats>(`${this.api}/stats`, { headers: this.headers() });
  }

  // ─── USERS ──────────────────────────────────────────────────────────────────
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/users`, { headers: this.headers() });
  }

  archiveUser(id: string): Observable<any> {
    return this.http.delete(`${this.api}/users/${id}`, { headers: this.headers() });
  }

  toggleBlock(id: string): Observable<any> {
    return this.http.put(`${this.api}/users/${id}/toggle-block`, {}, { headers: this.headers() });
  }

  // ─── PROJECTS ───────────────────────────────────────────────────────────────
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.api}/projects`, { headers: this.headers() });
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete(`${this.api}/projects/${id}`, { headers: this.headers() });
  }

  // ─── ESCROW ─────────────────────────────────────────────────────────────────


getEscrowProjects() {
  return this.http.get(`${this.api}/escrow-projects`, { headers: this.headers() });
}

releaseFunds(projectId: string) {
  return this.http.post(
    `${this.api}/escrow/release-funds`,  
    { projectId },
    { headers: this.headers() },
  );
}

refundClient(projectId: string) {
  return this.http.post(
    `${this.api}/escrow/refund-client`,  
    { projectId },
    { headers: this.headers() },
  );
}

  getCancellationRequests() {
    return this.http.get(`${this.api}/cancellation-requests`, {
      headers: this.headers(),
    });
  }

  approveCancellation(projectId: string) {
    return this.http.post(
      `${this.api}/cancellation-requests/${projectId}/approve`,
      {},
      { headers: this.headers() },
    );
  }

  rejectCancellation(projectId: string, note?: string) {
    return this.http.post(
      `${this.api}/cancellation-requests/${projectId}/reject`,
      { note: note ?? '' },
      { headers: this.headers() },
    );
  }

  getPendingWorkSubmissions() {
    return this.http.get(`${this.api}/work-submissions/pending`, {
      headers: this.headers(),
    });
  }

  approveWorkRelease(projectId: string) {
    return this.http.post(
      `${this.api}/work-submissions/${projectId}/approve-release`,
      {},
      { headers: this.headers() },
    );
  }

  rejectWorkSubmission(projectId: string, note?: string) {
    return this.http.post(
      `${this.api}/work-submissions/${projectId}/reject`,
      { note: note ?? '' },
      { headers: this.headers() },
    );
  }

  // ─── DISPUTES ───────────────────────────────────────────────────────────────
// ─────────────────────────────
// GET DISPUTES
// ─────────────────────────────

getDisputes() {

  return this.http.get(
    `${this.api}/disputes`
  );
}

// ─────────────────────────────
// RESOLVE DISPUTE
// ─────────────────────────────

resolveDispute(
  id: string,
  body: any
) {

  return this.http.put(

    `${this.api}/disputes/${id}/resolve`,

    body
  );
}
}
