<p align="center">
  <img src="public/brand/vinkora-logo.png" alt="Vinkora" width="320" />
</p>

<p align="center"><strong>Créez. Partagez. Mesurez.</strong></p>

<p align="center">
  Vinkora transforme une URL en QR code professionnel aujourd'hui, puis en campagne
  dynamique et mesurable demain. Le produit est conçu en République démocratique du Congo
  pour rester simple, accessible et adapté aux usages locaux.
</p>

## Vinkora en bref

Vinkora est une plateforme Next.js de création, de personnalisation et de gestion de liens
et de QR codes.

Le **Studio Free** fonctionne immédiatement, sans compte : l'utilisateur saisit une URL,
personnalise son QR code et l'exporte en PNG ou SVG. Toutes les données de ce parcours restent
dans le navigateur.

La fondation SaaS prépare les futurs liens courts Vinkora, QR dynamiques, statistiques et
offres payantes. Ces fonctionnalités ne sont pas encore présentées comme actives ou achetables.

## Fonctionnalités disponibles

- QR codes statiques gratuits, générés localement dans le navigateur.
- Validation des URL HTTP et HTTPS.
- Personnalisation des couleurs, dégradés, formes, coins et marges.
- Ajout d'un logo avec badge intégré, ajustement automatique et contrôle de lisibilité.
- Presets Classique, Business, Réseaux sociaux, Événement et Minimal.
- Exports PNG en 512, 1024 ou 2048 px et export SVG.
- Historique local, favoris, reprise, copie et suppression.
- Interface responsive pour mobile, tablette et ordinateur.
- Installation PWA avec détection des nouvelles versions sans réinstallation.
- Landing page, grille tarifaire et aperçu du futur espace SaaS.

## Une base SaaS responsable

Le parcours Free n'enregistre aucune ressource anonyme dans Neon :

- aucune URL gratuite envoyée à la base de données ;
- aucun compte obligatoire ;
- historique conservé uniquement sur l'appareil ;
- `POST /api/links` refuse actuellement les créations anonymes ;
- les anciennes redirections `/r/[slug]` restent prises en charge pour ne pas casser les liens
  déjà diffusés.

Le schéma Prisma et les migrations SaaS sont préparés localement. L'authentification,
l'activation commerciale, les paiements et l'application réelle des quotas restent à intégrer.

## Offres de lancement

| Offre | Prix | Durée | Ressources dynamiques | Analyses | Disponibilité |
| --- | --- | --- | ---: | ---: | --- |
| **Free** | Gratuit | Illimitée | Aucune | Aucune | Disponible via `/studio` |
| **Pass Événement** | 2 USD ou 5 000 CDF | 7 jours | 10 | 2 000 | Bientôt disponible |
| **Starter** | 4 USD ou 10 000 CDF | 30 jours | 50 | 10 000 | Bientôt disponible |

Une ressource dynamique correspond à un lien court ou un QR dynamique. Les prix USD et CDF
sont des prix commerciaux distincts, pas une conversion automatique. Pass Événement et Starter
sont visibles dans le catalogue mais ne déclenchent encore aucun achat ni paiement.

## Parcours produit

1. Ouvrir le Studio.
2. Coller une URL HTTP ou HTTPS.
3. Générer un QR statique localement.
4. Personnaliser son style et ajouter éventuellement un logo.
5. Exporter le résultat en PNG ou SVG.

## Routes principales

| Route | Rôle |
| --- | --- |
| `/` | Présentation publique de Vinkora |
| `/studio` | Studio QR statique Free |
| `/features` | Fonctionnalités disponibles et prévues |
| `/pricing` | Catalogue officiel de lancement |
| `/faq` | Questions fréquentes |
| `/dashboard/*` | Aperçu de l'espace SaaS, encore non connecté |
| `/r/[slug]` | Compatibilité des liens courts déjà diffusés |

## PWA et mises à jour

Vinkora peut être installée sur mobile et ordinateur. Chaque déploiement possède une version
identifiable : l'application vérifie les mises à jour au démarrage, au retour en ligne, au retour
au premier plan et périodiquement.

Lorsqu'une nouvelle version est disponible, l'utilisateur peut l'activer depuis Vinkora avec le
bouton **Mettre à jour**. Les pages Next.js ne sont volontairement pas conservées dans un cache
applicatif, ce qui évite de rester bloqué sur une ancienne interface.

## Stack technique

- Next.js 16 avec App Router
- React 19 et TypeScript
- Prisma 7
- PostgreSQL / Neon pour la fondation serveur
- `qrcode.react` pour le rendu QR
- Lucide React pour les icônes
- Sonner pour les notifications
- pnpm comme gestionnaire de paquets

## Installation locale

```bash
git clone https://github.com/Sombre-mael/Vinkora.git
cd Vinkora
pnpm install
pnpm dev
```

L'application est ensuite accessible sur `http://127.0.0.1:3000`.

Le Studio Free peut être développé sans connexion à Neon. Les routes serveur utilisant Prisma
nécessitent les variables suivantes dans un fichier `.env` local :

```dotenv
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

`VINKORA_DEPLOYMENT_VERSION` peut être définie par l'hébergeur. Sinon, une version unique est
générée pendant le build pour le mécanisme de mise à jour PWA.

## Commandes

| Commande | Utilisation |
| --- | --- |
| `pnpm dev` | Démarrer le serveur de développement |
| `pnpm typecheck` | Vérifier TypeScript sans générer de fichiers |
| `pnpm lint` | Exécuter ESLint |
| `pnpm test` | Exécuter les tests de sécurité, redirection, tarifs et PWA |
| `pnpm build` | Créer le build Next.js de production |
| `pnpm start` | Démarrer le build de production |

## Déploiement

La version complète de Vinkora nécessite un hébergeur compatible avec le runtime serveur de
Next.js. GitHub Pages ne peut pas exécuter les routes API, Prisma ou les redirections dynamiques.

Avant un déploiement commercial, il restera notamment à configurer :

- une base Neon dédiée à l'environnement ;
- les variables d'environnement serveur ;
- l'authentification ;
- l'activation des offres et les paiements ;
- les règles de quotas et de statistiques côté serveur.

## Roadmap

- Authentification et gestion sécurisée des comptes.
- Activation manuelle après vérification d'un paiement Mobile Money.
- Liens courts Vinkora réservés aux utilisateurs disposant de droits actifs.
- QR codes dynamiques avec destination modifiable.
- Statistiques par date, appareil, pays et source.
- Dashboard connecté aux données réelles.
- Administration minimale des utilisateurs, paiements et suspensions.

## Auteur

Vinkora est conçu et développé par
[Maël (Sombre-mael)](https://github.com/Sombre-mael).

## Licence

Ce projet est distribué sous licence MIT. Consultez le fichier [LICENSE](LICENSE).
