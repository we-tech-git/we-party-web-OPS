<!--
  Página: VerifyPin
  Rota: /public/VerifyPin
  Descrição: Página de verificação de PIN de recuperação de senha
-->
<script setup lang="ts">
  import VerifyPinComponent from '@/components/auth-kit/components/VerifyPin.vue'
</script>

<template>
  <VerifyPinComponent />
</template>

<route lang="yaml">
meta:
  layout: false
</route>
