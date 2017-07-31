var app = angular.module('ngGallery',[]);
app.factory("galleryFactory", ['$http', '$window', '$q', function($http, $window, $q) {
    return {
        getUserLocation: function() {
            var deferred = $q.defer();

            if (!$window.navigator.geolocation) {
                deferred.reject('Geolocation not supported.');
            } else {
                $window.navigator.geolocation.getCurrentPosition(
                    function (position) {
                        deferred.resolve(position);
                    },
                    function (err) {
                        deferred.reject(err);
                    });
            }

            return deferred.promise;
        },
        getUserLocationBackup: function() {
            return $http.get('http://ipinfo.io/json');
        },
        reverseGecode: function(loc) {
            return $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + loc + '&components=administrative_area&key=AIzaSyAFzBg6EWivP2e2GR0DmXdosJKqJylV9AQ');
        },
        geocode: function(searchAddress) {
            return $http.get('http://maps.googleapis.com/maps/api/geocode/json?address=' + searchAddress);
        },
        getImages: function(page_num, lat, lon) {
            var flckrKey = 'b30f2299fbe2a166e4beb4da659c792d';
            return $http.get('https://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&per_page=12&page='+page_num+'&extras=url_m,description&api_key=' + flckrKey + '&lat=' + lat + '&lon=' + lon);
        }
    };
}]);
// app.service("myService", function($http, $q) {


// 	var apiUrl = encodeURI('http://maps.googleapis.com/maps/api/geocode/json?address=' + defaultSearch);
// 	// console.log(apiUrl);
// 	var imgArray = new Array(),
// 		titleArray = new Array(),
// 		descriptionArray = new Array(), i = 0, newJSON;

// 	var deferred = $q.defer();
//     $http.get(apiUrl).success(function(data) {
//         lat = data.results[0]['geometry']['location']['lat'];
//         lon = data.results[0]['geometry']['location']['lng'];
//         // console.log(lat);
//         // console.log(lon);

//         newJSON = '[';
        
//         apiUrl2 = '';
//         // console.log(apiUrl2);
//         $http.get(apiUrl2).success(function(response){

//         	$(response).find('photo').each(function() {
//                 if($(this).attr('total')<3){
//                     console.log('empty!!');
//                 }else{

//                     var thisImg = $(this).attr('url_m');

//                     // remove quotes and carriage returns from inside of description
//                     var thisTitle = $(this).attr('title')
//                         .replace(/"/g, "")
//                         .replace(/[\n\r]/g, '');

//                     // remove quotes and carriage returns from inside of description and limit to 140 characters
//                     var thisDesc = $(this).find('description').text()
//                         .replace(/"/g, "")
//                         .replace(/[\n\r]/g, '')
//                         .slice(0,139);
//                     // if (!thisDesc) thisDesc = thisTitle;

//                     if(thisImg=='undefined'){
//                         thisImg="images/thumbs/01.jpg";
//                     }
//                     newJSON += '{"imgSrc":"' + thisImg + '",';
//                     newJSON += '"title":"' + thisTitle + '",';
//                     newJSON += '"description":"' + thisDesc + '"},';
//                 }

//         	});

//         	// console.log(jsonObject);

//         	// $scope.thumbs = jsonObject;
//         	deferred.resolve(newJSON);
//         	//updateMain();
//         });




//     });
//     this.getImages = function(search){
//         console.log(search)
//         return deferred.promise;
//     };


// });
