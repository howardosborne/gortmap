var map;

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
            else{return {color: lookup[name].color};}
        }
    })
    catchmentLayer.bindPopup(function (layer) {
        let uri = layer.feature.properties.uri;
        let pop = `<div class="card">
        <div class="card-title"><h6>${layer.feature.properties.name} <span class="badge text-bg-secondary">${name}</span></h6></div>		
        <ul class="list-group list-group-flush">
        <li class="list-group-item"><a href="${uri.replace("/so/","/")}" target="_blank">EA details</a></li>
        <li class="list-group-item"><a href="${lookup[name].url}" target="_blank">Catchment partnership</a></li>
        <!--<li class="list-group-item"><a class="button" onclick="showClassifications('${layer.feature.properties.id}')">Classifications</a></li>
        <li class="list-group-item"><a class="button" onclick="showObjectives('${layer.feature.properties.id}')">Objectives</a></li>
        <li class="list-group-item"><a class="button" onclick="showProtectedAreas('${layer.feature.properties.id}')">Protected</a></li>
        <li class="list-group-item"><a class="button" onclick="showChallenges('${layer.feature.properties.id}')">Challenges</a></li>-->
        </ul>
        </div>`;
        return pop;
    })
    //catchmentLayer.bindTooltip(lookup[name].name)
    catchmentLayer.addTo(map);
}
  
var server = "https://script.google.com/macros/s/AKfycbzplxYBoOcR9IPskJHrtIEs8TnLtX8iAPibQAVaQCOJNScwAtYz51HHiu8Uhwb7XSy54g/exec";
var lookup = {
    "UBOCP":{name:"Upper Bedford Ouse Catchment Partnership",url:"https://ubocp.org.uk/",color:"rgb(150, 150, 150)"},
    "CamEO":{name:"Cambridge Ely Ouse",url:"https://www.cameopartnership.org/",color:"rgb(100, 150, 150)"},
    "WCP":{name:"Water Care Partnership",url:"https://www.cambsacre.org.uk/water-care-catchment-partnership/",color:"rgb(50, 150, 150)"}	
}

function loadMap(){
    var geo;
    map = L.map('map').setView([52.3322, -0.2773], 9);
    //const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19,	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    //var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'}).addTo(map);
    var Esri_WorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'}).addTo(map);
    addWaterbody(`./data/ubocp.geojson`,"UBOCP");
    addWaterbody(`./data/cameo.geojson`,"CamEO");
    addWaterbody(`./data/wcp.geojson`,"WCP");
    //map.fitBounds(geo.getBounds());
}
