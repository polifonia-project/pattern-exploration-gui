<template>
    <div class="container">
        <div class="row">
            <h1>{{fam.replaceAll("_"," ")}} Tune Family</h1>
        </div>
        <div class="row">
            <div class="citationWindow">
                <p class="d-inline-flex gap-1">
                    <a @click="generateCitation('APA')" class="btn btn-primary" data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
                        <img  class="bi" width="24" height="24" src="@/assets/cite.svg" alt=""> Cite
                    </a>
                </p>
                <div class="collapse" id="collapseExample">
                    <div class="card card-body">
                        <div class="row">
                            <div class="col-4">
                                <div class="btn-group-vertical" role="group" aria-label="Vertical radio toggle button group">
                                    <input @click="generateCitation('APA')" type="radio" class="btn-check" name="vbtn-radio" id="vbtn-radio1" autocomplete="off" checked>
                                    <label class="btn btn-outline-primary" for="vbtn-radio1">APA</label>
                                    <input @click="generateCitation('MLA')" type="radio" class="btn-check" name="vbtn-radio" id="vbtn-radio2" autocomplete="off">
                                    <label class="btn btn-outline-primary" for="vbtn-radio2">MLA</label>
                                    <input @click="generateCitation('Harvard')" type="radio" class="btn-check" name="vbtn-radio" id="vbtn-radio3" autocomplete="off">
                                    <label class="btn btn-outline-primary" for="vbtn-radio3">Harvard</label>
                                </div>
                            </div>
                            <div class="col-8">
                                <div class="row">
                                    <div class="mb-3">
                                        <!-- textarea v-model="citation" class="form-control" id="citationTextArea" rows="3"></textarea -->
                                        <p>{{citation}}</p>
                                    </div>
                                </div>
                                <div class="row">
                                    <button class="btn btn-primary" @click="copyCiteToClipboard()">Copy</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row my-4">
            <div class="col-12">
                <h5>Tunes within the Tune Family "{{fam.replaceAll("_"," ")}}"</h5>
                <table v-if="tuneFamilyList.length > 0" class="table table-hover mt-3">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>ID</th>
                        <th>Type</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(tune, index) in tuneFamilyList" :key="index" @click="openDetails(tune.id.value)">
                        <td>{{ "title" in tune && tune.title.value ? tune.title.value.replace(/^(.*?)(?:, The)$/, "The $1") : 'Unknown' }}</td>
                        <td>{{ this.formatID(tune.id.value) }}</td>
                        <td>{{ "type" in tune && tune.type.value ? tune.type.value : 'Unknown' }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: 'TuneFamilyPage',
    data() {
        return {
            fam: this.$route.params.fam,
            tuneFamilyList: [],
            citation: "",
        }
    },
    methods: {
        generateCitation(refStyle){
            let url = new URL(location.href).href;
            let title = this.fam.replaceAll("_"," ") + " Tune Family";
            let kg_version = JSON.parse(sessionStorage.getItem('kg_version'));
            let date = new Date();
            const options = {
                day: "numeric",
                month: "long",
                year: "numeric"
            };
            let currDate = date.toLocaleString('default', options);
            //let mod_date = new Date(document.lastModified);
            //let modDate = mod_date.toLocaleString('default', options);
            let modDate = "2024";

            if(refStyle === "APA"){
                this.citation = "Polifonia Project. ("+modDate+"). " +
                    title + " (" +
                    kg_version + ")." +
                    url;
            } else if (refStyle === "MLA") {
                this.citation = "Polifonia Project. \"" +
                    title + ".\" " +
                    "Polifonia Project, " +
                    kg_version +
                    ", "+modDate+", " +
                    url.replace(/(^\w+:|^)\/\//, '');
            } else if (refStyle === "Harvard") {
                this.citation = "Polifonia Project (2024): " +
                    title + ", " +
                    "Polifonia Project, [online]. " +
                    kg_version + ". " +
                    url +
                    " [accessed " + currDate + "].";
            }
        },
        copyCiteToClipboard(){
            navigator.clipboard.writeText(this.citation);
        },
        formatID(id){
            let prefix = "";
            if(id.includes("thesession")){
                prefix = "S";
            } else if (id.includes("MTC")) {
                prefix = "M";
            } else {
                prefix = id.split('/')[0].substring(0, 3).toUpperCase();
            }

            return prefix + id.split('/').pop();
        },
        getTuneFamilyMembers(fam){
            let params = {
                family: fam
            };
            axios.get(process.env.VUE_APP_SERVER_URL + '/api/tuneFamilyMembers', { params })
                .then(response => {
                    this.tuneFamilyList = response.data.results.bindings;
                })
                .catch(error => {
                    console.error(error);
                });
        },
        openDetails(id) {
            this.$router.push({ name: 'CompositionPage', params: { id: id}});
        },
    },
    mounted() {
        this.getTuneFamilyMembers(this.fam);
    }
}
</script>

<style scoped>
.citationWindow{
    max-width: 500px;
}
</style>
