<template>
    <svg id="svg" width="1000" height="700" class="container-border"></svg>
</template>

<script>
import * as d3 from 'd3';
import axios from "axios";

export default {
    name: 'NetworkGraph',
    props: ['id', 'tuneData', 'exclude_trivial_patterns'],
    data(){
        return {
            graphData: {
                "nodes": [],
                "links": []
            },
            svg: undefined,
            width: undefined,
            height: undefined,
            simulation: undefined,
            link: undefined,
            node: undefined,
            label: undefined,
            colours: {},
            g: undefined,
            colourDict: {},
            currentColour: -1,
            colourList: {
                0: "orange",
                1: "sky_blue",
                2: "bluish_green",
                3: "yellow",
                4: "blue",
                5: "vermilion",
                6: "reddish_purple"
            },
            tune_radius: 24,
            pattern_radius: 16,
            label_spacing: 6,
            label_size: "15px",
        }
    },
    methods: {
        init(){
            this.svg = d3.select('svg');
            this.width = +this.svg.attr('width');
            this.height = +this.svg.attr('height');
            this.simulation = d3.forceSimulation()
                .force("link", d3.forceLink().id(d => d.id).distance(160).strength(1))
                .force("charge", d3.forceManyBody().strength(-300))
                .force("center", d3.forceCenter(this.width / 2, this.height / 2))
                .force("collision", d3.forceCollide().radius(60));

            // add encompassing group for the zoom
            this.g = this.svg.append('g')
                .attr('class', 'everything');

            this.link = this.g.append("g").selectAll(".link");
            this.node = this.g.append("g").selectAll(".node");
            this.label = this.g.append("g").selectAll(".label");

            this.colours = {
                black: "#000000",
                orange: "#E69F00",
                sky_blue: "#56B4E9",
                bluish_green: "#009E73",
                yellow: "#F0E442",
                blue: "#0072B2",
                vermilion: "#D55E00",
                reddish_purple: "#CC79A7"
            };
        },
        update() {
            // Reference to NetworkGraph.vue component context.
            let ng=this;

            this.link = this.link.data(this.graphData.links, d => d.id);
            this.link.exit().remove();
            const linkEnter = this.link.enter()
                .append("line")
                .attr("class", "link")
                .attr('stroke-width', 4)
                .style('stroke', "#9b9b9b");

            this.link = linkEnter.merge(this.link);

            this.node = this.node.data(this.graphData.nodes);
            this.node.exit().remove();
            const nodeEnter = this.node.enter()
                .append("circle")
                .attr("class", "node")
                .attr("r", nodeRadius)
                .attr('fill', d => d.colour)
                .call(this.drag(this.simulation));

            this.node = nodeEnter.merge(this.node);

            // add title
            this.node.append('title')
                .text((d) => d.family)

            this.label = this.label.data(this.graphData.nodes);
            this.label.exit().remove();
            const labelEnter = this.label.enter()
                .append("text")
                .text(d => d.name)
                .attr("class", "label")
                .attr("x", d => d.x)
                .attr("y", this.labelLocation)
                .style("text-anchor", "middle")
                .style("fill", this.colours.black)
                .style("font-family", "Arial")
                .style("font-size", this.label_size)
                .style("pointer-events", "none");

            this.label = labelEnter.merge(this.label);

            this.simulation.nodes(this.graphData.nodes).on("tick", this.tick);
            this.simulation.force("link").links(this.graphData.links);
            this.simulation.alpha(0.1).restart();

            this.node.on("click", clicked);
            this.node.on("dblclick", dblclicked);

            // add zoom capabilities
            let zoomHandler = d3.zoom()
                .on('zoom', zoomActions);

            zoomHandler(this.svg)

            // Zoom functions
            function zoomActions (event) {
                ng.g.attr('transform', event.transform)
            }

            this.svg.on("dblclick.zoom", null);

            let timeout = null;

            function clicked(event, clickedNode) {
                clearTimeout(timeout);
                timeout = setTimeout(()=>{
                    if(!clickedNode.clicked){
                        clickedNode.clicked = true;
                        ng.addNode(clickedNode);
                    }
                }, 100);
            }

            function dblclicked(event, clickedNode) {
                clearTimeout(timeout);

                if(clickedNode.type === "tune"){
                    ng.$router.push({ name: 'CompositionPage', params: { id: clickedNode.id}});
                    console.log(clickedNode.id);
                } else if (clickedNode.type === "pattern") {
                    ng.$router.push({ name: 'PatternPage', params: { pattern: clickedNode.id}});
                } else {
                    //error
                    console.error("Invalid node type.")
                }
            }

            // Function to determine node radius.
            function nodeRadius(d){
                if (d.type === 'tune') {
                    return ng.tune_radius;
                } else {
                    return ng.pattern_radius;
                }
            }
        },
        labelLocation(d){
            // Function to determine placement of label above a node.
            if (d.type === 'tune') {
                return d.y - this.tune_radius - this.label_spacing;
            } else {
                return  d.y - this.pattern_radius - this.label_spacing;
            }
        },
        tick() {
            this.link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            this.node.attr("cx", d => d.x)
                .attr("cy", d => d.y);

            this.label.attr("x", d => d.x) // Update x position based on node's x position
                .attr("y", this.labelLocation); // Update y position to maintain a fixed offset from the node
        },
        drag(simulation) {
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }

            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        },
        addNode(clickedNode){
            if(this.graphData.nodes.find(x => x.id === clickedNode.id).type === "tune"){
                this.getNeighbourPtnData(clickedNode, this.exclude_trivial_patterns)
            }
            else if (this.graphData.nodes.find(x => x.id === clickedNode.id).type === "pattern"){
                this.getNeighbourTuneData(clickedNode)
            } else {
                //error
                console.error("Invalid node type.")
            }
        },
        getNeighbourTuneData(clickedNode){
            let params = {
                id: clickedNode.id
            };
            axios.get(process.env.VUE_APP_SERVER_URL + '/api/neighbour_tunes', { params })
                .then(response => {
                    let temp = response.data.results.bindings;
                    let num = temp.length;
                    for (let t in temp){
                        let flag = false;
                        for(let n in this.graphData.nodes){
                            if (this.graphData.nodes[n].id === temp[t].id.value) {
                                flag = true;
                            }
                        }

                        if(!flag) {
                            let colour = this.selectColour(temp[t].family.value);

                            const newNode = {
                                id: temp[t].id.value,
                                name: temp[t].title.value,
                                family: temp[t].family.value.split("/").pop(),
                                colour: colour,
                                type: "tune",
                                clicked: false,
                                x: clickedNode.x + 10.0 * Math.cos(t/(num-1) * 2.0 * Math.PI),
                                y: clickedNode.y + 10.0 * Math.sin(t/(num-1) * 2.0 * Math.PI),
                            }

                            this.graphData.nodes.push(newNode);
                        }
                    }
                    this.getLinks(clickedNode, temp);
                    this.update();
                })
                .catch(error => {
                    console.error(error);
                });
        },
        getNeighbourPtnData(clickedNode, loc_xtp){
            let params = {
                id: clickedNode.id,
                excludeTrivialPatterns: loc_xtp,
            };
            axios.get(process.env.VUE_APP_SERVER_URL + '/api/neighbour_patterns', { params })
                .then(response => {
                    let temp = response.data.results.bindings;
                    let num = temp.length;

                    for (let p in temp) {
                        let flag = false;
                        for(let n in this.graphData.nodes){
                            if (this.graphData.nodes[n].id === temp[p].pattern.value.split("/").pop()) {
                                flag = true;
                            }
                        }

                        if(!flag) {
                            const newNode = {
                                id: temp[p].pattern.value.split("/").pop(),
                                name: temp[p].pattern.value.split("/").pop(),
                                family: temp[p].pattern.value.split("/").pop(),
                                colour: this.colours.black,
                                type: "pattern",
                                clicked: false,
                                x: clickedNode.x + 10.0 * Math.cos(p/(num-1) * 2.0 * Math.PI),
                                y: clickedNode.y + 10.0 * Math.sin(p/(num-1) * 2.0 * Math.PI),
                            }

                            this.graphData.nodes.push(newNode);
                        }
                    }
                    this.getLinks(clickedNode, temp);
                    this.update();
                })
                .catch(error => {
                    console.error(error);
                });
        },
        getLinks(clicked, nodes){
            for(let n in nodes){
                let tgt;
                if(clicked.type === "pattern"){
                    tgt = nodes[n].id.value;
                } else {
                    tgt = nodes[n].pattern.value.split("/").pop();
                }

                let newLinkId = [clicked.id, tgt].sort().join("");

                // Check if link already exists
                let flag = false;
                for(let l in this.graphData.links){
                    if (this.graphData.links[l].id === newLinkId) {
                        flag = true;
                    }
                }

                if(!flag) {
                    this.graphData.links.push({ 'source': clicked.id, 'target': tgt, 'id': newLinkId});
                }
            }
        },
        selectColour(family){
            let nodeColour;
            if(family in this.colourDict){
                nodeColour = this.colourDict[family];
            } else {
                this.currentColour = (this.currentColour + 1)%7;
                nodeColour = this.colours[this.colourList[this.currentColour]];
                this.colourDict[family] = nodeColour;
            }
            return nodeColour;
        }
    },
    mounted () {
        this.init();

        let colour = this.selectColour(this.tuneData[0].tuneFamily.value);

        let FirstNode = {
            id: this.id,
            name: this.tuneData[0].title.value,
            family: this.tuneData[0].tuneFamily.value.split("/").pop(),
            colour: colour,
            type: "tune",
            clicked: false
        };

        this.graphData.nodes.push(FirstNode);

        //On page load, download the neighbouring pattern nodes data
        this.getNeighbourPtnData(FirstNode, this.exclude_trivial_patterns);
    },
    watch: {
        $route(){
            this.$emit('changeComposition')
        }
    }
}
</script>

