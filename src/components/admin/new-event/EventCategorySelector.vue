<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { createInterest, getInterests, type Interest } from '@/services/interests'
import { useCreateEventStore } from '@/stores/createEvent'

const { t } = useI18n()
const store = useCreateEventStore()

// ─── State ────────────────────────────────────────────────────
const allInterests = ref<Interest[]>([])
const selectedInterests = ref<Interest[]>([])

const searchQuery = ref('')
const searchResults = ref<Interest[]>([])
const isSearching = ref(false)
const isDropdownOpen = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)

const suggestName = ref('')
const isSuggesting = ref(false)
const suggestError = ref('')
const suggestSuccess = ref(false)
const isSuggestOpen = ref(false)

// ─── Suggested (random 5) ─────────────────────────────────────
const suggestionPool = ref<Interest[]>([])

const suggestedInterests = computed(() =>
  suggestionPool.value.filter(i => !isSelected(i)).slice(0, 5)
)

function refreshSuggestions() {
  const unselected = allInterests.value.filter(i => !isSelected(i))
  // Fisher-Yates shuffle
  const arr = [...unselected]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  suggestionPool.value = arr.slice(0, 5)
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null

// ─── Helpers ──────────────────────────────────────────────────
function isSelected(interest: Interest) {
  return selectedInterests.value.some(i => i.id === interest.id)
}

function syncStore() {
  store.interestIds = selectedInterests.value.map(i => i.id)
}

// ─── Select / Remove ──────────────────────────────────────────
function selectInterest(interest: Interest) {
  if (!isSelected(interest)) {
    selectedInterests.value = [...selectedInterests.value, interest]
    syncStore()
  }
  searchQuery.value = ''
  searchResults.value = []
  isDropdownOpen.value = false
}

function removeInterest(interest: Interest) {
  selectedInterests.value = selectedInterests.value.filter(i => i.id !== interest.id)
  syncStore()
}

// ─── Search ───────────────────────────────────────────────────
async function performSearch() {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    searchResults.value = []
    isDropdownOpen.value = false
    return
  }
  isSearching.value = true
  isDropdownOpen.value = true
  try {
    searchResults.value = allInterests.value.filter(
      item =>
        item.name.toLowerCase().includes(query) &&
        !isSelected(item)
    )
  } finally {
    isSearching.value = false
  }
}

watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(performSearch, 280)
})

function onSearchBlur() {
  setTimeout(() => {
    isDropdownOpen.value = false
  }, 180)
}

// ─── Suggest ──────────────────────────────────────────────────
async function submitSuggestion() {
  const name = suggestName.value.trim()
  if (!name) {
    suggestError.value = t('admin.newEvent.categories.suggestRequired')
    return
  }
  isSuggesting.value = true
  suggestError.value = ''
  try {
    const response = await createInterest(name) as any
    const created: Interest = response?.data ?? response
    if (created?.id) {
      if (!allInterests.value.some(i => i.id === created.id)) {
        allInterests.value = [...allInterests.value, created]
      }
      selectInterest(created)
    }
    suggestSuccess.value = true
    suggestName.value = ''
    setTimeout(() => {
      suggestSuccess.value = false
      isSuggestOpen.value = false
    }, 2400)
  } catch {
    suggestError.value = t('admin.newEvent.categories.suggestError')
  } finally {
    isSuggesting.value = false
  }
}

// ─── Load ─────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const response = await getInterests() as any
    allInterests.value = Array.isArray(response) ? response : (response?.data || [])
    refreshSuggestions()
  } catch { /* silent */ }
})

onBeforeUnmount(() => {
  if (searchTimeout) clearTimeout(searchTimeout)
})
</script>

<template>
  <section class="cat-card">
    <header class="cat-header">
      <span class="mdi mdi-tag-multiple-outline cat-header__icon" />
      <span class="cat-header__title">{{ t('admin.newEvent.categories.title') }}</span>
    </header>

    <div class="search-box">
      <label class="search-box__label" for="cat-search">
        {{ t('admin.newEvent.categories.searchLabel') }}
      </label>
      <div class="search-box__wrap">
        <span class="mdi mdi-magnify search-box__icon" />
        <input
          id="cat-search"
          ref="searchInputRef"
          v-model="searchQuery"
          autocomplete="off"
          class="search-box__input"
          :placeholder="t('admin.newEvent.categories.searchPlaceholder')"
          type="search"
          @blur="onSearchBlur"
          @focus="searchQuery.trim() && (isDropdownOpen = true)"
        >
        <span v-if="isSearching" class="mdi mdi-loading mdi-spin search-box__spinner" />
      </div>

      <div v-if="isDropdownOpen" class="dropdown" role="listbox">
        <button
          v-for="item in searchResults"
          :key="item.id"
          class="dropdown__item"
          role="option"
          type="button"
          @mousedown.prevent="selectInterest(item)"
        >
          <span class="mdi mdi-tag-outline dropdown__item-icon" />
          {{ item.name }}
          <span class="mdi mdi-plus-circle dropdown__item-add" />
        </button>
        <p v-if="!isSearching && searchResults.length === 0" class="dropdown__empty">
          {{ t('admin.newEvent.categories.noResults') }}
        </p>
      </div>
    </div>

    <!-- Suggested interests -->
    <div v-if="suggestedInterests.length > 0 && !searchQuery.trim()" class="suggestions">
      <span class="suggestions__label">
        <span class="mdi mdi-fire suggestions__label-icon" />
        {{ t('admin.newEvent.categories.suggestionsLabel') }}
      </span>
      <div class="suggestions__list">
        <button
          v-for="item in suggestedInterests"
          :key="item.id"
          class="suggestion-chip"
          type="button"
          @click="selectInterest(item); refreshSuggestions()"
        >
          {{ item.name }}
          <span class="mdi mdi-plus suggestion-chip__icon" />
        </button>
        <button
          class="suggestion-chip suggestion-chip--refresh"
          :title="t('admin.newEvent.categories.refreshSuggestions')"
          type="button"
          @click="refreshSuggestions()"
        >
          <span class="mdi mdi-refresh" />
        </button>
      </div>
    </div>

    <div class="selected-area">
      <p v-if="selectedInterests.length === 0" class="selected-area__empty">
        <span class="mdi mdi-information-outline" />
        {{ t('admin.newEvent.categories.noneSelected') }}
      </p>
      <div v-else class="chip-list">
        <span
          v-for="interest in selectedInterests"
          :key="interest.id"
          class="chip"
        >
          {{ interest.name }}
          <button
            :aria-label="`${t('admin.newEvent.categories.removeChip')} ${interest.name}`"
            class="chip__remove"
            type="button"
            @click="removeInterest(interest)"
          >
            <span class="mdi mdi-close" />
          </button>
        </span>
      </div>
    </div>

    <div class="suggest-section">
      <button
        class="suggest-toggle"
        type="button"
        @click="isSuggestOpen = !isSuggestOpen"
      >
        <span class="mdi mdi-lightbulb-on-outline suggest-toggle__icon" />
        {{ t('admin.newEvent.categories.suggestToggle') }}
        <span :class="['mdi', isSuggestOpen ? 'mdi-chevron-up' : 'mdi-chevron-down', 'suggest-toggle__chevron']" />
      </button>

      <Transition name="slide-down">
        <div v-if="isSuggestOpen" class="suggest-panel">
          <p class="suggest-panel__desc">{{ t('admin.newEvent.categories.suggestDesc') }}</p>

          <div v-if="suggestSuccess" class="suggest-success">
            <span class="mdi mdi-check-circle" />
            {{ t('admin.newEvent.categories.suggestSuccessMsg') }}
          </div>

          <template v-else>
            <div class="suggest-panel__field">
              <input
                v-model="suggestName"
                class="suggest-panel__input"
                :disabled="isSuggesting"
                :placeholder="t('admin.newEvent.categories.suggestPlaceholder')"
                type="text"
                @keydown.enter.prevent="submitSuggestion"
              >
              <button
                class="suggest-panel__btn"
                :disabled="isSuggesting || !suggestName.trim()"
                type="button"
                @click="submitSuggestion"
              >
                <span v-if="isSuggesting" class="mdi mdi-loading mdi-spin" />
                <span v-else class="mdi mdi-send" />
                {{ t('admin.newEvent.categories.suggestSend') }}
              </button>
            </div>
            <p v-if="suggestError" class="suggest-panel__error">
              <span class="mdi mdi-alert-circle-outline" />
              {{ suggestError }}
            </p>
          </template>
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.cat-card {
  --grad: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
  background: linear-gradient(#f8f8ff, #f8f8ff) padding-box, var(--grad) border-box;
  border: 1px solid transparent;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cat-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cat-header__icon {
  font-size: 20px;
  background: var(--grad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cat-header__title {
  color: #3b3b45;
  font-size: 15px;
  font-weight: 700;
}

.search-box {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-box__label {
  color: #6b6b7b;
  font-size: 13px;
  font-weight: 600;
}

.search-box__wrap {
  position: relative;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1.5px solid rgba(219, 219, 229, 0.9);
  border-radius: 12px;
  padding: 0 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-box__wrap:focus-within {
  border-color: rgba(255, 79, 148, 0.55);
  box-shadow: 0 0 0 3px rgba(255, 79, 148, 0.12);
}

.search-box__icon {
  color: #aaaabc;
  font-size: 18px;
  flex-shrink: 0;
}

.search-box__input {
  flex: 1;
  background: transparent;
  border: none;
  color: #3b3b45;
  font-size: 14px;
  padding: 12px 10px;
}

.search-box__input:focus {
  outline: none;
}

.search-box__input::-webkit-search-cancel-button {
  display: none;
}

.search-box__spinner {
  color: #ff4f94;
  font-size: 18px;
}

.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid rgba(219, 219, 229, 0.7);
  border-radius: 12px;
  box-shadow: 0 8px 24px -8px rgba(33, 33, 77, 0.18);
  max-height: 220px;
  overflow-y: auto;
  z-index: 500;
  padding: 6px;
}

.dropdown__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #3b3b45;
  text-align: left;
  transition: background 0.15s;
}

.dropdown__item:hover {
  background: rgba(255, 79, 148, 0.07);
}

.dropdown__item-icon {
  color: #aaaabc;
  font-size: 16px;
}

.dropdown__item-add {
  margin-left: auto;
  color: #ff4f94;
  font-size: 18px;
  opacity: 0;
  transition: opacity 0.15s;
}

.dropdown__item:hover .dropdown__item-add {
  opacity: 1;
}

.dropdown__empty {
  padding: 16px;
  text-align: center;
  color: #8b8b99;
  font-size: 13px;
}

.selected-area {
  min-height: 44px;
}

.selected-area__empty {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #aaaabc;
  font-size: 13px;
}

.selected-area__empty .mdi {
  font-size: 16px;
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--grad);
  border-radius: 999px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px 6px 14px;
}

.chip__remove {
  background: rgba(255, 255, 255, 0.25);
  border: none;
  border-radius: 50%;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  width: 18px;
  padding: 0;
  transition: background 0.15s;
}

.chip__remove:hover {
  background: rgba(255, 255, 255, 0.45);
}

.chip__remove .mdi {
  font-size: 12px;
}

.suggest-section {
  border-top: 1px solid rgba(219, 219, 229, 0.55);
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.suggest-toggle {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #8b6bff;
  font-size: 13px;
  font-weight: 600;
  padding: 0;
  width: 100%;
}

.suggest-toggle__icon {
  font-size: 17px;
}

.suggest-toggle__chevron {
  font-size: 16px;
  margin-left: auto;
}

.suggest-panel {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggest-panel__desc {
  color: #6b6b7b;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

.suggest-panel__field {
  display: flex;
  gap: 8px;
}

.suggest-panel__input {
  flex: 1;
  background: #ffffff;
  border: 1.5px solid rgba(219, 219, 229, 0.9);
  border-radius: 10px;
  color: #3b3b45;
  font-size: 14px;
  padding: 10px 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.suggest-panel__input:focus {
  border-color: rgba(139, 107, 255, 0.55);
  box-shadow: 0 0 0 3px rgba(139, 107, 255, 0.12);
  outline: none;
}

.suggest-panel__input:disabled {
  opacity: 0.6;
}

.suggest-panel__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(270deg, #8b6bff 0%, #b46cff 100%);
  border: none;
  border-radius: 10px;
  color: #ffffff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 16px;
  transition: opacity 0.2s, transform 0.15s;
  white-space: nowrap;
}

.suggest-panel__btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.suggest-panel__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.suggest-panel__error {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #d82b56;
  font-size: 13px;
  margin: 0;
}

.suggest-success {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(52, 199, 89, 0.1);
  border: 1px solid rgba(52, 199, 89, 0.3);
  border-radius: 10px;
  color: #1a7f37;
  font-size: 13px;
  font-weight: 600;
  padding: 12px 16px;
}

.suggest-success .mdi {
  font-size: 18px;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Suggestions ── */
.suggestions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestions__label {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #8b8b99;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.suggestions__label-icon {
  font-size: 14px;
  background: var(--grad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.suggestions__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.suggestion-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #ffffff;
  border: 1.5px solid rgba(255, 79, 148, 0.28);
  border-radius: 999px;
  color: #ff4f94;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  padding: 5px 12px 5px 14px;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.suggestion-chip:hover {
  background: rgba(255, 79, 148, 0.07);
  border-color: rgba(255, 79, 148, 0.55);
}

.suggestion-chip__icon {
  font-size: 14px;
  opacity: 0.7;
}

.suggestion-chip--refresh {
  background: #f4f4fb;
  border-color: rgba(139, 107, 255, 0.25);
  color: #8b6bff;
  padding: 5px 10px;
}

.suggestion-chip--refresh:hover {
  background: rgba(139, 107, 255, 0.08);
  border-color: rgba(139, 107, 255, 0.5);
}

.suggestion-chip--refresh .mdi {
  font-size: 16px;
}
</style>
