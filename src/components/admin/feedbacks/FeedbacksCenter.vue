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
            <img
              :alt="selectedFeedback.user.name"
              class="detail-avatar"
              :src="selectedFeedback.user.avatar"
            >
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
            <div
              v-for="(attachment, index) in selectedFeedback.attachments"
              :key="index"
              class="attachment-item"
            >
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
            <button
              class="send-response-btn"
              :disabled="!responseText.trim()"
              type="button"
              @click="sendResponse"
            >
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
.feedbacks-center {
    display: flex;
    flex-direction: column;
    gap: 24px;
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 16px;
}

.page-title {
    font-size: 28px;
    font-weight: 700;
    color: #2d2d3a;
    margin: 0;
}

.page-subtitle {
    font-size: 14px;
    color: #8b8b99;
    margin: 4px 0 0;
}

.header-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.search-box {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 14px;
    font-size: 20px;
    color: #9ca3af;
}

.search-input {
    padding: 10px 16px 10px 44px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: white;
    font-size: 14px;
    min-width: 220px;
    transition: all 0.3s ease;
}

.search-input:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.filter-select {
    padding: 10px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: white;
    font-size: 14px;
    color: #374151;
    cursor: pointer;
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
    border-radius: 16px;
    border: 1px solid rgba(171, 151, 255, 0.15);
}

.stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
}

.stat-card--total .stat-icon {
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
}

.stat-card--pending .stat-icon {
    background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.stat-card--resolved .stat-icon {
    background: linear-gradient(135deg, #10b981, #34d399);
}

.stat-card--rating .stat-icon {
    background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

.stat-info {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #2d2d3a;
}

.stat-label {
    font-size: 13px;
    color: #6b7280;
}

/* Feedbacks Container */
.feedbacks-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    min-height: 600px;
}

.feedbacks-list-section {
    background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
    border-radius: 20px;
    border: 1px solid rgba(171, 151, 255, 0.15);
    padding: 20px;
    overflow-y: auto;
    max-height: 700px;
}

.feedbacks-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.feedback-card {
    padding: 18px;
    background: white;
    border-radius: 14px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.3s ease;
}

.feedback-card:hover {
    border-color: rgba(139, 92, 246, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.feedback-card--selected {
    border-color: #8b5cf6;
    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.2);
}

.feedback-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.feedback-user {
    display: flex;
    align-items: center;
    gap: 12px;
}

.feedback-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.feedback-user-info {
    display: flex;
    flex-direction: column;
}

.feedback-user-name {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.feedback-date {
    font-size: 12px;
    color: #9ca3af;
}

.feedback-badges {
    display: flex;
    gap: 8px;
}

.type-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
}

.type-badge--suggestion {
    background: #fef3c7;
    color: #d97706;
}

.type-badge--bug {
    background: #fee2e2;
    color: #dc2626;
}

.type-badge--complaint {
    background: #fce7f3;
    color: #db2777;
}

.type-badge--praise {
    background: #d1fae5;
    color: #059669;
}

.status-badge {
    display: inline-flex;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
}

.status-badge--pending {
    background: #fef3c7;
    color: #d97706;
}

.status-badge--inProgress {
    background: #dbeafe;
    color: #2563eb;
}

.status-badge--resolved {
    background: #d1fae5;
    color: #059669;
}

.feedback-preview {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 12px;
    line-height: 1.5;
}

.feedback-rating {
    display: flex;
    gap: 2px;
}

.feedback-rating .mdi {
    font-size: 16px;
    color: #fbbf24;
}

/* Feedback Detail */
.feedback-detail {
    background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
    border-radius: 20px;
    border: 1px solid rgba(171, 151, 255, 0.15);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.detail-user {
    display: flex;
    align-items: center;
    gap: 14px;
}

.detail-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
}

.detail-user-info {
    display: flex;
    flex-direction: column;
}

.detail-user-name {
    font-size: 18px;
    font-weight: 700;
    color: #2d2d3a;
}

.detail-email {
    font-size: 14px;
    color: #9ca3af;
}

.close-detail {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: #f3f4f6;
    cursor: pointer;
    font-size: 20px;
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
}

.detail-meta {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.meta-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.meta-label {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
}

.meta-value {
    font-size: 14px;
    color: #374151;
}

.status-select {
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    color: #374151;
    width: fit-content;
}

.rating-stars .mdi {
    font-size: 20px;
    color: #fbbf24;
}

.detail-message {
    background: #f9fafb;
    border-radius: 12px;
    padding: 16px;
}

.detail-message h4 {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 10px;
}

.detail-message p {
    font-size: 14px;
    color: #4b5563;
    line-height: 1.6;
    margin: 0;
}

.detail-attachments h4 {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 12px;
}

.attachments-grid {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.attachment-item {
    width: 100px;
    height: 100px;
    border-radius: 10px;
    overflow: hidden;
}

.attachment-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Response Section */
.response-section h4 {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 12px;
}

.existing-response {
    background: #ecfdf5;
    border-radius: 12px;
    padding: 16px;
    border-left: 4px solid #10b981;
}

.existing-response p {
    font-size: 14px;
    color: #065f46;
    margin: 0 0 8px;
    line-height: 1.5;
}

.response-date {
    font-size: 12px;
    color: #059669;
}

.new-response {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.response-input {
    padding: 14px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    font-size: 14px;
    resize: none;
    transition: all 0.3s ease;
}

.response-input:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.send-response-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #b46cff 0%, #8b5cf6 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    align-self: flex-end;
}

.send-response-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(180, 108, 255, 0.3);
}

.send-response-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Quick Actions */
.quick-actions {
    display: flex;
    gap: 12px;
    border-top: 1px solid #e5e7eb;
    padding-top: 20px;
}

.quick-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.quick-btn--resolve {
    background: #d1fae5;
    color: #059669;
}

.quick-btn--resolve:hover {
    background: #a7f3d0;
}

.quick-btn--archive {
    background: #e0e7ff;
    color: #4f46e5;
}

.quick-btn--archive:hover {
    background: #c7d2fe;
}

.quick-btn--delete {
    background: #fee2e2;
    color: #dc2626;
}

.quick-btn--delete:hover {
    background: #fecaca;
}

/* Empty State */
.feedback-empty {
    background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
    border-radius: 20px;
    border: 1px solid rgba(171, 151, 255, 0.15);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
}

.empty-icon {
    font-size: 64px;
    color: #d1d5db;
}

.empty-text {
    font-size: 16px;
    color: #9ca3af;
}

@media (max-width: 1024px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .feedbacks-container {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .header-actions {
        width: 100%;
    }

    .search-input {
        min-width: auto;
        width: 100%;
    }
}
</style>
