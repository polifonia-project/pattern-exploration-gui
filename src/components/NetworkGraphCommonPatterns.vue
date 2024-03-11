<template>
    <svg id="svg2" width="100%" height="100%" style="border:1px solid black; background-color:white" viewBox="0 0 1000 700" class="container-border col-lg-12">
        <defs>
            <radialGradient id="black" filterUnits="objectBoundingBox" cx="40%" cy="40%" r="50%" fx="40%" fy="40%" fr="0%">
                <stop offset="0%" stop-color="#cccccc" />
                <stop offset="100%" stop-color="#000000" />
            </radialGradient>
            <radialGradient id="orange" filterUnits="objectBoundingBox" cx="40%" cy="40%" r="50%" fx="40%" fy="40%" fr="0%">
                <stop offset="0%" stop-color="#ffeec7" />
                <stop offset="100%" stop-color="#E69F00" />
            </radialGradient>
            <radialGradient id="sky_blue" filterUnits="objectBoundingBox" cx="40%" cy="40%" r="50%" fx="40%" fy="40%" fr="0%">
                <stop offset="0%" stop-color="#ddf0fb" />
                <stop offset="100%" stop-color="#56B4E9" />
            </radialGradient>
            <radialGradient id="bluish_green" filterUnits="objectBoundingBox" cx="40%" cy="40%" r="50%" fx="40%" fy="40%" fr="0%">
                <stop offset="0%" stop-color="#b9ffec" />
                <stop offset="100%" stop-color="#009E73" />
            </radialGradient>
            <radialGradient id="yellow" filterUnits="objectBoundingBox" cx="40%" cy="40%" r="50%" fx="40%" fy="40%" fr="0%">
                <stop offset="0%" stop-color="#fcfad9" />
                <stop offset="100%" stop-color="#F0E442" />
            </radialGradient>
            <radialGradient id="blue" filterUnits="objectBoundingBox" cx="40%" cy="40%" r="50%" fx="40%" fy="40%" fr="0%">
                <stop offset="0%" stop-color="#bde7ff" />
                <stop offset="100%" stop-color="#0072B2" />
            </radialGradient>
            <radialGradient id="vermilion" filterUnits="objectBoundingBox" cx="40%" cy="40%" r="50%" fx="40%" fy="40%" fr="0%">
                <stop offset="0%" stop-color="#ffdec4" />
                <stop offset="100%" stop-color="#D55E00" />
            </radialGradient>
            <radialGradient id="reddish_purple" filterUnits="objectBoundingBox" cx="40%" cy="40%" r="50%" fx="40%" fy="40%" fr="1%">
                <stop offset="0%" stop-color="#f5e4ed" />
                <stop offset="100%" stop-color="#CC79A7" />
            </radialGradient>
            <filter id="shadow" filterUnits="objectBoundingBox" x="-10%" y="-10%" width="300%" height="300%" color-interpolation-filters="sRGB">
                <feDropShadow dx="5" dy="5" stdDeviation="3" flood-color="shadow" flood-opacity="0.5" />
            </filter>
        </defs>
    </svg>
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

            // Tutorial Feature
            this.tutorial_panes();

            // Help button.
            let helpButton = this.svg.append('g')
                .attr('transform', 'scale(1) translate(950, 0)');

            helpButton.append('path')
                .attr('d', 'M24,2A22,22,0,1,0,46,24,21.9,21.9,0,0,0,24,2Zm0,40A18,18,0,1,1,42,24,18.1,18.1,0,0,1,24,42Z M24,38h-.4l-.4-.2h-.3l-.3-.3-.3-.3c0-.1-.1-.2-.2-.3s0-.3-.1-.4v-.8c.1-.1.1-.2.1-.4s.2-.2.2-.3l.3-.3a1.9,1.9,0,0,1,1.8-.6h.4l.3.2.3.3.3.3c0,.1.1.2.1.3s.1.3.2.4v.8c-.1.1-.1.2-.2.4s-.1.2-.1.3l-.3.3-.3.3h-.3l-.4.2Z M24.4,30h-.8a2,2,0,0,1-1.1-2.6,7.3,7.3,0,0,1,3.6-3.9A4.9,4.9,0,0,0,25,14.1a5.3,5.3,0,0,0-4.2,1A5.3,5.3,0,0,0,19,18.9a2,2,0,0,1-4,0,8.8,8.8,0,0,1,3.3-6.8,8.8,8.8,0,0,1,7.5-1.9,8.9,8.9,0,0,1,2,16.8,3.7,3.7,0,0,0-1.6,1.7A1.9,1.9,0,0,1,24.4,30Z')
                .attr('fill', 'black');
            helpButton.append('circle')
                .attr("r", '23')
                .attr('cx', '24')
                .attr('cy', '24')
                .attr('fill-opacity', '0')
                .attr('fill', 'red');

            helpButton.on("click", show_tutorial);

            function show_tutorial() {
                // Set tutorial pane 0 'display' attribute to 'true'.
                document.getElementById('tut0')
                    .setAttribute('display', 'true');
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
                .attr('fill', d=>{return "url(#" + d.colour + ")"})
                .attr('filter', "url(#shadow)")
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
                .style("fill", "black")
                .style("font-family", "Arial")
                .style("font-size", this.label_size)
                .style("pointer-events", "none");

            this.label = labelEnter.merge(this.label);

            this.simulation.nodes(this.graphData.nodes).on("tick", this.tick);
            this.simulation.force("link").links(this.graphData.links);
            this.simulation.alpha(0.1).restart();

            this.node.on("click", clicked)
                .on("dblclick", dblclicked);

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
                }, 300);
            }

            function dblclicked(event, clickedNode) {
                clearTimeout(timeout);

                if(clickedNode.id !== ng.id){
                    ng.$router.push({ name: 'CompositionPage', params: { id: encodeURIComponent(clickedNode.id),
                            prev: encodeURIComponent(ng.id), prevTitle: ng.tuneData[0].title.value}});
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
        tutorial_panes(){
            // Reference to NetworkGraph.vue component context.
            let ng=this;

            let tut_strings = [
                [
                    ["Node Types"],
                    ["Tune nodes are large, coloured nodes.", ""],
                    ["Pattern nodes are smaller, black nodes.", ""]
                ],
                [
                    ["Single-Clicking"],
                    ["Single-clicking a node expands", "five additional neighbour nodes."],
                    ["If a node has no more neighbours,", "a red ring will flash around the node."]
                ],
                [
                    ["Double-Clicking"],
                    ["Double-clicking a node navigates to the", "selected node's tune or pattern page."],
                    ["If a tune node is double-clicked, the center", "panel appears, which shows patterns in",  "common between the current tune and the", "previous tune."]
                ],
                [
                    ["Tune Family"],
                    ["A tune node's colour represents", "its tune family."],
                    ["The name of its tune family can be", "shown by hovering over the node."]
                ],
                [
                    ["Zoom and Pan"],
                    ["Zoom the visualisation by scrolling. Pan the", "visualisation by dragging the background."],
                    ["All nodes can be dragged to reorient the", "network."]
                ],
                [
                    ["Visualisation Types"],
                    ["The default visualisation type shows tunes", "linked to patterns they contain."],
                    ["Pattern nodes can be hidden by toggling the", "'Show Pattern Nodes' slider to show tunes", "linked to similar tunes based on common", "patterns."]
                ],
                [
                    ["Back and Reset Buttons"],
                    ["Undo an expansion by clicking the", "'back' button in the top left corner."],
                    ["Reset the visualisation by clicking the", "'reset' button below the 'back' button.", ""]
                ],
            ];
            /*
                        let tut_img_1_1 = d3.select("#svg2").append("circle")
                            .remove()
                            .attr("r", this.tune_radius)
                            .attr('cx', '200')
                            .attr('cy', '220')
                            .attr('stroke-width', 3)
                            .attr('fill', "url(#orange)")
                            .attr('filter', "url(#shadow)");

                        let tut_img_1_2 = d3.select("#svg2").append("circle")
                            .remove()
                            .attr("r", this.pattern_radius)
                            .attr('cx', '200')
                            .attr('cy', '385')
                            .attr('stroke-width', 3)
                            .attr('fill', "url(#black)")
                            .attr('filter', "url(#shadow)");

                                    let tut_img_1_1 = d3.select('#svg1').node().appendChild("circle")
                                        .attr("r", this.tune_radius)
                                        .attr('cx', '200')
                                        .attr('cy', '220')
                                        .attr('stroke-width', 3)
                                        .attr('fill', "url(#orange)")
                                        .attr('filter', "url(#shadow)");

                                    let tut_img_1_2 = d3.select('#svg1').node().appendChild("circle")
                                        .attr("r", this.pattern_radius)
                                        .attr('cx', '200')
                                        .attr('cy', '385')
                                        .attr('stroke-width', 3)
                                        .attr('fill', "url(#black)")
                                        .attr('filter', "url(#shadow)");

                        let tut_images = [
                            [tut_img_1_1, tut_img_1_2],
                            [],
                            [],
                            [],
                            [],
                            [],
                            []
                        ];
                    */
            let num_panes = tut_strings.length;

            // add encompassing group for the tutorial panes.
            let tutorial = this.svg.append('g')
                .attr('class', 'tutorial');

            for(let i = 0; i < num_panes; i++){
                draw_pane(tutorial, i, tut_strings[i], /*tut_images[i],*/ num_panes);
            }

            function draw_pane(tutorial, i, tut_strings, /*tut_images,*/ num_panes) {
                let tut1 = tutorial.append('g')
                    .attr('class', 'tut'+i)
                    .attr('id', 'tut'+i)
                    .attr('display', 'none');
                tut1.append('rect')
                    .attr('x', '100')
                    .attr('y', '100')
                    .attr('width', '800')
                    .attr('height', '400')
                    .attr('rx', '15')
                    .attr('fill', 'white')
                    .attr('stroke', 'black');

                // title
                tut1.append('text')
                    .attr('x', '300')
                    .attr('y', '150')
                    .attr('font-size', '200%')
                    .text(tut_strings[0]);

                // text 1
                let txt1 = tut1.append('text')
                    .attr('x', '300')
                    .attr('y', '200')

                for(let j in tut_strings[1]){
                    txt1.append('tspan')
                        .attr('x', '300')
                        .attr('dy', '1.2em')
                        .attr('font-size', '150%')
                        .text(tut_strings[1][j])
                }

                // text 2
                let txt2 = tut1.append('text')
                    .attr('x', '300')
                    .attr('y', '365')

                for(let j in tut_strings[2]){
                    txt2.append('tspan')
                        .attr('x', '300')
                        .attr('dy', '1.2em')
                        .attr('font-size', '150%')
                        .text(tut_strings[2][j])
                }

                /* Icons */

                // Left Arrow
                if (i > 0) {
                    let leftArrow = tut1.append('g')
                        .attr('transform', 'scale(-0.2, 0.2) translate(-800, 1300)');

                    leftArrow.append('path')
                        .attr('d', "M233.252,155.997L120.752,6.001c-4.972-6.628-14.372-7.97-21-3c-6.628,4.971-7.971,14.373-3,21l105.75,140.997L96.752,306.001c-4.971,6.627-3.627,16.03,3,21c2.698,2.024,5.856,3.001,8.988,3.001c4.561,0,9.065-2.072,12.012-6.001l112.5-150.004C237.252,168.664,237.252,161.33,233.252,155.997z")
                        .attr('fill', 'black');
                    leftArrow.append('rect')
                        .attr("x", '90')
                        .attr("y", '0')
                        .attr("width", '145')
                        .attr("height", '330')
                        .attr('fill-opacity', '0')
                        .attr('fill', 'red');

                    // Add if statement for i = 0
                    leftArrow.on("click", previous_pane);
                }

                if (i < num_panes - 1) {
                    // Right Arrow
                    let rightArrow = tut1.append('g')
                        .attr('transform', 'scale(0.2, 0.2) translate(4200, 1300)')
                    rightArrow.append('path')
                        .attr('d', "M233.252,155.997L120.752,6.001c-4.972-6.628-14.372-7.97-21-3c-6.628,4.971-7.971,14.373-3,21l105.75,140.997L96.752,306.001c-4.971,6.627-3.627,16.03,3,21c2.698,2.024,5.856,3.001,8.988,3.001c4.561,0,9.065-2.072,12.012-6.001l112.5-150.004C237.252,168.664,237.252,161.33,233.252,155.997z")
                        .attr('fill', 'black');
                    rightArrow.append('rect')
                        .attr("x", '90')
                        .attr("y", '0')
                        .attr("width", '145')
                        .attr("height", '330')
                        .attr('fill-opacity', '0')
                        .attr('fill', 'red');

                    // Add if statement for i = num_panes - 1
                    rightArrow.on("click", next_pane);
                }

                // Close button
                let closePaneButton = tut1.append('g')
                    .attr('transform', 'translate(850, 110) scale(1.3, 1.3)')
                closePaneButton.append('path')
                    .attr('d', "M16 0c-8.836 0-16 7.163-16 16s7.163 16 16 16c8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 30.032c-7.72 0-14-6.312-14-14.032s6.28-14 14-14 14 6.28 14 14-6.28 14.032-14 14.032zM21.657 10.344c-0.39-0.39-1.023-0.39-1.414 0l-4.242 4.242-4.242-4.242c-0.39-0.39-1.024-0.39-1.415 0s-0.39 1.024 0 1.414l4.242 4.242-4.242 4.242c-0.39 0.39-0.39 1.024 0 1.414s1.024 0.39 1.415 0l4.242-4.242 4.242 4.242c0.39 0.39 1.023 0.39 1.414 0s0.39-1.024 0-1.414l-4.242-4.242 4.242-4.242c0.391-0.391 0.391-1.024 0-1.414z")
                    .attr('fill', 'black');
                closePaneButton.append('circle')
                    .attr("r", '16')
                    .attr('cx', '16')
                    .attr('cy', '16')
                    .attr('fill-opacity', '0')
                    .attr('fill', 'red');

                closePaneButton.on("click", close_pane);

/*
                    // Images
                    for(let j in tut_images){
                        //tut1.append(tut_images[j]);
                        tut1.append(tut_images[j]);
                    }
*/

                if(i == 0){
                    tut1.append("circle")
                        .attr("r", ng.tune_radius)
                        .attr('cx', '200')
                        .attr('cy', '220')
                        .attr('stroke-width', 3)
                        .attr('fill', "url(#orange)")
                        .attr('filter', "url(#shadow)");

                    tut1.append("circle")
                        .attr("r", ng.pattern_radius)
                        .attr('cx', '200')
                        .attr('cy', '385')
                        .attr('stroke-width', 3)
                        .attr('fill', "url(#black)")
                        .attr('filter', "url(#shadow)");
                } else if (i == 1){
                    tut1.append("circle")
                        .attr("r", ng.tune_radius)
                        .attr('cx', '190')
                        .attr('cy', '385')
                        .attr('stroke-width', 3)
                        .attr('fill', "url(#orange)")
                        .attr('filter', "url(#shadow)")
                        .attr('stroke',"red");

                    tut1.append("circle")
                        .attr("id", "blah1")
                        .attr("r", ng.pattern_radius)
                        .attr('cx', '250')
                        .attr('cy', '385')
                        .attr('stroke-width', 3)
                        .attr('fill', "url(#black)")
                        .attr('filter', "url(#shadow)")
                        .attr('stroke',"red")
                } else if (i == 3){
                    let n3 = tut1.append("circle")
                        .attr("r", ng.tune_radius)
                        .attr('cx', '200')
                        .attr('cy', '385')
                        .attr('stroke-width', 3)
                        .attr('fill', "url(#orange)")
                        .attr('filter', "url(#shadow)");
                    n3.append('title')
                        .text("Family");
                }
                else if (i == 6) {
                    // Back button.
                    tut1.append('path')
                        .attr('transform', 'translate(200, 220)  scale(1.2)')
                        .attr('d', 'M23.94624 27.25376a1.28 1.28 0 0 1-1.81312 1.81312l-7.68-7.68a1.28 1.28 0 0 1 0-1.81312l7.68-7.68a1.28 1.28 0 1 1 1.81312 1.81312L17.16992 20.48l6.77632 6.77376zM20.48 40.96A20.48 20.48 0 1 1 20.48 0a20.48 20.48 0 0 1 0 40.96zm0-2.56a17.92 17.92 0 1 0 0-35.84 17.92 17.92 0 0 0 0 35.84z')
                        .attr('fill', 'black');
                    // Reset button.
                    tut1.append('path')
                        .attr('transform', 'translate(205, 375) scale(0.04)')
                        .attr('d', 'M146.358 714 C219.143 847.474 360.001 934 517 934 c212.963 0 391.858 -158.66 418.579 -367.974 c3.077 -24.104 25.112 -41.15 49.217 -38.074 c24.105 3.078 41.152 25.113 38.074 49.218 C990.558 830.286 774.393 1022 517 1022 c-173.766 0 -331.173 -87.715 -424 -226.4 V911 c0 24.3 -19.7 44 -44 44 S5 935.3 5 911 V670 c0 -24.3 19.7 -44 44 -44 h241 c24.3 0 44 19.7 44 44 s-19.7 44 -44 44 H146.358z m736.284 -404 C809.857 176.526 668.999 90 512 90 C299.037 90 120.142 248.66 93.421 457.974 c-3.077 24.104 -25.112 41.15 -49.217 38.074 C20.099 492.97 3.052 470.935 6.13 446.83 C38.442 193.714 254.607 2 512 2 c173.766 0 331.173 87.715 424 226.4 V113 c0 -24.3 19.7 -44 44 -44 s44 19.7 44 44 v241 c0 24.3 -19.7 44 -44 44 H739 c-24.3 0 -44 -19.7 -44 -44 s19.7 -44 44 -44 h143.642z')
                        .attr('fill', 'black');
                }

            }

            function previous_pane(event) {
                let currentPane = event.target.parentNode.parentNode;
                let prevPaneId = 'tut' + (parseInt(currentPane.id.slice(3)) - 1);

                let prevPane = document.getElementById(prevPaneId);

                if (prevPane) {
                    currentPane.setAttribute('display', 'none');
                    prevPane.setAttribute('display', 'true');
                } else {
                    console.log("Next pane does not exist.");
                }
            }
            function next_pane(event) {
                let currentPane = event.target.parentNode.parentNode;
                let nextPaneId = 'tut' + (parseInt(currentPane.id.slice(3)) + 1);

                let nextPane = document.getElementById(nextPaneId);

                if (nextPane) {
                    currentPane.setAttribute('display', 'none');
                    nextPane.setAttribute('display', 'true');
                } else {
                    console.log("Next pane does not exist.");
                }
            }
            function close_pane(event) {
                // Set the active tutorial pane 'display' attribute to 'none'.
                var parentNode = event.target.parentNode.parentNode;

                // Set the display attribute of the parent node to 'none'
                parentNode.setAttribute('display', 'none');
            }
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
                                name: neighbours[t].title.value.replace(/^(.*?)(?:, The)$/, "The $1") + " (" + this.formatID(neighbours[t].id.value) + ")",
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
                nodeColour = this.colourList[this.currentColour];
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
                name: this.tuneData[0].title.value.replace(/^(.*?)(?:, The)$/, "The $1") + " (" + this.formatID(this.id) + ")",
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
