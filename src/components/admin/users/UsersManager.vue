<template>
  <div class="users-manager">
    <!-- Header -->
    <header class="page-header">
      <div class="header-info">
        <h1 class="page-title">{{ t('admin.users.title') }}</h1>
        <p class="page-subtitle">{{ t('admin.users.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <div class="search-box">
          <span class="mdi mdi-magnify search-icon" />
          <input
            v-model="searchQuery"
            class="search-input"
            :placeholder="t('admin.users.searchPlaceholder')"
            type="text"
          >
        </div>
        <select v-model="filterStatus" class="filter-select">
          <option value="all">{{ t('admin.users.filterAll') }}</option>
          <option value="active">{{ t('admin.users.filterActive') }}</option>
          <option value="blocked">{{ t('admin.users.filterBlocked') }}</option>
        </select>
        <button class="export-btn" type="button" @click="exportUsers">
          <span class="mdi mdi-download" />
          {{ t('admin.users.export') }}
        </button>
      </div>
    </header>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card stat-card--total">
        <div class="stat-icon">
          <span class="mdi mdi-account-group" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ formatNumber(stats.total) }}</span>
          <span class="stat-label">{{ t('admin.users.totalUsers') }}</span>
        </div>
      </div>
      <div class="stat-card stat-card--active">
        <div class="stat-icon">
          <span class="mdi mdi-account-check" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ formatNumber(stats.active) }}</span>
          <span class="stat-label">{{ t('admin.users.activeUsers') }}</span>
        </div>
      </div>
      <div class="stat-card stat-card--blocked">
        <div class="stat-icon">
          <span class="mdi mdi-account-cancel" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ formatNumber(stats.blocked) }}</span>
          <span class="stat-label">{{ t('admin.users.blockedUsers') }}</span>
        </div>
      </div>
      <div class="stat-card stat-card--new">
        <div class="stat-icon">
          <span class="mdi mdi-account-plus" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ formatNumber(stats.newThisMonth) }}</span>
          <span class="stat-label">{{ t('admin.users.newThisMonth') }}</span>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <section class="users-section">
      <div class="table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>{{ t('admin.users.table.user') }}</th>
              <th>{{ t('admin.users.table.email') }}</th>
              <th>{{ t('admin.users.table.registeredAt') }}</th>
              <th>{{ t('admin.users.table.lastActive') }}</th>
              <th>{{ t('admin.users.table.status') }}</th>
              <th>{{ t('admin.users.table.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
              <td class="user-cell">
                <img :alt="user.name" class="user-avatar" :src="user.avatar">
                <div class="user-info">
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-handle">@{{ user.handle }}</span>
                </div>
              </td>
              <td class="email-cell">{{ user.email }}</td>
              <td class="date-cell">{{ user.registeredAt }}</td>
              <td class="date-cell">{{ user.lastActive }}</td>
              <td class="status-cell">
                <span class="status-badge" :class="`status-badge--${user.status}`">
                  {{ user.status === 'active' ? t('admin.users.statusActive') :
                    t('admin.users.statusBlocked') }}
                </span>
              </td>
              <td class="actions-cell">
                <button
                  class="action-btn"
                  :class="user.status === 'active' ? 'action-btn--block' : 'action-btn--unblock'"
                  :title="user.status === 'active' ? t('admin.users.block') : t('admin.users.unblock')"
                  type="button"
                  @click="toggleUserStatus(user)"
                >
                  <span
                    class="mdi"
                    :class="user.status === 'active' ? 'mdi-cancel' : 'mdi-check-circle'"
                  />
                </button>
                <button
                  class="action-btn action-btn--view"
                  :title="t('admin.users.viewProfile')"
                  type="button"
                  @click="viewUser(user)"
                >
                  <span class="mdi mdi-eye" />
                </button>
                <button
                  class="action-btn action-btn--message"
                  :title="t('admin.users.sendMessage')"
                  type="button"
                  @click="messageUser(user)"
                >
                  <span class="mdi mdi-message-text" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button class="page-btn" :disabled="currentPage === 1" type="button" @click="currentPage--">
          <span class="mdi mdi-chevron-left" />
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="currentPage === totalPages" type="button" @click="currentPage++">
          <span class="mdi mdi-chevron-right" />
        </button>
      </div>
    </section>

    <!-- User Detail Modal -->
    <div v-if="selectedUser" class="modal-overlay" @click.self="selectedUser = null">
      <div class="modal-content">
        <button class="modal-close" type="button" @click="selectedUser = null">
          <span class="mdi mdi-close" />
        </button>
        <div class="modal-header">
          <img :alt="selectedUser.name" class="modal-avatar" :src="selectedUser.avatar">
          <div class="modal-user-info">
            <h2 class="modal-user-name">{{ selectedUser.name }}</h2>
            <span class="modal-user-handle">@{{ selectedUser.handle }}</span>
            <span class="status-badge" :class="`status-badge--${selectedUser.status}`">
              {{ selectedUser.status === 'active' ? t('admin.users.statusActive') :
                t('admin.users.statusBlocked') }}
            </span>
          </div>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <span class="detail-label">{{ t('admin.users.table.email') }}</span>
            <span class="detail-value">{{ selectedUser.email }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ t('admin.users.table.registeredAt') }}</span>
            <span class="detail-value">{{ selectedUser.registeredAt }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ t('admin.users.table.lastActive') }}</span>
            <span class="detail-value">{{ selectedUser.lastActive }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ t('admin.users.eventsAttended') }}</span>
            <span class="detail-value">{{ selectedUser.eventsAttended }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ t('admin.users.totalSpent') }}</span>
            <span class="detail-value">R$ {{ formatNumber(selectedUser.totalSpent) }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button
            class="modal-btn"
            :class="selectedUser.status === 'active' ? 'modal-btn--block' : 'modal-btn--unblock'"
            type="button"
            @click="toggleUserStatus(selectedUser)"
          >
            <span
              class="mdi"
              :class="selectedUser.status === 'active' ? 'mdi-cancel' : 'mdi-check-circle'"
            />
            {{ selectedUser.status === 'active' ? t('admin.users.block') : t('admin.users.unblock') }}
          </button>
          <button class="modal-btn modal-btn--message" type="button" @click="messageUser(selectedUser)">
            <span class="mdi mdi-message-text" />
            {{ t('admin.users.sendMessage') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Block Confirmation Modal -->
    <div v-if="userToBlock" class="modal-overlay" @click.self="userToBlock = null">
      <div class="modal-content modal-content--small">
        <div
          class="confirm-icon"
          :class="userToBlock.status === 'active' ? 'confirm-icon--block' : 'confirm-icon--unblock'"
        >
          <span
            class="mdi"
            :class="userToBlock.status === 'active' ? 'mdi-account-cancel' : 'mdi-account-check'"
          />
        </div>
        <h3 class="confirm-title">
          {{ userToBlock.status === 'active' ? t('admin.users.confirmBlock') : t('admin.users.confirmUnblock')
          }}
        </h3>
        <p class="confirm-text">
          {{ userToBlock.status === 'active' ? t('admin.users.blockWarning') : t('admin.users.unblockWarning')
          }}
          <strong>{{ userToBlock.name }}</strong>
        </p>
        <div v-if="userToBlock.status === 'active'" class="block-reason">
          <label class="reason-label">{{ t('admin.users.blockReason') }}</label>
          <select v-model="blockReason" class="reason-select">
            <option value="spam">{{ t('admin.users.reasons.spam') }}</option>
            <option value="harassment">{{ t('admin.users.reasons.harassment') }}</option>
            <option value="fraud">{{ t('admin.users.reasons.fraud') }}</option>
            <option value="inappropriate">{{ t('admin.users.reasons.inappropriate') }}</option>
            <option value="other">{{ t('admin.users.reasons.other') }}</option>
          </select>
        </div>
        <div class="confirm-actions">
          <button class="confirm-btn confirm-btn--cancel" type="button" @click="userToBlock = null">
            {{ t('admin.users.cancel') }}
          </button>
          <button
            class="confirm-btn"
            :class="userToBlock.status === 'active' ? 'confirm-btn--block' : 'confirm-btn--unblock'"
            type="button"
            @click="confirmToggleStatus"
          >
            {{ userToBlock.status === 'active' ? t('admin.users.block') : t('admin.users.unblock') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  interface User {
    id: number
    name: string
    handle: string
    email: string
    avatar: string
    registeredAt: string
    lastActive: string
    status: 'active' | 'blocked'
    eventsAttended: number
    totalSpent: number
  }

  const { t } = useI18n()

  const searchQuery = ref('')
  const filterStatus = ref('all')
  const currentPage = ref(1)
  const selectedUser = ref<User | null>(null)
  const userToBlock = ref<User | null>(null)
  const blockReason = ref('spam')
  const itemsPerPage = 10

  // Mock stats
  const stats = ref({
    total: 15_420,
    active: 14_856,
    blocked: 564,
    newThisMonth: 342,
  })

  // Mock users data
  const users = ref<User[]>([
    {
      id: 1,
      name: 'João Silva',
      handle: 'joaosilva',
      email: 'joao.silva@email.com',
      avatar: 'https://i.pravatar.cc/100?img=1',
      registeredAt: '15/03/2024',
      lastActive: '02/02/2026',
      status: 'active',
      eventsAttended: 12,
      totalSpent: 1580,
    },
    {
      id: 2,
      name: 'Maria Santos',
      handle: 'mariasantos',
      email: 'maria.santos@email.com',
      avatar: 'https://i.pravatar.cc/100?img=5',
      registeredAt: '22/05/2024',
      lastActive: '01/02/2026',
      status: 'active',
      eventsAttended: 8,
      totalSpent: 920,
    },
    {
      id: 3,
      name: 'Pedro Costa',
      handle: 'pedrocosta',
      email: 'pedro.costa@email.com',
      avatar: 'https://i.pravatar.cc/100?img=3',
      registeredAt: '10/01/2024',
      lastActive: '28/01/2026',
      status: 'blocked',
      eventsAttended: 3,
      totalSpent: 250,
    },
    {
      id: 4,
      name: 'Ana Oliveira',
      handle: 'anaoliveira',
      email: 'ana.oliveira@email.com',
      avatar: 'https://i.pravatar.cc/100?img=9',
      registeredAt: '08/07/2024',
      lastActive: '02/02/2026',
      status: 'active',
      eventsAttended: 15,
      totalSpent: 2340,
    },
    {
      id: 5,
      name: 'Lucas Ferreira',
      handle: 'lucasferreira',
      email: 'lucas.ferreira@email.com',
      avatar: 'https://i.pravatar.cc/100?img=12',
      registeredAt: '20/09/2024',
      lastActive: '30/01/2026',
      status: 'active',
      eventsAttended: 6,
      totalSpent: 780,
    },
    {
      id: 6,
      name: 'Juliana Lima',
      handle: 'julianalima',
      email: 'juliana.lima@email.com',
      avatar: 'https://i.pravatar.cc/100?img=16',
      registeredAt: '05/11/2024',
      lastActive: '01/02/2026',
      status: 'active',
      eventsAttended: 4,
      totalSpent: 520,
    },
    {
      id: 7,
      name: 'Carlos Mendes',
      handle: 'carlosmendes',
      email: 'carlos.mendes@email.com',
      avatar: 'https://i.pravatar.cc/100?img=7',
      registeredAt: '12/02/2024',
      lastActive: '15/12/2025',
      status: 'blocked',
      eventsAttended: 1,
      totalSpent: 80,
    },
    {
      id: 8,
      name: 'Beatriz Souza',
      handle: 'beatrizsouza',
      email: 'beatriz.souza@email.com',
      avatar: 'https://i.pravatar.cc/100?img=20',
      registeredAt: '18/06/2024',
      lastActive: '02/02/2026',
      status: 'active',
      eventsAttended: 10,
      totalSpent: 1420,
    },
  ])

  const filteredUsers = computed(() => {
    let result = users.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(
        user =>
          user.name.toLowerCase().includes(query)
          || user.handle.toLowerCase().includes(query)
          || user.email.toLowerCase().includes(query),
      )
    }

    if (filterStatus.value !== 'all') {
      result = result.filter(user => user.status === filterStatus.value)
    }

    return result
  })

  const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage))

  function formatNumber (num: number): string {
    return num.toLocaleString('pt-BR')
  }

  function toggleUserStatus (user: User) {
    userToBlock.value = user
    selectedUser.value = null
  }

  function confirmToggleStatus () {
    if (userToBlock.value) {
      const user = users.value.find(u => u.id === userToBlock.value?.id)
      if (user) {
        user.status = user.status === 'active' ? 'blocked' : 'active'
        if (user.status === 'blocked') {
          stats.value.blocked++
          stats.value.active--
        } else {
          stats.value.blocked--
          stats.value.active++
        }
      }
      userToBlock.value = null
    }
  }

  function viewUser (user: User) {
    selectedUser.value = user
  }

  function messageUser (user: User) {
    console.log('Opening message to:', user.name)
    // TODO: Implement messaging functionality
  }

  function exportUsers () {
    console.log('Exporting users data...')
    // TODO: Implement export functionality
  }
</script>

<style scoped>
.users-manager {
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

.header-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.search-box {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 14px;
    font-size: 20px;
    color: #9ca3af;
}

.search-input {
    padding: 10px 16px 10px 44px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: white;
    font-size: 14px;
    min-width: 250px;
    transition: all 0.3s ease;
}

.search-input:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.filter-select {
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

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
    border-radius: 16px;
    border: 1px solid rgba(171, 151, 255, 0.15);
}

.stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
}

.stat-card--total .stat-icon {
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
}

.stat-card--active .stat-icon {
    background: linear-gradient(135deg, #10b981, #34d399);
}

.stat-card--blocked .stat-icon {
    background: linear-gradient(135deg, #ef4444, #f87171);
}

.stat-card--new .stat-icon {
    background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

.stat-info {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #2d2d3a;
}

.stat-label {
    font-size: 13px;
    color: #6b7280;
}

/* Users Section */
.users-section {
    background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
    border-radius: 20px;
    border: 1px solid rgba(171, 151, 255, 0.15);
    padding: 24px;
}

.table-container {
    overflow-x: auto;
}

.users-table {
    width: 100%;
    border-collapse: collapse;
}

.users-table th {
    text-align: left;
    padding: 14px 16px;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #e5e7eb;
}

.users-table td {
    padding: 14px 16px;
    border-bottom: 1px solid #f3f4f6;
}

.user-row {
    transition: background 0.2s ease;
}

.user-row:hover {
    background: #f9fafb;
}

.user-cell {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    object-fit: cover;
}

.user-info {
    display: flex;
    flex-direction: column;
}

.user-name {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.user-handle {
    font-size: 12px;
    color: #9ca3af;
}

.email-cell {
    font-size: 14px;
    color: #6b7280;
}

.date-cell {
    font-size: 14px;
    color: #6b7280;
}

.status-badge {
    display: inline-flex;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}

.status-badge--active {
    background: #d1fae5;
    color: #059669;
}

.status-badge--blocked {
    background: #fee2e2;
    color: #dc2626;
}

.actions-cell {
    display: flex;
    gap: 8px;
}

.action-btn {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 18px;
}

.action-btn--block {
    background: #fee2e2;
    color: #dc2626;
}

.action-btn--block:hover {
    background: #fecaca;
}

.action-btn--unblock {
    background: #d1fae5;
    color: #059669;
}

.action-btn--unblock:hover {
    background: #a7f3d0;
}

.action-btn--view {
    background: #e0e7ff;
    color: #4f46e5;
}

.action-btn--view:hover {
    background: #c7d2fe;
}

.action-btn--message {
    background: #dbeafe;
    color: #2563eb;
}

.action-btn--message:hover {
    background: #bfdbfe;
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-top: 24px;
}

.page-btn {
    width: 40px;
    height: 40px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 20px;
    color: #374151;
}

.page-btn:hover:not(:disabled) {
    background: #f3f4f6;
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-info {
    font-size: 14px;
    color: #6b7280;
}

/* Modals */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
}

.modal-content {
    background: white;
    border-radius: 20px;
    padding: 28px;
    max-width: 480px;
    width: 90%;
    position: relative;
    animation: slideUp 0.3s ease;
}

.modal-content--small {
    max-width: 400px;
    text-align: center;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: #f3f4f6;
    cursor: pointer;
    font-size: 18px;
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
}

.modal-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
}

.modal-user-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.modal-user-name {
    font-size: 20px;
    font-weight: 700;
    color: #2d2d3a;
    margin: 0;
}

.modal-user-handle {
    font-size: 14px;
    color: #9ca3af;
}

.modal-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    background: #f9fafb;
    border-radius: 10px;
}

.detail-label {
    font-size: 14px;
    color: #6b7280;
}

.detail-value {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.modal-actions {
    display: flex;
    gap: 12px;
}

.modal-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.modal-btn--block {
    background: #fee2e2;
    color: #dc2626;
}

.modal-btn--block:hover {
    background: #fecaca;
}

.modal-btn--unblock {
    background: #d1fae5;
    color: #059669;
}

.modal-btn--unblock:hover {
    background: #a7f3d0;
}

.modal-btn--message {
    background: #dbeafe;
    color: #2563eb;
}

.modal-btn--message:hover {
    background: #bfdbfe;
}

/* Confirmation Modal */
.confirm-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    margin: 0 auto 20px;
}

.confirm-icon--block {
    background: #fee2e2;
    color: #dc2626;
}

.confirm-icon--unblock {
    background: #d1fae5;
    color: #059669;
}

.confirm-title {
    font-size: 20px;
    font-weight: 700;
    color: #2d2d3a;
    margin: 0 0 12px;
}

.confirm-text {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 20px;
}

.block-reason {
    text-align: left;
    margin-bottom: 20px;
}

.reason-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
}

.reason-select {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    font-size: 14px;
    color: #374151;
}

.confirm-actions {
    display: flex;
    gap: 12px;
}

.confirm-btn {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.confirm-btn--cancel {
    background: #f3f4f6;
    color: #6b7280;
}

.confirm-btn--cancel:hover {
    background: #e5e7eb;
}

.confirm-btn--block {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
}

.confirm-btn--block:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.confirm-btn--unblock {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
}

.confirm-btn--unblock:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

@media (max-width: 1024px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 640px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .header-actions {
        width: 100%;
    }

    .search-input {
        min-width: auto;
        width: 100%;
    }
}
</style>
