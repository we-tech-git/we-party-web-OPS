<!--
  Página: Login
  Rota: /public/login
  Descrição: Página de login que utiliza o componente Login do auth-kit
-->
<script setup lang="ts">
  import LoginComponent from '@/components/auth-kit/components/Login.vue'
</script>

<template>
  <LoginComponent />
</template>

<route lang="yaml">
meta:
  layout: false
</route>
