<template>
    <div class="container">
        <div class="row">
            <div class="row">
            <h1>Title: {{title}}</h1>
            </div>
            <div class="row">
                <div class="col-12" @click="toTuneFamilyPage(this.tuneFamily)">
                    Tune Family: {{tuneFamily}}
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-lg-6 col-md-12" v-if="true">
                <div class="row">
                    <table v-if="ptnData.length > 0" class="table table-hover mt-3">
                        <thead>
                        <tr>
                            <th>Pattern</th>
                            <th>Occurrences</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(tune, index) in ptnData" :key="index" @click="toPatternPage(tune.pattern.value)">
                            <td>{{ tune.pattern.value.split("/").pop() }}</td>
                            <td>{{ tune.patternFreq.value}}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div class="row">
                    <div class="form-check form-switch">
                        <input v-model="exclude_trivial_patterns" class="form-check-input" type="checkbox" id="item_exclude_trivial_patterns" checked>
                        <label class="form-check-label" for="item_exclude_trivial_patterns">Exclude Trivial Patterns</label>
                    </div>
                </div>
            </div>
            <div class="col-lg-6 col-md-12">
                <template v-if="childDataLoaded">
                    <NetworkGraph v-bind:id="id" v-bind:tuneData="tuneData" v-bind:exclude_trivial_patterns="exclude_trivial_patterns"/>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from "axios";
    import NetworkGraph from "@/components/NetworkGraph.vue";

    export default {
        name: 'CompositionPage',
        components: {NetworkGraph},
        data(){
            return{
                ptnData: [],
                tuneData: [],
                title: "",
                tuneFamily: "",
                exclude_trivial_patterns: true,
                id: this.$route.params.id,
                childDataLoaded: false,
            }
        },
        methods: {
            toTuneFamilyPage(fam){
                this.$router.push({ name: 'TuneFamilyPage', params: { fam: fam}});
            },
            getTuneData(id){
                let params = {
                    id: id
                };
                axios.get(process.env.VUE_APP_SERVER_URL + '/api/tune_by_id', { params })
                    .then(response => {
                        this.tuneData = response.data.results.bindings;
                        this.childDataLoaded = true;
                        this.title = this.tuneData[0].title.value;
                        this.tuneFamily = this.tuneData[0].tuneFamily.value.split("/").pop();
                    })
                    .catch(error => {
                        console.error(error);
                    });
            },
            getPatterns(loc_id, loc_xtp) {
                let params = {
                    id: loc_id,
                    excludeTrivialPatterns: loc_xtp,
                };
                axios.get(process.env.VUE_APP_SERVER_URL + '/api/patterns', { params })
                    .then(response => {
                        this.ptnData = response.data.results.bindings;
                    })
                    .catch(error => {
                        console.error(error);
                    });
            },
            toPatternPage(pattern) {
                let ptn = pattern.split("/").pop();
                this.$router.push({ name: 'PatternPage', params: { pattern: ptn}});
            },
        },
        mounted() {
            // On page load, firstly, download the tune data for the page's tune.
            this.getTuneData(this.id);

            // On page load, download the most common patterns.
            this.getPatterns(this.id, true);
        },
        watch: {
            exclude_trivial_patterns() {
                this.getPatterns(this.id, this.exclude_trivial_patterns);
            },
        },
    }
</script>
