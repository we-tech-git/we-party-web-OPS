<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import EventEdit from '@/components/admin/new-event/index.vue'

  defineOptions({
    name: 'EditEventPage',
  })

  const route = useRoute()

  // Pega o ID do evento da rota
  const eventId = computed(() => {
    if ('id' in route.params) {
      const id = route.params.id
      return Array.isArray(id) ? id[0] : id
    }
    return ''
  })
</script>

<script lang="ts">
  export default {
    name: 'EditEventPage',
    layout: 'admin',
  }
</script>

<template>
  <EventEdit :event-id="eventId" />
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
