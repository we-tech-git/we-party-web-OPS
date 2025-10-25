<template>
  <v-card class="category-card" flat>
    <header class="card-title">{{ t('admin.newEvent.categories.title') }}</header>
    <div class="chip-grid">
      <v-chip
        v-for="tag in allCategories"
        :key="tag"
        :aria-pressed="isSelected(tag)"
        :class="['category-chip', { 'category-chip--active': isSelected(tag) }]"
        role="button"
        variant="flat"
        @click="toggleCategory(tag)"
      >
        {{ tag }}
      </v-chip>
      <v-btn
        :aria-label="t('admin.newEvent.categories.addMore')"
        class="add-more"
        icon="mdi-plus"
        :ripple="false"
        variant="flat"
        @click="handleAddCategory"
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t, tm } = useI18n()

  const emit = defineEmits<{
    (e: 'add-category', value: string): void
  }>()

  const baseCategories = computed(() => {
    const value = tm('admin.newEvent.categories.list')
    return Array.isArray(value) ? (value as string[]) : []
  })

  const selectedCategories = ref<string[]>([])
  const customCategories = ref<string[]>([])

  const allCategories = computed(() => [...baseCategories.value, ...customCategories.value])

  function isSelected (tag: string) {
    return selectedCategories.value.includes(tag)
  }

  function toggleCategory (tag: string) {
    if (isSelected(tag)) {
      selectedCategories.value = selectedCategories.value.filter(item => item !== tag)
      return
    }

    selectedCategories.value = [...selectedCategories.value, tag]
  }

  function handleAddCategory () {
    const value = window.prompt(t('admin.newEvent.categories.addMorePrompt'))
    const label = value ? value.trim() : ''

    if (!label) {
      return
    }

    if (allCategories.value.some(item => item.toLowerCase() === label.toLowerCase())) {
      window.alert(t('admin.newEvent.categories.duplicateMessage'))
      return
    }

    customCategories.value = [...customCategories.value, label]
    selectedCategories.value = [...selectedCategories.value, label]
    emit('add-category', label)
  }
</script>

<style scoped>
.category-card {
    --brand-gradient: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
    background: linear-gradient(#f8f8ff, #f8f8ff) padding-box, var(--brand-gradient) border-box;
    border: 1px solid transparent;
    border-radius: 16px;
    padding: 24px;
}

.card-title {
    color: #5c5c6d;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 20px;
}

.chip-grid {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.category-chip {
    background: #ffffff;
    border: 1px solid rgba(255, 79, 148, 0.3);
    border-radius: 14px;
    color: #ff3276;
    font-weight: 600;
    padding: 10px 18px;
    text-transform: none;
}

.category-chip--active {
    background: var(--brand-gradient);
    border: none;
    box-shadow: 0 8px 18px -16px rgba(255, 79, 148, 0.8);
    color: #ffffff !important;
}

.add-more {
    background: var(--brand-gradient);
    border-radius: 14px;
    color: #ffffff !important;
    height: 44px;
    width: 44px;
}
</style>
