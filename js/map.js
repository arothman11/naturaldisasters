function MapVis(disasters) {
    var self = this;
    self.disasters = disasters;
    self.init();
};


let globalDisasters = [];

/**
 * Initializes the svg elements required for this chart
 */
MapVis.prototype.init = function () {
    console.log("redraw map");
    // console.log("initializing")
    var self = this;
    self.margin = { top: 10, right: 20, bottom: 30, left: 50 };
    var divmapVis = d3.select("#mapVis").classed("fullView", true);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divmapVis.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    // self.svgHeight = ;

    //creates svg element within the div
    self.svg = divmapVis.append("svg")
        .attr("width", self.svgWidth)
        // .attr("height", self.svgHeight)



    self.map = L.map('mapVis', {
        maxBounds: [
            [7.499550, -190.276413], //Southwest
            [83.162102, -52.233040] //Northeast
            ], 
    }).setView([40, -96], 5);

    // self.map.setView(40, -96, 5, "None")
    
    // this.setView(40, -96, 5);

    self.layer = new L.LayerGroup();
    self.layer.addTo(self.map);

    function style(feature) {
        return {
            weight: 2,
            opacity: 1,
            color: 'black',
            dashArray: '3',
        };
    }
    
    L.geoJson(statesData,  {style: style}).addTo(self.map);


  

};

MapVis.prototype.onSelectionChange = function (selectedYears) {
    var self = this;
    self.selectedYears = selectedYears;
}


MapVis.prototype.update = function (disasters, selectedYears) {
    console.log("update map");
    var self = this;

    self.map.removeLayer(self.layer);
    var access_token = 'pk.eyJ1IjoiYXJvdGhtYW4iLCJhIjoiY2t2bDc0YjZlNXpzdTMybXM2MXl3bzA4bCJ9.UBVmmjD6Me2HnwrmnsWQBg';
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png' + access_token, {
        id: 'mapbox/light-v9',
        tileSize: 512,
        zoomOffset: -1,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        preferCanvas: true,
    }).addTo(self.map);


    self.map.on('click', function(e) {
        var lat = parseFloat(e.latlng.lat);
        var lng = parseFloat(e.latlng.lng);


        var GEOCODING = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + e.latlng.lat + "," + e.latlng.lng + "&key=AIzaSyBQgYj3WQvyrzuaxn_ya2bDja49zabjesQ";

            $.getJSON(GEOCODING).done(function(location) {
                 var components=location.results[0].address_components;
            
                    for (var component=0;component<(components.length);component++){
                        if(components[component].types[0]=="administrative_area_level_2"){
                            currentCounty = components[component].long_name;
                            console.log(currentCounty);

                            if (currentCounty.includes("Borough")) {
                                cty = county.replace("Borough", "(Borough)");
                            }
                            var pb = new PopupBar(disasters, self.map);
                            document.getElementById("search").value = "";
                            pb.update(currentCounty, lat, lng, disasters);
                        }
                    }
                  
            })
    });



    function style(feature) {
        return {
            fillColor: feature.geometry.color,
            weight: .2,
            opacity: 0.4,
            color: 'white',
            dashArray: '3',
            fillOpacity: feature.geometry.opacity,
        };
    }



    counties_done = [];
    temp = []

    function filterData(){
        return disaster => {
            if (disaster.designatedArea != 'Statewide' && disaster.geometry != undefined){
                // if county hasn't been done aldready.
                if (counties_done.indexOf(disaster.designatedArea + ", " + disaster.state) == -1) {
                    
                        
                        // this is now an array for that county. 
                        let county_data = disasters.filter(item => item.designatedArea == disaster.designatedArea);
                        // console.log(county_data);

                        // get most common disaster
            

                        let fires = county_data.filter(item=> item.incidentType == "Fire").length;
                        let tornados = county_data.filter(item=> item.incidentType == "Tornado").length;
                        let waterrelated = county_data.filter(item=> item.incidentType == "Flood" || item.incidentType == "Hurricane" || item.incidentType == "Coastal Storm" || item.incidentType == "Typhoon" || item.incidentType == "Dam/Levee Break").length;
                        let multiplestorms = county_data.filter(item=> item.incidentType == "Severe Storm(s)").length;
                        let icestorms = county_data.filter(item=> item.incidentType == "Severe Ice Storm" || item.incidentType == "Snow" || item.incidentType == "Freezing").length;
                        let otherstorms = county_data.filter(item=> item.incidentType != "Fire" && item.incidentType != "Tornado" && item.incidentType != "Flood" && item.incidentType != "Hurricane" && 
                                                            item.incidentType != "Coastal Storm" && item.incidentType != "Typhoon" && item.incidentType != "Dam/Levee Break" && item.incidentType != "Severe Storm(s)" && 
                                                            item.incidentType != "Severe Ice Storm" && item.incidentType != "Snow" && item.incidentType != "Freezing").length
        

                        if (fires >= tornados  && fires >= waterrelated && fires >= icestorms && fires >= multiplestorms && fires >= otherstorms) {
                            // console.log("Fire is the most common");
                            disaster.geometry.color = "#ca562c";                            
                        }
                        else if (tornados >= fires &&  tornados >= waterrelated && tornados >= icestorms && tornados >= multiplestorms && tornados >= otherstorms) {
                                // console.log("Tornados is the most common");  
                                disaster.geometry.color = '#798234';                          
                        }
                        else if (waterrelated >= fires && waterrelated >= tornados && waterrelated >= icestorms && waterrelated >= multiplestorms && waterrelated >= otherstorms) {
                            // console.log("waterrelated is the most common");          
                            disaster.geometry.color = '#008080';
                        }
                        else if (multiplestorms >= fires && multiplestorms >= tornados && multiplestorms >= icestorms && multiplestorms >= waterrelated && multiplestorms >= otherstorms) {
                            // console.log("multiplestorms is the most common");          
                            disaster.geometry.color = "#94346E";            
                        }
                        else if (icestorms >= fires && icestorms >= tornados && icestorms >= multiplestorms && icestorms >= waterrelated && icestorms >= otherstorms) {
                            // console.log("ice storms is the most common");          
                            disaster.geometry.color = "#7d5c40";      
                        }
                        else if (otherstorms >= fires && otherstorms >= tornados &&  otherstorms >= icestorms && otherstorms >= multiplestorms && otherstorms >= waterrelated) {
                            // console.log("other is the most common");          
                            disaster.geometry.color = '#808080';                  
                        }
                        // else if (other > fires && other > tornados && other > floodshurricanes && other > rainstorms && other >= icestorms) {
                        //     // console.log("ice storms is the most common");          
                        //     disaster.geometry.color = '#526A83';                  
                        // }
                        else {
                            console.log("its a tie")
                            disaster.geometry.color = '#808080';

                            // add equals statements here. 
                        }

                        let total_disasters = fires + tornados + waterrelated + multiplestorms + icestorms + otherstorms;
                        // console.log(total_disasters)
                        if (total_disasters < 10){
                            disaster.geometry.opacity = 0.35
                        }
                        else if (total_disasters >=10 && total_disasters <20){
                            disaster.geometry.opacity = 0.45
                        }
                        else if (total_disasters >=20 && total_disasters <30){
                            disaster.geometry.opacity = 0.55
                        }
                        else if (total_disasters >=30 && total_disasters <40){
                            disaster.geometry.opacity = 0.75
                        }
                        else {
                            disaster.geometry.opacity = 0.9
                        }
                        

                        // feature.county
                        counties_done.push(disaster.designatedArea + ", " + disaster.state);
                        // temp.push(disaster.geometry);
                        return true;
                }                
            }
            return false;
        };        
    }

    disasters.filter(filterData()).map((dis) => (temp.push(dis.geometry)));

    // {this.state.students.filter(this.search()).map((singleStudent) => ( 


    // for (let k=0; k<disasters.length; k++){
    //     if (disasters[k].designatedArea != 'Statewide' && disasters[k].geometry != undefined){
    //         temp.push(disasters[k].geometry);
    //     }
    // }

    var geoj = L.geoJSON(temp, {
        // onEachFeature: onEachFeature
        style: style,
        onEachFeature: function(feature, layer){
            // let marker;
            // layer.on('mouseover', function (event) {
            //     console.log(event)
            //     marker = new L.marker([event.latlng.lat-.5, event.latlng.lng+.5], { opacity: 0.01 }); //opacity may be set to zero
            //     marker.bindTooltip(feature.countyName, {permanent: true, className: "my-label"});
            //     marker.addTo(self.map);
            // });
            // layer.on('mouseout', function () {
            //     console.log("Mouse out")
            // });
        }        
    }).addTo(self.map);

    self.layer.clearLayers()
    self.layer.addLayer(geoj);

    self.layer.addTo(self.map);




};

// globalbool = false;
var marker;
var compare_marker;

MapVis.prototype.set_view = function (lat, long, zoom, county, compare=false) {
    var self = this;

    if (!compare){
        if (marker != undefined) {
            // console.log("xists. remove")
            self.map.removeLayer(marker);

            if (county != "No County Found"){
                marker = L.marker([lat, long]).addTo(self.map);
                marker.bindPopup("<b>"+county+"</b>").openPopup();

            }
            self.map.flyTo([lat, long], zoom);
        }
        else {
            if (county != "No County Found"){
                marker = L.marker([lat, long]).addTo(self.map);
                marker.bindPopup("<b>"+county+"</b>").openPopup();

                self.map.flyTo([lat, long], zoom);

            }

        };
    }
    else {
        console.log("compare, no marker")
        // self.map.flyTo([40, -96], 5);
        if (compare_marker != undefined) {
            self.map.removeLayer(compare_marker);
            if (county != "No County Found") {
                compare_marker = L.marker([lat, long]).addTo(self.map);
                compare_marker.bindPopup("<b>" + county + "</b>").openPopup();
                compare_marker._icon.classList.add("marker");
            }
        }
        else {
            if (county != "No County Found") {
                compare_marker = L.marker([lat, long]).addTo(self.map);
                compare_marker.bindPopup("<b>" + county + "</b>").openPopup();
                compare_marker._icon.classList.add("marker");
            }
        };
        if (marker != undefined){
            let group = new L.featureGroup([marker, compare_marker]);
            self.map.fitBounds(group.getBounds());
        }
    }
}
