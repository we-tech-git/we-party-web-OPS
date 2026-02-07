<template>
  <div class="participants-manager">
    <header class="manager-header">
      <div class="header-info">
        <h1 class="page-title">{{ t('admin.participants.title') }}</h1>
        <p class="page-subtitle">{{ t('admin.participants.subtitle') }}</p>
      </div>
      <div class="header-stats">
        <div class="stat-badge stat-badge--confirmed">
          <span class="mdi mdi-account-check" />
          <span class="stat-value">{{ confirmedCount }}</span>
          <span class="stat-label">{{ t('admin.participants.confirmed') }}</span>
        </div>
        <div class="stat-badge stat-badge--checkin">
          <span class="mdi mdi-location-enter" />
          <span class="stat-value">{{ checkinCount }}</span>
          <span class="stat-label">{{ t('admin.participants.checkedIn') }}</span>
        </div>
        <div class="stat-badge stat-badge--waitlist">
          <span class="mdi mdi-clock-outline" />
          <span class="stat-value">{{ waitlistCount }}</span>
          <span class="stat-label">{{ t('admin.participants.waitlist') }}</span>
        </div>
      </div>
    </header>

    <!-- Tabs -->
    <div class="tabs-container">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === tab.key }"
        type="button"
        @click="activeTab = tab.key as 'confirmed' | 'vip' | 'waitlist'"
      >
        <span class="mdi" :class="tab.icon" />
        {{ tab.label }}
        <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Search & Actions -->
    <div class="actions-bar">
      <div class="search-box">
        <span class="mdi mdi-magnify" />
        <input v-model="searchQuery" :placeholder="t('admin.participants.searchPlaceholder')" type="search">
      </div>
      <div class="action-buttons">
        <button class="action-btn action-btn--secondary" type="button" @click="exportList">
          <span class="mdi mdi-download" />
          {{ t('admin.participants.export') }}
        </button>
        <button class="action-btn action-btn--primary" type="button" @click="openQRScanner">
          <span class="mdi mdi-qrcode-scan" />
          {{ t('admin.participants.scanQR') }}
        </button>
      </div>
    </div>

    <!-- Confirmed List -->
    <section v-if="activeTab === 'confirmed'" class="list-section">
      <div class="list-header">
        <span class="list-col">{{ t('admin.participants.participant') }}</span>
        <span class="list-col">{{ t('admin.participants.status') }}</span>
        <span class="list-col">{{ t('admin.participants.confirmedAt') }}</span>
        <span class="list-col">{{ t('admin.participants.actions') }}</span>
      </div>
      <TransitionGroup class="list-body" name="list" tag="div">
        <div
          v-for="participant in filteredParticipants"
          :key="participant.id"
          class="list-item"
          :class="{ 'list-item--checked': participant.checkedIn }"
        >
          <div class="participant-info">
            <img :alt="participant.name" class="participant-avatar" :src="participant.avatar">
            <div class="participant-details">
              <span class="participant-name">{{ participant.name }}</span>
              <span class="participant-email">{{ participant.email }}</span>
            </div>
            <span v-if="participant.isVip" class="vip-badge">VIP</span>
          </div>
          <div class="participant-status">
            <span
              class="status-badge"
              :class="`status-badge--${participant.checkedIn ? 'checked' : 'pending'}`"
            >
              <span
                class="mdi"
                :class="participant.checkedIn ? 'mdi-check-circle' : 'mdi-clock-outline'"
              />
              {{ participant.checkedIn ? t('admin.participants.statusChecked') :
                t('admin.participants.statusPending') }}
            </span>
          </div>
          <div class="participant-date">
            {{ formatDate(participant.confirmedAt) }}
          </div>
          <div class="participant-actions">
            <button
              v-if="!participant.checkedIn"
              class="mini-btn mini-btn--checkin"
              :title="t('admin.participants.doCheckin')"
              type="button"
              @click="doCheckin(participant.id)"
            >
              <span class="mdi mdi-check" />
            </button>
            <button
              class="mini-btn"
              :title="t('admin.participants.toggleVip')"
              type="button"
              @click="toggleVip(participant.id)"
            >
              <span class="mdi" :class="participant.isVip ? 'mdi-star' : 'mdi-star-outline'" />
            </button>
            <button
              class="mini-btn mini-btn--danger"
              :title="t('admin.participants.remove')"
              type="button"
              @click="removeParticipant(participant.id)"
            >
              <span class="mdi mdi-close" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </section>

    <!-- VIP List -->
    <section v-if="activeTab === 'vip'" class="list-section vip-section">
      <div class="vip-grid">
        <div v-for="vip in vipList" :key="vip.id" class="vip-card">
          <img :alt="vip.name" class="vip-avatar" :src="vip.avatar">
          <span class="vip-name">{{ vip.name }}</span>
          <span class="vip-note">{{ vip.note || t('admin.participants.noNote') }}</span>
          <div class="vip-actions">
            <button class="vip-action-btn" type="button" @click="editVipNote(vip.id)">
              <span class="mdi mdi-pencil" />
            </button>
            <button class="vip-action-btn vip-action-btn--remove" type="button" @click="toggleVip(vip.id)">
              <span class="mdi mdi-star-off" />
            </button>
          </div>
        </div>
        <button class="add-vip-card" type="button" @click="openAddVipModal">
          <span class="mdi mdi-plus" />
          <span>{{ t('admin.participants.addVip') }}</span>
        </button>
      </div>
    </section>

    <!-- Waitlist -->
    <section v-if="activeTab === 'waitlist'" class="list-section">
      <div v-if="waitlist.length === 0" class="empty-state">
        <span class="mdi mdi-account-clock" />
        <h3>{{ t('admin.participants.waitlistEmpty') }}</h3>
        <p>{{ t('admin.participants.waitlistEmptyDesc') }}</p>
      </div>
      <div v-else class="waitlist-container">
        <div v-for="(person, index) in waitlist" :key="person.id" class="waitlist-item">
          <span class="waitlist-position">{{ index + 1 }}º</span>
          <img :alt="person.name" class="waitlist-avatar" :src="person.avatar">
          <div class="waitlist-info">
            <span class="waitlist-name">{{ person.name }}</span>
            <span class="waitlist-date">{{ t('admin.participants.since') }} {{ formatDate(person.joinedAt)
            }}</span>
          </div>
          <button class="approve-btn" type="button" @click="approveFromWaitlist(person.id)">
            <span class="mdi mdi-check" />
            {{ t('admin.participants.approve') }}
          </button>
        </div>
      </div>
    </section>

    <!-- QR Scanner Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showQRScanner" class="modal-backdrop" @click.self="closeQRScanner">
          <div class="qr-modal">
            <header class="modal-header">
              <h2>{{ t('admin.participants.qrScannerTitle') }}</h2>
              <button class="close-btn" type="button" @click="closeQRScanner">
                <span class="mdi mdi-close" />
              </button>
            </header>
            <div class="qr-scanner-area">
              <div class="scanner-frame">
                <div class="scanner-line" />
              </div>
              <p class="scanner-hint">{{ t('admin.participants.qrScannerHint') }}</p>
            </div>
            <div class="manual-input">
              <span>{{ t('admin.participants.orManual') }}</span>
              <input
                v-model="manualCode"
                :placeholder="t('admin.participants.codeplaceholder')"
                type="text"
                @keyup.enter="processManualCode"
              >
              <button class="process-btn" type="button" @click="processManualCode">
                <span class="mdi mdi-check" />
              </button>
            </div>

            <!-- Success Animation -->
            <Transition name="success">
              <div v-if="checkinSuccess" class="checkin-success">
                <div class="success-icon">
                  <span class="mdi mdi-check-circle" />
                </div>
                <h3>Check-in realizado!</h3>
                <p>{{ lastCheckedIn?.name }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  interface Participant {
    id: number
    name: string
    email: string
    avatar: string
    isVip: boolean
    checkedIn: boolean
    confirmedAt: string
    note?: string
  }

  interface WaitlistPerson {
    id: number
    name: string
    avatar: string
    joinedAt: string
  }

  const activeTab = ref<'confirmed' | 'vip' | 'waitlist'>('confirmed')
  const searchQuery = ref('')
  const showQRScanner = ref(false)
  const manualCode = ref('')
  const checkinSuccess = ref(false)
  const lastCheckedIn = ref<Participant | null>(null)

  // Mock data
  const participants = ref<Participant[]>([
    { id: 1, name: 'Ana Silva', email: 'ana@email.com', avatar: 'https://i.pravatar.cc/100?img=1', isVip: true, checkedIn: true, confirmedAt: '2026-01-28T14:30:00' },
    { id: 2, name: 'Bruno Costa', email: 'bruno@email.com', avatar: 'https://i.pravatar.cc/100?img=2', isVip: false, checkedIn: true, confirmedAt: '2026-01-27T10:15:00' },
    { id: 3, name: 'Carla Mendes', email: 'carla@email.com', avatar: 'https://i.pravatar.cc/100?img=3', isVip: true, checkedIn: false, confirmedAt: '2026-01-26T18:45:00' },
    { id: 4, name: 'Diego Ferreira', email: 'diego@email.com', avatar: 'https://i.pravatar.cc/100?img=4', isVip: false, checkedIn: false, confirmedAt: '2026-01-25T09:20:00' },
    { id: 5, name: 'Elena Rocha', email: 'elena@email.com', avatar: 'https://i.pravatar.cc/100?img=5', isVip: false, checkedIn: true, confirmedAt: '2026-01-24T16:00:00' },
    { id: 6, name: 'Felipe Santos', email: 'felipe@email.com', avatar: 'https://i.pravatar.cc/100?img=6', isVip: false, checkedIn: false, confirmedAt: '2026-01-23T11:30:00' },
  ])

  const waitlist = ref<WaitlistPerson[]>([
    { id: 101, name: 'Gabriel Lima', avatar: 'https://i.pravatar.cc/100?img=11', joinedAt: '2026-01-30T08:00:00' },
    { id: 102, name: 'Helena Souza', avatar: 'https://i.pravatar.cc/100?img=12', joinedAt: '2026-01-29T15:30:00' },
  ])

  const tabs = computed(() => [
    { key: 'confirmed', label: t('admin.participants.tabConfirmed'), icon: 'mdi-account-check', count: confirmedCount.value },
    { key: 'vip', label: t('admin.participants.tabVip'), icon: 'mdi-star', count: vipList.value.length },
    { key: 'waitlist', label: t('admin.participants.tabWaitlist'), icon: 'mdi-clock-outline', count: waitlistCount.value },
  ])

  const confirmedCount = computed(() => participants.value.length)
  const checkinCount = computed(() => participants.value.filter(p => p.checkedIn).length)
  const waitlistCount = computed(() => waitlist.value.length)
  const vipList = computed(() => participants.value.filter(p => p.isVip))

  const filteredParticipants = computed(() => {
    if (!searchQuery.value) return participants.value
    const query = searchQuery.value.toLowerCase()
    return participants.value.filter(p =>
      p.name.toLowerCase().includes(query)
      || p.email.toLowerCase().includes(query),
    )
  })

  function formatDate (dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function doCheckin (id: number) {
    const participant = participants.value.find(p => p.id === id)
    if (participant) {
      participant.checkedIn = true
      lastCheckedIn.value = participant
      checkinSuccess.value = true
      setTimeout(() => {
        checkinSuccess.value = false
      }, 2000)
    }
  }

  function toggleVip (id: number) {
    const participant = participants.value.find(p => p.id === id)
    if (participant) {
      participant.isVip = !participant.isVip
    }
  }

  function removeParticipant (id: number) {
    participants.value = participants.value.filter(p => p.id !== id)
  }

  function approveFromWaitlist (id: number) {
    const person = waitlist.value.find(p => p.id === id)
    if (person) {
      participants.value.push({
        id: person.id,
        name: person.name,
        email: `${person.name.toLowerCase().replace(' ', '.')}@email.com`,
        avatar: person.avatar,
        isVip: false,
        checkedIn: false,
        confirmedAt: new Date().toISOString(),
      })
      waitlist.value = waitlist.value.filter(p => p.id !== id)
    }
  }

  function openQRScanner () {
    showQRScanner.value = true
  }

  function closeQRScanner () {
    showQRScanner.value = false
    manualCode.value = ''
  }

  function processManualCode () {
    // Simulate finding participant by code
    const randomParticipant = participants.value.find(p => !p.checkedIn)
    if (randomParticipant) {
      doCheckin(randomParticipant.id)
    }
    manualCode.value = ''
  }

  function exportList () {
    // TODO: Implement CSV export
    console.log('Exporting participant list...')
  }

  function openAddVipModal () {
    // TODO: Implement add VIP modal
    console.log('Opening add VIP modal...')
  }

  function editVipNote (id: number) {
    // TODO: Implement edit VIP note
    console.log('Editing VIP note for:', id)
  }
</script>

<style scoped>
.participants-manager {
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

.manager-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 20px;
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

.header-stats {
    display: flex;
    gap: 16px;
}

.stat-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    border-radius: 14px;
    background: #f8f8ff;
    border: 1px solid rgba(171, 151, 255, 0.2);
}

.stat-badge .mdi {
    font-size: 24px;
}

.stat-badge--confirmed .mdi {
    color: #10b981;
}

.stat-badge--checkin .mdi {
    color: #3b82f6;
}

.stat-badge--waitlist .mdi {
    color: #f59e0b;
}

.stat-value {
    font-size: 20px;
    font-weight: 700;
    color: #2d2d3a;
}

.stat-label {
    font-size: 12px;
    color: #8b8b99;
}

/* Tabs */
.tabs-container {
    display: flex;
    gap: 8px;
    padding: 8px;
    background: #f3f4f6;
    border-radius: 16px;
    width: fit-content;
}

.tab-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border: none;
    border-radius: 12px;
    background: transparent;
    color: #6b7280;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.tab-btn:hover {
    background: rgba(255, 255, 255, 0.5);
}

.tab-btn--active {
    background: white;
    color: #8b5cf6;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tab-count {
    background: #e5e7eb;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
}

.tab-btn--active .tab-count {
    background: linear-gradient(135deg, #8b5cf6, #b46cff);
    color: white;
}

/* Actions Bar */
.actions-bar {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
}

.search-box {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    flex: 1;
    max-width: 400px;
}

.search-box .mdi {
    color: #9ca3af;
    font-size: 20px;
}

.search-box input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
}

.action-buttons {
    display: flex;
    gap: 12px;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border: none;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.action-btn--secondary {
    background: white;
    border: 1px solid #e5e7eb;
    color: #374151;
}

.action-btn--secondary:hover {
    background: #f9fafb;
}

.action-btn--primary {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
}

.action-btn--primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

/* List Section */
.list-section {
    background: white;
    border-radius: 20px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
}

.list-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 120px;
    gap: 16px;
    padding: 16px 24px;
    background: #f9fafb;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.list-body {
    display: flex;
    flex-direction: column;
}

.list-item {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 120px;
    gap: 16px;
    padding: 16px 24px;
    align-items: center;
    border-bottom: 1px solid #f3f4f6;
    transition: all 0.3s ease;
}

.list-item:hover {
    background: #f9fafb;
}

.list-item--checked {
    background: rgba(16, 185, 129, 0.05);
}

.participant-info {
    display: flex;
    align-items: center;
    gap: 14px;
}

.participant-avatar {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    object-fit: cover;
}

.participant-details {
    display: flex;
    flex-direction: column;
}

.participant-name {
    font-size: 15px;
    font-weight: 600;
    color: #2d2d3a;
}

.participant-email {
    font-size: 13px;
    color: #9ca3af;
}

.vip-badge {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: white;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 700;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
}

.status-badge--checked {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
}

.status-badge--pending {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
}

.participant-date {
    font-size: 13px;
    color: #6b7280;
}

.participant-actions {
    display: flex;
    gap: 8px;
}

.mini-btn {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 10px;
    background: #f3f4f6;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.mini-btn:hover {
    background: #e5e7eb;
}

.mini-btn--checkin {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
}

.mini-btn--checkin:hover {
    transform: scale(1.1);
}

.mini-btn--danger:hover {
    background: #fee2e2;
    color: #dc2626;
}

/* VIP Section */
.vip-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    padding: 24px;
}

.vip-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 24px;
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    border-radius: 16px;
    position: relative;
    transition: all 0.3s ease;
}

.vip-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(251, 191, 36, 0.25);
}

.vip-avatar {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    border: 3px solid #f59e0b;
    object-fit: cover;
}

.vip-name {
    font-size: 15px;
    font-weight: 600;
    color: #92400e;
}

.vip-note {
    font-size: 12px;
    color: #b45309;
    text-align: center;
}

.vip-actions {
    display: flex;
    gap: 8px;
    position: absolute;
    top: 12px;
    right: 12px;
}

.vip-action-btn {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.7);
    color: #92400e;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
}

.add-vip-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px;
    background: #f9fafb;
    border: 2px dashed #e5e7eb;
    border-radius: 16px;
    color: #9ca3af;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 180px;
}

.add-vip-card:hover {
    border-color: #f59e0b;
    color: #f59e0b;
    background: #fffbeb;
}

.add-vip-card .mdi {
    font-size: 32px;
}

/* Waitlist */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
}

.empty-state .mdi {
    font-size: 64px;
    color: #d1d5db;
    margin-bottom: 16px;
}

.empty-state h3 {
    font-size: 18px;
    color: #4b5563;
    margin: 0 0 8px;
}

.empty-state p {
    font-size: 14px;
    color: #9ca3af;
    margin: 0;
}

.waitlist-container {
    padding: 16px;
}

.waitlist-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 14px;
    margin-bottom: 12px;
}

.waitlist-position {
    font-size: 18px;
    font-weight: 700;
    color: #f59e0b;
    width: 40px;
}

.waitlist-avatar {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    object-fit: cover;
}

.waitlist-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.waitlist-name {
    font-size: 15px;
    font-weight: 600;
    color: #2d2d3a;
}

.waitlist-date {
    font-size: 12px;
    color: #9ca3af;
}

.approve-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    border-radius: 10px;
    color: white;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.approve-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* QR Modal */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.qr-modal {
    background: white;
    border-radius: 24px;
    width: 90%;
    max-width: 420px;
    overflow: hidden;
    position: relative;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
    font-size: 18px;
    font-weight: 700;
    color: #2d2d3a;
    margin: 0;
}

.close-btn {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 10px;
    background: #f3f4f6;
    color: #6b7280;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.qr-scanner-area {
    padding: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.scanner-frame {
    width: 200px;
    height: 200px;
    border: 3px solid #10b981;
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    background: #f9fafb;
}

.scanner-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: #10b981;
    animation: scan 2s linear infinite;
}

@keyframes scan {
    0% {
        top: 0;
    }

    50% {
        top: 100%;
    }

    100% {
        top: 0;
    }
}

.scanner-hint {
    font-size: 14px;
    color: #6b7280;
    text-align: center;
}

.manual-input {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 24px;
    background: #f9fafb;
}

.manual-input span {
    font-size: 13px;
    color: #6b7280;
}

.manual-input input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    font-size: 14px;
}

.process-btn {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.checkin-success {
    position: absolute;
    inset: 0;
    background: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
}

.success-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #10b981, #059669);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 48px;
    animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
    0% {
        transform: scale(0);
    }

    70% {
        transform: scale(1.2);
    }

    100% {
        transform: scale(1);
    }
}

.checkin-success h3 {
    font-size: 20px;
    color: #2d2d3a;
    margin: 0;
}

.checkin-success p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
}

/* Transitions */
.list-enter-active,
.list-leave-active {
    transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}

.modal-enter-active,
.modal-leave-active {
    transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-from .qr-modal,
.modal-leave-to .qr-modal {
    transform: scale(0.9) translateY(20px);
}

.success-enter-active,
.success-leave-active {
    transition: all 0.3s ease;
}

.success-enter-from,
.success-leave-to {
    opacity: 0;
}

@media (max-width: 768px) {
    .manager-header {
        flex-direction: column;
    }

    .header-stats {
        flex-wrap: wrap;
    }

    .list-header,
    .list-item {
        grid-template-columns: 1fr;
        gap: 8px;
    }

    .list-header {
        display: none;
    }
}
</style>
