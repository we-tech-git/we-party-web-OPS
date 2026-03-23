<template>
  <div class="engagement-hub">
    <header class="hub-header">
      <div class="header-info">
        <h1 class="page-title">{{ t('admin.engagement.title') }}</h1>
        <p class="page-subtitle">{{ t('admin.engagement.subtitle') }}</p>
      </div>
    </header>

    <!-- Tabs -->
    <div class="hub-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="hub-tab"
        :class="{ 'hub-tab--active': activeTab === tab.key }"
        type="button"
        @click="activeTab = tab.key as 'chat' | 'polls' | 'stories' | 'push'"
      >
        <span class="mdi" :class="tab.icon" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Chat Section -->
    <section v-if="activeTab === 'chat'" class="content-section">
      <div class="chat-container">
        <div class="chat-sidebar">
          <div class="chat-search">
            <span class="mdi mdi-magnify" />
            <input v-model="chatSearch" placeholder="Buscar conversa..." type="search">
          </div>
          <div class="chat-list">
            <div
              v-for="chat in filteredChats"
              :key="chat.id"
              class="chat-item"
              :class="{ 'chat-item--active': selectedChat?.id === chat.id }"
              @click="selectChat(chat)"
            >
              <img :alt="chat.name" class="chat-avatar" :src="chat.avatar">
              <div class="chat-info">
                <span class="chat-name">{{ chat.name }}</span>
                <span class="chat-preview">{{ chat.lastMessage }}</span>
              </div>
              <div class="chat-meta">
                <span class="chat-time">{{ chat.time }}</span>
                <span v-if="chat.unread" class="chat-unread">{{ chat.unread }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-main">
          <template v-if="selectedChat">
            <header class="chat-header">
              <img :alt="selectedChat.name" class="chat-header-avatar" :src="selectedChat.avatar">
              <div class="chat-header-info">
                <span class="chat-header-name">{{ selectedChat.name }}</span>
                <span class="chat-header-status">Online</span>
              </div>
            </header>
            <div class="chat-messages">
              <div
                v-for="msg in messages"
                :key="msg.id"
                class="message"
                :class="{ 'message--sent': msg.sent }"
              >
                <div class="message-bubble">
                  <p>{{ msg.text }}</p>
                  <span class="message-time">{{ msg.time }}</span>
                </div>
              </div>
            </div>
            <div class="chat-input">
              <input
                v-model="newMessage"
                placeholder="Digite sua mensagem..."
                type="text"
                @keyup.enter="sendMessage"
              >
              <button class="send-btn" type="button" @click="sendMessage">
                <span class="mdi mdi-send" />
              </button>
            </div>
          </template>
          <div v-else class="chat-empty">
            <span class="mdi mdi-chat-outline" />
            <p>{{ t('admin.engagement.selectChat') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Polls Section -->
    <section v-if="activeTab === 'polls'" class="content-section">
      <div class="polls-header">
        <h2 class="section-title">{{ t('admin.engagement.pollsTitle') }}</h2>
        <button class="create-btn" type="button" @click="openPollModal">
          <span class="mdi mdi-plus" />
          {{ t('admin.engagement.createPoll') }}
        </button>
      </div>

      <div class="polls-grid">
        <div
          v-for="poll in polls"
          :key="poll.id"
          class="poll-card"
          :class="{ 'poll-card--active': poll.active }"
        >
          <div class="poll-status">
            <span class="status-dot" :class="{ 'status-dot--active': poll.active }" />
            {{ poll.active ? 'Ativa' : 'Encerrada' }}
          </div>
          <h3 class="poll-question">{{ poll.question }}</h3>
          <div class="poll-options">
            <div v-for="option in poll.options" :key="option.id" class="poll-option">
              <div class="option-bar">
                <div class="option-fill" :style="{ width: `${option.percent}%` }" />
              </div>
              <div class="option-info">
                <span class="option-text">{{ option.text }}</span>
                <span class="option-percent">{{ option.percent }}%</span>
              </div>
            </div>
          </div>
          <div class="poll-footer">
            <span class="poll-votes">
              <span class="mdi mdi-account-group" />
              {{ poll.totalVotes }} votos
            </span>
            <div class="poll-actions">
              <button v-if="poll.active" class="poll-action" type="button" @click="closePoll(poll.id)">
                <span class="mdi mdi-stop-circle" />
              </button>
              <button class="poll-action" type="button" @click="deletePoll(poll.id)">
                <span class="mdi mdi-delete" />
              </button>
            </div>
          </div>
        </div>

        <div class="add-poll-card" @click="openPollModal">
          <span class="mdi mdi-plus" />
          <span>{{ t('admin.engagement.newPoll') }}</span>
        </div>
      </div>
    </section>

    <!-- Stories Section -->
    <section v-if="activeTab === 'stories'" class="content-section">
      <div class="stories-header">
        <h2 class="section-title">{{ t('admin.engagement.storiesTitle') }}</h2>
        <button class="create-btn" type="button" @click="openStoryModal">
          <span class="mdi mdi-plus" />
          {{ t('admin.engagement.addStory') }}
        </button>
      </div>

      <div class="stories-timeline">
        <div v-for="story in stories" :key="story.id" class="story-card">
          <div class="story-preview" :style="{ backgroundImage: `url(${story.image})` }">
            <div class="story-overlay">
              <span class="story-type mdi" :class="story.type === 'image' ? 'mdi-image' : 'mdi-video'" />
            </div>
          </div>
          <div class="story-info">
            <span class="story-time">{{ story.postedAt }}</span>
            <div class="story-stats">
              <span><span class="mdi mdi-eye" /> {{ story.views }}</span>
            </div>
          </div>
          <div class="story-actions">
            <button class="story-action" type="button" @click="deleteStory(story.id)">
              <span class="mdi mdi-delete" />
            </button>
          </div>
        </div>

        <div class="add-story-card" @click="openStoryModal">
          <span class="mdi mdi-plus" />
          <span>{{ t('admin.engagement.newStory') }}</span>
        </div>
      </div>
    </section>

    <!-- Notifications Push Section -->
    <section v-if="activeTab === 'push'" class="content-section">
      <div class="push-header">
        <h2 class="section-title">{{ t('admin.engagement.pushTitle') }}</h2>
      </div>

      <div class="push-composer">
        <div class="push-form">
          <div class="form-group">
            <label>{{ t('admin.engagement.pushTitleLabel') }}</label>
            <input v-model="pushNotification.title" placeholder="Título da notificação" type="text">
          </div>
          <div class="form-group">
            <label>{{ t('admin.engagement.pushMessage') }}</label>
            <textarea v-model="pushNotification.message" placeholder="Mensagem..." rows="3" />
          </div>
          <div class="form-group">
            <label>{{ t('admin.engagement.pushAudience') }}</label>
            <div class="audience-options">
              <label class="audience-option">
                <input v-model="pushNotification.audience" type="radio" value="all">
                <span class="mdi mdi-account-group" />
                Todos
              </label>
              <label class="audience-option">
                <input v-model="pushNotification.audience" type="radio" value="confirmed">
                <span class="mdi mdi-account-check" />
                Confirmados
              </label>
              <label class="audience-option">
                <input v-model="pushNotification.audience" type="radio" value="vip">
                <span class="mdi mdi-star" />
                VIPs
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>{{ t('admin.engagement.pushSchedule') }}</label>
            <div class="schedule-options">
              <label class="schedule-option">
                <input v-model="pushNotification.schedule" type="radio" value="now">
                Enviar agora
              </label>
              <label class="schedule-option">
                <input v-model="pushNotification.schedule" type="radio" value="later">
                Agendar
              </label>
            </div>
            <input
              v-if="pushNotification.schedule === 'later'"
              v-model="pushNotification.scheduledTime"
              class="schedule-input"
              type="datetime-local"
            >
          </div>
          <button class="send-push-btn" type="button" @click="sendPushNotification">
            <span class="mdi mdi-send" />
            {{ t('admin.engagement.sendPush') }}
          </button>
        </div>

        <div class="push-preview">
          <div class="phone-mockup">
            <div class="phone-notch" />
            <div class="phone-notification">
              <div class="notif-icon">
                <span class="mdi mdi-party-popper" />
              </div>
              <div class="notif-content">
                <span class="notif-app">We Party</span>
                <span class="notif-title">{{ pushNotification.title || 'Título' }}</span>
                <span class="notif-message">{{ pushNotification.message || 'Mensagem...' }}</span>
              </div>
              <span class="notif-time">agora</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sent Notifications History -->
      <div class="push-history">
        <h3 class="history-title">{{ t('admin.engagement.pushHistory') }}</h3>
        <div class="history-list">
          <div v-for="notif in sentNotifications" :key="notif.id" class="history-item">
            <div class="history-icon">
              <span class="mdi mdi-bell" />
            </div>
            <div class="history-info">
              <span class="history-title-text">{{ notif.title }}</span>
              <span class="history-message">{{ notif.message }}</span>
            </div>
            <div class="history-meta">
              <span class="history-date">{{ notif.sentAt }}</span>
              <span class="history-stats">
                <span class="mdi mdi-account" /> {{ notif.recipients }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Create Poll Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showPollModal" class="modal-backdrop" @click.self="closePollModal">
          <div class="poll-modal">
            <header class="modal-header">
              <h2>{{ t('admin.engagement.createPoll') }}</h2>
              <button class="close-btn" type="button" @click="closePollModal">
                <span class="mdi mdi-close" />
              </button>
            </header>
            <div class="modal-body">
              <div class="form-group">
                <label>{{ t('admin.engagement.pollQuestion') }}</label>
                <input v-model="newPoll.question" placeholder="Qual o melhor horário?" type="text">
              </div>
              <div class="form-group">
                <label>{{ t('admin.engagement.pollOptions') }}</label>
                <div v-for="(option, index) in newPoll.options" :key="index" class="option-input">
                  <input
                    v-model="newPoll.options[index]"
                    :placeholder="`Opção ${index + 1}`"
                    type="text"
                  >
                  <button
                    v-if="newPoll.options.length > 2"
                    class="remove-option"
                    type="button"
                    @click="removeOption(index)"
                  >
                    <span class="mdi mdi-close" />
                  </button>
                </div>
                <button class="add-option-btn" type="button" @click="addOption">
                  <span class="mdi mdi-plus" />
                  {{ t('admin.engagement.addOption') }}
                </button>
              </div>
            </div>
            <footer class="modal-footer">
              <button class="modal-btn modal-btn--secondary" type="button" @click="closePollModal">
                {{ t('admin.engagement.cancel') }}
              </button>
              <button class="modal-btn modal-btn--primary" type="button" @click="createPoll">
                {{ t('admin.engagement.publish') }}
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

  const activeTab = ref<'chat' | 'polls' | 'stories' | 'push'>('chat')

  const tabs = [
    { key: 'chat', label: 'Chat', icon: 'mdi-chat' },
    { key: 'polls', label: 'Enquetes', icon: 'mdi-poll' },
    { key: 'stories', label: 'Stories', icon: 'mdi-instagram' },
    { key: 'push', label: 'Notificações', icon: 'mdi-bell' },
  ]

  // Chat
  const chatSearch = ref('')
  const selectedChat = ref<any>(null)
  const newMessage = ref('')

  const chats = ref([
    { id: 1, name: 'Ana Silva', avatar: 'https://i.pravatar.cc/100?img=1', lastMessage: 'Oi, qual o horário do evento?', time: '14:30', unread: 2 },
    { id: 2, name: 'Bruno Costa', avatar: 'https://i.pravatar.cc/100?img=2', lastMessage: 'Obrigado pela informação!', time: '13:15', unread: 0 },
    { id: 3, name: 'Carla Mendes', avatar: 'https://i.pravatar.cc/100?img=3', lastMessage: 'Posso levar um amigo?', time: '12:00', unread: 1 },
  ])

  const messages = ref([
    { id: 1, text: 'Olá! Bem-vindo ao evento!', time: '14:00', sent: true },
    { id: 2, text: 'Oi, qual o horário do evento?', time: '14:30', sent: false },
    { id: 3, text: 'O evento começa às 22h e vai até às 6h! 🎉', time: '14:32', sent: true },
  ])

  const filteredChats = computed(() => {
    if (!chatSearch.value) return chats.value
    const query = chatSearch.value.toLowerCase()
    return chats.value.filter(c => c.name.toLowerCase().includes(query))
  })

  function selectChat (chat: any) {
    selectedChat.value = chat
    chat.unread = 0
  }

  function sendMessage () {
    if (!newMessage.value.trim()) return
    messages.value.push({
      id: Date.now(),
      text: newMessage.value,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      sent: true,
    })
    newMessage.value = ''
  }

  // Polls
  const showPollModal = ref(false)
  const newPoll = ref({
    question: '',
    options: ['', ''],
  })

  const polls = ref([
    {
      id: 1,
      question: 'Qual DJ vocês querem ver?',
      active: true,
      totalVotes: 156,
      options: [
        { id: 1, text: 'DJ Alok', percent: 45 },
        { id: 2, text: 'DJ Vintage Culture', percent: 35 },
        { id: 3, text: 'DJ Cat Dealers', percent: 20 },
      ],
    },
    {
      id: 2,
      question: 'Melhor horário para chegada?',
      active: false,
      totalVotes: 89,
      options: [
        { id: 1, text: '22h', percent: 60 },
        { id: 2, text: '23h', percent: 30 },
        { id: 3, text: '00h', percent: 10 },
      ],
    },
  ])

  function openPollModal () {
    showPollModal.value = true
  }

  function closePollModal () {
    showPollModal.value = false
    newPoll.value = { question: '', options: ['', ''] }
  }

  function addOption () {
    newPoll.value.options.push('')
  }

  function removeOption (index: number) {
    newPoll.value.options.splice(index, 1)
  }

  function createPoll () {
    if (!newPoll.value.question || newPoll.value.options.filter(Boolean).length < 2) return
    polls.value.unshift({
      id: Date.now(),
      question: newPoll.value.question,
      active: true,
      totalVotes: 0,
      options: newPoll.value.options.filter(Boolean).map((text, i) => ({ id: i + 1, text, percent: 0 })),
    })
    closePollModal()
  }

  function closePoll (id: number) {
    const poll = polls.value.find(p => p.id === id)
    if (poll) poll.active = false
  }

  function deletePoll (id: number) {
    polls.value = polls.value.filter(p => p.id !== id)
  }

  // Stories
  const stories = ref([
    { id: 1, type: 'image', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=300&fit=crop', postedAt: 'Há 2h', views: 245 },
    { id: 2, type: 'video', image: 'https://images.unsplash.com/photo-1527489782872-623b5e503b07?w=200&h=300&fit=crop', postedAt: 'Há 5h', views: 189 },
  ])

  function openStoryModal () {
    // TODO: Implement story upload modal
    console.log('Opening story modal...')
  }

  function deleteStory (id: number) {
    stories.value = stories.value.filter(s => s.id !== id)
  }

  // Push Notifications
  const pushNotification = ref({
    title: '',
    message: '',
    audience: 'all',
    schedule: 'now',
    scheduledTime: '',
  })

  const sentNotifications = ref([
    { id: 1, title: 'Evento amanhã! 🎉', message: 'Não esqueça de confirmar sua presença', sentAt: '30/01 14:00', recipients: 1542 },
    { id: 2, title: 'Novidade no line-up', message: 'DJ Alok confirmado no evento', sentAt: '28/01 10:00', recipients: 1234 },
  ])

  function sendPushNotification () {
    if (!pushNotification.value.title || !pushNotification.value.message) return
    sentNotifications.value.unshift({
      id: Date.now(),
      title: pushNotification.value.title,
      message: pushNotification.value.message,
      sentAt: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      recipients: 1542,
    })
    pushNotification.value = { title: '', message: '', audience: 'all', schedule: 'now', scheduledTime: '' }
  }
</script>

<style scoped>
.engagement-hub {
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

.hub-header {
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

/* Tabs */
.hub-tabs {
    display: flex;
    gap: 8px;
    padding: 8px;
    background: #f3f4f6;
    border-radius: 16px;
    width: fit-content;
}

.hub-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border: none;
    border-radius: 12px;
    background: transparent;
    color: #6b7280;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.hub-tab:hover {
    background: rgba(255, 255, 255, 0.5);
}

.hub-tab--active {
    background: white;
    color: #8b5cf6;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Content Section */
.content-section {
    background: white;
    border-radius: 20px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
}

/* Chat */
.chat-container {
    display: grid;
    grid-template-columns: 320px 1fr;
    height: 500px;
}

.chat-sidebar {
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
}

.chat-search {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
}

.chat-search .mdi {
    color: #9ca3af;
}

.chat-search input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
}

.chat-list {
    flex: 1;
    overflow-y: auto;
}

.chat-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    cursor: pointer;
    transition: background 0.2s;
}

.chat-item:hover {
    background: #f9fafb;
}

.chat-item--active {
    background: #f3f4f6;
}

.chat-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
}

.chat-info {
    flex: 1;
    min-width: 0;
}

.chat-name {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #2d2d3a;
}

.chat-preview {
    display: block;
    font-size: 13px;
    color: #9ca3af;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.chat-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
}

.chat-time {
    font-size: 11px;
    color: #9ca3af;
}

.chat-unread {
    background: #8b5cf6;
    color: white;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 10px;
}

.chat-main {
    display: flex;
    flex-direction: column;
}

.chat-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
}

.chat-header-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.chat-header-name {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: #2d2d3a;
}

.chat-header-status {
    display: block;
    font-size: 12px;
    color: #10b981;
}

.chat-messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.message {
    display: flex;
}

.message--sent {
    justify-content: flex-end;
}

.message-bubble {
    max-width: 70%;
    padding: 12px 16px;
    border-radius: 16px;
    background: #f3f4f6;
}

.message--sent .message-bubble {
    background: linear-gradient(135deg, #8b5cf6, #b46cff);
    color: white;
}

.message-bubble p {
    margin: 0;
    font-size: 14px;
}

.message-time {
    display: block;
    font-size: 11px;
    margin-top: 4px;
    opacity: 0.7;
}

.chat-input {
    display: flex;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid #e5e7eb;
}

.chat-input input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    font-size: 14px;
}

.send-btn {
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #8b5cf6, #b46cff);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    transition: transform 0.2s;
}

.send-btn:hover {
    transform: scale(1.05);
}

.chat-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
}

.chat-empty .mdi {
    font-size: 64px;
    margin-bottom: 16px;
}

/* Polls */
.polls-header,
.stories-header,
.push-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    color: #2d2d3a;
    margin: 0;
}

.create-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #8b5cf6, #b46cff);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
}

.create-btn:hover {
    transform: translateY(-2px);
}

.polls-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding: 24px;
}

.poll-card {
    background: #f9fafb;
    border-radius: 16px;
    padding: 20px;
    border: 1px solid #e5e7eb;
}

.poll-card--active {
    border-color: #8b5cf6;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(180, 108, 255, 0.05));
}

.poll-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 12px;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #9ca3af;
}

.status-dot--active {
    background: #10b981;
    animation: pulse 2s infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.poll-question {
    font-size: 16px;
    font-weight: 600;
    color: #2d2d3a;
    margin: 0 0 16px;
}

.poll-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.poll-option {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.option-bar {
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
}

.option-fill {
    height: 100%;
    background: linear-gradient(90deg, #8b5cf6, #b46cff);
    border-radius: 4px;
    transition: width 0.5s ease;
}

.option-info {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
}

.option-text {
    color: #4b5563;
}

.option-percent {
    font-weight: 600;
    color: #8b5cf6;
}

.poll-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
}

.poll-votes {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #6b7280;
}

.poll-actions {
    display: flex;
    gap: 8px;
}

.poll-action {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: #e5e7eb;
    color: #6b7280;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.poll-action:hover {
    background: #d1d5db;
}

.add-poll-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 40px;
    border: 2px dashed #e5e7eb;
    border-radius: 16px;
    color: #9ca3af;
    cursor: pointer;
    transition: all 0.3s ease;
}

.add-poll-card:hover {
    border-color: #8b5cf6;
    color: #8b5cf6;
    background: rgba(139, 92, 246, 0.05);
}

.add-poll-card .mdi {
    font-size: 32px;
}

/* Stories */
.stories-timeline {
    display: flex;
    gap: 16px;
    padding: 24px;
    overflow-x: auto;
}

.story-card {
    width: 140px;
    flex-shrink: 0;
    position: relative;
}

.story-preview {
    width: 140px;
    height: 200px;
    border-radius: 16px;
    background-size: cover;
    background-position: center;
    position: relative;
    overflow: hidden;
}

.story-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5));
    display: flex;
    align-items: center;
    justify-content: center;
}

.story-type {
    font-size: 32px;
    color: white;
    opacity: 0.8;
}

.story-info {
    display: flex;
    justify-content: space-between;
    padding: 8px 4px;
    font-size: 12px;
    color: #6b7280;
}

.story-stats {
    display: flex;
    align-items: center;
    gap: 4px;
}

.story-actions {
    position: absolute;
    top: 8px;
    right: 8px;
}

.story-action {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-story-card {
    width: 140px;
    height: 200px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 2px dashed #e5e7eb;
    border-radius: 16px;
    color: #9ca3af;
    cursor: pointer;
    transition: all 0.3s ease;
}

.add-story-card:hover {
    border-color: #8b5cf6;
    color: #8b5cf6;
}

.add-story-card .mdi {
    font-size: 32px;
}

/* Push Notifications */
.push-composer {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 32px;
    padding: 24px;
}

.push-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
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

.form-group input,
.form-group textarea {
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    font-size: 14px;
    resize: none;
}

.audience-options,
.schedule-options {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.audience-option,
.schedule-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
}

.audience-option:has(input:checked),
.schedule-option:has(input:checked) {
    border-color: #8b5cf6;
    background: rgba(139, 92, 246, 0.1);
}

.audience-option input,
.schedule-option input {
    display: none;
}

.schedule-input {
    margin-top: 8px;
}

.send-push-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
    background: linear-gradient(135deg, #8b5cf6, #b46cff);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.send-push-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
}

/* Phone Mockup */
.push-preview {
    display: flex;
    justify-content: center;
}

.phone-mockup {
    width: 260px;
    background: #1f2937;
    border-radius: 32px;
    padding: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.phone-notch {
    width: 80px;
    height: 24px;
    background: #000;
    border-radius: 12px;
    margin: 0 auto 16px;
}

.phone-notification {
    display: flex;
    gap: 12px;
    padding: 14px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
}

.notif-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #ff4f94, #f9a538);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
}

.notif-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.notif-app {
    font-size: 11px;
    color: #6b7280;
    font-weight: 600;
}

.notif-title {
    font-size: 13px;
    font-weight: 600;
    color: #1f2937;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.notif-message {
    font-size: 12px;
    color: #4b5563;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.notif-time {
    font-size: 11px;
    color: #9ca3af;
}

/* Push History */
.push-history {
    padding: 0 24px 24px;
}

.history-title {
    font-size: 16px;
    font-weight: 600;
    color: #2d2d3a;
    margin: 0 0 16px;
}

.history-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.history-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px;
    background: #f9fafb;
    border-radius: 12px;
}

.history-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #e5e7eb, #d1d5db);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
}

.history-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.history-title-text {
    font-size: 14px;
    font-weight: 600;
    color: #2d2d3a;
}

.history-message {
    font-size: 13px;
    color: #6b7280;
}

.history-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    font-size: 12px;
    color: #9ca3af;
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

.poll-modal {
    background: white;
    border-radius: 20px;
    width: 90%;
    max-width: 480px;
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

.option-input {
    display: flex;
    gap: 8px;
}

.option-input input {
    flex: 1;
}

.remove-option {
    width: 40px;
    border: none;
    border-radius: 10px;
    background: #fee2e2;
    color: #dc2626;
    cursor: pointer;
}

.add-option-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px;
    background: none;
    border: 1px dashed #e5e7eb;
    border-radius: 10px;
    color: #6b7280;
    cursor: pointer;
}

.add-option-btn:hover {
    border-color: #8b5cf6;
    color: #8b5cf6;
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

.modal-enter-from .poll-modal,
.modal-leave-to .poll-modal {
    transform: scale(0.9) translateY(20px);
}

@media (max-width: 768px) {
    .chat-container {
        grid-template-columns: 1fr;
    }

    .chat-sidebar {
        display: none;
    }

    .push-composer {
        grid-template-columns: 1fr;
    }

    .push-preview {
        display: none;
    }
}
</style>
