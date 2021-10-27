import * as d3 from "d3";
export default class MainGraph {
    constructor(data){
        this.data = data;
    }
    createGraph() {
        // set the dimensions and margins of the graph
        var margin = {top: 10, right: 30, bottom: 30, left: 220},
            width = 1200 - margin.left - margin.right,
            height = 700 - margin.top - margin.bottom;
  
        // append the svg object to the body of the page
        var svg = d3.select("#my_dataviz")
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");
  
        // Add X axis
        var x = d3.scaleLinear()
          .domain([1750, 1970])
          .range([ 0, width]);
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
  
        // Y axis
        var y = d3.scaleBand()
          .range([ 0, height ])
          .domain(this.data.map(function(d) { return d.name; }))
          .padding(1);
        svg.append("g")
          .call(d3.axisLeft(y))
  
        // Lines
        svg.selectAll("myline")
          .data(this.data)
          .enter()
          .append("line")
            .attr("x1", function(d) { return x(d.birth_year); })
            .attr("x2", function(d) { return x(d.death_year); })
            .attr("y1", function(d) { return y(d.name); })
            .attr("y2", function(d) { return y(d.name); })
            .attr("stroke", "grey")
            .attr("stroke-width", "1px")
  
        // Circles of variable 1
        svg.selectAll("mycircle")
          .data(this.data)
          .enter()
          .append("circle")
            .attr("cx", function(d) { return x(d.birth_year); })
            .attr("cy", function(d) { return y(d.name); })
            .attr("r", "6")
            .style("fill", "#69b3a2")
  
        // Circles of variable 2
        svg.selectAll("mycircle")
          .data(this.data)
          .enter()
          .append("circle")
            .attr("cx", function(d) { return x(d.death_year); })
            .attr("cy", function(d) { return y(d.name); })
            .attr("r", "6")
            .style("fill", "#4C4082")
      }
    // constructor(data) {
    //     this.config = {div: '#my_dataviz', width: 1200, height: 700, top: 10, left: 220, bottom: 30, right: 30};
    
    //     this.svg = null;
    //     this.margins = null;
    
    //     this.xScale = null;
    //     this.yScale = null;
    
    //     this.data = data;
    
    //     this.createSvg();
    //     this.createMargins();
    // }

    // getFromCSV(data) {
    //     this.data = data;
    // }

    // async loadCSV(file) {
    //     let preData = await d3.csv(file, d => {
    //       return {
    //         name: d.name,
    //         birth_year: +d.birth_year,
    //         death_year: +d.death_year
    //       }
    //     });
    //     this.data = preData;
    //     // if (this.config.year == null)
    //     // this.bars = this.groupByCountry(data);
    // }

    // createSvg() {
    //     this.svg = d3.select(this.config.div)
    //         .append("svg")
    //         .attr("width", this.config.width + this.config.left + this.config.right)
    //         .attr("height", this.config.height + this.config.top + this.config.bottom);
    // }

    // createMargins() {
    //     this.margins = this.svg
    //       .append('g')
    //       .attr("transform", `translate(${this.config.left},${this.config.top})`)
    // }

    // createScales() {
    //     // let xExtent = d3.extent(this.data, d => {
    //     //   return d.year;
    //     // });
    
    //     // let yExtent = d3.extent(this.data, d => {
    //     //   return d.emission;
    //     // });
    
    //     this.xScale = d3.scaleLinear().domain([1750, 1970]).range([0, this.config.width]);
    //     this.yScale = d3.scaleBand().domain(this.data.map(function(d) { return d.name; })).range([0, this.config.height]);
    // }
    
    // createAxis() {
    //     this.margins
    //         .append("g")
    //         .attr("transform", "translate(0," + this.config.height + ")")
    //         .call(d3.axisBottom(this.x))
    
    //     this.margins
    //         .append("g")
    //         .call(d3.axisLeft(this.y))
    
    //     // this.svg.append("text")
    //     //   .attr("text-anchor", "end")
    //     //   .attr("y", 6)
    //     //   .attr("x", -200)
    //     //   .attr("dy", ".75em")
    //     //   .attr("transform", "rotate(-90)")
    //     //   .text("Emissão de CO2");
    
    //     // this.svg.append("text")             
    //     //   .attr("transform",
    //     //         "translate(" + (this.config.width/2 + 100) + " ," + 
    //     //                        (this.config.height + this.config.top + 50) + ")")
    //     //   .style("text-anchor", "middle")
    //     //   .text("Ano (de 1850 a 2017)");
    // }

    // renderLines() {
    //     this.margins.selectAll("myline")
    //         .data(this.data)
    //         .enter()
    //         .append("line")
    //             .attr("x1", function(d) { return this.x(d.birth_year); })
    //             .attr("x2", function(d) { return this.x(d.death_year); })
    //             .attr("y1", function(d) { return this.y(d.name); })
    //             .attr("y2", function(d) { return this.y(d.name); })
    //             .attr("stroke", "grey")
    //             .attr("stroke-width", "1px")
    // }

    // renderCircles() {
    //      // Circles of variable 1
    //     this.svg.selectAll("mycircle")
    //     .data(this.data)
    //     .enter()
    //     .append("circle")
    //         .attr("cx", function(d) { return this.x(d.birth_year); })
    //         .attr("cy", function(d) { return this.y(d.name); })
    //         .attr("r", "6")
    //         .style("fill", "#69b3a2")

    //     // Circles of variable 2
    //     this.svg.selectAll("mycircle")
    //     .data(this.data)
    //     .enter()
    //     .append("circle")
    //         .attr("cx", function(d) { return this.x(d.death_year); })
    //         .attr("cy", function(d) { return this.y(d.name); })
    //         .attr("r", "6")
    //         .style("fill", "#4C4082")
    // }
}
