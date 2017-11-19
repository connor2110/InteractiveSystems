function loadXMLDoc() {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			myFunction(this);
		}
	};
	xmlhttp.open("GET", "A.gpx", true);
	xmlhttp.send();
}

function myFunction(xml) {
	var x, i, xmlDoc, txt;
	xmlDoc = xml.responseXML;
	txt = "";
	x = xmlDoc.getElementsByTagName("name");
	for (i = 0; i< x.length; i++) {
		txt += x[i].childNodes[0].nodeValue + "<br>";
	}
	document.getElementById("someElement").innerHTML = txt;
}

function initMap() {
	var controlZoomIn = $("#control-zoom-in");
	var controlZoomOut = $("#control-zoom-out");
	var controlStreetView = $("#control-street-view");
	var controlText = $("#control-text");

	var glasgow_coords = {lat: 55.873724, lng: -4.292538};
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
	var marker = new google.maps.Marker({
		position: glasgow_coords,
		map: map
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
}
