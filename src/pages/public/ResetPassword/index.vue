<!--
  Página: ResetPassword
  Rota: /public/ResetPassword
  Descrição: Página de redefinição de senha
-->
<script setup lang="ts">
  import ResetPasswordComponent from '@/components/auth-kit/components/ResetPassword.vue'
</script>

<template>
  <ResetPasswordComponent />
</template>

<route lang="yaml">
meta:
  layout: false
</route>
