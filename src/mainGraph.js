import * as d3 from "d3";
import Colors from "./colors.js"

export default class MainGraph {
  constructor(data) {
    this.data = data;
    this.x = null;
    this.y = null;
  }

  createGraph() {
    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 30, left: 30 },
      width = 1500 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;

    // append the svg object to the body of the viewData
    var svg = d3.select("#my_dataviz")
      .append('svg')
      .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
      // .attr('width', width + margin.left + margin.right)
      // .attr('height', height + margin.top + margin.bottom)

      // .call(responsivefy) // Call responsivefy to make the chart responsive
      .append("g")
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    var xAxis = d3.select("#my_dataviz")
      .append("g");

    // asynchronous function to draw graph based on csv
    this.data.then(function (data) {
      // set of techniques
      const allGroup = new Set(data.map(d => d.technique));
      allGroup.add('Todos');

      // create dropdown menu of techniques
      d3.select("#selectButton")
        .selectAll('myOptions')
        .data(allGroup)
        .enter()
        .append('option')
        .property("selected", "Todos")
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button

      var xStart = 1500, xEnd = 2000;

      var pageLimit = 20;
      var dataFilter = data.filter(function (d) { return d.index <= pageLimit });
      
      var thisPage = 1;

      // X axis
      var x = d3.scaleLinear()
        .domain([xStart, xEnd])
        .range([0, width]);

      // Y axis
      var y = d3.scaleBand()
        .range([0, dataFilter.length])
        .domain(data.map(function (d) { return d.name; }))

      var viewData = data.slice(pageLimit * thisPage - 1, pageLimit * thisPage);
      
      if(thisPage == 1) d3.select("#prevPage").attr('disabled', true);

      if (data.length <= pageLimit) {
        console.log('length < viewData limit');
        d3.select("#nextPage").attr('disabled', true);
      } else if (data.length > pageLimit) {
        d3.select("#nextPage").on("click", function() {
          console.log('cliquei next')
          thisPage++;
          d3.select("#prevPage").attr('disabled', null);
          dataFilter = data.filter(function (d) { return d.index <= pageLimit * thisPage && d.index > pageLimit * (thisPage-1)});
          if(dataFilter.length < pageLimit){
            d3.select("#nextPage").attr('disabled', true);
          } else {
            d3.select("#nextPage").attr('disabled', null);
          }
          console.log(dataFilter);
          d3.selectAll("g > *").remove();
          drawGraph(dataFilter);
        })

        d3.select("#prevPage").on("click", function() {
          console.log('cliquei prev')
          thisPage--;
          if(thisPage>1){
            dataFilter = data.filter(function (d) { return d.index <= pageLimit * thisPage && d.index > pageLimit * (thisPage-1) });
            d3.selectAll("g > *").remove();
            console.log(dataFilter);
            drawGraph(dataFilter);
            if(dataFilter.length > pageLimit){
              d3.select("#nextPage").attr('disabled', null);
            }
          }else if (thisPage==1){
            var dataFilter = data.filter(function (d) { return d.index <= pageLimit });
            d3.selectAll("g > *").remove();
            console.log(dataFilter);
            drawGraph(dataFilter);
            d3.select("#prevPage").attr('disabled', true);
          }
        })
      }

      // create chart
      drawGraph(dataFilter);
      
      // redraw chart
      function updateTechnique(selectedGroup) {

        // Create new data with the selection?
        var dataFilter = viewData.filter(function (d) { return d.technique == selectedGroup })

        // Remove previous data
        d3.selectAll("g > *").remove();

        // Give these new data to update line
        if (selectedGroup == 'Todos') {
          // add new data
          drawGraph(viewData);
        } else {
          // add new data
          drawGraph(dataFilter);
        }

      }


      // When the button is changed, run the updateChart function
      d3.select("#selectButton").on("change", function () {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        updateTechnique(selectedOption)
      })

      // A function that update the plot for a given value
      function updateStartYearScale() {

        // Get the value of the button
        xStart = this.value

        // Update X axis
        x.domain([xStart, xEnd])
        xAxis.transition().duration(1000).call(d3.axisBottom(x));

        // Remove previous data
        d3.selectAll("g > *").remove();

        // Update chart
        drawGraph(data);
      }

      // A function that update the plot for a given value
      function updateEndYearScale() {

        // Get the value of the button
        xEnd = this.value

        // Update X axis
        x.domain([xStart, xEnd])
        xAxis.transition().duration(1000).call(d3.axisBottom(x));

        // Remove previous data
        d3.selectAll("g > *").remove();

        // Update chart
        drawGraph(data);

      }

      // Add an event listener to the button created in the html part
      d3.select("#buttonXstart").on("input", updateStartYearScale);
      d3.select("#buttonXend").on("input", updateEndYearScale);

      // function to create chart /////////////////////////////// main code here //////////////////////////////
      function drawGraph(data) {
        // X axis
        var x = d3.scaleLinear()
          .domain([xStart, xEnd])
          .range([0, width]);

        xAxis = svg.append("g")
          .call(d3.axisBottom(x));

        // Y axis
        y = d3.scaleBand()
          .range([50, 700])
          .domain(data.map(function (d) { return d.name; }))
          .paddingInner(0)
          .align(1)

        // svg.append("g")
        //   .call(d3.axisLeft(y))
        //   .attr("y", 6)

        // svg.call(d3.zoom()
        //   .extent([[0, 0], [width, height]])
        //   .scaleExtent([1, 8])
        //   .on("zoom", zoomed));

        // function zoomed({ transform }) {
        //   svg.attr("transform", transform);
        // }

        ///////////////////// TODO: COLOR GRADIENT BY NUMBER OF PAINTINGS BY AUTHOR /////////////////////////////////
        var namesExtent = [1, 50];

        let colorScale = d3.scaleSequential().range(Colors.standardScale()).domain(namesExtent);
        let colorScaleUnknownBirth = d3.scaleSequential().range(Colors.unknownBirthScale()).domain(namesExtent);
        let colorScaleUnknownDeath = d3.scaleSequential().range(Colors.unknownDeathScale()).domain(namesExtent);

        // var group = d3.group(data, d => d.name, d => d.technique);
        // // var valuesGroup = group.values();

        // console.log(group.get("Folwell, Samuel").keys());
        // console.log(d3.extent(group.get(data, d => d.name)))
        // var rangeNames = d3.rollup(data, v => v.length, d => d.name);
        // let lineColor = d3.scaleOrdinal().domain(rangeNames.values).range(["grey","black"])
        // console.log(lineColor)

        // Tooltips
        var tooltip = d3.select("body").append("div")
          .style("opacity", 0)
          .style("position", "absolute")
          .style("text-align", "center")
          .style("width", "70px")
          .style("height", "58px")
          .style("padding", "8px")
          .style("font", "14px sans-serif")
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
          .style("height", "65px")
          .style("padding", "8px")
          .style("font", "12px sans-serif")
          .style("pointer-events", "none")
          .style("background", "white")
          .style("border", "1px")
          .style("border-style", "solid")
          .style("border-radius", "8px")
          .style("border-color", "black");

        var authors = [...new Set(data.map(d => d.name))];

        var uniqueAuthors = authors.map(function (d) {
          return data.find(function (e) {
            return e.name === d
          })
        })

        // Lines
        svg.selectAll("myline")
          .data(uniqueAuthors)
          .enter()
          .append("line")
          .attr("x1", function (d) { return x(d.birth_year); })
          .attr("x2", function (d) { return x(d.death_year); })
          .attr("y1", function (d) { return y(d.name); })
          .attr("y2", function (d) { return y(d.name); })
          .style("position", "relative")
          .attr("stroke", function (d) {
            if (d.birth_year != "Unknown" && d.death_year != "Unknown") { return colorScale(d3.group(data, d => d.name).get(d.name).length) }
          })
          .attr("stroke-width", "6px")

        // Lines for entries with unknown birth/death year
        svg.selectAll("myline")
          .data(uniqueAuthors)
          .enter()
          .append("line")
          .attr("x1", function (d) { return x(x1(d)) })
          .attr("x2", function (d) { return x(x2(d)) })
          .attr("y1", function (d) { return y(d.name); })
          .attr("y2", function (d) { return y(d.name); })
          .attr("stroke", function (d) { if (d.birth_year == "Unknown") { return colorScaleUnknownBirth(d3.group(data, d => d.name).get(d.name).length) } else if (d.death_year == "Unknown") { return colorScaleUnknownDeath(d3.group(data, d => d.name).get(d.name).length) } })
          .attr("stroke-width", "6px")

        // Lines for active date entries
        svg.selectAll("myline")
          .data(uniqueAuthors)
          .enter()
          .append("line")
          .attr("x1", function (d) { return x(x1ActiveDate(d)) })
          .attr("x2", function (d) { return x(x2ActiveDate(d)) })
          .attr("y1", function (d) { return y(d.name); })
          .attr("y2", function (d) { return y(d.name); })
          .attr("stroke", function () { return Colors.activeDateLine() })
          .attr("stroke-width", "6px")
          .style("stroke-dasharray", ("3, 3"))
          .on("mouseover", function (event, d) {
            d3.select(this).transition()
              .duration(400).attr('stroke', Colors.activeDateLine()).attr("stroke-width", "8px")
            authorInfo.transition()
              .duration(400)
              .style("opacity", .9);
            authorInfo.html("Data de atividade aproximada: " + d.active_date)
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY) + "px");

            d3.select(this).enter()
              .append("div")
              .attr("x1", function (d) { if (d.active_date != "Unknown") { return x(d.active_date - 20); } else { return } })
              .attr("x2", function (d) { if (d.active_date != "Unknown") { return x(d.active_date + 20); } else { return } })
              .attr("y1", function (d) { return y(d.name); })
              .attr("y2", function (d) { return y(d.name); })
              .style("stroke", function (d) { if (d.active_date != "Unknown") { return Colors.activeDateLine() } else { return Colors.blank() } })
              .attr("stroke-width", "6px")
          })
          .on("mouseout", function () {
            d3.select(this).transition()
              .duration(400).attr('stroke', Colors.activeDateLine()).attr("stroke-width", "4px")
            authorInfo.transition()
              .duration(400)
              .style("opacity", 0);
          });

        // Author names
        svg.selectAll("myline")
          .data(uniqueAuthors)
          .enter()
          .append("text")
          .attr("x", function (d) { if (d.birth_year != "Unknown") { return x(+d.birth_year) + 20; } else if (d.death_year != "Unknown" && d.birth_year == "Unknown") { return x(+d.death_year - 80) } else if (d.active_date != "Unknown") { return x(x1ActiveDate(d)) } })
          .attr("y", function (d) { return y(d.name) - 10; })
          .attr('stroke', 'grey')
          .attr("font-weight", 100)
          .style("font-size", 18)
          .text(function (d) { return d.name})
          .on("mouseover", function (event, d) {
            d3.select(this).transition()
              .duration(400).attr('stroke', Colors.authorNameHovered())
            authorInfo.transition()
              .duration(400)
              .style("opacity", .9);
            authorInfo.html(function () {
              if (d.active_date == "Unknown") {
                return d.name + ", " + d.birth_year + "-" + d.death_year + '<br> Técnica(s) de pintura: ' + Array.from(d3.group(data, d => d.name, d => d.technique).get(d.name).keys()) + '<br> Número de pinturas: ' + d3.group(data, d => d.name).get(d.name).length
              } else if (d.birth_year == "Unknown" || d.death_year == "Unknown") {
                return d.name + "<br>" + "Data de atividade: " + d.active_date + '<br> Técnica(s) de pintura: ' + Array.from(d3.group(data, d => d.name, d => d.technique).get(d.name).keys()) + '<br> Número de pinturas: ' + d3.group(data, d => d.name).get(d.name).length
              } else {
                return d.name + ", " + d.birth_year + "-" + d.death_year + '<br> Técnica(s) de pintura: ' + Array.from(d3.group(data, d => d.name, d => d.technique).get(d.name).keys()) + '<br> Número de pinturas: ' + d3.group(data, d => d.name).get(d.name).length + "<br> Data de atividade: " + d.active_date
              }
            }

            )
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function () {
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
          .attr("cx", function (d) { if (d.birth_year != "Unknown") { return x(+d.birth_year); } else if (d.death_year != "Unknown" || d.birth_year == "Unknown") { return } })
          .attr("cy", function (d) { return y(d.name); })
          .attr("r", "6")
          .style("fill", function (d) { if (d.birth_year == "Unknown" && d.death_year == "Unknown") { return "#FFF" } else return dotColor(d.birth_year, Colors.birthCircle()) })
          .on("mouseover", function (event, d) {
            mouseover(this, event, "Ano de nascimento", d.birth_year, tooltip)
          })
          .on("mouseout", function () {
            mouseout(this, tooltip)
          });

        // Circles of variable 2
        svg.selectAll("mycircle")
          .data(uniqueAuthors)
          .enter()
          .append("circle")
          .attr("cx", function (d) { if (d.death_year != "Unknown") { return x(+d.death_year); } else if (d.death_year == "Unknown" || d.birth_year != "Unknown") { return x(+d.birth_year + 80) } })
          .attr("cy", function (d) { return y(d.name); })
          .attr("r", "6")
          .style("fill", function (d) { if (d.death_year == "Unknown" && d.birth_year == "Unknown") { return "#FFF" } else return dotColor(d.death_year, Colors.deathCircle()) })
          .on("mouseover", function (event, d) {
            mouseover(this, event, "Ano de morte", d.death_year, tooltip)
          })
          .on("mouseout", function () {
            mouseout(this, tooltip)
          });


      }

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
    return +d.birth_year + 70;
  }
}

function x1ActiveDate(d) {
  if (d.birth_year == "Unknown" && d.death_year == "Unknown" && d.active_date != "Unknown") {
    if (d.active_date == "16th century") {
      return +1500;
    } else if (d.active_date == "17th century") {
      return +1600;
    } else if (d.active_date == "18th century") {
      return +1700;
    } else if (d.active_date == "19th century") {
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
    } else if (d.active_date == "17th century") {
      return +1699;
    } else if (d.active_date == "18th century") {
      return +1799;
    } else if (d.active_date == "19th century") {
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

function dotColor(data, color) {
  if (data != "Unknown") {
    return color
  } else {
    return "#FFF"
  }
}

// function responsivefy(svg) {

//   // Container is the DOM element, svg is appended.
//   // Then we measure the container and find its
//   // aspect ratio.
//   const container = d3.select(svg.node().parentNode),
//     width = parseInt(svg.style('width'), 10),
//     height = parseInt(svg.style('height'), 10),
//     aspect = width / height;

//   // Add viewBox attribute to set the value to initial size
//   // add preserveAspectRatio attribute to specify how to scale
//   // and call resize so that svg resizes on viewData load
//   svg.attr('viewBox', `0 0 ${width} ${height}`).
//     attr('preserveAspectRatio', 'xMinYMid').
//     call(resize);

//   d3.select(window).on('resize.' + container.attr('id'), resize);

//   function resize() {
//     const targetWidth = parseInt(container.style('width'));
//     svg.attr('width', targetWidth);
//     svg.attr('height', Math.round(targetWidth / aspect));
//   }


// }