# Guide de Configuration du Back-Office Admin

## 🎉 Back-Office Complété

Votre back-office d'administration est maintenant prêt ! Vous pouvez gérer l'intégralité de votre site web depuis l'interface admin.

---

## 📋 Fonctionnalités Disponibles

### 1. **Dashboard** (`/admin/dashboard`)
- Vue d'ensemble des statistiques
- Dernières réservations
- Compteurs : réservations, services, témoignages, zones

### 2. **Réservations** (`/admin/bookings`)
- Voir toutes les réservations
- Rechercher par nom, email, téléphone
- Voir les détails complets d'une réservation
- Supprimer des réservations

### 3. **Services** (`/admin/services`)
- Ajouter/modifier/supprimer des services
- Gestion simple avec nom du service

### 4. **Témoignages** (`/admin/testimonials`)
- Ajouter/modifier/supprimer des témoignages
- Champs : auteur, rôle, note (1-5 étoiles), texte

### 5. **Forfaits** (`/admin/plans`)
- Ajouter/modifier/supprimer des forfaits
- Champs : nom, prix affiché, caractéristiques (liste), marquer comme populaire

### 6. **FAQs** (`/admin/faqs`)
- Ajouter/modifier/supprimer des questions/réponses
- Champs : question, réponse

### 7. **Zones** (`/admin/zones`)
- Ajouter/modifier/supprimer des zones géographiques
- Champs : canton, ville, statut actif/inactif
- Toggle rapide du statut actif

### 8. **Pages** (`/admin/pages`)
- Créer et éditer des pages dynamiques
- Champs : titre, contenu (HTML), image hero
- Aperçu de l'image hero

### 9. **Médias** (`/admin/media`)
- Télécharger des images
- Gérer la bibliothèque d'images
- Copier les URLs pour les utiliser ailleurs
- Supprimer des images

---

## 🔧 Configuration Requise

### 1. Créer un compte administrateur dans Supabase

Connectez-vous à votre projet Supabase et créez un utilisateur admin :

```sql
-- Dans l'onglet SQL Editor de Supabase
-- Créez un utilisateur admin (remplacez l'email et le mot de passe)
```

Ou utilisez l'interface Supabase :
1. Allez dans **Authentication** > **Users**
2. Cliquez sur **Add user**
3. Entrez email et mot de passe
4. Confirmez l'utilisateur

### 2. Créer le bucket Storage pour les images

Le système de médias nécessite un bucket Supabase Storage nommé `images`.

**Étapes :**

1. Allez dans **Storage** dans votre dashboard Supabase
2. Cliquez sur **New bucket**
3. Nom du bucket : `images`
4. Cochez **Public bucket** (pour que les images soient accessibles publiquement)
5. Cliquez sur **Create bucket**

**Configuration des politiques (Policies) :**

Pour permettre l'upload et la suppression d'images, ajoutez ces politiques :

```sql
-- Politique pour l'upload (INSERT)
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Politique pour la lecture (SELECT)
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Politique pour la suppression (DELETE)
CREATE POLICY "Allow authenticated users to delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');
```

Ou configurez via l'interface :
1. Allez dans **Storage** > **Policies**
2. Cliquez sur **New policy** pour le bucket `images`
3. Créez 3 politiques : INSERT, SELECT, DELETE
4. Pour INSERT et DELETE : cible = `authenticated`
5. Pour SELECT : cible = `public`

---

## 🚀 Accès au Back-Office

### URL de connexion
```
http://localhost:3000/admin/login
```

### Identifiants
Utilisez l'email et le mot de passe de l'utilisateur que vous avez créé dans Supabase Auth.

---

## 📁 Structure des Fichiers Admin

```
src/
├── components/
│   └── admin/
│       ├── AdminLayout.js         # Layout avec sidebar
│       ├── AdminLayout.css        # Styles du layout
│       └── ProtectedRoute.js      # Protection des routes
├── pages/
│   └── admin/
│       ├── LoginPage.js           # Page de connexion
│       ├── LoginPage.css          # Styles de connexion
│       ├── DashboardPage.js       # Tableau de bord
│       ├── DashboardPage.css      # Styles du dashboard
│       ├── BookingsPage.js        # Gestion des réservations
│       ├── BookingsPage.css       # Styles partagés
│       ├── ServicesPage.js        # Gestion des services
│       ├── TestimonialsPage.js    # Gestion des témoignages
│       ├── PlansPage.js           # Gestion des forfaits
│       ├── FAQsPage.js            # Gestion des FAQs
│       ├── ZonesPage.js           # Gestion des zones
│       ├── PagesPage.js           # CMS pages
│       └── MediaPage.js           # Gestion des médias
└── App.js                         # Routes configurées
```

---

## 🎨 Utilisation des Images

### Upload d'images
1. Allez dans **Médias** (`/admin/media`)
2. Cliquez sur **Télécharger des images**
3. Sélectionnez une ou plusieurs images
4. Les images sont uploadées automatiquement

### Utiliser une image
1. Trouvez l'image dans la bibliothèque
2. Cliquez sur **Copier URL**
3. Collez l'URL dans les champs appropriés :
   - Pages : champ "URL de l'image hero"
   - Autres contenus qui acceptent des URLs d'images

---

## 🔐 Sécurité

### Routes Protégées
Toutes les routes admin (sauf `/admin/login`) sont protégées par le composant `ProtectedRoute`. Si l'utilisateur n'est pas authentifié, il est redirigé vers la page de connexion.

### Déconnexion
Pour vous déconnecter, cliquez sur le bouton **Déconnexion** dans la sidebar du back-office.

---

## 📊 Base de Données Supabase

### Tables utilisées
- `bookings` - Réservations des clients
- `services` - Services offerts
- `testimonials` - Témoignages clients
- `plans` - Forfaits/Plans tarifaires
- `faqs` - Questions fréquentes
- `zones` - Zones géographiques desservies
- `pages` - Pages dynamiques du site

### Storage
- Bucket `images` - Stockage des images

---

## 🐛 Dépannage

### "Bucket does not exist"
→ Assurez-vous d'avoir créé le bucket `images` dans Supabase Storage

### "Permission denied"
→ Vérifiez que les politiques (policies) sont correctement configurées dans Storage

### "Invalid login credentials"
→ Vérifiez que l'utilisateur existe dans Supabase Auth et que le mot de passe est correct

### Erreurs de chargement des données
→ Vérifiez que toutes les tables existent dans votre base de données Supabase

---

## ✅ Checklist de Configuration

- [ ] Créer un utilisateur admin dans Supabase Auth
- [ ] Créer le bucket `images` dans Supabase Storage
- [ ] Configurer les politiques du bucket (INSERT, SELECT, DELETE)
- [ ] Tester la connexion sur `/admin/login`
- [ ] Vérifier que toutes les pages admin sont accessibles
- [ ] Tester l'upload d'une image dans Médias
- [ ] Créer du contenu de test dans chaque section

---

## 🎯 Prochaines Étapes

1. **Connectez-vous** au back-office
2. **Ajoutez du contenu** :
   - Créez vos services
   - Ajoutez des témoignages
   - Configurez vos forfaits
   - Remplissez les FAQs
   - Définissez vos zones de service
3. **Uploadez des images** pour illustrer votre contenu
4. **Gérez les réservations** au fur et à mesure qu'elles arrivent

---

## 📞 Support

Pour toute question ou problème, consultez la documentation Supabase :
- **Auth** : https://supabase.com/docs/guides/auth
- **Storage** : https://supabase.com/docs/guides/storage
- **Database** : https://supabase.com/docs/guides/database

---

**Félicitations ! Votre back-office est prêt à être utilisé ! 🎉**
