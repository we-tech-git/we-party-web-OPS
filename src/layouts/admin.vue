<template>
  <div class="admin-shell">
    <header class="admin-header">
      <div class="admin-header__inner">
        <div class="admin-header__brand">
          <h1 :aria-label="t('admin.header.brandAria')" class="admin-title">
            <span class="we-party-text">{{ t('admin.header.brandTitle') }}</span>
            <span aria-hidden="true" class="admin-title__separator">|</span>
            <span class="producer-space-text">{{ t('admin.header.brandSubtitle') }}</span>
          </h1>
        </div>
        <div class="admin-header__actions">
          <LanguageSwitcher data-tour="language-switcher" />
          <div class="admin-header__avatar">
            <input
              ref="avatarInputRef"
              accept="image/*"
              class="admin-avatar__input"
              style="display: none;"
              type="file"
              @change="onAvatarChange"
            >
            <button
              :aria-label="t('admin.header.changeAvatar')"
              class="admin-avatar__button"
              type="button"
              @click="openAvatarModal"
            >
              <img :alt="t('admin.header.avatarAlt')" :src="avatarSrc">
              <span class="admin-avatar__overlay">{{ t('admin.header.changeAvatar') }}</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <Teleport to="body">
      <div v-if="isAvatarModalOpen" class="admin-avatar-modal">
        <div class="admin-avatar-modal__backdrop" @click="closeAvatarModal" />
        <div
          ref="avatarModalRef"
          :aria-labelledby="avatarModalTitleId"
          class="admin-avatar-modal__dialog"
          role="dialog"
          tabindex="-1"
          @keydown.esc.prevent.stop="closeAvatarModal"
        >
          <button
            :aria-label="t('admin.header.avatarModalCancel')"
            class="admin-avatar-modal__close"
            type="button"
            @click="closeAvatarModal"
          >
            <span aria-hidden="true">&times;</span>
          </button>

          <h2 :id="avatarModalTitleId" class="admin-avatar-modal__title">
            {{ t('admin.header.avatarModalTitle') }}
          </h2>
          <p class="admin-avatar-modal__description">
            {{ t('admin.header.avatarModalDescription') }}
          </p>

          <div class="admin-avatar-modal__preview">
            <img :alt="t('admin.header.avatarAlt')" :src="avatarSrc">
          </div>

          <div class="admin-avatar-modal__actions">
            <button
              class="admin-avatar-modal__action admin-avatar-modal__action--primary"
              type="button"
              @click="triggerAvatarUpload"
            >
              {{ t('admin.header.avatarModalUpload') }}
            </button>
            <button class="admin-avatar-modal__action" type="button" @click="handleAvatarRemove">
              {{ t('admin.header.avatarModalRemove') }}
            </button>
          </div>

          <button
            class="admin-avatar-modal__action admin-avatar-modal__action--ghost"
            type="button"
            @click="closeAvatarModal"
          >
            {{ t('admin.header.avatarModalCancel') }}
          </button>
        </div>
      </div>
    </Teleport>

    <div class="admin-body">
      <aside class="admin-nav">
        <nav class="admin-nav__list">
          <RouterLink
            v-for="item in items"
            :key="item.title"
            :class="['admin-nav__item', { 'admin-nav__item--active': isActive(item.to) }]"
            :data-tour="item.tourId"
            :to="item.to"
          >
            <img :alt="item.title" class="admin-nav__icon" :src="item.icon">
            <span>{{ item.title }}</span>
          </RouterLink>
        </nav>

        <!-- Tour Button -->
        <button class="admin-nav__tour-btn" type="button" @click="startGuidedTour">
          <span class="mdi mdi-compass-outline" />
          <span>{{ t('tour.startTour') }}</span>
        </button>
      </aside>

      <main class="admin-content">
        <div class="admin-content__inner">
          <router-view />
        </div>
      </main>
    </div>

    <!-- Guided Tour -->
    <GuidedTour
      ref="tourRef"
      :auto-start="true"
      :steps="adminTourSteps"
      storage-key="admin-tour-completed"
      @complete="onTourComplete"
      @skip="onTourSkip"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import analyticsIcon from '@/assets/icons/analytics.svg'
  import devToolsIcon from '@/assets/icons/dev-tools.svg'
  import engagementIcon from '@/assets/icons/engagement.svg'
  import homeIcon from '@/assets/icons/home.svg'
  import lineupIcon from '@/assets/icons/lineup.svg'
  import newEventIcon from '@/assets/icons/new-event.svg'
  import notificationsIcon from '@/assets/icons/notifications.svg'
  import participantsIcon from '@/assets/icons/participants.svg'
  import postEventIcon from '@/assets/icons/post-event.svg'
  import GuidedTour from '@/components/GuidedTour.vue'
  import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
  import { useTour } from '@/composables/useTour'

  const emit = defineEmits<{
    (e: 'avatar-change', file: File | null): void
  }>()

  const { t } = useI18n()
  const route = useRoute()
  const { adminTourSteps } = useTour()

  const tourRef = ref<InstanceType<typeof GuidedTour> | null>(null)

  function startGuidedTour () {
    tourRef.value?.startTour()
  }

  function onTourComplete () {
    console.log('Tour completed!')
  }

  function onTourSkip () {
    console.log('Tour skipped')
  }

  const defaultAvatar = 'https://cdn.vuetifyjs.com/images/john.jpg'
  const avatarSrc = ref<string>(defaultAvatar)
  const avatarInputRef = ref<HTMLInputElement | null>(null)
  const avatarModalRef = ref<HTMLDivElement | null>(null)
  const isAvatarModalOpen = ref(false)
  const avatarModalTitleId = 'admin-avatar-modal-title'
  const canUseDom = typeof window !== 'undefined'
  let previousFocusedElement: HTMLElement | null = null
  let avatarObjectUrl: string | null = null

  const items = computed(() => [
    { title: t('admin.nav.home'), icon: homeIcon, to: '/public/admin/home', tourId: 'nav-home' },
    { title: t('admin.nav.newEvent'), icon: newEventIcon, to: '/public/admin/new-event', tourId: 'nav-new-event' },
    { title: t('admin.nav.analytics'), icon: analyticsIcon, to: '/public/admin/analytics', tourId: 'nav-analytics' },
    { title: t('admin.nav.participants'), icon: participantsIcon, to: '/public/admin/participants', tourId: 'nav-participants' },
    { title: t('admin.nav.engagement'), icon: engagementIcon, to: '/public/admin/engagement', tourId: 'nav-engagement' },
    { title: t('admin.nav.notifications'), icon: notificationsIcon, to: '/public/admin/notifications', tourId: 'nav-notifications' },
    { title: t('admin.nav.postEvent'), icon: postEventIcon, to: '/public/admin/post-event', tourId: 'nav-post-event' },
    { title: t('admin.nav.lineup'), icon: lineupIcon, to: '/public/admin/lineup', tourId: 'nav-lineup' },
    { title: t('admin.nav.controlPanel'), icon: analyticsIcon, to: '/public/admin/control-panel', tourId: 'nav-control-panel' },
    { title: t('admin.nav.devTools'), icon: devToolsIcon, to: '/public/admin/dev-tools', tourId: 'nav-dev-tools' },
  ])

  function isActive (target: string) {
    return route.path.startsWith(target)
  }

  watch(isAvatarModalOpen, async isOpen => {
    if (!canUseDom) {
      return
    }

    if (isOpen) {
      previousFocusedElement = document.activeElement as HTMLElement | null
      document.body.style.setProperty('overflow', 'hidden')
      await nextTick()
      avatarModalRef.value?.focus()
    } else {
      document.body.style.removeProperty('overflow')
      previousFocusedElement?.focus()
      previousFocusedElement = null
    }
  })

  function openAvatarModal () {
    isAvatarModalOpen.value = true
  }

  function closeAvatarModal () {
    isAvatarModalOpen.value = false
  }

  function triggerAvatarUpload () {
    avatarInputRef.value?.click()
  }

  function onAvatarChange (event: Event) {
    const input = event.target as HTMLInputElement | null
    const file = input?.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      resetAvatarInput()
      return
    }

    const objectUrl = URL.createObjectURL(file)
    updateAvatarSource(objectUrl, { isObjectUrl: true })
    emit('avatar-change', file)
    resetAvatarInput()
    closeAvatarModal()
  }

  function updateAvatarSource (source: string, options: { isObjectUrl?: boolean } = {}) {
    const { isObjectUrl = false } = options

    if (avatarObjectUrl) {
      URL.revokeObjectURL(avatarObjectUrl)
      avatarObjectUrl = null
    }

    avatarSrc.value = source

    if (isObjectUrl) {
      avatarObjectUrl = source
    }
  }

  function handleAvatarRemove () {
    updateAvatarSource(defaultAvatar)
    emit('avatar-change', null)
    resetAvatarInput()
    closeAvatarModal()
  }

  function resetAvatarInput () {
    if (avatarInputRef.value) {
      avatarInputRef.value.value = ''
    }
  }

  onBeforeUnmount(() => {
    if (avatarObjectUrl) {
      URL.revokeObjectURL(avatarObjectUrl)
    }

    if (canUseDom) {
      document.body.style.removeProperty('overflow')
    }
  })
</script>

<style scoped>
.admin-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  flex-direction: column;
  background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.5), transparent 40%),
    radial-gradient(circle at 80% 10%, rgba(255, 214, 242, 0.65), transparent 45%),
    linear-gradient(135deg, #fff5f7 0%, #ffe6ea 100%);
}

.admin-header {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(14px);
  box-shadow: 0 10px 38px -22px rgba(255, 105, 180, 0.4);
  z-index: 100;
  flex-shrink: 0;
}

.admin-header__inner {
  align-items: center;
  display: grid;
  gap: 16px;
  grid-template-columns: 220px 1fr;
  padding: 20px 32px;
  width: 100%;
}

.admin-header__brand {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 10px;
}

.admin-title {
  align-items: baseline;
  display: flex;
  gap: 14px;
  font-size: clamp(1.35rem, 1.2rem + 0.4vw, 1.75rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  margin: 0;
  white-space: nowrap;
}

.admin-header__actions {
  align-items: center;
  display: inline-flex;
  gap: 20px;
  justify-self: end;
}

.admin-title__separator {
  color: #c9c9c9;
  font-weight: 700;
}

.admin-header__avatar {
  position: relative;
}

.admin-avatar__input {
  display: none;
}

.admin-avatar__button {
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  height: 48px;
  overflow: hidden;
  padding: 0;
  position: relative;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  width: 48px;
}

.admin-avatar__button:hover {
  box-shadow: 0 12px 28px -16px rgba(255, 79, 148, 0.5);
  transform: translateY(-1px);
}

.admin-avatar__button:focus-visible {
  outline: 3px solid rgba(255, 79, 148, 0.45);
  outline-offset: 4px;
}

.admin-avatar__button img {
  border-radius: 50%;
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.admin-avatar__overlay {
  align-items: center;
  background: rgba(17, 24, 39, 0.55);
  bottom: 0;
  color: #ffffff;
  display: flex;
  font-size: 0.72rem;
  font-weight: 600;
  inset: 0;
  justify-content: center;
  opacity: 0;
  padding: 8px;
  position: absolute;
  text-align: center;
  transition: opacity 0.2s ease;
}

.admin-avatar__button:hover .admin-avatar__overlay,
.admin-avatar__button:focus-visible .admin-avatar__overlay {
  opacity: 1;
}

.admin-avatar-modal {
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  position: fixed;
  z-index: 1300;
}

.admin-avatar-modal__backdrop {
  background: rgba(17, 24, 39, 0.55);
  inset: 0;
  position: absolute;
}

.admin-avatar-modal__dialog {
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 24px 60px -28px rgba(17, 24, 39, 0.45);
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 420px;
  outline: none;
  padding: 32px 32px 28px;
  position: relative;
  width: min(90vw, 420px);
  z-index: 1;
}

.admin-avatar-modal__close {
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 1.6rem;
  line-height: 1;
  padding: 4px;
  position: absolute;
  right: 20px;
  top: 20px;
  transition: color 0.2s ease;
}

.admin-avatar-modal__close:hover {
  color: #ff4f94;
}

.admin-avatar-modal__title {
  color: #111827;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  text-align: left;
}

.admin-avatar-modal__description {
  color: #4b5563;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
  text-align: left;
}

.admin-avatar-modal__preview {
  align-items: center;
  align-self: center;
  background: linear-gradient(180deg, rgba(255, 79, 148, 0.1), rgba(249, 165, 56, 0.15));
  border-radius: 50%;
  display: flex;
  height: 120px;
  justify-content: center;
  padding: 6px;
  width: 120px;
}

.admin-avatar-modal__preview img {
  border-radius: 50%;
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.admin-avatar-modal__actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.admin-avatar-modal__action {
  background-color: #f3f4f6;
  border: none;
  border-radius: 999px;
  color: #1f2937;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 12px 20px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.admin-avatar-modal__action:hover {
  box-shadow: 0 18px 32px -28px rgba(17, 24, 39, 0.45);
  transform: translateY(-1px);
}

.admin-avatar-modal__action:focus-visible {
  outline: 3px solid rgba(255, 79, 148, 0.35);
  outline-offset: 4px;
}

.admin-avatar-modal__action--primary {
  background: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
  color: #ffffff;
}

.admin-avatar-modal__action--ghost {
  align-self: center;
  background: transparent;
  color: #4b5563;
}

@media (max-width: 600px) {
  .admin-avatar-modal__dialog {
    padding: 28px 20px 24px;
  }

  .admin-avatar-modal__title,
  .admin-avatar-modal__description {
    text-align: center;
  }

  .admin-avatar-modal__close {
    right: 12px;
    top: 12px;
  }
}

.admin-body {
  display: flex;
  flex: 1 1 0;
  overflow: hidden;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(14px);
  border-right: 1px solid rgba(255, 255, 255, 0.35);
  min-width: 240px;
  padding: 36px 24px;
  overflow-y: auto;
}

.admin-nav__list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.admin-nav__item {
  align-items: center;
  border-radius: 18px;
  color: #6b6b7b;
  display: flex;
  font-weight: 700;
  gap: 14px;
  padding: 12px 16px;
  text-decoration: none;
}

.admin-nav__item:hover {
  background: rgba(255, 79, 148, 0.08);
  transform: translateX(2px);
  box-shadow: 0 12px 26px -20px rgba(0, 0, 0, 0.35);
}

.admin-nav__item--active {
  background: linear-gradient(135deg, #ff9a5f 0%, #ff4f8b 100%);
  box-shadow: 0 22px 38px -24px rgba(255, 79, 148, 0.55);
  color: #ffffff;
  transform: translateX(2px);
}

.admin-nav__item--active .admin-nav__icon {
  filter: brightness(0) invert(1);
}

.admin-nav__icon {
  height: 26px;
  width: 26px;
  filter: grayscale(0.3);
}

.admin-nav__tour-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  margin-top: auto;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(167, 139, 250, 0.15) 100%);
  border: 2px dashed rgba(139, 92, 246, 0.4);
  border-radius: 14px;
  color: #7c3aed;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.admin-nav__tour-btn:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(167, 139, 250, 0.25) 100%);
  border-color: #7c3aed;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px -8px rgba(139, 92, 246, 0.4);
}

.admin-nav__tour-btn .mdi {
  font-size: 20px;
}

.admin-content {
  flex: 1 1 0;
  overflow-y: auto;
  padding: 56px 48px 64px;
}

.admin-content__inner {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.78) 0%, rgba(248, 244, 255, 0.82) 100%);
  backdrop-filter: blur(18px);
  border-radius: 28px;
  box-shadow: 0 25px 60px -30px rgba(255, 105, 180, 0.35);
  margin: 0 auto;
  max-width: 1180px;
  padding: 52px;
}

.we-party-text {
  font-family: 'Baloo Thambi 2', 'Inter', system-ui, sans-serif;
  background: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.producer-space-text {
  color: #ff4f8b;
  font-size: clamp(0.95rem, 0.9rem + 0.2vw, 1.1rem);
  font-weight: 700;
}

@media (max-width: 960px) {
  .admin-body {
    flex-direction: column;
  }

  .admin-nav {
    border-right: 0;
    border-bottom: 1px solid rgba(240, 240, 240, 0.8);
    min-width: 100%;
    padding: 24px 16px;
  }

  .admin-header__inner {
    grid-template-columns: 1fr;
    padding: 16px 16px 20px;
  }

  .admin-header__actions {
    justify-self: stretch;
    justify-content: flex-end;
  }

  .admin-content {
    padding: 24px 16px 48px;
  }

  .admin-content__inner {
    padding: 32px 20px;
  }
}
</style>
