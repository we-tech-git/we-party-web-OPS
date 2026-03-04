<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { deleteEventComment, type EventComment, getEventComments, updateEventComment } from '@/services/events'

  const props = defineProps<{ eventId: string, eventTitle: string }>()
  const emit = defineEmits<{ (e: 'close'): void }>()

  const comments = ref<EventComment[]>([])
  const isLoading = ref(false)
  const loadError = ref('')
  const editingId = ref<string | null>(null)
  const editingContent = ref('')
  const deletingId = ref<string | null>(null)
  const savingId = ref<string | null>(null)
  const searchQuery = ref('')

  async function fetchComments () {
    isLoading.value = true
    loadError.value = ''
    try {
      const res = await getEventComments(props.eventId) as any
      console.log('[Comments] raw response:', JSON.stringify(res))

      let list: any[] = []
      if (Array.isArray(res)) {
        list = res
      } else if (Array.isArray(res?.data?.data)) {
        list = res.data.data
      } else if (Array.isArray(res?.data)) {
        list = res.data
      } else if (Array.isArray(res?.content)) {
        list = res.content
      } else if (Array.isArray(res?.comments)) {
        list = res.comments
      } else if (Array.isArray(res?.items)) {
        list = res.items
      }

      console.log('[Comments] parsed list:', list.length, list)

      // normalize: backend can return user data nested or flat
      comments.value = list.map((c: any) => ({
        id: c.id ?? c._id ?? '',
        eventId: c.eventId ?? c.event_id ?? props.eventId,
        userId: c.userId ?? c.user_id ?? c.user?.id ?? '',
        userName: c.userName ?? c.user_name ?? c.user?.name ?? c.user?.username ?? c.author?.name ?? 'Usuário',
        userAvatar: c.userAvatar ?? c.user_avatar ?? c.user?.avatar ?? c.user?.photo ?? c.author?.avatar ?? null,
        content: c.content ?? c.text ?? c.message ?? c.body ?? '',
        createdAt: c.createdAt ?? c.created_at ?? c.date ?? '',
        updatedAt: c.updatedAt ?? c.updated_at ?? '',
      }))
    } catch (error: any) {
      console.error('[Comments] fetch error:', error?.response?.status, error?.response?.data || error)
      loadError.value = `Não foi possível carregar os comentários. (${error?.response?.status ?? 'erro'})`
    } finally {
      isLoading.value = false
    }
  }

  function startEdit (comment: EventComment) {
    editingId.value = comment.id
    editingContent.value = comment.content
  }

  function cancelEdit () {
    editingId.value = null
    editingContent.value = ''
  }

  async function saveEdit (comment: EventComment) {
    if (!editingContent.value.trim()) return
    savingId.value = comment.id
    try {
      await updateEventComment(props.eventId, comment.id, editingContent.value.trim())
      const idx = comments.value.findIndex(c => c.id === comment.id)
      if (idx !== -1) comments.value[idx] = { ...comments.value[idx], content: editingContent.value.trim() } as EventComment
      cancelEdit()
    } catch {
      // silently ignore; could add toast
    } finally {
      savingId.value = null
    }
  }

  async function deleteComment (id: string) {
    deletingId.value = id
    try {
      await deleteEventComment(props.eventId, id)
      comments.value = comments.value.filter(c => c.id !== id)
    } catch {
      // silently ignore
    } finally {
      deletingId.value = null
    }
  }

  function formatDate (dateStr: string) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function filteredComments () {
    if (!searchQuery.value.trim()) return comments.value
    const q = searchQuery.value.toLowerCase()
    return comments.value.filter(c =>
      c.content?.toLowerCase().includes(q)
      || c.userName?.toLowerCase().includes(q),
    )
  }

  onMounted(fetchComments)
</script>

<template>
  <div aria-modal="true" class="comments-panel" role="dialog">
    <!-- Header -->
    <header class="cp-header">
      <div>
        <h3 class="cp-title">Comentários</h3>
        <p class="cp-sub">{{ eventTitle }}</p>
      </div>
      <div class="cp-header-right">
        <span class="cp-count">{{ comments.length }} {{ comments.length === 1 ? 'comentário' : 'comentários' }}</span>
        <button class="cp-close" type="button" @click="emit('close')">
          <span class="mdi mdi-close" />
        </button>
      </div>
    </header>

    <!-- Search -->
    <div class="cp-search">
      <span class="mdi mdi-magnify cp-search-icon" />
      <input
        v-model="searchQuery"
        class="cp-search-input"
        placeholder="Buscar comentários ou usuários..."
        type="search"
      >
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="cp-state">
      <span class="mdi mdi-loading mdi-spin cp-state-icon cp-state-icon--loading" />
      <span>Carregando comentários...</span>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="cp-state cp-state--error">
      <span class="mdi mdi-alert-circle-outline cp-state-icon" />
      <span>{{ loadError }}</span>
      <button class="cp-retry" type="button" @click="fetchComments">Tentar novamente</button>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredComments().length === 0" class="cp-state">
      <span class="mdi mdi-comment-off-outline cp-state-icon" />
      <p class="cp-state-title">{{ searchQuery ? 'Nenhum resultado encontrado' : 'Nenhum comentário ainda' }}</p>
      <p v-if="!searchQuery" class="cp-state-sub">Quando os participantes comentarem no evento, aparecerão aqui.</p>
    </div>

    <!-- List -->
    <ul v-else class="cp-list">
      <li
        v-for="comment in filteredComments()"
        :key="comment.id"
        class="cp-item"
        :class="{ 'cp-item--editing': editingId === comment.id }"
      >
        <!-- Avatar -->
        <img
          v-if="comment.userAvatar"
          :alt="comment.userName"
          class="cp-avatar"
          :src="comment.userAvatar"
        >
        <div v-else class="cp-avatar cp-avatar--placeholder">
          <span class="mdi mdi-account" />
        </div>

        <!-- Body -->
        <div class="cp-body">
          <div class="cp-meta">
            <span class="cp-username">{{ comment.userName || 'Usuário' }}</span>
            <span class="cp-date">{{ formatDate(comment.createdAt) }}</span>
          </div>

          <!-- Edit mode -->
          <div v-if="editingId === comment.id" class="cp-edit-row">
            <textarea
              v-model="editingContent"
              class="cp-textarea"
              rows="3"
            />
            <div class="cp-edit-actions">
              <button
                class="cp-btn cp-btn--save"
                :disabled="savingId === comment.id"
                type="button"
                @click="saveEdit(comment)"
              >
                <span class="mdi" :class="savingId === comment.id ? 'mdi-loading mdi-spin' : 'mdi-check'" />
                Salvar
              </button>
              <button class="cp-btn cp-btn--cancel" type="button" @click="cancelEdit">
                Cancelar
              </button>
            </div>
          </div>

          <!-- Read mode -->
          <p v-else class="cp-content">{{ comment.content }}</p>
        </div>

        <!-- Actions -->
        <div v-if="editingId !== comment.id" class="cp-actions">
          <button
            class="cp-action cp-action--edit"
            title="Editar"
            type="button"
            @click="startEdit(comment)"
          >
            <span class="mdi mdi-pencil-outline" />
          </button>
          <button
            class="cp-action cp-action--delete"
            :disabled="deletingId === comment.id"
            title="Excluir"
            type="button"
            @click="deleteComment(comment.id)"
          >
            <span class="mdi" :class="deletingId === comment.id ? 'mdi-loading mdi-spin' : 'mdi-trash-can-outline'" />
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.comments-panel {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  max-height: 80vh;
  width: 560px;
  max-width: calc(100vw - 48px);
  box-shadow: 0 24px 80px rgba(33, 33, 77, 0.2);
}

/* Header */
.cp-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(219, 219, 229, 0.7);
  flex-shrink: 0;
}

.cp-title {
  font-size: 17px;
  font-weight: 800;
  color: #2d2d3a;
  margin: 0 0 2px;
}

.cp-sub {
  font-size: 12px;
  color: #8b8b99;
  margin: 0;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cp-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.cp-count {
  background: #f4f4fb;
  border-radius: 999px;
  color: #6b6b7b;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
}

.cp-close {
  background: #f4f4fb;
  border: none;
  border-radius: 8px;
  color: #8b8b99;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  height: 32px;
  width: 32px;
  transition: background 0.15s, color 0.15s;
}

.cp-close:hover {
  background: #ebebf5;
  color: #3b3b45;
}

/* Search */
.cp-search {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid rgba(219, 219, 229, 0.7);
  padding: 10px 24px;
  flex-shrink: 0;
}

.cp-search-icon {
  color: #aaaabc;
  font-size: 16px;
  flex-shrink: 0;
}

.cp-search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #3b3b45;
  font-size: 13px;
  padding: 4px 0;
}

.cp-search-input:focus {
  outline: none;
}

.cp-search-input::-webkit-search-cancel-button {
  display: none;
}

/* States */
.cp-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 48px 24px;
  text-align: center;
  color: #8b8b99;
  font-size: 13px;
}

.cp-state--error {
  color: #d82b56;
}

.cp-state-icon {
  font-size: 40px;
  opacity: 0.4;
}

.cp-state-icon--loading {
  color: #ff4f94;
  opacity: 1;
}

.cp-state-title {
  font-size: 14px;
  font-weight: 700;
  color: #3b3b45;
  margin: 0;
}

.cp-state-sub {
  font-size: 12px;
  color: #aaaabc;
  margin: 0;
  max-width: 260px;
  line-height: 1.5;
}

.cp-retry {
  background: transparent;
  border: 1.5px solid rgba(216, 43, 86, 0.4);
  border-radius: 8px;
  color: #d82b56;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  transition: background 0.15s;
}

.cp-retry:hover {
  background: rgba(216, 43, 86, 0.06);
}

/* List */
.cp-list {
  list-style: none;
  margin: 0;
  padding: 12px 0;
  overflow-y: auto;
  flex: 1;
}

.cp-item {
  display: flex;
  gap: 12px;
  padding: 12px 24px;
  transition: background 0.15s;
  align-items: flex-start;
}

.cp-item:hover {
  background: rgba(244, 244, 251, 0.8);
}

.cp-item--editing {
  background: rgba(255, 79, 148, 0.04);
}

/* Avatar */
.cp-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.cp-avatar--placeholder {
  background: linear-gradient(135deg, #f0e8ff 0%, #ffe8f4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(139, 107, 255, 0.5);
  font-size: 18px;
}

/* Body */
.cp-body {
  flex: 1;
  min-width: 0;
}

.cp-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.cp-username {
  font-size: 13px;
  font-weight: 700;
  color: #2d2d3a;
}

.cp-date {
  font-size: 11px;
  color: #aaaabc;
}

.cp-content {
  font-size: 13px;
  color: #4b4b5b;
  line-height: 1.5;
  margin: 0;
  word-break: break-word;
}

/* Edit */
.cp-edit-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cp-textarea {
  width: 100%;
  background: #f9f9fc;
  border: 1.5px solid rgba(219, 219, 229, 0.9);
  border-radius: 10px;
  color: #2d2d3a;
  font-size: 13px;
  line-height: 1.5;
  padding: 10px 12px;
  resize: vertical;
  transition: border-color 0.2s;
}

.cp-textarea:focus {
  border-color: rgba(255, 79, 148, 0.4);
  outline: none;
}

.cp-edit-actions {
  display: flex;
  gap: 8px;
}

.cp-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  transition: opacity 0.15s, transform 0.15s;
  border: none;
}

.cp-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.cp-btn--save {
  background: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
  color: #ffffff;
}

.cp-btn--cancel {
  background: #f4f4fb;
  color: #6b6b7b;
}

/* Actions */
.cp-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s;
}

.cp-item:hover .cp-actions {
  opacity: 1;
}

.cp-action {
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  height: 32px;
  width: 32px;
  transition: background 0.15s, color 0.15s;
  color: #aaaabc;
}

.cp-action:disabled {
  opacity: 0.5;
  cursor: wait;
}

.cp-action--edit:hover {
  background: rgba(139, 107, 255, 0.1);
  color: #8b6bff;
}

.cp-action--delete:hover {
  background: rgba(216, 43, 86, 0.1);
  color: #d82b56;
}
</style>
