import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError, catchError } from 'rxjs';
import { AuthResponse } from '../models';
import {environment} from "../../../environments/environment.development";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY   = 'trip_access_token';
  private readonly REFRESH_KEY = 'trip_refresh_token';
  private readonly USER_KEY    = 'trip_user';


  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.baseUrl}/api/v1/auth/authenticate`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.access_token);
        localStorage.setItem(this.REFRESH_KEY, res.refresh_token);
        localStorage.setItem(this.USER_KEY, JSON.stringify({ id: res.id, username: res.username, roles: res.roles }));
      }),
      catchError(err => {
        const msg = err.error?.message || 'Identifiants incorrects';
        return throwError(() => new Error(msg));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isRegulateur(): boolean {
    const user = this.getUser();
    if (!user?.roles) return false;
    const roles: string[] = user.roles.map((r: any) =>
      typeof r === 'string' ? r : r.authority
    );
    return roles.includes('ROLE_REGULATEUR');
  }

  getUser(): any {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  getUsername(): string {
    return this.getUser()?.username ?? '';
  }
}
