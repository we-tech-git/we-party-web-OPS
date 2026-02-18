<!--
  Componente: Snackbar.vue
  Descrição: Componente de notificação toast
-->
<script setup lang="ts">
  import { onMounted, watch } from 'vue'

  const props = withDefaults(defineProps<{
    modelValue: boolean
    message: string
    color?: string
    timeout?: number
  }>(), {
    color: '#ff9800',
    timeout: 4000,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>()

  let timeoutId: ReturnType<typeof setTimeout> | null = null

  function startTimer () {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    if (props.modelValue && props.timeout > 0) {
      timeoutId = setTimeout(() => {
        emit('update:modelValue', false)
      }, props.timeout)
    }
  }

  function close () {
    emit('update:modelValue', false)
  }

  watch(() => props.modelValue, newValue => {
    if (newValue) {
      startTimer()
    }
  })

  onMounted(() => {
    if (props.modelValue) {
      startTimer()
    }
  })
</script>

<template>
  <Teleport to="body">
    <Transition name="snackbar">
      <div v-if="modelValue" class="snackbar-container">
        <div class="snackbar" :style="{ backgroundColor: color }">
          <span class="snackbar-message">{{ message }}</span>
          <button class="snackbar-close" @click="close">✕</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.snackbar-container {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
}

.snackbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-radius: 12px;
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  max-width: 400px;
  min-width: 280px;
}

.snackbar-message {
  flex: 1;
}

.snackbar-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  font-size: 1rem;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.snackbar-close:hover {
  opacity: 1;
}

/* Animações */
.snackbar-enter-active,
.snackbar-leave-active {
  transition: all 0.3s ease;
}

.snackbar-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.snackbar-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
