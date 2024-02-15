<template>
  <div id="app" class="d-flex flex-column min-vh-100 main">
    <TopNavbar />
    <router-view class="py-5"/>
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

<style>
.main{
    //background-image: url("@/assets/bg3.jpg");
    background-image: linear-gradient(90deg, rgba(255,255,255,0.75), rgba(255,255,255,0.30)), url("@/assets/bg3.jpg");
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center top;
}
</style>
