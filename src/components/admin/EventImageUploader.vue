<template>
  <v-sheet class="image-upload" color="#f0f0f0" rounded="xl">
    <div class="upload-content">
      <v-icon color="#bdbdbd" size="36">mdi-cloud-upload-outline</v-icon>
      <p>{{ t('admin.newEvent.uploadHint') }}</p>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
</script>

<style scoped>
.image-upload {
    align-items: center;
    border: 2px dashed #d9d9d9;
    display: flex;
    height: 200px;
    justify-content: center;
    text-align: center;
}

.upload-content {
    color: #7a7a7a;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 420px;
}

.upload-content p {
    font-size: 15px;
    margin: 0;
}
</style>
