<template>
  <section class="mb-12">
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center">
        <v-icon class="mr-3 text-secondary" icon="mdi-tag-multiple" size="large" />
        <h2 class="text-h5 font-weight-bold text-high-emphasis">
          {{ t('admin.interests.activeInterests') }}
        </h2>
        <v-chip class="ml-4 font-weight-bold" color="secondary" size="small" variant="flat">
          {{ interests.length }}
        </v-chip>
      </div>

      <div class="d-none d-sm-flex" style="width: 220px;">
        <v-text-field bg-color="white" density="compact" hide-details :label="t('admin.interests.searchPlaceholder')"
          prepend-inner-icon="mdi-magnify" rounded="lg" variant="outlined" />
      </div>
    </div>

    <div class="interests-grid">
      <div v-for="(interest, index) in interests" :key="index" class="interest-card"
        :style="{ '--gradient': interest.gradient }">
        <button class="remove-btn" :title="t('admin.interests.remove')" @click.stop="emit('remove', index)">
          <v-icon icon="mdi-close" size="12" />
        </button>
        <div class="interest-content">
          <span class="interest-name">{{ interest.name }}</span>
          <div class="interest-overlay" />
        </div>
      </div>

      <button class="add-interest-card" @click="emit('add')">
        <v-icon color="grey-lighten-1" icon="mdi-plus" />
        <span class="text-caption text-grey">{{ t('admin.interests.add') }}</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  interests: Array<{ name: string; gradient: string }>
}>()

const emit = defineEmits(['add', 'remove'])

const { t } = useI18n()
</script>

<style scoped>
.interests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.interest-card {
  position: relative;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.01s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background: var(--gradient);
}

.interest-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 16px 32px rgba(255, 79, 148, 0.25);
}

.remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.25);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  z-index: 10;
  opacity: 0;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.remove-btn:hover {
  background: #ef4444;
  transform: scale(1.1);
}

.interest-card:hover .remove-btn {
  opacity: 1;
}

.interest-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  z-index: 2;
}

.interest-name {
  color: white;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 0.9rem;
  text-align: center;
}

.interest-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.1) 100%);
  z-index: 1;
}

.add-interest-card {
  height: 48px;
  border-radius: 8px;
  border: 2px dashed rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-interest-card:hover {
  border-color: var(--v-theme-primary);
  background: rgba(var(--v-theme-primary), 0.05);
  transform: scale(1.02);
}
</style>
