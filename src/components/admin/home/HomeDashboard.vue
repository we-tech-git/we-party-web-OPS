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
      <button
        v-for="action in quickActions"
        :key="action.key"
        class="quick-action-btn"
        :class="`quick-action-btn--${action.color}`"
        type="button"
      >
        <span class="mdi" :class="action.icon" />
        <span>{{ t(`admin.home.${action.key}`) }}</span>
      </button>
    </div>

    <!-- Main Grid -->
    <div class="dashboard-grid">
      <!-- Next Event Card -->
      <article class="next-event-card">
        <div class="card-header">
          <h3 class="card-title">
            <span class="mdi mdi-calendar-star" />
            {{ t('admin.home.nextEvent') }}
          </h3>
          <div class="card-actions">
            <button class="icon-btn" type="button">
              <span class="mdi mdi-pencil" />
            </button>
            <button class="icon-btn" type="button">
              <span class="mdi mdi-share-variant" />
            </button>
          </div>
        </div>
        <div class="next-event-content">
          <img
            alt="Event"
            class="event-image"
            src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400"
          >
          <div class="event-details">
            <h4 class="event-name">{{ nextEvent.name }}</h4>
            <p class="event-date">
              <span class="mdi mdi-calendar" />
              {{ nextEvent.date }}
            </p>
            <p class="event-location">
              <span class="mdi mdi-map-marker" />
              {{ nextEvent.location }}
            </p>
          </div>
        </div>
        <div class="countdown-section">
          <div class="countdown-item">
            <span class="countdown-value">{{ countdown.days }}</span>
            <span class="countdown-label">{{ t('admin.home.days') }}</span>
          </div>
          <div class="countdown-item">
            <span class="countdown-value">{{ countdown.hours }}</span>
            <span class="countdown-label">{{ t('admin.home.hours') }}</span>
          </div>
          <div class="countdown-item">
            <span class="countdown-value">{{ countdown.minutes }}</span>
            <span class="countdown-label">{{ t('admin.home.minutes') }}</span>
          </div>
          <div class="countdown-item">
            <span class="countdown-value">{{ countdown.seconds }}</span>
            <span class="countdown-label">{{ t('admin.home.seconds') }}</span>
          </div>
        </div>
        <div class="event-progress">
          <div class="progress-info">
            <span>{{ t('admin.home.ticketsSold') }}</span>
            <span class="progress-value">{{ nextEvent.ticketsSold }}/{{ nextEvent.totalTickets }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: ticketProgress + '%' }" />
          </div>
        </div>
      </article>

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

      <!-- Sales Chart -->
      <div class="chart-card">
        <div class="card-header">
          <h3 class="card-title">
            <span class="mdi mdi-chart-line" />
            {{ t('admin.home.salesChart') }}
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
              <span class="chart-stat-value">R$ {{ formatNumber(totalRevenue) }}</span>
              <span class="chart-stat-label">{{ t('admin.home.totalRevenue') }}</span>
            </div>
            <div class="chart-stat">
              <span class="chart-stat-value">{{ formatNumber(totalTicketsSold) }}</span>
              <span class="chart-stat-label">{{ t('admin.home.ticketsSoldLabel') }}</span>
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
                  id="salesGradient"
                  x1="0%"
                  x2="0%"
                  y1="0%"
                  y2="100%"
                >
                  <stop offset="0%" style="stop-color:#b46cff;stop-opacity:0.4" />
                  <stop offset="100%" style="stop-color:#b46cff;stop-opacity:0.05" />
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

      <!-- Activity Feed -->
      <div class="activity-feed">
        <div class="card-header">
          <h3 class="card-title">
            <span class="mdi mdi-lightning-bolt" />
            {{ t('admin.home.recentActivity') }}
          </h3>
          <button class="see-all-btn" type="button">{{ t('admin.home.seeAll') }}</button>
        </div>
        <div class="activity-list">
          <div
            v-for="(activity, index) in recentActivities"
            :key="index"
            class="activity-item"
          >
            <div class="activity-icon" :class="`activity-icon--${activity.type}`">
              <span class="mdi" :class="activity.icon" />
            </div>
            <div class="activity-content">
              <p class="activity-text">{{ activity.text }}</p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending Tasks -->
      <div class="pending-tasks">
        <div class="card-header">
          <h3 class="card-title">
            <span class="mdi mdi-checkbox-marked-circle-outline" />
            {{ t('admin.home.pendingTasks') }}
          </h3>
          <span class="tasks-count">{{ pendingTasksCount }}/{{ tasks.length }}</span>
        </div>
        <div class="tasks-list">
          <label
            v-for="task in tasks"
            :key="task.id"
            class="task-item"
            :class="{ completed: task.completed }"
          >
            <input v-model="task.completed" type="checkbox">
            <span class="task-checkbox">
              <span class="mdi mdi-check" />
            </span>
            <span class="task-text">{{ task.text }}</span>
            <span v-if="task.priority" class="task-priority" :class="`priority-${task.priority}`">
              {{ task.priority }}
            </span>
          </label>
        </div>
        <button class="add-task-btn" type="button">
          <span class="mdi mdi-plus" />
          {{ t('admin.home.addTask') }}
        </button>
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
          <div
            v-for="event in upcomingEvents"
            :key="event.id"
            class="timeline-event"
          >
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

      <!-- Recent Reviews -->
      <div class="recent-reviews">
        <div class="card-header">
          <h3 class="card-title">
            <span class="mdi mdi-star" />
            {{ t('admin.home.recentReviews') }}
          </h3>
          <div class="average-rating">
            <span class="rating-value">{{ averageRating }}</span>
            <div class="rating-stars">
              <span
                v-for="star in 5"
                :key="star"
                class="mdi"
                :class="star <= Math.round(averageRating) ? 'mdi-star' : 'mdi-star-outline'"
              />
            </div>
          </div>
        </div>
        <div class="reviews-list">
          <div
            v-for="review in recentReviews"
            :key="review.id"
            class="review-item"
          >
            <img :alt="review.author" class="review-avatar" :src="review.avatar">
            <div class="review-content">
              <div class="review-header">
                <span class="review-author">{{ review.author }}</span>
                <div class="review-rating">
                  <span
                    v-for="star in 5"
                    :key="star"
                    class="mdi"
                    :class="star <= review.rating ? 'mdi-star' : 'mdi-star-outline'"
                  />
                </div>
              </div>
              <p class="review-text">{{ review.text }}</p>
              <span class="review-event">{{ review.event }}</span>
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

      <!-- Financial Summary -->
      <div class="financial-summary">
        <div class="card-header">
          <h3 class="card-title">
            <span class="mdi mdi-wallet" />
            {{ t('admin.home.financialSummary') }}
          </h3>
          <span class="period-badge">{{ t('admin.home.thisMonth') }}</span>
        </div>
        <div class="financial-grid">
          <div class="financial-item revenue">
            <span class="financial-label">{{ t('admin.home.monthlyRevenue') }}</span>
            <span class="financial-value">R$ {{ formatNumber(financials.revenue) }}</span>
          </div>
          <div class="financial-item expenses">
            <span class="financial-label">{{ t('admin.home.expenses') }}</span>
            <span class="financial-value">R$ {{ formatNumber(financials.expenses) }}</span>
          </div>
          <div class="financial-item profit">
            <span class="financial-label">{{ t('admin.home.netProfit') }}</span>
            <span class="financial-value">R$ {{ formatNumber(financials.profit) }}</span>
          </div>
        </div>
        <div class="profit-bar">
          <div class="profit-segment revenue" :style="{ width: revenuePercent + '%' }">
            <span>{{ t('admin.home.revenue') }}</span>
          </div>
          <div class="profit-segment expenses" :style="{ width: expensesPercent + '%' }">
            <span>{{ t('admin.home.expenses') }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t, locale } = useI18n()

  // Producer info
  const producerName = ref('João')

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
    { key: 'createEvent', icon: 'mdi-plus-circle', color: 'primary' },
    { key: 'marketing', icon: 'mdi-bullhorn', color: 'orange' },
    { key: 'finances', icon: 'mdi-cash-multiple', color: 'green' },
    { key: 'reports', icon: 'mdi-file-chart', color: 'purple' },
  ]

  // Next Event
  const nextEvent = ref({
    name: 'Sunset Beach Party',
    date: '25 de Janeiro, 2025 • 18:00',
    location: 'Praia de Copacabana, Rio de Janeiro',
    ticketsSold: 347,
    totalTickets: 500,
    targetDate: new Date('2025-01-25T18:00:00'),
  })

  const ticketProgress = computed(() => {
    return Math.round((nextEvent.value.ticketsSold / nextEvent.value.totalTickets) * 100)
  })

  // Countdown
  const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  let countdownInterval: ReturnType<typeof setInterval> | null = null

  function updateCountdown () {
    const now = Date.now()
    const target = nextEvent.value.targetDate.getTime()
    const diff = target - now

    if (diff > 0) {
      countdown.value = {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      }
    }
  }

  // Overview Stats
  const overviewStats = ref([
    { key: 'views', icon: 'mdi-eye', value: 45_892, trend: 12.5 },
    { key: 'ticketsSoldLabel', icon: 'mdi-ticket', value: 1247, trend: 8.3 },
    { key: 'followers', icon: 'mdi-account-group', value: 12_458, trend: 15.2 },
    { key: 'revenueLabel', icon: 'mdi-cash', value: 89_450, trend: -2.1 },
  ])

  // Chart data
  const selectedPeriod = ref('7D')
  const periods = ['7D', '30D', '90D', '1A']
  const growthPercent = ref(23.5)
  const totalRevenue = ref(89_450)
  const totalTicketsSold = ref(1247)

  const chartData = ref([
    { date: 'Seg', value: 12_500 },
    { date: 'Ter', value: 18_200 },
    { date: 'Qua', value: 15_800 },
    { date: 'Qui', value: 22_100 },
    { date: 'Sex', value: 28_900 },
    { date: 'Sáb', value: 35_200 },
    { date: 'Dom', value: 24_800 },
  ])

  const chartPoints = computed(() => {
    const width = 400
    const height = 150
    const padding = 20
    const maxValue = Math.max(...chartData.value.map(d => d.value))

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

  // Recent Activities
  const recentActivities = ref([
    { type: 'sale', icon: 'mdi-ticket-confirmation', text: 'Maria Silva comprou 2 ingressos VIP', time: 'Há 5 min' },
    { type: 'follow', icon: 'mdi-account-plus', text: 'Pedro Santos começou a seguir você', time: 'Há 12 min' },
    { type: 'comment', icon: 'mdi-comment', text: 'Novo comentário em "Sunset Beach Party"', time: 'Há 25 min' },
    { type: 'sale', icon: 'mdi-ticket-confirmation', text: 'João Oliveira comprou 1 ingresso Pista', time: 'Há 1 hora' },
    { type: 'review', icon: 'mdi-star', text: 'Nova avaliação 5 estrelas recebida', time: 'Há 2 horas' },
  ])

  // Tasks
  const tasks = ref([
    { id: 1, text: 'Confirmar DJ para o evento', completed: true, priority: 'alta' },
    { id: 2, text: 'Enviar e-mail marketing', completed: false, priority: 'alta' },
    { id: 3, text: 'Revisar contrato do local', completed: false, priority: 'média' },
    { id: 4, text: 'Postar no Instagram', completed: true, priority: null },
    { id: 5, text: 'Verificar estoque de bebidas', completed: false, priority: 'baixa' },
  ])

  const pendingTasksCount = computed(() => tasks.value.filter(t => t.completed).length)

  // Upcoming Events
  const upcomingEvents = ref([
    { id: 1, name: 'Sunset Beach Party', day: '25', month: 'Jan', venue: 'Copacabana', ticketsSold: 347, totalTickets: 500, revenue: 52_450, status: 'ativo' },
    { id: 2, name: 'Neon Night', day: '02', month: 'Fev', venue: 'Club XYZ', ticketsSold: 120, totalTickets: 300, revenue: 18_000, status: 'rascunho' },
    { id: 3, name: 'Carnival Pre-Party', day: '15', month: 'Fev', venue: 'Arena Central', ticketsSold: 0, totalTickets: 1000, revenue: 0, status: 'agendado' },
  ])

  // Reviews
  const averageRating = ref(4.7)
  const recentReviews = ref([
    { id: 1, author: 'Ana Carolina', avatar: 'https://i.pravatar.cc/100?img=1', rating: 5, text: 'Melhor festa que já fui! Organização impecável.', event: 'Summer Vibes' },
    { id: 2, author: 'Lucas Mendes', avatar: 'https://i.pravatar.cc/100?img=2', rating: 4, text: 'Ótima música e ambiente. Só faltou mais bar.', event: 'Summer Vibes' },
    { id: 3, author: 'Juliana Costa', avatar: 'https://i.pravatar.cc/100?img=3', rating: 5, text: 'Lineup incrível, voltarei com certeza!', event: 'Electro Night' },
  ])

  // Suggestions
  const suggestions = ref([
    { id: 1, type: 'boost', icon: 'mdi-rocket-launch', titleKey: 'suggestionBoost', descKey: 'suggestionBoostDesc' },
    { id: 2, type: 'earlybird', icon: 'mdi-tag-multiple', titleKey: 'suggestionEarlyBird', descKey: 'suggestionEarlyBirdDesc' },
    { id: 3, type: 'social', icon: 'mdi-instagram', titleKey: 'suggestionSocial', descKey: 'suggestionSocialDesc' },
  ])

  // Financials
  const financials = ref({
    revenue: 89_450,
    expenses: 32_180,
    profit: 57_270,
  })

  const revenuePercent = computed(() => {
    const total = financials.value.revenue
    return Math.round((financials.value.profit / total) * 100)
  })

  const expensesPercent = computed(() => {
    return 100 - revenuePercent.value
  })

  function formatNumber (num: number): string {
    return num.toLocaleString('pt-BR')
  }

  onMounted(() => {
    updateCountdown()
    countdownInterval = setInterval(updateCountdown, 1000)
  })

  onUnmounted(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval)
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
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
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

/* Next Event Card */
.next-event-card {
  grid-column: span 1;
  background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
  border-radius: 20px;
  border: 1px solid rgba(171, 151, 255, 0.15);
  padding: 20px;
}

.next-event-content {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.event-image {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  object-fit: cover;
}

.event-details {
  flex: 1;
}

.event-name {
  font-size: 18px;
  font-weight: 700;
  color: #2d2d3a;
  margin: 0 0 8px;
}

.event-date,
.event-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #8b8b99;
  margin: 4px 0;
}

.event-date .mdi,
.event-location .mdi {
  color: #b46cff;
}

/* Countdown */
.countdown-section {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.countdown-item {
  flex: 1;
  text-align: center;
  padding: 12px 8px;
  background: linear-gradient(135deg, #b46cff 0%, #8b5cf6 100%);
  border-radius: 12px;
}

.countdown-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.countdown-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
}

/* Progress */
.event-progress {
  margin-top: 12px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #5c5c6d;
  margin-bottom: 8px;
}

.progress-value {
  font-weight: 600;
  color: #2d2d3a;
}

.progress-bar {
  height: 8px;
  background: #e8e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #b46cff 0%, #ff4f94 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

/* Stats Overview */
.stats-overview {
  grid-column: span 2;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
  fill: url(#salesGradient);
}

.chart-line {
  fill: none;
  stroke: #b46cff;
  stroke-width: 3;
  stroke-linecap: round;
}

.chart-point {
  fill: #b46cff;
  stroke: white;
  stroke-width: 2;
}

/* Activity Feed */
.activity-feed {
  grid-column: span 1;
  background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
  border-radius: 20px;
  border: 1px solid rgba(171, 151, 255, 0.15);
  padding: 20px;
}

.see-all-btn {
  background: transparent;
  border: none;
  color: #b46cff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 280px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(171, 151, 255, 0.1);
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.activity-icon--sale {
  background: linear-gradient(135deg, #e8f8f3 0%, #d1f0e6 100%);
  color: #3eb489;
}

.activity-icon--follow {
  background: linear-gradient(135deg, #e8f4fd 0%, #d1e9fa 100%);
  color: #3b82f6;
}

.activity-icon--comment {
  background: linear-gradient(135deg, #f3e8fd 0%, #e6d1fa 100%);
  color: #8b5cf6;
}

.activity-icon--review {
  background: linear-gradient(135deg, #fef3e2 0%, #fde6c4 100%);
  color: #f59e0b;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 13px;
  color: #2d2d3a;
  margin: 0 0 4px;
}

.activity-time {
  font-size: 11px;
  color: #a1a1b5;
}

/* Pending Tasks */
.pending-tasks {
  grid-column: span 1;
  background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
  border-radius: 20px;
  border: 1px solid rgba(171, 151, 255, 0.15);
  padding: 20px;
}

.tasks-count {
  font-size: 13px;
  color: #8b8b99;
  font-weight: 600;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 10px;
  border: 1px solid rgba(171, 151, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-item:hover {
  border-color: rgba(171, 151, 255, 0.3);
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.completed .task-text {
  text-decoration: line-through;
}

.task-item input[type="checkbox"] {
  display: none;
}

.task-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  transition: all 0.2s ease;
}

.task-item.completed .task-checkbox {
  background: #3eb489;
  border-color: #3eb489;
}

.task-checkbox .mdi {
  opacity: 0;
}

.task-item.completed .task-checkbox .mdi {
  opacity: 1;
}

.task-text {
  flex: 1;
  font-size: 13px;
  color: #2d2d3a;
}

.task-priority {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-alta {
  background: #ffe8ec;
  color: #ff4f94;
}

.priority-média {
  background: #fef3e2;
  color: #f59e0b;
}

.priority-baixa {
  background: #e8f8f3;
  color: #3eb489;
}

.add-task-btn {
  width: 100%;
  padding: 10px;
  border: 2px dashed rgba(171, 151, 255, 0.3);
  border-radius: 10px;
  background: transparent;
  color: #b46cff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.add-task-btn:hover {
  background: rgba(180, 108, 255, 0.05);
  border-color: #b46cff;
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

.average-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-value {
  font-size: 18px;
  font-weight: 700;
  color: #f59e0b;
}

.rating-stars {
  display: flex;
  gap: 2px;
  color: #f59e0b;
  font-size: 14px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(171, 151, 255, 0.1);
}

.review-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
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

.review-rating {
  display: flex;
  gap: 1px;
  color: #f59e0b;
  font-size: 12px;
}

.review-text {
  font-size: 12px;
  color: #5c5c6d;
  margin: 0 0 4px;
  line-height: 1.4;
}

.review-event {
  font-size: 11px;
  color: #a1a1b5;
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

/* Financial Summary */
.financial-summary {
  grid-column: span 1;
  background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
  border-radius: 20px;
  border: 1px solid rgba(171, 151, 255, 0.15);
  padding: 20px;
}

.period-badge {
  padding: 4px 10px;
  background: rgba(180, 108, 255, 0.1);
  color: #b46cff;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.financial-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.financial-item {
  text-align: center;
  padding: 16px 12px;
  border-radius: 12px;
}

.financial-item.revenue {
  background: linear-gradient(135deg, #e8f8f3 0%, #d1f0e6 100%);
}

.financial-item.expenses {
  background: linear-gradient(135deg, #ffe8ec 0%, #ffd1da 100%);
}

.financial-item.profit {
  background: linear-gradient(135deg, #e8f4fd 0%, #d1e9fa 100%);
}

.financial-label {
  display: block;
  font-size: 11px;
  color: #8b8b99;
  margin-bottom: 4px;
}

.financial-value {
  font-size: 16px;
  font-weight: 700;
  color: #2d2d3a;
}

.profit-bar {
  display: flex;
  height: 32px;
  border-radius: 8px;
  overflow: hidden;
}

.profit-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: white;
  transition: width 0.5s ease;
}

.profit-segment.revenue {
  background: linear-gradient(90deg, #3eb489 0%, #5dc7a9 100%);
}

.profit-segment.expenses {
  background: linear-gradient(90deg, #ff6b9d 0%, #ff4f94 100%);
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
