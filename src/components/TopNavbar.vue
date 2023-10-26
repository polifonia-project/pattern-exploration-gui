<template>
  <nav class="navbar">
    <div class="nav-left">
      <router-link to="/">
        <img class="logo" src="../assets/logo.png" alt="Website Logo" />
      </router-link>
      <div class="nav-links">
        <a href="/about">About Us</a>
        <a href="/contact">Contact Us</a>
      </div>
    </div>
    <div class="nav-settings" @click="settingsOpen = !settingsOpen">
      <img class="nav-settings" :class="{ 'rotate': settingsOpen }" src="../assets/cogwheel.png"
        @click="toggleSettings" />
      <div v-if="settingsOpen" class="dropdown-menu">
        <div class="dropdown-item" @click.stop>
          <label for="similarity-measure">Similarity Measure</label>
          <select id="similarity-measure" v-model="selectedSimilarityMeasure">
            <option v-for="measure in similarityMeasures" :key="measure" :value="measure">
              {{ measure }}
            </option>
          </select>
        </div>
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
    const excludeTrivialPatterns = ref(false);
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
            excludeTrivialPatterns.value = settings.excludeTrivialPatterns || false;
            selectedSimilarityMeasure.value = settings.selectedSimilarityMeasure || similarityMeasures.value[0];
          }
        })
        .catch(() => {});
    });

    const saveSettings = () => {
      // Save settings to local storage
      const settings = {
        excludeTrivialPatterns: excludeTrivialPatterns.value,
        selectedSimilarityMeasure: selectedSimilarityMeasure.value,
      };
      localStorage.setItem('settings', JSON.stringify(settings));
    };

    watch(excludeTrivialPatterns, saveSettings, { immediate: true });
    watch(selectedSimilarityMeasure, saveSettings, { immediate: true });

    const toggleMenu = () => {
      settingsOpen.value = !settingsOpen.value;
    };

    return {
      settingsOpen,
      excludeTrivialPatterns,
      similarityMeasures,
      selectedSimilarityMeasure,
      toggleMenu,
    };
  },
};
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  width: 95%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 50px;
  background-color: #1d3557;
  color: #f1faee;
  z-index: 1000;
}

.nav-left {
  display: flex;
  align-items: center;
}

.navbar .logo {
  height: 40px;
  margin-right: 20px;
  /* add some space between logo and navigation links */
}

.navbar .nav-links a {
  margin: 0 10px;
  color: #f1faee;
  text-decoration: none;
}

.navbar .nav-links a:hover {
  color: #a8dadc;
}

.nav-settings img {
  height: 40px;
  cursor: pointer;
}

.dropdown-menu {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 12px;
  position: absolute;
  right: 0;
  top: 100%;
  width: 200px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  /* align to start */
}

.dropdown-item {
  display: block;
  padding: 8px 0;
  text-decoration: none;
  color: #333;
}

.dropdown-menu-item {
  display: flex;
  align-items: center;
  /* align vertically */
  margin-bottom: 10px;
  /* add space between items */
}

.dropdown-menu-item:last-child {
  margin-bottom: 0;
  /* remove space after last item */
}

.dropdown-menu-item .text {
  margin-right: 10px;
  /* add space between text and input */
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked+.slider {
  background-color: #2196F3;
}

input:focus+.slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked+.slider:before {
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.nav-settings {
  transition: transform 0.3s ease-out;
}

.nav-settings.rotate {
  transform: rotate(180deg);
}
</style>

