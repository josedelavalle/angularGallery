var app = angular.module('ngGallery',[]);
var page_num = 1;

app.service("myService", function($http, $q) {
	
	var location = "";
	location = $('#locationBox').val();
	if (location = "") then 
	location="Paris";

	var apiUrl = encodeURI('http://maps.googleapis.com/maps/api/geocode/json?address=' + location);
	console.log(apiUrl);
	var imgArray = new Array(),
		titleArray = new Array(),
		descriptionArray = new Array(), i = 0, newJSON;

	var deferred = $q.defer();
    $http.get(apiUrl).success(function(data) {
        lat = data.results[0]['geometry']['location']['lat'];
        lon = data.results[0]['geometry']['location']['lng'];
        // console.log(lat);
        // console.log(lon);

        newJSON = '[';
        flckrKey = 'b30f2299fbe2a166e4beb4da659c792d';
        apiUrl2 = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&per_page=12&page='+page_num+'&extras=url_m,description&api_key=' + flckrKey + '&lat=' + lat + '&lon=' + lon;
        console.log(apiUrl2);
        $http.get(apiUrl2).success(function(response){
        	$(response).find('photo').each(function() {
        		imgArray[i] = $(this).attr('url_m');
        		titleArray[i] = $(this).attr('title');
        		console.log('title: ' + titleArray[i]);
        		var thisDesc = $(this).find('description').text();
        		thisDesc = thisDesc.replace(/"/g, "'"); 
        		thisDesc = thisDesc.replace(/[\n\r]/g, '');

        		descriptionArray[i] = thisDesc.slice(0,139);
        		//console.log(descriptionArray[i]);
        		// newJSON += '{"imgFull":"' + imgArray[i] + '",';
        		// newJSON += '{"imgFull":"#",';
        		newJSON += '{"imgSrc":"' + imgArray[i] + '",';
        		newJSON += '"title":"' + titleArray[i] + '",';
        		newJSON += '"description":"' + descriptionArray[i] + '"},';
        		
        		i++;
        		
        	});
        	newJSON = newJSON.substr(0, newJSON.length-1);
        	newJSON += "]";
        	//console.log(newJSON);
        	let jsonObject = JSON.parse(newJSON);
        	// console.log(jsonObject);
        	
        	// $scope.thumbs = jsonObject;
        	deferred.resolve(jsonObject);
        	//updateMain();
        });



        
    });
    this.getImages = function(){
        return deferred.promise;
    };


});

