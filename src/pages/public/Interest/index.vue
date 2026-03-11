<!--
  Página: Interest
  Rota: /public/Interest
  Descrição: Página de seleção de interesses do usuário
-->
<script setup lang="ts">
  // TODO: Implementar componente de interesses
  // Por enquanto, redireciona para o admin/home
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  onMounted(() => {
    // Redireciona temporariamente para a home
    router.push('/public/admin/home')
  })
</script>

<template>
  <div class="interest-page">
    <p>Carregando...</p>
  </div>
</template>

<style scoped>
.interest-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: 'Poppins', sans-serif;
}
</style>

<route lang="yaml">
meta:
  layout: false
</route>
