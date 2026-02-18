<template>
  <div class="interests-manager">
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card stat-card--total">
        <div class="stat-icon">
          <span class="mdi mdi-tag-multiple" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ interests.length }}</span>
          <span class="stat-label">{{ t('admin.interestsManager.totalInterests') }}</span>
        </div>
      </div>
      <div class="stat-card stat-card--pending">
        <div class="stat-icon">
          <span class="mdi mdi-clock-outline" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ requests.length }}</span>
          <span class="stat-label">{{ t('admin.interestsManager.pendingRequests') }}</span>
        </div>
      </div>
      <div class="stat-card stat-card--popular">
        <div class="stat-icon">
          <span class="mdi mdi-fire" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ mostPopular }}</span>
          <span class="stat-label">{{ t('admin.interestsManager.mostPopular') }}</span>
        </div>
      </div>
      <div class="stat-card stat-card--events">
        <div class="stat-icon">
          <span class="mdi mdi-calendar-multiple" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ formatNumber(totalEventsWithInterests) }}</span>
          <span class="stat-label">{{ t('admin.interestsManager.eventsUsing') }}</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'active' }"
        type="button"
        @click="activeTab = 'active'"
      >
        <span class="mdi mdi-tag-check" />
        {{ t('admin.interestsManager.activeInterests') }}
        <span class="tab-badge">{{ interests.length }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'requests' }"
        type="button"
        @click="activeTab = 'requests'"
      >
        <span class="mdi mdi-tag-plus" />
        {{ t('admin.interestsManager.requestsQueue') }}
        <span v-if="requests.length > 0" class="tab-badge tab-badge--warning">{{ requests.length }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'analytics' }"
        type="button"
        @click="activeTab = 'analytics'"
      >
        <span class="mdi mdi-chart-bar" />
        {{ t('admin.interestsManager.interestsAnalytics') }}
      </button>
    </div>

    <!-- Active Interests Tab -->
    <section v-if="activeTab === 'active'" class="tab-content">
      <div class="content-header">
        <div class="search-box">
          <span class="mdi mdi-magnify search-icon" />
          <input
            v-model="searchQuery"
            class="search-input"
            :placeholder="t('admin.interestsManager.searchPlaceholder')"
            type="text"
            @input="handleSearch"
          >
        </div>
        <button class="add-btn" :disabled="isSaving" type="button" @click="openAddModal">
          <span class="mdi mdi-plus" />
          {{ t('admin.interestsManager.addNew') }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <span class="mdi mdi-loading mdi-spin" />
        <span>Carregando interesses...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="loadError" class="error-state">
        <span class="mdi mdi-alert-circle-outline" />
        <span>{{ loadError }}</span>
        <button class="retry-btn" type="button" @click="fetchInterests">Tentar novamente</button>
      </div>

      <!-- Interests Grid -->
      <div v-else class="interests-grid">
        <div
          v-for="(interest, index) in filteredInterests"
          :key="interest.id"
          class="interest-card"
          :class="{ 'interest-card--editing': editingIndex === index }"
        >
          <div class="interest-header">
            <span class="interest-name">{{ interest.name }}</span>
            <div class="interest-actions">
              <button
                class="action-btn action-btn--edit"
                :title="t('admin.interestsManager.edit')"
                type="button"
                @click="startEdit(index)"
              >
                <span class="mdi mdi-pencil" />
              </button>
              <button
                class="action-btn action-btn--delete"
                :title="t('admin.interestsManager.delete')"
                type="button"
                @click="confirmDelete(index)"
              >
                <span class="mdi mdi-delete" />
              </button>
            </div>
          </div>
          <div class="interest-stats">
            <div class="stat-item">
              <span class="mdi mdi-calendar" />
              <span>{{ interest.eventsCount }} {{ t('admin.interestsManager.events') }}</span>
            </div>
            <div class="stat-item">
              <span class="mdi mdi-account-group" />
              <span>{{ formatNumber(interest.usersCount) }} {{ t('admin.interestsManager.users') }}</span>
            </div>
          </div>
          <div class="interest-trend" :class="interest.trend > 0 ? 'interest-trend--up' : 'interest-trend--down'">
            <span class="mdi" :class="interest.trend > 0 ? 'mdi-trending-up' : 'mdi-trending-down'" />
            <span>{{ interest.trend > 0 ? '+' : '' }}{{ interest.trend }}%</span>
          </div>
        </div>

        <!-- Add Card -->
        <button class="add-card" type="button" @click="openAddModal">
          <span class="mdi mdi-plus-circle-outline" />
          <span>{{ t('admin.interestsManager.addInterest') }}</span>
        </button>
      </div>
    </section>

    <!-- Requests Queue Tab -->
    <section v-if="activeTab === 'requests'" class="tab-content">
      <div v-if="requests.length === 0" class="empty-state">
        <span class="mdi mdi-check-circle empty-icon" />
        <h3 class="empty-title">{{ t('admin.interestsManager.noRequests') }}</h3>
        <p class="empty-text">{{ t('admin.interestsManager.noRequestsDesc') }}</p>
      </div>

      <div v-else class="requests-list">
        <div v-for="request in requests" :key="request.id" class="request-card">
          <div class="request-main">
            <div class="request-interest">
              <span class="request-label">{{ t('admin.interestsManager.requestedInterest') }}</span>
              <span class="request-name">{{ request.name }}</span>
            </div>
            <div class="request-user">
              <div class="user-avatar">{{ getInitials(request.requestedBy) }}</div>
              <div class="user-info">
                <span class="user-name">{{ request.requestedBy }}</span>
                <span class="user-date">{{ request.date }} às {{ request.time }}</span>
              </div>
            </div>
            <div v-if="request.reason" class="request-reason">
              <span class="reason-label">{{ t('admin.interestsManager.reason') }}:</span>
              <span class="reason-text">{{ request.reason }}</span>
            </div>
          </div>
          <div class="request-actions">
            <button class="request-btn request-btn--reject" type="button" @click="rejectRequest(request.id)">
              <span class="mdi mdi-close" />
              {{ t('admin.interestsManager.reject') }}
            </button>
            <button class="request-btn request-btn--approve" type="button" @click="approveRequest(request.id)">
              <span class="mdi mdi-check" />
              {{ t('admin.interestsManager.approve') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div v-if="requests.length > 0" class="bulk-actions">
        <button class="bulk-btn bulk-btn--reject-all" type="button" @click="rejectAll">
          <span class="mdi mdi-close-circle" />
          {{ t('admin.interestsManager.rejectAll') }}
        </button>
        <button class="bulk-btn bulk-btn--approve-all" type="button" @click="approveAll">
          <span class="mdi mdi-check-circle" />
          {{ t('admin.interestsManager.approveAll') }}
        </button>
      </div>
    </section>

    <!-- Analytics Tab -->
    <section v-if="activeTab === 'analytics'" class="tab-content">
      <div class="analytics-grid">
        <!-- Top Interests Chart -->
        <div class="analytics-card">
          <h3 class="analytics-title">
            <span class="mdi mdi-chart-bar" />
            {{ t('admin.interestsManager.topInterests') }}
          </h3>
          <div class="bar-chart">
            <div v-for="item in topInterests" :key="item.name" class="bar-item">
              <span class="bar-label">{{ item.name }}</span>
              <div class="bar-container">
                <div class="bar-fill" :style="{ width: `${item.percent}%` }" />
              </div>
              <span class="bar-value">{{ item.count }}</span>
            </div>
          </div>
        </div>

        <!-- Growth Chart -->
        <div class="analytics-card">
          <h3 class="analytics-title">
            <span class="mdi mdi-trending-up" />
            {{ t('admin.interestsManager.growthTrend') }}
          </h3>
          <div class="growth-list">
            <div v-for="item in growthData" :key="item.name" class="growth-item">
              <span class="growth-name">{{ item.name }}</span>
              <div class="growth-change" :class="item.trend > 0 ? 'growth-change--up' : 'growth-change--down'">
                <span class="mdi" :class="item.trend > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down'" />
                {{ Math.abs(item.trend) }}%
              </div>
            </div>
          </div>
        </div>

        <!-- Usage Distribution -->
        <div class="analytics-card analytics-card--full">
          <h3 class="analytics-title">
            <span class="mdi mdi-chart-donut" />
            {{ t('admin.interestsManager.usageDistribution') }}
          </h3>
          <div class="distribution-chart">
            <div class="distribution-bars">
              <div v-for="item in distributionData" :key="item.name" class="dist-bar-item">
                <div class="dist-info">
                  <span class="dist-color" :style="{ background: item.color }" />
                  <span class="dist-name">{{ item.name }}</span>
                </div>
                <div class="dist-bar-container">
                  <div class="dist-bar" :style="{ width: `${item.percent}%`, background: item.color }" />
                </div>
                <span class="dist-percent">{{ item.percent }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Add/Edit Modal -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <button class="modal-close" type="button" @click="closeModal">
          <span class="mdi mdi-close" />
        </button>
        <h3 class="modal-title">
          {{ editingIndex !== null ? t('admin.interestsManager.editInterest') :
            t('admin.interestsManager.addInterest') }}
        </h3>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">{{ t('admin.interestsManager.interestName') }}</label>
            <input
              v-model="modalInterestName"
              class="form-input"
              :disabled="isSaving"
              :placeholder="t('admin.interestsManager.namePlaceholder')"
              type="text"
            >
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('admin.interestsManager.category') }}</label>
            <select v-model="modalCategory" class="form-select" :disabled="isSaving">
              <option value="music">{{ t('admin.interestsManager.categoryMusic') }}</option>
              <option value="culture">{{ t('admin.interestsManager.categoryCulture') }}</option>
              <option value="sports">{{ t('admin.interestsManager.categorySports') }}</option>
              <option value="tech">{{ t('admin.interestsManager.categoryTech') }}</option>
              <option value="food">{{ t('admin.interestsManager.categoryFood') }}</option>
              <option value="other">{{ t('admin.interestsManager.categoryOther') }}</option>
            </select>
          </div>
          <!-- Mensagem de erro -->
          <div v-if="saveError" class="modal-error">
            <span class="mdi mdi-alert-circle" />
            {{ saveError }}
          </div>
        </div>
        <div class="modal-actions">
          <button class="modal-btn modal-btn--cancel" :disabled="isSaving" type="button" @click="closeModal">
            {{ t('admin.interestsManager.cancel') }}
          </button>
          <button
            class="modal-btn modal-btn--save"
            :disabled="!modalInterestName.trim() || isSaving"
            type="button"
            @click="saveInterest"
          >
            <span v-if="isSaving" class="mdi mdi-loading mdi-spin" />
            {{ isSaving ? 'Salvando...' : (editingIndex !== null ? t('admin.interestsManager.save') :
              t('admin.interestsManager.add')) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteIndex !== null" class="modal-overlay" @click.self="deleteIndex = null">
      <div class="modal-content modal-content--small">
        <div class="confirm-icon">
          <span class="mdi mdi-alert-circle" />
        </div>
        <h3 class="confirm-title">{{ t('admin.interestsManager.confirmDelete') }}</h3>
        <p class="confirm-text">
          {{ t('admin.interestsManager.deleteWarning') }}
          <strong>{{ interests[deleteIndex]?.name }}</strong>?
        </p>
        <div class="confirm-actions">
          <button class="confirm-btn confirm-btn--cancel" type="button" @click="deleteIndex = null">
            {{ t('admin.interestsManager.cancel') }}
          </button>
          <button class="confirm-btn confirm-btn--delete" type="button" @click="deleteInterest">
            {{ t('admin.interestsManager.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import {
    type Interest as ApiInterest,
    createInterest,
    deleteInterest as deleteInterestApi,
    getInterests,
    searchInterestsByName,
    updateInterest,
  } from '@/services/interests'

  interface Interest {
    id: string
    name: string
    category: string
    eventsCount: number
    usersCount: number
    trend: number
  }

  interface Request {
    id: number
    name: string
    requestedBy: string
    date: string
    time: string
    reason?: string
  }

  const { t } = useI18n()

  const activeTab = ref<'active' | 'requests' | 'analytics'>('active')
  const searchQuery = ref('')
  const isModalOpen = ref(false)
  const editingIndex = ref<number | null>(null)
  const deleteIndex = ref<number | null>(null)
  const modalInterestName = ref('')
  const modalCategory = ref('music')

  // Estado de loading e erro
  const isLoading = ref(false)
  const isSaving = ref(false)
  const isDeleting = ref(false)
  const loadError = ref<string | null>(null)
  const saveError = ref<string | null>(null)

  // Dados do banco de dados
  const interests = ref<Interest[]>([])

  // Requests permanecem mockados (API não existe ainda)
  const requests = ref<Request[]>([
    { id: 1, name: 'AMAPIANO', requestedBy: 'João Silva', date: '02/02/2026', time: '14:30', reason: 'Gênero musical em alta no Brasil' },
    { id: 2, name: 'K-POP', requestedBy: 'Ana Costa', date: '02/02/2026', time: '15:45', reason: 'Muitos fãs organizam eventos' },
    { id: 3, name: 'JAZZ FUSION', requestedBy: 'Carlos Oliveira', date: '03/02/2026', time: '09:15' },
    { id: 4, name: 'INDIE', requestedBy: 'Marina Santos', date: '03/02/2026', time: '11:20', reason: 'Cena indie crescendo na cidade' },
  ])

  // ─── Buscar interesses do banco ────────────────────────────
  async function fetchInterests () {
    isLoading.value = true
    loadError.value = null
    try {
      const response = await getInterests() as any
      // A API retorna { success: true, data: [...] }, extraímos o array
      const data = Array.isArray(response) ? response : (response?.data || [])
      interests.value = data.map((item: ApiInterest) => ({
        id: item.id,
        name: item.name.toUpperCase(),
        category: 'other',
        eventsCount: 0,
        usersCount: 0,
        trend: 0,
      }))
    } catch (error: any) {
      console.error('Erro ao carregar interesses:', error)
      if (error.response?.status === 401) {
        loadError.value = 'Sessão expirada. Faça login novamente.'
      } else if (error.response?.status === 404) {
        loadError.value = 'Endpoint não encontrado (404).'
      } else {
        loadError.value = error.response?.data?.message || 'Não foi possível carregar os interesses.'
      }
    } finally {
      isLoading.value = false
    }
  }

  // ─── Busca com debounce ────────────────────────────────────
  let searchTimeout: ReturnType<typeof setTimeout> | null = null

  async function handleSearch () {
    const query = searchQuery.value.trim()

    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    if (!query) {
      fetchInterests()
      return
    }

    searchTimeout = setTimeout(async () => {
      isLoading.value = true
      try {
        const response = await searchInterestsByName(query) as any
        // A API retorna { success: true, data: [...] }, extraímos o array
        const data = Array.isArray(response) ? response : (response?.data || [])
        interests.value = data.map((item: ApiInterest) => ({
          id: item.id,
          name: item.name.toUpperCase(),
          category: 'other',
          eventsCount: 0,
          usersCount: 0,
          trend: 0,
        }))
      } catch {
      // Manter lista atual se a busca falhar
      } finally {
        isLoading.value = false
      }
    }, 350)
  }

  // Carregar ao montar
  onMounted(() => {
    fetchInterests()
  })

  const mostPopular = computed(() => {
    if (interests.value.length === 0) return '-'
    const sorted = [...interests.value].toSorted((a, b) => b.usersCount - a.usersCount)
    return sorted[0]?.name ?? '-'
  })

  const totalEventsWithInterests = computed(() => {
    return interests.value.reduce((sum, i) => sum + i.eventsCount, 0)
  })

  const filteredInterests = computed(() => {
    if (!searchQuery.value) return interests.value
    const query = searchQuery.value.toLowerCase()
    return interests.value.filter(i => i.name.toLowerCase().includes(query))
  })

  const topInterests = computed(() => {
    const sorted = [...interests.value].toSorted((a, b) => b.eventsCount - a.eventsCount).slice(0, 5)
    const max = sorted[0]?.eventsCount ?? 1
    return sorted.map(i => ({
      name: i.name,
      count: i.eventsCount,
      percent: (i.eventsCount / max) * 100,
    }))
  })

  const growthData = computed(() => {
    return [...interests.value].toSorted((a, b) => b.trend - a.trend).slice(0, 6)
  })

  const distributionData = computed(() => {
    const categories: Record<string, { name: string, count: number, color: string }> = {
      music: { name: 'Música', count: 0, color: '#8b5cf6' },
      culture: { name: 'Cultura', count: 0, color: '#ec4899' },
      sports: { name: 'Esportes', count: 0, color: '#10b981' },
      tech: { name: 'Tecnologia', count: 0, color: '#3b82f6' },
      food: { name: 'Gastronomia', count: 0, color: '#f59e0b' },
      other: { name: 'Outros', count: 0, color: '#6b7280' },
    }
    for (const i of interests.value) {
      const cat = categories[i.category]
      if (cat) {
        cat.count++
      }
    }
    const total = interests.value.length || 1
    return Object.values(categories).map(c => ({
      ...c,
      percent: Math.round((c.count / total) * 100),
    }))
  })

  function formatNumber (num: number): string {
    return num.toLocaleString('pt-BR')
  }

  function getInitials (name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  function openAddModal () {
    editingIndex.value = null
    modalInterestName.value = ''
    modalCategory.value = 'music'
    saveError.value = null
    isModalOpen.value = true
  }

  function startEdit (index: number) {
    editingIndex.value = index
    const interest = interests.value[index]
    if (interest) {
      modalInterestName.value = interest.name
      modalCategory.value = interest.category
    }
    saveError.value = null
    isModalOpen.value = true
  }

  function closeModal () {
    isModalOpen.value = false
    editingIndex.value = null
  }

  async function saveInterest () {
    if (!modalInterestName.value.trim()) return

    isSaving.value = true
    saveError.value = null
    try {
      if (editingIndex.value === null) {
        // Criar novo interesse via API
        const response = await createInterest(modalInterestName.value.toUpperCase()) as any
        // A API pode retornar { success, data: {...} } ou o objeto direto
        const created = response?.data || response
        interests.value.push({
          id: created.id,
          name: created.name.toUpperCase(),
          category: modalCategory.value,
          eventsCount: 0,
          usersCount: 0,
          trend: 0,
        })
      } else {
        // Atualizar interesse existente via API
        const interest = interests.value[editingIndex.value]
        if (interest) {
          await updateInterest(interest.id, modalInterestName.value.toUpperCase())
          interest.name = modalInterestName.value.toUpperCase()
          interest.category = modalCategory.value
        }
      }
      closeModal()
    } catch (error: any) {
      console.error('Erro ao salvar interesse:', error)
      saveError.value = error?.response?.data?.message || error?.message || 'Erro ao salvar interesse'
    } finally {
      isSaving.value = false
    }
  }

  function confirmDelete (index: number) {
    deleteIndex.value = index
  }

  async function deleteInterest () {
    if (deleteIndex.value !== null) {
      const interest = interests.value[deleteIndex.value]
      if (!interest) {
        deleteIndex.value = null
        return
      }

      isDeleting.value = true
      try {
        await deleteInterestApi(interest.id)
        interests.value.splice(deleteIndex.value, 1)
        deleteIndex.value = null
      } catch (error) {
        console.error('Erro ao deletar interesse:', error)
      } finally {
        isDeleting.value = false
      }
    }
  }

  async function approveRequest (id: number) {
    const request = requests.value.find(r => r.id === id)
    if (request) {
      try {
        // Criar o interesse no banco via API
        const response = await createInterest(request.name.toUpperCase()) as any
        const created = response?.data || response
        interests.value.push({
          id: created.id,
          name: created.name.toUpperCase(),
          category: 'other',
          eventsCount: 0,
          usersCount: 0,
          trend: 0,
        })
        requests.value = requests.value.filter(r => r.id !== id)
      } catch (error) {
        console.error('Erro ao aprovar solicitação:', error)
      }
    }
  }

  function rejectRequest (id: number) {
    requests.value = requests.value.filter(r => r.id !== id)
  }

  async function approveAll () {
    for (const r of requests.value) {
      try {
        const response = await createInterest(r.name.toUpperCase()) as any
        const created = response?.data || response
        interests.value.push({
          id: created.id,
          name: created.name.toUpperCase(),
          category: 'other',
          eventsCount: 0,
          usersCount: 0,
          trend: 0,
        })
      } catch (error) {
        console.error(`Erro ao aprovar interesse ${r.name}:`, error)
      }
    }
    requests.value = []
  }

  function rejectAll () {
    requests.value = []
  }
</script>

<style scoped>
.interests-manager {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: white;
  border-radius: 14px;
  border: 1px solid #f3f4f6;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: white;
}

.stat-card--total .stat-icon {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

.stat-card--pending .stat-icon {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.stat-card--popular .stat-icon {
  background: linear-gradient(135deg, #ec4899, #f472b6);
}

.stat-card--events .stat-icon {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #2d2d3a;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

/* Tabs */
.tabs-container {
  display: flex;
  gap: 8px;
  background: #f3f4f6;
  padding: 6px;
  border-radius: 14px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.5);
}

.tab-btn--active {
  background: white;
  color: #8b5cf6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tab-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  background: #e0e7ff;
  color: #4f46e5;
}

.tab-badge--warning {
  background: #fef3c7;
  color: #d97706;
}

/* Tab Content */
.tab-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #f3f4f6;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  font-size: 18px;
  color: #9ca3af;
}

.search-input {
  padding: 10px 16px 10px 42px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  min-width: 280px;
}

.search-input:focus {
  outline: none;
  border-color: #8b5cf6;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

/* Interests Grid */
.interests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.interest-card {
  background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 18px;
  transition: all 0.3s ease;
}

.interest-card:hover {
  border-color: #8b5cf6;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
}

.interest-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.interest-name {
  font-size: 16px;
  font-weight: 700;
  color: #2d2d3a;
}

.interest-actions {
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.interest-card:hover .interest-actions {
  opacity: 1;
}

.action-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
}

.action-btn--edit {
  background: #e0e7ff;
  color: #4f46e5;
}

.action-btn--edit:hover {
  background: #c7d2fe;
}

.action-btn--delete {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn--delete:hover {
  background: #fecaca;
}

.interest-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
}

.stat-item .mdi {
  font-size: 16px;
  color: #9ca3af;
}

.interest-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.interest-trend--up {
  background: #d1fae5;
  color: #059669;
}

.interest-trend--down {
  background: #fee2e2;
  color: #dc2626;
}

.add-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 32px;
  border: 2px dashed #e5e7eb;
  border-radius: 14px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-card:hover {
  border-color: #8b5cf6;
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.05);
}

.add-card .mdi {
  font-size: 32px;
}

/* Requests List */
.requests-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.request-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f9fafb;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
}

.request-main {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
}

.request-interest {
  display: flex;
  flex-direction: column;
  min-width: 140px;
}

.request-label {
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  font-weight: 600;
}

.request-name {
  font-size: 18px;
  font-weight: 700;
  color: #2d2d3a;
}

.request-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.user-date {
  font-size: 12px;
  color: #9ca3af;
}

.request-reason {
  flex: 1;
  padding: 8px 16px;
  background: white;
  border-radius: 8px;
  font-size: 13px;
}

.reason-label {
  color: #6b7280;
}

.reason-text {
  color: #374151;
}

.request-actions {
  display: flex;
  gap: 10px;
}

.request-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.request-btn--reject {
  background: #fee2e2;
  color: #dc2626;
}

.request-btn--reject:hover {
  background: #fecaca;
}

.request-btn--approve {
  background: #d1fae5;
  color: #059669;
}

.request-btn--approve:hover {
  background: #a7f3d0;
}

/* Bulk Actions */
.bulk-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.bulk-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bulk-btn--reject-all {
  background: #fee2e2;
  color: #dc2626;
}

.bulk-btn--approve-all {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.bulk-btn--approve-all:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: #10b981;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 20px;
  font-weight: 700;
  color: #2d2d3a;
  margin: 0 0 8px;
}

.empty-text {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Analytics */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.analytics-card {
  background: #f9fafb;
  border-radius: 14px;
  padding: 20px;
}

.analytics-card--full {
  grid-column: span 2;
}

.analytics-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: #2d2d3a;
  margin: 0 0 20px;
}

.analytics-title .mdi {
  font-size: 20px;
  color: #8b5cf6;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bar-item {
  display: grid;
  grid-template-columns: 100px 1fr 50px;
  align-items: center;
  gap: 12px;
}

.bar-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.bar-container {
  height: 10px;
  background: #e5e7eb;
  border-radius: 5px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #a78bfa);
  border-radius: 5px;
}

.bar-value {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  text-align: right;
}

.growth-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.growth-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: white;
  border-radius: 10px;
}

.growth-name {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.growth-change {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.growth-change--up {
  background: #d1fae5;
  color: #059669;
}

.growth-change--down {
  background: #fee2e2;
  color: #dc2626;
}

.distribution-bars {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dist-bar-item {
  display: grid;
  grid-template-columns: 140px 1fr 50px;
  align-items: center;
  gap: 16px;
}

.dist-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dist-color {
  width: 14px;
  height: 14px;
  border-radius: 4px;
}

.dist-name {
  font-size: 14px;
  color: #374151;
}

.dist-bar-container {
  height: 10px;
  background: #e5e7eb;
  border-radius: 5px;
  overflow: hidden;
}

.dist-bar {
  height: 100%;
  border-radius: 5px;
}

.dist-percent {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  text-align: right;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 28px;
  max-width: 440px;
  width: 90%;
  position: relative;
}

.modal-content--small {
  max-width: 380px;
  text-align: center;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #f3f4f6;
  cursor: pointer;
  font-size: 18px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #2d2d3a;
  margin: 0 0 24px;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.form-input,
.form-select {
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #8b5cf6;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-btn--cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.modal-btn--save {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
  color: white;
}

.modal-btn--save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.modal-btn--save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Confirm Modal */
.confirm-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fef3c7;
  color: #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 20px;
}

.confirm-title {
  font-size: 20px;
  font-weight: 700;
  color: #2d2d3a;
  margin: 0 0 12px;
}

.confirm-text {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.confirm-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.confirm-btn--cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.confirm-btn--delete {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .analytics-card--full {
    grid-column: span 1;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .tabs-container {
    flex-direction: column;
  }

  .request-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .request-card {
    flex-direction: column;
    gap: 16px;
  }
}

/* Loading & Error States */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  color: #8b5cf6;
  font-size: 16px;
}

.loading-state .mdi {
  font-size: 24px;
}

.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  color: #ef4444;
  font-size: 14px;
}

.error-state .mdi {
  font-size: 24px;
}

.retry-btn {
  margin-left: 8px;
  padding: 6px 16px;
  background: transparent;
  border: 1px solid #ef4444;
  border-radius: 8px;
  color: #ef4444;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #ef4444;
  color: white;
}

/* Modal Error */
.modal-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
  margin-top: 12px;
}

.modal-error .mdi {
  font-size: 18px;
}
</style>
