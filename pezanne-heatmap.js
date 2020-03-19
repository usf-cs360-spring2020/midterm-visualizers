// container for configuration parameters. Modified version of code by prof. Sophie Engle
var config = {};
config.svg = {
    width: 960,
    height: 430
};

config.margin = { top: 90, right: 20, bottom: 10, left: 60 };

config.plot = {
    width: config.svg.width - config.margin.right - config.margin.left,
    height: config.svg.height - config.margin.top - config.margin.bottom
};

config.legend = {
    width: 200,
    height: 15
};


var itemSize = 30,
    cellSize = itemSize - 1,
    margin = { top: 60, right: 20, bottom: 20, left: 50 };

d3.select("rect.cell")


d3.csv('data/sffd-calls-hourly.csv').then(data => {
    // console.log(data);

    time = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p', '12p'];

    var rows = data.map(d => {
        var row = {};
        row.hour = +d.hour;
        row.battalion = d.battalion;
        row.daily_avg = +d.daily_avg;
        row.num_records = +d.num_records;

        return row;
    });
    var x_elements = d3.set(rows.map(d => d.hour)).values();
    var y_elements = d3.set(rows.map(d => d.battalion)).values();
    x_elements.sort((a, b) => a - b);
    y_elements.sort();


    var xScale = d3.scaleBand()
        .domain(x_elements)
        .range([0, x_elements.length * itemSize]);

    var xAxis = d3.axisTop(xScale)
        .tickSizeOuter(0)
        .tickFormat(d => time[d]);

    var yScale = d3.scaleBand()
        .domain(y_elements)
        .range([0, y_elements.length * itemSize]);

    var yAxis = d3.axisLeft(yScale)
        .tickSizeOuter(0)
        .tickFormat(d => d);


    var colorScale = d3.scaleSequential(d3.interpolateYlOrRd);
    // hardcoded range
    colorScale.domain(d3.extent([3, 657]));

    /* helper method to make translating easier */
    var translate = (x, y) => "translate(" + x + "," + y + ")";

    var drawTitle = function () {
        var title = svg.append("text")
            .text("SFFD Service Calls Handled Hourly (2019)")
            .attr("id", "title")
            .attr("x", 0)
            .attr("y", 0)
            .attr("dx", 0)
            .attr("dy", 0)
            .attr("text-anchor", "left")
            .attr("font-size", "18px");
        title.attr("transform", translate(0, -60));
    };

    var drawAxisTitles = () => {
        const yGroup = svg.append('g');
      
        // set the position by translating the group
        yGroup.attr('transform', translate(-55, 160));
      
        const yTitle = yGroup.append('text')
          .attr('class', 'axis-title')
          .text('Battalion');
      
        // keep x, y at 0, 0 for rotation around the origin
        yTitle.attr('x', 0);
        yTitle.attr('y', 0);
      
        yTitle.attr('dy', '1.75ex');
        yTitle.attr('text-anchor', 'middle');
        yTitle.attr('transform', 'rotate(-90)');
        yTitle.attr('font-size', '15px');
        yTitle.attr('font-weight', '500');

        const xGroup = svg.append('g');
        xGroup.attr('transform', translate(400, -45));

        const xTitle = xGroup.append('text')
          .attr('class', 'axis-title')
          .text('Incident Time');

          // keep x, y at 0, 0 for rotation around the origin
          xTitle.attr('x', 0);
          xTitle.attr('y', 0);
      
          xTitle.attr('dy', '1.75ex');
          xTitle.attr('text-anchor', 'middle');
          xTitle.attr('font-size', '15px');
          xTitle.attr('font-weight', '500');
      }

    var drawLegend = function () {
        // our color scale doesn't have an invert() function
        // and we need some way of mapping 0% and 100% to our domain
        // so we'll create a scale to reverse that mapping
        var percentScale = d3.scaleLinear()
            .domain([0, 100])
            .range(colorScale.domain());

        // setup gradient for legend
        // http://bl.ocks.org/mbostock/1086421
        svg.append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .selectAll("stop")
            .data(d3.ticks(0, 100, 5))
            .enter()
            .append("stop")
            .attr("offset", function (d) {
                return d + "%";
            })
            .attr("stop-color", function (d) {
                return colorScale(percentScale(d));
            });

        // create group for legend elements
        // will translate it to the appropriate location later
        var legend = svg.append("g")
            .attr("id", "legend")
            .attr("transform", translate(520, -55));

        // draw the color rectangle with gradient
        legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", config.legend.width)
            .attr("height", config.legend.height)
            .attr("fill", "url(#gradient)");

        // create another scale so we can easily draw an axis on the color box
        var legendScale = d3.scaleLinear()
            .domain(colorScale.domain())
            .range([0, config.legend.width]);

        // use an axis generator to draw axis under color box
        var legendAxis = d3.axisBottom(legendScale)
            // https://github.com/d3/d3-format
            .tickFormat(d3.format(",.0s"))
            .tickValues(colorScale.domain())
            .tickSize(4);

        // draw it!
        legend.append("g")
            .attr("id", "color-axis")
            .attr("class", "legend")
            .attr("transform", translate(0, config.legend.height))
            .call(legendAxis)

        // calculate how much to shift legend group to fit in our plot area nicely
        var xshift = 520;
        var yshift = -55;
        legend.attr("transform", translate(xshift, yshift));
    };

    var svg = d3.select('.heatmap')
        .append("svg")
        .attr("width", config.plot.width + config.margin.left + config.margin.right)
        .attr("height", config.plot.height + config.margin.top + config.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + config.margin.left + "," + config.margin.top + ")");

    var cells = svg.selectAll('rect')
        .data(rows)
        .enter().append('g').append('rect')
        .attr('class', 'cell')
        .attr('width', cellSize)
        .attr('height', cellSize)
        .attr('y', d => yScale(d.battalion))
        .attr('x', d => xScale(d.hour))
        .attr('fill', d => colorScale(d.num_records))
        .on("mouseover", (d) => {
            // display table
            let me = d3.select(this);
            let div = d3.select("body").append("div");
            div.attr("id", "details");
            div.attr("class", "tooltip");
            let rows = div.append("table")
                .selectAll("tr")
                .data(Object.keys(d))
                .enter()
                .append("tr");

            var cols_map = { 'battalion': 'Battalion', 'hour': 'Time of Call', 'daily_avg': 'Daily Avg. no. of Calls', 'num_records': 'Total no. of Calls' };
            rows.append("th").text(key => cols_map[key]);
            // format time and avg
            rows.append("td").text(key => key === 'daily_avg' ? Math.round(d[key] * 100) / 100 : key === 'hour' ? time[d[key]] + 'm' : d[key]);

            // show what we interacted with
            d3.select('code').text("hover: " + d.letter);

            // highlight
            cells.filter(e => (d.battalion > e.battalion && d.hour > e.hour) || d.battalion < e.battalion || d.hour < e.hour).transition('.01').style("opacity", "0.2");
            // show what we interacted with
            d3.select('code').text("brush: " + d.type);

            cells.filter(e => d.battalion === e.battalion && d.hour === e.hour)
                .raise() // bring to front
                .style("stroke", "grey")
                .style("stroke-linejoin", "round")
                .style("stroke-width", 2);

        })
        .on("mousemove", (d) => {
            let div = d3.select("div#details");

            // get height of tooltip
            let bbox = div.node().getBoundingClientRect();
            div.style("left", (d3.event.pageX + 15) + "px")
            div.style("top", (d3.event.pageY - bbox.height - 10) + "px"); 1
        })
        .on("mouseout", (d) => {
            // table remove
            d3.selectAll("div#details").remove();
            d3.select('code').text("hover: none");

            // highlight remove
            cells.transition('.01').style("opacity", "1")


            cells.filter(e => d.battalion === e.battalion && d.hour === e.hour).style("stroke-width", "0");
            d3.select('code').text("brush: none");
        });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .selectAll('text')
        .attr('font-weight', 'normal');

    svg.append("g")
        .attr("class", "x axis")
        .call(xAxis)
        .selectAll('text')
        .attr('font-weight', 'normal')
        .style("text-anchor", "start")
        .attr("dx", ".8em")
        .attr("dy", ".5em")
        .attr("transform", "rotate(-35)");
    drawAxisTitles();
    drawTitle();
    drawLegend();
});
