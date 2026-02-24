# Migration vers Base de Données Turso - Terminée ✅

## Changements effectués

### 1. API Routes créées
- **Personnages** :
  - `GET /api/characters` - Liste tous les personnages de l'utilisateur connecté
  - `POST /api/characters` - Crée un nouveau personnage
  - `PATCH /api/characters/[id]` - Modifie un personnage existant
  - `DELETE /api/characters/[id]` - Supprime un personnage

- **Rencontres** :
  - `GET /api/encounters` - Liste toutes les rencontres de l'utilisateur
  - `POST /api/encounters` - Crée une nouvelle rencontre
  - `GET /api/encounters/[id]` - Récupère une rencontre spécifique
  - `PATCH /api/encounters/[id]` - Modifie une rencontre
  - `DELETE /api/encounters/[id]` - Supprime une rencontre

- **Participants** :
  - `PATCH /api/encounters/[id]/participants/[participantId]` - Modifie un participant dans une rencontre

### 2. Opérations de base de données (lib/db-operations.ts)
Toutes les opérations incluent automatiquement l'isolation par `userId` grâce à Clerk :
- `getCharacters()` - Filtre par `user_id`
- `createCharacter()` - Associe au `user_id` actuel
- `updateCharacter()` - Vérifie que `user_id` correspond
- `deleteCharacter()` - Vérifie que `user_id` correspond
- `getEncounters()` - Filtre par `user_id`
- `createEncounter()` - Associe au `user_id` actuel
- `updateEncounter()` - Vérifie que `user_id` correspond
- `deleteEncounter()` - Vérifie que `user_id` correspond
- `updateEncounterParticipant()` - Modification des participants dans une rencontre

### 3. GameContext migré
Le contexte utilise maintenant les API au lieu de `localStorage` :
- ✅ **Chargement initial** - `refreshData()` au démarrage
- ✅ **Toutes les mutations** - Utilisent `fetch()` vers les API routes
- ✅ **État local synchronisé** - Mise à jour après chaque opération réussie
- ✅ **Indicateur de chargement** - `isLoading` disponible

### 4. Sécurité et isolation des données
🔒 **Chaque route API utilise `auth()` de Clerk** pour :
1. Vérifier que l'utilisateur est authentifié
2. Récupérer le `userId` de l'utilisateur connecté
3. Filtrer/associer automatiquement toutes les données à ce `userId`

**Résultat** : Un utilisateur ne peut **JAMAIS** voir ou modifier les données d'un autre utilisateur.

## Structure de la base de données

### Table `users`
- Synchronisée avec Clerk
- `id` = Clerk User ID

### Table `characters`
- Tous les personnages avec `user_id` (clé étrangère vers `users`)
- Types : PC, NPC, Monster
- Stats complètes + `monster_stats` JSON pour les monstres

### Table `encounters`
- Rencontres avec `user_id`
- État : `isActive`, `currentRound`, `currentTurnIndex`

### Table `encounter_participants`
- État de combat pour chaque participant
- HP, initiative, death saves, conditions
- Lié à `encounters` et `characters`

## Comment tester l'isolation

1. **Créer deux comptes** :
   - Compte A : Créez quelques personnages et rencontres
   - Compte B : Créez d'autres personnages et rencontres

2. **Vérifier l'isolation** :
   - Les personnages du compte A ne sont pas visibles dans le compte B
   - Les rencontres du compte A ne sont pas visibles dans le compte B
   - Impossible de modifier les données d'un autre utilisateur (protégé par `user_id`)

## Ce qui a été supprimé

❌ **localStorage** n'est plus utilisé pour :
- `dnd-characters`
- `dnd-encounters`
- `dnd-current-encounter`

Toutes les données sont maintenant dans Turso, isolées par utilisateur.

## Migration des anciennes données

Si vous aviez des données dans `localStorage`, elles ne sont plus utilisées. Vous devrez recréer vos personnages et rencontres dans l'interface - ils seront maintenant sauvegardés dans la base de données et accessibles depuis n'importe quel appareil après connexion.

## Prochaines étapes possibles

- [ ] Ajouter un système de partage de personnages entre utilisateurs
- [ ] Exporter/importer des personnages (JSON)
- [ ] Historique des rencontres passées
- [ ] Statistiques par personnage (combats, dégâts, etc.)
- [ ] Mode "spectateur" pour suivre un combat sans y participer
