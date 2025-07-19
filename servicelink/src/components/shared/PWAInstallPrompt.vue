<template>
  <div v-if="showInstallPrompt" class="pwa-install-prompt">
    <div class="prompt-content">
      <div class="prompt-header">
        <img src="@/assets/logo.png" alt="ServiceLink" class="app-icon">
        <div class="prompt-text">
          <h3>Install ServiceLink</h3>
          <p>Install this app on your device for quick and easy access</p>
        </div>
      </div>
      <div class="prompt-actions">
        <button @click="closePrompt" class="btn-secondary">Not now</button>
        <button @click="installPWA" class="btn-primary">Install</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PWAInstallPrompt',
  data() {
    return {
      deferredPrompt: null,
      showInstallPrompt: false
    }
  },
  created() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      this.deferredPrompt = e
      // Show our custom install prompt
      this.showInstallPrompt = true
    })

    // Hide the prompt if the app is installed
    window.addEventListener('appinstalled', () => {
      this.showInstallPrompt = false
      this.deferredPrompt = null
      // Optional: Track successful installation
      console.log('PWA was installed')
    })
  },
  methods: {
    async installPWA() {
      if (!this.deferredPrompt) {
        console.log('Installation prompt not available')
        return
      }

      // Show the install prompt
      this.deferredPrompt.prompt()

      try {
        // Wait for the user to respond to the prompt
        const choiceResult = await this.deferredPrompt.userChoice
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt')
        } else {
          console.log('User dismissed the install prompt')
        }
      } catch (err) {
        console.error('Error during installation:', err)
      }

      // Clear the deferredPrompt for the next time
      this.deferredPrompt = null
      this.showInstallPrompt = false
    },
    closePrompt() {
      this.showInstallPrompt = false
    }
  }
}
</script>

<style scoped>
.pwa-install-prompt {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 20px;
  width: 90%;
  max-width: 400px;
  z-index: 9999;
  animation: slideUp 0.3s ease-out;
}

.prompt-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.prompt-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.app-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
}

.prompt-text {
  flex: 1;
}

.prompt-text h3 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.prompt-text p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.prompt-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primary, .btn-secondary {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #3498db;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #e9ecef;
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

@media (max-width: 480px) {
  .pwa-install-prompt {
    width: calc(100% - 40px);
    bottom: 10px;
  }
}
</style> 