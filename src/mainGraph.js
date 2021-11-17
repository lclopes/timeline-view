import * as d3 from "d3";
export default class MainGraph {
    constructor(data){
        this.data = data;
        this.x = null;
        this.y = null;
    }

    createGraph() {
        // set the dimensions and margins of the graph
        var margin = {top: 10, right: 30, bottom: 30, left: 320},
            width = 1600 - margin.left - margin.right,
            height = 700 - margin.top - margin.bottom;
  
        // append the svg object to the body of the page
        var svg = d3.select("#my_dataviz")
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

      this.data.then(function(data){
        console.log(data)
        var x = d3.scaleLinear()
          .domain([1750, 1970])
          .range([0, width]);
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
  
        // Tooltips
        var tooltip = d3.select("body").append("div")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("text-align", "center")
        .style("width", "70px")
        .style("height", "58px")
        .style("padding", "8px")
        .style("font", "18px sans-serif")
        .style("pointer-events", "none")
        .style("background", "white")
        .style("border", "1px")
        .style("border-style", "solid")
        .style("border-radius", "8px")
        .style("border-color", "black");

        // var authorInfo = d3.select("body").append("div")
        // .style("opacity", 0)
        // .style("position", "absolute")
        // .style("text-align", "center")
        // .style("width", "200px")
        // .style("height", "58px")
        // .style("padding", "8px")
        // .style("font", "18px sans-serif")
        // .style("pointer-events", "none")
        // .style("background", "white")
        // .style("border", "1px")
        // .style("border-style", "solid")
        // .style("border-radius", "8px")
        // .style("border-color", "black");

        var authors = [...new Set(data.map(d => d.name))];
        
        var uniqueAuthors = authors.map(function(d) {
          return data.find(function(e) {
            return e.name === d
          })
        })

        // const authorpaintings = authors.map(function(d) {
        //   const paintings = [];
        //   for (const authData in data) {
        //     if(d == authData.name) {
        //       paintings.push(authData.title);
        //     }
        //   }
        //   return 
        // });
        // console.log(authorpaintings)
        
        var authorPaintings = [];
        for (let name of authors) {
          var entry = []
          var paintings = [];
          for (let value of data){
            if (name == value['name']){
              paintings.push(value['title']);
            }
          }
          entry = {'name': name, 'paintings':paintings};
          authorPaintings.push(entry);
        }
        
        console.log(uniqueAuthors)

        // var paintings = [...new Set(data.map(d => d.title))];
        // Lines
        svg.selectAll("myline")
          .data(uniqueAuthors)
          .enter()
          .append("line")
            .attr("x1", function(d) { if (+d.birth_year != "Unknown") {return x(+d.birth_year); }})
            .attr("x2", function(d) { if (+d.death_year != "Unknown") {return x(+d.death_year); }})
            .attr("y1", function(d) { return y(d.name); })
            .attr("y2", function(d) { return y(d.name); })
            .attr("stroke", function(d){ if (d.birth_year == "Unknown" || d.death_year == "Unknown") {return "white"} else {return "grey"}})
            .attr("stroke-width", "2px")
          .on("mouseover", function(event, d) {
            var paintings = []
            for (let a in authorPaintings){
              if(a['name'] == d.name){
                paintings.push(d.title);
              }
            }
            console.log(paintings)
            tooltip.transition()
              .duration(200)
              .style("opacity", .9);
              tooltip.html(paintings)
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function() {
            tooltip.transition()
              .duration(200)
              .style("opacity", 0);
            });
          
        // Circles of variable 1
        svg.selectAll("mycircle")
          .data(data)
          .enter()
          .append("circle")
            .attr("cx", function(d) { if (d.birth_year != "Unknown") {return x(+d.birth_year); } else { return }})
            .attr("cy", function(d) { return y(d.name); })
            .attr("r", "6")
            .style("fill", function(d){if (d.birth_year != "Unknown"){ return "#69b3a2"} else {return "#bbbbbb"}})
          .on("mouseover", function(event,d) {
            d3.select(this).attr("r", 10).style(function(d){if (d.birth_year != "Unknown"){ return "#69b3a2"} else {return "#bbbbbb"}});
            tooltip.transition()
              .duration(200)
              .style("opacity", .9);
              tooltip.html("Year of birth" + "<br/>" + d.birth_year)
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY - 28) + "px");
            })
          .on("mouseout", function() {
            d3.select(this).attr("r", 6).style("fill", function(d){if (d.birth_year != "Unknown"){ return "#69b3a2"} else {return "#bbbbbb"}});
            tooltip.transition()
              .duration(200)
              .style("opacity", 0);
            });
          
        // Circles of variable 2
        svg.selectAll("mycircle")
          .data(data)
          .enter()
          .append("circle")
            .attr("cx", function(d) { if (d.death_year != "Unknown") {return x(+d.death_year); } else { return }})
            .attr("cy", function(d) { return y(d.name); })
            .attr("r", "6")
            .style("fill", function(d){if (d.death_year != "Unknown"){ return "#4C4082"} else {return "#bbbbbb"}})
          .on("mouseover", function(event,d) {
            d3.select(this).attr("r", 10).style("fill", function(d){if (d.death_year != "Unknown"){ return "#4C4082"} else {return "#bbbbbb"}});
            tooltip.transition()
              .duration(200)
              .style("opacity", .9);
              tooltip.html("Year of death" + "<br/>" + d.death_year)
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY - 28) + "px");
            })
          .on("mouseout", function() {
            d3.select(this).attr("r", 6).style("fill", function(d){if (d.death_year != "Unknown"){ return "#4C4082"} else {return "#bbbbbb"}});
            tooltip.transition()
              .duration(200)
              .style("opacity", 0);
            });
          
      })
        
    }
}