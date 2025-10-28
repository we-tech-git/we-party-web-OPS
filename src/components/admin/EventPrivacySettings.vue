<template>
  <div class="privacy-grid">
    <section class="privacy-card">
      <header class="card-title">{{ t('admin.newEvent.privacy.title') }}</header>
      <div :aria-label="t('admin.newEvent.privacy.title')" class="segmented" role="group">
        <button
          v-for="option in privacyOptions"
          :key="option.value"
          :aria-pressed="selectedPrivacy === option.value"
          :class="['segmented-button', { active: selectedPrivacy === option.value }]"
          type="button"
          @click="selectPrivacy(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
      <p class="card-subtitle">{{ t('admin.newEvent.privacy.subTitle') }}</p>
      <p class="card-description">{{ t('admin.newEvent.privacy.description') }}</p>
    </section>

    <section class="privacy-card">
      <header class="card-title">{{ t('admin.newEvent.privacy.invitesTitle') }}</header>
      <div class="invite-row">
        <div class="avatar-stack" role="list">
          <figure v-for="invite in displayedInvitees" :key="invite.id" class="avatar" role="listitem">
            <img :alt="invite.name" :src="invite.avatar">
          </figure>
          <div v-if="remainingCount > 0" class="avatar avatar--counter" role="listitem">
            +{{ remainingCount }}
          </div>
        </div>
        <button
          :aria-label="t('admin.newEvent.privacy.addInvite')"
          class="add-btn"
          type="button"
          @click="openInviteModal"
        >
          <span aria-hidden="true" class="mdi mdi-plus" />
        </button>
      </div>
      <p class="card-description">{{ t('admin.newEvent.privacy.invitesDescription') }}</p>
    </section>

    <section class="privacy-card">
      <header class="card-title">{{ t('admin.newEvent.privacy.commentsTitle') }}</header>
      <div :aria-label="t('admin.newEvent.privacy.commentsTitle')" class="segmented" role="group">
        <button
          v-for="option in commentOptions"
          :key="option.value"
          :aria-pressed="selectedComments === option.value"
          :class="['segmented-button', { active: selectedComments === option.value }]"
          type="button"
          @click="selectComments(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
      <p class="card-description">{{ t('admin.newEvent.privacy.commentsDescription') }}</p>
    </section>

    <Teleport to="body">
      <div
        v-if="isModalOpen"
        aria-modal="true"
        class="modal-backdrop"
        role="dialog"
        @click.self="closeInviteModal"
      >
        <div class="invite-modal">
          <header class="invite-modal__header">
            <h2 class="invite-modal__title">{{ t('admin.newEvent.privacy.addInvite') }}</h2>
            <button class="invite-modal__close" type="button" @click="closeInviteModal">×</button>
          </header>
          <div class="invite-modal__search">
            <span aria-hidden="true" class="mdi mdi-magnify" />
            <input
              ref="searchInputRef"
              v-model="searchTerm"
              :placeholder="t('admin.newEvent.privacy.searchPlaceholder')"
              type="search"
            >
          </div>
          <div class="contact-list">
            <div v-for="contact in filteredContacts" :key="contact.id" class="contact-item">
              <div class="contact-meta">
                <img :alt="contact.name" :src="contact.avatar">
                <p class="contact-name">{{ contact.name }}</p>
              </div>
              <button
                :aria-pressed="isInviteeSelected(contact.id)"
                :class="['contact-action', { 'contact-action--selected': isInviteeSelected(contact.id) }]"
                type="button"
                @click="toggleInvite(contact)"
              >
                <span aria-hidden="true" :class="['mdi', isInviteeSelected(contact.id) ? 'mdi-minus' : 'mdi-plus']" />
                {{ isInviteeSelected(contact.id) ? t('admin.newEvent.privacy.inviteActionRemove') :
                  t('admin.newEvent.privacy.inviteActionAdd') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const emit = defineEmits<{
    (e: 'privacy-change', value: 'public' | 'followers'): void
    (e: 'comments-change', value: 'no' | 'yes'): void
    (e: 'add-invite'): void
  }>()

  type Contact = { id: number, name: string, avatar: string }

  const selectedPrivacy = ref<'public' | 'followers'>('followers')
  const selectedComments = ref<'no' | 'yes'>('yes')
  const invitees = ref<Contact[]>([
    { id: 1, name: `${t('admin.newEvent.privacy.inviteAlt')} 1`, avatar: 'https://i.pravatar.cc/100?img=12' },
    { id: 2, name: `${t('admin.newEvent.privacy.inviteAlt')} 2`, avatar: 'https://i.pravatar.cc/100?img=32' },
    { id: 3, name: `${t('admin.newEvent.privacy.inviteAlt')} 3`, avatar: 'https://i.pravatar.cc/100?img=45' },
  ])

  const availableContacts: Contact[] = [
    { id: 4, name: 'Isabela Rocha', avatar: 'https://i.pravatar.cc/100?img=51' },
    { id: 5, name: 'Felipe Tavares', avatar: 'https://i.pravatar.cc/100?img=23' },
    { id: 6, name: 'Camila Freitas', avatar: 'https://i.pravatar.cc/100?img=56' },
    { id: 7, name: 'Renato Oliveira', avatar: 'https://i.pravatar.cc/100?img=2' },
    { id: 8, name: 'Ana Vitória', avatar: 'https://i.pravatar.cc/100?img=18' },
    { id: 9, name: 'Eduardo Martins', avatar: 'https://i.pravatar.cc/100?img=5' },
    { id: 10, name: 'Marina Prado', avatar: 'https://i.pravatar.cc/100?img=62' },
  ]

  const isModalOpen = ref(false)
  const searchTerm = ref('')
  const searchInputRef = ref<HTMLInputElement | null>(null)

  const privacyOptions = [
    { value: 'public', label: t('admin.newEvent.privacy.public') },
    { value: 'followers', label: t('admin.newEvent.privacy.followers') },
  ] as const

  const commentOptions = [
    { value: 'no', label: t('admin.newEvent.privacy.commentsNo') },
    { value: 'yes', label: t('admin.newEvent.privacy.commentsYes') },
  ] as const

  function selectPrivacy (option: 'public' | 'followers') {
    selectedPrivacy.value = option
    emit('privacy-change', option)
  }

  function selectComments (option: 'no' | 'yes') {
    selectedComments.value = option
    emit('comments-change', option)
  }

  function openInviteModal () {
    searchTerm.value = ''
    isModalOpen.value = true
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }

  function closeInviteModal () {
    isModalOpen.value = false
  }

  function addInvitee (contact: Contact) {
    if (!isInviteeSelected(contact.id)) {
      invitees.value = [...invitees.value, contact]
      emit('add-invite')
    }
  }

  function isInviteeSelected (contactId: number) {
    return invitees.value.some(existing => existing.id === contactId)
  }

  function removeInvitee (contactId: number) {
    invitees.value = invitees.value.filter(existing => existing.id !== contactId)
  }

  function toggleInvite (contact: Contact) {
    if (isInviteeSelected(contact.id)) {
      removeInvitee(contact.id)
    } else {
      addInvitee(contact)
    }
  }

  const displayedInvitees = computed(() => invitees.value.slice(0, 3))
  const remainingCount = computed(() => Math.max(0, invitees.value.length - displayedInvitees.value.length))
  const filteredContacts = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    if (!term) return availableContacts
    return availableContacts.filter(contact => contact.name.toLowerCase().includes(term))
  })

  let previousBodyOverflow: string | null = null

  function handleKeydown (event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeInviteModal()
    }
  }

  watch(isModalOpen, value => {
    if (value) {
      previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeydown)
    } else {
      document.body.style.overflow = previousBodyOverflow ?? ''
      document.removeEventListener('keydown', handleKeydown)
    }
  })

  onBeforeUnmount(() => {
    document.body.style.overflow = previousBodyOverflow ?? ''
    document.removeEventListener('keydown', handleKeydown)
  })
</script>

<style scoped>
.privacy-grid {
  --brand-gradient: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.privacy-card {
  background: linear-gradient(#f8f8ff, #f8f8ff) padding-box, var(--brand-gradient) border-box;
  border: 1px solid transparent;
  border-radius: 16px;
  padding: 24px 28px;
}

.card-title {
  color: #5c5c6d;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}

.segmented {
  background-color: #ffffff;
  border-radius: 18px;
  display: grid;
  gap: 4px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 12px;
  overflow: hidden;
  padding: 8px;
}

.segmented-button {
  align-items: center;
  border: none;
  border-radius: 14px;
  color: #8b8b99;
  cursor: pointer;
  display: flex;
  font-size: 13.5px;
  font-weight: 600;
  justify-content: center;
  min-height: 44px;
  min-width: 0;
  padding: 12px 18px;
  text-align: center;
  text-transform: none;
  white-space: normal;
  width: 100%;
}

.segmented-button.active {
  background: var(--brand-gradient);
  box-shadow: 0 8px 16px -12px rgba(255, 79, 148, 0.4);
  color: #ffffff !important;
}

.card-subtitle {
  color: #b46cff;
  font-size: 13px;
  font-weight: 600;
  margin: 8px 0;
  text-transform: uppercase;
}

.card-description {
  color: #6b6b7b;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.invite-row {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.avatar-stack {
  align-items: center;
  display: flex;
  gap: 0;
}

.avatar {
  border-radius: 50%;
  box-shadow: 0 0 0 3px #ffffff;
  height: 40px;
  margin: 0;
  overflow: hidden;
  width: 40px;
  z-index: 1;
}

.avatar img {
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.avatar+.avatar {
  margin-left: -12px;
}

.avatar--counter {
  align-items: center;
  background-color: #4b4b57;
  border-radius: 50%;
  box-shadow: 0 0 0 3px #ffffff;
  color: #ffffff;
  display: inline-flex;
  font-size: 13px;
  font-weight: 600;
  height: 40px;
  justify-content: center;
  margin-left: -12px;
  width: 40px;
}

.add-btn {
  align-items: center;
  background: #585866;
  border: none;
  border-radius: 50%;
  color: #ffffff !important;
  cursor: pointer;
  display: inline-flex;
  height: 40px;
  justify-content: center;
  width: 40px;
}

.segmented-button:focus-visible,
.add-btn:focus-visible {
  outline: 3px solid rgba(255, 79, 148, 0.45);
  outline-offset: 2px;
}

.modal-backdrop {
  align-items: center;
  background-color: rgba(15, 15, 35, 0.45);
  bottom: 0;
  display: flex;
  justify-content: center;
  left: 0;
  padding: 24px;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 2000;
}

.invite-modal {
  background-color: #ffffff;
  border-radius: 18px;
  box-shadow: 0 16px 40px -18px rgba(33, 33, 77, 0.45);
  max-height: min(520px, 90vh);
  --brand-gradient: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
  padding: 24px;
  position: relative;
  width: min(420px, 92vw);
}

.invite-modal__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 18px;
}

.invite-modal__title {
  color: #3b3b45;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.invite-modal__close {
  background: transparent;
  border: none;
  color: #6b6b7b;
  cursor: pointer;
  font-size: 1.4rem;
  line-height: 1;
}

.invite-modal__search {
  align-items: center;
  background-color: #f6f6fb;
  border-radius: 14px;
  display: flex;
  margin-bottom: 16px;
  padding: 0 14px;
}

.invite-modal__search input {
  background: transparent;
  border: none;
  color: #3b3b45;
  flex: 1;
  font-size: 0.95rem;
  padding: 12px 10px;
}

.invite-modal__search input:focus {
  outline: none;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;
}

.contact-item {
  align-items: center;
  border-radius: 14px;
  display: flex;
  gap: 14px;
  justify-content: space-between;
  padding: 10px 12px;
  transition: background-color 0.2s ease;
}

.contact-item:hover {
  background-color: rgba(255, 79, 148, 0.08);
}

.contact-meta {
  align-items: center;
  display: flex;
  flex: 1;
  gap: 12px;
  min-width: 0;
}

.contact-meta img {
  border-radius: 50%;
  height: 40px;
  object-fit: cover;
  width: 40px;
}

.contact-name {
  color: #4b4b57;
  font-weight: 600;
  margin: 0;
}

.contact-action {
  align-items: center;
  background: var(--brand-gradient, linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%));
  border: 1px solid transparent;
  border-radius: 999px;
  color: #ffffff;
  cursor: pointer;
  display: inline-flex;
  font-size: 0.85rem;
  font-weight: 600;
  gap: 6px;
  justify-content: center;
  min-width: 110px;
  padding: 8px 14px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.contact-action .mdi {
  font-size: 1rem;
}

.contact-action--selected {
  background: rgba(255, 79, 148, 0.12);
  border-color: rgba(255, 79, 148, 0.45);
  color: #ff4f94;
}

.contact-action--selected .mdi {
  color: inherit;
}

.contact-action:focus-visible {
  outline: 3px solid rgba(255, 79, 148, 0.35);
  outline-offset: 2px;
}
</style>
