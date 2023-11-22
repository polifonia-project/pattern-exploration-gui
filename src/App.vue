<template>
  <div id="app">
    <TopNavbar />
    <router-view />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import TopNavbar from "@/components/TopNavbar.vue";

export default {
  name: 'App',
    components: {TopNavbar},
  setup() {
    const settings = ref({
      selectedSimilarityMeasure: 'Measure 1',
    });

    onMounted(() => {
      const storedSettings = JSON.parse(localStorage.getItem('settings'));
      if (storedSettings) {
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

</style>
