<!--
  Página: RequestPassword
  Rota: /public/RequestPassword
  Descrição: Página de solicitação de recuperação de senha
-->
<script setup lang="ts">
  import RequestPasswordComponent from '@/components/auth-kit/components/RequestPassword.vue'
</script>

<template>
  <RequestPasswordComponent />
</template>

<route lang="yaml">
meta:
  layout: false
</route>
