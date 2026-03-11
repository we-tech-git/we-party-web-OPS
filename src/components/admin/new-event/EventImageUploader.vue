<script setup lang="ts">
  import { computed, onBeforeUnmount, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  const emit = defineEmits<{
    (e: 'change', file: File | null): void
  }>()

  const { t } = useI18n()

  const fileInputRef = ref<HTMLInputElement | null>(null)
  const previewSource = ref<string | null>(null)
  const isDragActive = ref(false)
  let previewObjectUrl: string | null = null

  const hasPreview = computed(() => Boolean(previewSource.value))

  function triggerFileDialog () {
    fileInputRef.value?.click()
  }

  function onFileChange (event: Event) {
    const input = event.target as HTMLInputElement | null
    if (!input?.files || !input.files[0]) {
      return
    }

    processFile(input.files[0])
    resetInputValue()
  }

  function handleDragEnter () {
    isDragActive.value = true
  }

  function handleDragOver (event: DragEvent) {
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy'
    }
    isDragActive.value = true
  }

  function handleDragLeave (event: DragEvent) {
    const currentTarget = event.currentTarget as HTMLElement | null
    const related = event.relatedTarget as Node | null

    if (!currentTarget || (related && currentTarget.contains(related))) {
      return
    }

    isDragActive.value = false
  }

  function handleDrop (event: DragEvent) {
    isDragActive.value = false
    const file = event.dataTransfer?.files?.[0]
    if (file) {
      processFile(file)
      resetInputValue()
    }
  }

  function processFile (file: File) {
    if (!file.type.startsWith('image/')) {
      return
    }

    const objectUrl = URL.createObjectURL(file)
    updatePreviewSource(objectUrl, { isObjectUrl: true })
    emit('change', file)
  }

  function updatePreviewSource (source: string | null, options: { isObjectUrl?: boolean } = {}) {
    const { isObjectUrl = false } = options

    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl)
      previewObjectUrl = null
    }

    previewSource.value = source
    if (isObjectUrl && source) {
      previewObjectUrl = source
    }
  }

  function clearImage () {
    updatePreviewSource(null)
    emit('change', null)
    resetInputValue()
  }

  function resetInputValue () {
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }

  onBeforeUnmount(() => {
    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl)
    }
  })
</script>

<template>
  <section
    :aria-label="t('admin.newEvent.uploadAction')"
    :class="['image-upload', { 'image-upload--has-image': hasPreview, 'image-upload--drag': isDragActive }]"
    role="button"
    tabindex="0"
    @click="triggerFileDialog"
    @dragenter.prevent="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover.prevent="handleDragOver"
    @drop.prevent="handleDrop"
    @keydown.enter.prevent="triggerFileDialog"
    @keydown.space.prevent="triggerFileDialog"
  >
    <input
      ref="fileInputRef"
      accept="image/*"
      class="image-upload__input"
      type="file"
      @change="onFileChange"
    >

    <div v-if="hasPreview" class="image-upload__preview">
      <img :alt="t('admin.newEvent.uploadPreviewAlt')" :src="previewSource ?? ''">
      <div class="image-upload__preview-actions">
        <button class="image-upload__action" type="button" @click.stop="triggerFileDialog">
          {{ t('admin.newEvent.uploadChange') }}
        </button>
        <button class="image-upload__action image-upload__action--secondary" type="button" @click.stop="clearImage">
          {{ t('admin.newEvent.uploadRemove') }}
        </button>
      </div>
    </div>

    <div v-else class="upload-content">
      <i aria-hidden="true" class="mdi mdi-cloud-upload-outline upload-icon" />
      <div class="upload-content__text">
        <p class="upload-content__title">{{ t('admin.newEvent.uploadAction') }}</p>
        <p class="upload-content__hint">{{ t('admin.newEvent.uploadDrop') }}</p>
        <p class="upload-content__description">{{ t('admin.newEvent.uploadHint') }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.image-upload {
  align-items: center;
  background: linear-gradient(180deg, rgba(248, 248, 255, 0.9), rgba(255, 255, 255, 0.95));
  border: 2px dashed #d9d9d9;
  border-radius: 24px;
  cursor: pointer;
  display: flex;
  height: 260px;
  justify-content: center;
  overflow: hidden;
  padding: 24px;
  position: relative;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.image-upload:hover {
  border-color: #b46cff;
  background: linear-gradient(180deg, rgba(248, 248, 255, 1), rgba(255, 255, 255, 1));
  box-shadow: 0 8px 32px rgba(180, 108, 255, 0.1);
}

.image-upload:focus-visible {
  outline: 3px solid rgba(255, 79, 148, 0.35);
  outline-offset: 4px;
}

.image-upload--drag {
  border-color: #ff4f94;
  border-style: solid;
  box-shadow: 0 0 0 8px rgba(255, 79, 148, 0.1);
  transform: scale(1.01);
  background: linear-gradient(180deg, rgba(255, 245, 248, 1), rgba(255, 255, 255, 1));
}

.image-upload--has-image {
  border-style: solid;
  border-color: transparent;
  padding: 0;
}

.image-upload__input {
  display: none;
}

.upload-content {
  align-items: center;
  color: #4f4f5e;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 420px;
}

.upload-icon {
  color: #b46cff;
  font-size: 48px;
  animation: floatIcon 3s ease-in-out infinite;
}

@keyframes floatIcon {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}

.upload-content__text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-content__title {
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.upload-content__hint {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0;
}

.upload-content__description {
  color: #9ca3af;
  font-size: 0.85rem;
  margin: 0;
}

.image-upload__preview {
  height: 100%;
  position: relative;
  width: 100%;
}

.image-upload__preview img {
  height: 100%;
  object-fit: cover;
  width: 100%;
  transition: transform 0.5s ease;
}

.image-upload:hover .image-upload__preview img {
  transform: scale(1.03);
}

.image-upload__preview-actions {
  align-items: center;
  background: linear-gradient(180deg, rgba(17, 24, 39, 0) 0%, rgba(17, 24, 39, 0.85) 100%);
  bottom: 0;
  display: flex;
  gap: 12px;
  justify-content: center;
  left: 0;
  padding: 32px 20px 24px;
  position: absolute;
  right: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-upload:hover .image-upload__preview-actions {
  opacity: 1;
}

.image-upload__action {
  background-color: #ffffff;
  border: none;
  border-radius: 999px;
  color: #ff4f94;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 10px 22px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.image-upload__action:hover {
  box-shadow: 0 8px 20px rgba(255, 79, 148, 0.3);
  transform: translateY(-2px);
}

.image-upload__action:focus-visible {
  outline: 2px solid rgba(255, 79, 148, 0.4);
  outline-offset: 2px;
}

.image-upload__action--secondary {
  background-color: rgba(255, 255, 255, 0.9);
  color: #6b7280;
}

.image-upload__action--secondary:hover {
  background-color: #fff;
  color: #374151;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

@media (max-width: 720px) {
  .image-upload {
    height: 220px;
  }

  .image-upload__preview-actions {
    flex-direction: column;
    opacity: 1;
  }

  .image-upload__action {
    width: 100%;
  }
}
</style>
