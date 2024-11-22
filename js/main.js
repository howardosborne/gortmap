var map;
var layerControl;

async function getLatestCSOInfo() {
    let url = "https://script.google.com/macros/s/AKfycbx5I8sChfkuxusDl29yafXamEAXGGU9AyLp-RS_LY8tcg6ZvBOr5G3rKsor0WfvOkipzw/exec"
    const response = await fetch(url);
    if(response.status == 200){
        var CSOs = new L.LayerGroup();
        var dischargingCSOs = new L.LayerGroup();
        var offlineCSOs = new L.LayerGroup();
        var inMaintenanceCSOs = new L.LayerGroup();
        var CSOsCount = 0, dischargingCSOsCount = 0, offlineCSOsCount = 0, inMaintenanceCSOsCount = 0;
        const responseJson = await response.json();
        let result = responseJson["result"];
        CSOsCount = result.length;
        result.forEach(element => {
            let csoColor = "rgb(50, 100, 0)";
            if(element.is_discharging){csoColor =  "rgb(100, 50, 0)";}
            let marker = L.circleMarker([element.cooridinate.lat, element.cooridinate.lng],{radius:4,color:csoColor});
            marker.bindTooltip(decodeURI(element.site_name));
            marker.properties = element;
            //marker.addEventListener('click', _starterMarkerOnClick);
            marker.addTo(CSOs);
            let badge = "";
            if(!element.is_online){
                offlineCSOsCount ++;
                marker.addTo(offlineCSOs);
                badge += ` <span class="badge text-bg-warning">offline</span>`;
            }
            if(element.is_in_maintenance){
                inMaintenanceCSOsCount ++;
                marker.addTo(inMaintenanceCSOs);
                badge += ` <span class="badge text-bg-warning">in maintenance</span>`;
            }
            if(element.is_discharging){
                dischargingCSOsCount ++;
                marker.addTo(dischargingCSOs);
                marker.bindPopup(`<div class="card">
                    <h6>${element.site_name}${badge}</h6>
                <ul class="list-group list-group-flush">
                <li class="list-group-item">Started: ${element.recent_discharge.started.substring(0,10)} ${element.recent_discharge.started.substring(11,19)}</li>
                <li class="list-group-item">Duration: ${element.recent_discharge.duration_mins} mins</li>
                <li class="list-group-item">Discharge to: ${element.receiving_water_or_environment}</li>
			    <li class="list-group-item">Is overflow expected?: ${element.is_overflow_expected}</li>
                </ul>
                </div>`);
            } 
            else{
                marker.bindPopup(`
                <div class="card">
                    <h6>${element.site_name}${badge}</h6>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item">Last discharge: ${element.recent_discharge.started.substring(0,10)} ${element.recent_discharge.started.substring(11,19)}</li>
                        <li class="list-group-item">Duration: ${element.recent_discharge.duration_mins} mins</li>
                    <li class="list-group-item">Discharges to: ${element.receiving_water_or_environment}</li>
                    </ul>
                </div>`);                
            }
        });
        layerControl.addOverlay(CSOs, `All Anglian CSOs (${CSOsCount})`);
        layerControl.addOverlay(dischargingCSOs, `CSOs discharging (${dischargingCSOsCount})`);
        layerControl.addOverlay(offlineCSOs, `CSOs offline (${offlineCSOsCount})`);
        layerControl.addOverlay(inMaintenanceCSOs, `CSOs in maintenance (${inMaintenanceCSOsCount})`);
    }
}
async function getFloodData(sourceData){
    //http://environment.data.gov.uk/flood-monitoring/id/stations?parameter=rainfall&lat=51.48&long=-2.77&dist=10
}
async function showChallenges(waterbody){
    let url = `${server}?waterbody=${waterbody}&list=rnags`;
    const response = await fetch(url);
    if(response.status == 200){
        const responseJson = await response.json();
        document.getElementById("offcanvas-body").innerText	= responseJson.data;
        var myOffcanvas = document.getElementById('offcanvas');
        var bsOffcanvas = new bootstrap.Offcanvas(myOffcanvas);
        bsOffcanvas.show();	
    }
}

async function showProtectedAreas(waterbody){
    let url = `${server}?waterbody=${waterbody}&list=protected-areas`;
    const response = await fetch(url);
    if(response.status == 200){
        const responseJson = await response.json();
        document.getElementById("offcanvas-body").innerText	= responseJson.data;
        var myOffcanvas = document.getElementById('offcanvas');
        var bsOffcanvas = new bootstrap.Offcanvas(myOffcanvas);
        bsOffcanvas.show();	
    }
}

async function showObjectives(waterbody){
    let url = `${server}?waterbody=${waterbody}&list=objectives`;
    const response = await fetch(url);
    if(response.status == 200){
        const responseJson = await response.json();
        document.getElementById("offcanvas-body").innerText	= responseJson.data;
        var myOffcanvas = document.getElementById('offcanvas');
        var bsOffcanvas = new bootstrap.Offcanvas(myOffcanvas);
        bsOffcanvas.show();	
    }
}
async function showClassifications(waterbody){
    let url = `${server}?waterbody=${waterbody}&list=classifications`;
    const response = await fetch(url);
    if(response.status == 200){
        const responseJson = await response.json();
        document.getElementById("offcanvas-body").innerText	= responseJson.data;
        var myOffcanvas = document.getElementById('offcanvas');
        var bsOffcanvas = new bootstrap.Offcanvas(myOffcanvas);
        bsOffcanvas.show();	
    }
}
  
async function addWaterbody(sourceData,name){
    const response = await fetch(sourceData);
    const data = await response.json();

    let catchmentLayer = L.geoJSON(data, {
        style: function (feature) {
            if(feature.geometry.type=="MultiLineString"){return {color: "rgb(100, 150, 250)"};}
            else{return {color: lookup[name].color, weight:1};}
        }
    })
    catchmentLayer.bindPopup(function (layer) {
        let uri = layer.feature.properties.uri;
        let pop = `<div class="card">
        <div class="card-title"><h6>${layer.feature.properties.name} <a href="${lookup[name].url}" target="_blank"><span class="badge text-bg-secondary">${name}</span></a></h6></div>		
        <ul class="list-group list-group-flush">
        <li class="list-group-item"><a class="button" href="${uri.replace("/so/","/")}" target="_blank">Environment Agency info</a></li>
        <!--<li class="list-group-item"><a href="${lookup[name].url}" target="_blank">Catchment partnership</a></li>
        <li class="list-group-item"><a class="button" onclick="showClassifications('${layer.feature.properties.id}')">Classifications</a></li>
        <li class="list-group-item"><a class="button" onclick="showObjectives('${layer.feature.properties.id}')">Objectives</a></li>
        <li class="list-group-item"><a class="button" onclick="showProtectedAreas('${layer.feature.properties.id}')">Protected</a></li>
        <li class="list-group-item"><a class="button" onclick="showChallenges('${layer.feature.properties.id}')">Challenges</a></li>-->
        </ul>
        </div>`;
        return pop;
    })
    //catchmentLayer.bindTooltip(lookup[name].name)
    layerControl.addOverlay(catchmentLayer, lookup[name].name);
    catchmentLayer.addTo(map);
}
  
var server = "https://script.google.com/macros/s/AKfycbzplxYBoOcR9IPskJHrtIEs8TnLtX8iAPibQAVaQCOJNScwAtYz51HHiu8Uhwb7XSy54g/exec";
var lookup = {
    "UBOCP":{name:"Upper Bedford Ouse Catchment Partnership",url:"https://ubocp.org.uk/",color:"rgb(150, 150, 150)"},
    "CamEO":{name:"Cambridge Ely Ouse",url:"https://www.cameopartnership.org/",color:"rgb(125, 200, 150)"},
    "WCP":{name:"Water Care Partnership",url:"https://www.cambsacre.org.uk/water-care-catchment-partnership/",color:"rgb(1, 100, 100)"}	
}

function loadMap(){
    map = L.map('map').setView([52.3322, -0.2773], 9);
    //const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19,	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    //var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'}).addTo(map);
    //var Esri_WorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'}).addTo(map);
    var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19,	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    var img = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'});
    var top = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'});
    var rel = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', {attribution: 'Tiles &copy; Esri &mdash; Source: Esri',maxZoom: 13});

    var baseMaps = {
        "OpenStreetMap":osm,
        "Satelite":img,
        "Topological":top,
        "Shaded relief":rel
    }
    layerControl = L.control.layers(baseMaps).addTo(map);
    addWaterbody(`./data/ubocp.geojson`,"UBOCP");
    addWaterbody(`./data/cameo.geojson`,"CamEO");
    addWaterbody(`./data/wcp.geojson`,"WCP");
    getLatestCSOInfo()
    //map.fitBounds(geo.getBounds());
}
