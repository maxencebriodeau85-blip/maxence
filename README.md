# Mon Espace — Notes & Tâches

Application web personnelle de gestion de notes et de tâches, avec un design minimaliste inspiré de Notion.

## Fonctionnalités

- **Notes / Documents** : créer, modifier, supprimer des notes avec titre, catégorie et contenu libre
- **Tâches / Projets** : gérer des tâches avec statut (À faire / En cours / Terminé), catégorie et date d'échéance
- **Recherche et filtres** : barre de recherche, filtres par catégorie, date et statut
- **Responsive** : utilisable sur mobile et desktop
- **Persistance** : données stockées dans Supabase

## Installation

### 1. Créer un projet Supabase

1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Aller dans **SQL Editor** et exécuter le contenu du fichier `supabase-schema.sql`

### 2. Configurer l'application

Dans `app.js`, remplacer les deux constantes par vos valeurs (disponibles dans **Settings > API** du dashboard Supabase) :

```javascript
const SUPABASE_URL = 'https://VOTRE_PROJET.supabase.co';
const SUPABASE_ANON_KEY = 'VOTRE_CLE_ANON';
```

### 3. Lancer l'application

Ouvrir `index.html` dans un navigateur, ou servir avec un serveur local :

```bash
npx serve .
```

## Structure du projet

```
index.html           — Page principale
style.css            — Styles (design Notion-like)
app.js               — Logique applicative et intégration Supabase
supabase-schema.sql  — Schéma de base de données à exécuter dans Supabase
```
