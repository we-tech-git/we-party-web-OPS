<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useCreateEventStore } from '@/stores/createEvent'
  import EventCategorySelector from './EventCategorySelector.vue'
  import EventImageUploader from './EventImageUploader.vue'
  import EventInfoForm from './EventInfoForm.vue'
  import EventPrivacySettings from './EventPrivacySettings.vue'

  const { t } = useI18n()
  const store = useCreateEventStore()
  const showSuccessModal = ref(false)

  const isFormReady = computed(() => {
    return !!(store.title && store.description && store.startDate && store.startTime && store.city)
  })

  const progressPercent = computed(() => {
    let filled = 0
    const fields = ['title', 'description', 'startDate', 'startTime', 'endDate', 'endTime', 'city', 'state', 'district', 'street', 'latitude', 'longitude', 'photo']
    for (const field of fields) {
      if (store[field as keyof typeof store]) filled++
    }
    return Math.round((filled / fields.length) * 100)
  })

  function handleImageChange (file: File | null) {
    store.photo = file
  }

  async function handleSubmit () {
    const success = await store.submitEvent()
    if (success) {
      showSuccessModal.value = true
    }
  }

  function closeSuccessModal () {
    showSuccessModal.value = false
    store.resetForm()
  }
</script>

<template>
  <section class="new-event">
    <!-- Progress Indicator -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
    </div>

    <transition appear name="fade-slide">
      <EventImageUploader @change="handleImageChange" />
    </transition>

    <transition appear name="fade-slide">
      <div class="form-grid">
        <EventInfoForm />
        <EventPrivacySettings />
      </div>
    </transition>

    <transition appear name="fade-slide">
      <EventCategorySelector />
    </transition>

    <div class="submit-row">
      <transition mode="out-in" name="scale">
        <button
          v-if="!store.isLoading"
          class="submit-button"
          :class="{ 'submit-button--ready': isFormReady }"
          :disabled="!isFormReady"
          type="button"
          @click="handleSubmit"
        >
          <span class="submit-button__text">{{ t('admin.newEvent.submit') }}</span>
          <span class="submit-button__icon mdi mdi-arrow-right" />
        </button>
        <button v-else class="submit-button submit-button--loading" disabled type="button">
          <span class="loading-spinner" />
          <span>Criando evento...</span>
        </button>
      </transition>
    </div>

    <!-- Success Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showSuccessModal" class="success-modal-backdrop" @click.self="closeSuccessModal">
          <div class="success-modal">
            <div class="success-icon">
              <span class="mdi mdi-check-circle" />
            </div>
            <h2 class="success-title">Evento criado!</h2>
            <p class="success-text">Seu evento foi publicado com sucesso e já está disponível para visualização.</p>
            <button class="success-btn" type="button" @click="closeSuccessModal">
              Ver meus eventos
            </button>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Error Toast -->
    <transition name="toast">
      <div v-if="store.error" class="error-toast">
        <span class="mdi mdi-alert-circle" />
        <span>{{ store.error }}</span>
        <button class="error-toast__close" type="button" @click="store.error = null">
          <span class="mdi mdi-close" />
        </button>
      </div>
    </transition>
  </section>
</template>

<style scoped>
.new-event {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin: 0 auto;
  max-width: 880px;
  width: 100%;
  position: relative;
}

/* Progress Bar */
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(171, 151, 255, 0.15);
  z-index: 1000;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 2px 2px 0;
}

.form-grid {
  display: grid;
  gap: 32px;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
}

.submit-row {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

/* Submit Button */
.submit-button {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(270deg, rgba(255, 79, 148, 0.5) 0%, rgba(249, 165, 56, 0.5) 90.5%);
  border-radius: 16px;
  border: none;
  color: #ffffff;
  cursor: not-allowed;
  font-size: 1rem;
  font-weight: 600;
  padding: 18px 48px;
  text-transform: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.submit-button--ready {
  background: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(255, 79, 148, 0.35);
}

.submit-button--ready:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 40px rgba(255, 79, 148, 0.45);
}

.submit-button--ready:hover .submit-button__icon {
  transform: translateX(4px);
}

.submit-button--ready:active {
  transform: translateY(-1px) scale(1);
}

.submit-button__icon {
  font-size: 20px;
  transition: transform 0.3s ease;
}

.submit-button--loading {
  background: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
  cursor: wait;
  padding: 18px 56px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Success Modal */
.success-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.success-modal {
  background: white;
  border-radius: 24px;
  padding: 48px;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #3eb489 0%, #2dd4bf 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: white;
  animation: successPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes successPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-title {
  font-size: 24px;
  font-weight: 700;
  color: #2d2d3a;
  margin: 0 0 12px;
}

.success-text {
  font-size: 15px;
  color: #6b6b7b;
  line-height: 1.6;
  margin: 0 0 32px;
}

.success-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
  border: none;
  border-radius: 14px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.success-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 79, 148, 0.35);
}

/* Error Toast */
.error-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 14px;
  color: #dc2626;
  font-weight: 500;
  box-shadow: 0 8px 32px rgba(220, 38, 38, 0.2);
  z-index: 9999;
}

.error-toast__close {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  padding: 4px;
  display: flex;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.error-toast__close:hover {
  opacity: 1;
}

/* Transitions */
.fade-slide-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .success-modal,
.modal-leave-to .success-modal {
  transform: scale(0.9) translateY(20px);
}

.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

@media (max-width: 960px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
