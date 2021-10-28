import * as d3 from "d3";
export default class MainGraph {
    constructor(data, birthYearDomain){
        this.data = data

        if(birthYearDomain != null) {
          this.birthYearDomain = birthYearDomain;
        } else {
          this.birthYearDomain = 1750;
        }

        this.svg = null;
        this.x = null;
        this.y = null;
    }

    createGraph() {
        // set the dimensions and margins of the graph
        var margin = {top: 10, right: 30, bottom: 30, left: 220},
            width = 1200 - margin.left - margin.right,
            height = 700 - margin.top - margin.bottom;
  
        // append the svg object to the body of the page
        this.svg = d3.select("#my_dataviz")
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");
  
        // Add X axis
        var x = d3.scaleLinear()
          .domain([this.birthYearDomain, 1970])
          .range([0, width]);
        this.svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
  
        // Y axis
        var y = d3.scaleBand()
          .range([ 0, height ])
          .domain(this.data.map(function(d) { return d.name; }))
          .padding(1);
        this.svg.append("g")
          .call(d3.axisLeft(y))
  
        // Lines
        this.svg.selectAll("myline")
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
        this.svg.selectAll("mycircle")
          .data(this.data)
          .enter()
          .append("circle")
            .attr("cx", function(d) { return x(d.birth_year); })
            .attr("cy", function(d) { return y(d.name); })
            .attr("r", "6")
            .style("fill", "#69b3a2")
        
        // Circles of variable 2
        this.svg.selectAll("mycircle")
          .data(this.data)
          .enter()
          .append("circle")
            .attr("cx", function(d) { return x(d.death_year); })
            .attr("cy", function(d) { return y(d.name); })
            .attr("r", "6")
            .style("fill", "#4C4082")
        }
}
