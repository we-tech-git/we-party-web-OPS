<script setup lang="ts">
/**
 * Página para criar um novo evento
 * Rota: /public/admin/event-edit/new
 */
  defineOptions({
    name: 'NewEventEditPage',
  })
</script>

<script lang="ts">
  export default {
    name: 'NewEventEditPage',
    layout: 'admin',
  }
</script>

<template>
  <EventEdit />
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
