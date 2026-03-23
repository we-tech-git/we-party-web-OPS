<template>
  <div class="post-event-manager">
    <header class="manager-header">
      <div class="header-info">
        <h1 class="page-title">{{ t('admin.postEvent.title') }}</h1>
        <p class="page-subtitle">{{ t('admin.postEvent.subtitle') }}</p>
      </div>
    </header>

    <!-- Tabs -->
    <div class="manager-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="manager-tab"
        :class="{ 'manager-tab--active': activeTab === tab.key }"
        type="button"
        @click="activeTab = tab.key as 'gallery' | 'reviews' | 'metrics' | 'remarketing'"
      >
        <span class="mdi" :class="tab.icon" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Gallery Tab -->
    <section v-if="activeTab === 'gallery'" class="content-section">
      <div class="gallery-header">
        <div class="gallery-info">
          <h2 class="section-title">Galeria de Fotos</h2>
          <span class="photo-count">{{ photos.length }} fotos</span>
        </div>
        <div class="gallery-actions">
          <button class="upload-btn" type="button" @click="openUploadModal">
            <span class="mdi mdi-upload" />
            Upload
          </button>
        </div>
      </div>

      <div class="gallery-grid">
        <div
          v-for="photo in photos"
          :key="photo.id"
          class="photo-card"
          :class="{ 'photo-card--selected': selectedPhotos.includes(photo.id) }"
          @click="togglePhotoSelection(photo.id)"
        >
          <img :alt="photo.caption" class="photo-image" :src="photo.url">
          <div class="photo-overlay">
            <div class="photo-checkbox">
              <span class="mdi mdi-check" />
            </div>
            <div class="photo-stats">
              <span><span class="mdi mdi-heart" /> {{ photo.likes }}</span>
              <span><span class="mdi mdi-download" /> {{ photo.downloads }}</span>
            </div>
          </div>
        </div>

        <div class="upload-card" @click="openUploadModal">
          <span class="mdi mdi-plus" />
          <span>Adicionar fotos</span>
        </div>
      </div>

      <Transition name="slide-up">
        <div v-if="selectedPhotos.length > 0" class="selection-bar">
          <span>{{ selectedPhotos.length }} fotos selecionadas</span>
          <div class="selection-actions">
            <button class="selection-btn" type="button" @click="downloadSelected">
              <span class="mdi mdi-download" />
              Download
            </button>
            <button class="selection-btn selection-btn--danger" type="button" @click="deleteSelected">
              <span class="mdi mdi-delete" />
              Excluir
            </button>
          </div>
        </div>
      </Transition>
    </section>

    <!-- Reviews Tab -->
    <section v-if="activeTab === 'reviews'" class="content-section">
      <div class="reviews-header">
        <div class="reviews-summary">
          <div class="rating-overview">
            <span class="rating-number">{{ averageRating.toFixed(1) }}</span>
            <div class="rating-stars">
              <span
                v-for="i in 5"
                :key="i"
                class="mdi"
                :class="i <= Math.round(averageRating) ? 'mdi-star' : 'mdi-star-outline'"
              />
            </div>
            <span class="rating-count">{{ reviews.length }} avaliações</span>
          </div>
          <div class="rating-bars">
            <div v-for="i in 5" :key="i" class="rating-bar-row">
              <span>{{ 6 - i }}</span>
              <div class="rating-bar">
                <div class="rating-bar-fill" :style="{ width: `${getRatingPercent(6 - i)}%` }" />
              </div>
              <span>{{ getRatingCount(6 - i) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="reviews-list">
        <div v-for="review in reviews" :key="review.id" class="review-card">
          <div class="review-header">
            <img :alt="review.author" class="review-avatar" :src="review.avatar">
            <div class="review-author-info">
              <span class="review-author">{{ review.author }}</span>
              <div class="review-rating">
                <span
                  v-for="i in 5"
                  :key="i"
                  class="mdi"
                  :class="i <= review.rating ? 'mdi-star' : 'mdi-star-outline'"
                />
              </div>
            </div>
            <span class="review-date">{{ review.date }}</span>
          </div>
          <p class="review-text">{{ review.text }}</p>
          <div class="review-actions">
            <button class="review-action" type="button">
              <span class="mdi mdi-thumb-up-outline" />
              Útil ({{ review.helpful }})
            </button>
            <button class="review-action" type="button">
              <span class="mdi mdi-message-reply-outline" />
              Responder
            </button>
            <button class="review-action review-action--report" type="button">
              <span class="mdi mdi-flag-outline" />
              Reportar
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Metrics Tab -->
    <section v-if="activeTab === 'metrics'" class="content-section">
      <div class="metrics-grid">
        <div
          v-for="metric in eventMetrics"
          :key="metric.label"
          class="metric-card"
          :style="{ '--accent': metric.color }"
        >
          <div class="metric-icon">
            <span class="mdi" :class="metric.icon" />
          </div>
          <div class="metric-content">
            <span class="metric-value">{{ metric.value }}</span>
            <span class="metric-label">{{ metric.label }}</span>
          </div>
          <div class="metric-chart">
            <svg class="sparkline" viewBox="0 0 60 30">
              <polyline fill="none" :points="metric.sparkline" :stroke="metric.color" stroke-width="2" />
            </svg>
          </div>
        </div>
      </div>

      <div class="metrics-details">
        <div class="satisfaction-card">
          <h3>Satisfação Geral</h3>
          <div class="satisfaction-chart">
            <svg class="donut-chart" viewBox="0 0 200 100">
              <circle
                cx="100"
                cy="100"
                fill="none"
                r="80"
                stroke="#e5e7eb"
                stroke-dasharray="502"
                stroke-width="20"
                transform="rotate(-90, 100, 100)"
              />
              <circle
                cx="100"
                cy="100"
                fill="none"
                r="80"
                stroke="url(#satisfaction-gradient)"
                :stroke-dasharray="`${satisfaction * 5.02} 502`"
                stroke-width="20"
                transform="rotate(-90, 100, 100)"
              />
              <defs>
                <linearGradient
                  id="satisfaction-gradient"
                  x1="0%"
                  x2="100%"
                  y1="0%"
                  y2="0%"
                >
                  <stop offset="0%" stop-color="#8b5cf6" />
                  <stop offset="100%" stop-color="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div class="satisfaction-value">
              <span class="value">{{ satisfaction }}%</span>
              <span class="label">Satisfeitos</span>
            </div>
          </div>
        </div>

        <div class="highlights-card">
          <h3>Destaques do Evento</h3>
          <div class="highlights-list">
            <div v-for="highlight in highlights" :key="highlight.label" class="highlight-item">
              <span class="mdi" :class="highlight.icon" :style="{ color: highlight.color }" />
              <div class="highlight-info">
                <span class="highlight-label">{{ highlight.label }}</span>
                <span class="highlight-value">{{ highlight.value }}</span>
              </div>
              <div class="highlight-bar">
                <div
                  class="highlight-fill"
                  :style="{ width: `${highlight.percent}%`, background: highlight.color }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Remarketing Tab -->
    <section v-if="activeTab === 'remarketing'" class="content-section">
      <div class="remarketing-header">
        <h2 class="section-title">Campanhas de Remarketing</h2>
        <button class="create-btn" type="button" @click="openCampaignModal">
          <span class="mdi mdi-plus" />
          Nova Campanha
        </button>
      </div>

      <div class="campaigns-grid">
        <div v-for="campaign in campaigns" :key="campaign.id" class="campaign-card">
          <div class="campaign-header">
            <div class="campaign-status" :class="`campaign-status--${campaign.status}`">
              {{ campaign.status === 'active' ? 'Ativa' : campaign.status === 'scheduled' ? 'Agendada' :
                'Pausada' }}
            </div>
            <div class="campaign-menu">
              <button class="menu-btn" type="button">
                <span class="mdi mdi-dots-vertical" />
              </button>
            </div>
          </div>
          <h3 class="campaign-title">{{ campaign.title }}</h3>
          <p class="campaign-description">{{ campaign.description }}</p>
          <div class="campaign-stats">
            <div class="campaign-stat">
              <span class="stat-value">{{ campaign.sent }}</span>
              <span class="stat-label">Enviados</span>
            </div>
            <div class="campaign-stat">
              <span class="stat-value">{{ campaign.opened }}</span>
              <span class="stat-label">Abertos</span>
            </div>
            <div class="campaign-stat">
              <span class="stat-value">{{ campaign.clicked }}</span>
              <span class="stat-label">Cliques</span>
            </div>
          </div>
          <div class="campaign-footer">
            <span class="campaign-date">
              <span class="mdi mdi-calendar" />
              {{ campaign.date }}
            </span>
            <button class="view-btn" type="button">Ver detalhes</button>
          </div>
        </div>

        <div class="add-campaign-card" @click="openCampaignModal">
          <span class="mdi mdi-bullhorn" />
          <span>Criar campanha</span>
          <p>Engaje participantes com ofertas para próximos eventos</p>
        </div>
      </div>

      <div class="remarketing-suggestions">
        <h3>Sugestões</h3>
        <div class="suggestions-list">
          <div
            v-for="suggestion in suggestions"
            :key="suggestion.title"
            class="suggestion-card"
            @click="applySuggestion(suggestion)"
          >
            <span class="mdi" :class="suggestion.icon" :style="{ color: suggestion.color }" />
            <div class="suggestion-info">
              <span class="suggestion-title">{{ suggestion.title }}</span>
              <span class="suggestion-description">{{ suggestion.description }}</span>
            </div>
            <span class="mdi mdi-chevron-right" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const activeTab = ref<'gallery' | 'reviews' | 'metrics' | 'remarketing'>('gallery')
  const selectedPhotos = ref<number[]>([])

  const tabs = [
    { key: 'gallery', label: 'Galeria', icon: 'mdi-image-multiple' },
    { key: 'reviews', label: 'Avaliações', icon: 'mdi-star' },
    { key: 'metrics', label: 'Métricas', icon: 'mdi-chart-bar' },
    { key: 'remarketing', label: 'Remarketing', icon: 'mdi-bullhorn' },
  ]

  // Gallery
  const photos = ref([
    { id: 1, url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop', caption: 'Crowd shot', likes: 156, downloads: 34 },
    { id: 2, url: 'https://images.unsplash.com/photo-1527489782872-623b5e503b07?w=400&h=400&fit=crop', caption: 'Stage lights', likes: 243, downloads: 56 },
    { id: 3, url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&h=400&fit=crop', caption: 'DJ set', likes: 189, downloads: 45 },
    { id: 4, url: 'https://images.unsplash.com/photo-1545127398-14699f92a585?w=400&h=400&fit=crop', caption: 'Night view', likes: 98, downloads: 23 },
    { id: 5, url: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=400&h=400&fit=crop', caption: 'Party people', likes: 312, downloads: 78 },
    { id: 6, url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop', caption: 'Confetti', likes: 167, downloads: 41 },
  ])

  function togglePhotoSelection (id: number) {
    const index = selectedPhotos.value.indexOf(id)
    if (index === -1) {
      selectedPhotos.value.push(id)
    } else {
      selectedPhotos.value.splice(index, 1)
    }
  }

  function openUploadModal () {
    console.log('Opening upload modal...')
  }

  function downloadSelected () {
    console.log('Downloading', selectedPhotos.value)
  }

  function deleteSelected () {
    photos.value = photos.value.filter(p => !selectedPhotos.value.includes(p.id))
    selectedPhotos.value = []
  }

  // Reviews
  const reviews = ref([
    { id: 1, author: 'Ana Silva', avatar: 'https://i.pravatar.cc/100?img=1', rating: 5, date: '2 dias atrás', text: 'Evento incrível! A organização estava perfeita e a música foi sensacional. Com certeza voltarei nos próximos.', helpful: 12 },
    { id: 2, author: 'Bruno Costa', avatar: 'https://i.pravatar.cc/100?img=2', rating: 4, date: '3 dias atrás', text: 'Muito bom! O único ponto negativo foi a fila do bar que estava um pouco longa.', helpful: 8 },
    { id: 3, author: 'Carla Mendes', avatar: 'https://i.pravatar.cc/100?img=3', rating: 5, date: '4 dias atrás', text: 'Uma das melhores festas que já fui! O line-up estava impecável.', helpful: 15 },
    { id: 4, author: 'Daniel Oliveira', avatar: 'https://i.pravatar.cc/100?img=4', rating: 3, date: '5 dias atrás', text: 'Foi bom, mas esperava mais do som. A iluminação estava ótima.', helpful: 3 },
  ])

  const averageRating = computed(() => {
    return reviews.value.reduce((sum, r) => sum + r.rating, 0) / reviews.value.length
  })

  function getRatingCount (rating: number) {
    return reviews.value.filter(r => r.rating === rating).length
  }

  function getRatingPercent (rating: number) {
    return (getRatingCount(rating) / reviews.value.length) * 100
  }

  // Metrics
  const satisfaction = ref(87)

  const eventMetrics = [
    { label: 'Total de Participantes', value: '1.234', icon: 'mdi-account-group', color: '#8b5cf6', sparkline: '0,25 10,20 20,15 30,22 40,18 50,28 60,30' },
    { label: 'Check-ins Realizados', value: '1.156', icon: 'mdi-check-circle', color: '#10b981', sparkline: '0,10 10,15 20,25 30,22 40,28 50,26 60,30' },
    { label: 'Engajamento Social', value: '2.5k', icon: 'mdi-share-variant', color: '#3b82f6', sparkline: '0,20 10,22 20,18 30,25 40,28 50,24 60,30' },
    { label: 'Fotos Compartilhadas', value: '456', icon: 'mdi-camera', color: '#f59e0b', sparkline: '0,15 10,18 20,22 30,20 40,25 50,28 60,30' },
  ]

  const highlights = [
    { icon: 'mdi-music', label: 'Música', value: '92%', percent: 92, color: '#8b5cf6' },
    { icon: 'mdi-glass-cocktail', label: 'Drinks', value: '78%', percent: 78, color: '#ec4899' },
    { icon: 'mdi-lightbulb', label: 'Ambiente', value: '95%', percent: 95, color: '#f59e0b' },
    { icon: 'mdi-account-group', label: 'Staff', value: '88%', percent: 88, color: '#10b981' },
  ]

  // Remarketing
  const campaigns = ref([
    { id: 1, title: 'Próximo Evento - Early Bird', description: 'Desconto exclusivo para participantes anteriores', status: 'active', sent: 1234, opened: 876, clicked: 234, date: '25/01/2024' },
    { id: 2, title: 'Pesquisa de Satisfação', description: 'Feedback sobre o último evento', status: 'paused', sent: 1234, opened: 654, clicked: 98, date: '20/01/2024' },
  ])

  const suggestions = [
    { icon: 'mdi-gift', title: 'Oferta de Aniversário', description: 'Envie descontos para aniversariantes', color: '#ec4899' },
    { icon: 'mdi-account-heart', title: 'Fidelidade', description: 'Recompense participantes frequentes', color: '#8b5cf6' },
    { icon: 'mdi-calendar-star', title: 'Save the Date', description: 'Anuncie o próximo evento', color: '#f59e0b' },
  ]

  function openCampaignModal () {
    console.log('Opening campaign modal...')
  }

  function applySuggestion (suggestion: any) {
    console.log('Applying suggestion:', suggestion.title)
  }
</script>

<style scoped>
.post-event-manager {
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

.manager-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
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

/* Tabs */
.manager-tabs {
    display: flex;
    gap: 8px;
    padding: 8px;
    background: #f3f4f6;
    border-radius: 16px;
    width: fit-content;
}

.manager-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border: none;
    border-radius: 12px;
    background: transparent;
    color: #6b7280;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.manager-tab:hover {
    background: rgba(255, 255, 255, 0.5);
}

.manager-tab--active {
    background: white;
    color: #8b5cf6;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Content Section */
.content-section {
    background: white;
    border-radius: 20px;
    border: 1px solid #e5e7eb;
    padding: 24px;
}

/* Gallery */
.gallery-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.gallery-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    color: #2d2d3a;
    margin: 0;
}

.photo-count {
    padding: 4px 12px;
    background: #f3f4f6;
    border-radius: 20px;
    font-size: 13px;
    color: #6b7280;
}

.upload-btn,
.create-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #8b5cf6, #b46cff);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
}

.upload-btn:hover,
.create-btn:hover {
    transform: translateY(-2px);
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
}

.photo-card {
    position: relative;
    aspect-ratio: 1;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
}

.photo-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.photo-card:hover .photo-image {
    transform: scale(1.05);
}

.photo-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.5) 100%);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 12px;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.photo-card:hover .photo-overlay {
    opacity: 1;
}

.photo-checkbox {
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.3);
    border: 2px solid white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
    transition: all 0.2s;
}

.photo-card--selected .photo-checkbox {
    background: #8b5cf6;
    border-color: #8b5cf6;
    color: white;
}

.photo-card--selected .photo-overlay {
    opacity: 1;
}

.photo-stats {
    display: flex;
    gap: 12px;
    color: white;
    font-size: 13px;
}

.photo-stats span {
    display: flex;
    align-items: center;
    gap: 4px;
}

.upload-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    aspect-ratio: 1;
    border: 2px dashed #e5e7eb;
    border-radius: 16px;
    color: #9ca3af;
    cursor: pointer;
    transition: all 0.3s ease;
}

.upload-card:hover {
    border-color: #8b5cf6;
    color: #8b5cf6;
    background: rgba(139, 92, 246, 0.05);
}

.upload-card .mdi {
    font-size: 32px;
}

/* Selection Bar */
.selection-bar {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 16px 24px;
    background: #1f2937;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    z-index: 100;
    color: white;
}

.selection-actions {
    display: flex;
    gap: 12px;
}

.selection-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.selection-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.selection-btn--danger:hover {
    background: #ef4444;
}

/* Reviews */
.reviews-header {
    margin-bottom: 24px;
}

.reviews-summary {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 40px;
    padding: 24px;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(245, 158, 11, 0.08));
    border-radius: 16px;
}

.rating-overview {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.rating-number {
    font-size: 56px;
    font-weight: 700;
    color: #2d2d3a;
}

.rating-stars {
    display: flex;
    gap: 4px;
    color: #f59e0b;
    font-size: 24px;
}

.rating-count {
    font-size: 14px;
    color: #6b7280;
    margin-top: 8px;
}

.rating-bars {
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: center;
}

.rating-bar-row {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: #6b7280;
}

.rating-bar {
    flex: 1;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
}

.rating-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #f59e0b, #fbbf24);
    border-radius: 4px;
}

.reviews-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.review-card {
    padding: 20px;
    background: #f9fafb;
    border-radius: 16px;
}

.review-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.review-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
}

.review-author-info {
    flex: 1;
}

.review-author {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: #2d2d3a;
}

.review-rating {
    display: flex;
    gap: 2px;
    color: #f59e0b;
    font-size: 14px;
}

.review-date {
    font-size: 13px;
    color: #9ca3af;
}

.review-text {
    font-size: 14px;
    color: #4b5563;
    line-height: 1.6;
    margin: 0 0 16px;
}

.review-actions {
    display: flex;
    gap: 12px;
}

.review-action {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: none;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;
}

.review-action:hover {
    background: #e5e7eb;
}

.review-action--report {
    margin-left: auto;
}

.review-action--report:hover {
    color: #ef4444;
}

/* Metrics */
.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.metric-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: #f9fafb;
    border-radius: 16px;
    border-left: 4px solid var(--accent);
}

.metric-icon {
    width: 48px;
    height: 48px;
    background: white;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    font-size: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.metric-content {
    flex: 1;
}

.metric-value {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: #2d2d3a;
}

.metric-label {
    display: block;
    font-size: 13px;
    color: #6b7280;
}

.metric-chart {
    width: 60px;
    height: 30px;
}

.sparkline {
    width: 100%;
    height: 100%;
}

.metrics-details {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 24px;
}

.satisfaction-card,
.highlights-card {
    padding: 24px;
    background: #f9fafb;
    border-radius: 16px;
}

.satisfaction-card h3,
.highlights-card h3 {
    font-size: 16px;
    font-weight: 600;
    color: #2d2d3a;
    margin: 0 0 20px;
}

.satisfaction-chart {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.donut-chart {
    width: 180px;
    height: 180px;
}

.satisfaction-value {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.satisfaction-value .value {
    font-size: 36px;
    font-weight: 700;
    color: #2d2d3a;
}

.satisfaction-value .label {
    font-size: 14px;
    color: #6b7280;
}

.highlights-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.highlight-item {
    display: flex;
    align-items: center;
    gap: 12px;
}

.highlight-item .mdi {
    font-size: 24px;
}

.highlight-info {
    display: flex;
    justify-content: space-between;
    width: 100px;
}

.highlight-label {
    font-size: 14px;
    color: #4b5563;
}

.highlight-value {
    font-size: 14px;
    font-weight: 600;
    color: #2d2d3a;
}

.highlight-bar {
    flex: 1;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
}

.highlight-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s ease;
}

/* Remarketing */
.remarketing-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.campaigns-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
}

.campaign-card {
    padding: 24px;
    background: #f9fafb;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
}

.campaign-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.campaign-status {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}

.campaign-status--active {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
}

.campaign-status--scheduled {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
}

.campaign-status--paused {
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;
}

.menu-btn {
    width: 32px;
    height: 32px;
    background: none;
    border: none;
    border-radius: 8px;
    color: #6b7280;
    cursor: pointer;
}

.menu-btn:hover {
    background: #e5e7eb;
}

.campaign-title {
    font-size: 16px;
    font-weight: 600;
    color: #2d2d3a;
    margin: 0 0 8px;
}

.campaign-description {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 16px;
}

.campaign-stats {
    display: flex;
    gap: 24px;
    padding: 16px 0;
    border-top: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb;
}

.campaign-stat {
    display: flex;
    flex-direction: column;
}

.campaign-stat .stat-value {
    font-size: 20px;
    font-weight: 700;
    color: #2d2d3a;
}

.campaign-stat .stat-label {
    font-size: 12px;
    color: #6b7280;
}

.campaign-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
}

.campaign-date {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #6b7280;
}

.view-btn {
    padding: 8px 16px;
    background: none;
    border: 1px solid #8b5cf6;
    border-radius: 10px;
    color: #8b5cf6;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.view-btn:hover {
    background: #8b5cf6;
    color: white;
}

.add-campaign-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 32px;
    border: 2px dashed #e5e7eb;
    border-radius: 16px;
    color: #9ca3af;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
}

.add-campaign-card:hover {
    border-color: #8b5cf6;
    color: #8b5cf6;
}

.add-campaign-card .mdi {
    font-size: 40px;
}

.add-campaign-card p {
    font-size: 13px;
    margin: 0;
    max-width: 200px;
}

/* Suggestions */
.remarketing-suggestions h3 {
    font-size: 16px;
    font-weight: 600;
    color: #2d2d3a;
    margin: 0 0 16px;
}

.suggestions-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 12px;
}

.suggestion-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    cursor: pointer;
    transition: all 0.2s;
}

.suggestion-card:hover {
    background: white;
    border-color: #8b5cf6;
    transform: translateX(4px);
}

.suggestion-card .mdi:first-child {
    font-size: 28px;
}

.suggestion-info {
    flex: 1;
}

.suggestion-title {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #2d2d3a;
}

.suggestion-description {
    display: block;
    font-size: 13px;
    color: #6b7280;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
    opacity: 0;
    transform: translate(-50%, 100%);
}

@media (max-width: 768px) {
    .reviews-summary {
        grid-template-columns: 1fr;
        gap: 24px;
    }

    .metrics-details {
        grid-template-columns: 1fr;
    }
}
</style>
