<template>
  <div class="privacy-grid">
    <v-card class="privacy-card" flat>
      <header class="card-title">{{ t('admin.newEvent.privacy.title') }}</header>
      <div :aria-label="t('admin.newEvent.privacy.title')" class="segmented" role="group">
        <v-btn
          :aria-pressed="selectedPrivacy === 'public'"
          class="segmented-button"
          :class="{ active: selectedPrivacy === 'public' }"
          :ripple="false"
          variant="flat"
          @click="selectPrivacy('public')"
        >
          {{ t('admin.newEvent.privacy.public') }}
        </v-btn>
        <v-btn
          :aria-pressed="selectedPrivacy === 'followers'"
          class="segmented-button"
          :class="{ active: selectedPrivacy === 'followers' }"
          :ripple="false"
          variant="flat"
          @click="selectPrivacy('followers')"
        >
          {{ t('admin.newEvent.privacy.followers') }}
        </v-btn>
      </div>
      <p class="card-subtitle">{{ t('admin.newEvent.privacy.subTitle') }}</p>
      <p class="card-description">{{ t('admin.newEvent.privacy.description') }}</p>
    </v-card>

    <v-card class="privacy-card" flat>
      <header class="card-title">{{ t('admin.newEvent.privacy.invitesTitle') }}</header>
      <div class="invite-row">
        <div class="avatar-stack">
          <v-avatar v-for="invite in invitees" :key="invite.id" size="40" :title="invite.name">
            <img :alt="invite.name" :src="invite.avatar">
          </v-avatar>
        </div>
        <v-btn
          :aria-label="t('admin.newEvent.privacy.addInvite')"
          class="add-btn"
          icon="mdi-plus"
          :ripple="false"
          variant="flat"
          @click="handleAddInvite"
        />
      </div>
      <p class="card-description">{{ t('admin.newEvent.privacy.invitesDescription') }}</p>
    </v-card>

    <v-card class="privacy-card" flat>
      <header class="card-title">{{ t('admin.newEvent.privacy.commentsTitle') }}</header>
      <div :aria-label="t('admin.newEvent.privacy.commentsTitle')" class="segmented" role="group">
        <v-btn
          :aria-pressed="selectedComments === 'no'"
          class="segmented-button"
          :class="{ active: selectedComments === 'no' }"
          :ripple="false"
          variant="flat"
          @click="selectComments('no')"
        >
          {{ t('admin.newEvent.privacy.commentsNo') }}
        </v-btn>
        <v-btn
          :aria-pressed="selectedComments === 'yes'"
          class="segmented-button"
          :class="{ active: selectedComments === 'yes' }"
          :ripple="false"
          variant="flat"
          @click="selectComments('yes')"
        >
          {{ t('admin.newEvent.privacy.commentsYes') }}
        </v-btn>
      </div>
      <p class="card-description">{{ t('admin.newEvent.privacy.commentsDescription') }}</p>
    </v-card>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const emit = defineEmits<{
    (e: 'privacy-change', value: 'public' | 'followers'): void
    (e: 'comments-change', value: 'no' | 'yes'): void
    (e: 'add-invite'): void
  }>()

  const selectedPrivacy = ref<'public' | 'followers'>('followers')
  const selectedComments = ref<'no' | 'yes'>('yes')
  const invitees = ref([
    { id: 1, name: `${t('admin.newEvent.privacy.inviteAlt')} 1`, avatar: 'https://i.pravatar.cc/100?img=12' },
    { id: 2, name: `${t('admin.newEvent.privacy.inviteAlt')} 2`, avatar: 'https://i.pravatar.cc/100?img=32' },
    { id: 3, name: `${t('admin.newEvent.privacy.inviteAlt')} 3`, avatar: 'https://i.pravatar.cc/100?img=45' },
  ])

  function selectPrivacy (option: 'public' | 'followers') {
    selectedPrivacy.value = option
    emit('privacy-change', option)
  }

  function selectComments (option: 'no' | 'yes') {
    selectedComments.value = option
    emit('comments-change', option)
  }

  function handleAddInvite () {
    const randomId = Math.floor(Math.random() * 70) + 1
    const nextIndex = invitees.value.length + 1
    const label = `${t('admin.newEvent.privacy.inviteAlt')} ${nextIndex}`

    invitees.value = [
      ...invitees.value,
      {
        id: nextIndex,
        name: label,
        avatar: `https://i.pravatar.cc/100?img=${randomId}`,
      },
    ]

    emit('add-invite')
  }
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
    padding: 24px;
}

.card-title {
    color: #5c5c6d;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 16px;
}

.segmented {
    background-color: #ffffff;
    border-radius: 16px;
    display: grid;
    gap: 6px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-bottom: 12px;
    padding: 6px;
}

.segmented-button {
    border-radius: 14px;
    color: #8b8b99;
    font-size: 14px;
    font-weight: 600;
    min-height: 46px;
    padding: 12px 16px;
    text-transform: none;
    white-space: nowrap;
}

.segmented-button.active {
    background: var(--brand-gradient);
    box-shadow: 0 10px 20px -12px rgba(255, 79, 148, 0.6);
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
    gap: 12px;
}

.avatar-stack :deep(img) {
    border: 2px solid #ffffff;
    border-radius: 50%;
    height: 40px;
    width: 40px;
}

.add-btn {
    background: var(--brand-gradient);
    border-radius: 14px;
    color: #ffffff !important;
    height: 48px;
    width: 48px;
}
</style>
