<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useCreateEventStore } from '@/stores/createEvent'

  const { t } = useI18n()
  const store = useCreateEventStore()

  const newQuestion = ref('')
  const newAnswer = ref('')
  const formError = ref('')
  const editingIndex = ref<number | null>(null)
  const isFormOpen = ref(false)

  function openAdd () {
    editingIndex.value = null
    newQuestion.value = ''
    newAnswer.value = ''
    formError.value = ''
    isFormOpen.value = true
  }

  function openEdit (index: number) {
    const faq = store.faqs[index]
    if (!faq) return
    editingIndex.value = index
    newQuestion.value = faq.question
    newAnswer.value = faq.answer
    formError.value = ''
    isFormOpen.value = true
  }

  function cancelForm () {
    isFormOpen.value = false
    editingIndex.value = null
    newQuestion.value = ''
    newAnswer.value = ''
    formError.value = ''
  }

  function save () {
    const q = newQuestion.value.trim()
    const a = newAnswer.value.trim()
    if (!q || !a) {
      formError.value = t('admin.newEvent.faq.required')
      return
    }
    const idx = editingIndex.value
    if (idx === null) {
      store.faqs.push({ question: q, answer: a })
    } else {
      store.faqs[idx] = { question: q, answer: a }
    }
    cancelForm()
  }

  function remove (index: number) {
    store.faqs.splice(index, 1)
  }

  const gradients = [
    'linear-gradient(135deg, #6b48ff 0%, #9b6bff 100%)',
    'linear-gradient(135deg, #ff4f94 0%, #ff8cc8 100%)',
    'linear-gradient(135deg, #f9a538 0%, #ffd17c 100%)',
    'linear-gradient(135deg, #0ea5e9 0%, #67e8f9 100%)',
    'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)',
  ]

  function gradientFor (index: number) {
    return gradients[index % gradients.length]
  }
</script>

<template>
  <section class="faq-card">
    <header class="faq-header">
      <div class="faq-header__left">
        <span class="mdi mdi-frequently-asked-questions faq-header__icon" />
        <div>
          <p class="faq-header__title">{{ t('admin.newEvent.faq.title') }}</p>
          <p class="faq-header__sub">{{ t('admin.newEvent.faq.subtitle') }}</p>
        </div>
      </div>
      <button v-if="!isFormOpen" class="faq-add-btn" type="button" @click="openAdd">
        <span class="mdi mdi-plus" />
        {{ t('admin.newEvent.faq.add') }}
      </button>
    </header>

    <TransitionGroup class="faq-list" name="faq-list" tag="div">
      <div v-for="(faq, index) in store.faqs" :key="index" class="faq-item" :style="{ '--grad': gradientFor(index) }">
        <div class="faq-item__bar" />
        <div class="faq-item__content">
          <p class="faq-item__q">{{ faq.question }}</p>
          <p class="faq-item__a">{{ faq.answer }}</p>
        </div>
        <div class="faq-item__actions">
          <button
            :aria-label="t('admin.newEvent.faq.edit')"
            class="faq-item__btn faq-item__btn--edit"
            type="button"
            @click="openEdit(index)"
          >
            <span class="mdi mdi-pencil-outline" />
          </button>
          <button
            :aria-label="t('admin.newEvent.faq.delete')"
            class="faq-item__btn faq-item__btn--del"
            type="button"
            @click="remove(index)"
          >
            <span class="mdi mdi-trash-can-outline" />
          </button>
        </div>
      </div>
    </TransitionGroup>

    <p v-if="store.faqs.length === 0 && !isFormOpen" class="faq-empty">
      <span class="mdi mdi-information-outline" />
      {{ t('admin.newEvent.faq.empty') }}
    </p>

    <Transition name="slide-down">
      <div v-if="isFormOpen" class="faq-form">
        <p class="faq-form__title">
          {{ editingIndex !== null ? t('admin.newEvent.faq.editTitle') : t('admin.newEvent.faq.addTitle') }}
        </p>

        <div class="faq-form__field">
          <label class="faq-form__label" for="faq-question">
            {{ t('admin.newEvent.faq.questionLabel') }}
          </label>
          <input
            id="faq-question"
            v-model="newQuestion"
            class="faq-form__input"
            :placeholder="t('admin.newEvent.faq.questionPlaceholder')"
            type="text"
          >
        </div>

        <div class="faq-form__field">
          <label class="faq-form__label" for="faq-answer">
            {{ t('admin.newEvent.faq.answerLabel') }}
          </label>
          <textarea
            id="faq-answer"
            v-model="newAnswer"
            class="faq-form__textarea"
            :placeholder="t('admin.newEvent.faq.answerPlaceholder')"
            rows="3"
          />
        </div>

        <p v-if="formError" class="faq-form__error">
          <span class="mdi mdi-alert-circle-outline" />
          {{ formError }}
        </p>

        <div class="faq-form__actions">
          <button class="faq-form__btn faq-form__btn--cancel" type="button" @click="cancelForm">
            {{ t('admin.newEvent.faq.cancel') }}
          </button>
          <button class="faq-form__btn faq-form__btn--save" type="button" @click="save">
            <span class="mdi mdi-check" />
            {{ t('admin.newEvent.faq.save') }}
          </button>
        </div>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.faq-card {
  --grad: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
  background: linear-gradient(#f8f8ff, #f8f8ff) padding-box, var(--grad) border-box;
  border: 1px solid transparent;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.faq-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.faq-header__left {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.faq-header__icon {
  font-size: 22px;
  margin-top: 2px;
  background: var(--grad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  flex-shrink: 0;
}

.faq-header__title {
  color: #3b3b45;
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 2px;
}

.faq-header__sub {
  color: #8b8b99;
  font-size: 12px;
  margin: 0;
}

.faq-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--grad);
  border: none;
  border-radius: 10px;
  color: #ffffff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 14px;
  flex-shrink: 0;
  transition: transform 0.15s, box-shadow 0.15s;
}

.faq-add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(255, 79, 148, 0.3);
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.faq-item {
  display: flex;
  align-items: stretch;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(33, 33, 77, 0.06);
}

.faq-item__bar {
  width: 5px;
  flex-shrink: 0;
  background: var(--grad);
  border-radius: 12px 0 0 12px;
}

.faq-item__content {
  flex: 1;
  padding: 12px 14px;
  min-width: 0;
}

.faq-item__q {
  color: #3b3b45;
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.faq-item__a {
  color: #6b6b7b;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.faq-item__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  flex-shrink: 0;
}

.faq-item__btn {
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  width: 30px;
  transition: background 0.15s;
}

.faq-item__btn--edit {
  color: #8b6bff;
}

.faq-item__btn--edit:hover {
  background: rgba(139, 107, 255, 0.1);
}

.faq-item__btn--del {
  color: #d82b56;
}

.faq-item__btn--del:hover {
  background: rgba(216, 43, 86, 0.08);
}

.faq-item__btn .mdi {
  font-size: 16px;
}

.faq-empty {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #aaaabc;
  font-size: 13px;
  margin: 0;
}

.faq-empty .mdi {
  font-size: 16px;
}

.faq-form {
  background: #f4f4fb;
  border-radius: 14px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-form__title {
  color: #3b3b45;
  font-size: 14px;
  font-weight: 700;
  margin: 0;
}

.faq-form__field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.faq-form__label {
  color: #6b6b7b;
  font-size: 12px;
  font-weight: 600;
}

.faq-form__input,
.faq-form__textarea {
  background: #ffffff;
  border: 1.5px solid rgba(219, 219, 229, 0.9);
  border-radius: 10px;
  color: #3b3b45;
  font-family: inherit;
  font-size: 13px;
  padding: 10px 12px;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.faq-form__input:focus,
.faq-form__textarea:focus {
  border-color: rgba(255, 79, 148, 0.55);
  box-shadow: 0 0 0 3px rgba(255, 79, 148, 0.1);
  outline: none;
}

.faq-form__error {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #d82b56;
  font-size: 12px;
  margin: 0;
}

.faq-form__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.faq-form__btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  padding: 9px 16px;
  transition: transform 0.15s, opacity 0.15s;
}

.faq-form__btn--cancel {
  background: #e8e8f4;
  color: #6b6b7b;
}

.faq-form__btn--cancel:hover {
  background: #dcdcee;
}

.faq-form__btn--save {
  background: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
  color: #ffffff;
}

.faq-form__btn--save:hover {
  transform: translateY(-1px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.faq-list-enter-active,
.faq-list-leave-active {
  transition: all 0.25s ease;
}

.faq-list-enter-from,
.faq-list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.faq-list-move {
  transition: transform 0.25s ease;
}
</style>
