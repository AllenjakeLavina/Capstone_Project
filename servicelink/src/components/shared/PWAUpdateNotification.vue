<template>
  <div v-if="showUpdateNotification" class="pwa-update">
    <div class="pwa-update-content">
      <span>New version available!</span>
      <button @click="refreshApp" class="update-button">Update</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PWAUpdateNotification',
  data() {
    return {
      showUpdateNotification: false,
      registration: null,
      refreshing: false
    }
  },
  created() {
    // Listen for our custom event from the service worker
    document.addEventListener('swUpdated', this.handleSwUpdated, { once: true })
    
    // Prevent multiple refreshes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (this.refreshing) return
      this.refreshing = true
      window.location.reload()
    })
  },
  methods: {
    handleSwUpdated(event) {
      this.registration = event.detail
      this.showUpdateNotification = true
    },
    async refreshApp() {
      this.showUpdateNotification = false
      if (!this.registration || !this.registration.waiting) {
        return
      }
      try {
        await this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      } catch (err) {
        console.error('Error while updating service worker:', err)
        // Force reload if the postMessage fails
        window.location.reload()
      }
    }
  },
  beforeUnmount() {
    // Clean up event listeners
    document.removeEventListener('swUpdated', this.handleSwUpdated)
  }
}
</script>

<style scoped>
.pwa-update {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #3498db;
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  display: flex;
  align-items: center;
  animation: slideUp 0.3s ease-out;
}

.pwa-update-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.update-button {
  background: white;
  color: #3498db;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.update-button:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
}

@keyframes slideUp {
  from {
    transform: translate(-50%, 100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}
</style> 