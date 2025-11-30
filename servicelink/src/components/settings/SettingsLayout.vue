<template>
    <div class="settings-page">
      <aside class="settings-nav" :class="{ open: isOpen }">
        <nav>
          <div class="settings-header">
            <h1>Settings</h1>
          </div>
          <ul>
            <li>
              <router-link :to="{ name: 'SettingsCustomerService' }" class="nav-link" active-class="active" @click="close">
                <span class="icon">🛈</span>
                <span class="label">Customer Service</span>
              </router-link>
            </li>
            <li>
              <router-link :to="{ name: 'SettingsAbout' }" class="nav-link" active-class="active" @click="close">
                <span class="icon">ⓘ</span>
                <span class="label">About</span>
              </router-link>
            </li>
            <li>
              <router-link :to="{ name: 'SettingsTerms' }" class="nav-link" active-class="active" @click="close">
                <span class="icon">📜</span>
                <span class="label">Terms & Conditions</span>
              </router-link>
            </li>
          </ul>
        </nav>
      </aside>
      <div class="settings-content">
        <button class="hamburger" @click="toggle" aria-label="Open settings menu" :class="{ active: isOpen }">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <router-view />
      </div>
      <div v-if="isOpen" class="drawer-overlay" @click="close"></div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SettingsLayout',
    data() {
      return { isOpen: false };
    },
    methods: {
      toggle() { this.isOpen = !this.isOpen; },
      close() { this.isOpen = false; }
    }
  }
  </script>
  
  <style scoped>
  .settings-page {
    display: flex;
    gap: 24px;
    padding: 0;
    /* Fill the screen height beneath the fixed top navbar */
    min-height: calc(100dvh - 80px);
    min-height: calc(100vh - 80px); /* Fallback for older browsers */
  }
  
  .settings-content {
    flex: 1 1 auto;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    padding: 20px;
    margin-left: 324px; /* 300px sidebar + 24px gap */
    position: relative;
  }
  
  .settings-nav {
    width: 300px;
    position: fixed;
    top: 80px;
    left: 0;
    background: linear-gradient(135deg, #00C853 0%, #009688 100%);
    /* full height to the bottom with no outer white space */
    height: calc(100dvh - 80px);
    height: calc(100vh - 80px); /* Fallback for older browsers */
    display: flex;
    transition: transform 0.25s ease;
  }
  
  .settings-nav nav {
    flex: 1 1 auto;
    padding: 16px;
  }
  
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .settings-header {
    padding: 6px 8px 16px 8px;
    margin: 0 0 8px 0;
    border-bottom: 1px solid rgba(255,255,255,0.2);
  }
  
  .settings-header h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.3px;
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    background: rgba(255,255,255,0.14);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 10px;
    padding: 14px 16px;
    color: #ffffff;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    transition: background 0.2s ease, transform 0.1s ease;
  }
  
  .nav-link:hover {
    background: rgba(255,255,255,0.22);
  }
  
  .nav-link.active {
    background: #ffffff;
    color: #065f46; /* deep green text */
    border-color: #00C853;
    box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.18);
  }
  
  .icon {
    font-size: 18px;
  }
  
  /* Hamburger Menu Styling - Always visible but positioned differently */
  .hamburger {
    display: none; /* Hidden on desktop by default */
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, #00C853 0%, #009688 100%);
    box-shadow: 0 4px 12px rgba(0, 200, 83, 0.3);
    position: relative;
    transition: all 0.3s ease;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
  }
  
  .hamburger:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 200, 83, 0.4);
  }
  
  .hamburger:active {
    transform: translateY(0);
  }
  
  .hamburger span {
    display: block;
    width: 24px;
    height: 3px;
    background: #ffffff;
    border-radius: 2px;
    transition: all 0.3s ease;
    transform-origin: center;
  }
  
  /* Active state animation */
  .hamburger.active {
    background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%);
  }
  
  .hamburger.active span:nth-child(1) {
    transform: rotate(45deg) translate(6px, 6px);
  }
  
  .hamburger.active span:nth-child(2) {
    opacity: 0;
  }
  
  .hamburger.active span:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -6px);
  }
  
  @media (max-width: 1024px) {
    .settings-page {
      flex-direction: column;
    }
    
    .settings-nav {
      position: fixed;
      top: 80px;
      left: 0;
      width: 280px;
      height: calc(100dvh - 80px);
      height: calc(100vh - 80px); /* Fallback for older browsers */
      transform: translateX(-100%);
      z-index: 1200; /* above overlay */
    }
    
    .settings-nav.open { 
      transform: translateX(0); 
    }
    
    .hamburger {
      display: flex; /* Show on mobile */
      position: fixed;
      top: 95px; /* below mobile nav */
      left: 16px;
      z-index: 1300; /* Above everything */
    }
    
    .drawer-overlay {
      position: fixed;
      top: 80px;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1100; /* below drawer, above content */
      backdrop-filter: blur(4px);
    }
    
    ul {
      flex-direction: column; /* same layout as desktop */
    }
    
    .nav-link {
      flex: none;
      justify-content: flex-start;
    }
    
    .settings-content {
      margin-left: 0;
      padding-top: 60px; /* Make room for hamburger */
    }
  }
  
  /* Optional: Show hamburger on desktop too for better UX */
  @media (max-width: 1200px) {
    .settings-content {
      margin-left: 0;
      padding-left: 80px; /* Make room for hamburger */
    }
    
    .hamburger {
      display: flex;
      position: fixed;
      top: 95px;
      left: 16px;
      z-index: 1000;
    }
    
    .settings-nav {
      transform: translateX(-100%);
      z-index: 1200;
    }
    
    .settings-nav.open { 
      transform: translateX(0); 
    }
  }</style>