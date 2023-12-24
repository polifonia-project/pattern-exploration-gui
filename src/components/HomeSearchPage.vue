<template>
    <div class="container">
        <div class="row pt-5">
            <div class="col-8 col-xs-12">
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
                            <Multiselect id="item_corpus" v-model="corpus" :options="corpusOptions" mode="multiple" :close-on-select="false" @keydown.enter="search"/>
                        </div>
                    </div>
                    <div class="mb-3 row">
                        <label for="item_key" class="col-sm-2 col-form-label">Key</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="item_key" v-model="key" placeholder="" @keydown.enter="search">
                        </div>
                    </div>
                    <div class="mb-3 row">
                        <label for="item_time_signature" class="col-sm-2 col-form-label">Time Signature</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="item_time_signature" v-model="timeSignature" placeholder="" @keydown.enter="search">
                        </div>
                    </div>
                    <div class="mb-3 row">
                        <label for="item_tune_type" class="col-sm-2 col-form-label">Tune Type</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="item_tune_type" v-model="tuneType" placeholder="" @keydown.enter="search">
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-2 col-xs-4">
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
            </div>
        </div>
        <div class="row">
            <!-- Display the search results in a table -->
            <table v-if="searchResults.length > 0" class="table table-hover">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Tune Type</th>
                        <th>Key</th>
                        <th>Signature</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(tune, index) in searchResults" :key="index" @click="openDetails(tune.id.value)">
                        <td>{{ tune.tune_name.value }}</td>
                        <td>{{ tune.tuneType.value ? tune.tuneType.value: 'Unknown' }}</td>
                        <td>{{ tune.key.value ? tune.key.value : 'Unknown' }}</td>
                        <td>{{ tune.signature.value ? tune.signature.value : 'Unknown' }}</td>
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
            searchType: 'title',  // set default value to 'pattern',
            pattern: '',
            key: '',
            timeSignature: '',
            tuneType: '',
            corpus: [],
            corpusOptions: [],
            title: '',
            noResults: false,
            valid_pattern: true,
        };
    },
    methods: {
        search() {
            let params = {};
            if (this.advanced_search) {
                params = {
                    searchType: this.searchType,
                    pattern: this.pattern,
                    title: this.title,
                    corpus: JSON.parse(JSON.stringify(this.corpus)),
                    key: this.key,
                    timeSignature: this.timeSignature,
                    tuneType: this.tuneType,
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
                        params.searchTerm = this.searchTerm.replaceAll(/[, -]/g, '_')
                    }
                    else if(params.searchType === "advanced"){
                        params.pattern = this.pattern.replaceAll(/[, -]/g, '_')
                    }

                    // Change url
                    this.$router.push({name: 'HomeSearchPage', query: params})
                    // Send request to backend.
                    this.searchRequest(params);
                } else {
                    this.noResults = false;
                }
            }
        },
        ValidPattern(params){
            // Method has side effects: sets this.valid_pattern value.
            // Bad code?
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
            let regex = /^[0-9]([_ ,-][0-9]){3,}$/;
            return regex.test(ptn);
        },
        getCorpusList() {
            let corpuses_list = JSON.parse(localStorage.getItem('corpus'));
            if (corpuses_list) {
                this.corpusOptions = corpuses_list;
            } else {
                //Download list of corpuses.
                axios.get(process.env.VUE_APP_SERVER_URL + `/api/corpus_list`)
                    .then(response => {
                        this.corpusOptions = response.data;
                        localStorage.setItem('corpus', JSON.stringify(this.corpusOptions));
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

<style src="@vueform/multiselect/themes/default.css"></style>
