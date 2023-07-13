<template>
    <div class="page-container">
        <TopNavbar />
        <div class="search-container">
            <input class="search-bar" type="text" v-model="searchTerm" @keypress.enter="search" placeholder="Search...">
            <select class="search-type" v-model="searchType">
                <option value="pattern">Pattern</option>
                <option value="content">Content</option>
                <option value="metadata">Metadata</option>
            </select>
            <button @click="search">Search</button>
        </div>
        <!-- Display the search results in a table -->
        <table v-if="searchResults.length > 0" class="results-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Composer</th>
                    <th>Year</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(tune, index) in searchResults" :key="index" @click="openDetails(tune.id)">
                    <td>{{ tune.name }}</td>
                    <td>{{ tune.composer ? tune.composer: 'Unknown' }}</td>
                    <td>{{ tune.year ? tune.year : 'Unknown' }}</td>
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
            searchType: 'pattern',  // set default value to 'pattern'
        };
    },
    methods: {
        search() {
            let params = {
                query: this.searchTerm,
                excludeTrivialPatterns: this.$root.excludeTrivialPatterns,
                similarityMeasure: this.$root.selectedSimilarityMeasure,
                searchType: this.searchType,
            };
            axios.get(process.env.VUE_APP_SERVER_URL + '/api/search', { params })
                .then(response => {
                    this.searchResults = response.data.tunes;
                })
                .catch(error => {
                    console.error(error);
                });
        },
        openDetails(id) {
        this.$router.push({ name: 'CompositionPage', params: { id: id }});
        }
    },
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
    width: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.search-bar {
    flex: 1;
    height: 35px;
    font-size: 16px;
    padding: 3px 20px;
    border: 1px solid #dfe1e5;
    border-radius: 24px;
    margin-right: 10px;
}

.search-type {
    width: 150px;
    height: 39px;
    border: 1px solid #dfe1e5;
    border-radius: 24px;
    padding: 0 10px;
    background-color: #f8f9fa;
    font-size: 16px;
}

.page-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.search-container {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
}

.search-bar {
  flex: 1;
  height: 35px;
  font-size: 16px;
  padding: 3px 20px;
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
</style>  