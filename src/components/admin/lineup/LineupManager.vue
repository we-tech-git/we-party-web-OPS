<template>
  <div class="lineup-manager">
    <header class="manager-header">
      <div class="header-info">
        <h1 class="page-title">{{ t('admin.lineup.title') }}</h1>
        <p class="page-subtitle">{{ t('admin.lineup.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="add-btn" type="button" @click="openSlotModal()">
          <span class="mdi mdi-plus" />
          Adicionar Atração
        </button>
      </div>
    </header>

    <!-- Timeline View -->
    <div class="timeline-container">
      <div class="timeline-header">
        <div class="stage-tabs">
          <button
            v-for="stage in stages"
            :key="stage.id"
            class="stage-tab"
            :class="{ 'stage-tab--active': activeStage === stage.id }"
            :style="{ '--color': stage.color }"
            type="button"
            @click="activeStage = stage.id"
          >
            <span class="mdi" :class="stage.icon" />
            {{ stage.name }}
          </button>
          <button class="stage-tab stage-tab--add" type="button" @click="addStage">
            <span class="mdi mdi-plus" />
          </button>
        </div>
        <div class="timeline-actions">
          <button
            class="view-btn"
            :class="{ 'view-btn--active': viewMode === 'timeline' }"
            type="button"
            @click="viewMode = 'timeline'"
          >
            <span class="mdi mdi-timeline" />
          </button>
          <button
            class="view-btn"
            :class="{ 'view-btn--active': viewMode === 'grid' }"
            type="button"
            @click="viewMode = 'grid'"
          >
            <span class="mdi mdi-view-grid" />
          </button>
        </div>
      </div>

      <!-- Timeline View -->
      <div v-if="viewMode === 'timeline'" class="timeline-view">
        <div class="time-ruler">
          <div v-for="hour in timeSlots" :key="hour" class="time-mark">
            <span>{{ hour }}</span>
          </div>
        </div>
        <div class="timeline-track">
          <div
            v-for="slot in filteredSlots"
            :key="slot.id"
            class="timeline-slot"
            :style="getSlotStyle(slot)"
            @click="openSlotModal(slot)"
          >
            <div class="slot-content">
              <img :alt="slot.artist.name" class="slot-avatar" :src="slot.artist.avatar">
              <div class="slot-info">
                <span class="slot-name">{{ slot.artist.name }}</span>
                <span class="slot-time">{{ slot.startTime }} - {{ slot.endTime }}</span>
              </div>
            </div>
            <div class="slot-actions">
              <button class="slot-action" type="button" @click.stop="deleteSlot(slot.id)">
                <span class="mdi mdi-delete" />
              </button>
            </div>
          </div>
          <div class="timeline-now" :style="{ left: `${nowPosition}%` }">
            <span class="now-label">Agora</span>
          </div>
        </div>
      </div>

      <!-- Grid View -->
      <div v-else class="grid-view">
        <div v-for="slot in filteredSlots" :key="slot.id" class="grid-card" @click="openSlotModal(slot)">
          <div class="card-image" :style="{ backgroundImage: `url(${slot.artist.avatar})` }">
            <span class="card-time">{{ slot.startTime }} - {{ slot.endTime }}</span>
          </div>
          <div class="card-content">
            <h3 class="card-name">{{ slot.artist.name }}</h3>
            <span class="card-genre">{{ slot.artist.genre }}</span>
            <div class="card-social">
              <a
                v-if="slot.artist.instagram"
                class="social-link"
                :href="`https://instagram.com/${slot.artist.instagram}`"
                target="_blank"
              >
                <span class="mdi mdi-instagram" />
              </a>
              <a
                v-if="slot.artist.spotify"
                class="social-link"
                :href="slot.artist.spotify"
                target="_blank"
              >
                <span class="mdi mdi-spotify" />
              </a>
              <a
                v-if="slot.artist.soundcloud"
                class="social-link"
                :href="slot.artist.soundcloud"
                target="_blank"
              >
                <span class="mdi mdi-soundcloud" />
              </a>
            </div>
          </div>
          <div class="card-actions">
            <button class="card-action" type="button" @click.stop="editSlot(slot)">
              <span class="mdi mdi-pencil" />
            </button>
            <button class="card-action card-action--danger" type="button" @click.stop="deleteSlot(slot.id)">
              <span class="mdi mdi-delete" />
            </button>
          </div>
        </div>

        <div class="add-card" @click="openSlotModal()">
          <span class="mdi mdi-plus" />
          <span>Adicionar Atração</span>
        </div>
      </div>
    </div>

    <!-- Upcoming Section -->
    <section class="upcoming-section">
      <h2 class="section-title">Próximas Atrações</h2>
      <div class="upcoming-list">
        <div
          v-for="(slot, index) in upcomingSlots"
          :key="slot.id"
          class="upcoming-item"
          :class="{ 'upcoming-item--next': index === 0 }"
        >
          <div class="upcoming-index">{{ index + 1 }}</div>
          <img :alt="slot.artist.name" class="upcoming-avatar" :src="slot.artist.avatar">
          <div class="upcoming-info">
            <span class="upcoming-name">{{ slot.artist.name }}</span>
            <span class="upcoming-time">
              <span class="mdi mdi-clock-outline" />
              {{ slot.startTime }} - {{ slot.endTime }}
            </span>
          </div>
          <span class="upcoming-stage" :style="{ background: getStageColor(slot.stageId) }">
            {{ getStageName(slot.stageId) }}
          </span>
          <span v-if="index === 0" class="upcoming-live">
            <span class="live-dot" />
            EM BREVE
          </span>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats-section">
      <div class="stat-card">
        <span class="mdi mdi-account-music stat-icon" />
        <div class="stat-info">
          <span class="stat-value">{{ slots.length }}</span>
          <span class="stat-label">Atrações</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="mdi mdi-speaker stat-icon" />
        <div class="stat-info">
          <span class="stat-value">{{ stages.length }}</span>
          <span class="stat-label">Palcos</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="mdi mdi-clock stat-icon" />
        <div class="stat-info">
          <span class="stat-value">{{ totalHours }}h</span>
          <span class="stat-label">de Música</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="mdi mdi-music-note stat-icon" />
        <div class="stat-info">
          <span class="stat-value">{{ uniqueGenres }}</span>
          <span class="stat-label">Gêneros</span>
        </div>
      </div>
    </section>

    <!-- Slot Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showSlotModal" class="modal-backdrop" @click.self="closeSlotModal">
          <div class="slot-modal">
            <header class="modal-header">
              <h2>{{ editingSlot ? 'Editar Atração' : 'Nova Atração' }}</h2>
              <button class="close-btn" type="button" @click="closeSlotModal">
                <span class="mdi mdi-close" />
              </button>
            </header>
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label>Nome do Artista</label>
                  <input v-model="slotForm.name" placeholder="DJ Alok" type="text">
                </div>
                <div class="form-group">
                  <label>Gênero Musical</label>
                  <input v-model="slotForm.genre" placeholder="House / Techno" type="text">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Horário Início</label>
                  <input v-model="slotForm.startTime" type="time">
                </div>
                <div class="form-group">
                  <label>Horário Fim</label>
                  <input v-model="slotForm.endTime" type="time">
                </div>
              </div>
              <div class="form-group">
                <label>Palco</label>
                <div class="stage-select">
                  <button
                    v-for="stage in stages"
                    :key="stage.id"
                    class="stage-option"
                    :class="{ 'stage-option--selected': slotForm.stageId === stage.id }"
                    :style="{ '--color': stage.color }"
                    type="button"
                    @click="slotForm.stageId = stage.id"
                  >
                    <span class="mdi" :class="stage.icon" />
                    {{ stage.name }}
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label>Foto do Artista</label>
                <div class="avatar-upload">
                  <img v-if="slotForm.avatar" class="avatar-preview" :src="slotForm.avatar">
                  <div v-else class="avatar-placeholder">
                    <span class="mdi mdi-account" />
                  </div>
                  <input v-model="slotForm.avatar" placeholder="URL da imagem" type="text">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Instagram</label>
                  <div class="social-input">
                    <span class="mdi mdi-instagram" />
                    <input v-model="slotForm.instagram" placeholder="@usuario" type="text">
                  </div>
                </div>
                <div class="form-group">
                  <label>Spotify</label>
                  <div class="social-input">
                    <span class="mdi mdi-spotify" />
                    <input v-model="slotForm.spotify" placeholder="URL do perfil" type="text">
                  </div>
                </div>
              </div>
            </div>
            <footer class="modal-footer">
              <button class="modal-btn modal-btn--secondary" type="button" @click="closeSlotModal">
                Cancelar
              </button>
              <button class="modal-btn modal-btn--primary" type="button" @click="saveSlot">
                {{ editingSlot ? 'Salvar' : 'Adicionar' }}
              </button>
            </footer>
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

  const activeStage = ref(1)
  const viewMode = ref<'timeline' | 'grid'>('timeline')
  const showSlotModal = ref(false)
  const editingSlot = ref<any>(null)

  const stages = ref([
    { id: 1, name: 'Main Stage', icon: 'mdi-speaker', color: '#8b5cf6' },
    { id: 2, name: 'Tech Stage', icon: 'mdi-speaker-wireless', color: '#3b82f6' },
    { id: 3, name: 'Lounge', icon: 'mdi-music', color: '#10b981' },
  ])

  const timeSlots = ['22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00']

  const slots = ref([
    {
      id: 1,
      stageId: 1,
      startTime: '22:00',
      endTime: '23:30',
      artist: {
        name: 'DJ Alok',
        genre: 'Brazilian Bass',
        avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
        instagram: 'alfrfrfr',
        spotify: 'https://open.spotify.com/artist/0NGAZxHanS9e0iNhby2N6T',
        soundcloud: null,
      },
    },
    {
      id: 2,
      stageId: 1,
      startTime: '23:30',
      endTime: '01:00',
      artist: {
        name: 'Vintage Culture',
        genre: 'House',
        avatar: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200&h=200&fit=crop',
        instagram: 'vintageculture',
        spotify: 'https://open.spotify.com/artist/6jpLWcSsnCMHmxGCk0xSaw',
        soundcloud: 'https://soundcloud.com/vintageculture',
      },
    },
    {
      id: 3,
      stageId: 1,
      startTime: '01:00',
      endTime: '02:30',
      artist: {
        name: 'Cat Dealers',
        genre: 'House / Pop',
        avatar: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=200&h=200&fit=crop',
        instagram: 'catdealers',
        spotify: null,
        soundcloud: null,
      },
    },
    {
      id: 4,
      stageId: 2,
      startTime: '22:30',
      endTime: '00:00',
      artist: {
        name: 'Anna',
        genre: 'Techno',
        avatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&h=200&fit=crop',
        instagram: 'djannamusic',
        spotify: null,
        soundcloud: null,
      },
    },
    {
      id: 5,
      stageId: 2,
      startTime: '00:00',
      endTime: '02:00',
      artist: {
        name: 'Mochakk',
        genre: 'Tech House',
        avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop',
        instagram: 'mochakk',
        spotify: null,
        soundcloud: null,
      },
    },
  ])

  const slotForm = ref({
    name: '',
    genre: '',
    startTime: '22:00',
    endTime: '23:00',
    stageId: 1,
    avatar: '',
    instagram: '',
    spotify: '',
  })

  const filteredSlots = computed(() => {
    return slots.value.filter(s => s.stageId === activeStage.value)
  })

  const upcomingSlots = computed(() => {
    const sorted = [...slots.value]
    sorted.sort((a, b) => a.startTime.localeCompare(b.startTime))
    return sorted.slice(0, 4)
  })

  const totalHours = computed(() => {
    let total = 0
    for (const slot of slots.value) {
      const start = parseTime(slot.startTime)
      let end = parseTime(slot.endTime)
      if (end < start) end += 24
      total += end - start
    }
    return Math.round(total)
  })

  const uniqueGenres = computed(() => {
    const genres = new Set(slots.value.map(s => s.artist.genre))
    return genres.size
  })

  const nowPosition = computed(() => {
    const now = new Date()
    const hour = now.getHours() + now.getMinutes() / 60
    // Map 22:00-06:00 to 0-100%
    const adjusted = hour >= 22 ? hour - 22 : hour + 2
    return (adjusted / 8) * 100
  })

  function parseTime (time: string): number {
    const [h] = time.split(':').map(Number)
    return h ?? 0
  }

  function getSlotStyle (slot: any) {
    const startHour = parseTime(slot.startTime)
    const endHour = parseTime(slot.endTime)

    // Adjust for timeline starting at 22:00
    const adjustedStart = startHour >= 22 ? startHour - 22 : startHour + 2
    let adjustedEnd = endHour >= 22 ? endHour - 22 : endHour + 2
    if (adjustedEnd < adjustedStart) adjustedEnd += 24

    const left = (adjustedStart / 8) * 100
    const width = ((adjustedEnd - adjustedStart) / 8) * 100

    const stage = stages.value.find(s => s.id === slot.stageId)

    return {
      'left': `${left}%`,
      'width': `${width}%`,
      '--slot-color': stage?.color || '#8b5cf6',
    }
  }

  function getStageColor (stageId: number) {
    const stage = stages.value.find(s => s.id === stageId)
    return stage?.color || '#8b5cf6'
  }

  function getStageName (stageId: number) {
    const stage = stages.value.find(s => s.id === stageId)
    return stage?.name || ''
  }

  function openSlotModal (slot?: any) {
    if (slot) {
      editingSlot.value = slot
      slotForm.value = {
        name: slot.artist.name,
        genre: slot.artist.genre,
        startTime: slot.startTime,
        endTime: slot.endTime,
        stageId: slot.stageId,
        avatar: slot.artist.avatar,
        instagram: slot.artist.instagram || '',
        spotify: slot.artist.spotify || '',
      }
    } else {
      editingSlot.value = null
      slotForm.value = {
        name: '',
        genre: '',
        startTime: '22:00',
        endTime: '23:00',
        stageId: activeStage.value,
        avatar: '',
        instagram: '',
        spotify: '',
      }
    }
    showSlotModal.value = true
  }

  function closeSlotModal () {
    showSlotModal.value = false
    editingSlot.value = null
  }

  function saveSlot () {
    const formData = slotForm.value
    if (!formData.name) return

    if (editingSlot.value) {
      const slot = slots.value.find(s => s.id === editingSlot.value.id)
      if (slot) {
        slot.startTime = formData.startTime
        slot.endTime = formData.endTime
        slot.stageId = formData.stageId
        slot.artist = {
          name: formData.name,
          genre: formData.genre,
          avatar: formData.avatar || 'https://via.placeholder.com/200',
          instagram: formData.instagram || '',
          spotify: formData.spotify || '',
          soundcloud: '',
        }
      }
    } else {
      slots.value.push({
        id: Date.now(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        stageId: formData.stageId,
        artist: {
          name: formData.name,
          genre: formData.genre,
          avatar: formData.avatar || 'https://via.placeholder.com/200',
          instagram: formData.instagram || '',
          spotify: formData.spotify || '',
          soundcloud: '',
        },
      })
    }
    closeSlotModal()
  }

  function editSlot (slot: any) {
    openSlotModal(slot)
  }

  function deleteSlot (id: number) {
    slots.value = slots.value.filter(s => s.id !== id)
  }

  function addStage () {
    const newId = Math.max(...stages.value.map(s => s.id)) + 1
    const colors = ['#ec4899', '#f59e0b', '#6366f1', '#14b8a6']
    stages.value.push({
      id: newId,
      name: `Stage ${newId}`,
      icon: 'mdi-speaker',
      color: colors[newId % colors.length] ?? '#8b5cf6',
    })
  }
</script>

<style scoped>
.lineup-manager {
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

.add-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #8b5cf6, #b46cff);
    border: none;
    border-radius: 14px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.add-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.35);
}

/* Timeline Container */
.timeline-container {
    background: white;
    border-radius: 20px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
}

.timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
}

.stage-tabs {
    display: flex;
    gap: 8px;
}

.stage-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: #f3f4f6;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;
}

.stage-tab:hover {
    background: #e5e7eb;
}

.stage-tab--active {
    background: var(--color);
    color: white;
}

.stage-tab--add {
    padding: 10px 14px;
    background: transparent;
    border: 2px dashed #e5e7eb;
}

.stage-tab--add:hover {
    border-color: #8b5cf6;
    color: #8b5cf6;
}

.timeline-actions {
    display: flex;
    gap: 8px;
}

.view-btn {
    width: 40px;
    height: 40px;
    background: #f3f4f6;
    border: none;
    border-radius: 10px;
    color: #6b7280;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
}

.view-btn:hover {
    background: #e5e7eb;
}

.view-btn--active {
    background: #8b5cf6;
    color: white;
}

/* Timeline View */
.timeline-view {
    padding: 24px;
    overflow-x: auto;
}

.time-ruler {
    display: flex;
    margin-bottom: 8px;
    padding-left: 0;
}

.time-mark {
    flex: 1;
    min-width: 100px;
    font-size: 12px;
    font-weight: 600;
    color: #9ca3af;
}

.timeline-track {
    position: relative;
    height: 80px;
    background: linear-gradient(90deg, #f3f4f6 0%, #f3f4f6 12.5%, #f9fafb 12.5%, #f9fafb 25%, #f3f4f6 25%, #f3f4f6 37.5%, #f9fafb 37.5%, #f9fafb 50%, #f3f4f6 50%, #f3f4f6 62.5%, #f9fafb 62.5%, #f9fafb 75%, #f3f4f6 75%, #f3f4f6 87.5%, #f9fafb 87.5%, #f9fafb 100%);
    border-radius: 12px;
    min-width: 800px;
}

.timeline-slot {
    position: absolute;
    top: 8px;
    bottom: 8px;
    background: linear-gradient(135deg, var(--slot-color), color-mix(in srgb, var(--slot-color) 80%, white));
    border-radius: 10px;
    padding: 10px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    overflow: hidden;
}

.timeline-slot:hover {
    transform: scaleY(1.05);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.slot-content {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
}

.slot-avatar {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.slot-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.slot-name {
    font-size: 14px;
    font-weight: 600;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.slot-time {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
}

.slot-actions {
    opacity: 0;
    transition: opacity 0.2s;
}

.timeline-slot:hover .slot-actions {
    opacity: 1;
}

.slot-action {
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 6px;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.slot-action:hover {
    background: rgba(255, 255, 255, 0.3);
}

.timeline-now {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #ef4444;
}

.now-label {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 2px 8px;
    background: #ef4444;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    color: white;
    white-space: nowrap;
}

/* Grid View */
.grid-view {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    padding: 24px;
}

.grid-card {
    background: #f9fafb;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.grid-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.card-image {
    height: 140px;
    background-size: cover;
    background-position: center;
    position: relative;
}

.card-time {
    position: absolute;
    bottom: 10px;
    left: 10px;
    padding: 4px 10px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    color: white;
}

.card-content {
    padding: 16px;
}

.card-name {
    font-size: 16px;
    font-weight: 600;
    color: #2d2d3a;
    margin: 0 0 4px;
}

.card-genre {
    font-size: 13px;
    color: #6b7280;
}

.card-social {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}

.social-link {
    width: 32px;
    height: 32px;
    background: #e5e7eb;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    text-decoration: none;
    transition: all 0.2s;
}

.social-link:hover {
    background: #8b5cf6;
    color: white;
}

.card-actions {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 6px;
    opacity: 0;
    transition: opacity 0.2s;
}

.grid-card:hover .card-actions {
    opacity: 1;
}

.card-action {
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 8px;
    color: #6b7280;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.card-action:hover {
    background: white;
}

.card-action--danger:hover {
    color: #dc2626;
}

.add-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: 200px;
    border: 2px dashed #e5e7eb;
    border-radius: 16px;
    color: #9ca3af;
    cursor: pointer;
    transition: all 0.3s ease;
}

.add-card:hover {
    border-color: #8b5cf6;
    color: #8b5cf6;
}

.add-card .mdi {
    font-size: 40px;
}

/* Upcoming Section */
.upcoming-section {
    background: white;
    border-radius: 20px;
    border: 1px solid #e5e7eb;
    padding: 24px;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    color: #2d2d3a;
    margin: 0 0 20px;
}

.upcoming-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.upcoming-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px;
    background: #f9fafb;
    border-radius: 14px;
    transition: all 0.2s;
}

.upcoming-item:hover {
    background: #f3f4f6;
}

.upcoming-item--next {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(236, 72, 153, 0.08));
    border: 1px solid rgba(139, 92, 246, 0.2);
}

.upcoming-index {
    width: 28px;
    height: 28px;
    background: #e5e7eb;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: #6b7280;
}

.upcoming-item--next .upcoming-index {
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    color: white;
}

.upcoming-avatar {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    object-fit: cover;
}

.upcoming-info {
    flex: 1;
}

.upcoming-name {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: #2d2d3a;
}

.upcoming-time {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #6b7280;
}

.upcoming-stage {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: white;
}

.upcoming-live {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    color: #ef4444;
}

.live-dot {
    width: 6px;
    height: 6px;
    background: #ef4444;
    border-radius: 50%;
    animation: blink 1s infinite;
}

@keyframes blink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.3;
    }
}

/* Stats Section */
.stats-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: white;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
}

.stat-icon {
    font-size: 32px;
    color: #8b5cf6;
}

.stat-value {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: #2d2d3a;
}

.stat-label {
    display: block;
    font-size: 13px;
    color: #6b7280;
}

/* Modal */
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

.slot-modal {
    background: white;
    border-radius: 20px;
    width: 90%;
    max-width: 560px;
    overflow: hidden;
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

.modal-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.form-group input {
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    font-size: 14px;
}

.form-group input:focus {
    outline: none;
    border-color: #8b5cf6;
}

.stage-select {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.stage-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    background: none;
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;
}

.stage-option:hover {
    border-color: var(--color);
    color: var(--color);
}

.stage-option--selected {
    border-color: var(--color);
    background: var(--color);
    color: white;
}

.avatar-upload {
    display: flex;
    align-items: center;
    gap: 16px;
}

.avatar-preview {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    object-fit: cover;
}

.avatar-placeholder {
    width: 64px;
    height: 64px;
    background: #f3f4f6;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 28px;
}

.avatar-upload input {
    flex: 1;
}

.social-input {
    display: flex;
    align-items: center;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
}

.social-input .mdi {
    padding: 12px;
    background: #f3f4f6;
    color: #6b7280;
    font-size: 18px;
}

.social-input input {
    flex: 1;
    border: none;
    padding: 12px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid #e5e7eb;
}

.modal-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.modal-btn--secondary {
    background: #f3f4f6;
    color: #374151;
}

.modal-btn--primary {
    background: linear-gradient(135deg, #8b5cf6, #b46cff);
    color: white;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
    transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-from .slot-modal,
.modal-leave-to .slot-modal {
    transform: scale(0.9) translateY(20px);
}

@media (max-width: 768px) {
    .form-row {
        grid-template-columns: 1fr;
    }

    .stage-tabs {
        flex-wrap: wrap;
    }
}
</style>
