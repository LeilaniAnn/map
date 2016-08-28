var map;
var ViewModel;
 	ViewModel = function () {
    var $filterResults = $('#results');
    // It expects a DOM element, but $('#map') returns 
    // a jQuery object so add .get(0) for DOM element
    map = new google.maps.Map($('#map').get(0), {
        center: {
            lat: 37.7205,
            lng: -122.443
        }, // map coords
        zoom: 12
    }); // map div
    var meetup = $.getJSON("http://api.meetup.com/groups.json/?zip=94112&radius=12&topic=technology&order=members&key=e4ea6e144b705138235d42a296244&callback=?");
    var meetupInfo = meetup.then(function(data) {

        $.each(data.results, function(i, item) {
                var infowindow = new google.maps.InfoWindow({
                content: '<div class="panel panel-primary"><h5 class="text-center"><a href="' + item.link + '" target="_blank">' + item.name + '</a></h5></div>' + '<div class="panel-body"><p class="text-center"><img src="' + item.photo_url + '" width="150">' + '<br>' + '<strong>Last active:</strong> ' + item.updated + ' (' + item.members + ' members) ' + '<br>' + item.description + '</p></div>'
                }); // infowindow content
                $filterResults.append('<ul class="list-unstyled"><li>' + '<img src="' + item.photo_url + '"width="25px">' + ' ' + item.name + '<br></li></ul>');
				
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(item.lat, item.lon),
                    map: map,
                    animation: google.maps.Animation.DROP
                }); // new marker
                marker.addListener('click', function() {
                    infowindow.open(map, marker)
                }); // infowindow
            }) //.each
    }); // meetupInfo

    // Load and parse the JSON
    /* Omitted: fetch it from the server however you want */

    // // Update view model properties
    // viewModel.pets(parsed.pets);

};
ko.applyBindings(new ViewModel());