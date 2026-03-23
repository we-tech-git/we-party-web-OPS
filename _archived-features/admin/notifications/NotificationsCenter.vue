<template>
  <div class="notifications-center">
    <header class="center-header">
      <div class="header-info">
        <h1 class="page-title">{{ t('admin.notifications.title') }}</h1>
        <p class="page-subtitle">{{ t('admin.notifications.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="mark-all-btn" type="button" @click="markAllAsRead">
          <span class="mdi mdi-check-all" />
          Marcar tudo como lido
        </button>
      </div>
    </header>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card" :style="{ '--accent': stat.color }">
        <div class="stat-icon">
          <span class="mdi" :class="stat.icon" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="content-grid">
      <!-- Notifications List -->
      <section class="notifications-list-section">
        <header class="section-header">
          <h2 class="section-title">Recentes</h2>
          <div class="filter-tabs">
            <button
              v-for="filter in filters"
              :key="filter.key"
              class="filter-tab"
              :class="{ 'filter-tab--active': activeFilter === filter.key }"
              type="button"
              @click="activeFilter = filter.key"
            >
              {{ filter.label }}
            </button>
          </div>
        </header>

        <div class="notifications-list">
          <TransitionGroup name="list">
            <div
              v-for="notification in filteredNotifications"
              :key="notification.id"
              class="notification-item"
              :class="{ 'notification-item--unread': !notification.read, 'notification-item--important': notification.important }"
              @click="markAsRead(notification.id)"
            >
              <div class="notification-indicator" />
              <div class="notification-icon" :style="{ background: notification.iconBg }">
                <span class="mdi" :class="notification.icon" />
              </div>
              <div class="notification-content">
                <p class="notification-text" v-html="notification.message" />
                <div class="notification-meta">
                  <span class="notification-time">
                    <span class="mdi mdi-clock-outline" />
                    {{ notification.time }}
                  </span>
                  <span class="notification-type">{{ notification.type }}</span>
                </div>
              </div>
              <div class="notification-actions">
                <button
                  v-if="notification.actionable"
                  class="action-btn action-btn--primary"
                  type="button"
                >
                  {{ notification.actionLabel }}
                </button>
                <button
                  class="action-btn action-btn--icon"
                  type="button"
                  @click.stop="dismissNotification(notification.id)"
                >
                  <span class="mdi mdi-close" />
                </button>
              </div>
            </div>
          </TransitionGroup>

          <div v-if="filteredNotifications.length === 0" class="empty-state">
            <span class="mdi mdi-bell-off-outline" />
            <p>Nenhuma notificação</p>
          </div>
        </div>
      </section>

      <!-- Right Panel -->
      <aside class="right-panel">
        <!-- Daily Metrics -->
        <section class="metrics-card">
          <header class="card-header">
            <h3>Métricas do Dia</h3>
            <span class="mdi mdi-chart-line" />
          </header>
          <div class="metrics-list">
            <div v-for="metric in dailyMetrics" :key="metric.label" class="metric-item">
              <div class="metric-info">
                <span class="metric-label">{{ metric.label }}</span>
                <span class="metric-value">{{ metric.value }}</span>
              </div>
              <div class="metric-bar">
                <div
                  class="metric-fill"
                  :style="{ width: `${metric.percent}%`, background: metric.color }"
                />
              </div>
              <span class="metric-change" :class="metric.change > 0 ? 'positive' : 'negative'">
                {{ metric.change > 0 ? '+' : '' }}{{ metric.change }}%
              </span>
            </div>
          </div>
        </section>

        <!-- Milestones -->
        <section class="milestones-card">
          <header class="card-header">
            <h3>Conquistas</h3>
            <span class="mdi mdi-trophy" />
          </header>
          <div class="milestones-list">
            <div
              v-for="milestone in milestones"
              :key="milestone.id"
              class="milestone-item"
              :class="{ 'milestone-item--achieved': milestone.achieved }"
            >
              <div
                class="milestone-icon"
                :style="{ background: milestone.achieved ? milestone.color : '#e5e7eb' }"
              >
                <span class="mdi" :class="milestone.icon" />
              </div>
              <div class="milestone-info">
                <span class="milestone-title">{{ milestone.title }}</span>
                <span class="milestone-description">{{ milestone.description }}</span>
              </div>
              <div v-if="milestone.achieved" class="milestone-badge">
                <span class="mdi mdi-check" />
              </div>
              <div v-else class="milestone-progress">
                <span>{{ milestone.progress }}%</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="quick-actions-card">
          <header class="card-header">
            <h3>Ações Rápidas</h3>
          </header>
          <div class="quick-actions-grid">
            <button v-for="action in quickActions" :key="action.label" class="quick-action" type="button">
              <span class="mdi" :class="action.icon" :style="{ color: action.color }" />
              <span>{{ action.label }}</span>
            </button>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const activeFilter = ref('all')

  const filters = [
    { key: 'all', label: 'Todas' },
    { key: 'unread', label: 'Não lidas' },
    { key: 'important', label: 'Importantes' },
  ]

  const stats = [
    { label: 'Não lidas', value: 12, icon: 'mdi-email-outline', color: '#8b5cf6' },
    { label: 'Hoje', value: 28, icon: 'mdi-calendar-today', color: '#3b82f6' },
    { label: 'Semana', value: 156, icon: 'mdi-calendar-week', color: '#10b981' },
    { label: 'Importantes', value: 5, icon: 'mdi-alert-circle', color: '#f59e0b' },
  ]

  const notifications = ref([
    {
      id: 1,
      icon: 'mdi-account-check',
      iconBg: 'linear-gradient(135deg, #10b981, #34d399)',
      message: '<strong>Ana Silva</strong> confirmou presença no seu evento',
      time: '2 min atrás',
      type: 'Confirmação',
      read: false,
      important: false,
      actionable: true,
      actionLabel: 'Ver perfil',
    },
    {
      id: 2,
      icon: 'mdi-star',
      iconBg: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
      message: 'Seu evento atingiu <strong>100 curtidas!</strong> 🎉',
      time: '15 min atrás',
      type: 'Conquista',
      read: false,
      important: true,
      actionable: false,
      actionLabel: '',
    },
    {
      id: 3,
      icon: 'mdi-comment',
      iconBg: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
      message: '<strong>Bruno Costa</strong> comentou: "Vai ser incrível!"',
      time: '1h atrás',
      type: 'Comentário',
      read: false,
      important: false,
      actionable: true,
      actionLabel: 'Responder',
    },
    {
      id: 4,
      icon: 'mdi-alert-circle',
      iconBg: 'linear-gradient(135deg, #ef4444, #f87171)',
      message: 'A enquete <strong>"Qual DJ vocês querem ver?"</strong> encerrou',
      time: '3h atrás',
      type: 'Sistema',
      read: true,
      important: true,
      actionable: true,
      actionLabel: 'Ver resultado',
    },
    {
      id: 5,
      icon: 'mdi-account-plus',
      iconBg: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
      message: '<strong>5 novas pessoas</strong> seguiram seu perfil',
      time: '5h atrás',
      type: 'Seguidores',
      read: true,
      important: false,
      actionable: false,
      actionLabel: '',
    },
    {
      id: 6,
      icon: 'mdi-share',
      iconBg: 'linear-gradient(135deg, #ec4899, #f472b6)',
      message: 'Seu evento foi <strong>compartilhado 25 vezes</strong> hoje',
      time: '6h atrás',
      type: 'Engajamento',
      read: true,
      important: false,
      actionable: true,
      actionLabel: 'Ver detalhes',
    },
  ])

  const dailyMetrics = [
    { label: 'Visualizações', value: '1.2k', percent: 75, color: '#8b5cf6', change: 12 },
    { label: 'Confirmações', value: '48', percent: 60, color: '#10b981', change: 8 },
    { label: 'Comentários', value: '23', percent: 45, color: '#3b82f6', change: -3 },
    { label: 'Compartilhamentos', value: '15', percent: 30, color: '#f59e0b', change: 25 },
  ]

  const milestones = [
    { id: 1, icon: 'mdi-fire', title: 'Evento em Alta', description: '500 visualizações', color: '#ef4444', achieved: true, progress: 100 },
    { id: 2, icon: 'mdi-heart', title: 'Popular', description: '100 curtidas', color: '#ec4899', achieved: true, progress: 100 },
    { id: 3, icon: 'mdi-account-group', title: 'Lotado', description: '200 confirmados', color: '#8b5cf6', achieved: false, progress: 65 },
    { id: 4, icon: 'mdi-star', title: 'Super Evento', description: '500 confirmados', color: '#f59e0b', achieved: false, progress: 26 },
  ]

  const quickActions = [
    { icon: 'mdi-bullhorn', label: 'Enviar Push', color: '#8b5cf6' },
    { icon: 'mdi-share-variant', label: 'Compartilhar', color: '#3b82f6' },
    { icon: 'mdi-pencil', label: 'Editar Evento', color: '#10b981' },
    { icon: 'mdi-chart-box', label: 'Ver Analytics', color: '#f59e0b' },
  ]

  const filteredNotifications = computed(() => {
    switch (activeFilter.value) {
      case 'unread': {
        return notifications.value.filter(n => !n.read)
      }
      case 'important': {
        return notifications.value.filter(n => n.important)
      }
      default: {
        return notifications.value
      }
    }
  })

  function markAsRead (id: number) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) notification.read = true
  }

  function markAllAsRead () {
    for (const notification of notifications.value) {
      notification.read = true
    }
  }

  function dismissNotification (id: number) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }
</script>

<style scoped>
.notifications-center {
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

.center-header {
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

.mark-all-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    color: #6b7280;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.mark-all-btn:hover {
    background: #f9fafb;
    border-color: #8b5cf6;
    color: #8b5cf6;
}

/* Stats */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: white;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    transition: all 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.stat-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, white));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
}

.stat-value {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: #2d2d3a;
}

.stat-label {
    display: block;
    font-size: 13px;
    color: #8b8b99;
}

/* Content Grid */
.content-grid {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 24px;
}

/* Notifications List */
.notifications-list-section {
    background: white;
    border-radius: 20px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    color: #2d2d3a;
    margin: 0;
}

.filter-tabs {
    display: flex;
    gap: 8px;
}

.filter-tab {
    padding: 8px 16px;
    background: none;
    border: none;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;
}

.filter-tab:hover {
    background: #f3f4f6;
}

.filter-tab--active {
    background: #8b5cf6;
    color: white;
}

.notifications-list {
    max-height: 600px;
    overflow-y: auto;
}

.notification-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 24px;
    border-bottom: 1px solid #f3f4f6;
    cursor: pointer;
    transition: background 0.2s;
    position: relative;
}

.notification-item:hover {
    background: #f9fafb;
}

.notification-item--unread {
    background: rgba(139, 92, 246, 0.03);
}

.notification-item--important {
    border-left: 3px solid #f59e0b;
}

.notification-indicator {
    position: absolute;
    left: 10px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #8b5cf6;
    opacity: 0;
}

.notification-item--unread .notification-indicator {
    opacity: 1;
}

.notification-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 22px;
    flex-shrink: 0;
}

.notification-content {
    flex: 1;
    min-width: 0;
}

.notification-text {
    font-size: 14px;
    color: #374151;
    margin: 0 0 6px;
    line-height: 1.4;
}

.notification-text :deep(strong) {
    font-weight: 600;
    color: #2d2d3a;
}

.notification-meta {
    display: flex;
    align-items: center;
    gap: 12px;
}

.notification-time {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #9ca3af;
}

.notification-type {
    font-size: 11px;
    padding: 2px 8px;
    background: #f3f4f6;
    border-radius: 10px;
    color: #6b7280;
}

.notification-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.action-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.action-btn--primary {
    background: linear-gradient(135deg, #8b5cf6, #a78bfa);
    color: white;
}

.action-btn--primary:hover {
    transform: scale(1.05);
}

.action-btn--icon {
    width: 32px;
    height: 32px;
    padding: 0;
    background: #f3f4f6;
    color: #9ca3af;
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-btn--icon:hover {
    background: #e5e7eb;
    color: #374151;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px;
    color: #9ca3af;
}

.empty-state .mdi {
    font-size: 48px;
    margin-bottom: 12px;
}

/* Right Panel */
.right-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.card-header h3 {
    font-size: 16px;
    font-weight: 600;
    color: #2d2d3a;
    margin: 0;
}

.card-header .mdi {
    color: #9ca3af;
}

/* Metrics Card */
.metrics-card {
    padding: 20px;
    background: white;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
}

.metrics-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.metric-item {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    align-items: center;
}

.metric-info {
    display: flex;
    justify-content: space-between;
    grid-column: 1 / -1;
}

.metric-label {
    font-size: 13px;
    color: #6b7280;
}

.metric-value {
    font-size: 14px;
    font-weight: 600;
    color: #2d2d3a;
}

.metric-bar {
    height: 6px;
    background: #f3f4f6;
    border-radius: 3px;
    overflow: hidden;
    flex: 1;
}

.metric-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s ease;
}

.metric-change {
    font-size: 12px;
    font-weight: 600;
    min-width: 45px;
    text-align: right;
}

.metric-change.positive {
    color: #10b981;
}

.metric-change.negative {
    color: #ef4444;
}

/* Milestones Card */
.milestones-card {
    padding: 20px;
    background: white;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
}

.milestones-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.milestone-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f9fafb;
    border-radius: 12px;
    opacity: 0.6;
    transition: all 0.3s ease;
}

.milestone-item--achieved {
    opacity: 1;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(245, 158, 11, 0.08));
}

.milestone-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
}

.milestone-info {
    flex: 1;
}

.milestone-title {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #2d2d3a;
}

.milestone-description {
    display: block;
    font-size: 12px;
    color: #9ca3af;
}

.milestone-badge {
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, #10b981, #34d399);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
}

.milestone-progress {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
}

/* Quick Actions Card */
.quick-actions-card {
    padding: 20px;
    background: white;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
}

.quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.quick-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: #f9fafb;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.quick-action:hover {
    background: #f3f4f6;
    transform: translateY(-2px);
}

.quick-action .mdi {
    font-size: 24px;
}

.quick-action span:last-child {
    font-size: 12px;
    font-weight: 600;
    color: #374151;
}

/* List Animation */
.list-enter-active,
.list-leave-active {
    transition: all 0.3s ease;
}

.list-enter-from {
    opacity: 0;
    transform: translateX(-20px);
}

.list-leave-to {
    opacity: 0;
    transform: translateX(20px);
}

@media (max-width: 1024px) {
    .content-grid {
        grid-template-columns: 1fr;
    }

    .right-panel {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
}
</style>
