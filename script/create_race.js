var map;
function initMap() {
	var controlZoomIn = $("#control-zoom-in");
	var controlZoomOut = $("#control-zoom-out");
	var controlStreetView = $("#control-street-view");
	var controlMapView = $("#control-map-view");
	var controlText = $("#control-text");
	var controlRaceStart = $("#control-race-start");
	var controlRaceFinish = $("#control-race-finish");
	var controlTrafficToggle = $('#control-traffic-toggle');
	var traffic = 0;

	var glasgow_coords = new google.maps.LatLng(55.873724, -4.292538);
	var directionsService = new google.maps.DirectionsService;
  	var directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 12,
		center: glasgow_coords,
		disableDefaultUI: true,
		styles: [
			{elementType: 'geometry', stylers: [{color: '#242f3e'}]},
			{elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
			{elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
			{
				featureType: 'administrative.locality',
				elementType: 'labels.text.fill',
				stylers: [{color: '#FF69B4'}]
			},
			{
				featureType: 'poi',
				elementType: 'labels.text.fill',
				stylers: [{color: '#BF04FB'}]
			},
			{
				featureType: 'poi.park',
				elementType: 'geometry',
				stylers: [{color: '#263c3f'}]
			},
			{
				featureType: 'poi.park',
				elementType: 'labels.text.fill',
				stylers: [{color: '#6b9a76'}]
			},
			{
				featureType: 'road',
				elementType: 'geometry',
				stylers: [{color: '#c0c0c0'}] //silver
			},
			{
				featureType: 'road',
				elementType: 'geometry.stroke',
				stylers: [{color: '#212a37'}]
			},
			{
				featureType: 'road',
				elementType: 'labels.text.fill',
				stylers: [{color: '#00ffff'}] //9400D3 (alternative)
			},
			{
				featureType: 'road.highway',
				elementType: 'geometry',
				stylers: [{color: '#9370DB'}]
			},
			{
				featureType: 'road.highway',
				elementType: 'geometry.stroke',
				stylers: [{color: '#1f2835'}]
			},
			{
				featureType: 'road.highway',
				elementType: 'labels.text.fill',
				stylers: [{color: '#f3d19c'}]
			},
			{
				featureType: 'transit',
				elementType: 'geometry',
				stylers: [{color: '#2f3948'}]
			},
			{
				featureType: 'transit.station',
				elementType: 'labels.text.fill',
				stylers: [{color: '#d59563'}]
			},
			{
				featureType: 'water',
				elementType: 'geometry',
				stylers: [{color: '#17263c'}]
			},
			{
				featureType: 'water',
				elementType: 'labels.text.fill',
				stylers: [{color: '#515c6d'}]
			},
			{
				featureType: 'water',
				elementType: 'labels.text.stroke',
				stylers: [{color: '#17263c'}]
			}
		]
	});
	directionsDisplay.setMap(map);
	trafficLayer = new google.maps.TrafficLayer();
        
	$(document).ready(function(){
        	$("input").change(function(e) {

			for (var i = 0; i < e.originalEvent.srcElement.files.length; i++) {
				var file = e.originalEvent.srcElement.files[i];
				var img = document.createElement("img");
				var reader = new FileReader();
				reader.onloadend = function() {
					img.src = reader.result;
				}
				reader.readAsDataURL(file);
				$("input").after(img);
			}
		});


		$('#button').on('click', function() {
			$('#file-input').trigger('click');
		});

		$('#file-input').change(function () {
			var reader = new FileReader();
			
			reader.onload = function(e) {  	// e.target.result should contain the text
				var text=reader.result;	//console.log("XML TEXT" + text);
				var gpxDoc = $.parseXML(text); 
				var $xml = $(gpxDoc);
				var $name = $xml.find('name');       // Find Name of Activity
				console.log($name.text());
				$('#file-title').text($name.text());
				
				//vars
				var totalTracks = 0;
				var totalHR = 0;
				var totalCAD = 0;
				var totalLat = 0;
				var totalLon = 0;
				var firstLat = null;
				var firstLon=  null;
				var lastLat = null;
				var lastLon = null;
				var maxLat = null;
				var maxLon = null;
				var minLat = null;
				var minLon = null;
				var latlons = [];
				var trip = 0;
				var lengthTotal = 0;
				
				// Iterate through all track segements and find a route.
				$xml.find('trkpt').each(function(){
					// this is where all the reading and writing will happen
					var lat = $(this).attr("lat");
					var lon = $(this).attr("lon");
					
					if(trip == 0){
						firstLat = lat;
						firstLon=  lon;
						trip = 1;
					}
					
					var hr = $(this).find('ns3\\:hr').text();
					var cad = $(this).find('ns3\\:cad').text();
					
					totalTracks += 1;
					totalHR += parseInt(hr);
					totalCAD += parseInt(cad);
					totalLat += parseFloat(lat);
					totalLon += parseFloat(lon);
					
					// Get the figures for the bounding box
					if (maxLat == null || maxLon == null ||  minLat == null || minLon == null ) {
						maxLat = lat;
						minLat = lat;
						maxLon = lon;
						minLon = lon;
					}
					
					maxLat = Math.max(lat, maxLat);
					minLat = Math.min(lat, minLat);
					maxLon = Math.max(lon, maxLon);
					minLon = Math.min(lon, minLon);
					
					if (lastLat == null || lastLon == null) {
						lastLat = lat;
						lastLon = lon;
					} else {
						var line = new google.maps.Polyline({
							path: [ new google.maps.LatLng(lastLat, lastLon), new google.maps.LatLng(lat, lon) ],
							strokeColor: "#09b57b",
							strokeOpacity: 0.4,
							strokeWeight: 10,
							map: map
						
						});
						//console.log("line size: " + google.maps.geometry.spherical.computeLength(line.getPath()));  //linecheck
						lengthTotal = lengthTotal + google.maps.geometry.spherical.computeLength(line.getPath());
						lastLon = lon;
						lastLat = lat;
						
					}

				//console.log("polytotal is "+lengthTotal+" long"); //totalcheck
				});

				originalLength = lengthTotal/1000
				originalLength = Math.round(originalLength * 1000) / 1000

				console.log(firstLat, firstLon,lastLat, lastLon);
						var lineSymbol = {
						  path: google.maps.SymbolPath.CIRCLE,
						  scale: 8,
						  strokeColor: '#393'
						};
						// Create the polyline and add the symbol to it via the 'icons' property.
						var line = new google.maps.Polyline({
						  path: [ new google.maps.LatLng(firstLat, firstLon), new google.maps.LatLng(lastLat, lastLon) ],
						  icons: [{
						    icon: lineSymbol,
						    offset: '100%'
						  }],
						  map: map
						});

						animateCircle(line);
				console.log("original Length is "+originalLength);
				var start = new google.maps.LatLng(firstLat, firstLon);
				var end = new google.maps.LatLng(lastLat, lastLon);
				

				//find straight Distance (as crow flys)
				var R = 6371; // Radius of the earth in km
				var dLat = deg2rad(lastLat-firstLat);  // deg2rad below
				var dLon = deg2rad(lastLon-firstLon); 
				var a = 
				    Math.sin(dLat/2) * Math.sin(dLat/2) +
				    Math.cos(deg2rad(firstLat)) * Math.cos(deg2rad(lastLat)) * 
				    Math.sin(dLon/2) * Math.sin(dLon/2)
				    ; 
				var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
				var straightDistance = R * c; // Distance in km
				straightDistance = Math.round(straightDistance * 1000) / 1000
				console.log("straight distance is " + straightDistance);
				
				var request = {
					origin: start,
					destination: end,
					travelMode: 'DRIVING',
					provideRouteAlternatives: true
				};
				
				var marker = new google.maps.Marker({
					position: start,
					map: map,
					draggable: true,
					title: "Drag me!",
					icon: 'img/start_flag.png'
				});

				var endMarker = new google.maps.Marker({
					position: end,
					map: map,
					draggable: true,
					title: "Drag me!",
					icon: 'img/end_flag.png'
				});
				
				var recommendedDistance= 0;

				directionsService.route(request, function(result, status) {

					if (status == 'OK') {
		
						for(i = 0; i < result.routes[0].legs.length; i++){
  							recommendedDistance += parseFloat(result.routes[0].legs[i].distance.value);
							}
						console.log("recommended route length is "+ recommendedDistance/1000);
						recommendedDistance= recommendedDistance/1000
						$('#recommended-route').text("Average Heartrate: " + Math.round((totalHR/totalTracks)) + "bpm " 								+ "Original Distance: "+ originalLength +"km Distance as Crow Flys: "+ straightDistance+"km Recommended Route Distance: " 
							+ recommendedDistance +"km " );
						directionsDisplay.setDirections(result);
										}
				

  					
				});

				// Add the overview stats to preview run details...
				//$('#activity-overview').text("Average Heartrate: " + (totalHR/totalTracks) + "bpm " + "Original Distance: "+ originalLength +"km Distance as Crow Flys: "+ straightDistance+"km " );
  				// Recentre the MAP
				map.setCenter(new google.maps.LatLng(totalLat/totalTracks, totalLon/totalTracks));
				map.fitBounds(new google.maps.LatLngBounds(new google.maps.LatLng(minLat, minLon),new google.maps.LatLng(maxLat, maxLon)));
				
			};

			reader.readAsText(this.files[0]);
			$('#file-preview').text(this.files[0].name);

		});
	});



	var marker = new google.maps.Marker({
		position: glasgow_coords,
		map: map,
		draggable: true,
		title: "Drag me!",
		icon: 'img/start_flag.png'
	});

	var endMarker = new google.maps.Marker({
		position: glasgow_coords,
		map: map,
		draggable: true,
		title: "Drag me!",
		icon: 'img/end_flag.png'
	});
	
	// Custom map controls
	controlZoomIn.click(function() {
		map.setZoom(map.getZoom()+1);
	});
	
	controlZoomOut.click(function() {
		map.setZoom(map.getZoom()-1);
	});
	
	controlStreetView.click(function() {
  		map.getStreetView().setOptions({visible:true,position:glasgow_coords});
	});

	controlMapView.click(function() {
  		map.getStreetView().setOptions({visible:false,position:glasgow_coords});
	});
	
	var startPos;
	controlRaceStart.click(function() {
		startPos = marker.getPosition();
		alert("Start position saved.")
	});
	
	var endPos;
	controlRaceFinish.click(function() {
		endPos = endMarker.getPosition();
		console.log("working");
		var request = {
					origin: startPos,
					destination: endPos,
					travelMode: 'DRIVING',
					provideRouteAlternatives: true
				};
		directionsService.route(request, function(result, status) {
										console.log("working1");
					if (status == 'OK') {
						console.log("working");
						directionsDisplay.setDirections(result);
					}		
				});
		var lineSymbol = {
			path: google.maps.SymbolPath.CIRCLE,
			scale: 8,
			strokeColor: '#393'
			};
		// Create the polyline and add the symbol to it via the 'icons' property.
		var line = new google.maps.Polyline({
			path: [ startPos, endPos ],
			icons: [{
			icon: lineSymbol,
		    offset: '100%'
		}],
			map: map
		});

		animateCircle(line);

		//Create the GPX file
		var xmlStr = 	'<?xml version="1.0" encoding="utf-8"?>' +
						'<gpx creator="Street Racing" version="1.1">' +
							'<metadata>' +
								'<link href="connect.garmin.com">' +
									'<text>Street Racing</text>' +
								'</link>' +
								'<time>2017-06-07T12:55:10.000Z</time>' +
							'</metadata>' +
							'<trk>' +
								'<name>A Race</name>' +
								'<type>driving</type>' +
								'<trkseg>' +
									'<trkpt lat="' + startPos.lat() + '" lon="' + startPos.lng() + '">' +
									'</trkpt>' +
									'<trkpt lat="' + endPos.lat() + '" lon="' + endPos.lng() + '">' +
									'</trkpt>' +
								'</trkseg>' +
							'</trk>' +
						'</gpx>';
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(xmlStr, "text/xml");
		var xmlhttp = new XMLHttpRequest();
		
		xmlhttp.open("POST","php/save_file.php",true);
	    //Must add this request header to XMLHttpRequest request for POST
	    xmlhttp.setRequestHeader("Content-type", "text/xml");
		xmlhttp.send(xmlStr);

		$.ajax({
			url: "php/save_file.php",
			type: "post",
			data: { 
            	objectID: id,
	            content: contentMap[id]
	        },
	        success: function(){
	            alert("success");
	        },
	        error:function(){
	            alert("failure");
	        }
		})

		alert("End position saved.");

	});

	controlTrafficToggle.click(function() {
		if(traffic == 0){
			//traffic layer is disabled.. enable it
			traffic = 1
			trafficLayer.setMap(map);
		} else {
			//traffic layer is enabled.. disable it
			traffic = 0
			trafficLayer.setMap(null);             
		}
	});
}

function toggleTraffic(){
    
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function animateCircle(line) {
          var count = 0;
          window.setInterval(function() {
            count = (count + 1) % 200;

            var icons = line.get('icons');
            icons[0].offset = (count / 2) + '%';
            line.set('icons', icons);
        }, 20);
      }
