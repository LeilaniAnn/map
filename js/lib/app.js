// wanted to use Meetup API but Foursquare has so much documentation and examples
// user can filter results of "trending" places in SF
var map;
var infoWindow;
var $errorResults = $('#error-results');

function initMap() {
    map = new google.maps.Map($('#map').get(0), {
        center: {
            lat: 37.725568,
            lng: -122.443
        }, // map coords
        zoom: 14
    }); // map div
    infoWindow = new google.maps.InfoWindow();
} //initMap
// foursquare API keys
var clientID = 'KUWZMMRUWJBQRSZUFNDD2VP55R3JWMVEOVZFTJXS1EMWB0VV';
var clientSecret = 'LR1QBONLMKUUPWF4XELUFQCBDUMO3OF1KN1RLS2VFTSJDIG5';
// v = version (todays date)
var v = '20160831';

var foursquareUrl = "https://api.foursquare.com/v2/venues/explore/?near=94112&venuePhotos=1&section=trending&client_id=" + clientID + "&client_secret=" + clientSecret + "&v=" + v;
var trending = function(data) {
    var self = this;
    var lat = data.venue.location.lat;
    var lng = data.venue.location.lng;
    this.position = new google.maps.LatLng(lat, lng);
    this.name = ko.observable(data.venue.name);
    this.category = ko.observable(data.venue.categories[0].name);
    this.address = ko.observable(data.venue.location.address);
    this.city = ko.observable(data.venue.location.city);
    this.postalCode = ko.observable(data.venue.location.postalCode);
    this.fullAddress = ko.computed(function() {
        return this.address() + this.city() + this.postalCode();
    }, this);
    this.id = ko.observable(data.venue.id);
    // oh my lord this part took forever. GROUPS/ITEMS are objects within the object because inception
    this.imageSuffix = ko.observable(data.venue.photos.groups[0].items[0].suffix);
    this.imagePrefix = ko.observable(data.venue.photos.groups[0].items[0].prefix);
    this.imageUrl = ko.computed(function() {
        return this.imagePrefix() + '150x150' + this.imageSuffix();
    }, this);

    // var imageUrl = 'https://api.foursquare.com/v2/venues/'+ this.id() +'?oauth_token=IS3P123M340BTTR2AICSWOTQPTUKNDNHD0EN3F4QCMXI4JPG&v=20160809';
    this.marker = new google.maps.Marker({
        map: map,
        position: this.position,
        title: name,
        animation: google.maps.Animation.DROP,

    });
};

trending.prototype.drop = function() {
    var obj;
    if (this.hasOwnProperty('marker')) {
        obj = this.marker;
    } else {
        obj = this;
    }
    obj.setAnimation(google.maps.Animation.DROP);

};

trending.prototype.infoWindow = function() {
    var contentString = '<div id="infoWindow"><h4 class="text-center"><a target="_blank" href="http://foursquare.com/v/' + this.id() + '">' + this.name() + '</a></h4><h5 class="text-center">Category: ' + this.category() + '</h5><p><img class="center-block img-responsive" src="' + this.imageUrl() + '"><center><h4>Get Directions:<br> <a target="_blank" href="https://www.google.com/maps/place/' + this.fullAddress() + '">' + this.address() + '<br>' + this.city() + '<br>' + this.postalCode() + '</a></h4>' + '</center></p></div>';
    infoWindow.setContent(contentString);
    infoWindow.open(map, this.marker);
};

trending.prototype.filteredMarker = function() {
    this.drop();
    this.infoWindow();
};

var ViewModel = function() {
    var self = this;
    self.venues = ko.observableArray([]);
    self.query = ko.observable('');
    self.items = ko.observableArray([]);
    //http://stackoverflow.com/questions/26435383/getting-array-from-foursquare-with-getjson-and-store-as-variable

    $.getJSON(foursquareUrl).done(function(data) {
        self.items(data.response.groups[0].items);
        //Creating markers to pop up the map
        for (var i = 0; i < self.items().length; i++) {
            var venue = new trending(self.items()[i]);
            self.venues.push(venue);

        }
        // An alternative construct to the error callback option, the .fail() 
        // method replaces the deprecated .error() method. Refer to deferred.fail() for implementation details.
    }).fail(function(jqXHR, status, error) {
        $errorResults.append("We cannot reach Foursquare at the moment, please try again later");
    });

    self.filterPins = ko.computed(function() {
        return self.venues().filter(function(venue) { // filter for the array
            // display the venues which can match the query
            // search without worrying about capitalization
            if (venue.name().toLowerCase().indexOf(self.query().toLowerCase()) > -1) {
                // set marker for filtered results
                venue.marker.setMap(map);
                venue.marker.addListener('click', function() {
                    // drop and set infowindow content
                    venue.filteredMarker();
                });
                return true;
            } else {
                venue.marker.setMap(null);
                return false;
            }
        });
    });

};


ko.applyBindings(new ViewModel());
