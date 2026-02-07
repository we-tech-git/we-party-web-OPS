<template>
  <section class="requests-section">
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center">
        <v-icon class="mr-3 text-grey-darken-1" icon="mdi-tray-full" size="large" />
        <h2 class="text-h5 font-weight-bold text-high-emphasis">
          {{ t('admin.interests.queueTitle') }}
        </h2>
        <div v-if="requests.length > 0" class="count-badge ml-3">
          {{ requests.length }}
        </div>
      </div>
    </div>

    <TransitionGroup class="requests-list" name="list" tag="div">
      <div v-for="request in requests" :key="request.id" class="request-item">
        <div class="request-content">
          <!-- Interest Name (Hero) -->
          <div class="interest-info">
            <span class="label-text">{{ t('admin.interests.card.label') }}</span>
            <h3 class="interest-name">{{ request.name }}</h3>
          </div>

          <!-- User Info -->
          <div class="user-info">
            <div class="avatar-wrapper">
              {{ getInitials(request.requestedBy) }}
            </div>
            <div class="user-details">
              <span class="user-name">{{ request.requestedBy }}</span>
              <span class="request-date">
                {{ request.date }} às {{ request.time }}
              </span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="request-actions">
          <button class="action-btn reject" :title="t('admin.interests.card.reject')"
            @click="rejectRequest(request.id)">
            <v-icon icon="mdi-close" size="20" />
          </button>

          <button class="action-btn approve" :title="t('admin.interests.card.approve')"
            @click="approveRequest(request.id)">
            <v-icon icon="mdi-check" size="20" />
          </button>
        </div>
      </div>
    </TransitionGroup>

    <div v-if="requests.length === 0" class="empty-state">
      <div class="empty-icon-wrapper">
        <v-icon color="success" icon="mdi-check-circle-outline" size="48" />
      </div>
      <h3 class="empty-title">{{ t('admin.interests.queueEmptyTitle') }}</h3>
      <p class="empty-desc">{{ t('admin.interests.queueEmptyDesc') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const requests = ref([
  {
    id: 1,
    name: 'AMAPIANO',
    requestedBy: 'João Silva',
    date: '12/12/2025',
    time: '14:30',
  },
  {
    id: 2,
    name: 'K-POP',
    requestedBy: 'Ana Costa',
    date: '12/12/2025',
    time: '15:45',
  },
  {
    id: 3,
    name: 'JAZZ FUSION',
    requestedBy: 'Carlos Oliveira',
    date: '13/12/2025',
    time: '09:15',
  },
])

function approveRequest(id: number) {
  requests.value = requests.value.filter(r => r.id !== id)
}

function rejectRequest(id: number) {
  requests.value = requests.value.filter(r => r.id !== id)
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
</script>

<style scoped>
.requests-section {
  margin-top: 48px;
}

.count-badge {
  background: #ff4f94;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.request-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.request-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06), 0 12px 32px rgba(0, 0, 0, 0.08);
}

.request-content {
  display: flex;
  align-items: center;
  gap: 48px;
  flex: 1;
}

.interest-info {
  min-width: 200px;
}

.label-text {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
  font-weight: 600;
  margin-bottom: 4px;
}

.interest-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1f2937;
  letter-spacing: -0.01em;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #4b5563;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  line-height: 1.2;
}

.request-date {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-top: 2px;
}

.request-actions {
  display: flex;
  gap: 12px;
  padding-left: 24px;
  border-left: 1px solid #f3f4f6;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.reject {
  background: #fef2f2;
  color: #ef4444;
}

.action-btn.reject:hover {
  background: #fee2e2;
  transform: translateY(-1px);
}

.action-btn.approve {
  background: #f0fdf4;
  color: #22c55e;
}

.action-btn.approve:hover {
  background: #dcfce7;
  transform: translateY(-1px);
}

.empty-state {
  text-align: center;
  padding: 64px 24px;
  background: #ffffff;
  border-radius: 24px;
  border: 2px dashed #e5e7eb;
  margin-top: 24px;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  background: #f0fdf4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.empty-desc {
  color: #6b7280;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .request-item {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  .request-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .request-actions {
    border-left: none;
    border-top: 1px solid #f3f4f6;
    padding-left: 0;
    padding-top: 20px;
    justify-content: flex-end;
  }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
