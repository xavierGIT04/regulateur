import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const auth   = inject(AuthService);
    const router = inject(Router);
    const token  = auth.getToken();

    //  Liste des URLs qui n'ont PAS besoin du token
    const isPublicUrl = req.url.includes('/api/v1/auth/authenticate')
        || req.url.includes('/api/v1/auth/register')
        || req.url.includes('/api/v1/auth/demander-otp')
        || req.url.includes('/api/v1/auth/verifier-otp')
        || req.url.includes('/api/v1/auth/refresh-token');

    let authReq: HttpRequest<unknown> = req;

    //  Attache le token sur toutes les requêtes non-publiques
    if (token && !isPublicUrl) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(authReq).pipe(
        catchError((err: HttpErrorResponse) => {
            if (err.status === 401) {
                // Token expiré ou invalide → déconnexion
                auth.logout();
                router.navigate(['/login']);
            }
            // 403 = authentifié mais pas le bon rôle → on ne déconnecte pas
            return throwError(() => err);
        })
    );
};