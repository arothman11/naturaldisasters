/*
 * Root file that handles instances of all the charts and loads the visualization
 */

(function () {
    var instance = null;

    /**
     * Creates instances for every chart (classes created to handle each chart;
     * the classes are defined in the respective javascript files.
     */
    function init() {
        //Creating instances for each visualization


        var map = new MapVis();
        

        //load the data corresponding to all the disasters
        //pass this data and instances of all the charts that update on year selection to yearChart's constructor
        //JSON file
        // d3.csv("data/yearwise-winner.csv")
        //     .then(function(electionWinners) {
        //         //pass the instances of all the charts that update on selection change in YearChart
        //         var yearChart = new YearChart(electoralVoteChart, tileChart, votePercentageChart, electionWinners);
        //         yearChart.update();
        //     });

        //when extracting the data, call it 'disasters'
        let disasters = [];
        let fips = [];
        var myEventHandler = {};
        var globalLat = 40; 
        var globalLong = -96;
        var globalCounty = "None"
        function getCoordinates(statecode, countyCode, type, stateName) {

            for (let i = 0; i < fips.length; i++) {
                // console.log(fips[i].properties);
                fips[i].properties.STATE = +fips[i].properties.STATE;
                fips[i].properties.COUNTY = +fips[i].properties.COUNTY;
                if (fips[i].properties.STATE == statecode) {
                    if (fips[i].properties.COUNTY == countyCode) {
                        fips[i].geometry.incident = type;
                        fips[i].geometry.countyName = fips[i].properties.NAME + ", " + stateName;
                        return fips[i].geometry;
                    }
                }
            }

            // fips.forEach(function(e){
            //     e.properties.STATE = +e.properties.STATE;
            //     e.properties.COUNTY = +e.properties.COUNTY;
            //     if (e.properties.STATE == statecode) {
            //         if (e.properties.COUNTY == countyCode) {
            //             e.geometry.incident = type;
            //             e.geometry.countyName = e.properties.NAME + ", " + stateName;
            //             return e.geometry;
            //         }
            //     }
            // })

        };

        // var yearChart = new YearChart(disasters, myEventHandler);
        // var yearChart =new YearChart(disasters, myEventHandler);
        // var yearChart = new YearChart(disasters, myEventHandler);

        d3.select('#loading').attr('display', 'block');

        tempDisasters = [];

        $.getJSON('data/DisasterDeclarationsSummaries.json', function (json) {
            if (json.hasOwnProperty("DisasterDeclarationsSummaries")) {
                disasters = json["DisasterDeclarationsSummaries"];
                //console.log(disasters)


                //console.log(data.map(function(d){ return d}).indexOf(1953));
                // disasters.forEach(function(d, i){
                //     var yearIndex = data.values(x => x == d.fyDeclared);
                //     var stateIndex = data[yearIndex][1].findIndex(y => y == d.state);
                //     data[yearIndex][1][stateIndex].push(d);
                // });
                // allYears.forEach(function(d, i){
                //     var arrString = allYears(d);
                //     data.push({arrString: arrString})
                // });
                //console.log(data[1953]['AK'])

            

                // for (let [key] of Object.entries(data)) {
                //     console.log(`${key}`);
                //   }


                // disasters.filter()

                $.getJSON('data/geojson-counties-fips.json', function (json) {
                    if (json.hasOwnProperty("features")) {
                        fips = json["features"];
                    }

                    // for (let i=0; i<disasters.length; i++){ // this takes a really long time, so test with fewer\
                    disasters.forEach(function(e){
                        e.fipsStateCode = +e.fipsStateCode;
                        e.fipsCountyCode = +e.fipsCountyCode;

                        if (e.designatedArea != "Statewide" && e.incidentType != "Biological") {
                            geometry = getCoordinates(e.fipsStateCode, e.fipsCountyCode, e.incidentType, e.state);
                            e.geometry = geometry;
                            tempDisasters.push(e);
                        }
                        else {
                            if (e.incidentType != "Biological") {
                                tempDisasters.push(e);
                            }
                        }
                    })
             
                    yearChart.disasters = disasters;
                  

                    return disasters;
                    // var popupBar = new PopupBar(disasters);
                }).then(value => {

                    map.update(tempDisasters)
                    // popupBar.getCurrDisasters(tempDisasters)
                }
                );
            }


            // console.log(disasters);
            // var yearChart = new YearChart(disasters);
            // yearChart.update();    

    
            var yearChart = new YearChart(disasters, myEventHandler);
            var popupBar = new PopupBar(disasters, map);
            var temp = [];
            var dataCheck = [];


            var currentCounty;

            navigator.geolocation.getCurrentPosition(success, error);

            function success(position) {
                console.log(position.coords.latitude)
                console.log(position.coords.longitude)

                latitude = parseFloat(position.coords.latitude);
                longitude = parseFloat(position.coords.longitude);

                globalLat = latitude;
                globalLong = longitude;

                var GEOCODING = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&key=AIzaSyBQgYj3WQvyrzuaxn_ya2bDja49zabjesQ";

                $.getJSON(GEOCODING).done(function(location) {
                    var components=location.results[0].address_components;
                   
                        for (var component=0;component<(components.length);component++){
                            if(components[component].types[0]=="locality"){
                                currentCounty = components[component].long_name + " (County)";
                            }
                        }
                        // console.log(currentCounty);
                        globalCounty = currentCounty;
                        popupBar.update(currentCounty, latitude, longitude, disasters, false);
                        
                    
                })

            }
            function error(err) {
                console.log(err)
            }


            function arrayEquals(a, b) {
                return Array.isArray(a) &&
                    Array.isArray(b) &&
                    a.length === b.length &&
                    a.every((val, index) => val === b[index]);
            }
            $(myEventHandler).bind("selectionChanged", function (event, years) {
                document.getElementById('mapVis').style.visibility = "hidden";
                document.getElementById('mapLoad').style.visibility = "visible";

                setTimeout(function () {
                        
                    if (!arrayEquals(temp, years)) {

                        map.onSelectionChange(years);
                        //yearChart.onSelectionChange(rangeStart, rangeEnd);
                        popupBar.onSelectionChange(years);
                        //console.log(years[0])
                        var newDisasters = disasters.filter(e => e.fyDeclared>=years[0]  && e.fyDeclared <=years[years.length-1])
            
                        d3.select('#loading').attr('display', 'block');
                        
                        map.update(newDisasters) 
                        popupBar.updateOnBrush(newDisasters);

                                    
                        d3.select('#loading').attr('display', 'none')
                        // popupBar.getCurrDisasters(dataCheck);
                        temp = years;
                        document.getElementById('mapVis').style.visibility = "visible";
                        document.getElementById('mapLoad').style.visibility = "hidden"; 


                    }

                }, 1000);
            });

            yearChart.update(disasters);
           
        });

        // CLICKABLE LEGEND CODE
        document.getElementById("legendFires").addEventListener('click', ()=> {
            let clicked = d3.select('#legendFires')
            if (!clicked.classed('HIGHLIGHTED')){
                let firesOnly = disasters.filter(disaster => {return (disaster.incidentType == "Fire")})
                map.update(firesOnly);
                clicked.classed("HIGHLIGHTED", true);
                d3.select("#legendTornadoes").classed("HIGHLIGHTED", false);
                d3.select('#legendWaterStorms').classed("HIGHLIGHTED", false);
                d3.select('#legendIceStorms').classed("HIGHLIGHTED", false);
                d3.select('#legendMultipleStorms').classed("HIGHLIGHTED", false);
                d3.select('#legendOther').classed("HIGHLIGHTED", false);
            }
            else {
                map.update(disasters);
                clicked.classed("HIGHLIGHTED", false);
            }
        });

        document.getElementById("legendTornadoes").addEventListener('click', ()=> {
            let clicked = d3.select('#legendTornadoes')
            if (!clicked.classed('HIGHLIGHTED')){
                let tornadoesOnly = disasters.filter(disaster => {return (disaster.incidentType == "Tornado")})
                map.update(tornadoesOnly)
                clicked.classed("HIGHLIGHTED", true);
                d3.select("#legendFires").classed("HIGHLIGHTED", false);
                d3.select('#legendWaterStorms').classed("HIGHLIGHTED", false);
                d3.select('#legendIceStorms').classed("HIGHLIGHTED", false);
                d3.select('#legendMultipleStorms').classed("HIGHLIGHTED", false);
                d3.select('#legendOther').classed("HIGHLIGHTED", false);
            }
            else {
                map.update(disasters);
                clicked.classed("HIGHLIGHTED", false);
            }
        });


        document.getElementById("legendWaterStorms").addEventListener('click', ()=> {
            let clicked = d3.select('#legendWaterStorms')
            if (!clicked.classed('HIGHLIGHTED')){
                
                d3.select("#legendTornadoes").classed("HIGHLIGHTED", false);
                d3.select('#legendFires').classed("HIGHLIGHTED", false);
                d3.select('#legendIceStorms').classed("HIGHLIGHTED", false);
                d3.select('#legendMultipleStorms').classed("HIGHLIGHTED", false);
                d3.select('#legendOther').classed("HIGHLIGHTED", false);                
                clicked.classed("HIGHLIGHTED", true);

                console.log("clicked water storms ");
                let waterStormsOnly = disasters.filter(item => {return (item.incidentType == "Flood" || item.incidentType == "Hurricane" || item.incidentType == "Coastal Storm" || item.incidentType == "Typhoon" || item.incidentType == "Dam/Levee Break")});
                map.update(waterStormsOnly)
                
            }
            else {
                clicked.classed("HIGHLIGHTED", false);
                map.update(disasters)
            }
        });

        document.getElementById("legendIceStorms").addEventListener('click', ()=> {
            let clicked = d3.select('#legendIceStorms')
            if (!clicked.classed('HIGHLIGHTED')){
                
                d3.select("#legendTornadoes").classed("HIGHLIGHTED", false);
                d3.select('#legendWaterStorms').classed("HIGHLIGHTED", false);
                d3.select('#legendFires').classed("HIGHLIGHTED", false);
                d3.select('#legendMultipleStorms').classed("HIGHLIGHTED", false);
                d3.select('#legendOther').classed("HIGHLIGHTED", false);                
                clicked.classed("HIGHLIGHTED", true);

                console.log("clicked ice storms ");
                let iceStormsOnly = disasters.filter(item => {return (item.incidentType == "Severe Ice Storm" || item.incidentType == "Snow" || item.incidentType == "Freezing")});
                map.update(iceStormsOnly)
            }
            else {
                clicked.classed("HIGHLIGHTED", false);
                map.update(disasters)

            }
        });

        document.getElementById("legendMultipleStorms").addEventListener('click', ()=> {
            let clicked = d3.select('#legendMultipleStorms')
            if (!clicked.classed('HIGHLIGHTED')){
                d3.select("#legendTornadoes").classed("HIGHLIGHTED", false);
                d3.select('#legendWaterStorms').classed("HIGHLIGHTED", false);
                d3.select('#legendIceStorms').classed("HIGHLIGHTED", false);
                d3.select('#legendFires').classed("HIGHLIGHTED", false);
                d3.select('#legendOther').classed("HIGHLIGHTED", false);                
                clicked.classed("HIGHLIGHTED", true);
                console.log("clicked multiple storms");
                let multipleStorms = disasters.filter(item => {return (item.incidentType == "Severe Storm(s)")});
                map.update(multipleStorms)
            }
            else {
                clicked.classed("HIGHLIGHTED", false);
                map.update(disasters)
            }
        });

        document.getElementById("legendOther").addEventListener('click', ()=> {
            let clicked = d3.select('#legendOther')
            if (!clicked.classed('HIGHLIGHTED')){
                d3.select("#legendTornadoes").classed("HIGHLIGHTED", false);
                d3.select('#legendWaterStorms').classed("HIGHLIGHTED", false);
                d3.select('#legendIceStorms').classed("HIGHLIGHTED", false);
                d3.select('#legendMultipleStorms').classed("HIGHLIGHTED", false);
                d3.select('#legendFires').classed("HIGHLIGHTED", false);                
                clicked.classed("HIGHLIGHTED", true);
                console.log("clicked other storms");
                let otherStormsOnly = disasters.filter(item => {return (item.incidentType != "Fire" && item.incidentType != "Tornado" && item.incidentType != "Flood" && item.incidentType != "Hurricane" && 
                item.incidentType != "Coastal Storm" && item.incidentType != "Typhoon" && item.incidentType != "Dam/Levee Break" && item.incidentType != "Severe Storm(s)" && 
                item.incidentType != "Severe Ice Storm" && item.incidentType != "Snow" && item.incidentType != "Freezing")});
                map.update(otherStormsOnly)
            }
            else {
                clicked.classed("HIGHLIGHTED", false);
                map.update(disasters)
            }

        });




    }

    /**
     *
     * @constructor
     */
    function Main() {
        if (instance !== null) {
            throw new Error("Cannot instantiate more than one Class");
        }
    }

    /**
     *
     * @returns {Main singleton class |*}
     */
    Main.getInstance = function () {
        var self = this
        if (self.instance == null) {
            self.instance = new Main();

            //called only once when the class is initialized
            init();
        }
        return instance;
    }

    Main.getInstance();

    
})();


