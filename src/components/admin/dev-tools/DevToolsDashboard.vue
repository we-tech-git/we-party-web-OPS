<template>
  <div class="dev-tools">
    <header class="dev-header">
      <div class="dev-header__info">
        <h1 class="dev-title">
          <span class="mdi mdi-code-braces" />
          {{ t('admin.devTools.title') }}
        </h1>
        <p class="dev-subtitle">{{ t('admin.devTools.subtitle') }}</p>
      </div>
      <div class="dev-header__actions">
        <div class="dev-mode-toggle">
          <span class="toggle-label">{{ t('admin.devTools.debugMode') }}</span>
          <label class="toggle-switch">
            <input v-model="debugMode" type="checkbox">
            <span class="toggle-slider" />
          </label>
        </div>
        <div class="env-badge" :class="`env-badge--${currentEnv}`">
          {{ currentEnv.toUpperCase() }}
        </div>
      </div>
    </header>

    <!-- System Status -->
    <section class="status-section">
      <h2 class="section-title">
        <span class="mdi mdi-server" />
        {{ t('admin.devTools.systemStatus') }}
      </h2>
      <div class="status-grid">
        <div v-for="service in systemStatus" :key="service.name" class="status-card">
          <div class="status-indicator" :class="`status-indicator--${service.status}`" />
          <div class="status-info">
            <span class="status-name">{{ service.name }}</span>
            <span class="status-latency">{{ service.latency }}ms</span>
          </div>
          <span class="status-icon mdi" :class="service.icon" />
        </div>
      </div>
    </section>

    <!-- Main Tools Grid -->
    <div class="tools-grid">
      <!-- Quick Actions -->
      <section class="tool-card quick-actions-card">
        <h3 class="card-title">
          <span class="mdi mdi-lightning-bolt" />
          {{ t('admin.devTools.quickActions') }}
        </h3>
        <div class="quick-actions">
          <button
            v-for="action in quickActions"
            :key="action.id"
            class="quick-action-btn"
            :class="{ 'quick-action-btn--loading': action.loading }"
            type="button"
            @click="executeAction(action)"
          >
            <span class="mdi" :class="action.icon" />
            <span>{{ action.label }}</span>
            <span v-if="action.loading" class="mdi mdi-loading mdi-spin" />
          </button>
        </div>
      </section>

      <!-- Feature Flags -->
      <section class="tool-card feature-flags-card">
        <h3 class="card-title">
          <span class="mdi mdi-flag-variant" />
          {{ t('admin.devTools.featureFlags') }}
        </h3>
        <div class="feature-flags">
          <div v-for="flag in featureFlags" :key="flag.key" class="flag-item">
            <div class="flag-info">
              <span class="flag-name">{{ flag.name }}</span>
              <span class="flag-key">{{ flag.key }}</span>
            </div>
            <label class="toggle-switch toggle-switch--small">
              <input v-model="flag.enabled" type="checkbox" @change="toggleFeatureFlag(flag)">
              <span class="toggle-slider" />
            </label>
          </div>
        </div>
      </section>

      <!-- Console Logs -->
      <section class="tool-card logs-card">
        <div class="card-header">
          <h3 class="card-title">
            <span class="mdi mdi-console" />
            {{ t('admin.devTools.consoleLogs') }}
          </h3>
          <div class="log-controls">
            <select v-model="logFilter" class="log-filter">
              <option value="all">{{ t('admin.devTools.allLogs') }}</option>
              <option value="info">Info</option>
              <option value="warn">Warnings</option>
              <option value="error">Errors</option>
            </select>
            <button class="icon-btn" title="Limpar" type="button" @click="clearLogs">
              <span class="mdi mdi-delete" />
            </button>
            <button
              class="icon-btn"
              :class="{ 'icon-btn--active': autoScroll }"
              title="Auto-scroll"
              type="button"
              @click="autoScroll = !autoScroll"
            >
              <span class="mdi mdi-arrow-down-bold" />
            </button>
          </div>
        </div>
        <div ref="logsContainer" class="logs-container">
          <div
            v-for="(log, index) in filteredLogs"
            :key="index"
            class="log-entry"
            :class="`log-entry--${log.type}`"
          >
            <span class="log-time">{{ log.time }}</span>
            <span class="log-type mdi" :class="getLogIcon(log.type)" />
            <span class="log-message">{{ log.message }}</span>
          </div>
          <div v-if="filteredLogs.length === 0" class="logs-empty">
            <span class="mdi mdi-console-line" />
            <span>{{ t('admin.devTools.noLogs') }}</span>
          </div>
        </div>
      </section>

      <!-- Storage Explorer -->
      <section class="tool-card storage-card">
        <h3 class="card-title">
          <span class="mdi mdi-database" />
          {{ t('admin.devTools.storageExplorer') }}
        </h3>
        <div class="storage-tabs">
          <button
            v-for="tab in storageTabs"
            :key="tab.id"
            class="storage-tab"
            :class="{ 'storage-tab--active': activeStorageTab === tab.id }"
            type="button"
            @click="activeStorageTab = tab.id"
          >
            {{ tab.label }}
            <span class="tab-count">{{ tab.count }}</span>
          </button>
        </div>
        <div class="storage-content">
          <div class="storage-actions">
            <button class="storage-action-btn" type="button" @click="refreshStorage">
              <span class="mdi mdi-refresh" />
              {{ t('admin.devTools.refresh') }}
            </button>
            <button class="storage-action-btn storage-action-btn--danger" type="button" @click="clearStorage">
              <span class="mdi mdi-delete-sweep" />
              {{ t('admin.devTools.clearAll') }}
            </button>
          </div>
          <div class="storage-items">
            <div v-for="item in currentStorageItems" :key="item.key" class="storage-item">
              <div class="storage-key" @click="toggleStorageItem(item)">
                <span class="mdi" :class="item.expanded ? 'mdi-chevron-down' : 'mdi-chevron-right'" />
                <span>{{ item.key }}</span>
                <span class="storage-size">{{ item.size }}</span>
              </div>
              <div v-if="item.expanded" class="storage-value">
                <pre>{{ item.formattedValue }}</pre>
                <div class="storage-item-actions">
                  <button class="mini-btn" type="button" @click="copyStorageValue(item)">
                    <span class="mdi mdi-content-copy" />
                  </button>
                  <button class="mini-btn mini-btn--danger" type="button" @click="deleteStorageItem(item)">
                    <span class="mdi mdi-delete" />
                  </button>
                </div>
              </div>
            </div>
            <div v-if="currentStorageItems.length === 0" class="storage-empty">
              <span class="mdi mdi-package-variant" />
              <span>{{ t('admin.devTools.noData') }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Theme Playground -->
      <section class="tool-card theme-card">
        <h3 class="card-title">
          <span class="mdi mdi-palette" />
          {{ t('admin.devTools.themePlayground') }}
        </h3>
        <div class="theme-content">
          <div class="color-pickers">
            <div v-for="color in themeColors" :key="color.key" class="color-picker-item">
              <label class="color-label">{{ color.label }}</label>
              <div class="color-input-group">
                <input
                  v-model="color.value"
                  class="color-input"
                  type="color"
                  @input="updateThemeColor(color)"
                >
                <input
                  v-model="color.value"
                  class="color-text"
                  type="text"
                  @input="updateThemeColor(color)"
                >
              </div>
            </div>
          </div>
          <div class="theme-preview">
            <div class="preview-card" :style="previewStyles">
              <h4>Preview</h4>
              <p>{{ t('admin.devTools.previewText') }}</p>
              <button class="preview-btn" :style="previewBtnStyles" type="button">
                {{ t('admin.devTools.sampleButton') }}
              </button>
            </div>
          </div>
          <div class="theme-actions">
            <button class="theme-btn" type="button" @click="resetTheme">
              <span class="mdi mdi-refresh" />
              {{ t('admin.devTools.resetTheme') }}
            </button>
            <button class="theme-btn theme-btn--primary" type="button" @click="exportTheme">
              <span class="mdi mdi-export" />
              {{ t('admin.devTools.exportTheme') }}
            </button>
          </div>
        </div>
      </section>

      <!-- API Tester -->
      <section class="tool-card api-card">
        <h3 class="card-title">
          <span class="mdi mdi-api" />
          {{ t('admin.devTools.apiTester') }}
        </h3>
        <div class="api-content">
          <div class="api-request">
            <div class="api-method-url">
              <select v-model="apiRequest.method" class="api-method">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
              <input v-model="apiRequest.url" class="api-url" placeholder="/api/endpoint" type="text">
              <button class="api-send" :disabled="apiLoading" type="button" @click="sendApiRequest">
                <span v-if="apiLoading" class="mdi mdi-loading mdi-spin" />
                <span v-else class="mdi mdi-send" />
              </button>
            </div>
            <div class="api-tabs">
              <button
                class="api-tab"
                :class="{ 'api-tab--active': apiTab === 'headers' }"
                type="button"
                @click="apiTab = 'headers'"
              >
                Headers
              </button>
              <button
                class="api-tab"
                :class="{ 'api-tab--active': apiTab === 'body' }"
                type="button"
                @click="apiTab = 'body'"
              >
                Body
              </button>
            </div>
            <textarea
              v-if="apiTab === 'headers'"
              v-model="apiRequest.headers"
              class="api-textarea"
              placeholder="{&quot;Content-Type&quot;: &quot;application/json&quot;}"
            />
            <textarea
              v-if="apiTab === 'body'"
              v-model="apiRequest.body"
              class="api-textarea"
              placeholder="{&quot;key&quot;: &quot;value&quot;}"
            />
          </div>
          <div v-if="apiResponse" class="api-response">
            <div class="response-header">
              <span class="response-status" :class="`response-status--${getStatusClass(apiResponse.status)}`">
                {{ apiResponse.status }} {{ apiResponse.statusText }}
              </span>
              <span class="response-time">{{ apiResponse.time }}ms</span>
            </div>
            <pre class="response-body">{{ apiResponse.data }}</pre>
          </div>
        </div>
      </section>

      <!-- i18n Inspector -->
      <section class="tool-card i18n-card">
        <h3 class="card-title">
          <span class="mdi mdi-translate" />
          {{ t('admin.devTools.i18nInspector') }}
        </h3>
        <div class="i18n-content">
          <div class="i18n-stats">
            <div class="i18n-stat">
              <span class="i18n-stat-value">{{ i18nStats.totalKeys }}</span>
              <span class="i18n-stat-label">{{ t('admin.devTools.totalKeys') }}</span>
            </div>
            <div class="i18n-stat">
              <span class="i18n-stat-value">{{ i18nStats.translated }}</span>
              <span class="i18n-stat-label">{{ t('admin.devTools.translated') }}</span>
            </div>
            <div class="i18n-stat i18n-stat--warning">
              <span class="i18n-stat-value">{{ i18nStats.missing }}</span>
              <span class="i18n-stat-label">{{ t('admin.devTools.missing') }}</span>
            </div>
          </div>
          <div class="i18n-locale-switch">
            <span>{{ t('admin.devTools.currentLocale') }}:</span>
            <div class="locale-buttons">
              <button
                v-for="loc in availableLocales"
                :key="loc"
                class="locale-btn"
                :class="{ 'locale-btn--active': currentLocale === loc }"
                type="button"
                @click="switchLocale(loc)"
              >
                {{ loc }}
              </button>
            </div>
          </div>
          <div class="i18n-search">
            <span class="mdi mdi-magnify" />
            <input v-model="i18nSearch" :placeholder="t('admin.devTools.searchKeys')" type="text">
          </div>
          <div class="i18n-keys">
            <div v-for="key in filteredI18nKeys" :key="key.path" class="i18n-key-item">
              <span class="key-path">{{ key.path }}</span>
              <span class="key-value" :class="{ 'key-value--missing': key.missing }">
                {{ key.missing ? '⚠️ Missing' : key.value }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Performance Monitor -->
      <section class="tool-card performance-card">
        <h3 class="card-title">
          <span class="mdi mdi-speedometer" />
          {{ t('admin.devTools.performanceMonitor') }}
        </h3>
        <div class="performance-content">
          <div class="perf-metrics">
            <div class="perf-metric">
              <div class="perf-metric-header">
                <span class="perf-metric-label">{{ t('admin.devTools.memoryUsage') }}</span>
                <span class="perf-metric-value">{{ performanceData.memory }}%</span>
              </div>
              <div class="perf-bar">
                <div class="perf-bar-fill" :class="getMemoryClass(performanceData.memory)" :style="{ width: `${performanceData.memory}%` }" />
              </div>
            </div>
            <div class="perf-metric">
              <div class="perf-metric-header">
                <span class="perf-metric-label">{{ t('admin.devTools.cpuUsage') }}</span>
                <span class="perf-metric-value">{{ performanceData.cpu }}%</span>
              </div>
              <div class="perf-bar">
                <div class="perf-bar-fill" :class="getCpuClass(performanceData.cpu)" :style="{ width: `${performanceData.cpu}%` }" />
              </div>
            </div>
          </div>
          <div class="perf-vitals">
            <h4>Core Web Vitals</h4>
            <div class="vitals-grid">
              <div v-for="vital in webVitals" :key="vital.name" class="vital-item" :class="`vital-item--${vital.rating}`">
                <span class="vital-name">{{ vital.name }}</span>
                <span class="vital-value">{{ vital.value }}{{ vital.unit }}</span>
                <span class="vital-rating">{{ vital.rating }}</span>
              </div>
            </div>
          </div>
          <div class="perf-fps">
            <span class="fps-label">FPS</span>
            <span class="fps-value" :class="getFpsClass(currentFps)">{{ currentFps }}</span>
          </div>
        </div>
      </section>
    </div>

    <!-- Floating Debug Panel -->
    <Teleport to="body">
      <div v-if="debugMode" class="debug-panel">
        <div class="debug-panel__header">
          <span class="mdi mdi-bug" />
          Debug Panel
          <button class="debug-panel__close" type="button" @click="debugMode = false">
            <span class="mdi mdi-close" />
          </button>
        </div>
        <div class="debug-panel__content">
          <div class="debug-item">
            <span class="debug-label">Route:</span>
            <span class="debug-value">{{ currentRoute }}</span>
          </div>
          <div class="debug-item">
            <span class="debug-label">Viewport:</span>
            <span class="debug-value">{{ viewport.width }}x{{ viewport.height }}</span>
          </div>
          <div class="debug-item">
            <span class="debug-label">User Agent:</span>
            <span class="debug-value debug-value--truncate">{{ userAgent }}</span>
          </div>
          <div class="debug-item">
            <span class="debug-label">Time:</span>
            <span class="debug-value">{{ currentTime }}</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'

  const { t, locale, availableLocales } = useI18n()
  const route = useRoute()

  // State
  const debugMode = ref(false)
  const currentEnv = ref('development')
  const logFilter = ref('all')
  const autoScroll = ref(true)
  const activeStorageTab = ref('local')
  const apiTab = ref('headers')
  const apiLoading = ref(false)
  const i18nSearch = ref('')
  const currentFps = ref(60)
  const logsContainer = ref<HTMLElement | null>(null)

  // System Status
  const systemStatus = ref([
    { name: 'API Server', status: 'online', latency: 45, icon: 'mdi-server' },
    { name: 'Database', status: 'online', latency: 12, icon: 'mdi-database' },
    { name: 'Cache', status: 'online', latency: 3, icon: 'mdi-memory' },
    { name: 'CDN', status: 'online', latency: 28, icon: 'mdi-cloud' },
    { name: 'Auth Service', status: 'online', latency: 67, icon: 'mdi-shield-check' },
    { name: 'WebSocket', status: 'warning', latency: 150, icon: 'mdi-sync' },
  ])

  // Quick Actions
  const quickActions = ref([
    { id: 'clearCache', label: 'Clear Cache', icon: 'mdi-cached', loading: false },
    { id: 'reloadConfig', label: 'Reload Config', icon: 'mdi-refresh', loading: false },
    { id: 'seedData', label: 'Seed Data', icon: 'mdi-seed', loading: false },
    { id: 'syncState', label: 'Sync State', icon: 'mdi-sync', loading: false },
    { id: 'exportLogs', label: 'Export Logs', icon: 'mdi-file-export', loading: false },
    { id: 'runTests', label: 'Run Tests', icon: 'mdi-test-tube', loading: false },
  ])

  // Feature Flags
  const featureFlags = ref([
    { key: 'new_dashboard', name: 'New Dashboard UI', enabled: true },
    { key: 'dark_mode', name: 'Dark Mode', enabled: false },
    { key: 'analytics_v2', name: 'Analytics V2', enabled: true },
    { key: 'push_notifications', name: 'Push Notifications', enabled: true },
    { key: 'experimental_features', name: 'Experimental Features', enabled: false },
    { key: 'maintenance_mode', name: 'Maintenance Mode', enabled: false },
  ])

  // Console Logs
  const logs = ref([
    { time: '10:23:45', type: 'info', message: '[App] Application started successfully' },
    { time: '10:23:46', type: 'info', message: '[Router] Navigation to /admin/dev-tools' },
    { time: '10:23:47', type: 'warn', message: '[API] Rate limit approaching: 80/100 requests' },
    { time: '10:24:01', type: 'info', message: '[Store] State hydration complete' },
    { time: '10:24:15', type: 'error', message: '[WebSocket] Connection timeout - retrying...' },
    { time: '10:24:18', type: 'info', message: '[WebSocket] Reconnected successfully' },
  ])

  const filteredLogs = computed(() => {
    if (logFilter.value === 'all') return logs.value
    return logs.value.filter(log => log.type === logFilter.value)
  })

  // Storage Explorer
  const storageTabs = computed(() => [
    { id: 'local', label: 'LocalStorage', count: localStorageItems.value.length },
    { id: 'session', label: 'SessionStorage', count: sessionStorageItems.value.length },
    { id: 'cookies', label: 'Cookies', count: cookieItems.value.length },
  ])

  const localStorageItems = ref<Array<{ key: string, value: string, size: string, formattedValue: string, expanded: boolean }>>([])
  const sessionStorageItems = ref<Array<{ key: string, value: string, size: string, formattedValue: string, expanded: boolean }>>([])
  const cookieItems = ref<Array<{ key: string, value: string, size: string, formattedValue: string, expanded: boolean }>>([])

  const currentStorageItems = computed(() => {
    switch (activeStorageTab.value) {
      case 'local': { return localStorageItems.value
      }
      case 'session': { return sessionStorageItems.value
      }
      case 'cookies': { return cookieItems.value
      }
      default: { return []
      }
    }
  })

  // Theme Playground
  const themeColors = ref([
    { key: 'primary', label: 'Primary', value: '#8b5cf6' },
    { key: 'secondary', label: 'Secondary', value: '#ec4899' },
    { key: 'accent', label: 'Accent', value: '#10b981' },
    { key: 'background', label: 'Background', value: '#f8f8ff' },
    { key: 'text', label: 'Text', value: '#2d2d3a' },
  ])

  const previewStyles = computed(() => ({
    background: themeColors.value.find(c => c.key === 'background')?.value,
    color: themeColors.value.find(c => c.key === 'text')?.value,
  }))

  const previewBtnStyles = computed(() => ({
    background: `linear-gradient(135deg, ${themeColors.value.find(c => c.key === 'primary')?.value}, ${themeColors.value.find(c => c.key === 'secondary')?.value})`,
  }))

  // API Tester
  const apiRequest = reactive({
    method: 'GET',
    url: '/api/health',
    headers: '{"Content-Type": "application/json"}',
    body: '{}',
  })

  const apiResponse = ref<{ status: number, statusText: string, time: number, data: string } | null>(null)

  // i18n Inspector
  const i18nStats = ref({
    totalKeys: 156,
    translated: 152,
    missing: 4,
  })

  const currentLocale = computed(() => locale.value)

  const i18nKeys = ref([
    { path: 'admin.devTools.title', value: 'DevTools', missing: false },
    { path: 'admin.devTools.subtitle', value: 'Developer Tools', missing: false },
    { path: 'admin.devTools.newFeature', value: '', missing: true },
    { path: 'admin.devTools.comingSoon', value: '', missing: true },
  ])

  const filteredI18nKeys = computed(() => {
    if (!i18nSearch.value) return i18nKeys.value
    return i18nKeys.value.filter(k =>
      k.path.toLowerCase().includes(i18nSearch.value.toLowerCase()),
    )
  })

  // Performance Monitor
  const performanceData = ref({
    memory: 45,
    cpu: 23,
  })

  const webVitals = ref([
    { name: 'LCP', value: 1.2, unit: 's', rating: 'good' },
    { name: 'FID', value: 18, unit: 'ms', rating: 'good' },
    { name: 'CLS', value: 0.05, unit: '', rating: 'good' },
    { name: 'TTFB', value: 280, unit: 'ms', rating: 'needs-improvement' },
  ])

  // Debug Panel
  const currentRoute = computed(() => route.fullPath)
  const viewport = reactive({ width: 0, height: 0 })
  const userAgent = ref('')
  const currentTime = ref('')

  // Methods
  function getLogIcon (type: string): string {
    switch (type) {
      case 'info': { return 'mdi-information'
      }
      case 'warn': { return 'mdi-alert'
      }
      case 'error': { return 'mdi-alert-circle'
      }
      default: { return 'mdi-console'
      }
    }
  }

  function clearLogs () {
    logs.value = []
    addLog('info', '[DevTools] Logs cleared')
  }

  function addLog (type: string, message: string) {
    const now = new Date()
    const time = now.toLocaleTimeString('pt-BR')
    logs.value.push({ time, type, message })
    if (autoScroll.value) {
      nextTick(() => {
        if (logsContainer.value) {
          logsContainer.value.scrollTop = logsContainer.value.scrollHeight
        }
      })
    }
  }

  function executeAction (action: typeof quickActions.value[0]) {
    action.loading = true
    addLog('info', `[QuickAction] Executing: ${action.id}`)

    setTimeout(() => {
      action.loading = false
      addLog('info', `[QuickAction] Completed: ${action.id}`)
    }, 1500)
  }

  function toggleFeatureFlag (flag: typeof featureFlags.value[0]) {
    addLog('info', `[FeatureFlag] ${flag.key} = ${flag.enabled}`)
    localStorage.setItem(`ff_${flag.key}`, String(flag.enabled))
  }

  function refreshStorage () {
    loadStorageItems()
    addLog('info', '[Storage] Refreshed storage data')
  }

  function clearStorage () {
    if (activeStorageTab.value === 'local') {
      localStorage.clear()
      localStorageItems.value = []
    } else if (activeStorageTab.value === 'session') {
      sessionStorage.clear()
      sessionStorageItems.value = []
    }
    addLog('warn', `[Storage] Cleared ${activeStorageTab.value}Storage`)
  }

  function toggleStorageItem (item: typeof localStorageItems.value[0]) {
    item.expanded = !item.expanded
  }

  function copyStorageValue (item: typeof localStorageItems.value[0]) {
    navigator.clipboard.writeText(item.value)
    addLog('info', `[Storage] Copied value for: ${item.key}`)
  }

  function deleteStorageItem (item: typeof localStorageItems.value[0]) {
    if (activeStorageTab.value === 'local') {
      localStorage.removeItem(item.key)
    } else if (activeStorageTab.value === 'session') {
      sessionStorage.removeItem(item.key)
    }
    refreshStorage()
    addLog('warn', `[Storage] Deleted: ${item.key}`)
  }

  function loadStorageItems () {
    const parseStorage = (storage: Storage) => {
      const items: typeof localStorageItems.value = []
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        if (key) {
          const value = storage.getItem(key) ?? ''
          let formattedValue = value
          try {
            formattedValue = JSON.stringify(JSON.parse(value), null, 2)
          } catch {
            formattedValue = value
          }
          items.push({
            key,
            value,
            size: `${new Blob([value]).size} B`,
            formattedValue,
            expanded: false,
          })
        }
      }
      return items
    }

    localStorageItems.value = parseStorage(localStorage)
    sessionStorageItems.value = parseStorage(sessionStorage)

    // Parse cookies
    cookieItems.value = document.cookie.split(';').filter(c => c.trim()).map(c => {
      const [key, value] = c.trim().split('=')
      return {
        key: key ?? '',
        value: value ?? '',
        size: `${new Blob([value ?? '']).size} B`,
        formattedValue: decodeURIComponent(value ?? ''),
        expanded: false,
      }
    })
  }

  function updateThemeColor (color: typeof themeColors.value[0]) {
    document.documentElement.style.setProperty(`--dev-${color.key}`, color.value)
    addLog('info', `[Theme] Updated ${color.key}: ${color.value}`)
  }

  function resetTheme () {
    themeColors.value = [
      { key: 'primary', label: 'Primary', value: '#8b5cf6' },
      { key: 'secondary', label: 'Secondary', value: '#ec4899' },
      { key: 'accent', label: 'Accent', value: '#10b981' },
      { key: 'background', label: 'Background', value: '#f8f8ff' },
      { key: 'text', label: 'Text', value: '#2d2d3a' },
    ]
    addLog('info', '[Theme] Reset to defaults')
  }

  function exportTheme () {
    const theme = themeColors.value.reduce((acc, c) => {
      acc[c.key] = c.value
      return acc
    }, {} as Record<string, string>)
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'theme.json'
    a.click()
    URL.revokeObjectURL(url)
    addLog('info', '[Theme] Exported theme.json')
  }

  async function sendApiRequest () {
    apiLoading.value = true
    apiResponse.value = null
    const startTime = performance.now()

    addLog('info', `[API] ${apiRequest.method} ${apiRequest.url}`)

    // Simulate API request
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500))

    const endTime = performance.now()
    apiResponse.value = {
      status: 200,
      statusText: 'OK',
      time: Math.round(endTime - startTime),
      data: JSON.stringify({
        success: true,
        message: 'API response simulated',
        timestamp: new Date().toISOString(),
        data: { events: 42, users: 1337 },
      }, null, 2),
    }

    apiLoading.value = false
    addLog('info', `[API] Response: ${apiResponse.value.status} in ${apiResponse.value.time}ms`)
  }

  function getStatusClass (status: number): string {
    if (status >= 200 && status < 300) return 'success'
    if (status >= 400 && status < 500) return 'warning'
    if (status >= 500) return 'error'
    return 'info'
  }

  function switchLocale (loc: string) {
    locale.value = loc
    addLog('info', `[i18n] Switched locale to: ${loc}`)
  }

  function getMemoryClass (value: number): string {
    if (value < 50) return 'perf-bar-fill--good'
    if (value < 80) return 'perf-bar-fill--warning'
    return 'perf-bar-fill--danger'
  }

  function getCpuClass (value: number): string {
    if (value < 50) return 'perf-bar-fill--good'
    if (value < 80) return 'perf-bar-fill--warning'
    return 'perf-bar-fill--danger'
  }

  function getFpsClass (value: number): string {
    if (value >= 55) return 'fps-value--good'
    if (value >= 30) return 'fps-value--warning'
    return 'fps-value--danger'
  }

  function updateDebugInfo () {
    viewport.width = window.innerWidth
    viewport.height = window.innerHeight
    userAgent.value = navigator.userAgent
    currentTime.value = new Date().toLocaleString('pt-BR')
  }

  // FPS counter
  let frameCount = 0
  let lastTime = performance.now()
  let fpsInterval: number

  function measureFps () {
    const now = performance.now()
    frameCount++

    if (now - lastTime >= 1000) {
      currentFps.value = frameCount
      frameCount = 0
      lastTime = now
    }

    fpsInterval = requestAnimationFrame(measureFps)
  }

  // Lifecycle
  onMounted(() => {
    loadStorageItems()
    updateDebugInfo()
    measureFps()

    window.addEventListener('resize', updateDebugInfo)

    // Simulate random log entries
    setInterval(() => {
      const types = ['info', 'info', 'info', 'warn', 'error']
      const messages = [
        '[App] Component rendered',
        '[API] Request completed',
        '[Store] State updated',
        '[Router] Navigation guard passed',
        '[WebSocket] Message received',
      ]
      const type = types[Math.floor(Math.random() * types.length)]
      const message = messages[Math.floor(Math.random() * messages.length)]
      if (type && message) addLog(type, message)
    }, 5000)

    // Simulate performance data changes
    setInterval(() => {
      performanceData.value.memory = Math.min(100, Math.max(20, performanceData.value.memory + (Math.random() * 10 - 5)))
      performanceData.value.cpu = Math.min(100, Math.max(10, performanceData.value.cpu + (Math.random() * 15 - 7)))
    }, 2000)

    addLog('info', '[DevTools] Dashboard initialized')
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateDebugInfo)
    cancelAnimationFrame(fpsInterval)
  })

  watch(autoScroll, val => {
    if (val && logsContainer.value) {
      logsContainer.value.scrollTop = logsContainer.value.scrollHeight
    }
  })
</script>

<style scoped>
.dev-tools {
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header */
.dev-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.dev-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 700;
  color: #2d2d3a;
  margin: 0;
}

.dev-title .mdi {
  font-size: 32px;
  color: #8b5cf6;
}

.dev-subtitle {
  font-size: 14px;
  color: #8b8b99;
  margin: 4px 0 0;
}

.dev-header__actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dev-mode-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-label {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
}

.toggle-switch {
  position: relative;
  width: 48px;
  height: 26px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #e5e7eb;
  border-radius: 26px;
  transition: 0.3s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.toggle-switch input:checked + .toggle-slider {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(22px);
}

.toggle-switch--small {
  width: 40px;
  height: 22px;
}

.toggle-switch--small .toggle-slider::before {
  height: 16px;
  width: 16px;
}

.toggle-switch--small input:checked + .toggle-slider::before {
  transform: translateX(18px);
}

.env-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.env-badge--development {
  background: #fef3c7;
  color: #92400e;
}

.env-badge--staging {
  background: #dbeafe;
  color: #1e40af;
}

.env-badge--production {
  background: #dcfce7;
  color: #166534;
}

/* Status Section */
.status-section {
  background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
  border-radius: 20px;
  border: 1px solid rgba(171, 151, 255, 0.15);
  padding: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: #2d2d3a;
  margin: 0 0 20px;
}

.section-title .mdi {
  font-size: 24px;
  color: #8b5cf6;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: white;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.status-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

.status-indicator--online { background: #10b981; }
.status-indicator--warning { background: #f59e0b; }
.status-indicator--offline { background: #ef4444; }

.status-info {
  flex: 1;
}

.status-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.status-latency {
  font-size: 11px;
  color: #9ca3af;
}

.status-icon {
  font-size: 20px;
  color: #9ca3af;
}

/* Tools Grid */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.tool-card {
  background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
  border-radius: 20px;
  border: 1px solid rgba(171, 151, 255, 0.15);
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: #2d2d3a;
  margin: 0 0 16px;
}

.card-header .card-title {
  margin: 0;
}

.card-title .mdi {
  font-size: 22px;
  color: #8b5cf6;
}

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-action-btn:hover {
  background: #8b5cf6;
  color: white;
  border-color: #8b5cf6;
}

.quick-action-btn .mdi {
  font-size: 18px;
}

.quick-action-btn--loading {
  opacity: 0.7;
  pointer-events: none;
}

/* Feature Flags */
.feature-flags {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.flag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.flag-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.flag-key {
  font-size: 11px;
  color: #9ca3af;
  font-family: monospace;
}

/* Console Logs */
.logs-card {
  grid-column: span 2;
}

.log-controls {
  display: flex;
  gap: 8px;
}

.log-filter {
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  background: white;
}

.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: #f3f4f6;
}

.icon-btn--active {
  background: #8b5cf6;
  color: white;
  border-color: #8b5cf6;
}

.logs-container {
  max-height: 250px;
  overflow-y: auto;
  background: #1e1e2e;
  border-radius: 12px;
  padding: 14px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
}

.log-entry {
  display: flex;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.log-time {
  color: #6b7280;
  min-width: 70px;
}

.log-type {
  font-size: 14px;
}

.log-entry--info .log-type { color: #60a5fa; }
.log-entry--warn .log-type { color: #fbbf24; }
.log-entry--error .log-type { color: #f87171; }

.log-message {
  color: #e5e7eb;
  flex: 1;
}

.logs-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: #6b7280;
}

/* Storage Explorer */
.storage-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.storage-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.storage-tab--active {
  background: #8b5cf6;
  color: white;
  border-color: #8b5cf6;
}

.tab-count {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.storage-tab--active .tab-count {
  background: rgba(255, 255, 255, 0.2);
}

.storage-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.storage-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
}

.storage-action-btn--danger {
  color: #ef4444;
  border-color: #fecaca;
}

.storage-items {
  max-height: 200px;
  overflow-y: auto;
}

.storage-item {
  margin-bottom: 8px;
}

.storage-key {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.storage-key:hover {
  background: #f9fafb;
}

.storage-size {
  margin-left: auto;
  font-size: 11px;
  color: #9ca3af;
}

.storage-value {
  margin-top: 6px;
  padding: 12px;
  background: #1e1e2e;
  border-radius: 10px;
  position: relative;
}

.storage-value pre {
  color: #e5e7eb;
  font-size: 11px;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.storage-item-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
}

.mini-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: #9ca3af;
  cursor: pointer;
}

.mini-btn:hover { background: rgba(255, 255, 255, 0.2); }
.mini-btn--danger:hover { background: rgba(239, 68, 68, 0.3); color: #f87171; }

.storage-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px;
  color: #9ca3af;
}

/* Theme Playground */
.theme-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.color-pickers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.color-picker-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.color-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
}

.color-input-group {
  display: flex;
  gap: 6px;
}

.color-input {
  width: 40px;
  height: 36px;
  padding: 2px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
}

.color-text {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  font-family: monospace;
}

.theme-preview {
  display: flex;
  justify-content: center;
}

.preview-card {
  padding: 20px 30px;
  border-radius: 16px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.preview-card h4 {
  margin: 0 0 8px;
  font-size: 16px;
}

.preview-card p {
  margin: 0 0 16px;
  font-size: 13px;
  opacity: 0.7;
}

.preview-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.theme-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.theme-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}

.theme-btn--primary {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: white;
  border: none;
}

/* API Tester */
.api-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.api-method-url {
  display: flex;
  gap: 8px;
}

.api-method {
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  background: white;
}

.api-url {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 13px;
  font-family: monospace;
}

.api-send {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  border: none;
  border-radius: 10px;
  color: white;
  cursor: pointer;
}

.api-send:disabled { opacity: 0.6; }

.api-tabs {
  display: flex;
  gap: 8px;
}

.api-tab {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
}

.api-tab--active {
  background: #8b5cf6;
  color: white;
  border-color: #8b5cf6;
}

.api-textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
}

.api-response {
  background: #1e1e2e;
  border-radius: 12px;
  overflow: hidden;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
}

.response-status {
  font-size: 13px;
  font-weight: 600;
}

.response-status--success { color: #10b981; }
.response-status--warning { color: #f59e0b; }
.response-status--error { color: #ef4444; }

.response-time {
  font-size: 12px;
  color: #9ca3af;
}

.response-body {
  padding: 14px;
  margin: 0;
  color: #e5e7eb;
  font-size: 12px;
  max-height: 150px;
  overflow-y: auto;
}

/* i18n Inspector */
.i18n-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.i18n-stats {
  display: flex;
  gap: 16px;
}

.i18n-stat {
  flex: 1;
  text-align: center;
  padding: 14px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.i18n-stat--warning { border-color: #fbbf24; background: #fffbeb; }

.i18n-stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #8b5cf6;
}

.i18n-stat--warning .i18n-stat-value { color: #f59e0b; }

.i18n-stat-label {
  font-size: 12px;
  color: #6b7280;
}

.i18n-locale-switch {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #6b7280;
}

.locale-buttons {
  display: flex;
  gap: 6px;
}

.locale-btn {
  padding: 6px 14px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}

.locale-btn--active {
  background: #8b5cf6;
  color: white;
  border-color: #8b5cf6;
}

.i18n-search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.i18n-search .mdi { color: #9ca3af; }

.i18n-search input {
  flex: 1;
  border: none;
  font-size: 13px;
  outline: none;
}

.i18n-keys {
  max-height: 150px;
  overflow-y: auto;
}

.i18n-key-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid #f3f4f6;
}

.key-path {
  font-size: 12px;
  font-family: monospace;
  color: #6b7280;
}

.key-value {
  font-size: 12px;
  color: #374151;
}

.key-value--missing { color: #f59e0b; }

/* Performance Monitor */
.performance-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.perf-metrics {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.perf-metric-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.perf-metric-label {
  font-size: 13px;
  color: #6b7280;
}

.perf-metric-value {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.perf-bar {
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.perf-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.perf-bar-fill--good { background: #10b981; }
.perf-bar-fill--warning { background: #f59e0b; }
.perf-bar-fill--danger { background: #ef4444; }

.perf-vitals h4 {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px;
}

.vitals-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.vital-item {
  text-align: center;
  padding: 12px;
  background: white;
  border-radius: 10px;
  border: 2px solid;
}

.vital-item--good { border-color: #10b981; }
.vital-item--needs-improvement { border-color: #f59e0b; }
.vital-item--poor { border-color: #ef4444; }

.vital-name {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
}

.vital-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #374151;
  margin: 4px 0;
}

.vital-rating {
  font-size: 10px;
  text-transform: uppercase;
}

.vital-item--good .vital-rating { color: #10b981; }
.vital-item--needs-improvement .vital-rating { color: #f59e0b; }
.vital-item--poor .vital-rating { color: #ef4444; }

.perf-fps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.fps-label {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}

.fps-value {
  font-size: 32px;
  font-weight: 700;
}

.fps-value--good { color: #10b981; }
.fps-value--warning { color: #f59e0b; }
.fps-value--danger { color: #ef4444; }

/* Debug Panel */
.debug-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 320px;
  background: #1e1e2e;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.debug-panel__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: rgba(139, 92, 246, 0.2);
  border-radius: 16px 16px 0 0;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
}

.debug-panel__close {
  margin-left: auto;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 18px;
}

.debug-panel__content {
  padding: 14px 18px;
}

.debug-item {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.debug-item:last-child { border-bottom: none; }

.debug-label {
  font-size: 12px;
  color: #9ca3af;
  min-width: 80px;
}

.debug-value {
  font-size: 12px;
  color: #e5e7eb;
  font-family: monospace;
}

.debug-value--truncate {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Responsive */
@media (max-width: 1200px) {
  .tools-grid {
    grid-template-columns: 1fr;
  }

  .logs-card {
    grid-column: span 1;
  }

  .vitals-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .dev-header {
    flex-direction: column;
  }

  .dev-header__actions {
    width: 100%;
    justify-content: space-between;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .api-method-url {
    flex-wrap: wrap;
  }

  .api-method {
    width: 100%;
  }

  .api-url {
    flex: 1 1 100%;
  }
}
</style>
