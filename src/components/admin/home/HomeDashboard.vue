<template>
  <section class="home-dashboard">
    <!-- Welcome Header -->
    <header class="welcome-header">
      <div class="welcome-text">
        <div class="producer-info">
          <img :alt="fullUserName" class="producer-avatar" :src="userAvatar">
          <div>
            <h1 class="welcome-title">
              {{ t('admin.home.welcome') }}, <span class="producer-name">{{ producerName }}</span>! 👋
            </h1>
            <p class="welcome-subtitle">{{ t('admin.home.welcomeSubtitle') }}</p>
          </div>
        </div>
      </div>
      <div class="header-date">
        <span class="mdi mdi-calendar-today" />
        <span>{{ currentDate }}</span>
      </div>
    </header>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <v-tooltip v-for="action in quickActions" :key="action.key" :disabled="!action.comingSoon" location="bottom">
        <template #activator="{ props }">
          <button
            v-bind="props"
            class="quick-action-btn"
            :class="[
              `quick-action-btn--${action.color}`,
              { 'quick-action-btn--disabled': action.disabled }
            ]"
            :disabled="action.disabled"
            type="button"
            @click="handleQuickAction(action)"
          >
            <span class="mdi" :class="action.icon" />
            <span>{{ t(`admin.home.${action.key}`) }}</span>
          </button>
        </template>
        <span>EM BREVE</span>
      </v-tooltip>
    </div>

    <!-- Main Grid -->
    <div class="dashboard-grid">
      <!-- My Events Carousel -->
      <section class="events-carousel-section">
        <div class="card-header">
          <h3 class="card-title">
            <span class="mdi mdi-calendar-star" />
            {{ t('admin.home.myEventsCarousel') }}
          </h3>
        </div>
        <div v-if="activeEvents.length === 0" class="carousel-empty">
          <span class="mdi mdi-calendar-plus" />
          <p>Nenhum evento criado ainda</p>
        </div>
        <div v-else class="carousel-wrapper">
          <button
            class="carousel-arrow carousel-arrow--prev"
            :disabled="carouselIndex === 0"
            type="button"
            @click="carouselPrev"
          >
            <span class="mdi mdi-chevron-left" />
          </button>
          <div class="carousel-track-container">
            <div class="carousel-track" :style="{ transform: `translateX(calc(-${carouselIndex} * (400px + 16px)))` }">
              <article
                v-for="(event, i) in activeEvents"
                :key="event.id"
                class="carousel-card"
                :class="{ 'carousel-card--active': i === carouselIndex }"
              >
                <!-- Card Container with Gradient Border -->
                <div class="carousel-card-wrapper">
                  <!-- Status Badge -->
                  <div class="status-badge-wrapper">
                    <span class="status-badge" :class="`status-badge--${event.status}`">
                      <span class="status-dot" />
                      {{ event.status }}
                    </span>
                  </div>

                  <!-- Event Image with Overlay -->
                  <div class="event-image-container">
                    <img
                      :alt="event.name"
                      class="event-image"
                      loading="lazy"
                      :src="event.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600'"
                    >
                    <!-- Gradient Overlays -->
                    <div class="image-overlay-gradient" />
                    <div class="image-overlay-vignette" />

                    <!-- Archive Button -->
                    <button class="archive-button" title="Arquivar evento" type="button" @click="archiveEvent(event)">
                      <svg
                        fill="none"
                        height="14"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                        width="14"
                      >
                        <path
                          d="M3 6h18M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m3 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6h14zM10 11v6M14 11v6"
                        />
                      </svg>
                    </button>

                    <!-- Likes Badge -->
                    <div class="likes-badge">
                      <svg fill="currentColor" height="11" viewBox="0 0 24 24" width="11">
                        <path
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        />
                      </svg>
                      {{ formatNumber(event.likes) }}
                    </div>
                  </div>

                  <!-- Card Content -->
                  <div class="event-content">
                    <!-- Event Title -->
                    <h3 class="event-title">{{ event.name }}</h3>

                    <!-- Event Meta Info -->
                    <div class="event-meta">
                      <div class="meta-item">
                        <svg
                          fill="none"
                          height="11"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          viewBox="0 0 24 24"
                          width="11"
                        >
                          <rect
                            height="18"
                            rx="2"
                            ry="2"
                            width="18"
                            x="3"
                            y="4"
                          />
                          <line x1="16" x2="16" y1="2" y2="6" />
                          <line x1="8" x2="8" y1="2" y2="6" />
                          <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                        <span>{{ event.date }}</span>
                      </div>
                      <div class="meta-item">
                        <svg
                          fill="none"
                          height="11"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          viewBox="0 0 24 24"
                          width="11"
                        >
                          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{{ event.location }}</span>
                      </div>
                      <div class="meta-item">
                        <svg
                          fill="none"
                          height="11"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          viewBox="0 0 24 24"
                          width="11"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>{{ event.commentsCount }} comentários</span>
                      </div>
                    </div>

                    <!-- Category Tag -->
                    <div v-if="event.interests && event.interests.length > 0" class="category-tags">
                      <span v-for="(interest, idx) in event.interests.slice(0, 2)" :key="idx" class="category-tag">
                        {{ interest }}
                      </span>
                      <span v-if="event.interests.length > 2" class="category-tag category-tag--more">
                        +{{ event.interests.length - 2 }}
                      </span>
                    </div>

                    <!-- Countdown Timer -->
                    <div class="countdown-container">
                      <div class="countdown-label">Começa em:</div>
                      <div class="countdown-grid">
                        <div class="countdown-box">
                          <div class="countdown-value">{{ event.countdown.days }}</div>
                          <div class="countdown-text">dias</div>
                        </div>
                        <div class="countdown-separator">:</div>
                        <div class="countdown-box">
                          <div class="countdown-value">{{ event.countdown.hours }}</div>
                          <div class="countdown-text">hrs</div>
                        </div>
                        <div class="countdown-separator">:</div>
                        <div class="countdown-box">
                          <div class="countdown-value">{{ event.countdown.minutes }}</div>
                          <div class="countdown-text">min</div>
                        </div>
                        <div class="countdown-separator">:</div>
                        <div class="countdown-box">
                          <div class="countdown-value">{{ event.countdown.seconds }}</div>
                          <div class="countdown-text">seg</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
          <button
            class="carousel-arrow carousel-arrow--next"
            :disabled="carouselIndex >= activeEvents.length - 1"
            type="button"
            @click="carouselNext"
          >
            <span class="mdi mdi-chevron-right" />
          </button>
        </div>
        <div class="carousel-dots">
          <span
            v-for="(_, i) in activeEvents"
            :key="i"
            class="carousel-dot"
            :class="{ 'carousel-dot--active': i === carouselIndex }"
            @click="carouselIndex = i"
          />
        </div>
      </section>

      <!-- Stats Overview -->
      <div class="stats-overview">
        <div
          v-for="(stat, index) in overviewStats"
          :key="stat.key"
          class="overview-stat"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="stat-header">
            <span class="mdi" :class="stat.icon" />
            <span class="stat-trend" :class="stat.trend > 0 ? 'trend-up' : 'trend-down'">
              <span class="mdi" :class="stat.trend > 0 ? 'mdi-trending-up' : 'mdi-trending-down'" />
              {{ Math.abs(stat.trend) }}%
            </span>
          </div>
          <span class="stat-value">{{ formatNumber(stat.value) }}</span>
          <span class="stat-label">{{ t(`admin.home.${stat.key}`) }}</span>
        </div>
      </div>

      <!-- Likes Chart -->
      <div class="chart-card">
        <div class="card-header">
          <h3 class="card-title">
            <span class="mdi mdi-heart" />
            {{ t('admin.home.likesChart') }}
          </h3>
          <div class="period-selector">
            <button
              v-for="period in periods"
              :key="period"
              class="period-btn"
              :class="{ active: selectedPeriod === period }"
              type="button"
              @click="selectedPeriod = period"
            >
              {{ period }}
            </button>
          </div>
        </div>
        <div class="chart-content">
          <div class="chart-stats">
            <div class="chart-stat">
              <span class="chart-stat-value">{{ formatNumber(totalLikes) }}</span>
              <span class="chart-stat-label">{{ t('admin.home.totalLikes') }}</span>
            </div>
            <div class="chart-stat">
              <span class="chart-stat-value">{{ totalEventCount }}</span>
              <span class="chart-stat-label">{{ t('admin.home.totalEventsLabel') }}</span>
            </div>
            <div class="chart-stat" :class="growthPercent >= 0 ? 'positive' : 'negative'">
              <span class="chart-stat-value">{{ growthPercent >= 0 ? '+' : '' }}{{ growthPercent }}%</span>
              <span class="chart-stat-label">{{ t('admin.home.growth') }}</span>
            </div>
          </div>
          <div class="chart-area">
            <svg class="chart-svg" preserveAspectRatio="none" viewBox="0 0 400 150">
              <defs>
                <linearGradient
                  id="likesGradient"
                  x1="0%"
                  x2="0%"
                  y1="0%"
                  y2="100%"
                >
                  <stop offset="0%" style="stop-color:#ff4f94;stop-opacity:0.4" />
                  <stop offset="100%" style="stop-color:#ff4f94;stop-opacity:0.05" />
                </linearGradient>
              </defs>
              <path class="chart-fill" :d="chartFillPath" />
              <path class="chart-line" :d="chartLinePath" />
              <g class="chart-points">
                <circle
                  v-for="(point, index) in chartPoints"
                  :key="index"
                  class="chart-point"
                  :cx="point.x"
                  :cy="point.y"
                  r="4"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>

      <!-- Upcoming Events -->
      <div class="upcoming-events">
        <div class="card-header">
          <h3 class="card-title">
            <span class="mdi mdi-calendar-month" />
            {{ t('admin.home.upcomingEvents') }}
          </h3>
        </div>
        <div class="events-timeline">
          <div v-for="event in upcomingEvents" :key="event.id" class="timeline-event">
            <div class="event-date-badge">
              <span class="event-day">{{ event.day }}</span>
              <span class="event-month">{{ event.month }}</span>
            </div>
            <div class="event-info">
              <h4 class="event-title">{{ event.name }}</h4>
              <p class="event-venue">{{ event.venue }}</p>
              <div class="event-meta">
                <span>
                  <span class="mdi mdi-ticket" />
                  {{ event.ticketsSold }}/{{ event.totalTickets }}
                </span>
                <span>
                  <span class="mdi mdi-currency-usd" />
                  R$ {{ formatNumber(event.revenue) }}
                </span>
              </div>
            </div>
            <div class="event-status" :class="`status-${event.status}`">
              {{ event.status }}
            </div>
          </div>
        </div>
      </div>

      <!-- Event Comments -->
      <div class="recent-reviews">
        <div class="card-header">
          <h3 class="card-title">
            <span class="mdi mdi-comment-text-multiple" />
            {{ t('admin.home.eventComments') }}
          </h3>
          <button
            class="icon-btn"
            :disabled="isLoadingComments"
            title="Atualizar comentários"
            type="button"
            @click="loadComments"
          >
            <span class="mdi" :class="isLoadingComments ? 'mdi-loading mdi-spin' : 'mdi-refresh'" />
          </button>
        </div>

        <!-- Loading skeleton -->
        <div v-if="isLoadingComments" class="comments-loading">
          <div v-for="n in 3" :key="n" class="comment-skeleton">
            <div class="skeleton-avatar" />
            <div class="skeleton-body">
              <div class="skeleton-line skeleton-line--short" />
              <div class="skeleton-line" />
              <div class="skeleton-line skeleton-line--medium" />
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="eventComments.length === 0" class="comments-empty">
          <span class="mdi mdi-comment-off-outline" />
          <p>Nenhum comentário ainda</p>
        </div>

        <!-- Comments list -->
        <div v-else class="reviews-list">
          <div v-for="comment in eventComments" :key="comment.id" class="review-item">
            <div class="review-avatar-wrap">
              <img v-if="comment.avatar" :alt="comment.author" class="review-avatar" :src="comment.avatar">
              <div v-else class="review-avatar review-avatar--fallback">
                {{ comment.author.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="review-content">
              <div class="review-header">
                <span class="review-author">{{ comment.author }}</span>
                <span class="review-time">{{ comment.time }}</span>
              </div>
              <p class="review-text">{{ comment.text }}</p>
              <span class="review-event">
                <span class="mdi mdi-calendar-check" />
                {{ comment.eventName }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Smart Suggestions -->
      <div class="smart-suggestions">
        <div class="card-header">
          <h3 class="card-title">
            <span class="mdi mdi-lightbulb-on" />
            {{ t('admin.home.smartSuggestions') }}
          </h3>
        </div>
        <div class="suggestions-list">
          <div
            v-for="suggestion in suggestions"
            :key="suggestion.id"
            class="suggestion-item"
            :class="`suggestion--${suggestion.type}`"
          >
            <div class="suggestion-icon">
              <span class="mdi" :class="suggestion.icon" />
            </div>
            <div class="suggestion-content">
              <h4 class="suggestion-title">{{ t(`admin.home.${suggestion.titleKey}`) }}</h4>
              <p class="suggestion-desc">{{ t(`admin.home.${suggestion.descKey}`) }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Archived Events Modal -->
    <v-dialog v-model="isArchivedModalOpen" max-width="600">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center px-6 py-4">
          <span class="text-h6 font-weight-bold">Eventos Arquivados</span>
          <v-btn icon="mdi-close" size="small" variant="text" @click="isArchivedModalOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="px-6 py-4">
          <div v-if="archivedEventsList.length === 0" class="text-center py-8 text-grey">
            <span class="mdi mdi-archive-off-outline text-h3 d-block mb-3" />
            Nenhum evento arquivado
          </div>
          <v-list v-else lines="two">
            <v-list-item
              v-for="event in archivedEventsList"
              :key="event.id"
              :prepend-avatar="event.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100'"
            >
              <v-list-item-title class="font-weight-bold">{{ event.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ event.date }} - {{ event.location }}</v-list-item-subtitle>

              <template #append>
                <v-btn color="primary" size="small" variant="tonal" @click="unarchiveEvent(event)">
                  Desarquivar
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import { useCurrentUser } from '@/composables/useCurrentUser'
  import { getEventComments, getEventLikes, getMyEvents } from '@/services/events'

  const { t, locale } = useI18n()
  const router = useRouter()
  const { currentUser, loadUser, getFirstName } = useCurrentUser()

  // Loading state
  const isLoadingEvents = ref(false)

  // Producer info
  const producerName = computed(() => {
    const firstName = getFirstName()
    console.log('[HomeDashboard] currentUser:', currentUser.value)
    console.log('[HomeDashboard] firstName:', firstName)
    return firstName || 'Produtor'
  })
  const userAvatar = computed(() => currentUser.value.avatar)
  const fullUserName = computed(() => currentUser.value.name)

  // Current date
  const currentDate = computed(() => {
    const now = new Date()
    return now.toLocaleDateString(locale.value, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  })

  // Quick Actions
  const quickActions = [
    { key: 'createEvent', icon: 'mdi-plus-circle', color: 'primary', disabled: false, comingSoon: false, route: '/public/admin/new-event' },
    { key: 'archivedEvents', icon: 'mdi-archive', color: 'orange', disabled: false, comingSoon: false, action: showArchivedEvents },
    { key: 'marketing', icon: 'mdi-bullhorn', color: 'orange', disabled: true, comingSoon: true },
    { key: 'reports', icon: 'mdi-file-chart', color: 'purple', disabled: true, comingSoon: true },
  ]

  function handleQuickAction (action: any) {
    if (action.disabled) return
    if (action.route) {
      router.push(action.route)
    } else if (action.action) {
      action.action()
    }
  }

  // Dashboard modals state
  const isArchivedModalOpen = ref(false)

  function showArchivedEvents () {
    isArchivedModalOpen.value = true
  }

  // My Events para o carrossel
  interface CarouselEvent {
    id: string
    name: string
    date: string
    location: string
    cover: string
    status: string
    targetDate: Date
    isArchived?: boolean
    likes: number
    interests: string[]
    commentsCount: number
    countdown: { days: number, hours: number, minutes: number, seconds: number }
  }
  const myEvents = ref<CarouselEvent[]>([])
  const activeEvents = computed(() => myEvents.value.filter(ev => !ev.isArchived))
  const archivedEventsList = computed(() => myEvents.value.filter(ev => ev.isArchived))

  function archiveEvent (event: CarouselEvent) {
    event.isArchived = true
    if (carouselIndex.value >= activeEvents.value.length) {
      carouselIndex.value = Math.max(0, activeEvents.value.length - 1)
    }
  // Opcional: call API para atualizar o status no banco persistindo "arquivado"
  }

  function unarchiveEvent (event: CarouselEvent) {
    event.isArchived = false
  }

  const carouselIndex = ref(0)
  let carouselInterval: ReturnType<typeof setInterval> | null = null

  function computeCountdown (targetDate: Date) {
    const diff = targetDate.getTime() - Date.now()
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    }
  }

  function tickCarousels () {
    for (const ev of myEvents.value) {
      ev.countdown = computeCountdown(ev.targetDate)
    }
  }

  function carouselNext () {
    if (carouselIndex.value < activeEvents.value.length - 1) {
      carouselIndex.value++
    }
  }

  function carouselPrev () {
    if (carouselIndex.value > 0) {
      carouselIndex.value--
    }
  }

  // Totais reais derivados dos eventos carregados
  const totalLikes = computed(() => myEvents.value.reduce((sum, ev) => sum + ev.likes, 0))
  const totalEventCount = computed(() => myEvents.value.length)

  // Overview Stats — valores de curtidas derivados dos dados reais
  const overviewStats = computed(() => [
    { key: 'views', icon: 'mdi-eye', value: 45_892, trend: 12.5 },
    { key: 'likesLabel', icon: 'mdi-heart', value: totalLikes.value, trend: growthPercent.value },
  ])

  // Chart data
  const selectedPeriod = ref('7D')
  const periods = ['7D', '30D', '90D', '1A']

  // Calcula o crescimento percentual baseado em curtidas reais
  const growthPercent = computed(() => {
    if (chartData.value.length < 2) return 0

    // Compara primeira metade vs segunda metade do período
    const midPoint = Math.floor(chartData.value.length / 2)
    const firstHalf = chartData.value.slice(0, midPoint)
    const secondHalf = chartData.value.slice(midPoint)

    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length

    if (firstHalfAvg === 0) return secondHalfAvg > 0 ? 100 : 0

    const growth = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100
    return Math.round(growth * 10) / 10 // Arredonda para 1 casa decimal
  })

  const chartData = ref([
    { date: 'Seg', value: 1200 },
    { date: 'Ter', value: 2100 },
    { date: 'Qua', value: 1850 },
    { date: 'Qui', value: 3200 },
    { date: 'Sex', value: 4100 },
    { date: 'Sáb', value: 5300 },
    { date: 'Dom', value: 3800 },
  ])

  const chartPoints = computed(() => {
    if (chartData.value.length === 0) return []

    const width = 400
    const height = 150
    const padding = 20
    const rawMax = Math.max(...chartData.value.map(d => d.value))
    const maxValue = rawMax === 0 || !Number.isFinite(rawMax) ? 1 : rawMax
    const dataLength = chartData.value.length

    return chartData.value.map((d, i) => {
      // Evita divisão por zero quando só há 1 ponto
      const xPos = dataLength === 1
        ? width / 2
        : padding + (i / (dataLength - 1)) * (width - 2 * padding)

      const yPos = height - padding - (d.value / maxValue) * (height - 2 * padding)

      return {
        x: Number.isFinite(xPos) ? xPos : padding,
        y: Number.isFinite(yPos) ? yPos : height - padding,
        ...d,
      }
    })
  })

  const chartLinePath = computed(() => {
    if (chartPoints.value.length === 0) return ''
    const points = chartPoints.value
    const firstPoint = points.at(0)
    if (!firstPoint) return ''
    let path = `M ${firstPoint.x} ${firstPoint.y}`

    for (let i = 1; i < points.length; i++) {
      const prev = points.at(i - 1)
      const curr = points.at(i)
      if (!prev || !curr) continue
      const cpx1 = prev.x + (curr.x - prev.x) / 3
      const cpx2 = prev.x + 2 * (curr.x - prev.x) / 3
      path += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`
    }

    return path
  })

  const chartFillPath = computed(() => {
    if (chartPoints.value.length === 0) return ''
    const points = chartPoints.value
    const height = 150
    const lastPoint = points.at(-1)
    const firstPoint = points.at(0)
    if (!lastPoint || !firstPoint) return ''
    return `${chartLinePath.value} L ${lastPoint.x} ${height} L ${firstPoint.x} ${height} Z`
  })

  // Upcoming Events (sidebar)
  const upcomingEvents = ref([
    { id: 1, name: 'Sunset Beach Party', day: '25', month: 'Jan', venue: 'Copacabana', ticketsSold: 347, totalTickets: 500, revenue: 52_450, status: 'ativo' },
    { id: 2, name: 'Neon Night', day: '02', month: 'Fev', venue: 'Club XYZ', ticketsSold: 120, totalTickets: 300, revenue: 18_000, status: 'rascunho' },
    { id: 3, name: 'Carnival Pre-Party', day: '15', month: 'Fev', venue: 'Arena Central', ticketsSold: 0, totalTickets: 1000, revenue: 0, status: 'agendado' },
  ])

  // Normaliza o objeto de evento independente do formato retornado pela API
  function normalizeEvent (ev: any) {
    const startDateRaw = ev.startDate ?? ev.start_date ?? ev.startAt ?? ev.start_at ?? ev.date ?? ''
    const startDate = startDateRaw ? new Date(startDateRaw) : new Date(Date.now() + 86_400_000)
    const title = ev.title ?? ev.name ?? ev.eventName ?? 'Evento'
    const location = ev.location ?? ev.venue ?? ev.address ?? ev.place ?? 'Local a definir'
    const photos: string[] = ev.photos ?? ev.images ?? (ev.photo ? [ev.photo] : [])
    const cover = photos[0] ?? ev.cover ?? ev.image ?? ev.thumbnail ?? ''
    const status = ev.status ?? 'ativo'
    const likes = ev.likes ?? ev.likesCount ?? ev.likes_count ?? 0
    const interests = ev.interests ?? ev.categories ?? ev.tags ?? []
    const commentsCount = ev.commentsCount ?? ev.comments_count ?? ev.totalComments ?? 0
    return {
      raw: ev,
      id: String(ev.id ?? ev._id ?? Math.random()),
      name: title,
      date: startDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
      location,
      cover,
      status,
      targetDate: startDate,
      likes,
      interests: Array.isArray(interests) ? interests : [],
      commentsCount,
      countdown: computeCountdown(startDate),
    }
  }

  // Extrai lista de eventos independente do formato da resposta API
  function extractList (res: any): any[] {
    if (Array.isArray(res)) return res
    if (Array.isArray(res?.data?.data)) return res.data.data
    if (Array.isArray(res?.data)) return res.data
    if (Array.isArray(res?.content)) return res.content
    if (Array.isArray(res?.events)) return res.events
    if (Array.isArray(res?.items)) return res.items
    return []
  }

  // Função para carregar eventos da API
  async function loadEvents () {
    isLoadingEvents.value = true
    try {
      const res = await getMyEvents() as any
      console.log('[HomeDashboard] raw response getMyEvents:', JSON.stringify(res))
      const list = extractList(res)
      console.log('[HomeDashboard] eventos encontrados:', list.length, list)

      // Normaliza eventos e busca likes e comentários para cada um
      const eventsWithLikes = await Promise.allSettled(
        list.map(async (ev: any) => {
          const normalizedEvent = normalizeEvent(ev)
          try {
            const likesRes = await getEventLikes(normalizedEvent.id) as any
            normalizedEvent.likes = likesRes?.count ?? likesRes?.data?.count ?? normalizedEvent.likes
          } catch (error) {
            console.warn(`[HomeDashboard] Erro ao buscar likes do evento ${normalizedEvent.id}:`, error)
          }
          try {
            const commentsRes = await getEventComments(normalizedEvent.id) as any
            const commentsList = extractCommentList(commentsRes)
            normalizedEvent.commentsCount = commentsList.length
          } catch (error) {
            console.warn(`[HomeDashboard] Erro ao buscar comentários do evento ${normalizedEvent.id}:`, error)
          }
          return normalizedEvent
        }),
      )

      myEvents.value = eventsWithLikes
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value)

      // Atualiza chart data com curtidas reais por evento
      if (myEvents.value.length > 0) {
        chartData.value = myEvents.value.slice(0, 10).map(ev => ({
          date: ev.name.length > 10 ? ev.name.slice(0, 10) + '…' : ev.name,
          value: ev.likes,
        }))
      }

      // popula upcoming events para a timeline lateral
      upcomingEvents.value = list.slice(0, 5).map((event: any) => {
        const startDateRaw = event.startDate ?? event.start_date ?? event.startAt ?? event.start_at ?? ''
        const startDate = startDateRaw ? new Date(startDateRaw) : new Date()
        return {
          id: event.id ?? event._id,
          name: event.title ?? event.name ?? 'Evento',
          day: String(startDate.getDate()).padStart(2, '0'),
          month: startDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
          venue: event.location ?? event.venue ?? 'Local a definir',
          ticketsSold: event.ticketsSold ?? event.tickets_sold ?? 0,
          totalTickets: event.totalTickets ?? event.total_tickets ?? 100,
          revenue: event.revenue ?? 0,
          status: event.status ?? 'ativo',
        }
      })
    } catch (error: any) {
      const status = error?.response?.status
      console.error('[HomeDashboard] Erro ao carregar eventos:', status, error?.response?.data || error)
    } finally {
      isLoadingEvents.value = false
    }
  }

  // Event Comments
  interface CommentItem {
    id: string
    author: string
    avatar: string
    text: string
    eventName: string
    time: string
    rawDate: string
  }
  const eventComments = ref<CommentItem[]>([])
  const isLoadingComments = ref(false)

  function extractCommentList (resp: any): any[] {
    if (Array.isArray(resp)) return resp
    if (Array.isArray(resp?.data?.data)) return resp.data.data
    if (Array.isArray(resp?.data)) return resp.data
    if (Array.isArray(resp?.content)) return resp.content
    if (Array.isArray(resp?.comments)) return resp.comments
    if (Array.isArray(resp?.items)) return resp.items
    return []
  }

  async function loadComments () {
    isLoadingComments.value = true
    try {
      // Reutiliza eventos já carregados para evitar chamada duplicada
      const events = myEvents.value.length > 0 ? myEvents.value : []
      if (events.length === 0) {
        isLoadingComments.value = false
        return
      }

      const allComments: CommentItem[] = []

      await Promise.allSettled(
        events.slice(0, 5).map(async event => {
          try {
            const resp = await getEventComments(event.id) as any
            const list = extractCommentList(resp)
            console.log(`[Comments] evento "${event.name}" (${event.id}):`, list.length, 'comentários')
            for (const c of list.slice(0, 3)) {
              const text = c.content ?? c.text ?? c.message ?? ''
              if (!text.trim()) continue
              const rawDate = c.createdAt ?? c.created_at ?? c.updatedAt ?? ''
              allComments.push({
                id: String(c.id ?? c._id ?? Math.random()),
                author: c.userName ?? c.user?.name ?? c.user?.firstName ?? c.authorName ?? 'Usuário',
                avatar: c.userAvatar ?? c.user?.avatar ?? c.user?.profileImage ?? c.user?.photo ?? '',
                text,
                eventName: event.name,
                time: rawDate ? new Date(rawDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
                rawDate,
              })
            }
          } catch (error: any) {
            console.warn(`[Comments] erro no evento ${event.id}:`, error?.response?.status ?? error)
          }
        }),
      )

      // Ordena do mais recente ao mais antigo
      allComments.sort((a, b) => {
        if (!a.rawDate) return 1
        if (!b.rawDate) return -1
        return new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()
      })

      eventComments.value = allComments.slice(0, 6)
    } catch (error: any) {
      console.error('[HomeDashboard] Erro ao carregar comentários:', error?.response?.data ?? error)
    } finally {
      isLoadingComments.value = false
    }
  }

  // Suggestions
  const suggestions = ref([
    { id: 1, type: 'boost', icon: 'mdi-rocket-launch', titleKey: 'suggestionBoost', descKey: 'suggestionBoostDesc' },
    { id: 2, type: 'earlybird', icon: 'mdi-tag-multiple', titleKey: 'suggestionEarlyBird', descKey: 'suggestionEarlyBirdDesc' },
    { id: 3, type: 'social', icon: 'mdi-instagram', titleKey: 'suggestionSocial', descKey: 'suggestionSocialDesc' },
  ])

  function formatNumber (num: number): string {
    return num.toLocaleString('pt-BR')
  }

  onMounted(async () => {
    carouselInterval = setInterval(tickCarousels, 1000)
    await loadUser()
    console.log('[HomeDashboard] Após loadUser, currentUser:', currentUser.value)
    await loadEvents()
    loadComments()
  })

  onUnmounted(() => {
    if (carouselInterval) {
      clearInterval(carouselInterval)
    }
  })
</script>

<style scoped>
.home-dashboard {
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

/* Welcome Header */
.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.producer-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.producer-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid transparent;
  background: linear-gradient(white, white) padding-box,
    linear-gradient(135deg, #b46cff 0%, #ff4f94 100%) border-box;
  box-shadow: 0 4px 12px rgba(180, 108, 255, 0.2);
  transition: all 0.3s ease;
}

.producer-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(180, 108, 255, 0.3);
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d2d3a;
  margin: 0;
}

.producer-name {
  background: linear-gradient(135deg, #b46cff 0%, #ff4f94 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  color: #8b8b99;
  font-size: 15px;
  margin: 4px 0 0;
}

.header-date {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
  border-radius: 12px;
  border: 1px solid rgba(171, 151, 255, 0.15);
  color: #5c5c6d;
  font-size: 14px;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-action-btn:hover {
  transform: translateY(-2px);
}

.quick-action-btn--primary {
  background: linear-gradient(135deg, #b46cff 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(180, 108, 255, 0.3);
}

.quick-action-btn--orange {
  background: linear-gradient(135deg, #f9a538 0%, #f78c32 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(249, 165, 56, 0.3);
}

.quick-action-btn--green {
  background: linear-gradient(135deg, #5dc7a9 0%, #3eb489 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(62, 180, 137, 0.3);
}

.quick-action-btn--purple {
  background: linear-gradient(135deg, #b46cff 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(180, 108, 255, 0.3);
}

.quick-action-btn--disabled {
  background: linear-gradient(135deg, #e0e0e0 0%, #c8c8c8 100%) !important;
  color: #9e9e9e !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

.quick-action-btn--disabled:hover {
  transform: none !important;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* Events Carousel */
.events-carousel-section {
  grid-column: span 3;
  background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
  border-radius: 20px;
  border: 1px solid rgba(171, 151, 255, 0.15);
  padding: 20px;
}

.carousel-empty {
  text-align: center;
  padding: 40px 0;
  color: #a1a1b5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.carousel-empty .mdi {
  font-size: 40px;
  color: #ddd;
}

.carousel-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 560px;
}

.carousel-track-container {
  flex: 1;
  overflow: hidden;
  padding: 4px 0;
  height: 560px;
}

.carousel-track {
  display: flex;
  gap: 16px;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
  height: 100%;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CAROUSEL CARD - MODERN DESIGN
   ═══════════════════════════════════════════════════════════════════════════ */
.carousel-card {
  flex: 0 0 400px;
  max-width: 400px;
  min-width: 400px;
  height: 560px;
  position: relative;
  isolation: isolate;
}

.carousel-card--active {
  transform: scale(1.02);
}

.carousel-card-wrapper {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid transparent;
  background-clip: padding-box;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Status Badge */
.status-badge-wrapper {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  backdrop-filter: blur(12px);
  border: 1.5px solid;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.status-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

.status-badge--ativo,
.status-badge--active,
.status-badge--ACTIVE {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.12));
  color: #059669;
  border-color: rgba(5, 150, 105, 0.4);
}

.status-badge--ativo .status-dot,
.status-badge--active .status-dot,
.status-badge--ACTIVE .status-dot {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}

.status-badge--draft,
.status-badge--rascunho,
.status-badge--DRAFT {
  background: linear-gradient(135deg, rgba(156, 163, 175, 0.15), rgba(107, 114, 128, 0.12));
  color: #6b7280;
  border-color: rgba(107, 114, 128, 0.3);
}

.status-badge--draft .status-dot,
.status-badge--rascunho .status-dot,
.status-badge--DRAFT .status-dot {
  background: #9ca3af;
}

.status-badge--published,
.status-badge--PUBLISHED {
  background: linear-gradient(135deg, rgba(180, 108, 255, 0.15), rgba(139, 92, 246, 0.12));
  color: #b46cff;
  border-color: rgba(180, 108, 255, 0.4);
}

.status-badge--published .status-dot,
.status-badge--PUBLISHED .status-dot {
  background: #b46cff;
  box-shadow: 0 0 8px rgba(180, 108, 255, 0.6);
}

/* Event Image Container */
.event-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  min-height: 200px;
  max-height: 200px;
  overflow: hidden;
  flex-shrink: 0;
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* Image Overlays */
.image-overlay-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.4) 30%,
      rgba(0, 0, 0, 0.1) 60%,
      transparent 100%);
  pointer-events: none;
  z-index: 1;
}

.image-overlay-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
  pointer-events: none;
  z-index: 1;
}

/* Archive Button */
.archive-button {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  background: rgba(7, 10, 22, 0.6);
  backdrop-filter: blur(8px);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Likes Badge */
.likes-badge {
  position: absolute;
  bottom: 12px;
  left: 12px;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: #ec4899;
  box-shadow: 0 4px 16px rgba(236, 72, 153, 0.25);
  border: 1.5px solid rgba(236, 72, 153, 0.2);
}

.likes-badge svg {
  fill: #ec4899;
  filter: drop-shadow(0 2px 4px rgba(236, 72, 153, 0.3));
}

/* Event Content */
.event-content {
  padding: 14px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-height: 0;
}

/* Event Title */
.event-title {
  font-size: 15px;
  font-weight: 800;
  color: #1f2937;
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.02em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  background: linear-gradient(135deg, #1f2937 0%, #4b5563 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  min-height: 38px;
  max-height: 38px;
}

/* Event Meta */
.event-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex-shrink: 0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: #6b7280;
  padding: 5px 9px;
  background: linear-gradient(135deg, rgba(248, 248, 255, 0.8), rgba(255, 255, 255, 0.6));
  border-radius: 9px;
  border: 1px solid rgba(180, 108, 255, 0.1);
  min-height: 28px;
  overflow: hidden;
}

.meta-item span:last-child {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.meta-item svg {
  flex-shrink: 0;
  color: #b46cff;
  filter: drop-shadow(0 2px 4px rgba(180, 108, 255, 0.3));
}

/* Category Tags */
.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-height: 44px;
  overflow: hidden;
  flex-shrink: 0;
}

.category-tag {
  padding: 3px 7px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(180, 108, 255, 0.12), rgba(139, 92, 246, 0.08));
  border: 1.5px solid rgba(180, 108, 255, 0.25);
  font-size: 8px;
  font-weight: 700;
  color: #b46cff;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 110px;
}

.category-tag--more {
  background: linear-gradient(135deg, rgba(156, 163, 175, 0.12), rgba(107, 114, 128, 0.08));
  border-color: rgba(156, 163, 175, 0.25);
  border-style: dashed;
  color: #6b7280;
}

/* Countdown Container */
.countdown-container {
  margin-top: auto;
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(180, 108, 255, 0.08), rgba(255, 79, 148, 0.05));
  border-radius: 12px;
  border: 2px solid rgba(180, 108, 255, 0.15);
  flex-shrink: 0;
}

.countdown-label {
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #b46cff;
  margin-bottom: 7px;
  text-align: center;
}

.countdown-grid {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.countdown-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  max-width: 40px;
  width: 40px;
  height: 44px;
  padding: 5px 3px;
  background: linear-gradient(135deg, #b46cff 0%, #ff4f94 100%);
  border-radius: 9px;
  box-shadow: 0 4px 12px rgba(180, 108, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
}

.countdown-box::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.2) 0%,
      transparent 50%,
      rgba(0, 0, 0, 0.1) 100%);
  pointer-events: none;
}

.countdown-value {
  font-size: 14px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
}

.countdown-text {
  font-size: 6px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 2px;
  white-space: nowrap;
}

.countdown-separator {
  font-size: 12px;
  font-weight: 800;
  color: #ff4f94;
  line-height: 1;
  animation: blink 1.5s ease-in-out infinite;
  flex-shrink: 0;
  width: 5px;
  text-align: center;
}

@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }
}

.carousel-arrow {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(171, 151, 255, 0.3);
  background: white;
  color: #b46cff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.carousel-arrow:hover:not(:disabled) {
  background: #b46cff;
  color: white;
  border-color: #b46cff;
}

.carousel-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  padding: 0 12px;
  flex-wrap: wrap;
}

.carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(180, 108, 255, 0.2);
  cursor: pointer;
  border: 1px solid rgba(180, 108, 255, 0.3);
}

.carousel-dot--active {
  background: linear-gradient(135deg, #b46cff, #8b5cf6);
  width: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(180, 108, 255, 0.4);
  border-color: transparent;
}

/* Card Styles */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d2d3a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title .mdi {
  color: #b46cff;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(171, 151, 255, 0.2);
  background: white;
  color: #8b8b99;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: #f8f8ff;
  color: #b46cff;
}

/* Next Event — CSS legado mantido por compat */

/* Stats Overview */
.stats-overview {
  grid-column: span 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.overview-stat {
  background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
  border-radius: 16px;
  border: 1px solid rgba(171, 151, 255, 0.15);
  padding: 16px;
  transition: all 0.3s ease;
}

.overview-stat:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(171, 151, 255, 0.15);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-header .mdi {
  font-size: 24px;
  color: #b46cff;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
}

.trend-up {
  color: #3eb489;
}

.trend-down {
  color: #ff4f94;
}

.overview-stat .stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #2d2d3a;
}

.overview-stat .stat-label {
  font-size: 13px;
  color: #8b8b99;
}

/* Chart Card */
.chart-card {
  grid-column: span 2;
  background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
  border-radius: 20px;
  border: 1px solid rgba(171, 151, 255, 0.15);
  padding: 20px;
}

.period-selector {
  display: flex;
  gap: 4px;
  background: #f0f0f5;
  padding: 4px;
  border-radius: 8px;
}

.period-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #8b8b99;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.period-btn.active {
  background: white;
  color: #b46cff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-stats {
  display: flex;
  gap: 24px;
}

.chart-stat {
  display: flex;
  flex-direction: column;
}

.chart-stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #2d2d3a;
}

.chart-stat-label {
  font-size: 12px;
  color: #8b8b99;
}

.chart-stat.positive .chart-stat-value {
  color: #3eb489;
}

.chart-area {
  height: 150px;
}

.chart-svg {
  width: 100%;
  height: 100%;
}

.chart-fill {
  fill: url(#likesGradient);
}

.chart-line {
  fill: none;
  stroke: #ff4f94;
  stroke-width: 3;
  stroke-linecap: round;
}

.chart-point {
  fill: #ff4f94;
  stroke: white;
  stroke-width: 2;
}

/* Upcoming Events */
.upcoming-events {
  grid-column: span 1;
  background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
  border-radius: 20px;
  border: 1px solid rgba(171, 151, 255, 0.15);
  padding: 20px;
}

.events-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-event {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(171, 151, 255, 0.1);
}

.event-date-badge {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #b46cff 0%, #8b5cf6 100%);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.event-day {
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.event-month {
  font-size: 10px;
  text-transform: uppercase;
}

.event-info {
  flex: 1;
}

.event-title {
  font-size: 14px;
  font-weight: 600;
  color: #2d2d3a;
  margin: 0 0 4px;
}

.event-venue {
  font-size: 12px;
  color: #8b8b99;
  margin: 0 0 6px;
}

.event-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #a1a1b5;
}

.event-meta .mdi {
  font-size: 12px;
}

.event-status {
  align-self: flex-start;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-ativo {
  background: #e8f8f3;
  color: #3eb489;
}

.status-rascunho {
  background: #f0f0f5;
  color: #8b8b99;
}

.status-agendado {
  background: #e8f4fd;
  color: #3b82f6;
}

/* Recent Reviews */
.recent-reviews {
  grid-column: span 1;
  background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
  border-radius: 20px;
  border: 1px solid rgba(171, 151, 255, 0.15);
  padding: 20px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Comments empty state */
.comments-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 16px;
  color: #a1a1b5;
}

.comments-empty .mdi {
  font-size: 36px;
  opacity: 0.5;
}

.comments-empty p {
  margin: 0;
  font-size: 13px;
}

/* Comments loading skeleton */
.comments-loading {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-skeleton {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(171, 151, 255, 0.1);
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f5 25%, #e8e8f0 50%, #f0f0f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  flex-shrink: 0;
}

.skeleton-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.skeleton-line {
  height: 10px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f0f0f5 25%, #e8e8f0 50%, #f0f0f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  width: 100%;
}

.skeleton-line--short {
  width: 40%;
}

.skeleton-line--medium {
  width: 65%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

/* Review item */
.review-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(171, 151, 255, 0.1);
  transition: border-color 0.2s ease;
}

.review-item:hover {
  border-color: rgba(171, 151, 255, 0.3);
}

.review-avatar-wrap {
  flex-shrink: 0;
}

.review-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.review-avatar--fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #b46cff, #8b5cf6);
  color: white;
  font-size: 15px;
  font-weight: 700;
}

.review-content {
  flex: 1;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.review-author {
  font-size: 13px;
  font-weight: 600;
  color: #2d2d3a;
}

.review-time {
  font-size: 11px;
  color: #a1a1b5;
}

.review-text {
  font-size: 12px;
  color: #5c5c6d;
  margin: 0 0 6px;
  line-height: 1.5;
}

.review-event {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #b46cff;
  font-weight: 500;
}

.review-event .mdi {
  font-size: 12px;
}

/* Smart Suggestions */
.smart-suggestions {
  grid-column: span 1;
  background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
  border-radius: 20px;
  border: 1px solid rgba(171, 151, 255, 0.15);
  padding: 20px;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(171, 151, 255, 0.1);
  transition: all 0.2s ease;
}

.suggestion-item:hover {
  border-color: rgba(171, 151, 255, 0.3);
  transform: translateX(4px);
}

.suggestion-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.suggestion--boost .suggestion-icon {
  background: linear-gradient(135deg, #ffe8ec 0%, #ffd1da 100%);
  color: #ff4f94;
}

.suggestion--earlybird .suggestion-icon {
  background: linear-gradient(135deg, #e8f8f3 0%, #d1f0e6 100%);
  color: #3eb489;
}

.suggestion--social .suggestion-icon {
  background: linear-gradient(135deg, #f3e8fd 0%, #e6d1fa 100%);
  color: #8b5cf6;
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-size: 14px;
  font-weight: 600;
  color: #2d2d3a;
  margin: 0 0 4px;
}

.suggestion-desc {
  font-size: 12px;
  color: #8b8b99;
  margin: 0;
  line-height: 1.4;
}

/* Responsive */
@media (max-width: 1400px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-overview {
    grid-column: span 2;
    grid-template-columns: repeat(4, 1fr);
  }

  .chart-card {
    grid-column: span 2;
  }
}

@media (max-width: 1024px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .carousel-card {
    flex: 0 0 360px;
    max-width: 360px;
    min-width: 360px;
  }
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .carousel-card {
    flex: 0 0 100%;
    max-width: 100%;
    min-width: 100%;
    height: auto;
  }

  .carousel-wrapper {
    min-height: auto;
  }

  .carousel-track-container {
    height: auto;
  }

  .event-image-container {
    height: 180px;
    min-height: 180px;
    max-height: 180px;
  }

  .stats-overview,
  .chart-card {
    grid-column: span 1;
  }

  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .countdown-section {
    flex-wrap: wrap;
  }

  .countdown-item {
    min-width: 60px;
  }

  .quick-actions {
    flex-direction: column;
  }

  .quick-action-btn {
    justify-content: center;
  }

  .financial-grid {
    grid-template-columns: 1fr;
  }
}
</style>
