var theMap, LeafMap;
var controls = document.getElementById("controls");
var requestButton = document.getElementById("requestHelp");


/** Seed a few points in Boston ***/
var callData = [
  {"name": "Harvard",
   "coords": [42.373883,71.117131]
  },
  {"name": "HKS",
    "coords": [42.371155, -71.121342]
  },
  {"name": "JFK Childhood Home",
    "coords": [42.346945, -71.123242]
  },
  {"name": "Rose Fitzgerald Kennedy Greenway",
    "coords": [42.362222, -71.050386]
  },
  {"name": "Rose Kennedy Home",
    "coords": [42.364244, -71.053234]
  },
  {"name": "St Stephen's Church",
    "coords": [42.365386, -71.052998]
  },
  {"name": "Union Oyster House",
    "coords": [42.361089, -71.05691]
  },
  {"name": "Boston Public Library",
    "coords": [42.361668, -71.064231]
  },
  {"name": "State House",
    "coords": [42.359591, -71.062172]
  },
  {"name": "Hotel Bellevue",
    "coords": [42.358248, -71.062421]
  },
  {"name": "Parker House Hotel",
    "coords": [42.357711, -71.059914]
  },
  {"name": "Locke-Ober",
    "coords": [42.355401, -71.061458]
  }
];

/*
 *  map - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

CallMap = function(_parentElement, _data, _mapPosition) {

	this.parentElement = _parentElement;
	this.data = _data;
	this.mapPosition = _mapPosition;

	this.initVis();
}


/*
 *  Initialize map
 */

CallMap.prototype.initVis = function() {
	var vis = this;

	// Initialize leaflet map centered on coords
	vis.callMap = L.map('call-map');
  LeafMap = vis.callMap;

  vis.callMap.setView([vis.mapPosition[0], vis.mapPosition[1]], 15);

	L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
			// attribution: 'NODE &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> / <a href="http://cartodb.com/attributions">CartoDB</a>',
			subdomains: 'abcd',
			maxZoom: 16,
			minZoom: 14
			})
	 .addTo(vis.callMap);

	vis.wrangleData();
}


/*
 *  Data wrangling
 */

CallMap.prototype.wrangleData = function() {
	var vis = this;

	// Currently no data wrangling/filtering needed
	vis.displayData = vis.data;
    // console.log(vis.displayData);

	// Update the visualization
	vis.updateVis();
}


/*
 *  The drawing function
 */

CallMap.prototype.updateVis = function() {
	var vis = this;

	// Add empty layer groups for the markers / map objects
	vis.locations = L.layerGroup().addTo(vis.callMap);

	vis.displayData.forEach(function(d) {
		// Create a marker and bind a popup with a particular HTML content
		var location = L.circle([d.coords[0], d.coords[1]], {radius: 25}).setStyle({className:'spots'}).bindTooltip(d.name);

		vis.locations.addLayer(location);
	});

	d3.select("#requestHelp").on("click", getLocation);
}




/*** Get your location ****/
function getLocation() {
	console.log("get location");

    if (navigator.geolocation) {
        requestButton.innerHTML = "Requesting help...";

        navigator.geolocation.getCurrentPosition(showPosition,showError, {enableHighAccuracy:true,maximumAge: Infinity,timeout:30000});
    } else {
        controls.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
	console.log(position);
	var lat = position.coords.latitude;
	var lon = position.coords.longitude;

	var yourLocation = L.circle([lat, lon], {radius: 50}).setStyle({className:'spotsYou'}).bindTooltip("Your location", {className: 'tooltipYou'});

    requestButton.innerHTML = "Help Requested";
    requestButton.setAttribute('class','on');

	theMap.locations.addLayer(yourLocation);

  LeafMap.flyTo([lat, lon], 15, {
    pan: { animate: true },
    zoom: { animate: true }
  });

}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            controls.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            controls.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            controls.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            controls.innerHTML = "An unknown error occurred."
            break;
    }
}


function loadData() {

    callData.forEach(function(d) {
  		d.name = d.name;
      d.lat = d.coords[0];
      d.long = d.coords[1];
  	});

  	// create instance of map
  	createVis();
}


function createVis(error) {
  if(error) { console.log(error); }

  theMap = new CallMap("call-map", callData, [42.361089, -71.05691]);
}
