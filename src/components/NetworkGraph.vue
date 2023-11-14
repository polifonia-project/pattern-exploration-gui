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
            nodesData: [],
            linksData: [],
        }
    },
    methods: {
        vis() {
            // Reference to NetworkGraph.vue component context.
            let ng=this;
            // Okabe and Ito colourblindness-safe colour palette.
            let colours = {
                black: "#000000",
                orange: "#E69F00",
                sky_blue: "#56B4E9",
                bluish_green: "#009E73",
                yellow: "#F0E442",
                blue: "#0072B2",
                vermilion: "#D55E00",
                reddish_purple: "#CC79A7"
            }
            // create somewhere to put the force directed graph
            let svg = d3.select('svg')
            let width = +svg.attr('width')
            let height = +svg.attr('height')

            // The force simulation mutates links and nodes, so create a copy
            // so that re-evaluating this cell produces the same result.
            let nodesData = this.nodesData.map(d => ({...d}));
            let linksData = this.linksData.map(d => ({...d}));

            let linkForce = d3.forceLink(linksData)
                .id(d => d.id)
            let chargeForce = d3.forceManyBody()
                .strength(-100)
            let centerForce = d3.forceCenter(width / 2, height / 2)

            // set up the simulation and add forces
            let simulation = d3.forceSimulation()
                .nodes(nodesData)
                .force('chargeForce', chargeForce)
                .force('centerForce', centerForce)
                .force('links', linkForce)
                .on('tick', tickActions)

            // add encompassing group for the zoom
            let g = svg.append('g')
                .attr('class', 'everything')

            // draw lines for the links
            let link = g.append('g')
                .attr('class', 'links')
                .selectAll('line')
                .data(linksData)
                .join('line')
                .attr('stroke-width', 2)
                .style('stroke', linkColour)

            // draw circles for the nodes
            let node = g.append('g')
                .attr('class', 'nodes')
                .selectAll('circle')
                .data(nodesData)
                .join('circle')
                .attr('r', nodeRadius)
                .attr('fill', circleColour)
                .on("click", mouseClick)
                /*
                .on('mouseover',function() {
                    d3.select(this)
                        .transition()
                        .duration(500)
                        .attr('r',20);
                })
                .on('mouseout',function () {
                    d3.select(this)
                        .transition()
                        .duration(500)
                        .attr('r',15);
                })
                 */

            // add title
            node.append('title')
                .text((d) => d.name)

            // add drag capabilities
            let dragHandler = d3.drag()
                .on('start', dragStart)
                .on('drag', dragDrag)
                .on('end', dragEnd)

            dragHandler(node)

            function mouseClick(event) {
                let d = event.target.__data__;
                ng.addNode(d.id);
            }

            // add zoom capabilities
            let zoomHandler = d3.zoom()
                .on('zoom', zoomActions)

            zoomHandler(svg)

            /** Functions **/

            function nodeRadius(d){
                if (d.type === 'tune') {
                    return 15;
                } else {
                    return 10;
                }
            }

            // Function to choose what color circle we have
            function circleColour (d) {
                if (d.type === 'tune') {
                    return colours.bluish_green;
                } else {
                    return colours.reddish_purple;
                }
            }

            // Function to choose the line colour and thickness
            function linkColour (d) {
                if(d.target === "1_1_1_1") {
                    return 'red';
                } else {
                    return 'green'
                }
            }

            // Drag functions
            // d is the node
            function dragStart (event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart()
                d.fx = d.x
                d.fy = d.y
            }

            // make sure you can't drag the circle outside the box
            function dragDrag (event, d) {
                d.fx = event.x
                d.fy = event.y
            }

            function dragEnd (event, d) {
                if (!event.active) simulation.alphaTarget(0)
                d.fx = null
                d.fy = null
            }

            // Zoom functions
            function zoomActions (event) {
                g.attr('transform', event.transform)
            }

            function tickActions () {
                // update circle positions each tick of the simulation
                node
                    .attr('cx', function (d) { return d.x })
                    .attr('cy', function (d) { return d.y })

                // update link positions
                link
                    .attr('x1', function (d) { return d.source.x })
                    .attr('y1', function (d) { return d.source.y })
                    .attr('x2', function (d) { return d.target.x })
                    .attr('y2', function (d) { return d.target.y })
            }
        },
        addNode(id){
            d3.selectAll('.links')
                .remove()
            d3.selectAll('.nodes')
                .remove()

            if(this.nodesData.find(x => x.id === id).type === "tune"){
                this.getNeighbourPtnData(id, this.exclude_trivial_patterns)
            }
            else if (this.nodesData.find(x => x.id === id).type === "pattern"){
                this.getNeighbourTuneData(id)
            } else {
                //error
                console.error("Invalid node type.")
            }
        },
        getNeighbourTuneData(ptn){
            let params = {
                id: ptn
            };
            axios.get(process.env.VUE_APP_SERVER_URL + '/api/neighbour_tunes', { params })
                .then(response => {
                    let temp = response.data.results.bindings;
                    for (let t in temp){
                        let flag = false;
                        for(let n in this.nodesData){
                            if (this.nodesData[n].id === temp[t].id.value) {
                                flag = true;
                            }
                        }

                        if(!flag) {
                            this.nodesData.push({'id': temp[t].id.value, 'name': temp[t].title.value, type: "tune"});
                        }
                    }
                    this.getPtnTuneLinks(ptn, temp);
                })
                .then(() => {
                    //FIXME: replace the visualisation data
                    this.vis();
                })
                .catch(error => {
                    console.error(error);
                });
        },
        getNeighbourPtnData(id, loc_xtp){
            let params = {
                id: id,
                excludeTrivialPatterns: loc_xtp,
            };
            axios.get(process.env.VUE_APP_SERVER_URL + '/api/neighbour_patterns', { params })
                .then(response => {
                    let temp = response.data.results.bindings;
                    for (let p in temp) {
                        let flag = false;
                        for(let n in this.nodesData){
                            if (this.nodesData[n].id == temp[p].pattern.value.split("/").pop()) {
                                flag = true;
                            }
                        }

                        if(!flag) {
                            this.nodesData.push({'id': temp[p].pattern.value.split("/").pop(), 'name': temp[p].pattern.value.split("/").pop(), type: "pattern" });
                        }
                    }
                    this.getTunePtnLinks(id, temp);
                })
                .then(() => {
                    //FIXME: replace the visualisation data
                    this.vis();
                })
                .catch(error => {
                    console.error(error);
                });
        },
        getTunePtnLinks(id, nodes){
            for(let p in nodes){
                this.linksData.push({ 'source': id, 'target': nodes[p].pattern.value.split("/").pop()});
                //this.linksData.push({ 'source': this.nodesData.find(x => x.id === id), 'target': this.nodesData.find(x => x.id === nodes[p].pattern.value.split("/").pop())});
            }
        },
        getPtnTuneLinks(ptn, nodes){
            for(let t in nodes){
                this.linksData.push({ 'source': ptn, 'target': nodes[t].id.value});
            }
        },
    },
    mounted () {
        this.nodesData.push({'id': this.id, 'name': this.tuneData[0].title.value, type: "tune" });

        //On page load, download the neighbouring pattern nodes data
        this.getNeighbourPtnData(this.id, this.exclude_trivial_patterns);
    },
}
</script>