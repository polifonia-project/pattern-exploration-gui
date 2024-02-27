<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark text-white">
        <div class="container-fluid">
            <!-- a class="navbar-brand" href="/">Polifonia</a -->

            <router-link to="/" class="navbar-brand">
                <img src="@/assets/logo-polifonia.svg" alt="">
            </router-link>
            <router-link to="/" class="navbar-brand align-bottom pl-3 pe-4 pb-0 pt-2">
                <span id="site_name">Patterns UI</span>
            </router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <router-link to="/" class="nav-link active" aria-current="page">Search</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link" to="/about">About</router-link>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
export default {
    name: 'TopNavbar'
};
</script>

<style scoped>
#site_name {
    font-size: 25px;
}
</style>

