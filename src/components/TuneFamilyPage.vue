<template>
    <div class="container">
        <div class="row">
            <h1>{{fam.replaceAll("_"," ")}} Tune Family</h1>
        </div>
        <div class="row">
            <citationGenerator v-bind:pageTitle="pageTitle"></citationGenerator>
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
import CitationGenerator from "@/components/citationGenerator.vue";

export default {
    name: 'TuneFamilyPage',
    components: {CitationGenerator},
    data() {
        return {
            fam: this.$route.params.fam,
            tuneFamilyList: [],
            pageTitle: "",
        }
    },
    methods: {
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
        // Set page title for the citation generator.
        this.pageTitle = this.fam.replaceAll("_"," ") + " Tune Family";

        //Download the tune family memeber tunes data from the KG.
        this.getTuneFamilyMembers(this.fam);
    }
}
</script>
