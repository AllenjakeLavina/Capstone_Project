<template>
  <div id="app">
    <Navigation />
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
import PWAUpdateNotification from './components/shared/PWAUpdateNotification.vue'
import PWAInstallPrompt from './components/shared/PWAInstallPrompt.vue'

export default {
  name: 'App',
  components: {
    Navigation,
    PWAUpdateNotification,
    PWAInstallPrompt
  },
  setup() {
    const route = useRoute();
    
    // Check if navigation should be shown
    const showNavigation = computed(() => {
      const hiddenRoutes = ['/', '/login', '/register', '/register/client', '/register/provider', '/verify-email'];
      return !hiddenRoutes.includes(route.path);
    });
    
    return {
      showNavigation
    };
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

body {
  margin: 0;
  padding: 0;
}

button {
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  font-weight: bold;
  transition: background-color 0.3s;
}

.primary-btn {
  background-color: #4CAF50;
  color: white;
}

.primary-btn:hover {
  background-color: #45a049;
}

.secondary-btn {
  background-color: #2196F3;
  color: white;
}

.secondary-btn:hover {
  background-color: #0b7dda;
}

input {
  padding: 10px;
  margin: 5px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Add margin for content when nav is present */
.content-with-nav {
  padding-top: 60px;
  min-height: calc(100vh - 60px);
}

@media (max-width: 767px) {
  .content-with-nav {
    padding-top: 0;
    padding-bottom: 60px;
    min-height: calc(100vh - 60px);
  }
}
</style>
