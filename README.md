# LocalEvents API

API REST pour la gestion d'événements locaux : création d'événements, inscriptions, messagerie entre utilisateurs, évaluations, préférences par catégorie et historique d'actions.

Construit avec **Fastify 5**, **Prisma 7**, **PostgreSQL** et **TypeScript**.

---

## Sommaire

- [Stack technique](#stack-technique)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Lancement](#lancement)
- [Base de données](#base-de-données)
- [Tests](#tests)
- [Documentation API](#documentation-api)
- [Déploiement](#déploiement)
- [Structure du projet](#structure-du-projet)

---

## Stack technique

| Domaine        | Technologie                          |
| -------------- | ------------------------------------ |
| Runtime        | Node.js 20                           |
| Framework HTTP | Fastify 5                            |
| ORM            | Prisma 7 (adapter `@prisma/adapter-pg`) |
| Base de données| PostgreSQL 15                        |
| Auth           | JWT (`@fastify/jwt`) + Refresh Token |
| Validation     | Zod                                  |
| Hash           | bcrypt                               |
| Documentation  | Swagger + Scalar                     |
| Tests          | Jest + ts-jest                       |
| Conteneurisation| Docker / Docker Compose             |
| CI/CD          | GitLab CI                            |

---

## Fonctionnalités

- **Authentification** : inscription, connexion, refresh token, logout (JWT)
- **Rôles** : `USER` et `ADMIN` avec contrôle d'accès par route
- **Événements** : CRUD, filtres (catégorie, lieu, dates), inscription/désinscription
- **Catégories** : hiérarchie parent/enfant + soft delete + restauration
- **Évaluations** : note (1-5) + commentaire, réservé aux participants
- **Conversations** : messagerie 1-à-1 entre utilisateurs
- **Préférences** : abonnement à des catégories
- **Historique** : trace des actions utilisateur (CREATE, UPDATE, DELETE, JOIN, LEAVE)
- **Documentation** : Swagger UI + Scalar
- **Gestion d'erreurs** : centralisée avec `AppError` et erreurs Zod formatées

---

## Architecture

L'application suit une architecture en couches classique :

```
Routes  →  Controllers  →  Services  →  Prisma
                ↓
            Schemas (Zod)
```

- **Routes** : déclaration des endpoints + middlewares (`authenticate`, `authorize`)
- **Controllers** : parsing des requêtes, validation Zod, appel aux services
- **Services** : logique métier, appels Prisma, levée d'`AppError`
- **Schemas** : validation des inputs avec Zod
- **Plugins** : JWT, Swagger, Scalar, gestionnaire d'erreurs global

---

## Prérequis

- Node.js 20+
- npm
- Docker + Docker Compose (pour la base de données locale)

---

## Installation

```bash
# Cloner le dépôt
git clone https://gitlab.com/caensup9475439/licence-dev/2025/localevents/bocquet-robin.git
cd bocquet-robin

# Installer les dépendances
npm install

# Lancer PostgreSQL et Adminer
docker-compose up -d

# Générer le client Prisma + appliquer les migrations
npx prisma generate
npx prisma migrate deploy
```

---

## Variables d'environnement

Créer un fichier `.env` à la racine :

```env
DATABASE_URL="postgresql://fastify:fastifypassword@localhost:5432/fastifydb"
JWT_SECRET="supersecret"
```

> Le secret JWT par défaut dans `src/plugins/jwt.ts` est `"supersecret"`. Il doit impérativement être changé en production via `JWT_SECRET`.

---

## Lancement

```bash
# Mode développement (hot reload)
npm run dev

# Build production
npm run build

# Démarrer en production
npm start
```

Serveur accessible sur **http://localhost:3000**.

---

## Base de données

Le projet utilise PostgreSQL via `docker-compose.yml` :

- **PostgreSQL** : `localhost:5432`
- **Adminer** (interface web) : http://localhost:8080

### Commandes Prisma utiles

```bash
# Créer une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations en production
npx prisma migrate deploy

# Régénérer le client Prisma
npx prisma generate

# Ouvrir Prisma Studio
npx prisma studio
```

### Modèles principaux

`User`, `Event`, `Category` (avec hiérarchie + soft delete), `Participation`, `Evaluation`, `Conversation`, `Message`, `Preference`, `Historic`, `RefreshToken`.

---

## Tests

```bash
# Lancer tous les tests
npm test
```

Les tests unitaires couvrent l'ensemble des services (auth, event, conversation, evaluation, historic, preference, user) avec mock de Prisma et bcrypt.

---

## Documentation API

Une fois le serveur lancé, deux interfaces sont disponibles :

- **Swagger UI** : http://localhost:3000/documentation
- **Scalar** : http://localhost:3000/docs

Les routes protégées nécessitent un header :

```
Authorization: Bearer <accessToken>
```

### Aperçu des endpoints

| Méthode | Endpoint                       | Auth   | Description                      |
| ------- | ------------------------------ | ------ | -------------------------------- |
| POST    | `/auth/register`               | -      | Inscription                      |
| POST    | `/auth/login`                  | -      | Connexion (retourne tokens)      |
| POST    | `/auth/refresh`                | -      | Rafraîchir l'access token        |
| POST    | `/auth/logout`                 | User   | Déconnexion                      |
| GET     | `/events`                      | -      | Liste des événements (filtres)   |
| POST    | `/events`                      | User   | Créer un événement               |
| POST    | `/events/:id/join`             | User   | Rejoindre un événement           |
| POST    | `/events/:id/leave`            | User   | Quitter un événement             |
| POST    | `/events/:id/evaluations`      | User   | Évaluer un événement             |
| GET     | `/conversations`               | User   | Mes conversations                |
| POST    | `/conversations/:userId`       | User   | Créer/récupérer une conversation |
| GET     | `/categories`                  | -      | Liste des catégories             |
| POST    | `/categories`                  | Admin  | Créer une catégorie              |
| GET     | `/users`                       | Admin  | Liste des utilisateurs           |
| GET     | `/historics/me`                | User   | Mon historique                   |

---

## Déploiement

### Docker

```bash
# Build de l'image
docker build -t localevents-api .

# Run
docker run -d \
  --name localevents-api \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  localevents-api
```

L'`entrypoint.sh` exécute automatiquement `prisma migrate deploy` avant de lancer le serveur.

### CI/CD GitLab

Le pipeline (`.gitlab-ci.yml`) comprend trois stages déclenchés sur la branche `main` :

1. **test** : `npm ci` + `npm test`
2. **build** : build et push de l'image Docker dans le registry GitLab
3. **deploy** : déploiement par SSH sur le VPS (pull + run du conteneur)

Variables CI/CD requises :

- `SSH_PRIVATE_KEY`
- `VPS_USER`, `VPS_IP`
- `DATABASE_URL`
- `JWT_SECRET`

---

## Structure du projet

```
.
├── prisma/
│   ├── migrations/           # Migrations SQL versionnées
│   └── schema.prisma         # Schéma Prisma
├── src/
│   ├── __tests__/            # Tests unitaires Jest
│   ├── controllers/          # Logique des routes
│   ├── services/             # Logique métier
│   ├── routes/               # Déclaration des endpoints Fastify
│   ├── schemas/              # Schémas de validation Zod
│   ├── plugins/              # Plugins Fastify (JWT, Swagger, errorHandler...)
│   ├── dto/                  # Sélections Prisma réutilisables
│   ├── errors/               # Classe AppError
│   ├── prisma.ts             # Instance PrismaClient
│   └── server.ts             # Point d'entrée
├── docker-compose.yml        # Postgres + Adminer (dev)
├── Dockerfile                # Image de l'API
├── entrypoint.sh             # Migrations + démarrage
├── .gitlab-ci.yml            # Pipeline CI/CD
├── jest.config.js
├── tsconfig.json
└── package.json
```

---

## Auteur

Projet réalisé dans le cadre de la **Licence STS parcours Développement** au CNAM.

**Alexis Robin** & **Bocquet Mathéo** — 2026
