<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  open?: boolean
  title?: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

function close() {
  emit('update:open', false)
}

function handleBackdropClick() {
  close()
}

function handleContentClick(event: Event) {
  event.stopPropagation()
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        @click="handleBackdropClick"
      >
        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <Transition
              enter-active-class="transition-all duration-200"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-200"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="open"
                @click="handleContentClick"
                :class="
                  cn(
                    'relative w-full max-w-lg',
                    'rounded-lg border bg-background p-6 shadow-lg',
                    'animate-in fade-in-90 slide-in-from-bottom-10'
                  )
                "
              >
                <div v-if="title" class="mb-4">
                  <h2 class="text-lg font-semibold">{{ title }}</h2>
                </div>
                <slot />
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

