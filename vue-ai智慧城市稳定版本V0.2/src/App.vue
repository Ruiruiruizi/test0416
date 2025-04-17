<script setup>
import SmartScreen from './components/SmartScreen.vue'
</script>

<template>
  <div id="app">
    <SmartScreen />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  background: #0a1a2f;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0a1a2f;
}

body {
  font-family: Arial, sans-serif;
}
</style>
