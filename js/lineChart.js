function LineChart() {
    var self = this;


    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
LineChart.prototype.init = function () {


    var self = this;
    self.margin = { top: 15, right: 20, bottom: 30, left: 50 };
    var divLineChart = d3.select("#lineChart").classed("fullView", true);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divLineChart.node().getBoundingClientRect();
    self.svgWidth = 280;
    self.svgHeight = 80;

    //creates svg element within the div
    self.svg = divLineChart.append("svg")
        .attr("width", self.svgWidth)
        .attr("height", self.svgHeight)
        .attr("class", "lineSVG");



    // var x = d3.time.scale()
    //         .range([0, self.svgWidth]);

    // var y = d3.scale.linear()
    //         .range([self.svgHeight, 0]);

    // var xAxis = d3.svg.axis()
    //     .scale(x)
    //     .orient("bottom");

    // var yAxis = d3.svg.axis()
    //     .scale(y)
    //     .orient("left");




};

LineChart.prototype.update = function (disasters) {
    var self = this;

    self.svg.selectAll('path').remove();
    self.svg.selectAll('g').remove();


    var temp = d3.range(1953, 2022, 1);
    var lineData = [];

    temp.forEach(function (e) {
        lineData.push([e])
    })

    disasters.forEach(function (tempDis) {
        lineData.forEach(function (tempYear) {
            if (tempDis.fyDeclared == tempYear[0]) { tempYear.push(tempDis); }
        })
    })

    let yMax = -Infinity;
    // let index = -1;
    lineData.forEach(function (a, i) {
        if (a.length > yMax) {
            yMax = a.length;
            index = i;
        }
    });



    var xScale = d3.scaleLinear()
        .domain(d3.extent(lineData, function (d) { return d[0]; }))
        .range([20, 240]);

    var yScale = d3.scaleLinear().domain([0, yMax])
        .range([self.svgHeight - self.margin.top, self.margin.bottom]);

    var minYear = d3.min(lineData, d => d[0]);
    var maxYear =d3.max(lineData, d => d[0]);
    var numYears = maxYear - minYear;
    var xAxis = d3.axisBottom(xScale).ticks(numYears/10).tickFormat(d3.format("d")).tickSizeOuter(0);

    // const xAxis = d3.axisBottom(xScale)
    //     .ticks(5);

    var yAxis = d3.axisLeft(yScale).ticks(2);

    self.svg.append("g")
        .attr("class", "axis x-axis")
        .style("font", "8px times")
        .attr("transform", "translate(0," + (60) + ")")
        .call(xAxis);

        self.svg.append("g").attr("class", "axis y-axis")
        .attr("transform", "translate(" +  (20) + "," + (-5) + ")")
        .style("font", "8px times").call(yAxis);



    var line = d3.line()
        // .curve(d3.curveBasis)
        .x(function (d) { return xScale(d[0]); })
        .y(function (d) { return -5 + yScale(d.length - 1); });


    self.svg.append("path")
        .datum(lineData)
        .attr("stroke", "white")
        .attr("stroke-width", "1.5")
        .attr("fill", "none")
        .attr("d", line)
}

