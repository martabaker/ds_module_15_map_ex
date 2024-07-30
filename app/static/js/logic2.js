function createMap(data){
  // base layers
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })
  
  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // map
  // Create overlay layer
  let markers = L.markerClusterGroup();
  let heatArray = [];

  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    let location = row.location;

    if (location){
      // extract coordinates
      let point = [location.coordinates[1], location.coordinates[0]];

      // make marker
      let marker = L.marker(point);
      let popup = `<h3>${row.incident_address}</h3><hr><h5>${row.descriptor} | ${row.created_date}</h5>`;
      marker.bindPopup(popup);
      markers.addLayer(marker);

      // add to heatmap
      heatArray.push(point);
    }
  }

  // Create layer
  let heatLayer = L.heatLayer(heatArray)
  
  // Step 3: BUILD the Layer Controls

  // Only one base layer can be shown at a time.
  let baseLayers = {
    Street: street,
    Topography: topo
  };

  let overlayLayers = {
    Markers: markers,
    Heatmap: heatLayer
  }


  // Step 4: INIT the Map
  let myMap = L.map("map", {
    center: [40.7128, -74.0059],
    zoom: 11,
    layers: [street, markers]
  });


  // Step 5: Add the Layer Control filter + legends as needed
  L.control.layers(baseLayers, overlayLayers).addTo(myMap);
}

function init() {
  let userInput = 'Noise'

  let baseURL = "https://data.cityofnewyork.us/resource/fhrw-4uyv.json?";
  // Add the dates in the ISO formats
  let date = "$where=created_date between'2023-01-01T00:00:00' and '2024-01-01T00:00:00'";
  // Add the complaint type.
  let complaint = `&complaint_type=${userInput}`;
  // Add a limit.
  let limit = "&$limit=10000";

  // Assemble the API query URL.
  let url = baseURL + date + complaint + limit;

  d3.json(url).then(function (data) {
    // console.log(data);

    createMap(data);
  });
}

init();

