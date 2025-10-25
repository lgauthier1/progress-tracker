# Guide : Partage de Types entre Frontend et Backend

**Date**: 2025-10-25  
**Application**: Habits Tracker  
**Stack**: TypeScript + Zod + Prisma

---

## 🎯 Objectif

Partager les schémas de validation et types TypeScript entre frontend et backend pour :
- ✅ **Single source of truth** : définir une fois, utiliser partout
- ✅ **Validation cohérente** : mêmes règles côté client et serveur
- ✅ **Type safety** : TypeScript infère les types depuis Zod
- ✅ **DRY** (Don't Repeat Yourself) : pas de duplication de code

---

## 📁 Architecture

```
lg-habits2/
├── backend/
│   ├── src/
│   │   ├── validators/
│   │   │   ├── auth.validator.ts      # Re-exporte depuis shared
│   │   │   ├── goals.validator.ts     # Re-exporte depuis shared
│   │   │   └── habits.validator.ts    # Re-exporte depuis shared
│   │   └── routes/
│   │       └── goals.routes.ts        # Utilise les validators
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api/
│   │   │       └── goals.api.ts       # Utilise les schemas partagés
│   │   └── types/
│   │       └── index.ts               # Re-exporte depuis shared
│   └── package.json
│
└── shared/
    └── types/                          # ✨ SOURCE UNIQUE DE VÉRITÉ
        ├── auth.types.ts
        ├── goals.types.ts
        ├── habits.types.ts
        ├── categories.types.ts
        └── api.types.ts
```

---

## 🔧 Configuration Workspace

### 1. Setup Monorepo (ou symlink)

**Option A : npm/yarn workspaces** (Recommandé)

`package.json` (racine) :
```json
{
  "name": "lg-habits2",
  "private": true,
  "workspaces": [
    "backend",
    "frontend",
    "shared"
  ]
}
```

**Option B : Symlink** (Alternative simple)
```bash
# Dans backend/
ln -s ../shared ./node_modules/@shared

# Dans frontend/
ln -s ../shared ./node_modules/@shared
```

### 2. Configuration TypeScript

`shared/tsconfig.json` :
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist"
  },
  "include": ["types/**/*"]
}
```

`shared/package.json` :
```json
{
  "name": "@shared/types",
  "version": "0.1.0",
  "type": "module",
  "main": "./types/index.ts",
  "types": "./types/index.ts",
  "dependencies": {
    "zod": "^3.22.4"
  }
}
```

### 3. Configuration Backend

`backend/tsconfig.json` :
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  }
}
```

### 4. Configuration Frontend

`frontend/tsconfig.json` :
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  }
}
```

`frontend/vite.config.ts` :
```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
});
```

---

## 📝 Exemple Complet : Goal Creation

### 1. Définition dans `shared/types/goals.types.ts`

```typescript
import { z } from 'zod';

// ============================================================================
// BASE SCHEMAS
// ============================================================================

const baseGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  unit: z.string().min(1, 'Unit is required').max(50),
  categoryId: z.string().uuid().optional(),
});

// ============================================================================
// TARGET-BASED GOAL (discriminated union branch)
// ============================================================================

export const targetBasedGoalSchema = baseGoalSchema.extend({
  goalType: z.literal('TARGET_BASED'),
  targetValue: z.number().positive('Target must be positive'),
  deadline: z.coerce.date(),
});

// ============================================================================
// CONTINUOUS COUNTER GOAL (discriminated union branch)
// ============================================================================

export const continuousGoalSchema = baseGoalSchema.extend({
  goalType: z.literal('CONTINUOUS_COUNTER'),
  targetValue: z.undefined(),  // Explicitly undefined
  deadline: z.undefined(),
});

// ============================================================================
// DISCRIMINATED UNION (enforce correct shape based on goalType)
// ============================================================================

export const createGoalSchema = z.discriminatedUnion('goalType', [
  targetBasedGoalSchema,
  continuousGoalSchema,
]);

// ============================================================================
// INFERRED TYPESCRIPT TYPES
// ============================================================================

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type TargetBasedGoal = z.infer<typeof targetBasedGoalSchema>;
export type ContinuousGoal = z.infer<typeof continuousGoalSchema>;

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface GoalResponse {
  id: string;
  userId: string;
  title: string;
  goalType: 'TARGET_BASED' | 'CONTINUOUS_COUNTER';
  unit: string;
  targetValue: number | null;
  deadline: string | null;
  currentValue: number;
  status: 'ACTIVE' | 'COMPLETED';
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}
```

---

### 2. Utilisation Backend : `backend/src/validators/goals.validator.ts`

```typescript
// Simple re-export
export { createGoalSchema, type CreateGoalInput } from '@shared/types/goals.types';
```

### 3. Utilisation Backend : `backend/src/routes/goals.routes.ts`

```typescript
import express from 'express';
import { createGoalSchema } from '@/validators/goals.validator';
import { validateBody } from '@/middleware/validation.middleware';

const router = express.Router();

// Validation middleware utilise le schema partagé
router.post('/goals', validateBody(createGoalSchema), async (req, res) => {
  // req.body est type-safe ici grâce à Zod
  const goalData = req.body; // Type: CreateGoalInput
  
  // Logique métier...
  const goal = await goalsService.create(req.user.id, goalData);
  
  res.status(201).json(goal);
});

export default router;
```

### 4. Middleware de Validation : `backend/src/middleware/validation.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: result.error.errors,
        }
      });
    }
    
    // Replace body with parsed/coerced data
    req.body = result.data;
    next();
  };
}
```

---

### 5. Utilisation Frontend : `frontend/src/services/api/goals.api.ts`

```typescript
import axios from 'axios';
import { createGoalSchema, type CreateGoalInput, type GoalResponse } from '@shared/types/goals.types';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const goalsApi = {
  async create(data: CreateGoalInput): Promise<GoalResponse> {
    // Validation côté client (optionnelle mais UX++)
    const result = createGoalSchema.safeParse(data);
    
    if (!result.success) {
      // Afficher les erreurs immédiatement sans appeler l'API
      throw new Error('Validation failed: ' + JSON.stringify(result.error.errors));
    }
    
    // API call avec données validées
    const response = await apiClient.post<GoalResponse>('/goals', result.data);
    return response.data;
  },
};
```

---

### 6. Utilisation Frontend : Composant Vue `frontend/src/components/goals/GoalForm.vue`

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { createGoalSchema, type CreateGoalInput } from '@shared/types/goals.types';
import { goalsApi } from '@/services/api/goals.api';

const goalType = ref<'TARGET_BASED' | 'CONTINUOUS_COUNTER'>('TARGET_BASED');
const title = ref('');
const unit = ref('');
const targetValue = ref<number>();
const deadline = ref<string>();
const errors = ref<Record<string, string>>({});

async function onSubmit() {
  errors.value = {};
  
  // Construire l'objet selon le type
  const formData: CreateGoalInput = goalType.value === 'TARGET_BASED'
    ? {
        goalType: 'TARGET_BASED',
        title: title.value,
        unit: unit.value,
        targetValue: targetValue.value!,
        deadline: new Date(deadline.value!),
      }
    : {
        goalType: 'CONTINUOUS_COUNTER',
        title: title.value,
        unit: unit.value,
        targetValue: undefined,
        deadline: undefined,
      };
  
  // Validation côté client
  const result = createGoalSchema.safeParse(formData);
  
  if (!result.success) {
    // Afficher les erreurs dans le formulaire
    result.error.errors.forEach(err => {
      errors.value[err.path.join('.')] = err.message;
    });
    return;
  }
  
  // Appel API (déjà validé)
  try {
    const goal = await goalsApi.create(result.data);
    console.log('Goal created:', goal);
    // Redirect ou notification...
  } catch (error) {
    console.error('API error:', error);
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <!-- Champs de formulaire -->
    <div>
      <label>Goal Type</label>
      <select v-model="goalType">
        <option value="TARGET_BASED">Target-based</option>
        <option value="CONTINUOUS_COUNTER">Continuous Counter</option>
      </select>
    </div>
    
    <div>
      <label>Title</label>
      <input v-model="title" type="text" />
      <span v-if="errors.title" class="error">{{ errors.title }}</span>
    </div>
    
    <!-- Afficher targetValue/deadline uniquement si TARGET_BASED -->
    <div v-if="goalType === 'TARGET_BASED'">
      <label>Target Value</label>
      <input v-model.number="targetValue" type="number" />
      <span v-if="errors.targetValue" class="error">{{ errors.targetValue }}</span>
    </div>
    
    <button type="submit">Create Goal</button>
  </form>
</template>
```

---

## ✅ Avantages de cette Architecture

### 1. Type Safety Complet

```typescript
// ❌ Erreur de compilation si on oublie un champ
const goal: CreateGoalInput = {
  goalType: 'TARGET_BASED',
  title: 'Save money',
  unit: 'dollars',
  // ❌ TypeScript error: Property 'targetValue' is missing
};

// ✅ Correct
const goal: CreateGoalInput = {
  goalType: 'TARGET_BASED',
  title: 'Save money',
  unit: 'dollars',
  targetValue: 5000,
  deadline: new Date('2025-12-31'),
};
```

### 2. Validation Cohérente

```typescript
// Backend ET Frontend utilisent le même schema Zod
// → Mêmes messages d'erreur
// → Mêmes règles de validation (min, max, format)
// → Pas de divergence entre client et serveur
```

### 3. Refactoring Facile

```typescript
// Changement dans shared/types/goals.types.ts :
// Ajouter un nouveau champ 'description'

export const baseGoalSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(500).optional(), // ✨ NOUVEAU
  unit: z.string().min(1).max(50),
  categoryId: z.string().uuid().optional(),
});

// → TypeScript signale automatiquement tous les endroits
//   où ce type est utilisé (backend + frontend)
// → Aucun risque d'oublier un endroit
```

### 4. Documentation Auto-Générée

```typescript
// Les schemas Zod servent aussi de documentation
// Impossible que la doc soit obsolète - elle EST le code

const createGoalSchema = z.discriminatedUnion('goalType', [
  // ...
]);

// → OpenAPI peut être généré depuis Zod avec @anatine/zod-openapi
// → Documentation Swagger automatique
```

---

## 🚀 Workflow de Développement

### Ajouter un nouveau endpoint

1. **Créer le schema dans `shared/types/`**
```typescript
// shared/types/categories.types.ts
export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
```

2. **Re-exporter dans backend validator**
```typescript
// backend/src/validators/categories.validator.ts
export { createCategorySchema } from '@shared/types/categories.types';
```

3. **Utiliser dans route**
```typescript
// backend/src/routes/categories.routes.ts
router.post('/categories', validateBody(createCategorySchema), handler);
```

4. **Utiliser dans frontend**
```typescript
// frontend/src/services/api/categories.api.ts
import { createCategorySchema } from '@shared/types/categories.types';

async create(data: CreateCategoryInput) {
  const result = createCategorySchema.safeParse(data);
  // ...
}
```

---

## 🔍 Points d'Attention

### 1. Coercion de Dates

```typescript
// Dans shared, utiliser z.coerce.date() pour accepter strings
deadline: z.coerce.date()

// Frontend peut envoyer "2025-12-31"
// Backend reçoit Date object après validation Zod
```

### 2. Validation Optionnelle Frontend

```typescript
// Validation frontend = OPTIONNELLE (UX amélioration)
// Validation backend = OBLIGATOIRE (sécurité)

// Ne jamais se fier uniquement à la validation frontend
```

### 3. Hot Reload

```bash
# Avec workspaces npm/yarn, les changements dans shared/
# sont détectés automatiquement par Vite (frontend) et ts-node-dev (backend)

# Aucune recompilation manuelle nécessaire
```

---

## 📚 Ressources

- [Zod Documentation](https://zod.dev/)
- [TypeScript Handbook - Modules](https://www.typescriptlang.org/docs/handbook/modules.html)
- [npm Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [Vite Path Aliases](https://vitejs.dev/config/shared-options.html#resolve-alias)

---

**Résumé** : Schemas Zod définis une fois dans `shared/types/`, importés et utilisés identiquement côté backend (validation API) et frontend (validation formulaires + types TypeScript). Single source of truth garantie ! ✅

