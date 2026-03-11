<!--
  Página: Signup
  Rota: /public/Signup
  Descrição: Página de cadastro de usuário
-->
<script setup lang="ts">
  import SignupComponent from '@/components/auth-kit/components/Signup.vue'
</script>

<template>
  <SignupComponent />
</template>

<route lang="yaml">
meta:
  layout: false
</route>
