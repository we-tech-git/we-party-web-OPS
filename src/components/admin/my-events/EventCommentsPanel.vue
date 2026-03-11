<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { createEventComment, deleteEventComment, type EventComment, getEventComments } from '@/services/events'

  const props = defineProps<{ eventId: string, eventTitle: string }>()
  const emit = defineEmits<{ (e: 'close'): void }>()

  interface LocalComment extends EventComment {
    _deleted?: boolean
    _isAdminReply?: boolean
  }

  const comments = ref<LocalComment[]>([])
  const isLoading = ref(false)
  const loadError = ref('')
  const deletingId = ref<string | null>(null)
  const searchQuery = ref('')
  const replyingToId = ref<string | null>(null)
  const replyContent = ref('')
  const postingReplyId = ref<string | null>(null)

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

      comments.value = list.map((c: any) => ({
        id: c.id ?? c._id ?? '',
        eventId: c.eventId ?? c.event_id ?? props.eventId,
        userId: c.userId ?? c.user_id ?? c.user?.id ?? '',
        userName: c.userName ?? c.user_name ?? c.user?.name ?? c.user?.username ?? c.author?.name ?? 'Usuário',
        userAvatar: c.userAvatar ?? c.user_avatar ?? c.user?.avatar ?? c.user?.photo ?? c.author?.avatar ?? null,
        content: c.content ?? c.text ?? c.message ?? c.body ?? '',
        createdAt: c.createdAt ?? c.created_at ?? c.date ?? '',
        updatedAt: c.updatedAt ?? c.updated_at ?? '',
        _isAdminReply: c._isAdminReply ?? false,
      }))
    } catch (error: any) {
      console.error('[Comments] fetch error:', error?.response?.status, error?.response?.data || error)
      loadError.value = `Não foi possível carregar os comentários. (${error?.response?.status ?? 'erro'})`
    } finally {
      isLoading.value = false
    }
  }

  async function deleteComment (id: string) {
    deletingId.value = id
    try {
      await deleteEventComment(props.eventId, id)
      const idx = comments.value.findIndex(c => c.id === id)
      if (idx !== -1) comments.value[idx] = { ...comments.value[idx]!, _deleted: true }
    } catch {
      // silently ignore
    } finally {
      deletingId.value = null
    }
  }

  function toggleReply (id: string) {
    if (replyingToId.value === id) {
      replyingToId.value = null
      replyContent.value = ''
    } else {
      replyingToId.value = id
      replyContent.value = ''
    }
  }

  async function postReply (comment: LocalComment) {
    if (!replyContent.value.trim()) return
    postingReplyId.value = comment.id
    try {
      const res = await createEventComment(props.eventId, replyContent.value.trim()) as any
      const newComment: LocalComment = {
        id: res?.id ?? res?.data?.id ?? String(Date.now()),
        eventId: props.eventId,
        userId: 'admin',
        userName: 'Administrador',
        userAvatar: null,
        content: replyContent.value.trim(),
        createdAt: new Date().toISOString(),
        _isAdminReply: true,
      }
      const idx = comments.value.findIndex(c => c.id === comment.id)
      comments.value.splice(idx + 1, 0, newComment)
      replyingToId.value = null
      replyContent.value = ''
    } catch {
      // silently ignore
    } finally {
      postingReplyId.value = null
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
        :class="{ 'cp-item--admin': comment._isAdminReply, 'cp-item--deleted': comment._deleted }"
      >
        <!-- Avatar -->
        <div v-if="comment._isAdminReply" class="cp-avatar cp-avatar--admin">
          <span class="mdi mdi-shield-account" />
        </div>
        <img v-else-if="comment.userAvatar" :alt="comment.userName" class="cp-avatar" :src="comment.userAvatar">
        <div v-else class="cp-avatar cp-avatar--placeholder">
          <span class="mdi mdi-account" />
        </div>

        <!-- Body -->
        <div class="cp-body">
          <div class="cp-meta">
            <span class="cp-username">{{ comment._isAdminReply ? 'Administrador' : (comment.userName || 'Usuário') }}</span>
            <span v-if="comment._isAdminReply" class="cp-admin-badge">Admin</span>
            <span class="cp-date">{{ formatDate(comment.createdAt) }}</span>
          </div>

          <!-- Deleted placeholder -->
          <p v-if="comment._deleted" class="cp-content cp-content--deleted">
            <span class="mdi mdi-trash-can-outline" />
            Mensagem apagada pelo administrador do evento.
          </p>

          <!-- Normal content -->
          <p v-else class="cp-content">{{ comment.content }}</p>

          <!-- Reply box -->
          <div v-if="replyingToId === comment.id" class="cp-reply-box">
            <textarea
              v-model="replyContent"
              class="cp-textarea"
              placeholder="Escreva sua resposta..."
              rows="3"
            />
            <div class="cp-reply-actions">
              <button
                class="cp-btn cp-btn--save"
                :disabled="!replyContent.trim() || postingReplyId === comment.id"
                type="button"
                @click="postReply(comment)"
              >
                <span class="mdi" :class="postingReplyId === comment.id ? 'mdi-loading mdi-spin' : 'mdi-send'" />
                Responder
              </button>
              <button class="cp-btn cp-btn--cancel" type="button" @click="toggleReply(comment.id)">
                Cancelar
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="!comment._deleted" class="cp-actions">
          <button
            v-if="!comment._isAdminReply"
            class="cp-action cp-action--reply"
            title="Responder"
            type="button"
            @click="toggleReply(comment.id)"
          >
            <span class="mdi mdi-reply" />
          </button>
          <button
            class="cp-action cp-action--delete"
            :disabled="deletingId === comment.id"
            title="Apagar"
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

.cp-item--admin {
  background: rgba(255, 79, 148, 0.03);
  border-left: 3px solid rgba(255, 79, 148, 0.3);
  padding-left: 21px;
}

.cp-item--deleted {
  opacity: 0.6;
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

.cp-avatar--admin {
  background: linear-gradient(135deg, #ff4f94 0%, #f9a538 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
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
  flex-wrap: wrap;
}

.cp-username {
  font-size: 13px;
  font-weight: 700;
  color: #2d2d3a;
}

.cp-admin-badge {
  background: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
  border-radius: 999px;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.03em;
  padding: 2px 8px;
  text-transform: uppercase;
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

.cp-content--deleted {
  color: #aaaabc;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Reply box */
.cp-reply-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
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
  box-sizing: border-box;
}

.cp-textarea:focus {
  border-color: rgba(255, 79, 148, 0.4);
  outline: none;
}

.cp-reply-actions {
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
  cursor: not-allowed;
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

.cp-action--reply:hover {
  background: rgba(139, 107, 255, 0.1);
  color: #8b6bff;
}

.cp-action--delete:hover {
  background: rgba(216, 43, 86, 0.1);
  color: #d82b56;
}
</style>
