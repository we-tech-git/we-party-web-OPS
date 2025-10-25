<route lang="yaml">
meta:
  layout: admin
</route>

<template>
  <section class="home-card">
    <header class="home-hero">
      <img
        :alt="t('admin.home.heroAlt')"
        class="hero-image"
        src="https://images.unsplash.com/photo-1527489782872-623b5e503b07?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      >
    </header>

    <div class="home-body">
      <div class="home-chart">
        <span class="chart-placeholder">{{ t('admin.home.chartPlaceholder') }}</span>
      </div>
      <div class="home-insights">
        <article class="insight">
          <div class="insight-icon">ℹ️</div>
          <p>{{ t('admin.home.insightOne') }}</p>
        </article>
        <article class="insight">
          <div class="insight-icon">✨</div>
          <p>{{ t('admin.home.insightTwo') }}</p>
        </article>
      </div>
    </div>

    <footer class="home-actions">
      <v-btn class="action-button" color="orange">{{ t('admin.home.ctaManage') }}</v-btn>
      <v-btn class="action-button" color="orange">{{ t('admin.home.ctaBoost') }}</v-btn>
    </footer>
  </section>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
</script>

<style scoped>
.home-card {
  background: linear-gradient(180deg, #f8f7ff 0%, #f4f4f8 100%);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 32px;
}

.home-hero {
  border-radius: 20px;
  overflow: hidden;
}

.hero-image {
  display: block;
  height: 220px;
  object-fit: cover;
  width: 100%;
}

.home-body {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.home-chart {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  border: 1px solid rgba(171, 151, 255, 0.25);
  min-height: 220px;
  padding: 24px;
  position: relative;
}

.chart-placeholder {
  color: #a1a1b5;
  font-size: 14px;
  left: 24px;
  position: absolute;
  top: 24px;
}

.home-insights {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  border: 1px solid rgba(171, 151, 255, 0.25);
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
}

.insight {
  display: flex;
  gap: 16px;
  line-height: 1.4;
}

.insight-icon {
  align-items: center;
  background: rgba(146, 103, 255, 0.1);
  border-radius: 50%;
  color: #9267ff;
  display: inline-flex;
  font-size: 20px;
  height: 40px;
  justify-content: center;
  width: 40px;
}

.home-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

.action-button {
  border-radius: 12px;
  color: #ffffff !important;
  font-weight: 600;
  text-transform: none;
}

@media (max-width: 900px) {
  .home-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
