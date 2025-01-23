// const moment = require("moment");

function PopupBar(disasters, map) {
    var self = this;
    self.disasters = disasters;
    self.init();
    globalDisasters = disasters;
    self.currDisasters = disasters;
    self.map = map;
    self.currentCounty = "";
};
/**
 * Initializes the svg elements required for this chart
 */
PopupBar.prototype.init = function () {
    var self = this;
    self.margin = { top: 10, right: 20, bottom: 30, left: 50 };
    var divPopupBar = d3.select("#popupBar").classed("fullView", true);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divPopupBar.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 100;

    var searchBar = document.getElementById('search');
    var popupMap = new Map();


    document.getElementById("compareButton").addEventListener("click", () => {
        document.getElementById("compareBar").style.display = "inline";
        document.getElementById("compareLoad").style.visibility = "hidden";

        compareSearch = document.getElementById("compareSearch")
        d3.select("#compareBar").classed("slideOut", false);
        d3.select("#compareBar").classed("slideIn", true);


        compareSearch.addEventListener('keypress', function (event) {
            if (event.key == "Enter") {
                self.compareCounties(event, self.disasters);
            }
        });

        x = document.getElementById("closeCompare");
        x.addEventListener("click", () => {
            d3.select("#compareBar").classed("slideIn", false);
            d3.select("#compareBar").classed("slideOut", true);

            document.getElementById("compareBar").style.display = "none";
        });

    })

    searchBar.addEventListener('keypress', function (event) {
        popupMap.clear();
        if (event.key == "Enter") {
            if (event.keyCode === 13) {

                var userInput = document.getElementById('search').value;
                if (userInput.length == 5) {
                    var apikey = '23f38b80-44ba-11ec-9cd8-5f429cc30f85';
                    var json = [];
                    var results = [];
                    var county;
                    var userInput = document.getElementById('search').value;

                    var url = 'https://app.zipcodebase.com/api/v1/search?apikey=' + apikey + '&country=us' + '&codes=' + userInput;
                    var xhttp = new XMLHttpRequest();

                    xhttp.onreadystatechange = function () {
                        if (this.readyState == 1) {
                            document.getElementById('legend').style.visibility = "hidden";
                            document.getElementById('yearChart').style.visibility = "hidden";
                            document.getElementById('mapVis').style.visibility = "hidden";
                            document.getElementById('popupText').style.visibility = "hidden";
                            document.getElementById('searchLoad').style.visibility = "visible";
                            document.getElementById('mapLoad').style.visibility = "visible";
                        }

                        if (this.readyState == 4 && this.status == 200) {
                            json = JSON.parse(this.responseText);
                            results = json.results;
                            if (results != "") {
                                county = results[userInput][0].province;
                                filtered_disasters = [];
                                self.disasters.filter(function (d) {
                                    if (d.designatedArea + " (city)" == results[userInput][0].province || d.designatedArea == results[userInput][0].province + " (County)") {
                                        filtered_disasters.push(d);
                                    }
                                    else if (d.designatedArea == "Statewide") {
                                        if (d.state == results[userInput][0].state_code) {
                                            filtered_disasters.push(d);
                                        }
                                    }
                                })

                                for (i = 0; i < filtered_disasters.length; i++) {
                                    if (popupMap.has(filtered_disasters[[i]].incidentType) == true) {
                                        popupMap.set(filtered_disasters[[i]].incidentType, popupMap.get(filtered_disasters[[i]].incidentType) + 1);
                                    }
                                    else {
                                        popupMap.set(filtered_disasters[[i]].incidentType, 1);
                                    }
                                }

                                self.currentCounty = county
                                getSearchLocation(popupMap, county, false, filtered_disasters);
                                map_zoom(results[userInput][0].latitude, results[userInput][0].longitude, self.map, county)

                                setTimeout(function () {
                                    // document.getElementById('interactive');
                                    document.getElementById('compareButton').style.display = "block";
                                    document.getElementById('legend').style.visibility = "visible";
                                    document.getElementById('yearChart').style.visibility = "visible";
                                    document.getElementById('mapVis').style.visibility = "visible";
                                    document.getElementById('popupText').style.visibility = "visible";
                                    document.getElementById('searchLoad').style.visibility = "hidden";
                                    document.getElementById('mapLoad').style.visibility = "hidden";
                                }, 1000);
                            }
                            else {
                                console.log("invalid search")

                                getSearchLocation(popupMap, "No County Found", false, filtered_disasters);
                                map_zoom(37.7, -96, self.map, "No County Found")


                                setTimeout(function () {
                                    // document.getElementById('interactive');
                                    document.getElementById('legend').style.visibility = "visible";
                                    document.getElementById('yearChart').style.visibility = "visible";
                                    document.getElementById('mapVis').style.visibility = "visible";
                                    document.getElementById('popupText').style.visibility = "visible";
                                    document.getElementById('searchLoad').style.visibility = "hidden";
                                    document.getElementById('mapLoad').style.visibility = "hidden";
                                }, 1000);
                            }
                        }

                    }

                    xhttp.open('GET', url, true);
                    xhttp.send();
                }
            }
        }
    });

};


function getCurrDisasters(currDisasters) {
    //clearing the already present disasters
    var fires = [];
    var tornadoes = [];
    var water = [];
    var ice = [];
    var multiple = [];
    var other = [];

    currDisasters.forEach(function (e) {
        var type = e.incidentType;
        switch (type) {
            case 'Fire':
                fires.push(e);
                break;
            case 'Tornado':
                tornadoes.push(e);
                break;
            case 'Dam/Levee Break':
                water.push(e);
                break;
            case 'Flood':
                water.push(e);
                break;
            case 'Hurricane':
                water.push(e);
                break;
            case 'Severe Storm(s)':
                multiple.push(e);
                break;
            case 'Coastal Storm':
                water.push(e);
                break;
            case 'Typhoon':
                water.push(e);
                break;
            case 'Severe Ice Storm':
                ice.push(e);
                break;
            case 'Freezing':
                ice.push(e);
                break;
            case 'Snow':
                ice.push(e);
                break;
            default:
                other.push(e);
                break;
        }
    })
    fires.sort(function (a, b) { return a.fyDeclared - b.fyDeclared })
    tornadoes.sort(function (a, b) { return a.fyDeclared - b.fyDeclared })
    ice.sort(function (a, b) { return a.fyDeclared - b.fyDeclared })
    water.sort(function (a, b) { return a.fyDeclared - b.fyDeclared })
    multiple.sort(function (a, b) { return a.fyDeclared - b.fyDeclared })
    other.sort(function (a, b) { return a.fyDeclared - b.fyDeclared })

    self.currDisasters = [fires, tornadoes, water, ice, multiple, other];

    let pieFormat = new Map();
    pieFormat.set("Fires", fires.length)
    pieFormat.set("Tornadoes", tornadoes.length)
    pieFormat.set("Water", water.length)
    pieFormat.set("Ice", ice.length)
    pieFormat.set("Multiple", multiple.length)
    pieFormat.set("Other", other.length)

    return [pieFormat, self.currDisasters];

}

PopupBar.prototype.updateOnBrush = function (new_disasters) {
    // var self = this;
    console.log(self.currentCounty)
    if (self.currentCounty != undefined && self.currentCounty !=""){

        let filt_disasters = []
        let cty = self.currentCounty;

        if (self.currentCounty.includes("County") && !self.currentCounty.includes("(County)")) {
            cty = self.currentCounty.replace("County", "(County)");
        }
        console.log(cty)

        new_disasters.filter(function (d) {
            if (d.designatedArea.includes(cty)) {
                filt_disasters.push(d);
            }
        })
        let popupMap = new Map();
        popupMap = getCurrDisasters(filt_disasters)[0]
        getSearchLocation(popupMap, cty, false, filt_disasters);
    }
}



// function getSearchLocation(popupMap, county, compare){
//     var popupSVG;

//     if (compare){
//         popupSVG = d3.select("#compareText");

//     }
//     else {
//         popupSVG = d3.select("#popupText");
//     }
// }

function getColor(d) {
    if (d.data[0] == "Tornadoes") {
        return '#798234';
    }
    else if (d.data[0] == "Fires") {
        return "#ca562c";
    }
    else if (d.data[0] == "Multiple") {
        return "#94346E";
    }
    else if (d.data[0] == "Water") {
        return "#008080";
    }
    else if (d.data[0] == "Ice") {
        return '#7d5c40'
    }
    else {
        return 'gray';
    }
}

function displayModal(i, one_disaster_type, color) {
    $('#popupModal').modal('show');

    d3.select("#barChart").selectAll("svg").remove();
    d3.select("#barChart").selectAll("hr").remove();
    d3.select("#popupHeader").selectAll("text").remove();

    console.log(one_disaster_type);

    console.log(i);

    d3.select("#popupHeader")
        .text(i[0] + ": " + i[1])
        .style('color', color)
        .style("font-weight", "bold");

    proposedDate = one_disaster_type[0].declarationDate;
    var momentDate = moment(proposedDate);


    
    var barChart = new BarChart();
    barChart.update(one_disaster_type, color);

    var table = d3.select('table');
    table.selectAll('*').remove();
   

    var header = table.append("thead").append("tr");
    header
        .selectAll("th")
        .data(["Date", "Incident Type", "Reconstruction Efforts"])
        .enter()
        .append("th")
        .text(function(d) { return d; });
            
    var tablebody = table.append("tbody");
    var rows = tablebody.selectAll('tr')
        .data(one_disaster_type)
        .enter()
        .append('tr');


    rows.append('td')
        .html(function (d) {
        var momentDate = moment(d.declarationDate);
        var formattedDate = momentDate.format("MM/DD/YYYY");
        return formattedDate;
        });
    rows.append('td').html(function (d) { return d.declarationTitle; });
    rows.append('td').html(function (d) { 
        if(d.hmProgramDeclared){
            return "Yes";
        }
        else{
            return "No";
        }
     });
    // tr.append('td').html(function(d) { return m.budget; });

    var closebutton = document.getElementById("popupclose");

    closebutton.onclick = function () {
        $('#popupModal').modal('hide');
    }
    window.onclick = function (event) {
        if (event.target == document.getElementById("popupModal")) {
            $('#popupModal').modal('hide');
        }

    }
}

// PopupBar.prototype.getSearchLocation = function(){

function calculateRiskScore(disasters) {

    var divisor = 0;
    if(disasters.length > 20){
        disasters.forEach(function (e) {

            if (e.hmProgramDeclared == true) {
                divisor++;
            }
        })
        return divisor / disasters.length;
    }else return .6;
    
    //percentage of the disasters that needed a program declared
    //multiply it by 4 bc there's 4 programs?
    //riskScore isn't making sense yet
    // console.log(divisor)
}

function calculateTotalReconstructionEfforts(disasters){
    var total = 0;
    disasters.forEach(function(e){
        if (e.hmProgramDeclared == true) {
            total++;
        }
    })

    return total;
}
var lineChart = new LineChart();



function getSearchLocation(popupMap, county, compare, filtered_disasters) {
    var calcScore = 0;
    var reconstructScore = 0;
    var popupSVG;
    self.currentCounty = county;

    if (!compare){
        lineChart.update(filtered_disasters);        
    }
    calcScore = calculateRiskScore(filtered_disasters);
    console.log(calcScore);

    reconstructScore = calculateTotalReconstructionEfforts(filtered_disasters);
    var riskScore = "";
    if (calcScore >= .5) {
        riskScore = "Mild";
    } else if (calcScore < .5 && calcScore >= .4) {
        riskScore = "Medium";
    } else if (calcScore < .4 && calcScore >= .3) {
        riskScore = "High";
    } else if (calcScore < .3) {
        riskScore = "Extreme";
    }
    //don't know enough zip codes to check this, might not make sense as a calculation
    console.log(riskScore)
    //

    let pieData = getCurrDisasters(filtered_disasters)[0];
    let currDisasters = getCurrDisasters(filtered_disasters)[1];


    if (compare) {
        popupSVG = d3.select("#compareText");

    }
    else {
        popupSVG = d3.select("#popupText");
    }
    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("background", "#000")
        .text("a simple tooltip");


    var div = d3.select("body").append("div")
        .attr("class", "tooltip-riskScore")
        .style("opacity", 0);

    popupSVG.selectAll("svg").remove();
    popupSVG.selectAll("p").remove();
    popupSVG.selectAll("span").remove();
    popupSVG.append("span").text("County:  " + county + "|  ").style("font-weight", "bold");
    popupSVG.append('span').text("Risk Score: " + riskScore).style("font-weight", "bold").style("color", function(){
        if(riskScore == "Mild"){return "green";}
        else if(riskScore == "Medium"){return "yellow";}
        else if(riskScore == "High"){return "red";}
        else if(riskScore == "Extreme"){return "darkred";}
    })
        .attr("class", "riskScore").on('mouseover', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '.85');
            //Makes the new div appear on hover:
            div.transition()
                .duration(50)
                .style("opacity", 1);
        })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '1');
            //Makes the new div disappear:
            div.transition()
                .duration('50')
                .style("opacity", 0);
        }).append("i").attr("class", "fas fa-question-circle 1x").on("click", function(){
        var modal = d3.select("#riskScoreModal");
        $('#riskScoreModal').modal('show');
    })

    //don't know how to add a link to div.html
    div.html("Score was calculated by dividing the total number of disasters in this county, by the total number of hazard mitigation programs declared for these disasters. More information on the hazard mitigation program is available here: ")

    var width = 300;
    var height = 300;
    var radius = Math.min(width, height) / 2;
    var donutWidth = 60;

    var svg = popupSVG
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + (width / 2) +
            ',' + (height / 2) + ')');


    var arc = d3.arc()
        .innerRadius(radius * 0.5)         // This is the size of the donut hole
        .outerRadius(radius * 0.8)

    var outerArc = d3.arc()
        .innerRadius(radius * 0.7)
        .outerRadius(radius * 0.7);




    var pie = d3.pie()
        .value(function (d) {
            return d[1];
        })
        .sort(null)
        .padAngle(.03);

    var data = pie(pieData);

    //     tip = d3.tip()
    //         .attr('class', 'd3-tip')
    //         .html("hi");

    //    svg.call(tip);

    // var tooltip = popupSVG
    // .append('div')
    // .attr('class', 'tooltip');

    // tooltip.append('div')
    // .attr('class', 'label');

    // tooltip.append('div')
    // .attr('class', 'count');

    var path = svg
        .selectAll('path')
        .data(data)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function (d) {
            return getColor(d);
        })
        .style("opacity", 1)
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .style("opacity", "0.6");



            svg
                .selectAll('allPolylines')
                .data(i)
                .enter()
                .append('polyline')
                .attr("stroke", "white")
                .style("fill", "none")
                .attr("stroke-width", 1)
                .attr('points', function (d) {
                    var posA = arc.centroid(d) // line insertion in the slice
                    var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
                    var posC = outerArc.centroid(d); // Label position = almost the same as posB
                    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
                    posC[0] = (radius - 20) * 0.99 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                    return [posA, posB, posC]
                })

            //    svg
            //    .selectAll('allLabels')
            //    .data(d)
            //    .enter()
            //    .append('text')
            //    .text( function(d) { return d.data[1] } )
            //    .attr('transform', function(d) {
            //        var pos = outerArc.centroid(d);
            //        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 
            //        pos[0] = (radius - 20) * 0.99 * (midangle < Math.PI ? 1 : -1);
            //        return 'translate(' + pos + ')';
            //    })
            //    .style('text-anchor', function(d) {
            //        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 
            //        return (midangle < Math.PI ? 'start' : 'end')
            //    })
            //    .attr("stroke", "white")

            // tooltip.select('.label').html(i.data[1]);
            svg
                .append("rect")
                .attr("class", "tooltip")
                .text("County: " + i.data[1])
                .style("fill", "white")
            // .style("background-color", "black");
        })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .style("opacity", "1");
            svg.selectAll("tip").remove()
        })
        .on('click', function (d, i) {
            let color =  getColor(i);
            displayModal(i.data, self.currDisasters[i.index], color);
        });







    var legendRectSize = 10;
    var legendSpacing = 7;

    var legend = svg.selectAll('.legend')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'circle-legend')
        .attr('transform', function (d, i) {
            var height = legendRectSize + legendSpacing;
            var offset = height * data.length / 2;
            var horz = -2 * legendRectSize - 13;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });
    legend.append('circle') //keys
        .style('fill', function (d) {
            return getColor(d);
        })
        .style('stroke', function (d) {
            return getColor(d);
        })
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', '.4rem');
    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function (d) {
            return d.data[0];
        })
        .style("fill", "white")
        .style("opacity", "0.8");



    var totaldisasters = 0;
    popupMap.forEach((v) => {
        totaldisasters = totaldisasters + v;
    });

    popupSVG.append("span").text("Total Number of Disasters: " + totaldisasters).style("font-style", "italic").attr("transform", "translate(50, 0)").attr("style", "margin-left: 5px");
    popupSVG.append('span').text(" | Total Number of Reconstruction Efforts: " + reconstructScore + "  ").style("font-style", "italic").attr("transform", "translate(50, 0)")
    .append("i").attr("class", "fas fa-question-circle").on("click", function(){ 
        var modal = d3.select("#reconstructionModal");
        $('#reconstructionModal').modal('show');
    })
    //should we enter update and exit for this so that the text will update properly? or we could merge it?

}

// let markers = [];

PopupBar.prototype.update = function (county, latitude, longitude, disasters) {
    console.log("update popup");
    var self = this;

    self.disasters = disasters;

    self.currentCounty = county;
    self.click_marker(latitude, longitude, 6, county)

    var cty = self.currentCounty;

    if (county.includes("County")) {
        cty = self.currentCounty.replace("County", "(County)");
    }
    document.getElementById('legend').style.visibility = "hidden";
    document.getElementById('popupText').style.visibility = "hidden";
    document.getElementById('searchLoad').style.visibility = "visible";

    var popupMap = new Map();
    popupMap.clear();


    filtered_disasters = [];
    self.disasters.filter(function (d) {
        if (d.designatedArea == cty) {
            filtered_disasters.push(d);
        }

    })

    filtered_disasters.sort(function (a, b) { return a.fyDeclared - b.fyDeclared })



    for (i = 0; i < filtered_disasters.length; i++) {
        if (popupMap.has(filtered_disasters[[i]].incidentType) == true) {
            popupMap.set(filtered_disasters[[i]].incidentType, popupMap.get(filtered_disasters[[i]].incidentType) + 1);
        }
        else {
            popupMap.set(filtered_disasters[[i]].incidentType, 1);
        }
    }
    getSearchLocation(popupMap, self.currentCounty, false, filtered_disasters);

    map_zoom(latitude, longitude, self.map, self.currentCounty);


    setTimeout(function () {
        document.getElementById('legend').style.visibility = "visible";
        document.getElementById('popupText').style.visibility = "visible";
        document.getElementById('searchLoad').style.visibility = "hidden";
        document.getElementById('compareButton').style.display = "block";
    }, 1000);
}
function map_zoom(lat, long, map, countyName, compare = false) {
    if (map.set_view == undefined) {
        map.setView([lat, long]);

    }
    else {
        map.set_view(lat, long, 6, countyName, compare);

    }
}


PopupBar.prototype.onSelectionChange = function (selectedYears) {
    var self = this;
    self.selectedYears = selectedYears;
}



PopupBar.prototype.click_marker = function (lat, long, zoom, county) {
    var self = this;
    if (marker != undefined) {
        self.map.removeLayer(marker);
        if (county != "No County Found") {
            marker = L.marker([lat, long]).addTo(self.map);
            marker.bindPopup("<b>" + county + "</b>").openPopup();

        }
    }
    else {
        if (county != "No County Found") {
            marker = L.marker([lat, long]).addTo(self.map);
            marker.bindPopup("<b>" + county + "</b>").openPopup();
            // marker._icon.classList.add("marker");
        }
    };

   

}

// let compare_marker = undefined;

PopupBar.prototype.compare_marker = function (lat, long, zoom, county) {
    var self = this;
    // console.log(compare_marker)
    // if (compare_marker != undefined) {
    //     self.map.removeLayer(compare_marker);
    //     if (county != "No County Found") {
    //         compare_marker = L.marker([lat, long]).addTo(self.map);
    //         compare_marker.bindPopup("<b>" + county + "</b>").openPopup();
    //         compare_marker._icon.classList.add("marker");
    //     }
    // }
    // else {
    //     if (county != "No County Found") {
    //         compare_marker = L.marker([lat, long]).addTo(self.map);
    //         compare_marker.bindPopup("<b>" + county + "</b>").openPopup();
    //         compare_marker._icon.classList.add("marker");
    //     }
    // };

    // if (marker != undefined){
    //     let group = new L.featureGroup([marker, compare_marker]);
    //     map.fitBounds(group.getBounds());
    // }
}



PopupBar.prototype.compareCounties = function (event, disasters) {
    var self = this;

    var popupMap = new Map();
    popupMap.clear();
    if (event.key == "Enter") {
        if (event.keyCode === 13) {
            var userInput = document.getElementById('compareSearch').value;
            if (userInput.length == 5) {
                var apikey = '23f38b80-44ba-11ec-9cd8-5f429cc30f85';
                var json = [];
                var results = [];
                var county;
                var userInput = document.getElementById('compareSearch').value;

                var url = 'https://app.zipcodebase.com/api/v1/search?apikey=' + apikey + '&country=us' + '&codes=' + userInput;
                var xhttp = new XMLHttpRequest();

                xhttp.onreadystatechange = function () {
                    if (this.readyState == 1) {
                        document.getElementById('mapVis').style.visibility = "hidden";
                        document.getElementById('compareLoad').style.visibility = "visible";
                        document.getElementById('mapLoad').style.visibility = "visible";
                    }

                    if (this.readyState == 4 && this.status == 200) {
                        json = JSON.parse(this.responseText);
                        results = json.results;
                        if (results != "") {
                            county = results[userInput][0].province;
                            filtered_disasters = [];

                           
                            disasters.filter(function (d) {
                                if (d.designatedArea + " (city)" == results[userInput][0].province || d.designatedArea == results[userInput][0].province + " (County)") {
                                    filtered_disasters.push(d);
                                }
                                else if (d.designatedArea == "Statewide") {
                                    if (d.state == results[userInput][0].state_code) {
                                        filtered_disasters.push(d);
                                    }
                                }
                            })

                            for (i = 0; i < filtered_disasters.length; i++) {
                                if (popupMap.has(filtered_disasters[[i]].incidentType) == true) {
                                    popupMap.set(filtered_disasters[[i]].incidentType, popupMap.get(filtered_disasters[[i]].incidentType) + 1);
                                }
                                else {
                                    popupMap.set(filtered_disasters[[i]].incidentType, 1);
                                }
                            }

                            getSearchLocation(popupMap, county, true, filtered_disasters);

                            // self.compare_marker(lat, long, zoom, county)

                            map_zoom(results[userInput][0].latitude, results[userInput][0].longitude, self.map, county, true)
                            // map_zoom(40, -96, self.map, county)

                            // self.click_marker(results[userInput][0].latitude, results[userInput][0].longitude, 6, county);

                            setTimeout(function () {
                                document.getElementById('mapVis').style.visibility = "visible";
                                document.getElementById('compareLoad').style.visibility = "hidden";
                                document.getElementById('mapLoad').style.visibility = "hidden";
                            }, 1000);
                        }
                        else {
                            console.log("invalid search")
                            getSearchLocation(popupMap, "No County Found", true, filtered_disasters);
                            map_zoom(37.7, -96, self.map, "No County Found")


                            setTimeout(function () {
                                // document.getElementById('interactive');
                                document.getElementById('mapVis').style.visibility = "visible";
                                document.getElementById('compareLoad').style.visibility = "hidden";
                                document.getElementById('mapLoad').style.visibility = "hidden";
                            }, 1000);
                        }
                    }

                }

                xhttp.open('GET', url, true);
                xhttp.send();
            }
        }
    };




}



document.getElementById("i").addEventListener("click", () => {
    var modal = d3.select("#myModal");

    $('#myModal').modal('show');
})
