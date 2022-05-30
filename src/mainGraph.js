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
      .append("g")
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    let xAxis = d3.select("#my_dataviz")
      .append("g");

    let line_count = 0;

    // asynchronous function to draw graph based on csv
    this.data.then(function (data) {
      
      // set of techniques
      const allTechniqueGroup = new Set(data.map(d => d.technique.trim()));
      allTechniqueGroup.add('Todos');

      // set of mediums
      const allMediumGroup = new Set(data.map(d => d.medium.trim()));
      allMediumGroup.add('Todos');

      // create legend
      let leg = d3.select("#legend")
      legendTitle(leg, 15);
      subtitleLessMore(leg, 35);
      horizontalGradientLegend(leg, "#colorLegend1","#ffe0ff","#0000ff",37,false);
      legendTextSmall(leg, "Ano de nascimento e morte conhecidos", 57)
      horizontalGradientLegend(leg, "#colorLegend2","#ffb7ce","#de425b",67,false);
      legendTextSmall(leg, "Apenas ano de morte conhecido", 87);
      horizontalGradientLegend(leg, "#colorLegend3","#b8d0e6","#0692cf",97,false);
      legendTextSmall(leg, "Apenas ano de nascimento conhecido", 117);
      horizontalGradientLegend(leg, "#colorLegend4","#b8d0e6","#0692cf",132,true);
      legendTextSmall(leg, "Data aproximada de atividade conhecida", 147);
      
      // create dropdown menu of techniques
      d3.select("#selectTechnique")
        .selectAll('myOptions')
        .data(allTechniqueGroup)
        .enter()
        .append('option')
        .property("selected", "Todos")
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button

      // create dropdown menu of techniques
      d3.select("#selectMedium")
        .selectAll('myOptions')
        .data(allMediumGroup)
        .enter()
        .append('option')
        .property("selected", "Todos")
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button
        .attr("width", "60px")

      // year scale
      let xStart = 1500, xEnd = 2000;

      // number of lines per page
      let pageLimit = 20;

      // starting page
      let thisPage = 1;
      document.getElementById("thisPage").innerHTML = thisPage;
      document.getElementById("selectedFilter").innerHTML = "Todos";
      
      // getting first 20 unique authors
      let dataSliced = data.slice(getUniqueAuthorLength(data, pageLimit, thisPage -1), 
      getUniqueAuthorLength(data, pageLimit, thisPage));

      // select technique logic
      d3.select("#selectTechnique").on("change", function () {
        // recover the option that has been chosen
        let selectedOption = d3.select(this).property("value")
        if(selectedOption == "Todos") {
          document.getElementById("selectedFilter").innerHTML = "Todos";
        } else {
          document.getElementById("selectedFilter").innerHTML = "Técnica: "+ selectedOption ;
          document.getElementById("selectMedium").selectedIndex = allMediumGroup.size -1;
        }
        // run the updateChart function with this selected option
        thisPage = 1;
        document.getElementById("thisPage").innerHTML = thisPage;
        dataSliced = updateTechnique(selectedOption)
        
      })

      // select medium logic
      d3.select("#selectMedium").on("change", function () {
        // recover the option that has been chosen
        let selectedOption = d3.select(this).property("value")
        if(selectedOption == "Todos") {
          document.getElementById("selectedFilter").innerHTML = "Todos";
        } else {
          document.getElementById("selectedFilter").innerHTML = "Meio: "+ selectedOption ;
          document.getElementById("selectTechnique").selectedIndex = allTechniqueGroup.size -1;
        }
        // run the updateChart function with this selected option
        thisPage = 1;
        document.getElementById("thisPage").innerHTML = thisPage;
        dataSliced = updateMedium(selectedOption)
        
      })

      // getting unique authors number
      let authors = [...new Set(data.map(d => d.name))];
      let uniqueAuthors = authors.map(function (d) {
        return data.find(function (e) {
          return e.name === d
        })
      })
      
      // auxiliary variables for pagination
      let uniqueAuthorsSize = uniqueAuthors.length;
      let lastPageLimit = uniqueAuthorsSize % pageLimit;
      let isLastPage = false;

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

      // redraw chart when update technique
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

        // Remove previous data
        d3.selectAll("g > *").remove();

        // paginate
        paginate(techniqueFilteredSliced, techniqueFiltered, pageLimit, thisPage);

        // create chart
        drawGraph(techniqueFilteredSliced);
        
        return techniqueFiltered;
      }

      // redraw chart when update medium
      function updateMedium(selectedGroup) {
        let mediumFiltered;
        if (selectedGroup == 'Todos') {
          mediumFiltered = data;
        } else {
          // Create new data with the selection?
          mediumFiltered = data.filter(function (d) { return d.medium == selectedGroup })
        }
        let mediumFilteredSliced = mediumFiltered.slice(getUniqueAuthorLength(mediumFiltered, pageLimit, thisPage -1), 
        getUniqueAuthorLength(mediumFiltered, pageLimit, thisPage));

        // Remove previous data
        d3.selectAll("g > *").remove();

        // paginate
        paginate(mediumFilteredSliced, mediumFiltered, pageLimit, thisPage);

        // create chart
        drawGraph(mediumFilteredSliced);
        
        return mediumFilteredSliced;
      }
      
      // pagination logic
      function paginate(dataSliced, data, pageLimit, thisPage) {
        console.log(dataSliced);
        if (dataSliced.length <= pageLimit && thisPage == 1) {
          console.log('length < viewData limit');
          d3.select("#nextPage").attr('disabled', true);
          d3.select("#prevPage").attr('disabled', true);
          dataSliced = data.slice(getUniqueAuthorLength(data, pageLimit, thisPage), 
              data.length);
              console.log(dataSliced);
          
        } else if (dataSliced.length > pageLimit) {
          d3.select("#nextPage").attr('disabled', null);
          d3.select("#nextPage").on("click", function () {
            console.log('cliquei next')
            thisPage++;
            document.getElementById("thisPage").innerHTML = thisPage;
            console.log('pagina ' + thisPage);
            d3.select("#prevPage").attr('disabled', null);
            dataSliced = data.slice(getUniqueAuthorLength(data, pageLimit, thisPage -1), 
            getUniqueAuthorLength(data, pageLimit, thisPage));

            console.log(getUniqueAuthorLength(data, pageLimit, thisPage-1) + ', ' +
                                  getUniqueAuthorLength(data, pageLimit, thisPage))

            if (isLastPage) {
              console.log('last page');
              d3.select("#nextPage").attr('disabled', true);
              dataSliced = data.slice(getUniqueAuthorLength(data, pageLimit, thisPage-1), 
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
            document.getElementById("thisPage").innerHTML = thisPage;
            console.log('pagina ' + thisPage);
            if (thisPage > 1) {
              dataSliced = data.slice(getUniqueAuthorLength(data, pageLimit, thisPage-1), 
              getUniqueAuthorLength(data, pageLimit, thisPage));

              console.log(getUniqueAuthorLength(data, pageLimit, thisPage-1) + ', ' +
                                  getUniqueAuthorLength(data, pageLimit, thisPage))

              d3.selectAll("g > *").remove();
              console.log(dataSliced);
              drawGraph(dataSliced);
              if (dataSliced.length >= pageLimit) {
                d3.select("#nextPage").attr('disabled', null);
              }
            } else if (thisPage == 1) {
              document.getElementById("thisPage").innerHTML = thisPage;
              dataSliced = data.slice(0, getUniqueAuthorLength(data, pageLimit, thisPage));

              console.log(getUniqueAuthorLength(data, pageLimit, thisPage-1) + ', ' +
                                  getUniqueAuthorLength(data, pageLimit, thisPage))
                                  
              d3.selectAll("g > *").remove();
              console.log(dataSliced);
              drawGraph(dataSliced);
              d3.select("#prevPage").attr('disabled', true);
              d3.select("#nextPage").attr('disabled', null);
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

        // color logic
        let namesExtent = [1, 50];
        let colorScale = d3.scaleSequential().range(Colors.standardScale()).domain(namesExtent);
        let colorScaleUnknownBirth = d3.scaleSequential().range(Colors.unknownBirthScale()).domain(namesExtent);
        let colorScaleUnknownDeath = d3.scaleSequential().range(Colors.unknownDeathScale()).domain(namesExtent);

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
          .style("height", "auto")
          .style("padding", "8px")
          .style("font", "12px sans-serif")
          .style("pointer-events", "none")
          .style("background", "white")
          .style("border", "1px")
          .style("border-style", "solid")
          .style("border-radius", "8px")
          .style("border-color", "black");

        let authors = [...new Set(data.map(d => d.name))];

        // getting unique author number to create graph
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
            if (d.birth_year != "Unknown" && d.death_year != "Unknown" && (!d.details.includes('active') && !d.details.includes('approximately')) ) 
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
          .attr("stroke", function (d) { if (d.birth_year == "Unknown") { return colorScaleUnknownBirth(d3.group(data, d => d.name).get(d.name).length) } else if (d.death_year == "Unknown") { return colorScaleUnknownDeath(d3.group(data, d => d.name).get(d.name).length) } else if (d.birth_year == 'Unknown' && d.death_year == 'Unknown') return "#999"})
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
              } else if ((d.details == 'active' || d.details.includes('active')) ||(d.details == 'approximately' || d.details.includes('approximately')) && d.birth_year != "Unknown") { 
                return x(d.birth_year)} })
              .attr("x2", function (d) { if (d.active_date != "Unknown" && (d.birth_year == 'Unknown' && d.death_year == 'Unknown')) { return x(d.active_date + 20); 
              } else if ((d.details == 'active' || d.details.includes('active')) ||(d.details == 'approximately' || d.details.includes('approximately')) && d.death_year != "Unknown") { 
                return x(d.death_year)} })
              .attr("y1", function (d) { return y(d.name); })
              .attr("y2", function (d) { return y(d.name); })
              .style("stroke", function (d) { if ((d.details == 'active' || d.details.includes('active')) || (d.details == 'approximately' || d.details.includes('approximately'))) {
                 return Colors.activeDateLine() } else { return Colors.blank() } })
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
              .style("opacity", .9)
            authorInfo.html(function () {
              if (d.active_date == "Unknown") {
                return d.name + ", " + d.birth_year + "-" + d.death_year + '<br> Técnica(s) de pintura: ' + Array.from(d3.group(data, d => d.name, d => d.technique).get(d.name).keys()) + 
                '<br> Meio(s) de pintura: ' + Array.from(d3.group(data, d => d.name, d => d.medium).get(d.name).keys()) +
                '<br> Número de pinturas (filtro): ' + d3.group(data, d => d.name).get(d.name).length
              } else if (d.birth_year == "Unknown" || d.death_year == "Unknown") {
                return d.name + "<br>" + "Data de atividade: " + d.active_date + '<br> Técnica(s) de pintura: ' + Array.from(d3.group(data, d => d.name, d => d.technique).get(d.name).keys()) +
                '<br> Meio(s) de pintura: ' + Array.from(d3.group(data, d => d.name, d => d.medium).get(d.name).keys()) + '<br> Número de pinturas (filtro): ' + d3.group(data, d => d.name).get(d.name).length
              } else {
                return d.name + ", " + d.birth_year + "-" + d.death_year + '<br> Técnica(s) de pintura: ' + Array.from(d3.group(data, d => d.name, d => d.technique).get(d.name).keys()) +
                '<br> Meio(s) de pintura: ' + Array.from(d3.group(data, d => d.name, d => d.medium).get(d.name).keys()) + '<br> Número de pinturas (filtro): ' + d3.group(data, d => d.name).get(d.name).length
              }
            }

            )
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY - 28) + "px")
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
          .attr("cx", function (d) { if (d.birth_year != "Unknown" && ((d.details != 'active' || !d.details.includes('active')) ||(d.details != 'approximately' || !d.details.includes('approximately')))) { return x(+d.birth_year); } else if (d.death_year != "Unknown" || d.birth_year == "Unknown"
           || ((d.details == 'active' || d.details.includes('active')) ||(d.details == 'approximately' || d.details.includes('approximately')))) { return } })
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
          .attr("cx", function (d) { if (d.death_year != "Unknown" && ((d.details != 'active' || !d.details.includes('active')) ||(d.details != 'approximately' || !d.details.includes('approximately')))) { return x(+d.death_year); } else if (d.death_year == "Unknown" || d.birth_year != "Unknown"
          || ((d.details == 'active' || d.details.includes('active')) ||(d.details == 'approximately' || d.details.includes('approximately')))) { return x(+d.birth_year + 80) } })
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

      // debug
      console.log('TAMANHO ->>> '+ data.length);

      // pagination helper logic
      function getUniqueAuthorLength(data, pageLimit, page) {
        //number of lines with author number limited by pageLimit
        let totalLength = 0;
        //data size while reading
        let dataLength = 0;
        // CRITÉRIO DE PARADA
        if (page == 0) return 0;
        if (data.length <= pageLimit) return pageLimit;
        
        else{
          // Recursively get the starting point of the loop
          let start = getUniqueAuthorLength(data, pageLimit, page-1)
          // Loop:
          for (let i = start; i < data.length + 1; i++) {
              let thisName = data[i].name;
              let nextName = data[i + 1].name;

              // check if next name is different
              if (thisName != nextName) {
                // this holds the limit of the page
                dataLength++;
                // uniqueAuthorsSize++;
              }
              //add to total length 
              totalLength++;
              if(dataLength == pageLimit) {
                isLastPage = false;
                return totalLength+start;
              } else if (totalLength + start >= data.length - lastPageLimit) {
                isLastPage = true;
                return data.length;
              }
              // if (dataLength == pageLimit || totalLength + start + dataLength >= data.length - pageLimit) return totalLength+start;
          } //totalLength + start + dataLength >= data.length - pageLimit
          return;
        }
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

    // debug
    console.log("LINE COUNT => " + line_count);
  }
}
/////////////////////////// auxiliary functions start ////////////////////////////
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
  if (d.birth_year != 'Unknown' && d.death_year != 'Unknown' && (d.details == 'active' || d.details.includes('active') || d.details == 'approximately' || d.details.includes('approximately'))) {
    return +d.birth_year;
  } else if (d.active_date == 'Unknown' && d.birth_year != 'Unknown' && (d.details == 'active' || d.details.includes('active') || d.details == 'approximately' || d.details.includes('approximately'))) {
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
  if (d.death_year != 'Unknown' && d.birth_year != 'Unknown' && (d.details == 'active' || d.details.includes('active') || d.details == 'approximately' || d.details.includes('approximately'))) {
    return +d.death_year;
  } else if (d.active_date == 'Unknown' && d.death_year != 'Unknown' && (d.details == 'active' || d.details.includes('active') || d.details == 'approximately' || d.details.includes('approximately'))) {
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

function horizontalGradientLegend(leg, id, color1, color2, height, isActive) {
  ////////// LEGEND CODE START //////////////////
  if (!isActive) {
    //Append a linearGradient element to the defs and give it a unique id
    let linearGradient = leg.append("linearGradient").attr("id",id);

    //Horizontal gradient
    linearGradient
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

    //Set the color for the start (0%)
    linearGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", color1); //light blue

    //Set the color for the end (100%)
    linearGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", color2); //dark blue

    //Draw the rectangle and fill with gradient
    leg.append("rect")
    .attr("width", 200)
    .attr("height", 10)
    .attr('y',height)
    .style("fill", "url(#"+id+")")
    .style("paddingOuter",1)

    ///////////// LEGEND CODE END ////////////////
  } else {
    console.log('Entrou else')
    leg.append("line")
    .attr("x1", 0)
    .attr("x2", 200)
    .attr("width", 200)
    .attr("y1", height)
    .attr("y2", height)
    .attr("stroke", function () { return Colors.activeDateLine() })
    .style("stroke-dasharray", ("3, 2"))
    .attr("stroke-width", "10px")
    // leg.append("rect")
    // .attr("stroke-width", "6px")
    // .style("stroke-dasharray", ("3, 2"))
  }
  
}

function subtitleLessMore(leg, height) {
  leg.append("text")
    .attr("x", 0)
    .attr("y", height)
    .style("text-anchor", "left")
    .style("font-size", "10px")
    .style("fill","#4F4F4F")
    .text("Menos pinturas");

  leg.append("text")
    .attr("x", 140)
    .attr("y", height)
    .style("text-anchor", "left")
    .style("font-size", "10px")
    .style("fill","#4F4F4F")
    .text("Mais pinturas");
}

function legendTextSmall(leg, text, height) {
  leg.append("text")
    .attr("x", 0)
    .attr("y", height)
    .style("text-anchor", "left")
    .style("font-size", "10px")
    .style("fill","#4F4F4F")
    .text(text)
}

function legendTitle(leg, height) {
  leg.append("text")
    .attr("x", 0)
    .attr("y", height)
    .style("text-anchor", "left")
    .style("font-size", "20px")
    .style("fill","#4F4F4F")
    .text('Legenda')
}