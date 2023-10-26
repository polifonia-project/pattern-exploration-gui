<template>
    <div class="page-container">
        <TopNavbar />
        <div class="search-container">
            <div v-if="!advanced_search" class="basic-search-box">
                <input class="search-bar" type="text" v-model="searchTerm" @keydown.enter="search" placeholder="Search...">
            </div>

            <div v-else class="advanced-search-box">
                <div class="advanced-search-item">
                    <label for="item_pattern">Pattern</label>
                    <input type="text" id="item_pattern" v-model="pattern" placeholder="">
                </div>
                <div class="advanced-search-item">
                    <label for="item_corpus">Corpus</label>
                    <input type="text" id="item_corpus" v-model="corpus" placeholder="">
                </div>
                <div class="advanced-search-item">
                    <label for="item_composition">Composition</label>
                    <input type="text" id="item_composition" v-model="composition" placeholder="">
                </div>
                <div class="advanced-search-item">
                    <label for="item_key">Key</label>
                    <input type="text" id="item_key" v-model="key" placeholder="">
                </div>
                <div class="advanced-search-item">
                    <label for="item_time_signature">Time Signature</label>
                    <input type="text" id="item_time_signature" v-model="timeSignature" placeholder="">
                </div>
                <div class="advanced-search-item">
                    <label for="item_tune_type">Tune Type</label>
                    <input type="text" id="item_tune_type" v-model="tuneType" placeholder="">
                </div>
                <div class="advanced-search-item">
                    <label for="item_exclude_trivial_patterns">Exclude Trivial Patterns</label>
                    <input type="checkbox" id="item_exclude_trivial_patterns" v-model="exclude_trivial_patterns">
                </div>
            </div>
            <div>
                <button @click="search">Search</button>
            </div>


            <select class="search-type" v-model="searchType">
                <option value="pattern">Pattern</option>
                <option value="content">Content</option>
                <option value="metadata">Metadata</option>
                <option value="advanced">Advanced</option>
            </select>
        </div>

        <!-- Display the search results in a table -->
        <table v-if="searchResults.length > 0" class="results-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Tune Type</th>
                    <th>Key</th>
                    <th>Signature</th>
                    <!-- th>Composer</th -->
                    <!-- th>Year</th -->
                </tr>
            </thead>
            <tbody>
                <tr v-for="(tune, index) in searchResults" :key="index" @click="openDetails(tune.id)">
                    <td>{{ tune.tune_name.value }}</td>
                    <td>{{ tune.tuneType.value ? tune.tuneType.value: 'Unknown' }}</td>
                    <td>{{ tune.key.value ? tune.key.value : 'Unknown' }}</td>
                    <td>{{ tune.signature.value ? tune.signature.value : 'Unknown' }}</td>

                    <!-- td>{{ tune.composer ? tune.composer: 'Unknown' }}</td -->
                    <!-- td>{{ tune.year ? tune.year : 'Unknown' }}</td -->
                </tr>
            </tbody>
        </table>
    </div>
</template>
    
<script>
import TopNavbar from './TopNavbar.vue'
import axios from 'axios'; // add this line if it's not there already

export default {
    name: 'HomeSearchPage',
    components: {
        TopNavbar,
    },
    data() {
        return {
            searchTerm: '',
            searchResults: [],
            searchType: 'pattern',  // set default value to 'pattern',
            pattern: '',
            key: '',
            timeSignature: '',
            tuneType: '',
            corpus: '',
            composition: '',
            exclude_trivial_patterns: true,
        };
    },
    methods: {
        search() {
            let params = {};
            if(this.advanced_search) {
                params = {
                    query: this.searchTerm,
                    similarityMeasure: this.$root.selectedSimilarityMeasure,
                    excludeTrivialPatterns: this.exclude_trivial_patterns,
                    searchType: this.searchType,
                    corpus: this.corpus,
                    pattern: this.pattern,
                    composition: this.composition,
                    key: this.key,
                    timeSignature: this.timeSignature,
                    tuneType: this.tuneType,
                };
            }
            else {
                params = {
                    query: this.searchTerm,
                    similarityMeasure: this.$root.selectedSimilarityMeasure,
                    excludeTrivialPatterns: true,
                    searchType: this.searchType,
                };
            }

            axios.get(process.env.VUE_APP_SERVER_URL + '/api/search', { params })
                .then(response => {
                    this.searchResults = response.data.results.bindings;
                })
                .catch(error => {
                    console.error(error);
                });
            
            this.$router.push({name: 'HomeSearchPage', query: params})
        },
        openDetails(id) {
            this.$router.push({ name: 'CompositionPage', params: { id: id }});
        }
    },
    computed: {
        advanced_search(){
            return this.searchType === "advanced"
        }
    },
    watch: {
        advanced_search(new_value) {
            if(!new_value) this.excludeTrivialPatterns = true
        }
    }
}
</script>
    
<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
}

.search-container {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 0;
    margin: 0;
}

.search-bar {
    flex: 1;
    height: 35px;
    width: inherit;
    font-size: 16px;
    padding: 0 20px;
    border: 1px solid #dfe1e5;
    border-radius: 24px;
    margin-right: 10px;
    background: #fff;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.5s ease;
}

.search-bar:focus {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.search-type {
    width: 150px;
    height: 39px;
    border: none;
    border-radius: 24px;
    padding: 0 10px;
    font-size: 16px;
    background: #003366; /* Navy blue background */
    color: #ffffff; /* White text */
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s ease, background 0.2s ease;
}

.search-type:hover {
    background: #40B882; /* Green background on hover */
}

.search-type:focus {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

button {
    margin-left: 1rem;
    padding: 0.6rem 1.5rem;
    font-size: 1rem;
    color: #ffffff; /* White text */
    background-color: #003366; /* Navy blue background */
    border: none;
    border-radius: 24px;
    cursor: pointer;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s ease, background 0.2s ease;
}

button:hover {
    background-color: #40B882; /* Green background on hover */
}

button:focus {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}
.results-table {
    margin-top: 2rem;
    width: 80%;
    border-collapse: collapse;
}

.results-table th,
.results-table td {
    border: 1px solid #ddd;
    padding: 8px;
}

.results-table th {
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: center;
    background-color: #1d3557;
    color: white;
}
.results-table tbody tr {
    cursor: pointer; /* Changes the mouse cursor to a hand to indicate clickability */
    transition: background-color 0.1s ease; 
}
.results-table tbody tr:hover {
    background-color: #40B882;
}

.advanced-search-box {
    width: 50%;
    display: grid;
    border: none;
    border-radius: 24px;
    padding: 0 10px;
    margin: 0 10px;
    line-height: 50px;
    justify-content: center;
    align-items: center;
}

.basic-search-box {
    width: 50%;
    display: flex;
    border: none;
    border-radius: 24px;
    padding: 0 10px;
    margin: 0 10px;
    line-height: 50px;
    justify-content: center;
    align-items: center;
}

.advanced-search-box label {
    width:180px;
    clear:left;
    text-align:left;
    padding-right:10px;
}
.advanced-search-box input, label {
    float:left;
    height: 35px;
    font-size: 16px;
    padding: 3px 20px;
    margin: 4px;
    flex: 1;
}

.advanced-search-box input {
    border: 1px solid #dfe1e5;
    border-radius: 24px;
    margin-right: 10px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.5s ease;
}

</style>

