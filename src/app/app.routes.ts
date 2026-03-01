import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'kyc',
        loadComponent: () => import('./features/kyc/kyc.component').then(m => m.KycComponent)
      },
      {
        path: 'trafic',
        loadComponent: () => import('./features/trafic/trafic.component').then(m => m.TraficComponent)
      },
      {
        path: 'conducteurs',
        loadComponent: () => import('./features/conducteurs/conducteur.component').then(m => m.ConducteurComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
