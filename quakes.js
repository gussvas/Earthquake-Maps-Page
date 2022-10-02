
var markers = [];
var map;
var largestTen = [];
var tempQuakesArray = [];
var address;
var timeout = 600;
var yyyy;
var mm;


//  Initialize the Google map
function initialize() {
  var mapOptions = {


    center: new google.maps.LatLng(25.6866, -100.3161),
    zoom: 11
  };
  map = new google.maps.Map(document.getElementById("map-canvas"),
    mapOptions);

}



//  Input
function geoCodeLocation() {
  var address = document.getElementById("address").value;
  deleteMarkers();
  var geocoder = new google.maps.Geocoder();

  geocoder.geocode({ 'address': address },
    function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {

        map.setCenter(results[0].geometry.location);

        //  Bounding box dictated by the city entered and geocoded
        var bounds = map.getBounds();
        console.log(bounds);

        var north = bounds.getNorthEast().lat();
        var east = bounds.getNorthEast().lng();
        var west = bounds.getSouthWest().lng();
        var south = bounds.getSouthWest().lat();


        //  Request to the GeoNames.org Earthquakes REST service
        console.log("http://api.geonames.org/earthquakesJSON?north=" + north + "&south=" + south + "&east=" + east + "&west=" + west + "&username=thedavidwells"); // Mi usuario no sirvio entonces use uno en linea

        $.getJSON("http://api.geonames.org/earthquakesJSON?north=" + north + "&south=" + south + "&east=" + east + "&west=" + west + "&username=thedavidwells", function (response) { // Mi usuario no sirvio entonces use uno en linea
          placeMarkers(response);
        });

      } else {
        alert('Unable to geocode that location: ' + status);
      }

    });
}


//  Function to place earthquake markers on the map
// It also shows Information related to every marker
function placeMarkers(data) {
  if (data.earthquakes == null) {
    console.log("NO DATA LOADED...");
  }
  else {
    var quakeInfo = data.earthquakes;

    for (var i = 0; i < data.earthquakes.length; i++) {

      var quakeLocation = new google.maps.LatLng(data.earthquakes[i].lat, data.earthquakes[i].lng);
   
      var infowindow = new google.maps.InfoWindow({
        content: contentString
      });
      var marker = new google.maps.Marker({
        position: quakeLocation,
        map: map,
        title: "Time: " + data.earthquakes[i].datetime + ", Magnitude: " + data.earthquakes[i].magnitude + " Depth: " + data.earthquakes[i].depth + " Earthquake ID: " + data.earthquakes[i].eqid
      });
      marker.addListener('click', function () {
        infowindow.open(map, marker);
      });
      markers.push(marker);
      // Information regarding the earthquake
      var contentString = '<div id="content">' +
        '<div id="siteNotice">' +
        '</div>' +
        '<h3 id="firstHeading" class="firstHeading">Information</h>' +
        '<div id="bodyContent">' +
        "Time: " + data.earthquakes[i].datetime + ", Magnitude: " + data.earthquakes[i].magnitude +
        " Depth: " + data.earthquakes[i].depth + " Earthquake ID: " + data.earthquakes[i].eqid;
    }

  }
}

//  Removes markers from the map
function deleteMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}

//  Sort quakes by largest
function sortQuakes(data) {
  if (data.earthquakes == null) {
    //console.log("NO DATA LOADED...");
  }


  console.log("SORTING LARGEST QUAKE DATA!");
  for (var i = 0; i < data.earthquakes.length; i++) {

    var quake = data.earthquakes[i];
    var fullDate = data.earthquakes[i].datetime;

    var yearSubstring = fullDate.substring(0, 4);
    var monthSubstring = fullDate.substring(5, 7);

    tempQuakesArray.push(quake);
  }

  var listContainer = document.getElementById("top-10");
  var listElement = document.createElement("ul");

  //  Sort the array by magnitude
  tempQuakesArray.sort(function (a, b) { return b.magnitude - a.magnitude; });


  $("top-10").append("<ul></ul>");

  //  Add top quakes to the list
  for (var j = 0; j < 10; j++) {

    largestTen[j] = tempQuakesArray[j];
    console.log("LARGEST 10.....");
    console.log(largestTen[j]);

    var li = "<li>";
    //  Add the quakes to the web page
    $("#top-10").append(li.concat("<b>Magnitude:</b> " + largestTen[j].magnitude + ",<br> <b>Date: </b>" + largestTen[j].datetime + ",<br> <b> lat, lng: </b>" + largestTen[j].lat + ", " + largestTen[j].lng));

  }
}



//  Bonus:  Get top 10 largest earthquakes in the qorld for the last 12 months:
function tenLargestQuakes() {

  //  if we want to search for all earthquakes in the entire world we need to use these coordinates.
  var largest;
  var north = 90;
  var east = 180;
  var west = -180;
  var south = -90;
  var maxRows = 500;

  //  Date needs to be called in 'yyyy-MM-dd' format.
  var today = new Date();
  var dd = today.getDate();
  mm = today.getMonth() + 1;  // since January is 0.
  yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;
  console.log(today);
  var minMagnitude = 1;


  //  get data:
  console.log("GETTING DATA!");
  $.getJSON("http://api.geonames.org/earthquakesJSON?north=" + north + "&south=" + south + "&east=" + east + "&west=" + west + "&datetime=" + today + "&minMagnitude=" + minMagnitude + "&maxRows=" + maxRows + "&username=thedavidwells", function (response) {
    sortQuakes(response);
  });
}

google.maps.event.addDomListener(window, 'load', initialize);
