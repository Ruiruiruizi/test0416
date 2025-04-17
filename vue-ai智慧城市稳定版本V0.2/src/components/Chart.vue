<template>
  <div class="chart-card">
    <div class="chart-title">{{ title }}</div>
    <div class="chart-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.chart-card {
  background: rgba(16, 31, 50, 0.8);
  border-radius: 10px;
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-title {
  color: #00f2ff;
  font-size: 16px;
  margin-bottom: 10px;
  text-align: center;
}

.chart-content {
  flex: 1;
  min-height: 0;
}
</style>
