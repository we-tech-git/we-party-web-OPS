<template>
  <section class="info-form">
    <v-form class="info-form__form" validate-on="input" @submit.prevent>
      <v-row class="info-form__row" dense>
        <v-col cols="12">
          <v-text-field
            v-model="form.name"
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
          <v-textarea
            v-model="form.description"
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
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="form.date"
            autocomplete="off"
            class="info-form__field"
            color="primary"
            density="comfortable"
            hide-details="auto"
            :label="t('admin.newEvent.form.date')"
            prepend-inner-icon="mdi-calendar"
            rounded="xl"
            type="date"
            variant="outlined"
          />
        </v-col>

        <v-col cols="12">
          <v-text-field
            v-model="form.zip"
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
            v-model="form.city"
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
            v-model="form.state"
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
            v-model="form.district"
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
            v-model="form.street"
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
            v-model="form.number"
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

<script setup lang="ts">
  import { reactive } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const form = reactive({
    name: '',
    description: '',
    date: '',
    zip: '',
    city: '',
    state: '',
    district: '',
    street: '',
    number: '',
  })
</script>

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
</style>
