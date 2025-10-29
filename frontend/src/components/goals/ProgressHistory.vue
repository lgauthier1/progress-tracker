<script setup lang="ts">
/**
 * ProgressHistory Component
 * 
 * Chronological list of progress entries with edit/delete actions.
 * 
 * Constitution: TypeScript Strict Mode
 */

import type { ProgressEntry } from '../../types/goals.types'
import Card from '../ui/Card.vue'
import Button from '../ui/Button.vue'

interface Props {
  entries: ProgressEntry[]
  unit: string
}

defineProps<Props>()

const emit = defineEmits<{
  delete: [entryId: string]
  edit: [entry: ProgressEntry]
}>()

function handleDelete(entryId: string) {
  if (confirm('Are you sure you want to delete this progress entry?')) {
    emit('delete', entryId)
  }
}

function handleEdit(entry: ProgressEntry) {
  emit('edit', entry)
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <Card class="p-6">
    <h3 class="text-lg font-semibold mb-4">Progress History</h3>

    <div v-if="entries.length === 0" class="text-center py-8 text-muted-foreground">
      <p>No progress entries yet.</p>
      <p class="text-sm mt-2">Add your first progress entry to get started!</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="entry in entries"
        :key="entry.id"
        class="p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- Value -->
            <div class="flex items-baseline gap-2 mb-1">
              <span class="text-lg font-semibold">
                <template v-if="entry.value >= 0">+</template>{{ entry.value }} {{ unit }}
              </span>
              <span class="text-xs text-muted-foreground">
                {{ formatDate(entry.entryDate) }}
              </span>
            </div>

            <!-- Note -->
            <p v-if="entry.note" class="text-sm text-muted-foreground mt-1">
              {{ entry.note }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 ml-4">
            <Button
              size="sm"
              variant="ghost"
              @click="handleEdit(entry)"
              class="h-8 w-8 p-0"
              title="Edit"
            >
              ✏️
            </Button>
            <Button
              size="sm"
              variant="ghost"
              @click="handleDelete(entry.id)"
              class="h-8 w-8 p-0 hover:text-destructive"
              title="Delete"
            >
              🗑️
            </Button>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="pt-3 border-t">
        <p class="text-sm text-muted-foreground">
          Total entries: <span class="font-medium text-foreground">{{ entries.length }}</span>
        </p>
      </div>
    </div>
  </Card>
</template>

