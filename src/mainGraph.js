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
    let margin = { top: 10, right: 30, bottom: 30, left: 30 },
      width = 1500 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;

    // append the svg object to the body of the viewData
    let svg = d3.select("#my_dataviz")
      .append('svg')
      .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
      // .attr('width', width + margin.left + margin.right)
      // .attr('height', height + margin.top + margin.bottom)

      // .call(responsivefy) // Call responsivefy to make the chart responsive
      .append("g")
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    let xAxis = d3.select("#my_dataviz")
      .append("g");

    let line_count = 0;

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

      // year scale
      let xStart = 1500, xEnd = 2000;

      // number of lines per page
      let pageLimit = 20;

      // starting page
      let thisPage = 1;

      //technique filter
      
      // getting first 20 unique authors
      let dataSliced = data.slice(getUniqueAuthorLength(data, pageLimit, thisPage -1), 
      getUniqueAuthorLength(data, pageLimit, thisPage));

      d3.select("#selectButton").on("change", function () {
        // recover the option that has been chosen
        let selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        thisPage = 1;
        dataSliced = updateTechnique(selectedOption)
      })

      // getting unique authors number
      let authors = [...new Set(data.map(d => d.name))];
      let uniqueAuthors = authors.map(function (d) {
        return data.find(function (e) {
          return e.name === d
        })
      })
      
      // setting X axis
      let x = d3.scaleLinear()
        .domain([xStart, xEnd])
        .range([0, width]);

      // setting Y axis
      let y = d3.scaleBand()
        .range([0, data.length])
        .domain(data.map(function (d) { return d.name; }))

      // disabling previous page button when on first page
      if (thisPage == 1) d3.select("#prevPage").attr('disabled', true);

      // paginate
      // dataSliced: data per page
      // data: total data
      // pageLimit: lines per page
      // thisPage: current page number
      paginate(uniqueAuthors, data, pageLimit, thisPage);

      // create chart
      drawGraph(dataSliced);

      // redraw chart
      function updateTechnique(selectedGroup) {
        let techniqueFiltered;
        if (selectedGroup == 'Todos') {
          techniqueFiltered = data;
        } else {
          // Create new data with the selection?
          techniqueFiltered = data.filter(function (d) { return d.technique == selectedGroup })
        }
        let techniqueFilteredSliced = techniqueFiltered.slice(getUniqueAuthorLength(techniqueFiltered, pageLimit, thisPage -1), 
        getUniqueAuthorLength(techniqueFiltered, pageLimit, thisPage));

        console.log(techniqueFiltered);

        // Remove previous data
        d3.selectAll("g > *").remove();

        // paginate
        paginate(techniqueFilteredSliced, techniqueFiltered, pageLimit, thisPage);

        // create chart
        drawGraph(techniqueFilteredSliced);
        
        return techniqueFiltered;
      }

      
      //// ATENÇÃO: PAGINAÇÃO DANDO PROBLEMA NA ÚLTIMA PÁGINA
      // datasliced não reflete tamanho real da página
      // prev/next button logic
      function paginate(dataSliced, data, pageLimit, thisPage) {
        
        console.log(dataSliced);
        if (dataSliced.length <= pageLimit && thisPage == 1) {
          console.log('length < viewData limit');
          d3.select("#nextPage").attr('disabled', true);
          d3.select("#prevPage").attr('disabled', true);
          dataSliced = data.slice(getUniqueAuthorLength(data, pageLimit, thisPage), 
              data.length);
              console.log(dataSliced);
              d3.selectAll("g > *").remove();
              drawGraph(dataSliced);
          
        } else if (dataSliced.length > pageLimit) {
          d3.select("#nextPage").attr('disabled', null);
          d3.select("#nextPage").on("click", function () {
            console.log('cliquei next')
            thisPage++;
            console.log('pagina ' + thisPage);
            d3.select("#prevPage").attr('disabled', null);
            dataSliced = data.slice(getUniqueAuthorLength(data, pageLimit, thisPage -1), 
            getUniqueAuthorLength(data, pageLimit, thisPage));

            console.log(getUniqueAuthorLength(data, pageLimit, thisPage-1 ) + ', ' +
                                  getUniqueAuthorLength(data, pageLimit, thisPage))

            if (dataSliced.length <= pageLimit) {
              console.log('here');
              d3.select("#nextPage").attr('disabled', true);
              dataSliced = data.slice(getUniqueAuthorLength(data, pageLimit, thisPage), 
              data.length);
              console.log(dataSliced);
              d3.selectAll("g > *").remove();
              drawGraph(dataSliced);
            } else {
              d3.select("#nextPage").attr('disabled', null);
              console.log(dataSliced);
              d3.selectAll("g > *").remove();
              drawGraph(dataSliced);
            }
          })

          d3.select("#prevPage").on("click", function () {
            console.log('cliquei prev')
            thisPage--;
            console.log('pagina ' + thisPage);
            if (thisPage > 1) {
              dataSliced = data.slice(getUniqueAuthorLength(data, pageLimit, thisPage -1), 
              getUniqueAuthorLength(data, pageLimit, thisPage));

              console.log(getUniqueAuthorLength(data, pageLimit, thisPage-1 ) + ', ' +
                                  getUniqueAuthorLength(data, pageLimit, thisPage))

              d3.selectAll("g > *").remove();
              console.log(dataSliced);
              drawGraph(dataSliced);
              if (dataSliced.length >= pageLimit) {
                d3.select("#nextPage").attr('disabled', null);
              }
            } else if (thisPage == 1) {
              dataSliced = data.slice(0, getUniqueAuthorLength(data, pageLimit, thisPage));

              console.log(getUniqueAuthorLength(data, pageLimit, thisPage-1 ) + ', ' +
                                  getUniqueAuthorLength(data, pageLimit, thisPage))
                                  
              d3.selectAll("g > *").remove();
              console.log(dataSliced);
              drawGraph(dataSliced);
              d3.select("#prevPage").attr('disabled', true);
            }
          })

        }
      }

      // function to create chart /////////////////////////////// main code here //////////////////////////////
      function drawGraph(data) {
        // X axis
        let x = d3.scaleLinear()
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
        let namesExtent = [1, 50];

        let colorScale = d3.scaleSequential().range(Colors.standardScale()).domain(namesExtent);
        let colorScaleUnknownBirth = d3.scaleSequential().range(Colors.unknownBirthScale()).domain(namesExtent);
        let colorScaleUnknownDeath = d3.scaleSequential().range(Colors.unknownDeathScale()).domain(namesExtent);

        // let group = d3.group(data, d => d.name, d => d.technique);
        // // let valuesGroup = group.values();

        // console.log(group.get("Folwell, Samuel").keys());
        // console.log(d3.extent(group.get(data, d => d.name)))
        // let rangeNames = d3.rollup(data, v => v.length, d => d.name);
        // let lineColor = d3.scaleOrdinal().domain(rangeNames.values).range(["grey","black"])
        // console.log(lineColor)

        // Tooltips
        let tooltip = d3.select("body").append("div")
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

        let authorInfo = d3.select("body").append("div")
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

        let authors = [...new Set(data.map(d => d.name))];

        let uniqueAuthors = authors.map(function (d) {
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
            if (d.birth_year != "Unknown" && d.death_year != "Unknown" && (!d.details.includes('active')) ) 
            { return colorScale(d3.group(data, d => d.name).get(d.name).length) }
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
          .style("stroke-dasharray", ("3, 2"))
          .on("mouseover", function (event, d) {
            d3.select(this).transition()
              .duration(400).attr('stroke', Colors.activeDateLine()).attr("stroke-width", "8px")
            authorInfo.transition()
              .duration(400)
              .style("opacity", .9);
            authorInfo.html(function() {
              if(d.active_date != 'Unknown')
                return "Data de atividade aproximada: <br>" + d.active_date;
              else if (d.birth_year != 'Unknown' && d.death_year != 'Unknown')
                return "Data de atividade aproximada: <br>" + d.birth_year + '-' + d.death_year;
            })
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY) + "px");
            d3.select(this).enter()
              .append("div")
              .attr("x1", function (d) { if (d.active_date != "Unknown" && (d.birth_year == 'Unknown' && d.death_year == 'Unknown')) { return x(d.active_date - 20); 
              } else if ((d.details == 'active' || d.details.includes('active')) && d.birth_year != "Unknown") { 
                return x(d.birth_year)} })
              .attr("x2", function (d) { if (d.active_date != "Unknown" && (d.birth_year == 'Unknown' && d.death_year == 'Unknown')) { return x(d.active_date + 20); 
              } else if ((d.details == 'active' || d.details.includes('active')) && d.death_year != "Unknown") { 
                return x(d.death_year)} })
              .attr("y1", function (d) { return y(d.name); })
              .attr("y2", function (d) { return y(d.name); })
              .style("stroke", function (d) { if (d.details == 'active' || d.details.includes('active')) { return Colors.activeDateLine() } else { return Colors.blank() } })
              .attr("stroke-width", "6px")
          })
          .on("mouseout", function () {
            d3.select(this).transition()
              .duration(400).attr('stroke', Colors.activeDateLine()).attr("stroke-width", "6px")
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
          .text(function (d) { return d.name })
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
          .attr("cx", function (d) { if (d.birth_year != "Unknown" && (d.details != 'active' || !d.details.includes('active'))) { return x(+d.birth_year); } else if (d.death_year != "Unknown" || d.birth_year == "Unknown"
           || d.details == 'active' || d.details.includes('active')) { return } })
          .attr("cy", function (d) { return y(d.name); })
          .attr("r", "6")
          .style("fill", function (d) { if ((d.birth_year == "Unknown" && d.death_year == "Unknown" && d.details != 'None') ||
          (d.birth_year != "Unknown" && d.death_year != "Unknown" && (d.details == 'active' || d.details.includes('active')))) { return "#FFF" } else return dotColor(d.birth_year, Colors.birthCircle()) })
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
          .attr("cx", function (d) { if (d.death_year != "Unknown" && (d.details != 'active' || !d.details.includes('active'))) { return x(+d.death_year); } else if (d.death_year == "Unknown" || d.birth_year != "Unknown" || d.details == 'active' || d.details.includes('active')) { return x(+d.birth_year + 80) } })
          .attr("cy", function (d) { return y(d.name); })
          .attr("r", "6")
          .style("fill", function (d) { if ((d.birth_year == "Unknown" && d.death_year == "Unknown" && d.details != 'None') ||
          (d.birth_year != "Unknown" && d.death_year != "Unknown" && (d.details == 'active' || d.details.includes('active')))) { return "#FFF" } else return dotColor(d.death_year, Colors.deathCircle()) })
          .on("mouseover", function (event, d) {
            mouseover(this, event, "Ano de morte", d.death_year, tooltip)
          })
          .on("mouseout", function () {
            mouseout(this, tooltip)
          });


      }

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

    })

    console.log("LINE COUNT => " + line_count);
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
  if (d.active_date != 'Unknown' && d.birth_year != 'Unknown' && (d.details == 'active' || d.details.includes('active'))) {
    return +d.birth_year;
  } else if (d.active_date == 'Unknown' && d.birth_year != 'Unknown' && (d.details == 'active' || d.details.includes('active'))) {
    return +d.birth_year;
  } else if (d.birth_year == "Unknown" && d.death_year == "Unknown" && d.active_date != "Unknown") {
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
  if (d.active_date != 'Unknown' && d.death_year != 'Unknown' && (d.details == 'active' || d.details.includes('active'))) {
    return +d.death_year;
  } else if (d.active_date == 'Unknown' && d.death_year != 'Unknown' && (d.details == 'active' || d.details.includes('active'))) {
    return +d.death_year;
  } else if (d.birth_year == "Unknown" && d.death_year == "Unknown" && d.active_date != "Unknown") {
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

///////// é necessário alterar a lógica da paginação. 
function getUniqueAuthorLength(data, pageLimit, page) {
  /// LÓGICA QUE VAI INUTILIZAR O INDEX (SE TUDO DER CERTOO)
  //number of lines with author number limited by pageLimit
  let totalLength = 0;
  //data size while reading
  let dataLength = 0;

  // CRITÉRIO DE PARADA
  if (page == 0) return 0;
  
  else{
    // Recursively get the starting point of the loop
    let start = getUniqueAuthorLength(data, pageLimit, page-1)
    // Loop:
    for (let i = start; i < data.length; i++) {
        let thisName = data[i].name;
        let nextName = data[i + 1].name;

        // check if next name is different
        if (thisName != nextName) {
          // this holds the limit of the page
          dataLength++;
        }
        //add to total length 
        totalLength++;
        if (dataLength == pageLimit || totalLength+start > data.length - pageLimit) break;
    }

    return totalLength+start;
  }
}
