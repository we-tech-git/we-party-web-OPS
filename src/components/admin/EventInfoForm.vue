<template>
  <v-card class="info-form" flat>
    <v-row dense>
      <v-col cols="12">
        <v-text-field :label="t('admin.newEvent.form.name')" variant="outlined" />
      </v-col>
      <v-col cols="12">
        <v-textarea :label="t('admin.newEvent.form.description')" rows="3" variant="outlined" />
      </v-col>
      <v-col cols="12">
        <v-text-field
          :label="t('admin.newEvent.form.date')"
          prepend-inner-icon="mdi-calendar"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12">
        <v-text-field :label="t('admin.newEvent.form.zip')" variant="outlined" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field :label="t('admin.newEvent.form.city')" variant="outlined" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field :label="t('admin.newEvent.form.state')" variant="outlined" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field :label="t('admin.newEvent.form.district')" variant="outlined" />
      </v-col>
      <v-col cols="12" md="8">
        <v-text-field :label="t('admin.newEvent.form.street')" variant="outlined" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field :label="t('admin.newEvent.form.number')" variant="outlined" />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
</script>

<style scoped>
.info-form {
    background-color: transparent;
    padding: 0;
}
</style>
