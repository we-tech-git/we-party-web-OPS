<route lang="yaml">
meta:
  layout: admin
</route>

<template>
  <section class="new-event">
    <EventImageUploader @change="handleImageChange" />

    <div class="form-grid">
      <EventInfoForm />
      <EventPrivacySettings />
    </div>

    <EventCategorySelector />

    <div class="submit-row">
      <button class="submit-button" type="button">{{ t('admin.newEvent.submit') }}</button>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import EventCategorySelector from '@/components/admin/EventCategorySelector.vue'
  import EventImageUploader from '@/components/admin/EventImageUploader.vue'
  import EventInfoForm from '@/components/admin/EventInfoForm.vue'
  import EventPrivacySettings from '@/components/admin/EventPrivacySettings.vue'

  const { t } = useI18n()
  const heroImageFile = ref<File | null>(null)

  function handleImageChange (file: File | null) {
    heroImageFile.value = file
  }
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
  border: none;
  color: #ffffff !important;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  padding: 16px 56px;
  text-transform: none;
}

@media (max-width: 960px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
