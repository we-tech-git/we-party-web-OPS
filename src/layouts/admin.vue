<template>
  <v-app class="admin-app">
    <v-app-bar app color="white" flat>
      <v-toolbar-title>
        <span class="we-party-text">WE PARTY</span> | <span class="producer-space-text">Espaço do
          produtor</span>
      </v-toolbar-title>
      <v-spacer />
      <v-avatar>
        <v-img alt="John Leider" src="https://cdn.vuetifyjs.com/images/john.jpg" />
      </v-avatar>
    </v-app-bar>
    <v-navigation-drawer app border="0" color="white" width="250">
      <v-list density="comfortable" nav>
        <v-list-item
          v-for="item in items"
          :key="item.title"
          active-class="active-item"
          link
          :title="item.title"
          :to="item.to"
        >
          <template #prepend>
            <v-img alt="" class="nav-icon" :src="item.icon" />
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container class="admin-container" fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import homeIcon from '@/assets/icons/home.svg'
  import newEventIcon from '@/assets/icons/new-event.svg'

  const { t } = useI18n()

  const items = [
    { title: t('admin.nav.home'), icon: homeIcon, to: '/public/admin/home' },
    { title: t('admin.nav.newEvent'), icon: newEventIcon, to: '/public/admin/new-event' },
  ]
</script>

<style>
.admin-app {
    background-color: #f0f0f0;
}

.admin-container {
    background-color: #ffffff;
    border-radius: 24px;
    box-shadow: 0 16px 40px -20px rgba(0, 0, 0, 0.3);
    margin: 48px auto;
    max-width: 1080px;
    padding: 48px;
}

.v-navigation-drawer {
    padding: 32px 16px;
}

.v-navigation-drawer .v-list-item {
    border-radius: 16px;
    margin-bottom: 12px;
}

.v-navigation-drawer .v-list-item-title {
    color: #6b6b7b;
    font-weight: 600;
}

.active-item {
    background: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
    color: white !important;
    border-radius: 16px;
}

.active-item .v-img {
    filter: brightness(0) invert(1);
}

.nav-icon {
    height: 28px;
    width: 28px;
    filter: grayscale(1);
}

.we-party-text {
    background: linear-gradient(270deg, #ff4f94 0%, #f9a538 90.5%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    font-weight: bold;
}

.producer-space-text {
    color: #ff0080;
}
</style>
