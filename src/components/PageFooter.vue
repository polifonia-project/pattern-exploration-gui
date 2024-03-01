<template>
    <footer class="py-5 mt-auto bg-dark-subtle text-white footer">
        <div class="container">
            <div class="row mb-4">
                <div class="col-md-4 mb-3">
                    <a href="https://polifonia.disi.unibo.it/portal/" class="d-flex align-items-center mb-3 link-body-emphasis text-decoration-none justify-content-center">
                        <!-- svg class="bi me-2" width="40" height="32"><use xlink:href="@/assets/logo-polifonia-white.svg"/></svg -->
                        <img src="@/assets/logo-polifonia-web-portal-white.svg" alt="">
                    </a>
                </div>

                <div class="col-md-4 mb-3 px-4 d-flex justify-content-center">
                    <ul class="nav flex-column d-flex justify-content-center">
                        <li class="nav-item mb-2 d-flex justify-content-center"><router-link class="nav-link p-0 text-white" to="/">Search</router-link></li>
                        <li class="nav-item mb-2 d-flex justify-content-center"><router-link class="nav-link p-0 text-white" to="/about">About</router-link></li>
                    </ul>
                </div>

                <div class="col-md-4 mb-3 px-4 d-flex justify-content-center">
                    <div class="row mx-0 px-0 d-flex justify-content-center">
                        <div class="col-md-12 d-flex justify-content-center">Knowledge graph Version:</div>
                        <div class="col-md-12 d-flex justify-content-center">{{KGVersion}}</div>
                    </div>
                </div>
            </div>
            <div class="row mb-0">
                <p style="font-size: x-small;" class="bglink d-flex justify-content-center"><a class="text-white mb-0" href="https://www.freepik.com/free-vector/low-poly-abstract-design_7178735.htm">Background image by kjpargeter</a>&nbsp;on Freepik</p>
            </div>
            <div class="row">
                <div class="d-flex flex-column flex-sm-row justify-content-between border-top py-4 my-4">
                    <a rel="license" href="https://www.gnu.org/licenses/gpl-3.0.en.html" class="d-flex align-items-center text-white my-4">
                        <img alt="GNU GPLv3" style="border-width:0" src="@/assets/GPLv3_Logo_white.svg">
                        <span style="font-size: small;" class="ms-2">
                            Polifonia Patterns UI is licensed under the GNU General Public Licence version 3.
                        </span>
                    </a>
                    <ul class="list-unstyled d-flex justify-content-center mt-4">
                        <li class="ms-3"><a class="link-body-emphasis" href="https://polifonia-project.eu/"><img  class="bi" width="24" height="24" src="@/assets/polifonia_logo_without_text_white.svg" title="Polifonia Web Portal"></a></li>
                        <li class="ms-3"><a class="link-body-emphasis" href="https://twitter.com/PolifoniaH2020"><img  class="bi" width="24" height="24" src="@/assets/x_logo_white.svg" title="X.com"></a></li>
                        <li class="ms-3"><a class="link-body-emphasis" href="https://linkedin.com/company/polifonia-h2020"><img  class="bi" width="24" height="24" src="@/assets/linkedin_white.png" title="LinkedIn"></a></li>
                        <li class="ms-3"><a class="link-body-emphasis" href="https://github.com/polifonia-project"><img  class="bi" width="24" height="24" src="@/assets/github-mark-white.svg" title="Github"></a></li>
                    </ul>
                </div>
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

.bglink a:link {
    text-decoration: none;
}

.bglink a:visited {
    text-decoration: none;
}

.bglink a:hover {
    text-decoration: underline;
}

.bglink a:active {
    text-decoration: none;
}

</style>
