function YearChart(data, _myEventHandler) {
    var self = this;

    // self.mapVis = mapVis;
    // self.popupBar = popupBar;
    self.data = data;
   // self.selectedYears = selectedYears;
    self.myEventHandler = _myEventHandler;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
YearChart.prototype.init = function () {

    var self = this;
    self.margin = { top: 15, right: 20, bottom: 30, left: 10 };
    var divyearChart = d3.select("#yearChart").classed("fullView", true);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divyearChart.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 55;

    //creates svg element within the div
    self.svg = divyearChart.append("svg")
        .attr("width", self.svgWidth)
        .attr("height", self.svgHeight)


    //disasters

};

YearChart.prototype.update = function (disasters) {
    
    var self = this;
    self.disasters = disasters;
    self.svg.selectAll('text').remove();

    var selectedYears = [];
    var yearXs = [];
    var allYears = d3.range(1953, 2021, 1);
    var firstYear = allYears[0];
    var lastYear = allYears[allYears.length - 1];
    //var allYears = d3.range(firstYear, lastYear + 1);
    var xScale = d3.scaleLinear().domain([firstYear, lastYear])
        .range([self.margin.left, self.svgWidth - self.margin.right]);
    var yearBars = self.svg.selectAll('rect').data(allYears);
    var rectWidth = self.svgWidth / allYears.length;
    yearBars.enter().append('rect')
        .attr('class', 'yearChartBars')
        .attr('height', 10)
        .attr('width', rectWidth)
        .attr('fill', 'white')
        .attr('x', function (d) {
            yearXs.push([xScale(d), xScale(d) + rectWidth, d])

            return xScale(d);
        })
        .attr('opacity', '50%')
        .attr('y', 5);

    // function brushStart({ selection }) {
    //     // brushedStates.push(selection);
    //     if (selection === null) {
    //         self.svg.selectAll('.yearChartBrushLabel').remove();
    //         $(self.myEventHandler).trigger("selectionChanged", [2021]);
    //     }
    //     brushEnd({ selection });
    // }


    function brushed({ selection }) {
        if (selection !== null) {
            self.svg.selectAll('.yearChartBrushLabel').remove();
            var x1 = selection[0];
            var x2 = selection[1];

            var selectedYears = yearXs.filter(year => (year[0] > x1 && year[0] < x2) || (year[1] > x1 && year[1] < x2) || (year[0] < x1 && year[1] > x2));
            for(var i = 0; i < selectedYears.length; i++){
                selectedYears[i] = selectedYears[i][2];
            }
            if (selectedYears[0] != selectedYears[selectedYears.length - 1]) {
                d3.select('#showingYears')
                .text("Showing Years: " + selectedYears[0] + ' - ' + selectedYears[selectedYears.length - 1]);
            }else{
                self.svg.append('text')
                .attr('class', 'yearChartBrushLabel')
                .attr('x', selection[0])
                .attr('y', 50)
                .attr('z-index', 2)
                .attr('fill', 'white')
                .text(selectedYears[0]);
            }
        } else {
            // self.svg.selectAll('.yearChartBrushLabel').remove();
            selectedYears = d3.range(1953, 2022, 1);
            d3.select('#showingYears').text("Showing Years: All");
        }
        $(self.myEventHandler).trigger("selectionChanged", [selectedYears]);

        //self.selectedYears = selectedYears;

        //HERE IS WEHRE THE YEARS DATA IS, YOU CAN USE THIS TO UPDATE OR PUSH ANY OF THE VISUALIZATIONS, IT'S JUST AN ARRAY FULL OF THE YEARS
        //console.log(selectedYears);


    }

    var brush = d3.brushX()                     // Add the brush feature using the d3.brush function
        .extent([[xScale(allYears[0] - 1), 0], [self.svgWidth - self.margin.right + 3 + rectWidth, 100]])
        .on('end', brushed)

    self.svg.call(brush);

    self.svg.append('text').attr('class', 'yearChartLabel')
        .attr('x', self.margin.left)
        .attr('y', 50)
        .attr('z-index', 2)
        .attr('fill', 'white')
        .text(firstYear);
    self.svg.append('text').attr('class', 'yearChartLabel')
        .attr('x', self.svgWidth - self.margin.right - 20)
        .attr('y', 50)
        .attr('z-index', 2)
        .attr('fill', 'white')
        .text(lastYear);


    yearBars.exit().remove();
}

// YearChart.prototype.onSelectionChange = function(selectionStart, selectionEnd){

// }