import * as d3 from "d3";
export default class MainGraph {
    constructor(data){
        this.data = data;
        this.x = null;
        this.y = null;
    }

    createGraph() {
        // set the dimensions and margins of the graph
        var margin = {top: 10, right: 0, bottom: 30, left: 30},
            width = 1800 - margin.left - margin.right,
            height = 1400 - margin.top - margin.bottom;
  
        // append the svg object to the body of the page
        const svg = d3.select("#my_dataviz").
        append('svg').
        attr('width', width + margin.left + margin.right).
        attr('height', height + margin.top + margin.bottom).
        call(responsivefy) // Call responsivefy to make the chart responsive
            .append('g').
        attr('transform', `translate(${margin.left}, ${margin.top})`)
      
      this.data.then(function(data){
        console.log(data)
        // X axis
        var x = d3.scaleLinear()
          .domain([1500, 2000])
          .range([0, width]);

        var xAxis = d3.axisBottom(x);
        
        svg.append("g")
          .call(xAxis)

      
        // Y axis
        var y = d3.scaleBand()
          .range([ 0, height ])
          .domain(data.map(function(d) { return d.name; }))
          .padding(1);
        // svg.append("g")
        //   .call(d3.axisLeft(y))
        
        // const yAxisGrid = d3.axisLeft(y).tickSize(-width).tickFormat('').ticks(10);
        // svg.append('g')
        // .attr('class', 'y axis-grid')
        // .attr('color','#DDD')
        // .call(yAxisGrid);

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

        var authorInfo = d3.select("body").append("div")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("text-align", "center")
        .style("width", "200px")
        .style("height", "38px")
        .style("padding", "8px")
        .style("font", "12px sans-serif")
        .style("pointer-events", "none")
        .style("background", "white")
        .style("border", "1px")
        .style("border-style", "solid")
        .style("border-radius", "8px")
        .style("border-color", "black");

        var authors = [...new Set(data.map(d => d.name))];
        
        var uniqueAuthors = authors.map(function(d) {
          return data.find(function(e) {
            return e.name === d
          })
        })
        
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
      
        // var paintings = [...new Set(data.map(d => d.title))];
        // Lines
        svg.selectAll("myline")
          .data(uniqueAuthors)
          .enter()
          .append("line")
            .attr("x1", function(d) {return x(d.birth_year); })
            .attr("x2", function(d) {return x(d.death_year); })
            .attr("y1", function(d) { return y(d.name); })
            .attr("y2", function(d) { return y(d.name); })
            .attr("stroke", function(d){ if (d.birth_year != "Unknown" && d.death_year != "Unknown") {return "#CCC"} })
            .attr("stroke-width", "4px")
        
        // svg.append("linearGradient")
        //   .data(uniqueAuthors)
        //   .attr("id", "line-gradient")
        //   .attr("gradientUnits", "userSpaceOnUse")
        //   .attr("x1", function(d) { return x(x1(d)) })
        //   .attr("x2", function(d) { return x(x2(d)) })
        //   .attr("y1", 0)
        //   .attr("y2", 0)
        //   .selectAll("stop")
        //     .data([
        //       {offset: "0%", color: "blue"},
        //       {offset: "100%", color: "red"}
        //     ])
        //   .enter().append("stop")
        //     .attr("offset", function(d) { return d.offset; })
        //     .attr("stop-color", function(d) { return d.color; });

        // svg.append("linearGradient")
        //   .data(uniqueAuthors)
        //   .attr("id", "line-gradient-2")
        //   .attr("gradientUnits", "userSpaceOnUse")
        //   .attr("x1", function(d) { return x(x1(d)) })
        //   .attr("x2", function(d) { return x(x2(d)) })
        //   .attr("y1", 0)
        //   .attr("y2", 0)
        //   .selectAll("stop")
        //     .data([
        //       {offset: "0%", color: "red"},
        //       {offset: "100%", color: "white"}
        //     ])
        //   .enter().append("stop")
        //     .attr("offset", function(d) { return d.offset; })
        //     .attr("stop-color", function(d) { return d.color; });

        // Gradient lines for entries with unknown birth/death year
        svg.selectAll("myline")
          .data(uniqueAuthors)
          .enter()
          .append("line")
          .attr("x1", function(d) { return x(x1(d)) })
          .attr("x2", function(d) { return x(x2(d)) })
          .attr("y1", function(d) { return y(d.name); })
          .attr("y2", function(d) { return y(d.name); })
          .attr("stroke", function(d){ if (d.birth_year == "Unknown") {return "#CCC"} else if (d.death_year == "Unknown") {return "#CCC"}})
          .attr("stroke-width", "4px")

        // Gradient lines for active date entries
        svg.selectAll("myline")
          .data(uniqueAuthors)
          .enter()
          .append("line")
          .attr("x1", function(d) { return x(x1ActiveDate(d)) })
          .attr("x2", function(d) { return x(x2ActiveDate(d)) })
          .attr("y1", function(d) { return y(d.name); })
          .attr("y2", function(d) { return y(d.name); })
          .attr("stroke", function() {return "#b84d91"})
          .attr("stroke-width", "4px")
          .on("mouseover", function(event, d) {
            d3.select(this).transition()
            .duration(400).attr('stroke', '#b84d91').attr("stroke-width", "8px")
            authorInfo.transition()
              .duration(400)
              .style("opacity", .9);
              authorInfo.html("Data de atividade aproximada: "+d.active_date)
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY) + "px");

            d3.select(this).enter()
              .append("div")
                .attr("x1", function(d) { if (d.active_date != "Unknown") {return x(d.active_date - 50); } else { return }})
                .attr("x2", function(d) { if (d.active_date != "Unknown") {return x(d.active_date + 50); } else { return }})
                .attr("y1", function(d) { return y(d.name); })
                .attr("y2", function(d) { return y(d.name); })
                .style("stroke", function(d){if (d.active_date != "Unknown"){ return "#00FFFF"} else {return "#bbbbbb"}})
                .attr("stroke-width", "4px")
          })
          .on("mouseout", function() {
            d3.select(this).transition()
            .duration(400).attr('stroke', '#b84d91').attr("stroke-width", "4px")
            authorInfo.transition()
              .duration(400)
              .style("opacity", 0);
            });
        
        // Author names
        svg.selectAll("myline")
          .data(uniqueAuthors)
          .enter()
          .append("text")
            .attr("x", function(d) { if (d.birth_year != "Unknown") {return x(+d.birth_year) + 20; } else if (d.death_year != "Unknown" && d.birth_year == "Unknown") { return  x(+d.death_year - 80)} else if (d.active_date != "Unknown") {return x(x1ActiveDate(d))}})
            .attr("y", function(d) { return y(d.name) -5; })
            .attr('stroke', 'grey')
            .attr("font-weight", 200)
            .style("font-size", 12)
            .text(function(d) { return d.name })
            .on("mouseover", function(event, d) {
              d3.select(this).transition()
              .duration(400).attr('stroke', '#677dAA')
              authorInfo.transition()
                .duration(400)
                .style("opacity", .9);
                authorInfo.html(d.name+", "+d.birth_year+"-"+d.death_year+"<br>"+"Data de atividade: "+d.active_date)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");

              d3.select(this).enter()
                .append("div")
                  .attr("x1", function(d) { if (d.active_date != "Unknown") {return x(d.active_date - 50); } else { return }})
                  .attr("x2", function(d) { if (d.active_date != "Unknown") {return x(d.active_date + 50); } else { return }})
                  .attr("y1", function(d) { return y(d.name); })
                  .attr("y2", function(d) { return y(d.name); })
                  .style("stroke", function(d){if (d.active_date != "Unknown"){ return "#00FFFF"} else {return "#bbbbbb"}})
                  .attr("stroke-width", "4px")
            })
            .on("mouseout", function() {
              d3.select(this).transition()
              .duration(400).attr('stroke', 'grey')
              authorInfo.transition()
                .duration(400)
                .style("opacity", 0);
              });

        // Circles of variable 1
        svg.selectAll("mycircle")
          .data(uniqueAuthors)
          .enter()
          .append("circle")
            .attr("cx", function(d) { if (d.birth_year != "Unknown") {return x(+d.birth_year); } else if (d.death_year != "Unknown" || d.birth_year == "Unknown") { return  }})
            .attr("cy", function(d) { return y(d.name); })
            .attr("r", "6")
            .style("fill", function(d){if (d.birth_year == "Unknown" && d.death_year == "Unknown") {return "#FFF" } else return dotColor(d.birth_year, "#38c92a")})
            .on("mouseover", function(event,d) {
              mouseover(this, event,"Ano de nascimento", d.birth_year, tooltip)
            })
            .on("mouseout", function() {
              mouseout(this, tooltip)
            });
          
        // Circles of variable 2
        svg.selectAll("mycircle")
          .data(uniqueAuthors)
          .enter()
          .append("circle")
            .attr("cx", function(d) { if (d.death_year != "Unknown") {return x(+d.death_year); } else if (d.death_year == "Unknown" || d.birth_year != "Unknown") { return  x(+d.birth_year + 80)}})
            .attr("cy", function(d) { return y(d.name); })
            .attr("r", "6")
            .style("fill", function(d){if (d.death_year == "Unknown" && d.birth_year == "Unknown"){ return "#FFF"} else return dotColor(d.death_year, "#bf1321")})
          .on("mouseover", function(event,d) {
            mouseover(this, event,"Ano de morte", d.death_year, tooltip)
          })
          .on("mouseout", function() {
            mouseout(this, tooltip)
          });
      })
        
    }
}

// auxiliary functions
function x1(d) { 
  if (d.birth_year != "Unknown") {
    return +d.birth_year;
  } else if (d.birth_year == "Unknown" && d.death_year != "Unknown") {
    return +d.death_year - 80;
  }
}

function x2(d) { 
  if (d.death_year != "Unknown") {
    return +d.death_year;
  } else if (d.death_year == "Unknown" && d.birth_year != "Unknown") {
    return +d.birth_year+ 70;
  }
}

function x1ActiveDate(d) { 
  if (d.birth_year == "Unknown" && d.death_year == "Unknown" && d.active_date != "Unknown") {
    if (d.active_date == "16th century") {
      return +1500;
    } else if (d.active_date == "17th century"){
      return +1600;
    } else if (d.active_date == "18th century") {
      return +1700;
    } else if (d.active_date == "19th century"){
      return +1800;
    } else if (d.active_date == "20th century") {
      return +1900;
    } else {
      return +d.active_date - 20;
    }
  }
}

function x2ActiveDate(d) { 
  if (d.birth_year == "Unknown" && d.death_year == "Unknown" && d.active_date != "Unknown") {
    if (d.active_date == "16th century") {
      return +1599;
    } else if (d.active_date == "17th century"){
      return +1699;
    } else if (d.active_date == "18th century") {
      return +1799;
    } else if (d.active_date == "19th century"){
      return +1899;
    } else if (d.active_date == "20th century") {
      return +1999;
    } else {
      return +d.active_date + 20;
    }
  }
}

function mouseover(context, event, text, data, tooltip) {
  d3.select(context).transition()
    .duration('200').attr("r", 10);
    tooltip.transition()
      .duration(200)
      .style("opacity", .9);
      tooltip.html(text + "<br/>" + data)
      .style("left", (event.pageX) + "px")
      .style("top", (event.pageY - 28) + "px");
}

function mouseout(context, tooltip) {
  d3.select(context).transition()
    .duration('200').attr("r", 6);
    tooltip.transition()
      .duration(200)
      .style("opacity", 0);
}

function dotColor(data, color){
  if (data != "Unknown"){ 
    return color
  } else {
    return "#FFF"
  }
}

function responsivefy(svg) {
             
  // Container is the DOM element, svg is appended.
  // Then we measure the container and find its
  // aspect ratio.
  const container = d3.select(svg.node().parentNode),
      width = parseInt(svg.style('width'), 10),
      height = parseInt(svg.style('height'), 10),
      aspect = width / height;
       
  // Add viewBox attribute to set the value to initial size
  // add preserveAspectRatio attribute to specify how to scale
  // and call resize so that svg resizes on page load
  svg.attr('viewBox', `0 0 ${width} ${height}`).
  attr('preserveAspectRatio', 'xMinYMid').
  call(resize);
   
  d3.select(window).on('resize.' + container.attr('id'), resize);

  function resize() {
      const targetWidth = parseInt(container.style('width'));
      svg.attr('width', targetWidth);
      svg.attr('height', Math.round(targetWidth / aspect));
  }
}


