<template>
  <div class="feedbacks-center">
    <!-- Header -->
    <header class="page-header">
      <div class="header-info">
        <h1 class="page-title">{{ t('admin.feedbacks.title') }}</h1>
        <p class="page-subtitle">{{ t('admin.feedbacks.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <div class="search-box">
          <span class="mdi mdi-magnify search-icon" />
          <input
            v-model="searchQuery"
            class="search-input"
            :placeholder="t('admin.feedbacks.searchPlaceholder')"
            type="text"
          >
        </div>
        <select v-model="filterType" class="filter-select">
          <option value="all">{{ t('admin.feedbacks.filterAll') }}</option>
          <option value="suggestion">{{ t('admin.feedbacks.filterSuggestion') }}</option>
          <option value="bug">{{ t('admin.feedbacks.filterBug') }}</option>
          <option value="complaint">{{ t('admin.feedbacks.filterComplaint') }}</option>
          <option value="praise">{{ t('admin.feedbacks.filterPraise') }}</option>
        </select>
        <select v-model="filterStatus" class="filter-select">
          <option value="all">{{ t('admin.feedbacks.statusAll') }}</option>
          <option value="pending">{{ t('admin.feedbacks.statusPending') }}</option>
          <option value="inProgress">{{ t('admin.feedbacks.statusInProgress') }}</option>
          <option value="resolved">{{ t('admin.feedbacks.statusResolved') }}</option>
        </select>
      </div>
    </header>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card stat-card--total">
        <div class="stat-icon">
          <span class="mdi mdi-message-text" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">{{ t('admin.feedbacks.totalFeedbacks') }}</span>
        </div>
      </div>
      <div class="stat-card stat-card--pending">
        <div class="stat-icon">
          <span class="mdi mdi-clock-outline" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.pending }}</span>
          <span class="stat-label">{{ t('admin.feedbacks.pendingFeedbacks') }}</span>
        </div>
      </div>
      <div class="stat-card stat-card--resolved">
        <div class="stat-icon">
          <span class="mdi mdi-check-circle" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.resolved }}</span>
          <span class="stat-label">{{ t('admin.feedbacks.resolvedFeedbacks') }}</span>
        </div>
      </div>
      <div class="stat-card stat-card--rating">
        <div class="stat-icon">
          <span class="mdi mdi-star" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.avgRating }}</span>
          <span class="stat-label">{{ t('admin.feedbacks.avgRating') }}</span>
        </div>
      </div>
    </div>

    <!-- Feedbacks List -->
    <div class="feedbacks-container">
      <!-- Feedbacks -->
      <section class="feedbacks-list-section">
        <div class="feedbacks-list">
          <div
            v-for="feedback in filteredFeedbacks"
            :key="feedback.id"
            class="feedback-card"
            :class="{ 'feedback-card--selected': selectedFeedback?.id === feedback.id }"
            @click="selectFeedback(feedback)"
          >
            <div class="feedback-header">
              <div class="feedback-user">
                <img :alt="feedback.user.name" class="feedback-avatar" :src="feedback.user.avatar">
                <div class="feedback-user-info">
                  <span class="feedback-user-name">{{ feedback.user.name }}</span>
                  <span class="feedback-date">{{ feedback.date }}</span>
                </div>
              </div>
              <div class="feedback-badges">
                <span class="type-badge" :class="`type-badge--${feedback.type}`">
                  <span class="mdi" :class="getTypeIcon(feedback.type)" />
                  {{ getTypeLabel(feedback.type) }}
                </span>
                <span class="status-badge" :class="`status-badge--${feedback.status}`">
                  {{ getStatusLabel(feedback.status) }}
                </span>
              </div>
            </div>
            <p class="feedback-preview">{{ feedback.message.substring(0, 120) }}...</p>
            <div v-if="feedback.rating" class="feedback-rating">
              <span
                v-for="i in 5"
                :key="i"
                class="mdi"
                :class="i <= feedback.rating ? 'mdi-star' : 'mdi-star-outline'"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Feedback Detail -->
      <section v-if="selectedFeedback" class="feedback-detail">
        <div class="detail-header">
          <div class="detail-user">
            <img :alt="selectedFeedback.user.name" class="detail-avatar" :src="selectedFeedback.user.avatar">
            <div class="detail-user-info">
              <span class="detail-user-name">{{ selectedFeedback.user.name }}</span>
              <span class="detail-email">{{ selectedFeedback.user.email }}</span>
            </div>
          </div>
          <button class="close-detail" type="button" @click="selectedFeedback = null">
            <span class="mdi mdi-close" />
          </button>
        </div>

        <div class="detail-meta">
          <div class="meta-item">
            <span class="meta-label">{{ t('admin.feedbacks.type') }}</span>
            <span class="type-badge" :class="`type-badge--${selectedFeedback.type}`">
              <span class="mdi" :class="getTypeIcon(selectedFeedback.type)" />
              {{ getTypeLabel(selectedFeedback.type) }}
            </span>
          </div>
          <div class="meta-item">
            <span class="meta-label">{{ t('admin.feedbacks.status') }}</span>
            <select v-model="selectedFeedback.status" class="status-select" @change="updateStatus">
              <option value="pending">{{ t('admin.feedbacks.statusPending') }}</option>
              <option value="inProgress">{{ t('admin.feedbacks.statusInProgress') }}</option>
              <option value="resolved">{{ t('admin.feedbacks.statusResolved') }}</option>
            </select>
          </div>
          <div class="meta-item">
            <span class="meta-label">{{ t('admin.feedbacks.date') }}</span>
            <span class="meta-value">{{ selectedFeedback.date }}</span>
          </div>
          <div v-if="selectedFeedback.rating" class="meta-item">
            <span class="meta-label">{{ t('admin.feedbacks.rating') }}</span>
            <div class="rating-stars">
              <span
                v-for="i in 5"
                :key="i"
                class="mdi"
                :class="i <= selectedFeedback.rating ? 'mdi-star' : 'mdi-star-outline'"
              />
            </div>
          </div>
        </div>

        <div class="detail-message">
          <h4>{{ t('admin.feedbacks.message') }}</h4>
          <p>{{ selectedFeedback.message }}</p>
        </div>

        <div v-if="selectedFeedback.attachments?.length" class="detail-attachments">
          <h4>{{ t('admin.feedbacks.attachments') }}</h4>
          <div class="attachments-grid">
            <div v-for="(attachment, index) in selectedFeedback.attachments" :key="index" class="attachment-item">
              <img :alt="`Attachment ${index + 1}`" :src="attachment">
            </div>
          </div>
        </div>

        <!-- Response Section -->
        <div class="response-section">
          <h4>{{ t('admin.feedbacks.response') }}</h4>
          <div v-if="selectedFeedback.response" class="existing-response">
            <p>{{ selectedFeedback.response }}</p>
            <span class="response-date">{{ selectedFeedback.responseDate }}</span>
          </div>
          <div v-else class="new-response">
            <textarea
              v-model="responseText"
              class="response-input"
              :placeholder="t('admin.feedbacks.responsePlaceholder')"
              rows="4"
            />
            <button class="send-response-btn" :disabled="!responseText.trim()" type="button" @click="sendResponse">
              <span class="mdi mdi-send" />
              {{ t('admin.feedbacks.sendResponse') }}
            </button>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <button class="quick-btn quick-btn--resolve" type="button" @click="markAsResolved">
            <span class="mdi mdi-check-circle" />
            {{ t('admin.feedbacks.markResolved') }}
          </button>
          <button class="quick-btn quick-btn--archive" type="button" @click="archiveFeedback">
            <span class="mdi mdi-archive" />
            {{ t('admin.feedbacks.archive') }}
          </button>
          <button class="quick-btn quick-btn--delete" type="button" @click="deleteFeedback">
            <span class="mdi mdi-delete" />
            {{ t('admin.feedbacks.delete') }}
          </button>
        </div>
      </section>

      <!-- Empty State -->
      <section v-else class="feedback-empty">
        <span class="mdi mdi-message-text-outline empty-icon" />
        <p class="empty-text">{{ t('admin.feedbacks.selectFeedback') }}</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  interface User {
    name: string
    email: string
    avatar: string
  }

  interface Feedback {
    id: number
    user: User
    type: 'suggestion' | 'bug' | 'complaint' | 'praise'
    status: 'pending' | 'inProgress' | 'resolved'
    message: string
    date: string
    rating?: number
    attachments?: string[]
    response?: string
    responseDate?: string
  }

  const { t } = useI18n()

  const searchQuery = ref('')
  const filterType = ref('all')
  const filterStatus = ref('all')
  const selectedFeedback = ref<Feedback | null>(null)
  const responseText = ref('')

  const stats = ref({
    total: 156,
    pending: 24,
    resolved: 118,
    avgRating: 4.2,
  })

  const feedbacks = ref<Feedback[]>([
    {
      id: 1,
      user: {
        name: 'João Silva',
        email: 'joao.silva@email.com',
        avatar: 'https://i.pravatar.cc/100?img=1',
      },
      type: 'suggestion',
      status: 'pending',
      message: 'Seria muito útil ter a opção de compartilhar eventos diretamente para o WhatsApp com uma prévia personalizada. Muitos dos meus amigos usam mais o WhatsApp do que outras redes sociais para combinar eventos.',
      date: '02/02/2026',
      rating: 4,
    },
    {
      id: 2,
      user: {
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        avatar: 'https://i.pravatar.cc/100?img=5',
      },
      type: 'bug',
      status: 'inProgress',
      message: 'Quando tento fazer o check-in no evento, o aplicativo fecha sozinho. Já tentei reinstalar mas o problema persiste. Estou usando um iPhone 14 com iOS 17.',
      date: '01/02/2026',
      attachments: [
        'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=200&h=200&fit=crop',
      ],
    },
    {
      id: 3,
      user: {
        name: 'Pedro Costa',
        email: 'pedro.costa@email.com',
        avatar: 'https://i.pravatar.cc/100?img=3',
      },
      type: 'praise',
      status: 'resolved',
      message: 'Parabéns pelo aplicativo! A experiência de compra de ingressos é muito fluida e o design é lindo. Recomendo para todos os meus amigos. Continuem assim!',
      date: '30/01/2026',
      rating: 5,
      response: 'Muito obrigado pelo feedback positivo, Pedro! Ficamos felizes que você esteja gostando da plataforma. Conte conosco sempre!',
      responseDate: '31/01/2026',
    },
    {
      id: 4,
      user: {
        name: 'Ana Oliveira',
        email: 'ana.oliveira@email.com',
        avatar: 'https://i.pravatar.cc/100?img=9',
      },
      type: 'complaint',
      status: 'pending',
      message: 'Comprei ingresso para um evento que foi cancelado e até agora não recebi o reembolso. Já se passaram 15 dias e ninguém me dá uma resposta. Isso é muito frustrante!',
      date: '28/01/2026',
      rating: 1,
    },
    {
      id: 5,
      user: {
        name: 'Lucas Ferreira',
        email: 'lucas.ferreira@email.com',
        avatar: 'https://i.pravatar.cc/100?img=12',
      },
      type: 'suggestion',
      status: 'resolved',
      message: 'Gostaria de poder filtrar eventos por distância da minha localização. Às vezes aparecem eventos muito longe e fica difícil encontrar os que são perto de casa.',
      date: '25/01/2026',
      rating: 4,
      response: 'Ótima sugestão, Lucas! Acabamos de implementar o filtro por distância na última atualização. Confira!',
      responseDate: '27/01/2026',
    },
  ])

  const filteredFeedbacks = computed(() => {
    let result = feedbacks.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(
        f =>
          f.user.name.toLowerCase().includes(query)
          || f.message.toLowerCase().includes(query),
      )
    }

    if (filterType.value !== 'all') {
      result = result.filter(f => f.type === filterType.value)
    }

    if (filterStatus.value !== 'all') {
      result = result.filter(f => f.status === filterStatus.value)
    }

    return result
  })

  function getTypeIcon (type: string): string {
    const icons: Record<string, string> = {
      suggestion: 'mdi-lightbulb',
      bug: 'mdi-bug',
      complaint: 'mdi-alert-circle',
      praise: 'mdi-heart',
    }
    return icons[type] || 'mdi-message'
  }

  function getTypeLabel (type: string): string {
    return t(`admin.feedbacks.type${type.charAt(0).toUpperCase() + type.slice(1)}`)
  }

  function getStatusLabel (status: string): string {
    const labels: Record<string, string> = {
      pending: t('admin.feedbacks.statusPending'),
      inProgress: t('admin.feedbacks.statusInProgress'),
      resolved: t('admin.feedbacks.statusResolved'),
    }
    return labels[status] || status
  }

  function selectFeedback (feedback: Feedback) {
    selectedFeedback.value = feedback
    responseText.value = ''
  }

  function updateStatus () {
    console.log('Status updated:', selectedFeedback.value?.status)
  }

  function sendResponse () {
    if (selectedFeedback.value && responseText.value.trim()) {
      selectedFeedback.value.response = responseText.value
      selectedFeedback.value.responseDate = new Date().toLocaleDateString('pt-BR')
      responseText.value = ''
    }
  }

  function markAsResolved () {
    if (selectedFeedback.value) {
      selectedFeedback.value.status = 'resolved'
      stats.value.pending--
      stats.value.resolved++
    }
  }

  function archiveFeedback () {
    console.log('Archiving feedback:', selectedFeedback.value?.id)
  }

  function deleteFeedback () {
    if (selectedFeedback.value) {
      const index = feedbacks.value.findIndex(f => f.id === selectedFeedback.value?.id)
      if (index !== -1) {
        feedbacks.value.splice(index, 1)
        selectedFeedback.value = null
        stats.value.total--
      }
    }
  }
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════
   CSS VARIABLES
   ═══════════════════════════════════════════════════════════════════════════ */
.feedbacks-center {
  --accent: #ff5fa6;
  --accent-light: #ffba4b;
  --accent-rgb: 255, 95, 166;
  --accent-light-rgb: 255, 186, 75;
  --purple: #b46cff;
  --purple-rgb: 180, 108, 255;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONTAINER
   ═══════════════════════════════════════════════════════════════════════════ */
.feedbacks-center {
  display: flex;
  flex-direction: column;
  gap: 32px;
  animation: fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1);
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

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE HEADER
   ═══════════════════════════════════════════════════════════════════════════ */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
}

.page-title {
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-light), var(--accent), var(--purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 15px;
  color: #6b7280;
  margin: 8px 0 0;
  font-weight: 500;
}

/* ═══════════════════════════════════════════════════════════════════════════
   HEADER ACTIONS
   ═══════════════════════════════════════════════════════════════════════════ */
.header-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  font-size: 20px;
  color: rgba(var(--purple-rgb), 0.5);
  transition: color 0.3s ease;
  z-index: 1;
}

.search-box:focus-within .search-icon {
  color: var(--purple);
}

.search-input {
  padding: 13px 18px 13px 48px;
  border: 2px solid transparent;
  border-radius: 16px;
  background: linear-gradient(white, white) padding-box,
    linear-gradient(135deg, rgba(var(--accent-light-rgb), 0.3), rgba(var(--accent-rgb), 0.3), rgba(var(--purple-rgb), 0.3)) border-box;
  font-size: 14px;
  font-weight: 500;
  min-width: 260px;
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-input:focus {
  outline: none;
  background: linear-gradient(white, white) padding-box,
    linear-gradient(135deg, var(--accent-light), var(--accent), var(--purple)) border-box;
  box-shadow: 0 8px 24px rgba(var(--purple-rgb), 0.2);
  transform: translateY(-2px);
}

.filter-select {
  padding: 13px 18px;
  border: 2px solid transparent;
  border-radius: 16px;
  background: linear-gradient(white, white) padding-box,
    linear-gradient(135deg, rgba(var(--accent-light-rgb), 0.2), rgba(var(--accent-rgb), 0.2)) border-box;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.filter-select:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(var(--accent-rgb), 0.15);
}

.filter-select:focus {
  outline: none;
  background: linear-gradient(white, white) padding-box,
    linear-gradient(135deg, var(--accent-light), var(--accent)) border-box;
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATS GRID
   ═══════════════════════════════════════════════════════════════════════════ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 248, 255, 0.9));
  border-radius: 20px;
  border: 2px solid transparent;
  background-clip: padding-box;
  position: relative;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  isolation: isolate;
}

.stat-card::before {
  content: '';
  position: absolute;
  inset: -2px;
  z-index: -1;
  border-radius: 20px;
  padding: 2px;
  background: linear-gradient(135deg, rgba(var(--accent-light-rgb), 0.3), rgba(var(--accent-rgb), 0.3), rgba(var(--purple-rgb), 0.3));
  -webkit-mask: linear-gradient(white 0 0) content-box, linear-gradient(white 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(white 0 0) content-box, linear-gradient(white 0 0);
  mask-composite: exclude;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(var(--purple-rgb), 0.15);
}

.stat-card:hover::before {
  background: linear-gradient(135deg, var(--accent-light), var(--accent), var(--purple));
}

.stat-icon {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: white;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

.stat-card--total .stat-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
}

.stat-card--pending .stat-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.stat-card--resolved .stat-icon {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.stat-card--rating .stat-icon {
  background: linear-gradient(135deg, var(--purple) 0%, #a78bfa 100%);
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #2d2d3a 0%, #4b5563 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  letter-spacing: 0.02em;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEEDBACKS CONTAINER
   ═══════════════════════════════════════════════════════════════════════════ */
.feedbacks-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  min-height: 600px;
}

.feedbacks-list-section {
  background: linear-gradient(135deg, rgba(7, 10, 22, 0.03) 0%, rgba(255, 255, 255, 0.95) 100%);
  border-radius: 24px;
  border: 2px solid transparent;
  background-clip: padding-box;
  position: relative;
  padding: 24px;
  overflow-y: auto;
  max-height: 750px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9);
  isolation: isolate;
}

.feedbacks-list-section::before {
  content: '';
  position: absolute;
  inset: -2px;
  z-index: -1;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(var(--accent-light-rgb), 0.25), rgba(var(--accent-rgb), 0.25), rgba(var(--purple-rgb), 0.25));
  -webkit-mask: linear-gradient(white 0 0) content-box, linear-gradient(white 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(white 0 0) content-box, linear-gradient(white 0 0);
  mask-composite: exclude;
}

.feedbacks-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEEDBACK CARD
   ═══════════════════════════════════════════════════════════════════════════ */
.feedback-card {
  padding: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 248, 255, 0.95));
  border-radius: 18px;
  border: 2px solid transparent;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform;
}

.feedback-card::before {
  content: '';
  position: absolute;
  inset: -2px;
  z-index: -1;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.15), rgba(var(--purple-rgb), 0.15));
  opacity: 0;
  transition: opacity 0.35s ease;
}

.feedback-card:hover {
  transform: translateY(-6px) translateZ(0);
  box-shadow: 0 12px 32px rgba(var(--purple-rgb), 0.2), 0 0 0 1px rgba(var(--accent-rgb), 0.1);
}

.feedback-card:hover::before {
  opacity: 1;
}

.feedback-card:not(:hover) {
  will-change: auto;
}

.feedback-card--selected {
  background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(255, 250, 255, 0.98));
  box-shadow: 0 12px 40px rgba(var(--accent-rgb), 0.25), 0 0 0 2px rgba(var(--accent), 0.4);
  transform: translateY(-4px) scale(1.01);
}

.feedback-card--selected::before {
  background: linear-gradient(135deg, var(--accent-light), var(--accent), var(--purple));
  opacity: 1;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEEDBACK CARD CONTENT
   ═══════════════════════════════════════════════════════════════════════════ */
.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.feedback-user {
  display: flex;
  align-items: center;
  gap: 13px;
}

.feedback-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(var(--accent-rgb), 0.1);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.feedback-card:hover .feedback-avatar {
  transform: scale(1.08);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15), 0 0 0 3px rgba(var(--accent), 0.3);
}

.feedback-user-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.feedback-user-name {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: -0.01em;
}

.feedback-date {
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.01em;
}

.feedback-badges {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: flex-start;
}

/* ═══════════════════════════════════════════════════════════════════════════
   BADGES
   ═══════════════════════════════════════════════════════════════════════════ */
.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 13px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  border: 2px solid;
  transition: all 0.25s ease;
  backdrop-filter: blur(4px);
}

.type-badge--suggestion {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15));
  color: #d97706;
  border-color: rgba(217, 119, 6, 0.25);
}

.type-badge--bug {
  background: linear-gradient(135deg, rgba(248, 113, 113, 0.15), rgba(239, 68, 68, 0.15));
  color: #dc2626;
  border-color: rgba(220, 38, 38, 0.25);
}

.type-badge--complaint {
  background: linear-gradient(135deg, rgba(244, 114, 182, 0.15), rgba(236, 72, 153, 0.15));
  color: #db2777;
  border-color: rgba(219, 39, 119, 0.25);
}

.type-badge--praise {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(16, 185, 129, 0.15));
  color: #059669;
  border-color: rgba(5, 150, 105, 0.25);
}

.feedback-card:hover .type-badge {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.status-badge {
  display: inline-flex;
  padding: 6px 13px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  border: 2px solid;
  backdrop-filter: blur(4px);
  transition: all 0.25s ease;
}

.status-badge--pending {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.15));
  color: #d97706;
  border-color: rgba(217, 119, 6, 0.3);
}

.status-badge--inProgress {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(59, 130, 246, 0.15));
  color: #2563eb;
  border-color: rgba(37, 99, 235, 0.3);
}

.status-badge--resolved {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(16, 185, 129, 0.15));
  color: #059669;
  border-color: rgba(5, 150, 105, 0.3);
}

.feedback-card:hover .status-badge {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* ═══════════════════════════════════════════════════════════════════════════
   PREVIEW & RATING
   ═══════════════════════════════════════════════════════════════════════════ */
.feedback-preview {
  font-size: 14px;
  color: #4b5563;
  margin: 0 0 14px;
  line-height: 1.65;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.feedback-rating {
  display: flex;
  gap: 4px;
  align-items: center;
}

.feedback-rating .mdi {
  font-size: 18px;
  color: #fbbf24;
  filter: drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3));
  transition: transform 0.2s ease;
}

.feedback-card:hover .feedback-rating .mdi {
  transform: scale(1.1);
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEEDBACK DETAIL
   ═══════════════════════════════════════════════════════════════════════════ */
.feedback-detail {
  background: linear-gradient(135deg, rgba(7, 10, 22, 0.03) 0%, rgba(255, 255, 255, 0.95) 100%);
  border-radius: 24px;
  border: 2px solid transparent;
  background-clip: padding-box;
  position: relative;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9);
  isolation: isolate;
}

.feedback-detail::before {
  content: '';
  position: absolute;
  inset: -2px;
  z-index: -1;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(var(--accent-light-rgb), 0.25), rgba(var(--accent-rgb), 0.25), rgba(var(--purple-rgb), 0.25));
  -webkit-mask: linear-gradient(white 0 0) content-box, linear-gradient(white 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(white 0 0) content-box, linear-gradient(white 0 0);
  mask-composite: exclude;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 18px;
  border-bottom: 2px solid rgba(var(--accent-rgb), 0.1);
}

.detail-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.detail-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12), 0 0 0 3px rgba(var(--accent-rgb), 0.15);
}

.detail-user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-user-name {
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, #1f2937 0%, #4b5563 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.detail-email {
  font-size: 14px;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.01em;
}

.close-detail {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.08), rgba(var(--purple-rgb), 0.08));
  cursor: pointer;
  font-size: 22px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 2px solid transparent;
}

.close-detail:hover {
  background: linear-gradient(135deg, var(--accent-light), var(--accent));
  color: white;
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 6px 20px rgba(var(--accent-rgb), 0.3);
}

/* ═══════════════════════════════════════════════════════════════════════════
   DETAIL META
   ═══════════════════════════════════════════════════════════════════════════ */
.detail-meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(248, 248, 255, 0.4));
  border-radius: 14px;
  border: 2px solid rgba(var(--accent-rgb), 0.08);
  transition: all 0.3s ease;
}

.meta-item:hover {
  border-color: rgba(var(--accent-rgb), 0.2);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 250, 255, 0.7));
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(var(--purple-rgb), 0.1);
}

.meta-label {
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.meta-value {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.status-select {
  padding: 10px 14px;
  border: 2px solid rgba(var(--purple-rgb), 0.2);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  width: fit-content;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-select:hover {
  border-color: var(--purple);
  box-shadow: 0 4px 12px rgba(var(--purple-rgb), 0.15);
}

.status-select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
}

.rating-stars {
  display: flex;
  gap: 4px;
}

.rating-stars .mdi {
  font-size: 22px;
  color: #fbbf24;
  filter: drop-shadow(0 2px 6px rgba(251, 191, 36, 0.35));
}

/* ═══════════════════════════════════════════════════════════════════════════
   MESSAGE & ATTACHMENTS
   ═══════════════════════════════════════════════════════════════════════════ */
.detail-message {
  background: linear-gradient(135deg, rgba(248, 248, 255, 0.6), rgba(255, 255, 255, 0.4));
  border-radius: 16px;
  padding: 20px;
  border: 2px solid rgba(var(--purple-rgb), 0.1);
  transition: all 0.3s ease;
}

.detail-message:hover {
  border-color: rgba(var(--purple-rgb), 0.2);
  box-shadow: 0 4px 16px rgba(var(--purple-rgb), 0.08);
}

.detail-message h4 {
  font-size: 13px;
  font-weight: 700;
  color: var(--purple);
  margin: 0 0 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.detail-message p {
  font-size: 15px;
  color: #374151;
  line-height: 1.75;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.detail-attachments h4 {
  font-size: 13px;
  font-weight: 700;
  color: var(--purple);
  margin: 0 0 14px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.attachments-grid {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.attachment-item {
  width: 110px;
  height: 110px;
  border-radius: 14px;
  overflow: hidden;
  border: 3px solid rgba(var(--accent-rgb), 0.15);
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.attachment-item:hover {
  transform: scale(1.08) translateY(-4px);
  border-color: var(--accent);
  box-shadow: 0 8px 24px rgba(var(--accent-rgb), 0.25);
}

.attachment-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.attachment-item:hover img {
  transform: scale(1.1);
}

/* ═══════════════════════════════════════════════════════════════════════════
   RESPONSE SECTION
   ═══════════════════════════════════════════════════════════════════════════ */
.response-section h4 {
  font-size: 13px;
  font-weight: 700;
  color: var(--purple);
  margin: 0 0 14px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.existing-response {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.05));
  border-radius: 14px;
  padding: 18px;
  border-left: 4px solid #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}

.existing-response p {
  font-size: 15px;
  color: #065f46;
  margin: 0 0 10px;
  line-height: 1.7;
  font-weight: 500;
}

.response-date {
  font-size: 12px;
  font-weight: 700;
  color: #059669;
  letter-spacing: 0.02em;
}

.new-response {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.response-input {
  padding: 16px;
  border: 2px solid rgba(var(--purple-rgb), 0.2);
  border-radius: 14px;
  font-size: 15px;
  font-weight: 500;
  resize: none;
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  background: linear-gradient(white, white) padding-box;
  font-family: inherit;
  line-height: 1.65;
}

.response-input::placeholder {
  color: #9ca3af;
}

.response-input:focus {
  outline: none;
  border-color: var(--purple);
  box-shadow: 0 8px 24px rgba(var(--purple-rgb), 0.15), 0 0 0 3px rgba(var(--purple-rgb), 0.08);
  transform: translateY(-2px);
}

.send-response-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 28px;
  background: linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 50%, var(--purple) 100%);
  border: none;
  border-radius: 14px;
  color: white;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  align-self: flex-end;
  box-shadow: 0 6px 20px rgba(var(--accent-rgb), 0.3);
  letter-spacing: 0.02em;
}

.send-response-btn:hover:not(:disabled) {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 32px rgba(var(--accent-rgb), 0.4);
}

.send-response-btn:active:not(:disabled) {
  transform: translateY(-2px) scale(1);
}

.send-response-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

/* ═══════════════════════════════════════════════════════════════════════════
   QUICK ACTIONS
   ═══════════════════════════════════════════════════════════════════════════ */
.quick-actions {
  display: flex;
  gap: 14px;
  border-top: 2px solid rgba(var(--accent-rgb), 0.1);
  padding-top: 22px;
}

.quick-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 16px;
  border: none;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  letter-spacing: 0.02em;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.quick-btn:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.quick-btn:active {
  transform: translateY(-2px) scale(1);
}

.quick-btn--resolve {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.12));
  color: #059669;
  border: 2px solid rgba(5, 150, 105, 0.25);
}

.quick-btn--resolve:hover {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
  border-color: transparent;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);
}

.quick-btn--archive {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(99, 102, 241, 0.12));
  color: #4f46e5;
  border: 2px solid rgba(79, 70, 229, 0.25);
}

.quick-btn--archive:hover {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: white;
  border-color: transparent;
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.35);
}

.quick-btn--delete {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(239, 68, 68, 0.12));
  color: #dc2626;
  border: 2px solid rgba(220, 38, 38, 0.25);
}

.quick-btn--delete:hover {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: white;
  border-color: transparent;
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.35);
}

/* ═══════════════════════════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════════════════════════ */
.feedback-empty {
  background: linear-gradient(135deg, rgba(7, 10, 22, 0.02) 0%, rgba(255, 255, 255, 0.95) 100%);
  border-radius: 24px;
  border: 2px dashed rgba(var(--accent-rgb), 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 60px 40px;
  position: relative;
  overflow: hidden;
}

.feedback-empty::before {
  content: '';
  position: absolute;
  inset: -50%;
  background: conic-gradient(from 0deg at 50% 50%,
      transparent 0deg,
      rgba(var(--accent-rgb), 0.03) 60deg,
      transparent 120deg,
      rgba(var(--purple-rgb), 0.03) 180deg,
      transparent 240deg,
      rgba(var(--accent-light-rgb), 0.03) 300deg,
      transparent 360deg);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

.empty-icon {
  font-size: 72px;
  color: rgba(var(--accent-rgb), 0.25);
  filter: drop-shadow(0 4px 12px rgba(var(--accent-rgb), 0.1));
  animation: float 3s ease-in-out infinite;
  position: relative;
  z-index: 1;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-12px);
  }
}

.empty-text {
  font-size: 17px;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.01em;
  position: relative;
  z-index: 1;
}

/* ═══════════════════════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════════════════════ */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .feedbacks-container {
    grid-template-columns: 1fr;
  }

  .detail-meta {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .feedbacks-center {
    gap: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-card {
    padding: 18px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .search-input,
  .filter-select {
    width: 100%;
  }

  .quick-actions {
    flex-direction: column;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   ACCESSIBILITY & PERFORMANCE
   ═══════════════════════════════════════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {

  .feedbacks-center,
  .feedback-card,
  .stat-card,
  .quick-btn,
  .send-response-btn,
  .close-detail,
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}

/* Focus visible para acessibilidade */
.search-input:focus-visible,
.filter-select:focus-visible,
.status-select:focus-visible,
.response-input:focus-visible,
.send-response-btn:focus-visible,
.quick-btn:focus-visible,
.close-detail:focus-visible {
  outline: 3px solid var(--accent-light);
  outline-offset: 2px;
}

/* Scrollbar personalizado */
.feedbacks-list-section::-webkit-scrollbar {
  width: 8px;
}

.feedbacks-list-section::-webkit-scrollbar-track {
  background: rgba(var(--accent-rgb), 0.05);
  border-radius: 10px;
}

.feedbacks-list-section::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, var(--accent-light), var(--accent));
  border-radius: 10px;
}

.feedbacks-list-section::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, var(--accent), var(--purple));
}
</style>
