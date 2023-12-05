<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
            <a class="navbar-brand" href="/">Polifonia</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="/">Search</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">About</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'TopNavbar',
  setup() {
    const settingsOpen = ref(false);
    const similarityMeasures = ref([]);
    const selectedSimilarityMeasure = ref('');

    onMounted(() => {
      //Download Similarity Measures
      axios.get(process.env.VUE_APP_SERVER_URL + `/api/similarity-measures`)
        .then(response => {
          similarityMeasures.value = response.data;
          // Load settings from local storage
          const settings = JSON.parse(localStorage.getItem('settings'));
          if (settings) {
            selectedSimilarityMeasure.value = settings.selectedSimilarityMeasure || similarityMeasures.value[0];
          }
        })
        .catch(() => {});
    });

    const saveSettings = () => {
      // Save settings to local storage
      const settings = {
        selectedSimilarityMeasure: selectedSimilarityMeasure.value,
      };
      localStorage.setItem('settings', JSON.stringify(settings));
    };

    watch(selectedSimilarityMeasure, saveSettings, { immediate: true });

    const toggleMenu = () => {
      settingsOpen.value = !settingsOpen.value;
    };

    return {
      settingsOpen,
      similarityMeasures,
      selectedSimilarityMeasure,
      toggleMenu,
    };
  },
};
</script>
