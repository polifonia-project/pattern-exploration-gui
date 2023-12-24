<template>
  <div id="app">
    <TopNavbar />
    <router-view />
  </div>
</template>

<script>
import TopNavbar from "@/components/TopNavbar.vue";

export default {
    name: 'App',
    components: {TopNavbar}
}
</script>
