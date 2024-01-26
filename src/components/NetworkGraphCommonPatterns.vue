<template>
    <svg id="svg2" width="100%" height="auto" style="border:1px solid black" viewBox="0 0 1000 700" class="container-border col-lg-12"></svg>
</template>

<script>
import * as d3 from 'd3';
import axios from "axios";

export default {
    name: 'NetworkGraphCommonPatterns',
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
            colours: {
                black: "#000000",
                orange: "#E69F00",
                sky_blue: "#56B4E9",
                bluish_green: "#009E73",
                yellow: "#F0E442",
                blue: "#0072B2",
                vermilion: "#D55E00",
                reddish_purple: "#CC79A7"
            },
            tune_radius: 24,
            pattern_radius: 16,
            label_spacing: 6,
            label_size: "15px",
            clickedNodes: [],
            numNodesAdded: [],
            numLinksAdded: [],
        }
    },
    methods: {
        init(){
            // Reference to NetworkGraph.vue component context.
            let ng=this;

            this.svg = d3.select('#svg2');
            this.width = 1000;
            this.height = 700;
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

            //Back button
            let backButton = this.svg.append('g')

            backButton.append('path')
                .attr('d', 'M23.94624 27.25376a1.28 1.28 0 0 1-1.81312 1.81312l-7.68-7.68a1.28 1.28 0 0 1 0-1.81312l7.68-7.68a1.28 1.28 0 1 1 1.81312 1.81312L17.16992 20.48l6.77632 6.77376zM20.48 40.96A20.48 20.48 0 1 1 20.48 0a20.48 20.48 0 0 1 0 40.96zm0-2.56a17.92 17.92 0 1 0 0-35.84 17.92 17.92 0 0 0 0 35.84z')
                .attr('fill', 'black');
            backButton.append('circle')
                .attr("r", '20.48')
                .attr('cx', '20.48')
                .attr('cy', '20.48')
                .attr('fill-opacity', '0');
            //.attr('fill', 'red')

            backButton.on("click", undo);

            function undo() {
                if(ng.clickedNodes.length > 0){
                    //Remove last added nodes from visualisation.
                    let n = ng.numNodesAdded.pop();
                    while(n--) ng.graphData.nodes.pop();

                    //Remove links.
                    n = ng.numLinksAdded.pop();
                    while(n--) ng.graphData.links.pop();

                    //Decrement clicked counter for lastClicked node.
                    let i = ng.clickedNodes.pop();
                    ng.graphData.nodes.find(a => a.id === i).clicks--;

                    //update simulation.
                    ng.update();
                }
            }

            // Reset button.
            let resetButton = this.svg.append('g')
                .attr('transform', 'scale(0.04) translate(0, 1044)');

            resetButton.append('path')
                //.attr('transform', 'scale(0.85) translate(153.6, 153.6)')
                .attr('d', 'M146.358 714 C219.143 847.474 360.001 934 517 934 c212.963 0 391.858 -158.66 418.579 -367.974 c3.077 -24.104 25.112 -41.15 49.217 -38.074 c24.105 3.078 41.152 25.113 38.074 49.218 C990.558 830.286 774.393 1022 517 1022 c-173.766 0 -331.173 -87.715 -424 -226.4 V911 c0 24.3 -19.7 44 -44 44 S5 935.3 5 911 V670 c0 -24.3 19.7 -44 44 -44 h241 c24.3 0 44 19.7 44 44 s-19.7 44 -44 44 H146.358z m736.284 -404 C809.857 176.526 668.999 90 512 90 C299.037 90 120.142 248.66 93.421 457.974 c-3.077 24.104 -25.112 41.15 -49.217 38.074 C20.099 492.97 3.052 470.935 6.13 446.83 C38.442 193.714 254.607 2 512 2 c173.766 0 331.173 87.715 424 226.4 V113 c0 -24.3 19.7 -44 44 -44 s44 19.7 44 44 v241 c0 24.3 -19.7 44 -44 44 H739 c-24.3 0 -44 -19.7 -44 -44 s19.7 -44 44 -44 h143.642z')
                .attr('fill', 'black');
            resetButton.append('circle')
                .attr("r", '512')
                .attr('cx', '512')
                .attr('cy', '512')
                .attr('fill-opacity', '0')
                .attr('fill', 'red');

            resetButton.on("click", reset);

            function reset() {
                // Clear all nodes and links.
                ng.graphData.nodes = [];
                ng.graphData.links = [];

                //CLear undo feature arrays.
                ng.numNodesAdded = [];
                ng.numLinksAdded = [];
                ng.clickedNodes = [];

                // Add initial nodes.
                ng.addFirstNode();

                //update simulation.
                ng.update();
            }
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
                .attr('stroke-width', 3)
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
                    if(clickedNode.moreNeighbours){
                        ng.addNode(clickedNode, this);
                        clickedNode.clicks++;
                    } else {
                        ng.noNeighboursFeedback(this);
                    }
                }, 100);
            }

            function dblclicked(event, clickedNode) {
                clearTimeout(timeout);

                if(clickedNode.type === "tune"){
                    ng.$router.push({ name: 'CompositionPage', params: { id: clickedNode.id, prev: ng.id}});
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
        noNeighboursFeedback(node){
            d3.select(node)
                .attr('stroke',"red")
            d3.select(node)
                .transition()
                .duration(500)
                .attr('stroke',"black")
        },
        labelLocation(d){
            // Function to determine placement of label above a node.
            if (d.type === 'tune') {
                return d.y - this.tune_radius - this.label_spacing;
            } else {
                return d.y - this.pattern_radius - this.label_spacing;
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
        addNode(clickedNode, nodeContext){
            let params = {
                id: clickedNode.id,
                click_num: clickedNode.clicks
            };
            let endpoint = '/api/neighbour_tunes_by_common_patterns';

            axios.get(process.env.VUE_APP_SERVER_URL + endpoint, { params })
                .then(response => {
                    let neighbours = response.data.results.bindings;
                    let num = neighbours.length;
                    let node_is_new = [];
                    let num_new = num;
                    let neighboursId;

                    for (let t in neighbours) {
                        node_is_new[t] = true;
                        neighboursId = neighbours[t].id.value;
                        for (let n in this.graphData.nodes) {
                            if (this.graphData.nodes[n].id === neighboursId) {
                                node_is_new[t] = false;
                                num_new--;
                            }
                        }
                    }

                    if (num === 0 || (num === 1 && node_is_new[0] === false)) {
                        clickedNode.moreNeighbours = false;
                        this.noNeighboursFeedback(nodeContext);
                        return;
                    }

                    // Add elements to arrays for undo feature.
                    this.clickedNodes.push(clickedNode.id);
                    this.numNodesAdded.push(num_new);

                    for (let t in neighbours){
                        if(node_is_new[t]) {
                            let family;
                            if ("family" in neighbours[t] && neighbours[t].family.value){
                                family = neighbours[t].family.value.replaceAll("_"," ");
                            } else {
                                family = "Unknown";
                            }

                            let newNode = {
                                id: neighbours[t].id.value,
                                name: neighbours[t].title.value.replace(/^(.*?)(?:, The)$/, "The $1") + " (" + neighbours[t].id.value + ")",
                                family: family,
                                colour: this.selectColour(family),
                                type: "tune",
                                moreNeighbours: true,
                                clicks: 0,
                                x: clickedNode.x + 10.0 * Math.cos(t/num_new * 2.0 * Math.PI),
                                y: clickedNode.y + 10.0 * Math.sin(t/num_new * 2.0 * Math.PI),
                            }

                            this.graphData.nodes.push(newNode);
                        }
                    }
                    this.getLinks(clickedNode, neighbours);
                    this.update();
                })
                .catch(error => {
                    console.error(error);
                });
        },
        getLinks(clicked, nodes){
            let counter = 0;

            for(let n in nodes){
                let tgt = nodes[n].id.value;
                let newLinkId = [clicked.id, tgt].sort().join("");

                // Check if link already exists
                let new_link = true;
                for(let l in this.graphData.links){
                    if (this.graphData.links[l].id === newLinkId) {
                        new_link = false;
                    }
                }

                if(new_link) {
                    this.graphData.links.push({ 'source': clicked.id, 'target': tgt, 'id': newLinkId});
                    counter++;
                }
            }

            // Add element to array for undo feature.
            this.numLinksAdded.push(counter);
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
        },
        addFirstNode(){
            let family;
            if ("tuneFamily" in this.tuneData[0] && this.tuneData[0].tuneFamily.value){
                family = this.tuneData[0].tuneFamily.value.replaceAll("_"," ");
            } else {
                family = "Unknown";
            }

            let colour = this.selectColour(family);

            let FirstNode = {
                id: this.id,
                name: this.tuneData[0].title.value.replace(/^(.*?)(?:, The)$/, "The $1") + " (" + this.id + ")",
                family: family,
                colour: colour,
                type: "tune",
                moreNeighbours: true,
                clicks: 0
            };

            this.graphData.nodes.push(FirstNode);

            //On page load, download the neighbouring pattern nodes data
            this.addNode(FirstNode, this);
        }
    },
    mounted () {
        this.init();
        this.addFirstNode();
    },
    watch: {
        //FIXME: What navigating to the pattern page, this watch triggers unnecessary function calls.
        $route(){
            this.$emit('changeComposition')
        }
    }
}
</script>
