<template>
    <div class="container">
        <div class="row">
            <h1>Pattern: {{pattern}}</h1>
        </div>
        <div class="row">
            <citationGenerator v-bind:pageTitle="pageTitle"></citationGenerator>
        </div>
        <div class="row">
            <div id="notation" class="stave"></div>
        </div>
        <div class="row">
            <div id="audio" class="stave"></div>
        </div>
        <div class="row my-5">
            <h5>Tunes Containing the Pattern "{{this.pattern}}"</h5>
            <table v-if="tuneData.length > 0" class="table table-hover mt-3">
                <thead>
                <tr>
                    <th>Tune</th>
                    <th>ID</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(tune, index) in tuneData" :key="index" @click="toCompositionPage(tune.id.value)">
                    <td>{{ "title" in tune && tune.title.value ? tune.title.value.replace(/^(.*?)(?:, The)$/, "The $1") : 'Unknown' }}</td>
                    <td>{{ this.formatID(tune.id.value)}}</td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import abcjs from "abcjs";
import 'abcjs/abcjs-audio.css';
import CitationGenerator from "@/components/citationGenerator.vue";

export default {
    name: 'PatternPage',
    components: {CitationGenerator},
    data(){
        return{
            tuneData: [],
            pattern: this.$route.params.pattern,
            melody: "",
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
        createABC(){
            let diatonic_dict = {
                0: "c",
                1: "d",
                2: "e",
                3: "f",
                4: "g",
                5: "a",
                6: "b"
            };
            let abc_string = 'X:1\n' +
                'T:\n' +
                'M:C\n' +
                'K:C\n' +
                'Q: 1/4=100\n';

            let pattern_list = this.pattern.split(', ');
            for(let n in pattern_list){
                abc_string += diatonic_dict[(pattern_list[n] - 1)%7] + " ";
            }
            abc_string += "]"
            this.melody = abc_string;
        },
        setupABC() {
            if (abcjs.synth.supportsAudio()) {
                this.createABC();
                let visualObj = abcjs.renderAbc('notation', this.melody)[0];
                let synthControl = new abcjs.synth.SynthController();
                synthControl.load("#audio", null, {displayRestart: true, displayPlay: true, displayProgress: true});
                synthControl.setTune(visualObj, false);
            } else {
                document.querySelector("#audio").innerHTML = "<div class='audio-error'>Audio is not supported in this browser.</div>";
            }
        }
    },
    mounted() {
        // Set page title for the citation generator.
        this.pageTitle = "Pattern: '" + this.pattern + "'";

        // On page load, download the list of tunes containing this pattern.
        this.getTunesList(this.pattern);
        this.setupABC();
    }
}
</script>

<style scoped>
.stave{
    max-width: 300px;
}
</style>
