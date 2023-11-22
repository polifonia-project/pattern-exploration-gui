<template>
    <div class="container">
        <div class="row">
            <div class="row">
                <h1>Pattern: {{pattern}}</h1>
            </div>
            <div class="row">
                <div class="col-12">
                    Insert MIDI Player and stave here.
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-lg-6 col-md-12" v-if="true">
                <div class="row">
                    <table v-if="tuneData.length > 0" class="table table-hover mt-3">
                        <thead>
                        <tr>
                            <th>Tune</th>
                            <th>ID</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(tune, index) in tuneData" :key="index" @click="toCompositionPage(tune.id.value)">
                            <td>{{ tune.tune_name.value }}</td>
                            <td>{{ tune.id.value}}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: 'PatternPage',
    data(){
        return{
            tuneData: [],
            pattern: this.$route.params.pattern,
        }
    },
    methods: {
        toCompositionPage(id){
            this.$router.push({ name: 'CompositionPage', params: { id: id}});
        },
        getTunesList(pattern) {
            let params = {
                pattern: pattern,
            };
            axios.get(process.env.VUE_APP_SERVER_URL + '/api/tunes_by_pattern', { params })
                .then(response => {
                    this.tuneData = response.data.results.bindings;
                })
                .catch(error => {
                    console.error(error);
                });
        },
    },
    mounted() {
        // On page load, download the list of tunes containing this pattern.
        this.getTunesList(this.pattern);
    }
}
</script>
