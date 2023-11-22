<template>
    <div class="container">
        <div class="row">
            <div class="row">
                <h1>Pattern: {{pattern}}</h1>
            </div>
            <div class="row">
                <div class="col-3">
                    <div id="notation"></div>
                    <div id="audio"></div>
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
import abcjs from "abcjs";
import 'abcjs/abcjs-audio.css';

export default {
    name: 'PatternPage',
    data(){
        return{
            tuneData: [],
            pattern: this.$route.params.pattern,
            melody: 'X:1\n' +
                'T:Test\n' +
                'M:C\n' +
                'K:C\n' +
                'A B c d AB cd]',
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
                'T:Blah\n' +
                'M:C\n' +
                'K:C\n';

            let pattern_list = this.pattern.split('_');
            for(let n in pattern_list){
                abc_string += diatonic_dict[(pattern_list[n] - 1)%7] + " ";
            }
            abc_string += "]"
            this.melody = abc_string;
        },
        setupABC() {
            if (abcjs.synth.supportsAudio()) {
                this.createABC();
                var visualObj = abcjs.renderAbc('notation', this.melody)[0];
                var synthControl = new abcjs.synth.SynthController();
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
