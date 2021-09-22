<template>
  <v-app>
    <v-container>
      <v-row>
        <v-col cols="4" class="d-flex justify-center align-center">
          <div class="pa-2">
            <h3 class="pb-2">Exemplo</h3>
            <p>
            {{ msg }}
            </p>
          </div>
        </v-col>
        <v-col id="my_dataviz" />
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import * as d3 from "d3";
export default {
  name: 'Timeline',
  async mounted() {
    const data = await d3.csv("/exit.csv");
    for (const { name, birth_year } of data) {
      console.log(name, birth_year);
    }
    this.generateGraph(data)
  },
  // mounted() {
  //   this.generateArc();
  // },
  methods: {
    generateGraph(data) {
      // set the dimensions and margins of the graph
      var margin = {top: 10, right: 30, bottom: 30, left: 220},
          width = 1200 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

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
        .domain(data.map(function(d) { return d.name; }))
        .padding(1);
      svg.append("g")
        .call(d3.axisLeft(y))

      // Lines
      svg.selectAll("myline")
        .data(data)
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
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", function(d) { return x(d.birth_year); })
          .attr("cy", function(d) { return y(d.name); })
          .attr("r", "6")
          .style("fill", "#69b3a2")

      // Circles of variable 2
      svg.selectAll("mycircle")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", function(d) { return x(d.death_year); })
          .attr("cy", function(d) { return y(d.name); })
          .attr("r", "6")
          .style("fill", "#4C4082")
    }
}
};
</script>