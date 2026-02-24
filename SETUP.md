# Configuration de l'authentification et de la base de données

## 1. Configuration de Turso (Base de données)

### Étape 1 : Créer un compte Turso
1. Allez sur [https://turso.tech](https://turso.tech)
2. Cliquez sur "Sign up" et créez un compte (vous pouvez utiliser GitHub)

### Étape 2 : Installer le CLI Turso
```powershell
# Windows (avec PowerShell)
irm https://get.turso.tech/install.ps1 | iex
```

### Étape 3 : Se connecter au CLI
```powershell
turso auth login
```

### Étape 4 : Créer votre base de données
```powershell
turso db create dnd-encounter-tracker
```

### Étape 5 : Obtenir l'URL de la base de données
```powershell
turso db show dnd-encounter-tracker --url
```
**Copiez cette URL** - vous en aurez besoin pour `.env.local`

### Étape 6 : Créer un token d'authentification
```powershell
turso db tokens create dnd-encounter-tracker
```
**Copiez ce token** - vous en aurez besoin pour `.env.local`

### Étape 7 : Initialiser le schéma de la base de données
```powershell
turso db shell dnd-encounter-tracker < lib/schema.sql
```

---

## 2. Configuration de Clerk (Authentification)

### Étape 1 : Créer un compte Clerk
1. Allez sur [https://dashboard.clerk.com/sign-up](https://dashboard.clerk.com/sign-up)
2. Créez un compte (vous pouvez utiliser GitHub, Google, etc.)

### Étape 2 : Créer une nouvelle application
1. Cliquez sur "Add application"
2. Donnez un nom à votre application (ex: "D&D Tracker")
3. Choisissez les méthodes de connexion souhaitées (Email, Google, GitHub, etc.)
4. Cliquez sur "Create application"

### Étape 3 : Obtenir vos clés API
1. Dans le dashboard Clerk, allez dans **API Keys**
2. Vous verrez deux clés :
   - **Publishable key** (commence par `pk_test_...`)
   - **Secret key** (commence par `sk_test_...`) - Cliquez sur l'œil pour la révéler
3. **Copiez ces deux clés** - vous en aurez besoin pour `.env.local`

---

## 3. Configuration du fichier .env.local

Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_ICI
CLERK_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE_ICI

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Turso Database
TURSO_DATABASE_URL=libsql://VOTRE_URL_ICI
TURSO_AUTH_TOKEN=VOTRE_TOKEN_ICI
```

**Remplacez** :
- `pk_test_VOTRE_CLE_ICI` par votre Publishable key de Clerk
- `sk_test_VOTRE_CLE_SECRETE_ICI` par votre Secret key de Clerk
- `libsql://VOTRE_URL_ICI` par l'URL de votre base Turso
- `VOTRE_TOKEN_ICI` par le token d'authentification Turso

---

## 4. Installer la dépendance manquante

```powershell
npm install uuid
npm install --save-dev @types/uuid
```

---

## 5. Lancer l'application

```powershell
npm run dev
```

Votre application sera accessible sur [http://localhost:3000](http://localhost:3000)

---

## ⚠️ Important

- **Ne commitez JAMAIS le fichier `.env.local`** - il contient vos clés secrètes
- Le fichier `.env.local` est déjà dans `.gitignore`
- En production, configurez ces variables d'environnement dans votre plateforme de déploiement (Vercel, etc.)

---

## 🔄 Prochaines étapes

Après avoir configuré l'authentification et la base de données, il faudra :
1. Migrer le `GameContext` pour utiliser les API routes au lieu de `localStorage`
2. Créer les routes API pour les encounters
3. Tester le flux complet : inscription → connexion → création de personnage → combat

---

## 🆘 Dépannage

### Erreur "TURSO_DATABASE_URL is not set"
- Vérifiez que le fichier `.env.local` existe à la racine du projet
- Vérifiez l'orthographe des variables d'environnement
- Redémarrez le serveur de développement (`npm run dev`)

### Erreur "Unauthorized" dans Clerk
- Vérifiez que les clés Clerk sont correctes dans `.env.local`
- Vérifiez que `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` commence bien par `pk_`
- Vérifiez que `CLERK_SECRET_KEY` commence bien par `sk_`

### Le CLI Turso ne fonctionne pas
- Sur Windows, assurez-vous d'exécuter PowerShell en mode Administrateur
- Fermez et rouvrez votre terminal après l'installation
