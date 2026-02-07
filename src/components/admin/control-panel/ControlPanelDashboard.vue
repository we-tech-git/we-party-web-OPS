<template>
  <div class="control-panel">
    <!-- Header -->
    <header class="page-header">
      <div class="header-info">
        <h1 class="page-title">{{ t('admin.controlPanel.title') }}</h1>
        <p class="page-subtitle">{{ t('admin.controlPanel.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="refresh-btn" type="button" @click="refreshData">
          <span class="mdi mdi-refresh" :class="{ 'spinning': isRefreshing }" />
          {{ t('admin.controlPanel.refresh') }}
        </button>
      </div>
    </header>

    <!-- Main Tabs -->
    <div class="main-tabs">
      <button
        class="main-tab"
        :class="{ 'main-tab--active': activeMainTab === 'overview' }"
        type="button"
        @click="activeMainTab = 'overview'"
      >
        <span class="mdi mdi-view-dashboard" />
        {{ t('admin.controlPanel.overviewTab') }}
      </button>
      <button
        class="main-tab"
        :class="{ 'main-tab--active': activeMainTab === 'interests' }"
        type="button"
        @click="activeMainTab = 'interests'"
      >
        <span class="mdi mdi-tag-multiple" />
        {{ t('admin.controlPanel.interestsTab') }}
      </button>
      <button
        class="main-tab"
        :class="{ 'main-tab--active': activeMainTab === 'users' }"
        type="button"
        @click="activeMainTab = 'users'"
      >
        <span class="mdi mdi-account-group" />
        {{ t('admin.controlPanel.usersTab') }}
      </button>
      <button
        class="main-tab"
        :class="{ 'main-tab--active': activeMainTab === 'feedbacks' }"
        type="button"
        @click="activeMainTab = 'feedbacks'"
      >
        <span class="mdi mdi-message-text" />
        {{ t('admin.controlPanel.feedbacksTab') }}
      </button>
    </div>

    <!-- Overview Tab Content -->
    <template v-if="activeMainTab === 'overview'">
      <!-- Quick Stats -->
      <div class="quick-stats">
        <div class="stat-card stat-card--primary">
          <div class="stat-content">
            <span class="stat-value">{{ formatNumber(quickStats.activeUsers) }}</span>
            <span class="stat-label">{{ t('admin.controlPanel.activeUsers') }}</span>
          </div>
          <div class="stat-trend stat-trend--up">
            <span class="mdi mdi-trending-up" />
            +12%
          </div>
        </div>
        <div class="stat-card stat-card--success">
          <div class="stat-content">
            <span class="stat-value">{{ formatNumber(quickStats.totalEvents) }}</span>
            <span class="stat-label">{{ t('admin.controlPanel.totalEvents') }}</span>
          </div>
          <div class="stat-trend stat-trend--up">
            <span class="mdi mdi-trending-up" />
            +8%
          </div>
        </div>
        <div class="stat-card stat-card--warning">
          <div class="stat-content">
            <span class="stat-value">{{ quickStats.pendingActions }}</span>
            <span class="stat-label">{{ t('admin.controlPanel.pendingActions') }}</span>
          </div>
          <div class="stat-icon-bg">
            <span class="mdi mdi-alert-circle" />
          </div>
        </div>
        <div class="stat-card stat-card--info">
          <div class="stat-content">
            <span class="stat-value">R$ {{ formatNumber(quickStats.revenue) }}</span>
            <span class="stat-label">{{ t('admin.controlPanel.revenue') }}</span>
          </div>
          <div class="stat-trend stat-trend--up">
            <span class="mdi mdi-trending-up" />
            +24%
          </div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="main-grid">
        <!-- Pending Actions -->
        <section class="panel-section pending-section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="mdi mdi-clock-alert" />
              {{ t('admin.controlPanel.pendingActionsTitle') }}
            </h2>
            <span class="badge badge--warning">{{ pendingActions.length }}</span>
          </div>
          <div class="pending-list">
            <div v-for="action in pendingActions" :key="action.id" class="pending-item">
              <div class="pending-icon" :class="`pending-icon--${action.type}`">
                <span class="mdi" :class="getActionIcon(action.type)" />
              </div>
              <div class="pending-info">
                <span class="pending-title">{{ action.title }}</span>
                <span class="pending-description">{{ action.description }}</span>
              </div>
              <div class="pending-actions">
                <button
                  class="pending-btn pending-btn--approve"
                  type="button"
                  @click="approveAction(action)"
                >
                  <span class="mdi mdi-check" />
                </button>
                <button
                  class="pending-btn pending-btn--reject"
                  type="button"
                  @click="rejectAction(action)"
                >
                  <span class="mdi mdi-close" />
                </button>
              </div>
            </div>
            <div v-if="pendingActions.length === 0" class="pending-empty">
              <span class="mdi mdi-check-circle" />
              <span>{{ t('admin.controlPanel.noPendingActions') }}</span>
            </div>
          </div>
        </section>

        <!-- Recent Activity -->
        <section class="panel-section activity-section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="mdi mdi-history" />
              {{ t('admin.controlPanel.recentActivity') }}
            </h2>
            <button class="see-all-btn" type="button">{{ t('admin.controlPanel.seeAll') }}</button>
          </div>
          <div class="activity-list">
            <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
              <div class="activity-icon" :class="`activity-icon--${activity.type}`">
                <span class="mdi" :class="getActivityIcon(activity.type)" />
              </div>
              <div class="activity-info">
                <span class="activity-text">
                  <strong>{{ activity.user }}</strong> {{ activity.action }}
                </span>
                <span class="activity-time">{{ activity.time }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Quick Settings -->
        <section class="panel-section settings-section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="mdi mdi-cog" />
              {{ t('admin.controlPanel.quickSettings') }}
            </h2>
          </div>
          <div class="settings-list">
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-name">{{ t('admin.controlPanel.allowRegistrations') }}</span>
                <span class="setting-desc">{{ t('admin.controlPanel.allowRegistrationsDesc') }}</span>
              </div>
              <label class="toggle">
                <input v-model="settings.allowRegistrations" type="checkbox">
                <span class="toggle-slider" />
              </label>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-name">{{ t('admin.controlPanel.maintenanceMode') }}</span>
                <span class="setting-desc">{{ t('admin.controlPanel.maintenanceModeDesc') }}</span>
              </div>
              <label class="toggle">
                <input v-model="settings.maintenanceMode" type="checkbox">
                <span class="toggle-slider" />
              </label>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-name">{{ t('admin.controlPanel.autoApproveEvents') }}</span>
                <span class="setting-desc">{{ t('admin.controlPanel.autoApproveEventsDesc') }}</span>
              </div>
              <label class="toggle">
                <input v-model="settings.autoApproveEvents" type="checkbox">
                <span class="toggle-slider" />
              </label>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-name">{{ t('admin.controlPanel.emailNotifications') }}</span>
                <span class="setting-desc">{{ t('admin.controlPanel.emailNotificationsDesc') }}</span>
              </div>
              <label class="toggle">
                <input v-model="settings.emailNotifications" type="checkbox">
                <span class="toggle-slider" />
              </label>
            </div>
          </div>
        </section>

        <!-- System Health -->
        <section class="panel-section health-section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="mdi mdi-heart-pulse" />
              {{ t('admin.controlPanel.systemHealth') }}
            </h2>
          </div>
          <div class="health-grid">
            <div class="health-item">
              <div class="health-header">
                <span class="health-name">{{ t('admin.controlPanel.serverStatus') }}</span>
                <span class="health-status health-status--online">
                  <span class="status-dot" />
                  Online
                </span>
              </div>
              <div class="health-bar">
                <div class="health-fill" :style="{ width: '98%' }" />
              </div>
              <span class="health-value">98% uptime</span>
            </div>
            <div class="health-item">
              <div class="health-header">
                <span class="health-name">{{ t('admin.controlPanel.databaseStatus') }}</span>
                <span class="health-status health-status--online">
                  <span class="status-dot" />
                  Online
                </span>
              </div>
              <div class="health-bar">
                <div class="health-fill" :style="{ width: '75%' }" />
              </div>
              <span class="health-value">75% storage</span>
            </div>
            <div class="health-item">
              <div class="health-header">
                <span class="health-name">{{ t('admin.controlPanel.apiStatus') }}</span>
                <span class="health-status health-status--online">
                  <span class="status-dot" />
                  Online
                </span>
              </div>
              <div class="health-bar">
                <div class="health-fill health-fill--warning" :style="{ width: '45%' }" />
              </div>
              <span class="health-value">45ms response</span>
            </div>
          </div>
        </section>

        <!-- Quick Links -->
        <section class="panel-section links-section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="mdi mdi-link" />
              {{ t('admin.controlPanel.quickLinks') }}
            </h2>
          </div>
          <div class="links-grid">
            <router-link class="quick-link" to="/public/admin/users">
              <span class="mdi mdi-account-group" />
              <span>{{ t('admin.controlPanel.manageUsers') }}</span>
            </router-link>
            <router-link class="quick-link" to="/public/admin/feedbacks">
              <span class="mdi mdi-message-text" />
              <span>{{ t('admin.controlPanel.viewFeedbacks') }}</span>
            </router-link>
            <router-link class="quick-link" to="/public/admin/interests">
              <span class="mdi mdi-heart" />
              <span>{{ t('admin.controlPanel.manageInterests') }}</span>
            </router-link>
            <router-link class="quick-link" to="/public/admin/analytics">
              <span class="mdi mdi-chart-line" />
              <span>{{ t('admin.controlPanel.viewAnalytics') }}</span>
            </router-link>
          </div>
        </section>

        <!-- Reports Section -->
        <section class="panel-section reports-section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="mdi mdi-flag" />
              {{ t('admin.controlPanel.reportsTitle') }}
            </h2>
            <span class="badge badge--danger">{{ reports.length }}</span>
          </div>
          <div class="reports-list">
            <div v-for="report in reports" :key="report.id" class="report-item">
              <div class="report-header">
                <span class="report-type" :class="`report-type--${report.severity}`">
                  {{ report.type }}
                </span>
                <span class="report-date">{{ report.date }}</span>
              </div>
              <p class="report-content">{{ report.content }}</p>
              <div class="report-target">
                <img :alt="report.target.name" class="report-avatar" :src="report.target.avatar">
                <span class="report-target-name">{{ report.target.name }}</span>
              </div>
              <div class="report-actions">
                <button class="report-btn report-btn--view" type="button" @click="viewReport(report)">
                  {{ t('admin.controlPanel.viewDetails') }}
                </button>
                <button
                  class="report-btn report-btn--dismiss"
                  type="button"
                  @click="dismissReport(report)"
                >
                  {{ t('admin.controlPanel.dismiss') }}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </template>

    <!-- Interests Tab Content -->
    <InterestsManager v-if="activeMainTab === 'interests'" />

    <!-- Users Tab Content -->
    <UsersManager v-if="activeMainTab === 'users'" />

    <!-- Feedbacks Tab Content -->
    <FeedbacksCenter v-if="activeMainTab === 'feedbacks'" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import FeedbacksCenter from '../feedbacks/FeedbacksCenter.vue'
  import UsersManager from '../users/UsersManager.vue'
  import InterestsManager from './InterestsManager.vue'

  interface PendingAction {
    id: number
    type: 'event' | 'user' | 'interest' | 'feedback'
    title: string
    description: string
  }

  interface Activity {
    id: number
    type: 'create' | 'update' | 'delete' | 'login' | 'purchase'
    user: string
    action: string
    time: string
  }

  interface Report {
    id: number
    type: string
    severity: 'low' | 'medium' | 'high'
    content: string
    date: string
    target: {
      name: string
      avatar: string
    }
  }

  const { t } = useI18n()

  const isRefreshing = ref(false)
  const activeMainTab = ref<'overview' | 'interests' | 'users' | 'feedbacks'>('overview')

  const quickStats = ref({
    activeUsers: 1542,
    totalEvents: 86,
    pendingActions: 12,
    revenue: 45_680,
  })

  const settings = ref({
    allowRegistrations: true,
    maintenanceMode: false,
    autoApproveEvents: false,
    emailNotifications: true,
  })

  const pendingActions = ref<PendingAction[]>([
    {
      id: 1,
      type: 'event',
      title: 'Novo evento pendente',
      description: 'Festa Junina 2026 aguarda aprovação',
    },
    {
      id: 2,
      type: 'interest',
      title: 'Novo interesse solicitado',
      description: 'Categoria "Sertanejo" foi sugerida',
    },
    {
      id: 3,
      type: 'user',
      title: 'Verificação de produtor',
      description: 'João Silva solicitou verificação',
    },
  ])

  const recentActivity = ref<Activity[]>([
    {
      id: 1,
      type: 'create',
      user: 'Maria Santos',
      action: 'criou o evento "Summer Vibes"',
      time: 'há 5 min',
    },
    {
      id: 2,
      type: 'purchase',
      user: 'Pedro Costa',
      action: 'comprou 2 ingressos',
      time: 'há 12 min',
    },
    {
      id: 3,
      type: 'login',
      user: 'Ana Oliveira',
      action: 'fez login no sistema',
      time: 'há 25 min',
    },
    {
      id: 4,
      type: 'update',
      user: 'Lucas Ferreira',
      action: 'atualizou seu perfil',
      time: 'há 1 hora',
    },
    {
      id: 5,
      type: 'delete',
      user: 'Juliana Lima',
      action: 'cancelou inscrição no evento',
      time: 'há 2 horas',
    },
  ])

  const reports = ref<Report[]>([
    {
      id: 1,
      type: 'Spam',
      severity: 'medium',
      content: 'Usuário está enviando mensagens promocionais em massa nos comentários.',
      date: '02/02/2026',
      target: {
        name: 'Carlos Mendes',
        avatar: 'https://i.pravatar.cc/100?img=7',
      },
    },
    {
      id: 2,
      type: 'Conteúdo Inadequado',
      severity: 'high',
      content: 'Evento com descrição contendo linguagem ofensiva.',
      date: '01/02/2026',
      target: {
        name: 'Evento Suspeito',
        avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop',
      },
    },
  ])

  function formatNumber (num: number): string {
    return num.toLocaleString('pt-BR')
  }

  function refreshData () {
    isRefreshing.value = true
    setTimeout(() => {
      isRefreshing.value = false
    }, 1000)
  }

  function getActionIcon (type: string): string {
    const icons: Record<string, string> = {
      event: 'mdi-calendar',
      user: 'mdi-account',
      interest: 'mdi-heart',
      feedback: 'mdi-message',
    }
    return icons[type] || 'mdi-alert'
  }

  function getActivityIcon (type: string): string {
    const icons: Record<string, string> = {
      create: 'mdi-plus',
      update: 'mdi-pencil',
      delete: 'mdi-delete',
      login: 'mdi-login',
      purchase: 'mdi-cart',
    }
    return icons[type] || 'mdi-information'
  }

  function approveAction (action: PendingAction) {
    const index = pendingActions.value.findIndex(a => a.id === action.id)
    if (index !== -1) {
      pendingActions.value.splice(index, 1)
      quickStats.value.pendingActions--
    }
  }

  function rejectAction (action: PendingAction) {
    const index = pendingActions.value.findIndex(a => a.id === action.id)
    if (index !== -1) {
      pendingActions.value.splice(index, 1)
      quickStats.value.pendingActions--
    }
  }

  function viewReport (report: Report) {
    console.log('Viewing report:', report.id)
  }

  function dismissReport (report: Report) {
    const index = reports.value.findIndex(r => r.id === report.id)
    if (index !== -1) {
      reports.value.splice(index, 1)
    }
  }
</script>

<style scoped>
.control-panel {
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

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.spinning {
    animation: spin 1s linear infinite;
}

/* Main Tabs */
.main-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    background: #f3f4f6;
    padding: 6px;
    border-radius: 16px;
    width: fit-content;
}

.main-tab {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 28px;
    border: none;
    border-radius: 12px;
    background: transparent;
    color: #6b7280;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.main-tab:hover {
    background: rgba(255, 255, 255, 0.6);
}

.main-tab--active {
    background: white;
    color: #8b5cf6;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.main-tab .mdi {
    font-size: 20px;
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

.refresh-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: white;
    color: #374151;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.refresh-btn:hover {
    background: #f9fafb;
    border-color: #8b5cf6;
}

/* Quick Stats */
.quick-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
}

.stat-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 22px;
    border-radius: 16px;
    position: relative;
    overflow: hidden;
}

.stat-card--primary {
    background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
    color: white;
}

.stat-card--success {
    background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
    color: white;
}

.stat-card--warning {
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    color: white;
}

.stat-card--info {
    background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
    color: white;
}

.stat-content {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 28px;
    font-weight: 700;
}

.stat-label {
    font-size: 14px;
    opacity: 0.9;
}

.stat-trend {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
}

.stat-icon-bg {
    font-size: 32px;
    opacity: 0.5;
}

/* Main Grid */
.main-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
}

.panel-section {
    background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
    border-radius: 20px;
    border: 1px solid rgba(171, 151, 255, 0.15);
    padding: 24px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 700;
    color: #2d2d3a;
    margin: 0;
}

.section-title .mdi {
    font-size: 22px;
    color: #8b5cf6;
}

.badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
}

.badge--warning {
    background: #fef3c7;
    color: #d97706;
}

.badge--danger {
    background: #fee2e2;
    color: #dc2626;
}

.see-all-btn {
    border: none;
    background: none;
    color: #8b5cf6;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

/* Pending Actions */
.pending-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.pending-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px;
    background: white;
    border-radius: 12px;
    border: 1px solid #f3f4f6;
}

.pending-icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: white;
}

.pending-icon--event {
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
}

.pending-icon--user {
    background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

.pending-icon--interest {
    background: linear-gradient(135deg, #ec4899, #f472b6);
}

.pending-icon--feedback {
    background: linear-gradient(135deg, #10b981, #34d399);
}

.pending-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.pending-title {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.pending-description {
    font-size: 13px;
    color: #9ca3af;
}

.pending-actions {
    display: flex;
    gap: 8px;
}

.pending-btn {
    width: 34px;
    height: 34px;
    border: none;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    transition: all 0.2s ease;
}

.pending-btn--approve {
    background: #d1fae5;
    color: #059669;
}

.pending-btn--approve:hover {
    background: #a7f3d0;
}

.pending-btn--reject {
    background: #fee2e2;
    color: #dc2626;
}

.pending-btn--reject:hover {
    background: #fecaca;
}

.pending-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 30px;
    color: #9ca3af;
}

.pending-empty .mdi {
    font-size: 32px;
    color: #10b981;
}

/* Activity Section */
.activity-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.activity-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #f3f4f6;
}

.activity-item:last-child {
    border-bottom: none;
}

.activity-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}

.activity-icon--create {
    background: #d1fae5;
    color: #059669;
}

.activity-icon--update {
    background: #dbeafe;
    color: #2563eb;
}

.activity-icon--delete {
    background: #fee2e2;
    color: #dc2626;
}

.activity-icon--login {
    background: #e0e7ff;
    color: #4f46e5;
}

.activity-icon--purchase {
    background: #fef3c7;
    color: #d97706;
}

.activity-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.activity-text {
    font-size: 14px;
    color: #4b5563;
}

.activity-time {
    font-size: 12px;
    color: #9ca3af;
}

/* Settings Section */
.settings-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
}

.setting-item:last-child {
    border-bottom: none;
}

.setting-info {
    display: flex;
    flex-direction: column;
}

.setting-name {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.setting-desc {
    font-size: 12px;
    color: #9ca3af;
}

.toggle {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 26px;
}

.toggle input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #e5e7eb;
    border-radius: 26px;
    transition: 0.3s;
}

.toggle-slider::before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 3px;
    bottom: 3px;
    background: white;
    border-radius: 50%;
    transition: 0.3s;
}

.toggle input:checked+.toggle-slider {
    background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

.toggle input:checked+.toggle-slider::before {
    transform: translateX(22px);
}

/* Health Section */
.health-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.health-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.health-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.health-name {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.health-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
}

.health-status--online {
    color: #059669;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    animation: pulse 2s infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.health-bar {
    height: 8px;
    background: #f3f4f6;
    border-radius: 4px;
    overflow: hidden;
}

.health-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #34d399);
    border-radius: 4px;
}

.health-fill--warning {
    background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.health-value {
    font-size: 12px;
    color: #6b7280;
}

/* Quick Links */
.links-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.quick-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    background: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    text-decoration: none;
    color: #374151;
    font-weight: 500;
    transition: all 0.3s ease;
}

.quick-link:hover {
    border-color: #8b5cf6;
    background: #f8f8ff;
}

.quick-link .mdi {
    font-size: 22px;
    color: #8b5cf6;
}

/* Reports Section */
.reports-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.report-item {
    padding: 16px;
    background: white;
    border-radius: 12px;
    border: 1px solid #fee2e2;
}

.report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.report-type {
    font-size: 12px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 6px;
}

.report-type--low {
    background: #fef3c7;
    color: #d97706;
}

.report-type--medium {
    background: #fed7aa;
    color: #ea580c;
}

.report-type--high {
    background: #fee2e2;
    color: #dc2626;
}

.report-date {
    font-size: 12px;
    color: #9ca3af;
}

.report-content {
    font-size: 14px;
    color: #4b5563;
    margin: 0 0 12px;
    line-height: 1.5;
}

.report-target {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
}

.report-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}

.report-target-name {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.report-actions {
    display: flex;
    gap: 10px;
}

.report-btn {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.report-btn--view {
    background: #e0e7ff;
    color: #4f46e5;
}

.report-btn--view:hover {
    background: #c7d2fe;
}

.report-btn--dismiss {
    background: #f3f4f6;
    color: #6b7280;
}

.report-btn--dismiss:hover {
    background: #e5e7eb;
}

@media (max-width: 1200px) {
    .main-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 1024px) {
    .quick-stats {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .main-grid {
        grid-template-columns: 1fr;
    }

    .quick-stats {
        grid-template-columns: 1fr;
    }
}
</style>
