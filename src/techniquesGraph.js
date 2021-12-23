import * as d3 from "d3";
export default class TechniquesGraph {
    constructor(data) {
        this.data = data;
        this.x = null;
        this.y = null;
    }

    createGraph() {
        var margin = {top: 10, right: 0, bottom: 30, left: 30},
            width = 1400 - margin.left - margin.right,
            height = 1600 - margin.top - margin.bottom;

        var svg = d3.select("#techniques")
            .append("svg")
            .attr('x', 10)
            .attr('y', 10)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
    
        this.data.then(function(data){
            const techniques = data.map(function(d) { return d.name; });

            var x = d3.scaleBand().domain(techniques).range([0, this.config.width]);
            svg.append("g")
            .call(d3.axisBottom(x))
            
            // var y = d3.scaleBand()
            //     .range([ 0, height ])
            //     .domain(data.map(function(d) { return d.name; }))
            //     .padding(1);

            margin.selectAll('rect')
            .data(this.bars)
            .enter()
            .append('rect')
                .attr('x', d => this.xScale(d.country))
                .attr("width", this.xScale.bandwidth())
                .attr('fill', '#69b3a2')
                // .attr("height", d => this.config.height - this.yScale(0))
                // .attr('y', d => this.yScale(0));
        });
        

    }
}

    // groupByTechnique(data) {
    //     let bars = [];
    
    //     data.reduce(function(res, value) {
    //       if (!res[value.technique]) {
    //         res[value.technique] = { technique: value.technique, emission: 0 };
    //         bars.push(res[value.country])
    //       }
    //       res[value.country].emission += value.emission;
    //       return res;
    //     }, {});
    
    //     return bars;
//     }

//     createScales() {
//         const countries = this.bars.map(d => {
//         return d.country;
//         });

//         let yExtent = d3.extent(this.bars, d => {
//         return d.emission;
//         });

//         this.xScale = d3.scaleBand().domain(countries).range([0, this.config.width]);
//         this.yScale = d3.scaleLinear().domain(yExtent).nice().range([this.config.height, 0]);
//     }

//   createAxis() {
//     let xAxis = d3.axisBottom(this.xScale);

//     let yAxis = d3.axisLeft(this.yScale);

//     this.margins
//       .append("g")
//       .attr("transform", `translate(0,${this.config.height})`)
//       .call(xAxis)
//       .selectAll("text")
//         .attr("transform", "translate(-10,0)rotate(-45)")
//         .style("text-anchor", "end");

//     this.margins
//       .append("g")
//       .call(yAxis);

//     svg.append("text")             
//       .attr("transform",
//             "translate(" + (this.config.width/2 + 100) + " ," + 
//                            (this.config.height + this.config.top + 90) + ")")
//       .style("text-anchor", "middle")
//       .text("Maiores potências econômicas do mundo e o Brasil");

//     svg.append("text")
//       .attr("text-anchor", "end")
//       .attr("y", 6)
//       .attr("x", -200)
//       .attr("dy", ".75em")
//       .attr("transform", "rotate(-90)")
//       .text("Emissão acumulada de CO2");
//   }

//   renderBars() {
//     this.margins.selectAll('rect')
//       .data(this.bars)
//       .enter()
//       .append('rect')
//         .attr('x', d => this.xScale(d.country))
//         .attr("width", this.xScale.bandwidth())
//         .attr('fill', '#69b3a2')
//         .attr("height", d => this.config.height - this.yScale(0))
//         .attr('y', d => this.yScale(0));
//   }

//   renderAnimationOnLoading() {
//     this.margins.selectAll('rect')
//       .transition()
//       .duration(800)
//       .attr("y", d => this.yScale(d.emission))
//       .attr("height", d => this.config.height - this.yScale(d.emission))
//       .delay((d,i) => {return(i*100)})
//   }

