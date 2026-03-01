# TripApp — Dashboard Régulateur

Interface Angular 17 pour la supervision et régulation des conducteurs.

## Stack

- **Angular 17** — Standalone components, Signals, nouveaux control flow (@for, @if)
- **TypeScript strict** — Typage complet
- **CSS Variables** — Design system cohérent (pas de librairie UI externe)
- **RxJS** — Gestion des appels HTTP

---

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer en développement (avec proxy vers Spring Boot)
npm start
```

Le proxy redirige automatiquement `/api/**` → `http://localhost:8081`.

Pour changer le port du backend, modifier `proxy.conf.json` :

```json
{
  "/api": {
    "target": "http://localhost:8081",
    ...
  }
}
```

---

## Structure du projet

```
src/app/
├── core/
│   ├── models.ts                    # Interfaces TypeScript
│   ├── guards/
│   │   └── auth.guard.ts            # Protection des routes
│   ├── interceptors/
│   │   └── jwt.interceptor.ts       # Ajout du token JWT
│   └── services/
│       ├── auth.service.ts          # Login / logout / token
│       ├── api.service.ts           # Tous les appels backend
│       └── toast.service.ts         # Notifications
├── features/
│   ├── login/
│   │   └── login.component.ts       # Page de connexion
│   ├── dashboard/
│   │   └── dashboard.component.ts   # Vue d'ensemble avec stats
│   ├── kyc/
│   │   └── kyc.component.ts         # Validation des dossiers KYC
│   ├── trafic/
│   │   └── trafic.component.ts      # Suivi live des courses
│   └── conducteurs/
│       └── conducteur.component.ts # Bloquer / débloquer
└── shared/
    └── components/
        └── shell/
            └── shell.component.ts   # Layout : sidebar + topbar
```

---

## Endpoints consommés

| Méthode | URL | Usage |
|---------|-----|-------|
| POST | `/api/v1/auth/authenticate` | Login |
| GET | `/api/v1/regulateur/kyc/en-attente` | File KYC |
| GET | `/api/v1/regulateur/kyc/tous` | Tous les dossiers |
| POST | `/api/v1/regulateur/kyc/{id}/approuver` | Approuver |
| POST | `/api/v1/regulateur/kyc/{id}/rejeter` | Rejeter (body: `{ motifRejet }`) |
| GET | `/api/v1/regulateur/trafic` | Stats + courses actives |
| GET | `/api/v1/regulateur/conducteurs` | Liste conducteurs |
| POST | `/api/v1/regulateur/conducteurs/{id}/bloquer` | Bloquer |
| POST | `/api/v1/regulateur/conducteurs/{id}/debloquer` | Débloquer |

---

## Authentification

Le token JWT est stocké dans le `localStorage` et ajouté automatiquement à chaque requête via le `JwtInterceptor`.

Un utilisateur doit avoir le rôle `ROLE_REGULATEUR` pour accéder au dashboard.

---

## Build production

```bash
npm run build
# Output dans dist/tripapp-regulateur/
```

---

## Personnalisation

Toutes les couleurs et espacements sont des **CSS variables** dans `src/styles.css`.

Pour changer la couleur principale (orange par défaut) :

```css
:root {
  --primary: #FF6B00;        /* Couleur principale */
  --primary-light: #FFF3EB;  /* Fond clair */
  --primary-hover: #E55A00;  /* Hover */
}
```
