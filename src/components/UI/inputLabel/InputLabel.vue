<!--
  Componente: InputLabel.vue
  Descrição: Input de formulário com label flutuante
-->
<script setup lang="ts">
  import { computed, ref } from 'vue'

  const props = defineProps<{
    id: string
    modelValue: string
    label: string
    type?: string
    error?: boolean
    inputPassword?: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const isFocused = ref(false)
  const showPassword = ref(false)

  const inputType = computed(() => {
    if (props.inputPassword) {
      return showPassword.value ? 'text' : 'password'
    }
    return props.type || 'text'
  })

  const isActive = computed(() => {
    return isFocused.value || props.modelValue?.length > 0
  })

  const isFilled = computed(() => {
    return props.modelValue?.length > 0
  })

  function onInput (event: Event) {
    const target = event.target as HTMLInputElement
    emit('update:modelValue', target.value)
  }

  function togglePassword () {
    showPassword.value = !showPassword.value
  }
</script>

<template>
  <div class="input-label-wrapper">
    <div class="input-container" :class="{ focused: isFocused, filled: isFilled, error: error }">
      <input
        :id="id"
        class="input-field"
        :type="inputType"
        :value="modelValue"
        @blur="isFocused = false"
        @focus="isFocused = true"
        @input="onInput"
      >
      <label class="floating-label" :class="{ active: isActive }" :for="id">
        {{ label }}
      </label>

      <!-- Botão para mostrar/esconder senha -->
      <button
        v-if="inputPassword"
        class="toggle-password"
        tabindex="-1"
        type="button"
        @click="togglePassword"
      >
        <span v-if="showPassword">👁️</span>
        <span v-else>👁️‍🗨️</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.input-label-wrapper {
  width: 100%;
  margin-bottom: 1rem;
}

.input-container {
  position: relative;
  width: 100%;
}

.input-field {
  width: 100%;
  padding: 24px 16px 8px 16px;
  background-color: #FFFFFF;
  border: 1.5px solid var(--il-border-neutral, #F0F0F0);
  border-radius: 12px;
  color: var(--il-text, #072961);
  transition: all 0.2s ease-in-out;
  font-size: 1rem;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.04);
}

.input-container.filled .input-field {
  border-color: var(--il-border-filled, #FBC0D6);
  font-weight: 500;
}

.input-container.focused .input-field {
  outline: none;
  border-color: var(--il-border-focus, #F978A3);
  box-shadow: 0 0 0 3px var(--il-focus-halo, rgba(249, 120, 163, 0.2));
}

.input-container.error .input-field {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.floating-label {
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
  transition: all 0.2s ease;
  font-size: 1rem;
  background: transparent;
}

.floating-label.active {
  top: 12px;
  transform: translateY(0);
  font-size: 0.75rem;
  color: var(--il-label-active, #F7A4C0);
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  font-size: 1.2rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.toggle-password:hover {
  opacity: 1;
}
</style>
