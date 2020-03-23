
    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 150, bottom: 10, left: 50},
      width = 960 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;
    
    
    // append the svg object to the body of the page
    var svg = d3.select("#parallel")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    
    console.log(svg);
    let tierNames = ["Chief","Engine","Medic","Private","Rescue Captain","Truck","Support"]
    let battalions = ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B09", "B10"]
    

    d3.csv("data/datapoints.csv").then(function(data) {
        
        var color = d3.scaleOrdinal()
            .domain(battalions.reverse())
            .range(d3.schemeCategory10);
    
        // Build linear scale for each dimension with min/max value domain
        var y = {}
        for (i in tierNames) {
            let name = tierNames[i];

            let max = d3.max(data.map(d => Number(d[name])));
            // let min = d3.min(data.map(d => Number(d[name])));
            
            max += max/6;
            let min = 0;

            let domain = [0, 1]
            y[name] = d3.scaleLinear()
                .domain([min, max])
                .range([height, 0])
        }

        x = d3.scalePoint()
            .range([0, width])
            .domain(tierNames);
        

        // Highlight Line
        var highlight = function(d){

            let tier = d["Battalion"];

            d3.selectAll(".line")
                .transition().delay(150)
                .style("stroke", "lightgrey")
                .style("opacity", "0.3")

            d3.selectAll("#l" + tier)
                .transition().delay(150)
                .style("stroke", color(tier))
                .style("opacity", "1")

            d3.selectAll(".legend")
                .transition().delay(150)
                .style("fill", "lightgrey")
                .style("opacity", "0.3")

            d3.selectAll("#leg" + tier)
                .transition().delay(150)
                .style("fill", color(tier))
                .style("opacity", "1")


        }
        
        // Undo Higlight Line
        var undoHighlight = function(d){
            d3.selectAll(".line")
                .transition().delay(150)
                .style("stroke", function(d){ return( color(d["Battalion"]))} )
                .style("opacity", "1")
            
            d3.selectAll(".legend")
                .transition().delay(150)
                .style("fill", function(bat){ return( color(bat))} )
                .style("opacity", "1")
        }

        // Highlight Line From Legend
        var highlightLegend = function(d){

            d3.selectAll(".line")
                .transition().delay(150)
                .style("stroke", "lightgrey")
                .style("opacity", "0.3")

            d3.selectAll("#l" + d)
                .transition().delay(150)
                .style("stroke", color(d))
                .style("opacity", "1")

            d3.selectAll(".legend")
                .transition().delay(150)
                .style("fill", "lightgrey")
                .style("opacity", "0.3")

            d3.selectAll("#leg" + d)
                .transition().delay(150)
                .style("fill", color(d))
                .style("opacity", "1")
        }
        
        // Undo Higlight Line From Legend
        var undoHighlightLegend = function(d){
            d3.selectAll(".line")
            .transition().delay(150)
            .style("stroke", function(d){ return( color(d["Battalion"]))} )
            .style("opacity", "1")

            d3.selectAll(".legend")
            .transition().delay(150)
            .style("fill", function(bat){ return( color(bat))} )
            .style("opacity", "1")
        }

        function path(d) {
            // console.log(d)
            return d3.line()(tierNames.map(function(p) { return [x(p), y[p](d[p])]; }));
        }
        
        // Draw the lines
        svg.selectAll("myPath")
            .data(data)
            .enter()
            .append("path")
            .attr("class", "line" ) 
            .attr("id", function (d) { return "l" + d["Battalion"] } )
            .attr("d",  path)
            .style("fill", "none" )
            .style("stroke", function(d){ return( color(d["Battalion"]))} )
            .style("stroke-width", 3)
            .style("opacity", 0.7)
            .on("mouseover", highlight)
            .on("mouseleave", undoHighlight )
        
        // Draw the axes
        svg.selectAll("myAxis")
            .data(tierNames)
            .enter()
            .append("g")
            .attr("class", "axis")
            .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
            .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(6).scale(y[d])); })
            // Title from the different array
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function(d) { return d})
            .style("fill", "black")

        // Legend
        svg.selectAll("rect")
            .data(battalions)
            .enter()
            .append("rect")
                .attr("x", width + 8)
                .attr("y", function(d,i){ return 10 + i * 25}) // 100 is where the first dot appears. 25 is the distance between dots
                .attr("class", "legend" ) 
                .attr("id", function (d) { return "leg" + d } )
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", function(d){ return color(d.toString())})
                .on("mouseover", highlightLegend)
                .on("mouseleave", undoHighlightLegend)

        svg.selectAll("mylabels")
            .data(battalions)
            .enter()
            .append("text")
                .attr("x", width + 19)
                .attr("y", function(d,i){ return 16 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
                .style("fill", "darkgrey")
                .text(function(d){ return d})
                .attr("text-anchor", "right")
                .style("alignment-baseline", "middle")
                .attr("class", "legend-names")

        })