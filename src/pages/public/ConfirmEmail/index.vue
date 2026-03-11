<!--
  Página: ConfirmEmail
  Rota: /public/ConfirmEmail
  Descrição: Página de confirmação de e-mail com PIN
-->
<script setup lang="ts">
  import ConfirmEmailComponent from '@/components/auth-kit/components/ConfirmEmail.vue'
</script>

<template>
  <ConfirmEmailComponent />
</template>

<route lang="yaml">
meta:
  layout: false
</route>
