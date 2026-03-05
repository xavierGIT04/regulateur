import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, throwError, catchError } from 'rxjs';
import { AuthResponse } from '../models';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http   = inject(HttpClient);
    private router = inject(Router);

    //  Clés de stockage localStorage
    private readonly TOKEN_KEY   = 'trip_access_token';
    private readonly REFRESH_KEY = 'trip_refresh_token';
    private readonly USER_KEY    = 'trip_user';

    login(username: string, password: string): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${environment.baseUrl}/api/v1/auth/authenticate`, { username, password })
            .pipe(
                tap(res => {
                    // Vérification que le token existe bien dans la réponse
                    if (!res.access_token) {
                        throw new Error('Token manquant dans la réponse');
                    }
                    localStorage.setItem(this.TOKEN_KEY, res.access_token);
                    localStorage.setItem(this.REFRESH_KEY, res.refresh_token);
                    localStorage.setItem(
                        this.USER_KEY,
                        JSON.stringify({ id: res.id, username: res.username, roles: res.roles })
                    );
                }),
                catchError(err => {
                    const msg = err.error?.message || err.message || 'Identifiants incorrects';
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
        const token = this.getToken();
        if (!token) return false;
        //  Vérifie que le token n'est pas expiré (décode le payload JWT)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            return payload.exp > now;
        } catch {
            return false;
        }
    }

    isRegulateur(): boolean {
        const user = this.getUser();
        if (!user?.roles) return false;
        //  Gère les deux formats possibles du backend :
        // - string[] : ["ROLE_REGULATEUR"]
        // - { authority: string }[] : [{ authority: "ROLE_REGULATEUR" }]
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