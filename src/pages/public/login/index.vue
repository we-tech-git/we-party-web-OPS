<!--
  Página: Login
  Rota: /public/login
  Descrição: Página de login que utiliza o componente Login
-->
<script setup lang="ts">
import LoginComponent from '@/components/Login/Login.vue'
</script>

<template>
  <LoginComponent />
</template>

<route lang="yaml">
meta:
  layout: false
</route>
