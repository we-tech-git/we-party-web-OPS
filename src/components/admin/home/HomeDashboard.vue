<template>
  <section class="home-dashboard">
    <!-- Welcome Header -->
    <header class="welcome-header">
      <div class="welcome-text">
        <h1 class="welcome-title">
          {{ t('admin.home.welcome') }}, <span class="producer-name">{{ producerName }}</span>! 👋
        </h1>
        <p class="welcome-subtitle">{{ t('admin.home.welcomeSubtitle') }}</p>
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
            <div class="carousel-track" :style="{ transform: `translateX(calc(-${carouselIndex} * (520px + 16px)))` }">
              <div
                v-for="(event, i) in activeEvents"
                :key="event.id"
                class="carousel-card"
                :class="{ 'carousel-card--active': i === carouselIndex }"
              >
                <!-- Badge status no topo do card -->
                <div class="carousel-card-top">
                  <span class="carousel-status" :class="`status-${event.status}`">{{ event.status }}</span>
                </div>

                <!-- Layout horizontal: imagem + conteúdo -->
                <div class="carousel-card-inner">
                  <div class="carousel-card-img">
                    <img
                      :alt="event.name"
                      :src="event.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400'"
                    >
                  </div>

                  <div class="carousel-card-body">
                    <div class="carousel-card-header">
                      <h3 class="carousel-event-name">{{ event.name }}</h3>
                      <button class="archive-btn" title="Arquivar evento" @click="archiveEvent(event)">
                        <svg
                          class="archive-icon"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m4 0H9" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                        </svg>
                      </button>
                    </div>

                    <div class="carousel-event-details">
                      <div class="carousel-event-date">
                        <span class="mdi mdi-calendar-outline" />
                        {{ event.date }}
                      </div>
                      <div class="carousel-event-location">
                        <span class="mdi mdi-map-marker-outline" />
                        {{ event.location }}
                      </div>
                    </div>

                    <div class="carousel-event-stats">
                      <div class="event-stat event-stat--likes">
                        <span class="mdi mdi-heart" />
                        <span>{{ formatNumber(event.likes) }}</span>
                      </div>
                      <div v-if="event.interests && event.interests.length > 0" class="event-stat event-stat--category">
                        <span class="mdi mdi-tag-outline" />
                        <span>{{ event.interests.slice(0, 1).join(', ') }}</span>
                      </div>
                      <div v-else class="event-stat event-stat--category">
                        <span class="mdi mdi-tag-outline" />
                        <span>Sem categoria</span>
                      </div>
                    </div>

                    <div class="carousel-countdown">
                      <div class="carousel-countdown-item">
                        <div class="cc-value">{{ event.countdown.days }}</div>
                        <div class="cc-label">{{ t('admin.home.days') }}</div>
                      </div>
                      <div class="carousel-countdown-item">
                        <div class="cc-value">{{ event.countdown.hours }}</div>
                        <div class="cc-label">{{ t('admin.home.hours') }}</div>
                      </div>
                      <div class="carousel-countdown-item">
                        <div class="cc-value">{{ event.countdown.minutes }}</div>
                        <div class="cc-label">{{ t('admin.home.minutes') }}</div>
                      </div>
                      <div class="carousel-countdown-item">
                        <div class="cc-value">{{ event.countdown.seconds }}</div>
                        <div class="cc-label">{{ t('admin.home.seconds') }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
            <div class="chart-stat positive">
              <span class="chart-stat-value">+{{ growthPercent }}%</span>
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
            <button class="suggestion-action" type="button">
              <span class="mdi mdi-arrow-right" />
            </button>
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
  const { loadUser, getFirstName } = useCurrentUser()

  // Loading state
  const isLoadingEvents = ref(false)

  // Producer info
  const producerName = computed(() => getFirstName())

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
    { key: 'likesLabel', icon: 'mdi-heart', value: totalLikes.value, trend: 8.3 },
  ])

  // Chart data
  const selectedPeriod = ref('7D')
  const periods = ['7D', '30D', '90D', '1A']
  const growthPercent = ref(23.5)

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
    const width = 400
    const height = 150
    const padding = 20
    const rawMax = Math.max(...chartData.value.map(d => d.value))
    const maxValue = rawMax === 0 ? 1 : rawMax

    return chartData.value.map((d, i) => ({
      x: padding + (i / (chartData.value.length - 1)) * (width - 2 * padding),
      y: height - padding - (d.value / maxValue) * (height - 2 * padding),
      ...d,
    }))
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

      // Normaliza eventos e busca likes para cada um
      const eventsWithLikes = await Promise.allSettled(
        list.map(async (ev: any) => {
          const normalizedEvent = normalizeEvent(ev)
          try {
            const likesRes = await getEventLikes(normalizedEvent.id) as any
            normalizedEvent.likes = likesRes?.count ?? likesRes?.data?.count ?? normalizedEvent.likes
          } catch (error) {
            console.warn(`[HomeDashboard] Erro ao buscar likes do evento ${normalizedEvent.id}:`, error)
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
    loadUser()
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
  background: linear-gradient(135deg, #8b7cf7 0%, #6b5ce7 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(107, 92, 231, 0.3);
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
  gap: 8px;
}

.carousel-track-container {
  flex: 1;
  overflow: hidden;
  padding: 4px 0;
}

.carousel-track {
  display: flex;
  gap: 16px;
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
}

.carousel-card {
  flex: 0 0 520px;
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(229, 231, 235, 0.6);
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.07);
}

.carousel-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.carousel-card--active {
  border-color: rgba(180, 108, 255, 0.4);
  box-shadow: 0 8px 24px rgba(180, 108, 255, 0.18);
}

/* Badge de status no topo */
.carousel-card-top {
  display: flex;
  justify-content: flex-end;
  padding: 10px 12px 0;
}

.carousel-status {
  background: #7c3aed;
  color: white;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.status-PUBLISHED, .status-published {
  background: #7c3aed;
}

.status-DRAFT, .status-draft, .status-rascunho {
  background: #9ca3af;
}

.status-ACTIVE, .status-active, .status-ativo {
  background: #10b981;
}

/* Layout horizontal */
.carousel-card-inner {
  display: flex;
  gap: 0;
  padding: 12px;
  gap: 14px;
}

.carousel-card-img {
  flex: 0 0 150px;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
}

.carousel-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.carousel-card:hover .carousel-card-img img {
  transform: scale(1.04);
}

.carousel-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.carousel-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.carousel-event-name {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  flex: 1;
}

.archive-btn {
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.archive-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.archive-icon {
  width: 16px;
  height: 16px;
}

.carousel-event-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.carousel-event-date,
.carousel-event-location {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #6b7280;
}

.carousel-event-date .mdi,
.carousel-event-location .mdi {
  color: #b46cff;
  font-size: 13px;
  flex-shrink: 0;
}

.carousel-event-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.event-stat {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.event-stat--likes {
  background: #fdf2f8;
  color: #ec4899;
}

.event-stat--likes .mdi {
  color: #ec4899;
  font-size: 13px;
}

.event-stat--category {
  background: #f3f4f6;
  color: #7c3aed;
}

.event-stat--category .mdi {
  color: #b46cff;
  font-size: 13px;
}

.carousel-countdown {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-top: auto;
}

.carousel-countdown-item {
  text-align: center;
  padding: 6px 4px;
  background: #7c3aed;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(124, 58, 237, 0.25);
  border-bottom: 3px solid #5b21b6;
}

.cc-value {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: white;
  line-height: 1;
  margin-bottom: 2px;
}

.cc-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  font-weight: 300;
  letter-spacing: 0.5px;
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
  gap: 6px;
  margin-top: 12px;
}

.carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e0e0f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.carousel-dot--active {
  background: #b46cff;
  width: 20px;
  border-radius: 4px;
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

.suggestion-action {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #b46cff 0%, #8b5cf6 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  transition: all 0.2s ease;
}

.suggestion-action:hover {
  transform: scale(1.1);
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
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
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
