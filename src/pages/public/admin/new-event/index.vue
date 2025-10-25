<route lang="yaml">
meta:
  layout: admin
</route>

<template>
  <section class="new-event">
    <EventImageUploader />

    <div class="form-grid">
      <EventInfoForm />
      <EventPrivacySettings />
    </div>

    <EventCategorySelector />

    <div class="submit-row">
      <v-btn class="submit-button" size="large">{{ t('admin.newEvent.submit') }}</v-btn>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import EventCategorySelector from '@/components/admin/EventCategorySelector.vue'
import EventImageUploader from '@/components/admin/EventImageUploader.vue'
import EventInfoForm from '@/components/admin/EventInfoForm.vue'
import EventPrivacySettings from '@/components/admin/EventPrivacySettings.vue'

const { t } = useI18n()
</script>

<style scoped>
.new-event {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin: 0 auto;
  max-width: 880px;
  width: 100%;
}

.form-grid {
  display: grid;
  gap: 32px;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
}

.submit-row {
  display: flex;
  justify-content: center;
}

.submit-button {
  background: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
  border-radius: 16px;
  color: #ffffff !important;
  padding: 16px 56px;
  text-transform: none;
}

@media (max-width: 960px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
