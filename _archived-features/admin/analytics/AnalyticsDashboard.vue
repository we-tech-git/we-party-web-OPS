<template>
  <div class="analytics-dashboard">
    <header class="dashboard-header">
      <div class="header-info">
        <h1 class="page-title">{{ t('admin.analytics.title') }}</h1>
        <p class="page-subtitle">{{ t('admin.analytics.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <select v-model="selectedPeriod" class="period-select">
          <option value="7d">{{ t('admin.analytics.last7days') }}</option>
          <option value="30d">{{ t('admin.analytics.last30days') }}</option>
          <option value="90d">{{ t('admin.analytics.last90days') }}</option>
        </select>
        <button class="export-btn" type="button" @click="exportData">
          <span class="mdi mdi-download" />
          {{ t('admin.analytics.export') }}
        </button>
      </div>
    </header>

    <!-- Funnel Section -->
    <section class="funnel-section">
      <h2 class="section-title">{{ t('admin.analytics.funnelTitle') }}</h2>
      <div class="funnel-container">
        <div
          v-for="(step, index) in funnelSteps"
          :key="step.key"
          class="funnel-step"
          :style="{ '--step-delay': `${index * 0.1}s`, '--step-width': `${step.percent}%` }"
        >
          <div class="funnel-bar">
            <div class="funnel-fill" :class="`funnel-fill--${step.key}`" />
          </div>
          <div class="funnel-info">
            <span class="funnel-icon mdi" :class="step.icon" />
            <div class="funnel-data">
              <span class="funnel-value">{{ formatNumber(step.value) }}</span>
              <span class="funnel-label">{{ step.label }}</span>
            </div>
            <span class="funnel-percent">{{ step.percent }}%</span>
          </div>
          <div v-if="index < funnelSteps.length - 1" class="funnel-arrow">
            <span class="mdi mdi-chevron-down" />
            <span class="conversion-rate">{{ getConversionRate(index) }}%</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Charts Grid -->
    <div class="charts-grid">
      <!-- Heatmap -->
      <section class="chart-card heatmap-card">
        <h3 class="card-title">
          <span class="mdi mdi-clock-outline" />
          {{ t('admin.analytics.heatmapTitle') }}
        </h3>
        <div class="heatmap-container">
          <div class="heatmap-y-labels">
            <span v-for="day in weekDays" :key="day">{{ day }}</span>
          </div>
          <div class="heatmap-grid">
            <div v-for="(row, rowIndex) in heatmapData" :key="rowIndex" class="heatmap-row">
              <div
                v-for="(cell, colIndex) in row"
                :key="colIndex"
                class="heatmap-cell"
                :style="{ '--intensity': cell / maxHeatValue }"
                :title="`${weekDays[rowIndex]} ${colIndex}h: ${cell} interações`"
              />
            </div>
          </div>
          <div class="heatmap-x-labels">
            <span v-for="hour in [0, 6, 12, 18, 23]" :key="hour">{{ hour }}h</span>
          </div>
        </div>
        <div class="heatmap-legend">
          <span>{{ t('admin.analytics.less') }}</span>
          <div class="legend-gradient" />
          <span>{{ t('admin.analytics.more') }}</span>
        </div>
      </section>

      <!-- Demographics -->
      <section class="chart-card demographics-card">
        <h3 class="card-title">
          <span class="mdi mdi-account-group" />
          {{ t('admin.analytics.demographicsTitle') }}
        </h3>
        <div class="demographics-content">
          <!-- Age Distribution -->
          <div class="demo-section">
            <h4 class="demo-subtitle">{{ t('admin.analytics.ageDistribution') }}</h4>
            <div class="age-bars">
              <div v-for="age in ageData" :key="age.range" class="age-bar-item">
                <span class="age-label">{{ age.range }}</span>
                <div class="age-bar">
                  <div class="age-fill" :style="{ width: `${age.percent}%` }" />
                </div>
                <span class="age-percent">{{ age.percent }}%</span>
              </div>
            </div>
          </div>

          <!-- Gender Distribution -->
          <div class="demo-section">
            <h4 class="demo-subtitle">{{ t('admin.analytics.genderDistribution') }}</h4>
            <div class="gender-chart">
              <div class="gender-donut">
                <svg viewBox="0 0 100 100">
                  <circle
                    v-for="(gender, index) in genderData"
                    :key="gender.type"
                    class="donut-segment"
                    :class="`donut-segment--${gender.type}`"
                    cx="50"
                    cy="50"
                    fill="none"
                    r="40"
                    :stroke-dasharray="`${gender.percent * 2.51} ${251 - gender.percent * 2.51}`"
                    :stroke-dashoffset="getDonutOffset(index)"
                    stroke-width="12"
                  />
                </svg>
              </div>
              <div class="gender-legend">
                <div v-for="gender in genderData" :key="gender.type" class="gender-item">
                  <span class="gender-color" :class="`gender-color--${gender.type}`" />
                  <span class="gender-label">{{ gender.label }}</span>
                  <span class="gender-percent">{{ gender.percent }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Location Map -->
      <section class="chart-card location-card">
        <h3 class="card-title">
          <span class="mdi mdi-map-marker" />
          {{ t('admin.analytics.locationTitle') }}
        </h3>
        <div class="location-list">
          <div v-for="loc in locationData" :key="loc.city" class="location-item">
            <div class="location-info">
              <span class="location-city">{{ loc.city }}</span>
              <span class="location-state">{{ loc.state }}</span>
            </div>
            <div class="location-bar-container">
              <div class="location-bar" :style="{ width: `${loc.percent}%` }" />
            </div>
            <span class="location-value">{{ loc.count }}</span>
          </div>
        </div>
      </section>

      <!-- Event Comparison -->
      <section class="chart-card comparison-card">
        <h3 class="card-title">
          <span class="mdi mdi-chart-bar" />
          {{ t('admin.analytics.comparisonTitle') }}
        </h3>
        <div class="comparison-chart">
          <div v-for="event in eventComparison" :key="event.id" class="comparison-item">
            <img :alt="event.name" class="comparison-image" :src="event.image">
            <div class="comparison-info">
              <span class="comparison-name">{{ event.name }}</span>
              <span class="comparison-date">{{ event.date }}</span>
            </div>
            <div class="comparison-metrics">
              <div class="metric">
                <span class="mdi mdi-eye" />
                <span>{{ formatNumber(event.views) }}</span>
              </div>
              <div class="metric">
                <span class="mdi mdi-account-check" />
                <span>{{ formatNumber(event.confirmed) }}</span>
              </div>
              <div class="metric">
                <span class="mdi mdi-check-circle" />
                <span>{{ formatNumber(event.checkins) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const selectedPeriod = ref('30d')

  // Mock data - replace with real API
  const funnelSteps = ref([
    { key: 'views', icon: 'mdi-eye', label: 'Visualizações', value: 15_420, percent: 100 },
    { key: 'interest', icon: 'mdi-heart', label: 'Interessados', value: 3856, percent: 25 },
    { key: 'confirmed', icon: 'mdi-check-circle', label: 'Confirmados', value: 1542, percent: 10 },
    { key: 'checkin', icon: 'mdi-location-enter', label: 'Check-ins', value: 1234, percent: 8 },
  ])

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const heatmapData = ref([
    [2, 1, 0, 0, 0, 1, 3, 5, 8, 12, 15, 18, 22, 25, 20, 18, 22, 28, 35, 42, 38, 30, 15, 8],
    [1, 0, 0, 0, 0, 1, 2, 8, 15, 22, 28, 32, 35, 30, 25, 22, 28, 35, 45, 52, 48, 35, 18, 5],
    [2, 1, 0, 0, 0, 1, 3, 10, 18, 25, 30, 35, 38, 32, 28, 25, 32, 40, 48, 55, 50, 38, 20, 8],
    [1, 0, 0, 0, 0, 1, 2, 8, 15, 22, 28, 32, 35, 30, 25, 22, 28, 35, 45, 52, 48, 35, 18, 5],
    [2, 1, 0, 0, 0, 2, 5, 12, 20, 28, 35, 40, 42, 38, 32, 30, 38, 48, 58, 65, 60, 45, 25, 10],
    [5, 3, 2, 1, 1, 3, 8, 15, 25, 35, 45, 55, 60, 55, 48, 45, 55, 68, 80, 95, 88, 70, 45, 25],
    [8, 5, 3, 2, 2, 4, 10, 18, 28, 38, 48, 58, 65, 60, 52, 48, 58, 72, 85, 100, 92, 75, 50, 30],
  ])

  const maxHeatValue = computed(() => {
    return Math.max(...heatmapData.value.flat())
  })

  const ageData = ref([
    { range: '18-24', percent: 35 },
    { range: '25-34', percent: 42 },
    { range: '35-44', percent: 15 },
    { range: '45+', percent: 8 },
  ])

  const genderData = ref([
    { type: 'male', label: 'Masculino', percent: 55 },
    { type: 'female', label: 'Feminino', percent: 42 },
    { type: 'other', label: 'Outro', percent: 3 },
  ])

  const locationData = ref([
    { city: 'São Paulo', state: 'SP', count: 542, percent: 35 },
    { city: 'Rio de Janeiro', state: 'RJ', count: 328, percent: 21 },
    { city: 'Belo Horizonte', state: 'MG', count: 186, percent: 12 },
    { city: 'Curitiba', state: 'PR', count: 124, percent: 8 },
    { city: 'Porto Alegre', state: 'RS', count: 98, percent: 6 },
  ])

  const eventComparison = ref([
    {
      id: 1,
      name: 'Réveillon 2026',
      date: '31/12/2025',
      image: 'https://images.unsplash.com/photo-1527489782872-623b5e503b07?w=100&h=100&fit=crop',
      views: 15_420,
      confirmed: 1542,
      checkins: 1234,
    },
    {
      id: 2,
      name: 'Festa Tropical',
      date: '15/11/2025',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop',
      views: 8560,
      confirmed: 856,
      checkins: 742,
    },
    {
      id: 3,
      name: 'Halloween Night',
      date: '31/10/2025',
      image: 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=100&h=100&fit=crop',
      views: 6230,
      confirmed: 623,
      checkins: 589,
    },
  ])

  function formatNumber (num: number): string {
    return num.toLocaleString('pt-BR')
  }

  function getConversionRate (index: number): string {
    const current = funnelSteps.value[index]?.value ?? 0
    const next = funnelSteps.value[index + 1]?.value ?? 0
    if (current === 0) return '0'
    return ((next / current) * 100).toFixed(1)
  }

  function getDonutOffset (index: number): number {
    let offset = 63
    for (let i = 0; i < index; i++) {
      const item = genderData.value[i]
      if (item) offset -= item.percent * 2.51
    }
    return offset
  }

  function exportData () {
    // TODO: Implement export functionality
    console.log('Exporting analytics data...')
  }
</script>

<style scoped>
.analytics-dashboard {
    display: flex;
    flex-direction: column;
    gap: 32px;
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

.dashboard-header {
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
}

.period-select {
    padding: 10px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: white;
    font-size: 14px;
    color: #374151;
    cursor: pointer;
}

.export-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #b46cff 0%, #8b5cf6 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.export-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(180, 108, 255, 0.3);
}

/* Funnel Section */
.funnel-section {
    background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
    border-radius: 20px;
    border: 1px solid rgba(171, 151, 255, 0.15);
    padding: 28px;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    color: #2d2d3a;
    margin: 0 0 24px;
}

.funnel-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.funnel-step {
    animation: slideInLeft 0.5s ease-out backwards;
    animation-delay: var(--step-delay);
}

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.funnel-bar {
    height: 40px;
    background: #f3f4f6;
    border-radius: 10px;
    overflow: hidden;
}

.funnel-fill {
    height: 100%;
    width: var(--step-width);
    border-radius: 10px;
    transition: width 1s ease-out;
}

.funnel-fill--views {
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.funnel-fill--interest {
    background: linear-gradient(90deg, #f472b6, #ec4899);
}

.funnel-fill--confirmed {
    background: linear-gradient(90deg, #34d399, #10b981);
}

.funnel-fill--checkin {
    background: linear-gradient(90deg, #fbbf24, #f59e0b);
}

.funnel-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
}

.funnel-icon {
    font-size: 24px;
    color: #6b7280;
}

.funnel-data {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.funnel-value {
    font-size: 20px;
    font-weight: 700;
    color: #2d2d3a;
}

.funnel-label {
    font-size: 13px;
    color: #6b7280;
}

.funnel-percent {
    font-size: 16px;
    font-weight: 600;
    color: #8b5cf6;
}

.funnel-arrow {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0 12px 36px;
    color: #9ca3af;
    font-size: 14px;
}

.conversion-rate {
    background: #f3f4f6;
    padding: 2px 8px;
    border-radius: 6px;
    font-weight: 600;
    color: #6b7280;
}

/* Charts Grid */
.charts-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
}

.chart-card {
    background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
    border-radius: 20px;
    border: 1px solid rgba(171, 151, 255, 0.15);
    padding: 24px;
    animation: fadeIn 0.5s ease-out backwards;
}

.card-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 700;
    color: #2d2d3a;
    margin: 0 0 20px;
}

.card-title .mdi {
    font-size: 22px;
    color: #8b5cf6;
}

/* Heatmap */
.heatmap-container {
    display: grid;
    grid-template-columns: 40px 1fr;
    grid-template-rows: 1fr 20px;
    gap: 8px;
}

.heatmap-y-labels {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    font-size: 11px;
    color: #6b7280;
}

.heatmap-grid {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.heatmap-row {
    display: flex;
    gap: 3px;
}

.heatmap-cell {
    flex: 1;
    aspect-ratio: 1;
    background: rgba(139, 92, 246, calc(var(--intensity) * 0.8 + 0.1));
    border-radius: 3px;
    transition: transform 0.2s ease;
    cursor: pointer;
}

.heatmap-cell:hover {
    transform: scale(1.3);
    z-index: 1;
}

.heatmap-x-labels {
    grid-column: 2;
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #6b7280;
    padding: 0 4px;
}

.heatmap-legend {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
    font-size: 12px;
    color: #6b7280;
}

.legend-gradient {
    width: 100px;
    height: 12px;
    border-radius: 6px;
    background: linear-gradient(90deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.9));
}

/* Demographics */
.demographics-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.demo-subtitle {
    font-size: 14px;
    font-weight: 600;
    color: #4b5563;
    margin: 0 0 12px;
}

.age-bars {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.age-bar-item {
    display: grid;
    grid-template-columns: 50px 1fr 40px;
    align-items: center;
    gap: 12px;
}

.age-label {
    font-size: 13px;
    color: #6b7280;
}

.age-bar {
    height: 10px;
    background: #f3f4f6;
    border-radius: 5px;
    overflow: hidden;
}

.age-fill {
    height: 100%;
    background: linear-gradient(90deg, #f472b6, #ec4899);
    border-radius: 5px;
    transition: width 0.8s ease-out;
}

.age-percent {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    text-align: right;
}

.gender-chart {
    display: flex;
    align-items: center;
    gap: 24px;
}

.gender-donut {
    width: 100px;
    height: 100px;
}

.gender-donut svg {
    transform: rotate(-90deg);
}

.donut-segment {
    transition: stroke-dasharray 0.8s ease-out;
}

.donut-segment--male {
    stroke: #3b82f6;
}

.donut-segment--female {
    stroke: #ec4899;
}

.donut-segment--other {
    stroke: #8b5cf6;
}

.gender-legend {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.gender-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.gender-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.gender-color--male {
    background: #3b82f6;
}

.gender-color--female {
    background: #ec4899;
}

.gender-color--other {
    background: #8b5cf6;
}

.gender-label {
    flex: 1;
    font-size: 13px;
    color: #4b5563;
}

.gender-percent {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
}

/* Location */
.location-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.location-item {
    display: grid;
    grid-template-columns: 120px 1fr 50px;
    align-items: center;
    gap: 12px;
}

.location-info {
    display: flex;
    flex-direction: column;
}

.location-city {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.location-state {
    font-size: 12px;
    color: #9ca3af;
}

.location-bar-container {
    height: 8px;
    background: #f3f4f6;
    border-radius: 4px;
    overflow: hidden;
}

.location-bar {
    height: 100%;
    background: linear-gradient(90deg, #fbbf24, #f59e0b);
    border-radius: 4px;
    transition: width 0.8s ease-out;
}

.location-value {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    text-align: right;
}

/* Comparison */
.comparison-chart {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.comparison-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px;
    background: #f9fafb;
    border-radius: 14px;
    transition: all 0.3s ease;
}

.comparison-item:hover {
    background: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.comparison-image {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    object-fit: cover;
}

.comparison-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.comparison-name {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.comparison-date {
    font-size: 12px;
    color: #9ca3af;
}

.comparison-metrics {
    display: flex;
    gap: 20px;
}

.metric {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #6b7280;
}

.metric .mdi {
    font-size: 16px;
    color: #8b5cf6;
}

@media (max-width: 1024px) {
    .charts-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .dashboard-header {
        flex-direction: column;
    }

    .header-actions {
        width: 100%;
    }

    .period-select,
    .export-btn {
        flex: 1;
    }
}
</style>
