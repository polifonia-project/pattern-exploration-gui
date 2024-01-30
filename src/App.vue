<template>
  <div id="app" class="d-flex flex-column min-vh-100">
    <TopNavbar />
    <router-view />
    <PageFooter />
  </div>
</template>

<script>
import TopNavbar from "@/components/TopNavbar.vue";
import PageFooter from "@/components/PageFooter.vue";

export default {
    name: 'App',
    components: {TopNavbar, PageFooter}
}
</script>
