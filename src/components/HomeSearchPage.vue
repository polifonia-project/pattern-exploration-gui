<template>
    <div class="container">
        <div class="row pt-5">
            <div class="col-8 col-xs-8">
                <div v-if="!advanced_search" class="mb-3">
                    <input type="text" class="form-control" v-model="searchTerm" @keydown.enter="search" placeholder="Search...">
                    <div v-if="!valid_pattern">Valid pattern delimiters: _ , - </div>
                </div>
                <div v-else>
                    <div class="mb-3 row">
                        <label for="item_title" class="col-sm-2 col-form-label">Title</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="item_title" v-model="title" placeholder="" @keydown.enter="search">
                        </div>
                    </div>
                    <div class="mb-3 row">
                        <label for="item_pattern" class="col-sm-2 col-form-label">Pattern</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="item_pattern" v-model="pattern" @keydown.enter="search">
                            <div v-if="!valid_pattern">Valid pattern delimiters: _ , -</div>
                        </div>
                    </div>
                    <div class="mb-3 row">
                        <label for="item_corpus" class="col-sm-2 col-form-label">Corpus</label>
                        <div class="col-sm-10">
                            <Multiselect id="item_corpus" v-model="corpus" :options="corpusOptions" mode="tags" :close-on-select="false" @keydown.enter="search"/>
                        </div>
                    </div>
                    <div class="mb-3 row">
                        <label for="item_key" class="col-sm-2 col-form-label">Key</label>
                        <div class="col-sm-10">
                            <Multiselect id="item_key" v-model="key" :options="keyOptions" mode="tags" :close-on-select="false" @keydown.enter="search"/>
                        </div>
                    </div>
                    <div class="mb-3 row">
                        <label for="item_time_signature" class="col-sm-2 col-form-label">Time Signature</label>
                        <div class="col-sm-10">
                            <Multiselect id="item_time_signature" v-model="timeSignature" :options="timeSignatureOptions" mode="tags" :close-on-select="false" @keydown.enter="search"/>
                        </div>
                    </div>
                    <div class="mb-3 row">
                        <label for="item_tune_type" class="col-sm-2 col-form-label">Tune Type</label>
                        <div class="col-sm-10">
                            <Multiselect id="item_tune_type" v-model="tuneType" :options="tuneTypeOptions" mode="tags" :close-on-select="false" @keydown.enter="search"/>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-4 col-xs-4 my-1">
                <div class="row p-0">
                    <div class="col-md-6 col-xs-12">
                        <button type="button" class="btn btn-primary" @click="search()">Search</button>
                    </div>
                    <div class="dropdown col-md-6 col-xs-12 my-1">
                        <select class="form-select" v-model="searchType">
                            <option class="dropdown-item" value="title">Title</option>
                            <option class="dropdown-item" value="pattern">Pattern</option>
                            <option class="dropdown-item" value="advanced">Advanced</option>
                        </select>
                    </div>
                </div>
            </div>
            <!--div class="col-2 col-xs-4">
                <div>
                    <button type="button" class="btn btn-primary" @click="search()">Search</button>
                </div>
            </div>
            <div class="col-2 col-xs-8">
                <select class="form-select" v-model="searchType">
                    <option value="title">Title</option>
                    <option value="pattern">Pattern</option>
                    <option value="advanced">Advanced</option>
                </select>
            </div -->
        </div>
        <div class="row">
            <!-- Display the search results in a table -->
            <table v-if="searchResults.length > 0" class="table table-hover">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>ID</th>
                        <th>Tune Type</th>
                        <th>Key</th>
                        <th>Time Signature</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(tune, index) in searchResults" :key="index" @click="openDetails(tune.id.value)">
                        <td>{{ tune.tune_name.value ? tune.tune_name.value.replace(/^(.*?)(?:, The)$/, "The $1") : "Unknown"}}</td>
                        <td>{{ this.formatID(tune.id.value) }}</td>
                        <td>{{ "tuneType" in tune && tune.tuneType.value ? tune.tuneType.value: 'Unknown' }}</td>
                        <td>{{ "key" in tune && tune.key.value ? tune.key.value.replace(/^(.)(.*)$/, "$1 $2") : 'Unknown' }}</td>
                        <td>{{ "signature" in tune && tune.signature.value ? tune.signature.value : 'Unknown' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div  v-if="noResults">
            No results
        </div>
    </div>
</template>
    
<script>
import axios from 'axios';
import Multiselect from '@vueform/multiselect';

export default {
    name: 'HomeSearchPage',
    components: {
        Multiselect
    },
    data() {
        return {
            searchTerm: '',
            searchResults: [],
            searchType: 'title',
            title: '',
            pattern: '',
            corpus: [],
            corpusOptions: [],
            key: [],
            keyOptions: [],
            timeSignature: [],
            timeSignatureOptions: [],
            tuneType: [],
            tuneTypeOptions: [],
            noResults: false,
            valid_pattern: true,
        };
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
        search() {
            let params = {};
            if (this.advanced_search) {
                params = {
                    searchType: this.searchType,
                    pattern: this.pattern,
                    title: this.title,
                    corpus: JSON.parse(JSON.stringify(this.corpus)),
                    key: JSON.parse(JSON.stringify(this.key.map((a) => {return a === "Unknown" ? "" : a.replace(/^(.)\s(.*)$/, "$1$2") }))),
                    timeSignature: JSON.parse(JSON.stringify(this.timeSignature)),
                    tuneType: JSON.parse(JSON.stringify(this.tuneType)),
                };
            } else {
                params = {
                    searchType: this.searchType,
                    searchTerm: this.searchTerm,
                };
            }

            this.noResults = false;
            // Check for all empty fields.
            if(Object.values(Object.fromEntries(Object.entries(params).filter(e => e[0] !== 'searchType'))).every(x => x === null || x === '' || x.length === 0)) {
                // Error message.
                this.noResults = true;
            } else {
                // Check if the inputted pattern is valid.
                if (this.ValidPattern(params)) {
                    // Replace separators with underscores.
                    if (params.searchType === "pattern"){
                        params.searchTerm = this.searchTerm.replaceAll(/[_, -]\s*/g, ', ')
                    }
                    else if(params.searchType === "advanced"){
                        params.pattern = this.pattern.replaceAll(/[_, -]\s*/g, ', ')
                    }

                    // Change url
                    this.$router.push({name: 'HomeSearchPage', query: params})
                    // Send request to backend.
                    //this.searchRequest(params);
                } else {
                    this.noResults = false;
                }
            }
        },
        ValidPattern(params){
            if (params.searchType === "pattern"){
                this.valid_pattern = this.pattern_validation(params.searchTerm);
            }
            else if(params.searchType === "advanced"){
                if(params.pattern === "") this.valid_pattern = true;
                else this.valid_pattern = this.pattern_validation(params.pattern);
            }
            else {
                this.valid_pattern = true;
            }
            return this.valid_pattern;
        },
        searchRequest(params) {
            axios.get(process.env.VUE_APP_SERVER_URL + '/api/search',
                {
                    params: params,
                    paramsSerializer: {
                        indexes: null
                    }
                })
                .then(response => {
                    this.searchResults = response.data.results.bindings;
                    this.noResults = this.searchResults.length === 0;
                })
                .catch(error => {
                    console.error(error);
                });
        },
        openDetails(id) {
            this.$router.push({ name: 'CompositionPage', params: { id: id}});
        },
        pattern_validation(ptn){
            let regex = /^[0-9](?:(?:,\s|[_ ,-])[0-9]){3,}$/;
            return regex.test(ptn);
        },
        getCorpusList() {
            let corpuses_list = JSON.parse(sessionStorage.getItem('corpus'));
            if (corpuses_list) {
                this.corpusOptions = corpuses_list;
            } else {
                //Download list of corpuses.
                axios.get(process.env.VUE_APP_SERVER_URL + `/api/corpus_list`)
                    .then(response => {
                        this.corpusOptions = response.data.map((a) => {return a ? a : 'Unknown'});
                        sessionStorage.setItem('corpus', JSON.stringify(this.corpusOptions));
                    })
                    .catch(() => {});
            }
        },
        getKeyList() {
            let keys_list = JSON.parse(sessionStorage.getItem('key'));
            if (keys_list) {
                this.keyOptions = keys_list;
            } else {
                //Download list of key.
                axios.get(process.env.VUE_APP_SERVER_URL + `/api/keys_list`)
                    .then(response => {
                        this.keyOptions = response.data.map((a) => {return a ? a.replace(/^(.)(.*)$/, "$1 $2") : 'Unknown'});
                        sessionStorage.setItem('key', JSON.stringify(this.keyOptions));
                    })
                    .catch(() => {});
            }
        },
        getTimeSigList() {
            let time_sig_list = JSON.parse(sessionStorage.getItem('timeSignature'));
            if (time_sig_list) {
                this.timeSignatureOptions = time_sig_list;
            } else {
                //Download list of time signatures.
                axios.get(process.env.VUE_APP_SERVER_URL + `/api/time_sig_list`)
                    .then(response => {
                        this.timeSignatureOptions = response.data.map((a) => {return a ? a : 'Unknown'});
                        sessionStorage.setItem('timeSignature', JSON.stringify(this.timeSignatureOptions));
                    })
                    .catch(() => {});
            }
        },
        getTuneTypeList() {
            let tune_type_list = JSON.parse(sessionStorage.getItem('tuneType'));
            if (tune_type_list) {
                this.tuneTypeOptions = tune_type_list;
            } else {
                //Download list of tune types.
                axios.get(process.env.VUE_APP_SERVER_URL + `/api/tune_type_list`)
                    .then(response => {
                        this.tuneTypeOptions = response.data.map((a) => {return a ? a : 'Unknown'});
                        sessionStorage.setItem('tuneType', JSON.stringify(this.tuneTypeOptions));
                    })
                    .catch(() => {});
            }
        }
    },
    computed: {
        advanced_search(){
            return this.searchType === "advanced"
        },
    },
    mounted() {
        this.noResults = false;
        if (Object.keys(this.$route.query).length !== 0) {
            this.searchRequest(this.$route.query);
        }
        // Download the list of corpuses if necessary.
        this.getCorpusList();
        // Download the list of keys if necessary.
        this.getKeyList();
        // Download the list of time signatures if necessary.
        this.getTimeSigList();
        // Download the list of tune types if necessary.
        this.getTuneTypeList();
    },
    watch: {
        $route(){
            this.noResults = false;
            if (Object.keys(this.$route.query).length !== 0) {
                this.searchRequest(this.$route.query);
            }
        }
    }
}
</script>

<style src="@vueform/multiselect/themes/default.css">
</style>

<style scoped>
    .btn-primary{
        background-image: linear-gradient(120deg, #6400B5, #FF0000);
        //border-color: #6400B5;
        border-color: white;
    }
</style>
