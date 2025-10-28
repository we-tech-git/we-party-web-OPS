<template>
  <div ref="switcherRef" class="language-switcher">
    <button
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      class="switcher-trigger"
      type="button"
      @click="toggleMenu"
    >
      <span aria-hidden="true" class="mdi mdi-web" />
      <span class="sr-only">{{ currentLanguage }}</span>
    </button>

    <transition name="fade">
      <ul v-if="isOpen" aria-label="Select language" class="switcher-menu" role="listbox">
        <li v-for="lang in availableLanguages" :key="lang.code">
          <button
            :aria-selected="locale === lang.code"
            :class="['switcher-option', { 'switcher-option--active': locale === lang.code }]"
            role="option"
            type="button"
            @click="selectLanguage(lang.code)"
          >
            {{ lang.name }}
          </button>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { locale } = useI18n()

  const availableLanguages = [
    { code: 'pt-BR', name: 'Português' },
    { code: 'en-US', name: 'English' },
  ]

  const isOpen = ref(false)
  const switcherRef = ref<HTMLElement | null>(null)

  const currentLanguage = computed(() => {
    const found = availableLanguages.find(lang => lang.code === locale.value)
    return found ? found.name : locale.value
  })

  function toggleMenu () {
    isOpen.value = !isOpen.value
  }

  function selectLanguage (langCode: string) {
    locale.value = langCode
    isOpen.value = false
  }

  function handleClickOutside (event: MouseEvent) {
    if (!switcherRef.value) return
    if (!(event.target instanceof Node)) return

    if (!switcherRef.value.contains(event.target)) {
      isOpen.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })
</script>

<style scoped>
.language-switcher {
  align-items: center;
  display: inline-flex;
  position: relative;
  z-index: 10;
}

.switcher-trigger {
  align-items: center;
  background-color: transparent;
  border: none;
  border-radius: 50%;
  color: #6b6b7b;
  cursor: pointer;
  display: inline-flex;
  font-size: 20px;
  height: 40px;
  justify-content: center;
  transition: background-color 0.2s ease, color 0.2s ease;
  width: 40px;
}

.switcher-trigger:hover,
.switcher-trigger:focus-visible {
  background-color: rgba(255, 79, 148, 0.12);
  color: #ff4f94;
  outline: none;
}

.switcher-menu {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 16px 32px -20px rgba(33, 33, 77, 0.35);
  margin-top: 12px;
  min-width: 160px;
  overflow: hidden;
  padding: 8px;
}

.switcher-option {
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #5c5c6d;
  cursor: pointer;
  display: block;
  font-weight: 500;
  padding: 10px 14px;
  text-align: left;
  width: 100%;
}

.switcher-option:hover,
.switcher-option:focus-visible {
  background-color: rgba(255, 79, 148, 0.1);
  color: #ff4f94;
  outline: none;
}

.switcher-option--active {
  background-color: rgba(255, 79, 148, 0.18);
  color: #ff4f94;
  font-weight: 600;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.16s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.sr-only {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
}
</style>
