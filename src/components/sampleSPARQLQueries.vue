<template>
    <div class="container">
        <div class="row">
            <h1>Sample SPARQL Queries</h1>
            <p>
                The following query samples are for the purposes of demonstration and are not representative of the SPARQL queries used in the backend to this interface.
                The actual queries used can be found in the file 'query_factory.py' in the <a href="https://github.com/polifonia-project/pattern-explorations-backend">backend source code</a>.
                The tune ID values presented in Patterns UI are shortened versions of those used in the TUNES knowledge graph and will not work in SPARQL queries.
            </p>
            <p>The FONN SPARQL endpoint is available via web and API at <a href="https://polifonia.disi.unibo.it/fonn/sparql">https://polifonia.disi.unibo.it/fonn/sparql</a>.</p>
        </div>
        <div class="row my-5">
            <div class="col-12">
                <h3 class="py-2 my-2">Search for a Tune Title (Non-Fuzzy Search)</h3>
                <div class="highlight">
                    <pre>
                        <code class="language-sparql">
PREFIX jams:&lt;http://w3id.org/polifonia/ontology/jams/&gt;
PREFIX mm:&lt;http://w3id.org/polifonia/ontology/music-meta/&gt;
PREFIX core:&lt;http://w3id.org/polifonia/ontology/core/&gt;
PREFIX rdf:&lt;http://www.w3.org/1999/02/22-rdf-syntax-ns#&gt;
SELECT ?title ?tuneType ?key ?signature ?id
WHERE {
    ?tune rdf:type mm:MusicEntity.
    ?tune core:title ?title.
    VALUES (?title) { ( "Drowsy Maggie" ) }
    ?tune core:id ?id.
    OPTIONAL {?tune mm:hasFormType ?tuneTypeURI.
    ?tuneTypeURI core:name ?tuneType.}
    OPTIONAL {?tune mm:hasKey ?keyURI.
    ?keyURI mm:tuneKeyName ?key.}
    OPTIONAL {?tune jams:timeSignature ?signatureURI.
    ?signatureURI mm:timesig ?signature.}
} ORDER BY ?title ?id
                        </code>
                    </pre>
                </div>
            </div>
        </div>
        <div class="row my-5">
            <div class="col-12">
                <h3 class="py-2 my-2">Search for a Pattern</h3>
                <div>
                    <pre>
                        <code class="language-sparql">
PREFIX jams:&lt;http://w3id.org/polifonia/ontology/jams/&gt;
PREFIX mm:&lt;http://w3id.org/polifonia/ontology/music-meta/&gt;
PREFIX core:&lt;http://w3id.org/polifonia/ontology/core/&gt;
PREFIX xyz:&lt;http://sparql.xyz/facade-x/data/&gt;
PREFIX rdf:&lt;http://www.w3.org/1999/02/22-rdf-syntax-ns#&gt;
SELECT DISTINCT ?title ?tuneType ?key ?signature ?id
WHERE
{
    ?obs jams:ofPattern ?patternURI.
    ?patternURI xyz:pattern_content "1, 1, 1, 1".
    ?annotation jams:includesObservation ?obs.
    ?annotation jams:isJAMSAnnotationOf ?tune.
    ?tune rdf:type mm:MusicEntity.
    ?tune core:id ?id.
    OPTIONAL {?tune core:title ?title}
    OPTIONAL {?tune mm:hasFormType ?tuneTypeURI.
       ?tuneTypeURI core:name ?tuneType.}
    OPTIONAL {?tune mm:hasKey ?keyURI.
       ?keyURI mm:tuneKeyName ?key.}
    OPTIONAL {?tune jams:timeSignature ?signatureURI.
       ?signatureURI mm:timesig ?signature.}
} ORDER BY ?title ?id
                        </code>
                    </pre>
                </div>
            </div>
        </div>
        <div class="row my-5">
            <div class="col-12">
                <h3 class="py-2 my-2">Find the Ten Most Frequent Patterns within a Tune</h3>
                <div>
                    <pre>
                        <code class="language-sparql">
PREFIX jams:&lt;http://w3id.org/polifonia/ontology/jams/&gt;
PREFIX core:&lt;http://w3id.org/polifonia/ontology/core/&gt;
PREFIX xyz:&lt;http://sparql.xyz/facade-x/data/&gt;
PREFIX rdf:&lt;http://www.w3.org/1999/02/22-rdf-syntax-ns#&gt;
PREFIX mm:&lt;http://w3id.org/polifonia/ontology/music-meta/&gt;

SELECT ?pattern (count(?pattern) as ?patternFreq)
WHERE {
    ?tune rdf:type mm:MusicEntity.
    ?tune core:id "thesession20211212/MusicEntity/12406".
    ?annotation jams:isJAMSAnnotationOf ?tune.
    ?annotation jams:includesObservation ?observation.
    ?observation jams:ofPattern ?patternURI.
    ?patternURI xyz:pattern_content ?pattern.
} GROUP BY ?pattern
ORDER BY DESC (?patternFreq) ?pattern LIMIT 10
                        </code>
                    </pre>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Prism from 'prismjs'
import 'prismjs/components/prism-turtle'
import 'prismjs/components/prism-sparql.min'
import 'prismjs/themes/prism.css'

export default {
    name: "sampleSPARQLQueries",
    mounted() {
        Prism.highlightAll();
    }
}
</script>
