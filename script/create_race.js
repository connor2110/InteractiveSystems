function initMap() {
	var controlZoomIn = $("#control-zoom-in");
	var controlZoomOut = $("#control-zoom-out");
	var controlStreetView = $("#control-street-view");
	var controlMapView = $("#control-map-view");
	var controlText = $("#control-text");
	var controlRaceStart = $("#control-race-start");
	var controlRaceFinish = $("#control-race-finish");

	var glasgow_coords = new google.maps.LatLng(55.873724, -4.292538);
	var directionsService = new google.maps.DirectionsService;
  	var directionsDisplay = new google.maps.DirectionsRenderer;
	var map = new google.maps.Map(document.getElementById('map'), {
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
	  var latlons = []
	  var trip = 0
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
	

            //  Get the figures for the bounding box
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
                path: [
                  new google.maps.LatLng(lastLat, lastLon), 
                  new google.maps.LatLng(lat, lon)
                ],
              strokeColor: "#09b57b",
              strokeOpacity: 0.4,
              strokeWeight: 10,
              map: map
              });

              lastLon = lon;
              lastLat = lat;

          }

	  });
	console.log(firstLat, firstLon,lastLat, lastLon);
	 var start = new google.maps.LatLng(firstLat, firstLon);
	  var end = new google.maps.LatLng(lastLat, lastLon);
	  var request = {
	    origin: start,
	    destination: end,
	    travelMode: 'DRIVING'
	  };
	  directionsService.route(request, function(result, status) {
	    if (status == 'OK') {
	      directionsDisplay.setDirections(result);
	    }
            //  For testing to see if values coming in are mental
            //console.log("LAT " + lat + " LON " + lon + " HR " + hr + " CAD " + cad);
          
          });

          //  Add the overview stats to preview run details...
          $('#activity-overview').text("Average Heartrate: " + (totalHR/totalTracks) + " Average Cadence: " + (totalCAD/totalTracks));
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

	controlRaceStart.click(function() {
		marker.getPosition()
		alert("Start position saved.")
	});
	
	controlRaceFinish.click(function() {
		marker.getPosition()
		alert("End position saved.")
	});
}
