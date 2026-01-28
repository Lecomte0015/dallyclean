# Migration - Configuration des Sections de Services

## Instructions pour appliquer les migrations

Pour activer la fonctionnalité de réorganisation des sections sur les pages de détail des services, vous devez exécuter 3 migrations SQL dans votre base de données Supabase (dans l'ordre).

### Migration 1: Création de la table service_sections

1. **Connectez-vous à votre projet Supabase**
   - Allez sur [https://supabase.com](https://supabase.com)
   - Sélectionnez votre projet

2. **Ouvrez l'éditeur SQL**
   - Dans le menu de gauche, cliquez sur "SQL Editor"
   - Cliquez sur "New Query"

3. **Copiez et exécutez le script**
   - Ouvrez le fichier `service_layout_migration.sql`
   - Copiez tout le contenu
   - Collez-le dans l'éditeur SQL de Supabase
   - Cliquez sur "Run" pour exécuter

4. **Vérifiez que la migration a réussi**
   - Vous devriez voir un message de succès
   - La table `service_sections` devrait maintenant exister dans votre base de données

### Migration 2: Ajout de la colonne column_position

1. **Ouvrez un nouveau query dans l'éditeur SQL**
   - Cliquez sur "New Query"

2. **Copiez et exécutez le second script**
   - Ouvrez le fichier `add_column_position.sql`
   - Copiez tout le contenu
   - Collez-le dans l'éditeur SQL de Supabase
   - Cliquez sur "Run" pour exécuter

3. **Vérifiez que la migration a réussi**
   - Vous devriez voir un message "Column position added successfully!"
   - La colonne `column_position` devrait maintenant exister dans la table `service_sections`

### Migration 3: Ajout de la section 'title' (titre séparé)

1. **Ouvrez un nouveau query dans l'éditeur SQL**
   - Cliquez sur "New Query"

2. **Copiez et exécutez le troisième script**
   - Ouvrez le fichier `add_title_section.sql`
   - Copiez tout le contenu
   - Collez-le dans l'éditeur SQL de Supabase
   - Cliquez sur "Run" pour exécuter

3. **Vérifiez que la migration a réussi**
   - Vous devriez voir un message "Title section added successfully!"
   - Une nouvelle section 'title' devrait être créée pour tous les services existants

### Ce que cette migration ajoute :

- **Table `service_sections`** : Stocke l'ordre et la visibilité des sections pour chaque service
- **6 types de sections** :
  - `title` : Titre de la page produit
  - `description` : Description du service (texte explicatif)
  - `image` : Image principale du service
  - `options` : Options configurables (surface, fréquence, etc.)
  - `price` : Résumé des prix
  - `actions` : Boutons de réservation et devis
- **3 positions possibles** :
  - `full` : Pleine largeur
  - `left` : Colonne gauche
  - `right` : Colonne droite

- **Trigger automatique** : Initialise automatiquement les sections pour chaque nouveau service créé

### Utilisation dans le back-office :

Après avoir exécuté les 3 migrations, vous pouvez accéder à la nouvelle page de configuration :

1. Connectez-vous au back-office (`/admin`)
2. Cliquez sur "Configuration Pages" dans le menu
3. Sélectionnez un service dans la liste de gauche
4. Pour chaque section, vous pouvez :
   - **Réorganiser l'ordre vertical** avec les flèches ↑ ↓
   - **Choisir la position** (Pleine largeur / Colonne gauche / Colonne droite) via le menu déroulant
   - **Masquer/afficher** avec l'icône œil 👁️
5. Cliquez sur "Enregistrer" pour sauvegarder

Les modifications seront immédiatement visibles sur la page de détail du service côté front-office.

### Exemples de dispositions possibles :

**Disposition classique (image à gauche):**
- Titre: Pleine largeur
- Description: Pleine largeur
- Image: Colonne gauche
- Options: Colonne droite
- Prix: Colonne droite
- Actions: Colonne droite

**Disposition moderne (tout en colonnes):**
- Titre: Pleine largeur
- Image: Colonne gauche
- Description: Colonne droite
- Options: Colonne droite
- Prix: Colonne droite
- Actions: Colonne droite

**Disposition verticale:**
- Toutes les sections en "Pleine largeur"
