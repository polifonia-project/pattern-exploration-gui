<template>
    <div class="container-fluid">
        <div class="row mb-5">
            <div class="row">
            <h1>Title: {{title.replace(/^(.*?)(?:, The)$/, "The $1")}}</h1>
            </div>
            <div class="row">
                <div class="col-12">
                    Tune ID: {{this.formatID(id)}}
                </div>
            </div>
            <div class="row">
                <div v-if="this.tuneFamily !== 'Unknown'" class="col-12" @click="toTuneFamilyPage(this.tuneFamily)">
                    Tune Family: {{tuneFamily.replaceAll("_"," ")}}
                </div>
                <div v-if="this.link" class="col-12">
                    <a v-bind:href="link">More Information</a>
                </div>
            </div>
        </div>
        <div class="row px-1 py-2">
            <div class="col-lg-2 col-md-6 px-4">
                <div class="row">
                    <h5>Patterns in {{this.formatID(id)}}</h5>
                    <table v-if="ptnData.length > 0" class="table table-hover mt-3">
                        <thead>
                            <tr>
                                <th>Pattern</th>
                                <th>#</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(tune, index) in ptnData" :key="index" @click="toPatternPage(tune.pattern.value)">
                                <td>{{ tune.pattern.value }}</td>
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
            <div class="col-lg-2 col-md-6 px-4" v-if="prev">
                <div class="row">
                    <h5>Patterns in common with {{this.formatID(prev)}}</h5>
                    <table v-if="cmnPtnData.length > 0" class="table table-hover mt-3">
                        <thead>
                            <tr>
                                <th>Pattern</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(tune, index) in cmnPtnData" :key="index" @click="toPatternPage(tune.pattern.value)">
                                <td>{{ tune.pattern.value }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-else>
                        No patterns in common.
                    </div>
                </div>
            </div>
            <div class="col-lg-8 col-md-12 px-4">
                <nav>
                    <div class="nav nav-tabs flex-column flex-sm-row" id="nav-tab" role="tablist">
                        <button class="flex-sm-fill text-sm-center nav-link active" id="nav-explore-tab" data-bs-toggle="tab" data-bs-target="#nav-explore" type="button" role="tab" aria-controls="nav-explore" aria-selected="false">Tunes and Patterns</button>
                        <button class="flex-sm-fill text-sm-center nav-link" id="nav-common-patterns-tab" data-bs-toggle="tab" data-bs-target="#nav-common-patterns" type="button" role="tab" aria-controls="nav-common-patterns" aria-selected="false">Tune Similarity</button>
                        <!-- button class="flex-sm-fill text-sm-center nav-link" id="nav-van-kranenburg-tab" data-bs-toggle="tab" data-bs-target="#nav-van-kranenburg" type="button" role="tab" aria-controls="nav-van-kranenburg" aria-selected="false">Van Kranenburg Similarity</button -->
                    </div>
                </nav>
                <div class="tab-content" id="nav-tabContent">
                    <div class="tab-pane fade show active" id="nav-explore" role="tabpanel" aria-labelledby="nav-explore-tab">
                        <template v-if="childDataLoaded">
                            <NetworkGraph v-bind:id="id" v-bind:tuneData="tuneData" v-bind:exclude_trivial_patterns="exclude_trivial_patterns" @changeComposition="changeTune"/>
                        </template>
                    </div>
                    <div class="tab-pane fade" id="nav-common-patterns" role="tabpanel" aria-labelledby="nav-common-patterns-tab">
                        <template v-if="childDataLoaded">
                            <NetworkGraphCommonPatterns v-bind:id="id" v-bind:tuneData="tuneData" v-bind:exclude_trivial_patterns="exclude_trivial_patterns" @changeComposition="changeTune"/>
                        </template>
                    </div>
                    <!-- div class="tab-pane fade" id="nav-van-kranenburg" role="tabpanel" aria-labelledby="nav-van-kranenburg-tab">placeholder</div -->
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from "axios";
    import NetworkGraph from "@/components/NetworkGraph.vue";
    import NetworkGraphCommonPatterns from "@/components/NetworkGraphCommonPatterns.vue";

    export default {
        name: 'CompositionPage',
        components: {NetworkGraph, NetworkGraphCommonPatterns},
        data(){
            return{
                ptnData: [],
                cmnPtnData: [],
                tuneData: [],
                title: "",
                tuneFamily: "",
                link: "",
                exclude_trivial_patterns: true,
                id: this.$route.params.id,
                prev: this.$route.params.prev,
                childDataLoaded: false,
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
                        this.tuneFamily = "tuneFamily" in this.tuneData[0] && this.tuneData[0].tuneFamily.value ? this.tuneData[0].tuneFamily.value: 'Unknown';
                        this.link = "link" in this.tuneData[0] ? this.tuneData[0].link.value : "Undefined";
                    })
                    .catch(error => {
                        console.error(error);
                    });
            },
            getPatterns(tuneId, etp) {
                let params = {
                    id: tuneId,
                    excludeTrivialPatterns: etp,
                };
                axios.get(process.env.VUE_APP_SERVER_URL + '/api/patterns', { params })
                    .then(response => {
                        this.ptnData = response.data.results.bindings;
                    })
                    .catch(error => {
                        console.error(error);
                    });
            },
            getPatternsInCommon(curr_id, prev_id) {
                let params = {
                    id: curr_id,
                    prev: prev_id
                };
                axios.get(process.env.VUE_APP_SERVER_URL + '/api/common_patterns', { params })
                    .then(response => {
                        this.cmnPtnData = response.data.results.bindings;
                    })
                    .catch(error => {
                        console.error(error);
                    });
            },
            toPatternPage(pattern) {
                let ptn = pattern.split("/").pop();
                this.$router.push({ name: 'PatternPage', params: { pattern: ptn}});
            },
            changeTune(){
                this.id = this.$route.params.id;
                this.prev = this.$route.params.prev;

                this.init();
            },
            init(){
                // On page load or reroute, firstly, download the tune data for the page's tune.
                this.getTuneData(this.id);

                // On page load or reroute, download the most common patterns in this tune.
                this.getPatterns(this.id, true);

                if(this.prev){
                    // On page load or reroute, download the patterns in common between this tune and the previous one.
                    this.getPatternsInCommon(this.id, this.prev);
                }
            }
        },
        mounted() {
            this.init();
        },
        watch: {
            exclude_trivial_patterns() {
                this.getPatterns(this.id, this.exclude_trivial_patterns);
            },
        },
    }
</script>
