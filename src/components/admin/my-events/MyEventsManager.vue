<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { deleteEvent, type Event, getMyEvents } from '@/services/events'
  import EventCommentsPanel from './EventCommentsPanel.vue'

  const { t } = useI18n()

  const events = ref<Event[]>([])
  const isLoading = ref(false)
  const loadError = ref('')
  const searchQuery = ref('')
  const filterStatus = ref<'all' | 'upcoming' | 'past'>('all')
  const commentEvent = ref<Event | null>(null)
  const confirmDeleteEvent = ref<Event | null>(null)
  const isDeletingId = ref<string | null>(null)

  // normalize field names: backend may return snake_case or different names
  function normalizeEvent (ev: any): Event {
    return {
      id: ev.id ?? ev._id ?? '',
      title: ev.title ?? ev.name ?? ev.eventName ?? '',
      description: ev.description ?? ev.desc ?? '',
      startDate: ev.startDate ?? ev.start_date ?? ev.startAt ?? ev.start_at ?? '',
      endDate: ev.endDate ?? ev.end_date ?? ev.endAt ?? ev.end_at ?? '',
      location: ev.location ?? ev.venue ?? ev.address ?? ev.place ?? '',
      isPublic: ev.isPublic ?? ev.is_public ?? true,
      allowComments: ev.allowComments ?? ev.allow_comments ?? true,
      showInMainFeed: ev.showInMainFeed ?? ev.show_in_main_feed ?? true,
      photos: ev.photos ?? ev.images ?? (ev.photo ? [ev.photo] : undefined),
      interestIds: ev.interestIds ?? ev.interest_ids ?? [],
      createdAt: ev.createdAt ?? ev.created_at ?? '',
      updatedAt: ev.updatedAt ?? ev.updated_at ?? '',
    }
  }

  async function fetchEvents () {
    isLoading.value = true
    loadError.value = ''
    try {
      const res = await getMyEvents() as any
      console.log('[MyEvents] raw response:', JSON.stringify(res))

      // handle common API shapes
      let list: any[] = []
      if (Array.isArray(res)) {
        list = res
      } else if (Array.isArray(res?.data)) {
        list = res.data
      } else if (Array.isArray(res?.data?.data)) {
        list = res.data.data
      } else if (Array.isArray(res?.content)) {
        list = res.content
      } else if (Array.isArray(res?.events)) {
        list = res.events
      } else if (Array.isArray(res?.items)) {
        list = res.items
      }

      console.log('[MyEvents] events parsed:', list.length, list)
      events.value = list.map(ev => normalizeEvent(ev))
    } catch (error: any) {
      const status = error?.response?.status
      console.error('[MyEvents] fetch error:', status, error?.response?.data || error)
      loadError.value = t('admin.myEvents.loadError')
    } finally {
      isLoading.value = false
    }
  }

  const filteredEvents = computed(() => {
    const now = new Date()
    return events.value.filter(ev => {
      const matchesSearch = !searchQuery.value.trim()
        || (ev.title ?? '').toLowerCase().includes(searchQuery.value.toLowerCase())
        || (ev.location ?? '').toLowerCase().includes(searchQuery.value.toLowerCase())

      if (!matchesSearch) return false

      if (filterStatus.value === 'upcoming') {
        return !ev.startDate || new Date(ev.startDate) >= now
      }
      if (filterStatus.value === 'past') {
        return !!ev.startDate && new Date(ev.startDate) < now
      }
      return true
    })
  })

  function formatDate (dateStr: string) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function isUpcoming (dateStr: string) {
    if (!dateStr) return true
    return new Date(dateStr) >= new Date()
  }

  const stats = computed(() => {
    const now = new Date()
    const total = events.value.length
    const upcoming = events.value.filter(ev => !ev.startDate || new Date(ev.startDate) >= now).length
    const past = total - upcoming
    const pub = events.value.filter(ev => ev.isPublic).length
    return { total, upcoming, past, pub }
  })

  async function handleDeleteConfirm () {
    if (!confirmDeleteEvent.value) return
    const id = confirmDeleteEvent.value.id
    isDeletingId.value = id
    try {
      await deleteEvent(id)
      events.value = events.value.filter(ev => ev.id !== id)
      confirmDeleteEvent.value = null
    } catch (error: any) {
      console.error('[MyEvents] delete error:', error?.response?.data || error)
    } finally {
      isDeletingId.value = null
    }
  }

  onMounted(fetchEvents)
</script>

<template>
  <section class="my-events">
    <!-- Page Header -->
    <header class="my-events__header">
      <div class="my-events__header-text">
        <h2 class="my-events__title">Editar Eventos</h2>
        <p class="my-events__sub">Selecione um evento para editar</p>
      </div>
      <RouterLink class="new-event-btn" to="/public/admin/new-event">
        <span class="mdi mdi-plus" />
        {{ t('admin.myEvents.newEvent') }}
      </RouterLink>
    </header>

    <!-- Stats Row -->
    <div v-if="!isLoading && !loadError" class="stats-row">
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--total">
          <span class="mdi mdi-calendar-multiple" />
        </div>
        <div class="stat-card__info">
          <span class="stat-card__value">{{ stats.total }}</span>
          <span class="stat-card__label">Total de eventos</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--upcoming">
          <span class="mdi mdi-calendar-clock" />
        </div>
        <div class="stat-card__info">
          <span class="stat-card__value">{{ stats.upcoming }}</span>
          <span class="stat-card__label">Em breve</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--past">
          <span class="mdi mdi-calendar-check" />
        </div>
        <div class="stat-card__info">
          <span class="stat-card__value">{{ stats.past }}</span>
          <span class="stat-card__label">Encerrados</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--public">
          <span class="mdi mdi-earth" />
        </div>
        <div class="stat-card__info">
          <span class="stat-card__value">{{ stats.pub }}</span>
          <span class="stat-card__label">Públicos</span>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar__search">
        <span class="mdi mdi-magnify toolbar__search-icon" />
        <input
          v-model="searchQuery"
          class="toolbar__search-input"
          :placeholder="t('admin.myEvents.searchPlaceholder')"
          type="search"
        >
      </div>
      <div class="filter-tabs">
        <button
          v-for="tab in ['all', 'upcoming', 'past']"
          :key="tab"
          class="filter-tab"
          :class="{ 'filter-tab--active': filterStatus === tab }"
          type="button"
          @click="filterStatus = (tab as 'all' | 'upcoming' | 'past')"
        >
          {{ t(`admin.myEvents.filter.${tab}`) }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="state-box">
      <span class="mdi mdi-loading mdi-spin state-box__icon state-box__icon--loading" />
      <span>{{ t('admin.myEvents.loading') }}</span>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="state-box state-box--error">
      <span class="mdi mdi-alert-circle-outline state-box__icon" />
      <span>{{ loadError }}</span>
      <button class="retry-btn" type="button" @click="fetchEvents">
        {{ t('admin.myEvents.retry') }}
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredEvents.length === 0" class="state-box state-box--empty">
      <span class="mdi mdi-calendar-blank-outline state-box__icon" />
      <p class="state-box__title">{{ t('admin.myEvents.empty') }}</p>
      <p class="state-box__desc">{{ t('admin.myEvents.emptyDesc') }}</p>
      <RouterLink class="new-event-btn new-event-btn--ghost" to="/public/admin/new-event">
        <span class="mdi mdi-plus" />
        {{ t('admin.myEvents.newEvent') }}
      </RouterLink>
    </div>

    <!-- Grid -->
    <div v-else class="events-grid">
      <article v-for="ev in filteredEvents" :key="ev.id" class="event-card">
        <!-- Cover -->
        <div class="event-card__cover">
          <img v-if="ev.photos && ev.photos.length > 0" :alt="ev.title" class="event-card__img" :src="ev.photos[0]">
          <div v-else class="event-card__img-placeholder">
            <span class="mdi mdi-image-outline" />
          </div>
          <span class="event-card__badge" :class="isUpcoming(ev.startDate) ? 'badge--upcoming' : 'badge--past'">
            {{ isUpcoming(ev.startDate) ? t('admin.myEvents.upcoming') : t('admin.myEvents.past') }}
          </span>
          <span class="event-card__visibility" :class="ev.isPublic ? 'vis--public' : 'vis--private'">
            <span class="mdi" :class="ev.isPublic ? 'mdi-earth' : 'mdi-lock'" />
            {{ ev.isPublic ? t('admin.myEvents.public') : t('admin.myEvents.private') }}
          </span>
        </div>

        <!-- Body -->
        <div class="event-card__body">
          <h3 class="event-card__name">{{ ev.title }}</h3>
          <p class="event-card__date">
            <span class="mdi mdi-calendar-clock" />
            {{ formatDate(ev.startDate) }}
          </p>
          <p v-if="ev.location" class="event-card__location">
            <span class="mdi mdi-map-marker-outline" />
            {{ ev.location }}
          </p>

          <!-- Actions -->
          <div class="event-card__actions">
            <RouterLink class="card-btn card-btn--primary" :to="`/public/admin/analytics?eventId=${ev.id}`">
              <span class="mdi mdi-chart-line" />
              {{ t('admin.myEvents.monitor') }}
            </RouterLink>
            <button class="card-btn card-btn--comments" type="button" @click="commentEvent = ev">
              <span class="mdi mdi-comment-text-outline" />
              {{ t('admin.myEvents.comments') }}
            </button>
            <RouterLink class="card-btn card-btn--secondary" :to="`/public/admin/new-event?editId=${ev.id}`">
              <span class="mdi mdi-pencil-outline" />
              {{ t('admin.myEvents.edit') }}
            </RouterLink>
            <button
              class="card-btn card-btn--delete"
              :disabled="isDeletingId === ev.id"
              type="button"
              @click="confirmDeleteEvent = ev"
            >
              <span class="mdi" :class="isDeletingId === ev.id ? 'mdi-loading mdi-spin' : 'mdi-trash-can-outline'" />
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>

  <!-- Confirm Delete Modal -->
  <Teleport to="body">
    <Transition name="cp-modal">
      <div v-if="confirmDeleteEvent" class="cp-modal-backdrop" @click.self="confirmDeleteEvent = null">
        <div class="confirm-delete-dialog">
          <span class="confirm-delete-dialog__icon mdi mdi-alert-circle-outline" />
          <h3 class="confirm-delete-dialog__title">Excluir evento?</h3>
          <p class="confirm-delete-dialog__desc">
            Tem certeza que deseja excluir <strong>{{ confirmDeleteEvent.title }}</strong>? Esta ação não pode ser
            desfeita.
          </p>
          <div class="confirm-delete-dialog__actions">
            <button class="confirm-btn confirm-btn--cancel" type="button" @click="confirmDeleteEvent = null">
              Cancelar
            </button>
            <button
              class="confirm-btn confirm-btn--delete"
              :disabled="!!isDeletingId"
              type="button"
              @click="handleDeleteConfirm"
            >
              <span v-if="isDeletingId" class="mdi mdi-loading mdi-spin" />
              <span v-else class="mdi mdi-trash-can-outline" />
              Excluir
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Comments Modal -->
  <Teleport to="body">
    <Transition name="cp-modal">
      <div v-if="commentEvent" class="cp-modal-backdrop" @click.self="commentEvent = null">
        <EventCommentsPanel
          :event-id="commentEvent.id"
          :event-title="commentEvent.title"
          @close="commentEvent = null"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.my-events {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header */
.my-events__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.my-events__header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #ffffff;
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 2px 12px rgba(33, 33, 77, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(33, 33, 77, 0.11);
}

.stat-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 22px;
  height: 48px;
  width: 48px;
  flex-shrink: 0;
}

.stat-card__icon--total {
  background: linear-gradient(135deg, rgba(255, 79, 148, 0.15) 0%, rgba(249, 165, 56, 0.15) 100%);
  color: #ff4f94;
}

.stat-card__icon--upcoming {
  background: rgba(139, 107, 255, 0.12);
  color: #8b6bff;
}

.stat-card__icon--past {
  background: rgba(100, 100, 120, 0.1);
  color: #6b6b7b;
}

.stat-card__icon--public {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
}

.stat-card__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-card__value {
  font-size: 26px;
  font-weight: 800;
  color: #2d2d3a;
  line-height: 1;
}

.stat-card__label {
  font-size: 12px;
  color: #8b8b99;
  font-weight: 500;
}

.my-events__title {
  font-size: 22px;
  font-weight: 800;
  color: #2d2d3a;
  margin: 0 0 4px;
}

.my-events__sub {
  color: #8b8b99;
  font-size: 14px;
  margin: 0;
}

.new-event-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 18px;
  text-decoration: none;
  transition: transform 0.15s, box-shadow 0.15s;
  flex-shrink: 0;
}

.new-event-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(255, 79, 148, 0.35);
}

.new-event-btn--ghost {
  background: #f4f4fb;
  color: #6b6b7b;
  box-shadow: none;
}

.new-event-btn--ghost:hover {
  background: #ebebf5;
  transform: translateY(-1px);
  box-shadow: none;
}

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar__search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1.5px solid rgba(219, 219, 229, 0.9);
  border-radius: 12px;
  padding: 0 14px;
  flex: 1;
  min-width: 200px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.toolbar__search:focus-within {
  border-color: rgba(255, 79, 148, 0.5);
  box-shadow: 0 0 0 3px rgba(255, 79, 148, 0.1);
}

.toolbar__search-icon {
  color: #aaaabc;
  font-size: 18px;
  flex-shrink: 0;
}

.toolbar__search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #3b3b45;
  font-size: 14px;
  padding: 11px 0;
}

.toolbar__search-input:focus {
  outline: none;
}

.toolbar__search-input::-webkit-search-cancel-button {
  display: none;
}

.filter-tabs {
  display: flex;
  gap: 4px;
  background: #f4f4fb;
  border-radius: 10px;
  padding: 4px;
}

.filter-tab {
  background: transparent;
  border: none;
  border-radius: 7px;
  color: #8b8b99;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 14px;
  transition: background 0.15s, color 0.15s;
}

.filter-tab--active {
  background: #ffffff;
  color: #3b3b45;
  box-shadow: 0 1px 4px rgba(33, 33, 77, 0.1);
}

/* States */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 64px 24px;
  text-align: center;
  color: #8b8b99;
  font-size: 14px;
}

.state-box__icon {
  font-size: 48px;
  opacity: 0.5;
}

.state-box__icon--loading {
  color: #ff4f94;
  opacity: 1;
}

.state-box--error {
  color: #d82b56;
}

.state-box--error .state-box__icon {
  opacity: 1;
}

.state-box__title {
  font-size: 16px;
  font-weight: 700;
  color: #3b3b45;
  margin: 0;
}

.state-box__desc {
  color: #8b8b99;
  font-size: 13px;
  margin: 0;
}

.retry-btn {
  background: transparent;
  border: 1.5px solid rgba(216, 43, 86, 0.4);
  border-radius: 8px;
  color: #d82b56;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 18px;
  transition: background 0.15s;
}

.retry-btn:hover {
  background: rgba(216, 43, 86, 0.06);
}

/* Grid */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* Card */
.event-card {
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(33, 33, 77, 0.07);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 28px rgba(33, 33, 77, 0.13);
}

/* Cover */
.event-card__cover {
  position: relative;
  aspect-ratio: 16 / 7;
  overflow: hidden;
  background: linear-gradient(135deg, #f0e8ff 0%, #ffe8f4 100%);
}

.event-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-card__img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: rgba(139, 107, 255, 0.3);
}

.event-card__badge {
  position: absolute;
  top: 10px;
  left: 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
  padding: 4px 10px;
  text-transform: uppercase;
}

.badge--upcoming {
  background: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
  color: #ffffff;
}

.badge--past {
  background: rgba(100, 100, 120, 0.15);
  color: #6b6b7b;
}

.event-card__visibility {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
}

.vis--public {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.vis--private {
  background: rgba(139, 107, 255, 0.15);
  color: #7c3aed;
}

/* Body */
.event-card__body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.event-card__name {
  font-size: 15px;
  font-weight: 700;
  color: #2d2d3a;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-card__date,
.event-card__location {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b6b7b;
  font-size: 12px;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-card__date .mdi,
.event-card__location .mdi {
  font-size: 14px;
  flex-shrink: 0;
  color: #b46cff;
}

/* Actions */
.event-card__actions {
  display: flex;
  gap: 6px;
  margin-top: auto;
  padding-top: 8px;
  flex-wrap: wrap;
}

.card-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 12px;
  text-decoration: none;
  transition: transform 0.15s, opacity 0.15s;
  flex: 1;
  justify-content: center;
  border: none;
  cursor: pointer;
}

.card-btn--primary {
  background: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
  color: #ffffff;
  width: 100%;
  flex: 0 0 100%;
}

.card-btn--primary:hover {
  transform: translateY(-1px);
  opacity: 0.92;
}

.card-btn--secondary {
  background: #f4f4fb;
  color: #6b6b7b;
}

.card-btn--secondary:hover {
  background: #ebebf5;
}

.card-btn--comments {
  background: rgba(139, 107, 255, 0.1);
  color: #8b6bff;
}

.card-btn--comments:hover {
  background: rgba(139, 107, 255, 0.18);
}

.card-btn--delete {
  background: rgba(216, 43, 86, 0.08);
  color: #d82b56;
  flex: 0 0 auto;
  padding: 8px 10px;
}

.card-btn--delete:hover:not(:disabled) {
  background: rgba(216, 43, 86, 0.16);
}

.card-btn--delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Confirm Delete Dialog */
.confirm-delete-dialog {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(33, 33, 77, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 400px;
  padding: 36px 32px 28px;
  text-align: center;
  width: 100%;
}

.confirm-delete-dialog__icon {
  font-size: 48px;
  color: #d82b56;
  opacity: 0.9;
}

.confirm-delete-dialog__title {
  font-size: 18px;
  font-weight: 800;
  color: #2d2d3a;
  margin: 0;
}

.confirm-delete-dialog__desc {
  font-size: 14px;
  color: #6b6b7b;
  margin: 0;
  line-height: 1.5;
}

.confirm-delete-dialog__actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  width: 100%;
}

.confirm-btn {
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  padding: 11px 0;
  flex: 1;
  border: none;
  transition: opacity 0.15s, transform 0.15s;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.confirm-btn--cancel {
  background: #f4f4fb;
  color: #6b6b7b;
}

.confirm-btn--cancel:hover {
  background: #ebebf5;
}

.confirm-btn--delete {
  background: linear-gradient(135deg, #d82b56 0%, #ff4f94 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.confirm-btn--delete:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Comments modal */
.cp-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 24px;
}

.cp-modal-enter-active,
.cp-modal-leave-active {
  transition: opacity 0.25s ease;
}

.cp-modal-enter-from,
.cp-modal-leave-to {
  opacity: 0;
}

@media (max-width: 960px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .events-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .stats-row {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .stat-card {
    padding: 14px;
    gap: 10px;
  }

  .stat-card__value {
    font-size: 20px;
  }

  .stat-card__icon {
    height: 40px;
    width: 40px;
    font-size: 18px;
  }
}
</style>
