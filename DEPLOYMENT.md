# 🚀 Guide de Déploiement Vercel - Dally Clean

## Prérequis
- ✅ Compte GitHub (déjà fait)
- ✅ Projet sur GitHub (déjà fait)
- 🆕 Compte Vercel (gratuit) - à créer si besoin

## Méthode 1: Déploiement via Interface Web (Recommandé pour débutants)

### Étape 1: Créer un compte Vercel
1. Allez sur https://vercel.com
2. Cliquez sur "Sign Up"
3. Sélectionnez "Continue with GitHub"
4. Autorisez Vercel à accéder à vos repositories

### Étape 2: Importer le projet
1. Sur le dashboard Vercel, cliquez sur "Add New..." → "Project"
2. Cherchez "dallyclean" dans la liste des repositories
3. Cliquez sur "Import"

### Étape 3: Configurer le projet
Vercel détectera automatiquement qu'il s'agit d'une app Create React App.

**Configuration par défaut:**
- Framework Preset: `Create React App`
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

Ne modifiez rien, ces valeurs sont correctes.

### Étape 4: Configurer les Variables d'Environnement
**TRÈS IMPORTANT** - Avant de déployer, ajoutez vos variables d'environnement:

1. Cliquez sur "Environment Variables"
2. Ajoutez les deux variables suivantes:

**Variable 1:**
```
Name: REACT_APP_SUPABASE_URL
Value: [Votre URL Supabase - voir fichier .env.local]
```

**Variable 2:**
```
Name: REACT_APP_SUPABASE_ANON_KEY
Value: [Votre clé Supabase - voir fichier .env.local]
```

3. Pour chaque variable, sélectionnez "Production", "Preview", et "Development"

### Étape 5: Déployer
1. Cliquez sur "Deploy"
2. Attendez 2-3 minutes que le build se termine
3. 🎉 Votre site est en ligne!

Vercel vous donnera une URL du type: `https://dallyclean.vercel.app`

---

## Méthode 2: Déploiement via CLI (Pour utilisateurs avancés)

### Étape 1: Installer Vercel CLI
```bash
npm install -g vercel
```

### Étape 2: Se connecter à Vercel
```bash
vercel login
```
Suivez les instructions pour vous authentifier.

### Étape 3: Déployer depuis le terminal
```bash
# Se placer dans le dossier du projet
cd /Users/dallyhermann/dev/dally-nettoyage

# Premier déploiement (configuration interactive)
vercel

# Répondre aux questions:
# - Set up and deploy? → Yes
# - Which scope? → [Votre compte]
# - Link to existing project? → No
# - What's your project's name? → dallyclean
# - In which directory is your code located? → ./
# - Want to override the settings? → No
```

### Étape 4: Ajouter les variables d'environnement via CLI
```bash
# Ajouter REACT_APP_SUPABASE_URL
vercel env add REACT_APP_SUPABASE_URL production

# Coller votre URL Supabase quand demandé

# Ajouter REACT_APP_SUPABASE_ANON_KEY
vercel env add REACT_APP_SUPABASE_ANON_KEY production

# Coller votre clé Supabase quand demandé
```

### Étape 5: Redéployer avec les variables
```bash
vercel --prod
```

---

## Configuration Post-Déploiement

### 1. Configurer un domaine personnalisé (Optionnel)

**Via l'interface Vercel:**
1. Allez dans "Settings" → "Domains"
2. Ajoutez votre domaine (ex: dallyclean.com)
3. Suivez les instructions pour configurer les DNS

**DNS à configurer chez votre registrar:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 2. Configurer Supabase pour le nouveau domaine

Dans votre projet Supabase:
1. Allez dans "Authentication" → "URL Configuration"
2. Ajoutez votre URL Vercel aux "Site URLs":
   - `https://dallyclean.vercel.app`
   - `https://votre-domaine.com` (si domaine personnalisé)

### 3. Vérifier le déploiement

Testez ces fonctionnalités:
- ✅ Page d'accueil s'affiche
- ✅ Catalogue des services charge correctement
- ✅ Les images s'affichent
- ✅ Formulaire de réservation fonctionne
- ✅ Connexion admin fonctionne
- ✅ Dashboard admin accessible

---

## Déploiements Automatiques

Une fois configuré, chaque push sur GitHub déclenchera automatiquement:
- **Push sur `master`** → Déploiement en production
- **Push sur autres branches** → Déploiement preview (URL temporaire)

```bash
# Exemple de workflow
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin master

# Vercel déploiera automatiquement en 2-3 minutes
```

---

## Commandes Utiles

```bash
# Voir les déploiements
vercel ls

# Voir les logs
vercel logs [url-du-deploiement]

# Annuler un déploiement
vercel rm [url-du-deploiement]

# Forcer un nouveau build
vercel --prod --force

# Voir les variables d'environnement
vercel env ls
```

---

## Résolution de Problèmes

### Problème: Build échoue
**Solution:** Vérifiez les logs de build dans l'interface Vercel
```bash
# Ou via CLI
vercel logs
```

### Problème: Erreur "Module not found"
**Solution:** Vérifiez que toutes les dépendances sont dans package.json
```bash
npm install
git add package.json package-lock.json
git commit -m "fix: update dependencies"
git push
```

### Problème: Variables d'environnement non prises en compte
**Solution:** Les variables doivent commencer par `REACT_APP_`
- ✅ `REACT_APP_SUPABASE_URL`
- ❌ `SUPABASE_URL`

Après avoir ajouté/modifié des variables, redéployez:
```bash
vercel --prod
```

### Problème: Routes ne fonctionnent pas (404 sur refresh)
**Solution:** Le fichier `vercel.json` règle ce problème avec les rewrites

---

## Surveillance et Analytics

### Activer Analytics (Gratuit)
1. Dans votre projet Vercel
2. Allez dans "Analytics"
3. Activez "Web Analytics"
4. Obtenez des statistiques sur les visiteurs

### Activer Speed Insights
1. Dans "Speed Insights"
2. Activez pour voir les performances réelles
3. Obtenez le Core Web Vitals

---

## Limites du Plan Gratuit Vercel

- ✅ Déploiements illimités
- ✅ 100 GB de bande passante/mois
- ✅ HTTPS automatique
- ✅ Domaine personnalisé
- ⚠️ 1 équipe membre max
- ⚠️ 6h de build/mois

**Pour la plupart des projets, le plan gratuit est largement suffisant!**

---

## Support

- Documentation Vercel: https://vercel.com/docs
- Community Discord: https://vercel.com/discord
- Support: support@vercel.com

---

**Bon déploiement! 🚀**
