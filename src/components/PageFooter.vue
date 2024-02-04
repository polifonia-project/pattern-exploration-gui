<template>
    <footer class="py-5 mt-auto bg-dark-subtle text-white footer">
        <div class="container">
            <div class="row">
                <div class="col mb-3">
                    <a href="https://polifonia-project.eu/" class="d-flex align-items-center mb-3 link-body-emphasis text-decoration-none">
                        <!-- svg class="bi me-2" width="40" height="32"><use xlink:href="@/assets/logo-polifonia-white.svg"/></svg -->
                        <img src="@/assets/logo-polifonia-white.svg" alt="">
                    </a>
                </div>

                <div class="col mb-3">

                </div>

                <div class="col mb-3">
                    <ul class="nav flex-column">
                        <li class="nav-item mb-2"><a href="/" class="nav-link p-0 text-white">Search</a></li>
                        <!--li class="nav-item mb-2"><a @click="toAboutPage()" class="nav-link p-0 text-white">About</a></li-->
                        <li class="nav-item mb-2"><router-link class="nav-link p-0 text-white" to="/about">About</router-link></li>
                    </ul>
                </div>

                <div class="col mb-3">
                    <p>Knowledge graph Version:</p>
                    <p>{{KGVersion}}</p>
                </div>
            </div>
            <div class="row">
                <p style="font-size: small;"><a class="text-white" href="https://www.freepik.com/free-vector/low-poly-abstract-design_7178735.htm">Background image by kjpargeter</a> on Freepik</p>
            </div>

            <div class="d-flex flex-column flex-sm-row justify-content-between border-top py-4 my-4">
                <p>
                    <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">
                        <img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/80x15.png">
                    </a>&nbsp;
                    Polifonia H2020 is licensed under a&nbsp;<a rel="license" href="http://creativecommons.org/licenses/by/4.0/" class="text-white">Creative Commons Attribution 4.0 International License</a>.
                </p>
                <ul class="list-unstyled d-flex">
                    <li class="ms-3"><a class="link-body-emphasis" href="https://twitter.com/PolifoniaH2020"><img  class="bi" width="24" height="24" src="@/assets/x_logo_white.svg" alt="X.com"></a></li>
                    <li class="ms-3"><a class="link-body-emphasis" href="https://linkedin.com/company/polifonia-h2020"><img  class="bi" width="24" height="24" src="@/assets/linkedin_white.png" alt="LinkedIn"></a></li>
                    <li class="ms-3"><a class="link-body-emphasis" href="https://github.com/polifonia-project"><img  class="bi" width="24" height="24" src="@/assets/github-mark-white.svg" alt="Github"></a></li>
                </ul>
            </div>
        </div>
    </footer>
</template>

<script>
import axios from "axios";

export default {
    name: "PageFooter",
    data() {
        return {
            KGVersion: '',
        };
    },
    methods: {
        getKGVersion() {
            let kg_version = JSON.parse(sessionStorage.getItem('kg_version'));
            if (kg_version) {
                this.KGVersion = kg_version;
            } else {
                //Download the knowledge graph version number.
                axios.get(process.env.VUE_APP_SERVER_URL + `/api/kg_version`)
                    .then(response => {
                        let result = response.data.results.bindings;
                        this.KGVersion = result[0].version.value;
                        sessionStorage.setItem('kg_version', JSON.stringify(this.KGVersion));
                    })
                    .catch(() => {});
            }
        },
        toAboutPage() {
            this.$router.push({ name: 'AboutPage'});
        }
    },
    mounted() {
        // Download the knowledge graph version if necessary.
        this.getKGVersion();
    },
};
</script>

<style scoped>
.footer {
    background-image: linear-gradient(120deg, #6400B5, #FF0000);
    //background-color: #6400B5;
    //background-color: #92a8d1;
}
</style>
