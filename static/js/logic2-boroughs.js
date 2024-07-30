// Helper functions
// Custom styling function
function chooseColor(borough){
  let color = 'black';

  if (borough === "Brooklyn"){
    color = '#cf14ef';
  } else if (borough === "Bronx"){
    color = '#76e022';
  } else if (borough === "Manhattan"){
    color = '#856088';
  } else if (borough === "Queens"){
    color = '#F0FFFF';
  } else if (borough === "Staten Island"){
    color = '#1034A6';
  } else color = 'black';

  return (color);
}

// Custom Popup function
function onEachFeature(feature, layer){
  // Set the mouse events to change the map styling.
  layer.on({
    // When a user's mouse cursor touches a map feature, the mouseover event calls this function, which makes that feature's opacity change to 90% so that it stands out.
    mouseover: function (event) {
      layer = event.target;
      layer.setStyle({
        fillOpacity: 0.9
      });

      // Shows popup when neighborhood is hovered over
      layer.openPopup();
    },
    // When the cursor no longer hovers over a map feature (that is, when the mouseout event occurs), the feature's opacity reverts back to 50%.
    mouseout: function (event) {
      layer = event.target;
      layer.setStyle({
        fillOpacity: 0.5
      });
    },
    // When a feature (neighborhood) is clicked, it enlarges to fit the screen.
    click: function (event) {
      myMap.fitBounds(event.target.getBounds());
    }
  });

  if ((feature.properties) && (feature.properties.neighborhood) && (feature.properties.borough)){
    let popup = `<h3>${feature.properties.borough}</h3><hr><h5>${feature.properties.neighborhood}</h5>`;
    layer.bindPopup(popup);
  }
}


function createMap(data, geoData){
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
  let heatLayer = L.heatLayer(heatArray);
  
  // Create the overlay layer
  let geoLayer = L.geoJSON(geoData, {
    style: function(feature){
      return {
        color: '#1B1B1B',
        fillColor: chooseColor(feature.properties.borough),
        fillOpacity: .5,
        weight: 1.5
    }},
    onEachFeature: onEachFeature
  });
  
  // Step 3: BUILD the Layer Controls

  // Only one base layer can be shown at a time.
  let baseLayers = {
    Street: street,
    Topography: topo
  };

  let overlayLayers = {
    Markers: markers,
    Heatmap: heatLayer,
    Boroughs: geoLayer
  }


  // Step 4: INIT the Map
  let myMap = L.map("map", {
    center: [40.7128, -74.0059],
    zoom: 11,
    layers: [street, geoLayer, markers]
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
  let url2 = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/15-Mapping-Web/nyc.geojson";

  d3.json(url).then(function (data) {
    d3.json(url2).then(function(geoData){
      createMap(data, geoData)
    });
  });
}

init();
