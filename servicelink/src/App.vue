<template>
  <div id="app">
    <Navigation v-if="showNavigation" />

    <div :class="{ 'content-with-nav': showNavigation }">
      <router-view />
    </div>

    <PWAUpdateNotification />
    <PWAInstallPrompt />
  </div>
</template>

<script>
import Navigation from './components/Navigation.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import PWAUpdateNotification from './components/shared/PWAUpdateNotification.vue';
import PWAInstallPrompt from './components/shared/PWAInstallPrompt.vue';

export default {
  name: 'App',
  components: {
    Navigation,
    PWAUpdateNotification,
    PWAInstallPrompt
  },
  setup() {
    const route = useRoute();

    // ✅ Robust navigation hiding logic
    const showNavigation = computed(() => {
      const hiddenRoutes = [
        '/',
        '/landing',
        '/login',
        '/register',
        '/register/client',
        '/register/provider',
        '/verify-email'
      ];

      // handles exact + subroutes like /login/reset
      const isHidden = hiddenRoutes.some(path =>
        route.path === path || route.path.startsWith(path + '/')
      );

      return !isHidden;
    });

    return {
      showNavigation
    };
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  min-height: 100dvh;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  width: 100%;
}

/* Layout spacing when nav is visible */
.content-with-nav {
  padding-top: 60px;
  min-height: calc(100dvh - 60px);
  min-height: calc(100vh - 60px);
  width: 100%;
}

@media (max-width: 767px) {
  .content-with-nav {
    padding-top: 0;
    padding-bottom: 60px;
  }
}
</style>