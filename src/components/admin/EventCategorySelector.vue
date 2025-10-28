<template>
  <section class="category-card">
    <header class="card-title">{{ t('admin.newEvent.categories.title') }}</header>
    <div class="chip-grid">
      <button
        v-for="tag in allCategories"
        :key="tag"
        :aria-pressed="isSelected(tag)"
        :class="['category-chip', { 'category-chip--active': isSelected(tag) }]"
        type="button"
        @click="toggleCategory(tag)"
      >
        {{ tag }}
      </button>
      <button :aria-label="t('admin.newEvent.categories.addMore')" class="add-more" type="button" @click="openAddModal">
        <span aria-hidden="true" class="mdi mdi-plus" />
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="isModalOpen"
        aria-modal="true"
        class="category-modal__backdrop"
        role="dialog"
        @click.self="closeAddModal"
      >
        <div class="category-modal">
          <header class="category-modal__header">
            <h2 class="category-modal__title">{{ t('admin.newEvent.categories.addModalTitle') }}</h2>
            <button class="category-modal__close" type="button" @click="closeAddModal">×</button>
          </header>
          <p class="category-modal__description">{{ t('admin.newEvent.categories.addModalDescription') }}</p>
          <form class="category-modal__form" @submit.prevent="confirmAddCategory">
            <label class="category-modal__label" :for="modalInputId">
              {{ t('admin.newEvent.categories.addModalLabel') }}
            </label>
            <input
              :id="modalInputId"
              ref="modalInputRef"
              v-model="newCategoryName"
              class="category-modal__input"
              :placeholder="t('admin.newEvent.categories.addModalPlaceholder')"
              type="text"
            >
            <p v-if="modalError" class="category-modal__error">{{ modalError }}</p>
            <div class="category-modal__actions">
              <button class="category-modal__btn category-modal__btn--secondary" type="button" @click="closeAddModal">
                {{ t('admin.newEvent.categories.addModalCancel') }}
              </button>
              <button class="category-modal__btn" type="submit">
                {{ t('admin.newEvent.categories.addModalConfirm') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t, tm } = useI18n()

  const emit = defineEmits<{
    (e: 'add-category', value: string): void
  }>()

  const baseCategories = computed(() => {
    const value = tm('admin.newEvent.categories.list')
    return Array.isArray(value) ? (value as string[]) : []
  })

  const selectedCategories = ref<string[]>([])
  const customCategories = ref<string[]>([])
  const isModalOpen = ref(false)
  const newCategoryName = ref('')
  const modalError = ref('')
  const modalInputRef = ref<HTMLInputElement | null>(null)
  const modalInputId = `category-modal-input-${Math.random().toString(36).slice(2, 8)}`

  const allCategories = computed(() => [...baseCategories.value, ...customCategories.value])

  function isSelected (tag: string) {
    return selectedCategories.value.includes(tag)
  }

  function toggleCategory (tag: string) {
    if (isSelected(tag)) {
      selectedCategories.value = selectedCategories.value.filter(item => item !== tag)
      return
    }

    selectedCategories.value = [...selectedCategories.value, tag]
  }

  function openAddModal () {
    newCategoryName.value = ''
    modalError.value = ''
    isModalOpen.value = true
    nextTick(() => {
      modalInputRef.value?.focus()
    })
  }

  function closeAddModal () {
    isModalOpen.value = false
  }

  function confirmAddCategory () {
    const label = newCategoryName.value.trim()

    if (!label) {
      modalError.value = t('admin.newEvent.categories.addModalRequired')
      return
    }

    if (allCategories.value.some(item => item.toLowerCase() === label.toLowerCase())) {
      modalError.value = t('admin.newEvent.categories.duplicateMessage')
      return
    }

    customCategories.value = [...customCategories.value, label]
    selectedCategories.value = [...selectedCategories.value, label]
    emit('add-category', label)
    closeAddModal()
  }

  function handleKeydown (event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeAddModal()
    }
  }

  let previousBodyOverflow: string | null = null

  watch(isModalOpen, value => {
    if (value) {
      previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeydown)
    } else {
      document.body.style.overflow = previousBodyOverflow ?? ''
      document.removeEventListener('keydown', handleKeydown)
    }
  })

  watch(newCategoryName, () => {
    if (modalError.value) {
      modalError.value = ''
    }
  })

  onBeforeUnmount(() => {
    document.body.style.overflow = previousBodyOverflow ?? ''
    document.removeEventListener('keydown', handleKeydown)
  })
</script>

<style scoped>
.category-card {
  --brand-gradient: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
  background: linear-gradient(#f8f8ff, #f8f8ff) padding-box, var(--brand-gradient) border-box;
  border: 1px solid transparent;
  border-radius: 16px;
  padding: 24px;
}

.card-title {
  color: #5c5c6d;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 20px;
}

.chip-grid {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.category-chip {
  align-items: center;
  background: #ffffff;
  border: 1px solid rgba(255, 79, 148, 0.3);
  border-radius: 14px;
  cursor: pointer;
  display: inline-flex;
  color: #ff3276;
  font-weight: 600;
  justify-content: center;
  padding: 10px 18px;
  text-transform: none;
}

.category-chip--active {
  background: var(--brand-gradient);
  border: none;
  box-shadow: 0 8px 18px -16px rgba(255, 79, 148, 0.8);
  color: #ffffff !important;
}

.category-chip:focus-visible,
.add-more:focus-visible {
  outline: 3px solid rgba(255, 79, 148, 0.45);
  outline-offset: 2px;
}

.add-more {
  align-items: center;
  background: var(--brand-gradient);
  border-radius: 14px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  color: #ffffff !important;
  height: 44px;
  width: 44px;
}

.add-more .mdi {
  font-size: 22px;
}

.category-modal__backdrop {
  align-items: center;
  background-color: rgba(15, 15, 35, 0.45);
  bottom: 0;
  display: flex;
  justify-content: center;
  left: 0;
  padding: 24px;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 2100;
}

.category-modal {
  --brand-gradient: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
  background-color: #ffffff;
  border-radius: 18px;
  box-shadow: 0 16px 40px -18px rgba(33, 33, 77, 0.45);
  padding: 26px 24px;
  width: min(420px, 92vw);
}

.category-modal__header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.category-modal__title {
  color: #3b3b45;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
}

.category-modal__close {
  background: transparent;
  border: none;
  color: #6b6b7b;
  cursor: pointer;
  font-size: 1.4rem;
  line-height: 1;
}

.category-modal__description {
  color: #6b6b7b;
  font-size: 0.95rem;
  margin-bottom: 18px;
}

.category-modal__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-modal__label {
  color: #4b4b57;
  font-weight: 600;
}

.category-modal__input {
  border: 1px solid rgba(219, 219, 229, 0.9);
  border-radius: 14px;
  padding: 12px 16px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.category-modal__input:focus {
  border-color: rgba(255, 79, 148, 0.6);
  box-shadow: 0 0 0 3px rgba(255, 79, 148, 0.18);
  outline: none;
}

.category-modal__error {
  color: #d82b56;
  font-size: 0.85rem;
  margin: -4px 0 4px;
}

.category-modal__actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.category-modal__btn {
  align-items: center;
  background: var(--brand-gradient);
  border: none;
  border-radius: 999px;
  color: #ffffff;
  cursor: pointer;
  display: inline-flex;
  font-weight: 600;
  gap: 6px;
  justify-content: center;
  min-width: 110px;
  padding: 10px 18px;
  transition: transform 0.15s ease;
}

.category-modal__btn:hover {
  transform: translateY(-1px);
}

.category-modal__btn--secondary {
  background: #f2f2f9;
  color: #4b4b57;
}

.category-modal__btn--secondary:hover {
  transform: none;
}

.category-modal__btn:focus-visible {
  outline: 3px solid rgba(255, 79, 148, 0.35);
  outline-offset: 2px;
}
</style>
