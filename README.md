# Vinkora

Vinkora est un outil Next.js public, sans compte et sans base de données, permettant de raccourcir une URL et de créer un QR code personnalisable.

Le projet est pensé pour une utilisation directe : coller un lien, générer un lien court ou un QR code seul, personnaliser le rendu, puis exporter le QR en PNG ou SVG.

## Statut

- Version : `1.0.0`
- Application : Next.js avec App Router et React
- Backend : aucun
- Stockage : historique local dans le navigateur
- Licence : MIT

## Fonctionnalités

- Raccourcissement d’URL via `is.gd`.
- Mode QR seulement pour générer un QR code sans raccourcir le lien.
- Studio QR avec presets, couleurs libres, dégradé, styles visuels, coins et avertissements de lisibilité.
- Badge logo intégré au QR code avec forme, padding, bordure, ombre et ajustement automatique.
- Exports PNG en 512, 1024 ou 2048 px et export SVG.
- Historique local dans le navigateur avec favoris, reprise, copie et suppression.
- Interface responsive pour mobile et ordinateur.
- Installation mobile via PWA.
- Mention de l’auteur avec un lien vers son profil GitHub.

## Stack

- Next.js
- React
- TypeScript
- qrcode.react
- lucide-react

## Installation

```bash
pnpm install
pnpm dev
```

## Scripts

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
pnpm start
```

## Déploiement

La migration Next.js prépare Vinkora pour ses futures fonctions serveur : comptes, QR dynamiques, analytics et paiements. GitHub Pages n’est plus la cible de déploiement, car il ne fournit pas de runtime serveur Next.js.

Le futur déploiement pourra utiliser Vercel ou un hébergeur compatible Next.js. Aucun déploiement n’est configuré à cette étape de migration.

## Limites actuelles

- Les liens courts dépendent du service externe `is.gd`.
- Les statistiques de clics ne sont pas incluses dans cette version sans backend.
- L’historique est local au navigateur de l’utilisateur.

## Roadmap

- Ajouter un second fournisseur de raccourcissement en fallback.
- Ajouter un contrôle de scan QR automatisé ou semi-automatisé.
- Ajouter des modèles QR par secteur : restaurant, événement, portfolio et carte de visite.

## Licence

Ce projet est distribué sous licence MIT. Voir le fichier `LICENSE`.
