import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Import indispensable
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = `${environment.apiOrigin.replace(/\/$/, '')}/api/auth`;


  constructor(private http: HttpClient) { }

  // Méthode pour la connexion Admin (Dashboard)
  adminLogin(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin-login`, data);
  }

  // Méthode pour le login classique (si besoin sur le web)
  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }
  verifyOtp(data: any): Observable<any> {
    // data contient l'email et le code saisi dans ton interface
    return this.http.post(`${this.apiUrl}/verify-otp`, data);
  }
}