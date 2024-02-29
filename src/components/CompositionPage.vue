<template>
    <div class="container-fluid">
        <div class="row mb-3">
            <div class="row">
            <h1>{{title.replace(/^(.*?)(?:, The)$/, "The $1")}}</h1>
            </div>
            <div class="row">
                <div class="col-12">
                    Tune ID: {{this.formatID(id)}}
                </div>
            </div>
            <div class="row">
                <div v-if="this.tuneFamily !== 'Unknown'">
                    <router-link class="nav-link p-0" :to="'/family/' + this.tuneFamily">Tune Family: {{tuneFamily.replaceAll("_"," ")}}</router-link>
                </div>
            </div>
            <div class="row">
                <div v-if="this.link">
                    <a class="nav-link p-0" v-bind:href="link">More Information</a>
                </div>
            </div>
            <div class="row">
                <citationGenerator v-bind:pageTitle="pageTitle"></citationGenerator>
            </div>
        </div>
        <div class="row px-1 py-2 justify-content-center">
            <div class="col-lg-2 col-md-6 px-4 mb-4">
                <div class="row">
                    <h6>Patterns contained in "{{title.replace(/^(.*?)(?:, The)$/, "The $1")}}" ({{this.formatID(id)}})</h6>
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
                <!-- div class="row">
                    <nav aria-label="Page navigation example">
                        <ul class="pagination pagination-sm">
                            <li class="page-item"><a class="page-link">Previous</a></li>
                            <li class="page-item"><a class="page-link">1</a></li>
                            <li class="page-item"><a class="page-link">2</a></li>
                            <li class="page-item"><a class="page-link" href="#">3</a></li>
                            <li class="page-item"><a class="page-link" href="#">Next</a></li>
                        </ul>
                    </nav>
                </div -->
                <div class="row">
                    <div class="form-check form-switch">
                        <input v-model="exclude_trivial_patterns" class="form-check-input" type="checkbox" id="item_exclude_trivial_patterns" checked>
                        <label class="form-check-label" for="item_exclude_trivial_patterns">Exclude Trivial Patterns</label>
                    </div>
                </div>
            </div>
            <div class="col-lg-2 col-md-6 px-4 mb-4" v-if="prev">
                <div class="row">
                    <h6>Patterns in common between "{{title.replace(/^(.*?)(?:, The)$/, "The $1")}}" ({{this.formatID(id)}}) and "{{prevTitle.replace(/^(.*?)(?:, The)$/, "The $1")}}" ({{this.formatID(prev)}})</h6>
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
                <div class="row">
                    <div class="form-check form-switch">
                        <input v-model="exclude_trivial_patterns_diff" class="form-check-input" type="checkbox" id="item_exclude_trivial_patterns_diff" checked>
                        <label class="form-check-label" for="item_exclude_trivial_patterns_diff">Exclude Trivial Patterns</label>
                    </div>
                </div>
            </div>
            <div class="col-lg-8 col-md-12 px-4">
                <div class="row px-3 mb-2">
                    <div class="form-check form-switch">
                        <input v-model="net_vis_show_pattterns" class="form-check-input" type="checkbox" id="item_net_vis_show_pattterns" checked>
                        <label class="form-check-label" for="item_net_vis_show_pattterns">Show Pattern Nodes</label>
                    </div>
                </div>
                <div class="row">
                    <div v-if="net_vis_show_pattterns" id="nav-explore">
                        <template v-if="childDataLoaded">
                            <NetworkGraph v-bind:id="id" v-bind:tuneData="tuneData" v-bind:exclude_trivial_patterns="exclude_trivial_patterns" @changeComposition="changeTune"/>
                        </template>
                    </div>
                    <div v-else id="nav-common-patterns">
                        <template v-if="childDataLoaded">
                            <NetworkGraphCommonPatterns v-bind:id="id" v-bind:tuneData="tuneData" v-bind:exclude_trivial_patterns="exclude_trivial_patterns" @changeComposition="changeTune"/>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from "axios";
    import NetworkGraph from "@/components/NetworkGraph.vue";
    import NetworkGraphCommonPatterns from "@/components/NetworkGraphCommonPatterns.vue";
    import CitationGenerator from "@/components/citationGenerator.vue";

    export default {
        name: 'CompositionPage',
        components: {CitationGenerator, NetworkGraph, NetworkGraphCommonPatterns},
        data(){
            return{
                ptnData: [],
                cmnPtnData: [],
                tuneData: [],
                title: "",
                tuneFamily: "",
                link: "",
                exclude_trivial_patterns: true,
                exclude_trivial_patterns_diff: true,
                id: this.$route.params.id,
                prev: this.$route.params.prev,
                prevTitle: this.$route.params.prevTitle,
                childDataLoaded: false,
                pageTitle: "",
                net_vis_show_pattterns: true,
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

                        //Set the page title for the citation generator.
                        this.pageTitle = this.title.replace(/^(.*?)(?:, The)$/, "The $1") + " (" + this.formatID(this.id) + ")";
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
            getPatternsInCommon(curr_id, prev_id, etp) {
                let params = {
                    id: curr_id,
                    prev: prev_id,
                    excludeTrivialPatterns: etp,
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
                this.prevTitle = this.$route.params.prevTitle;

                this.init();
            },
            init(){
                // On page load or reroute, firstly, download the tune data for the page's tune.
                this.getTuneData(this.id);

                // On page load or reroute, download the most common patterns in this tune.
                this.getPatterns(this.id, true);

                if(this.prev){
                    // On page load or reroute, download the patterns in common between this tune and the previous one.
                    this.getPatternsInCommon(this.id, this.prev, this.exclude_trivial_patterns_diff);
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
            exclude_trivial_patterns_diff() {
                if(this.prev){
                    // If 'exclude trivial patterns' is toggled, download the patterns in common between this tune and the previous one.
                    this.getPatternsInCommon(this.id, this.prev, this.exclude_trivial_patterns_diff);
                }
            },
        },
    }
</script>
