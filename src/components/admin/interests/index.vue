<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import {
    createInterest,
    deleteInterest,
    getInterests,
    type Interest,
    searchInterestsByName,
  } from '@/services/interests'
  import InterestsList from './InterestsList.vue'
  import RequestsQueue from './RequestsQueue.vue'

  const { t } = useI18n()

  // ─── State ────────────────────────────────────────────────
  const interests = ref<Interest[]>([])
  const isLoading = ref(false)
  const loadError = ref<string | null>(null)
  const searchQuery = ref('')
  const isSearching = ref(false)

  const requests = ref<Array<{
    id: number
    name: string
    requestedBy: string
    date: string
    time: string
  }>>([])

  // ─── Fetch interests ─────────────────────────────────────
  async function fetchInterests () {
    isLoading.value = true
    loadError.value = null
    try {
      interests.value = await getInterests()
    } catch {
      loadError.value = t('admin.interests.loadError')
    } finally {
      isLoading.value = false
    }
  }

  // ─── Search ───────────────────────────────────────────────
  let searchTimeout: ReturnType<typeof setTimeout> | null = null

  function handleSearch (query: string) {
    searchQuery.value = query

    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    if (!query.trim()) {
      fetchInterests()
      return
    }

    searchTimeout = setTimeout(async () => {
      isSearching.value = true
      try {
        interests.value = await searchInterestsByName(query.trim())
      } catch {
        // fallback: keep current list
      } finally {
        isSearching.value = false
      }
    }, 350)
  }

  // ─── Add Interest ─────────────────────────────────────────
  const isAddModalOpen = ref(false)
  const newInterestName = ref('')
  const isAdding = ref(false)
  const addError = ref<string | null>(null)

  function openAddModal () {
    newInterestName.value = ''
    addError.value = null
    isAddModalOpen.value = true
  }

  function closeAddModal () {
    isAddModalOpen.value = false
  }

  async function addNewInterest () {
    const name = newInterestName.value.trim()
    if (!name) {
      return
    }

    isAdding.value = true
    addError.value = null
    try {
      const created = await createInterest(name)
      interests.value.push(created)
      closeAddModal()
    } catch {
      addError.value = t('admin.interests.addModal.error')
    } finally {
      isAdding.value = false
    }
  }

  // ─── Remove Interest ─────────────────────────────────────
  const isRemoving = ref<string | null>(null)

  async function removeInterest (id: string) {
    isRemoving.value = id
    try {
      await deleteInterest(id)
      interests.value = interests.value.filter(i => i.id !== id)
    } catch {
      // silently fail or could show snackbar
    } finally {
      isRemoving.value = null
    }
  }

  // ─── Request Queue (mock — no API yet) ────────────────────
  function approveRequest (id: number) {
    requests.value = requests.value.filter(r => r.id !== id)
    // When API exists: POST /interest/requests/:id/approve
    fetchInterests()
  }

  function rejectRequest (id: number) {
    requests.value = requests.value.filter(r => r.id !== id)
    // When API exists: POST /interest/requests/:id/reject
  }

  // ─── Computed ─────────────────────────────────────────────
  const totalInterests = computed(() => interests.value.length)

  // ─── Init ─────────────────────────────────────────────────
  onMounted(fetchInterests)
</script>

<template>
  <div class="interests-page">
    <!-- Header Section -->
    <header class="page-header mb-8">
      <div class="header-content">
        <h1 class="text-h4 font-weight-bold text-primary mb-2">
          {{ t('admin.interests.title') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis">
          {{ t('admin.interests.subtitle') }}
        </p>
      </div>
      <div class="header-actions">
        <v-btn
          class="text-none px-6"
          color="primary"
          elevation="2"
          prepend-icon="mdi-plus"
          rounded="pill"
          variant="elevated"
          @click="openAddModal"
        >
          {{ t('admin.interests.newInterest') }}
        </v-btn>
      </div>
    </header>

    <v-divider class="mb-8 border-opacity-10" />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <v-progress-circular color="primary" indeterminate size="40" />
      <span class="ml-4 text-body-1 text-medium-emphasis">{{ t('admin.interests.loading') }}</span>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="error-state">
      <v-icon class="mr-2" color="error" icon="mdi-alert-circle" />
      <span class="text-body-1">{{ loadError }}</span>
      <v-btn
        class="ml-4"
        color="primary"
        size="small"
        variant="text"
        @click="fetchInterests"
      >
        {{ t('admin.interests.retry') }}
      </v-btn>
    </div>

    <!-- Interests List -->
    <template v-else>
      <InterestsList
        :interests="interests"
        :is-removing="isRemoving"
        :is-searching="isSearching"
        :search-query="searchQuery"
        :total="totalInterests"
        @add="openAddModal"
        @remove="removeInterest"
        @search="handleSearch"
      />

      <RequestsQueue :requests="requests" @approve="approveRequest" @reject="rejectRequest" />
    </template>

    <!-- Add Interest Modal -->
    <v-dialog v-model="isAddModalOpen" max-width="400">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t('admin.interests.addModal.title') }}
        </v-card-title>
        <v-card-text class="pt-4">
          <v-text-field
            v-model="newInterestName"
            autofocus
            :disabled="isAdding"
            :error-messages="addError ?? undefined"
            :label="t('admin.interests.addModal.label')"
            :placeholder="t('admin.interests.addModal.placeholder')"
            variant="outlined"
            @keyup.enter="addNewInterest"
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn color="grey-darken-1" :disabled="isAdding" variant="text" @click="closeAddModal">
            {{ t('admin.interests.addModal.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!newInterestName.trim() || isAdding"
            :loading="isAdding"
            variant="elevated"
            @click="addNewInterest"
          >
            {{ t('admin.interests.addModal.confirm') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.interests-page {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header Styles */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
}

/* Grid Layout for Interests */
.interests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.interest-card {
  position: relative;
  height: 80px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  background: var(--gradient);
}

.interest-card:hover {

  box-shadow: 0 16px 32px rgba(255, 79, 148, 0.25);
}

.interest-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  z-index: 2;
}

.interest-name {
  color: white;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 0.9rem;
  text-align: center;
}

.interest-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.1) 100%);
  z-index: 1;
}

.add-interest-card {
  height: 80px;
  border-radius: 24px;
  border: 2px dashed rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-interest-card:hover {
  border-color: var(--v-theme-primary);
  background: rgba(var(--v-theme-primary), 0.05);
  transform: scale(1.02);
}

/* Requests List Styles */
.requests-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.request-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 16px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.request-item:hover {
  transform: translateX(4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.95);
}

.request-status-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #ffb74d;
  /* Warning color for pending */
}

.request-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr;
  align-items: center;
  gap: 24px;
}

.request-badge {
  background: #f5f5f5;
  color: #333;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  text-align: center;
  border: 1px solid #e0e0e0;
}

.request-details {
  display: flex;
  align-items: center;
}

.request-meta {
  color: #757575;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
}

.request-actions {
  display: flex;
  gap: 12px;
  margin-left: 24px;
}

.action-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  color: white;
}

.action-btn.reject {
  background: #ff5252;
  box-shadow: 0 4px 10px rgba(255, 82, 82, 0.3);
}

.action-btn.approve {
  background: #4caf50;
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn:active {
  transform: scale(0.95);
}

.empty-state {
  text-align: center;
  padding: 48px;
  background: #f9f9f9;
  border-radius: 16px;
  border: 2px dashed #e0e0e0;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .request-main {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .request-item {
    flex-direction: column;
    align-items: stretch;
  }

  .request-actions {
    margin-left: 0;
    margin-top: 16px;
    justify-content: flex-end;
  }
}

/* List Transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
