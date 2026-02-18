<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getInterests, searchInterestsByName, type Interest } from '@/services/interests'
import { useCreateEventStore } from '@/stores/createEvent'

const { t } = useI18n()
const store = useCreateEventStore()

const emit = defineEmits<{
  (e: 'add-category', value: string): void
}>()

// Interesses vindos da API
const apiInterests = ref<Interest[]>([])
const isLoadingInterests = ref(false)
const loadError = ref('')

const selectedInterestIds = ref<string[]>([])
const isModalOpen = ref(false)
const searchQuery = ref('')
const searchResults = ref<Interest[]>([])
const isSearching = ref(false)
const modalError = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const modalInputId = `category-modal-input-${Math.random().toString(36).slice(2, 8)}`

const allInterests = computed(() => apiInterests.value)

function isSelected(interest: Interest) {
  return selectedInterestIds.value.includes(interest.id)
}

function toggleCategory(interest: Interest) {
  if (isSelected(interest)) {
    selectedInterestIds.value = selectedInterestIds.value.filter(id => id !== interest.id)
  } else {
    selectedInterestIds.value = [...selectedInterestIds.value, interest.id]
  }
  // Sincronizar com o store
  store.interestIds = [...selectedInterestIds.value]
}

async function fetchInterests() {
  isLoadingInterests.value = true
  loadError.value = ''
  try {
    const response = await getInterests() as any
    // A API retorna { success: true, data: [...] }
    const data = Array.isArray(response) ? response : (response?.data || [])
    apiInterests.value = data
  } catch {
    loadError.value = t('admin.newEvent.categories.loadError')
  } finally {
    isLoadingInterests.value = false
  }
}

function openAddModal() {
  searchQuery.value = ''
  searchResults.value = []
  modalError.value = ''
  isModalOpen.value = true
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

function closeAddModal() {
  isModalOpen.value = false
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null

async function performSearch() {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  try {
    // Busca todos os interesses e filtra localmente pelo nome
    const response = await getInterests() as any
    const allData = Array.isArray(response) ? response : (response?.data || [])
    // Filtra os interesses que contêm a query no nome
    searchResults.value = allData.filter((item: Interest) =>
      item.name.toLowerCase().includes(query)
    )
  } catch {
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

function addInterestFromSearch(interest: Interest) {
  // Add to local list if not already present
  if (!apiInterests.value.some(i => i.id === interest.id)) {
    apiInterests.value = [...apiInterests.value, interest]
  }
  // Auto-select it
  if (!selectedInterestIds.value.includes(interest.id)) {
    selectedInterestIds.value = [...selectedInterestIds.value, interest.id]
    // Sincronizar com o store
    store.interestIds = [...selectedInterestIds.value]
  }
  emit('add-category', interest.name)
  closeAddModal()
}

function handleKeydown(event: KeyboardEvent) {
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

watch(searchQuery, () => {
  if (modalError.value) {
    modalError.value = ''
  }
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(performSearch, 350)
})

onMounted(() => {
  fetchInterests()
})

onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow ?? ''
  document.removeEventListener('keydown', handleKeydown)
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>

<template>
  <section class="category-card">
    <header class="card-title">{{ t('admin.newEvent.categories.title') }}</header>

    <!-- Loading State -->
    <div v-if="isLoadingInterests" class="loading-state">
      <span class="mdi mdi-loading mdi-spin" />
      <span>{{ t('admin.newEvent.categories.loading') }}</span>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="error-state">
      <span class="mdi mdi-alert-circle-outline" />
      <span>{{ loadError }}</span>
      <button class="retry-btn" type="button" @click="fetchInterests">
        {{ t('admin.newEvent.categories.retry') }}
      </button>
    </div>

    <!-- Interests Grid -->
    <div v-else class="chip-grid">
      <button v-for="interest in allInterests" :key="interest.id" :aria-pressed="isSelected(interest)"
        :class="['category-chip', { 'category-chip--active': isSelected(interest) }]" type="button"
        @click="toggleCategory(interest)">
        {{ interest.name }}
      </button>
      <button :aria-label="t('admin.newEvent.categories.addMore')" class="add-more" type="button" @click="openAddModal">
        <span aria-hidden="true" class="mdi mdi-plus" />
      </button>
    </div>

    <Teleport to="body">
      <div v-if="isModalOpen" aria-modal="true" class="category-modal__backdrop" role="dialog"
        @click.self="closeAddModal">
        <div class="category-modal">
          <header class="category-modal__header">
            <h2 class="category-modal__title">{{ t('admin.newEvent.categories.searchModalTitle') }}</h2>
            <button class="category-modal__close" type="button" @click="closeAddModal">×</button>
          </header>
          <p class="category-modal__description">{{ t('admin.newEvent.categories.searchModalDescription') }}</p>

          <div class="category-modal__search">
            <span class="mdi mdi-magnify" />
            <input :id="modalInputId" ref="searchInputRef" v-model="searchQuery"
              :placeholder="t('admin.newEvent.categories.searchPlaceholder')" type="search">
          </div>

          <div class="search-results">
            <div v-if="isSearching" class="search-loading">
              <span class="mdi mdi-loading mdi-spin" />
            </div>
            <template v-else-if="searchResults.length > 0">
              <button v-for="result in searchResults" :key="result.id" class="search-result-item" type="button"
                @click="addInterestFromSearch(result)">
                <span>{{ result.name }}</span>
                <span class="mdi mdi-plus-circle-outline" />
              </button>
            </template>
            <p v-else-if="searchQuery.trim()" class="search-empty">
              {{ t('admin.newEvent.categories.noResults') }}
            </p>
          </div>

          <div class="category-modal__actions">
            <button class="category-modal__btn category-modal__btn--secondary" type="button" @click="closeAddModal">
              {{ t('admin.newEvent.categories.addModalCancel') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

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

/* Loading & Error States */
.loading-state {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px;
  color: #8b8b99;
  font-size: 14px;
}

.loading-state .mdi {
  font-size: 20px;
  color: #b46cff;
}

.error-state {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  color: #d82b56;
  font-size: 14px;
}

.error-state .mdi {
  font-size: 20px;
}

.retry-btn {
  margin-left: auto;
  background: transparent;
  border: 1px solid rgba(255, 79, 148, 0.4);
  border-radius: 8px;
  color: #ff3276;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: rgba(255, 79, 148, 0.08);
}

/* Search Modal */
.category-modal__search {
  align-items: center;
  background-color: #f6f6fb;
  border-radius: 14px;
  display: flex;
  margin-bottom: 16px;
  padding: 0 14px;
}

.category-modal__search .mdi {
  color: #8b8b99;
  font-size: 18px;
}

.category-modal__search input {
  background: transparent;
  border: none;
  color: #3b3b45;
  flex: 1;
  font-size: 0.95rem;
  padding: 12px 10px;
}

.category-modal__search input:focus {
  outline: none;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 260px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: #b46cff;
  font-size: 24px;
}

.search-result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f8ff;
  border: 1px solid rgba(171, 151, 255, 0.15);
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #3b3b45;
  transition: all 0.2s ease;
}

.search-result-item:hover {
  background: rgba(255, 79, 148, 0.08);
  border-color: rgba(255, 79, 148, 0.3);
}

.search-result-item .mdi {
  color: #b46cff;
  font-size: 20px;
}

.search-empty {
  text-align: center;
  padding: 24px;
  color: #8b8b99;
  font-size: 14px;
}
</style>
