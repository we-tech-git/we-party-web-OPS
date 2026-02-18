<!--
  Componente: AuthLayout.vue
  Descrição: Layout para páginas de autenticação (login, signup, etc.)
  Utiliza slots para conteúdo da marca e do formulário.
-->
<script setup lang="ts">
  defineProps<{
    brandLeft?: boolean
  }>()
</script>

<template>
  <div class="auth-layout" :class="{ 'brand-left': brandLeft }">
    <!-- Seção da Marca -->
    <div class="brand-section">
      <slot name="brand-content">
        <h2 class="brand-title notranslate" translate="no">WE PARTY</h2>
      </slot>
    </div>

    <!-- Seção do Formulário -->
    <div class="form-section">
      <div class="form-container">
        <slot name="form-content" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.auth-layout.brand-left {
  flex-direction: row;
}

.auth-layout:not(.brand-left) {
  flex-direction: row-reverse;
}

.brand-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #F978A3 0%, #FF6B9D 50%, #C44569 100%);
  color: white;
  padding: 2rem;
}

.brand-title {
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
}

.brand-subtitle {
  font-size: 1.25rem;
  text-align: center;
  max-width: 400px;
  line-height: 1.6;
}

.highlight-text {
  color: #FFD700;
  font-weight: 700;
}

.form-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #FAFAFA;
  padding: 2rem;
}

.form-container {
  width: 100%;
  max-width: 420px;
  padding: 2rem;
}

/* Mobile Responsivo */
@media (max-width: 768px) {
  .auth-layout {
    flex-direction: column;
  }

  .auth-layout.brand-left,
  .auth-layout:not(.brand-left) {
    flex-direction: column;
  }

  .brand-section {
    flex: none;
    padding: 1.5rem;
    min-height: auto;
    display: none;
    /* Esconde a marca no mobile */
  }

  .form-section {
    flex: 1;
    padding: 1rem;
  }

  .form-container {
    padding: 1rem;
  }
}
</style>
