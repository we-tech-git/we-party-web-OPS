<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useCreateEventStore } from '@/stores/createEvent'

  const { t } = useI18n()
  const store = useCreateEventStore()

  const descriptionRef = ref<HTMLElement | null>(null)
  const emojiPickerRef = ref<HTMLElement | null>(null)
  const showEmojiPicker = ref(false)
  const activeCategory = ref('smileys')

  const emojiCategories = [
    {
      name: 'smileys',
      label: 'Smileys',
      icon: '😀',
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
    },
    {
      name: 'gestures',
      label: 'Gestos',
      icon: '👋',
      emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄'],
    },
    {
      name: 'party',
      label: 'Festa',
      icon: '🎉',
      emojis: ['🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🧁', '🥂', '🍾', '🥳', '🪅', '🪩', '🎤', '🎧', '🎵', '🎶', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎬', '🎭', '🎪', '🎨', '🎯', '🎮', '🕺', '💃', '🪩', '✨', '💫', '🌟', '⭐', '🔥', '💥', '💯', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💖', '💝', '💕', '💞', '💓', '💗', '💘'],
    },
    {
      name: 'food',
      label: 'Comida',
      icon: '🍕',
      emojis: ['🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥚', '🍳', '🧇', '🥞', '🧈', '🍞', '🥐', '🥨', '🥯', '🥖', '🧀', '🍖', '🍗', '🥩', '🥓', '🌮', '🌯', '🫔', '🥙', '🧆', '🥗', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍩', '🍪'],
    },
    {
      name: 'nature',
      label: 'Natureza',
      icon: '🌸',
      emojis: ['🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🪺', '🪹', '🍄', '🌰', '🦀', '🦞', '🦐', '🦑', '🦪', '🐚', '🐌', '🦋', '🐛', '🐜', '🐝', '🐞', '🦗', '🪲', '🪳', '🪰', '🪱', '🦟', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '🌈', '⚡', '❄️', '🌙', '⭐', '🌟'],
    },
    {
      name: 'symbols',
      label: 'Símbolos',
      icon: '💯',
      emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💯'],
    },
  ]

  const currentEmojis = computed(() => {
    const category = emojiCategories.find(c => c.name === activeCategory.value)
    return category ? category.emojis : []
  })

  function toggleEmojiPicker () {
    showEmojiPicker.value = !showEmojiPicker.value
  }

  function insertEmoji (emoji: string) {
    store.description = (store.description || '') + emoji
  }

  function handleClickOutside (event: MouseEvent) {
    if (
      emojiPickerRef.value
      && !emojiPickerRef.value.contains(event.target as Node)
      && !(event.target as Element).closest('.emoji-trigger')
    ) {
      showEmojiPicker.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })
</script>

<template>
  <section class="info-form">
    <v-form class="info-form__form" validate-on="input" @submit.prevent>
      <v-row class="info-form__row" dense>
        <v-col cols="12">
          <v-text-field
            v-model="store.title"
            autocomplete="off"
            class="info-form__field"
            color="primary"
            density="comfortable"
            hide-details="auto"
            :label="t('admin.newEvent.form.name')"
            rounded="xl"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12">
          <div class="description-wrapper">
            <v-textarea
              ref="descriptionRef"
              v-model="store.description"
              auto-grow
              class="info-form__field"
              color="primary"
              density="comfortable"
              hide-details="auto"
              :label="t('admin.newEvent.form.description')"
              max-rows="6"
              min-rows="3"
              rounded="xl"
              variant="outlined"
            />
            <button
              class="emoji-trigger"
              :title="t('admin.newEvent.form.addEmoji')"
              type="button"
              @click="toggleEmojiPicker"
            >
              <span class="mdi mdi-emoticon-happy-outline" />
            </button>
            <Transition name="emoji-fade">
              <div v-if="showEmojiPicker" ref="emojiPickerRef" class="emoji-picker">
                <div class="emoji-picker__header">
                  <div class="emoji-tabs">
                    <button
                      v-for="category in emojiCategories"
                      :key="category.name"
                      class="emoji-tab"
                      :class="{ 'emoji-tab--active': activeCategory === category.name }"
                      :title="category.label"
                      type="button"
                      @click="activeCategory = category.name"
                    >
                      <span>{{ category.icon }}</span>
                    </button>
                  </div>
                </div>
                <div class="emoji-picker__grid">
                  <button
                    v-for="emoji in currentEmojis"
                    :key="emoji"
                    class="emoji-item"
                    type="button"
                    @click="insertEmoji(emoji)"
                  >
                    {{ emoji }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="store.startDate"
            autocomplete="off"
            class="info-form__field"
            color="primary"
            density="comfortable"
            hide-details="auto"
            :label="t('admin.newEvent.form.startDate')"
            prepend-inner-icon="mdi-calendar"
            rounded="xl"
            type="date"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="store.startTime"
            autocomplete="off"
            class="info-form__field"
            color="primary"
            density="comfortable"
            hide-details="auto"
            :label="t('admin.newEvent.form.startTime')"
            prepend-inner-icon="mdi-clock-outline"
            rounded="xl"
            type="time"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="store.endDate"
            autocomplete="off"
            class="info-form__field"
            color="primary"
            density="comfortable"
            hide-details="auto"
            :label="t('admin.newEvent.form.endDate')"
            prepend-inner-icon="mdi-calendar-end"
            rounded="xl"
            type="date"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="store.endTime"
            autocomplete="off"
            class="info-form__field"
            color="primary"
            density="comfortable"
            hide-details="auto"
            :label="t('admin.newEvent.form.endTime')"
            prepend-inner-icon="mdi-clock-outline"
            rounded="xl"
            type="time"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="store.zip"
            autocomplete="postal-code"
            class="info-form__field"
            color="primary"
            density="comfortable"
            hide-details="auto"
            inputmode="numeric"
            :label="t('admin.newEvent.form.zip')"
            rounded="xl"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="store.city"
            autocomplete="address-level2"
            class="info-form__field"
            color="primary"
            density="comfortable"
            hide-details="auto"
            :label="t('admin.newEvent.form.city')"
            rounded="xl"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="store.state"
            autocomplete="address-level1"
            class="info-form__field"
            color="primary"
            density="comfortable"
            hide-details="auto"
            :label="t('admin.newEvent.form.state')"
            rounded="xl"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="store.district"
            class="info-form__field"
            color="primary"
            density="comfortable"
            hide-details="auto"
            :label="t('admin.newEvent.form.district')"
            rounded="xl"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="8">
          <v-text-field
            v-model="store.street"
            autocomplete="address-line1"
            class="info-form__field"
            color="primary"
            density="comfortable"
            hide-details="auto"
            :label="t('admin.newEvent.form.street')"
            rounded="xl"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="store.number"
            autocomplete="address-line2"
            class="info-form__field"
            color="primary"
            density="comfortable"
            hide-details="auto"
            :label="t('admin.newEvent.form.number')"
            rounded="xl"
            variant="outlined"
          />
        </v-col>

      </v-row>
    </v-form>
  </section>
</template>

<style scoped>
.info-form {
  background-color: transparent;
}

.info-form__form {
  width: 100%;
}

.info-form__row {
  margin: 0;
  row-gap: 20px;
}

:deep(.info-form__field .v-field) {
  border-radius: 18px;
  box-shadow: inset 0 1px 2px rgba(17, 24, 39, 0.04);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

:deep(.info-form__field .v-field--focused) {
  box-shadow: 0 0 0 3px rgba(255, 79, 148, 0.18);
}

:deep(.info-form__field .v-label) {
  font-weight: 600;
  color: #5c5c6d;
}

/* Date / Time native controls: troca azul do browser pelo rosa da marca */
:deep(.info-form__field input[type='date']),
:deep(.info-form__field input[type='time']) {
  accent-color: #ff4f8b;
  color-scheme: light;
}

:deep(.info-form__field input[type='date']::-webkit-calendar-picker-indicator),
:deep(.info-form__field input[type='time']::-webkit-calendar-picker-indicator) {
  filter: invert(31%) sepia(90%) saturate(800%) hue-rotate(290deg) brightness(1.1);
  cursor: pointer;
  border-radius: 4px;
  padding: 2px;
}

/* Description with Emoji Picker */
.description-wrapper {
  position: relative;
}

.emoji-trigger {
  position: absolute;
  right: 12px;
  top: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #f8f8ff 0%, #fff 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #8b8b99;
  transition: all 0.2s ease;
  z-index: 1;
}

.emoji-trigger:hover {
  background: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(255, 79, 148, 0.3);
}

.emoji-picker {
  position: absolute;
  right: 0;
  top: 52px;
  width: 320px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(171, 151, 255, 0.2);
  z-index: 100;
  overflow: hidden;
}

.emoji-picker__header {
  padding: 12px;
  border-bottom: 1px solid rgba(171, 151, 255, 0.15);
  background: linear-gradient(180deg, #f8f8ff 0%, #fff 100%);
}

.emoji-tabs {
  display: flex;
  gap: 4px;
}

.emoji-tab {
  flex: 1;
  padding: 8px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;
}

.emoji-tab:hover {
  background: rgba(171, 151, 255, 0.1);
}

.emoji-tab--active {
  background: linear-gradient(270deg, rgba(255, 79, 148, 0.15) 0%, rgba(249, 165, 56, 0.15) 90.5%);
}

.emoji-picker__grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-picker__grid::-webkit-scrollbar {
  width: 6px;
}

.emoji-picker__grid::-webkit-scrollbar-track {
  background: transparent;
}

.emoji-picker__grid::-webkit-scrollbar-thumb {
  background: rgba(171, 151, 255, 0.3);
  border-radius: 3px;
}

.emoji-item {
  width: 100%;
  aspect-ratio: 1;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.emoji-item:hover {
  background: rgba(171, 151, 255, 0.15);
  transform: scale(1.2);
}

/* Emoji Picker Transition */
.emoji-fade-enter-active,
.emoji-fade-leave-active {
  transition: all 0.2s ease;
}

.emoji-fade-enter-from,
.emoji-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
