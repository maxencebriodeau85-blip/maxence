# PROXEO — Landing Page

Site vitrine pour Proxeo, cabinet de conseil en comptabilité B2B basé en Vendée. Single-page responsive avec formulaire de contact connecté à Supabase.

## Sections

- **Navigation** sticky avec menu hamburger mobile
- **Hero** avec badge, titre, CTAs et statistiques
- **Services** (Saisie comptable, Conseil, Facturation électronique)
- **Guide** produit digital facturation électronique (29€)
- **À propos** avec blocs de réassurance
- **FAQ** avec accordéon animé
- **Contact** avec formulaire validé et stockage Supabase
- **Footer**

## Stack technique

- HTML / CSS / JavaScript vanilla
- Google Fonts : Syne (800) + DM Sans (300/400/500)
- Supabase pour le stockage des contacts
- Stripe (placeholder prêt à configurer)
- GitHub Pages pour le déploiement

## Installation

### 1. Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter `supabase-schema.sql` dans l'éditeur SQL
3. Mettre à jour `SUPABASE_URL` et `SUPABASE_ANON_KEY` dans `app.js`

### 2. Stripe (optionnel)

Remplacer le placeholder dans `app.js` (événement `btn-guide`) par votre URL Stripe Checkout.

### 3. Lancer

```bash
npx serve .
```

## Structure

```
index.html           — Page unique
style.css            — Styles custom (brand Proxeo)
app.js               — Navigation, FAQ, formulaire, Supabase
supabase-schema.sql  — Table contacts
.github/workflows/   — Déploiement GitHub Pages
```
