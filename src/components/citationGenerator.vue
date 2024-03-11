<template>
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
                            <input @click="generateCitation('Bibtex')" type="radio" class="btn-check" name="vbtn-radio" id="vbtn-radio4" autocomplete="off">
                            <label class="btn btn-outline-primary" for="vbtn-radio4">Bibtex</label>
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
</template>

<script>
export default {
    name: "citationGenerator",
    props: ['pageTitle'],
    data() {
        return {
            citation: "",
        }
    },
    methods: {
        generateCitation(refStyle){
            let url = new URL(location.href).href;
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
                    "Patterns UI: " + this.pageTitle + " (" +
                    kg_version + "). " +
                    url;
            } else if (refStyle === "MLA") {
                this.citation = "Polifonia Project. \"" +
                    "Patterns UI: " + this.pageTitle + ".\" " +
                    "Polifonia Project, " +
                    kg_version +
                    ", "+modDate+", " +
                    url.replace(/(^\w+:|^)\/\//, '');
            } else if (refStyle === "Harvard") {
                this.citation = "Polifonia Project (2024): " +
                    "Patterns UI: " + this.pageTitle + ", " +
                    "Polifonia Project, [online]. " +
                    kg_version + ". " +
                    url +
                    " [accessed " + currDate + "].";
            } else if (refStyle === "Bibtex") {
                this.citation = "@online{patternsUI,\n" +
                    "  author = {Polifonia Project},\n" +
                    "  title = {Patterns UI: " + this.pageTitle + " },\n" +
                    "  year = 2024,\n" +
                    "  url = {" + url + "},\n" +
                    "  note = {Accessed: " + currDate + "}\n" +
                    "}";
            }
        },
        copyCiteToClipboard(){
            navigator.clipboard.writeText(this.citation);
        },
    }
}
</script>

<style scoped>
.citationWindow{
    max-width: 500px !important;
}
</style>
