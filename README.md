# Dally Clean - Plateforme de Réservation de Services de Nettoyage

![React](https://img.shields.io/badge/React-18.3.1-blue.svg)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

Une plateforme web moderne et complète pour la gestion de services de nettoyage professionnel avec système de réservation en ligne, configuration d'options dynamiques, et tableau de bord administrateur.

## 🌟 Fonctionnalités Principales

### Pour les Clients
- **Catalogue de Services** : Navigation intuitive à travers tous les services disponibles
- **Configuration Dynamique** : Personnalisation des services avec options (type de véhicule, taille, etc.)
- **Tarification Transparente** : Calcul en temps réel du prix avec modificateurs d'options
- **Réservation en Ligne** : Formulaire complet avec adresse, date, et horaire souhaités
- **Galerie Photos** : Lightbox avec slider avant/après interactif
- **Design Responsive** : Interface optimisée mobile, tablette et desktop

### Pour les Administrateurs
- **Tableau de Bord** : Vue d'ensemble des réservations et statistiques
- **Gestion des Services** : CRUD complet avec upload d'images
- **Système d'Options** : Configuration flexible (radio, select, prix variables)
- **Gestion des Réservations** : Visualisation détaillée avec modal enrichie
- **Personnalisation** : Titres de pages produits customisables
- **Authentification Sécurisée** : Connexion protégée via Supabase Auth

## 🚀 Technologies Utilisées

### Frontend
- **React 18.3.1** - Framework JavaScript moderne
- **React Router 6** - Navigation SPA
- **Lucide React** - Bibliothèque d'icônes modernes
- **CSS Modules** - Styling avec design tokens

### Backend & Base de Données
- **Supabase** - Backend-as-a-Service
  - PostgreSQL pour la base de données
  - Auth pour l'authentification
  - Storage pour les médias
  - Real-time pour les mises à jour

### Architecture
- **Design System** - Tokens CSS réutilisables
- **Component-Based** - Architecture modulaire
- **State Management** - React Hooks (useState, useEffect)

## 📦 Installation

### Prérequis
- Node.js 16+ et npm
- Compte Supabase (gratuit)

### Étapes d'Installation

1. **Cloner le repository**
```bash
git clone https://github.com/Lecomte0015/dallyclean.git
cd dallyclean
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**

Créez un fichier `.env` à la racine du projet :
```env
REACT_APP_SUPABASE_URL=votre_url_supabase
REACT_APP_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

4. **Configurer la base de données**

Exécutez les migrations SQL dans l'éditeur SQL de Supabase :
```bash
# Copier le contenu de supabase/run_all_migrations.sql
# Et l'exécuter dans l'éditeur SQL de votre projet Supabase
```

5. **Démarrer le serveur de développement**
```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 🗄️ Structure de la Base de Données

### Tables Principales

#### `services`
- `id` - Identifiant unique
- `name` - Nom du service
- `page_title` - Titre personnalisé pour la page produit
- `slug` - URL-friendly identifier
- `description` - Description détaillée
- `price` - Tarif affiché (texte)
- `base_price` - Prix de base (numérique)
- `image_url` - URL de l'image
- `has_options` - Booléen pour activer les options

#### `service_options`
- `id` - Identifiant unique
- `service_id` - Référence au service
- `name` - Nom de l'option (ex: "Type de véhicule")
- `type` - Type d'input (`radio` ou `select`)
- `is_required` - Option obligatoire
- `display_order` - Ordre d'affichage

#### `service_option_choices`
- `id` - Identifiant unique
- `option_id` - Référence à l'option
- `label` - Libellé du choix
- `price_modifier` - Modificateur de prix (+/-)
- `display_order` - Ordre d'affichage

#### `bookings`
- `id` - Identifiant unique
- `name` - Nom du client
- `email` - Email du client
- `phone` - Téléphone
- `address` - Adresse complète d'intervention
- `city` - Ville
- `service_id` - Référence au service
- `service_name` - Nom du service (copie historique)
- `base_price` - Prix de base au moment de la réservation
- `total_price` - Prix total avec options
- `date` - Date souhaitée
- `time` - Heure souhaitée
- `notes` - Notes additionnelles
- `selected_options` - Options sélectionnées (JSONB)
- `status` - Statut (`new`, `confirmed`, `done`, `canceled`)
- `created_at` - Date de création

## 📂 Structure du Projet

```
dally-nettoyage/
├── public/
│   └── index.html
├── src/
│   ├── assets/           # Images et contenus statiques
│   ├── components/       # Composants réutilisables
│   │   ├── admin/       # Composants admin (Layout, ProtectedRoute)
│   │   ├── banner/      # Bannière homepage
│   │   ├── booking/     # Formulaire de réservation
│   │   ├── footer/      # Pied de page
│   │   ├── home/        # Sections homepage
│   │   ├── navbar/      # Navigation
│   │   └── services/    # Catalogue services
│   ├── lib/             # Configuration (Supabase)
│   ├── pages/           # Pages principales
│   │   ├── admin/       # Pages administration
│   │   └── ...          # Pages publiques
│   ├── styles/          # Design system
│   │   ├── tokens.css   # Variables CSS
│   │   └── utilities.css # Classes utilitaires
│   ├── App.js           # Point d'entrée React
│   └── index.js         # Point d'entrée application
├── supabase/            # Migrations SQL
├── .env                 # Variables d'environnement (à créer)
├── .gitignore
├── package.json
└── README.md
```

## 🎨 Design System

Le projet utilise un design system basé sur des tokens CSS pour assurer la cohérence visuelle :

- **Couleurs** : Palette primaire/secondaire avec variantes
- **Espacements** : Échelle de 0 à 20 (multiples de 4px)
- **Typographie** : Échelle responsive (xs à 5xl)
- **Bordures** : Radius prédéfinis (sm, md, lg, xl, full)
- **Ombres** : Niveaux d'élévation (sm, md, lg, xl, 2xl)
- **Transitions** : Durées standardisées (fast, base, slow)

## 🔐 Sécurité

- **Authentification** : Gestion sécurisée via Supabase Auth
- **Variables d'environnement** : Clés API protégées (jamais commitées)
- **Row Level Security (RLS)** : Politiques Supabase pour protéger les données
- **Routes Protégées** : Composant `ProtectedRoute` pour l'admin

## 🚢 Déploiement

### Option 1: Vercel (Recommandé)
```bash
npm install -g vercel
vercel
```

### Option 2: Netlify
```bash
npm run build
# Drag & drop le dossier /build sur Netlify
```

**N'oubliez pas** de configurer les variables d'environnement dans les paramètres du service de déploiement.

## 📝 Scripts Disponibles

```bash
npm start          # Démarre le serveur de développement
npm run build      # Crée le build de production
npm test           # Lance les tests
npm run eject      # Éjecte la configuration (irréversible)
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche pour votre feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteurs

- **Dally Hermann** - Développement initial
- **Claude Sonnet 4.5** - Assistant de développement

## 📧 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur GitHub.

---

**Note:** Ce projet a été développé avec l'assistance de Claude Code, l'outil CLI officiel d'Anthropic pour le développement assisté par IA.
