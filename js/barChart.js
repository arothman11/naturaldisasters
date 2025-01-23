function BarChart(data) {
    var self = this;
    self.data = data;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
BarChart.prototype.init = function () {

    var self = this;
    self.margin = { top: 15, right: 20, bottom: 30, left: 50 };
    // width = 460 - margin.left - margin.right,
    // height = 400 - margin.top - margin.bottom;
    var divBarChart = d3.select("#barChart").classed("fullView", true);

    self.svgBounds = divBarChart.node().getBoundingClientRect();

    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right - 25;
    self.svgHeight = 55;

    self.svg = divBarChart.append("svg")
        .attr("width", self.svgWidth) 
        .attr("class", "barSVG");



    //Gets access to the div element created for this chart from HTML




    // self.svg = divBarChart.append("svg")
    //     .attr("width", self.svgWidth)
    // .attr("height", self.svgHeight)


};

BarChart.prototype.update = function (disasters, color) {
    var self = this;
    self.disasters = disasters;

    self.svg.selectAll("rect").remove();
    self.svg.selectAll('text').remove();


    var popupMap = new Map();

    for (i = 0; i < self.disasters.length; i++) {
        if (popupMap.has(self.disasters[[i]].incidentType) == true) {
            popupMap.set(self.disasters[[i]].incidentType, popupMap.get(self.disasters[[i]].incidentType) + 1);
        }
        else {
            popupMap.set(self.disasters[[i]].incidentType, 1);
        }
    }

    console.log(popupMap);
    self.svg.attr("height", popupMap.size * 25 + 20);
    // console.log(disasters);
    var x = d3.scaleLinear()
        .domain([0, d3.max(popupMap, function (d) { return d[1]; })])
        .range([0, self.svgWidth - 100]);



    var y = d3.scaleBand()
        .range([0, popupMap.size * 25 + 20])
        .domain(popupMap.keys())
        .padding(.1);


    const yAxis = d3.axisLeft(y).tickSizeOuter(0);
    // const xAxis = d3.axisTop(x).ticks(5).tickSizeOuter(0);

    // self.svg.append("g")
    // .attr("transform", "translate(60," + self.svgHeight + ")")
    // .call(xAxis)
    // .selectAll("text")
    //   .style("text-anchor", "middle");






    let barchart = self.svg.selectAll("rect")
        .data(popupMap)

    var titles = self.svg.selectAll('text').data(popupMap);
   

    barchart.enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", function (d, i) {
            return (i * 30 + 5)

        })
        .attr("width", function (d) {
            return x(d[1]);
        })
        .attr("height", 25)
        .attr("fill", function () {
            return color;
        })
        .on("mouseover", function () {
            d3.select(this)
                .attr("opacity", "0.7");
        })
        .on("mouseout", function () {
            d3.select(this).attr("opacity", "1")
        })

        .attr("transform", "translate(100,0)")


    self.svg.append("g")
        .attr("transform", function () {
            console.log(popupMap.size);
            if (popupMap.size <= 1) {
                return "translate(100,-10)"
            }
            else {
                return "translate(100,0)"
            }
        })
        .attr("id", "yAxisG")
        .call(yAxis);
        titles.enter().append("text")
        .attr('x', 65).attr('y', function(d, i){
            return (i * 30 + 22);
        }).text(function(d){ return d[1]})
        .style("font-weight", "bold")
        .attr("transform", "translate(40,0)");

    d3.select("#barChart").append("hr");


}
