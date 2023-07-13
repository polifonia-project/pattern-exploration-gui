<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'App',
  setup() {
    const settings = ref({
      excludeTrivialPatterns: false,
      selectedSimilarityMeasure: 'Measure 1',
    });

    onMounted(() => {
      const storedSettings = JSON.parse(localStorage.getItem('settings'));
      if (storedSettings) {
        settings.value.excludeTrivialPatterns = storedSettings.excludeTrivialPatterns || false;
        settings.value.selectedSimilarityMeasure = storedSettings.selectedSimilarityMeasure;
      }
    });

    const saveSettings = (newSettings) => {
      settings.value = newSettings;
      localStorage.setItem('settings', JSON.stringify(newSettings));
    };

    return {
      settings,
      saveSettings,
    };
  },
}
</script>


<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
