<template>
    <div class="container">
        <div class="row">
            <h1>Pattern: {{pattern}}</h1>
        </div>
        <div class="row">
            <div class="citationWindow">
                <p class="d-inline-flex gap-1">
                    <a @click="generateCitation('APA')" class="btn btn-primary" data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
                        <img  class="bi" width="24" height="24" src="@/assets/cite.svg" alt=""> Cite
                    </a>
                </p>
                <div class="collapse" id="collapseExample">
                    <div class="card card-body">
                        <div class="row">
                            <div class="col-4">
                                <div class="btn-group-vertical" role="group" aria-label="Vertical radio toggle button group">
                                    <input @click="generateCitation('APA')" type="radio" class="btn-check" name="vbtn-radio" id="vbtn-radio1" autocomplete="off" checked>
                                    <label class="btn btn-outline-primary" for="vbtn-radio1">APA</label>
                                    <input @click="generateCitation('MLA')" type="radio" class="btn-check" name="vbtn-radio" id="vbtn-radio2" autocomplete="off">
                                    <label class="btn btn-outline-primary" for="vbtn-radio2">MLA</label>
                                    <input @click="generateCitation('Harvard')" type="radio" class="btn-check" name="vbtn-radio" id="vbtn-radio3" autocomplete="off">
                                    <label class="btn btn-outline-primary" for="vbtn-radio3">Harvard</label>
                                </div>
                            </div>
                            <div class="col-8">
                                <div class="row">
                                    <div class="mb-3">
                                        <!-- textarea v-model="citation" class="form-control" id="citationTextArea" rows="3"></textarea -->
                                        <p>{{citation}}</p>
                                    </div>
                                </div>
                                <div class="row">
                                    <button class="btn btn-primary" @click="copyCiteToClipboard()">Copy</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
                    <td>{{ tune.tune_name.value }}</td>
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

export default {
    name: 'PatternPage',
    data(){
        return{
            tuneData: [],
            pattern: this.$route.params.pattern,
            melody: "",
            citation: "",
        }
    },
    methods: {
        generateCitation(refStyle){
            let url = new URL(location.href).href;
            let title = "Pattern: '" + this.pattern + "'";
            let kg_version = JSON.parse(sessionStorage.getItem('kg_version'));
            let date = new Date();
            const options = {
                day: "numeric",
                month: "long",
                year: "numeric"
            };
            let currDate = date.toLocaleString('default', options);
            //let mod_date = new Date(document.lastModified);
            //let modDate = mod_date.toLocaleString('default', options);
            let modDate = "2024";

            if(refStyle === "APA"){
                this.citation = "Polifonia Project. ("+modDate+"). " +
                    title + " (" +
                    kg_version + "). " +
                    url;
            } else if (refStyle === "MLA") {
                this.citation = "Polifonia Project. \"" +
                    title + ".\" " +
                    "Polifonia Project, " +
                    kg_version +
                    ", "+modDate+", " +
                    url.replace(/(^\w+:|^)\/\//, '');
            } else if (refStyle === "Harvard") {
                this.citation = "Polifonia Project (2024): " +
                    title + ", " +
                    "Polifonia Project, [online]. " +
                    kg_version + ". " +
                    url +
                    " [accessed " + currDate + "].";
            }
        },
        copyCiteToClipboard(){
            navigator.clipboard.writeText(this.citation);
        },
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
        // On page load, download the list of tunes containing this pattern.
        this.getTunesList(this.pattern);
        this.setupABC();
    }
}
</script>

<style scoped>
.citationWindow{
    max-width: 500px;
}
.stave{
    max-width: 300px;
}
</style>
