<template>
    <div class="container">
        <div class="row" style="text-align: center">
            <h1>About</h1>
        </div>
        <div class="row my-5" style="text-align: center">
            <div class="col-12">
                <h3 class="py-2 my-2">Patterns UI</h3>
                <p>
                    The Patterns User Interface is a tool designed to allow exploration of European Traditional Music through a selection of search types,
                    interactive network visualisations, tables and audio. A chosen subset of tunes can be identified using the search functions,
                    the results of which link to a composition page dedicated to that tune. The composition page shows information about the selected tune
                    as well as presenting a network visualisation through which related tunes can be found. More information about patterns of tune families
                    can be obtained through clicking to navigate to that items dedicated page.
                </p>
                <p>
                    Patterns UI and the Patterns UI Backend are open source projects licenced under the GNU General Public Licence version 3.
                    The source code for each are available in the following Github repositories:
                    <ul style="list-style-type:none;">
                        <li><a href="https://github.com/polifonia-project/pattern-exploration-gui">Patterns UI</a></li>
                        <li><a href="https://github.com/polifonia-project/pattern-explorations-backend">Patterns UI Backend</a></li>
                    </ul>
                </p>
            </div>
        </div>
        <div class="row my-5" style="text-align: center">
            <div class="col-12">
                <h3 class="py-2 my-2">The Polifonia Project</h3>
                <p>Polifonia is a €3M project funded by the EU Horizon 2020 Programme conducted between January 2021
                    and April 2024 to recreate the connections between music, people, places and events from the sixteenth century to the modern day.
                    These findings are be available to everyone as an interconnected
                    global database on the web – a knowledge graph – and will enhance our understanding of European
                    musical heritage.
                    The Polifonia consortium is an interdisciplinary team of passionate researchers and music lovers:
                    computer scientists, anthropologists and ethnomusicologists, historians of music, linguists, musical
                    heritage archivists, cataloguers and administrators, and creative professionals.</p>
            </div>
        </div>
        <!-- div class="row my-5" style="text-align: center">
            <div class="col-12">
                <h3 class="py-2 my-2">Playing the soundtrack of our history</h3>
                <p>From the soundscape of Italian historical bells, to the influence of French operas on traditional Dutch music, European cultural heritage hides a goldmine of unknown encounters, influences and practices that can transport us to experience the past, understand the music we love, and imagine the soundtrack of our future. Polifonia will organise this journey by using ten pilot use cases as drivers, addressing preservation, management, study, and interaction with musical heritage.</p>
            </div>
        </div -->
        <div class="row my-5" style="text-align: center">
            <div class="col-12">
                <h3 class="py-2 my-2">SPARQL Endpoint and Sample Queries</h3>
                <p>The Patterns User Interface uses the FONN patterns knowledge graph as well as portions of the TUNES music knowledge graph as a source of data. This database is available at the following endpoint: </p>
                <p><a href="https://polifonia.disi.unibo.it/fonn/sparql">https://polifonia.disi.unibo.it/fonn/sparql</a></p>
                <p>Some example SPARQL queries are available <router-link to="/queries">here</router-link>.</p>
            </div>
        </div>
        <div class="row my-7 py-5" style="text-align: center">
            <div class="col-6">
                <img width="300px" src="@/assets/eu.jpg">
            </div>
            <div class="col-6 eu">
                <p>This project has received funding from the European Union’s Horizon 2020 research and innovation programme under grant agreement N. 101004746</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "AboutPage"
}
</script>

<style scoped>
.eu{
    display: grid;
    align-items: center;
}
</style>