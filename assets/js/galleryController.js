angular
	.module('ngGallery')
	.controller('gallCtrl2', ['$scope', '$http', 'myService', function($scope, $http, myService) {
		$scope.$MyService = myService;
		// $scope.thumbs = {};
		$scope.defaultSearch = "technology";
		$scope.page_num = 1;
		$scope.per_page = 12;
		$scope.newJSON = '[';
		$('#inputBox').bind("enterKey",function(e){
		   $scope.go('person');
		});
		$('#inputBox').keyup(function(e){
		    if(e.keyCode == 13)
		    {
		        $(this).trigger("enterKey");
		    }
		});
		$scope.go = function(typeOfSearch) {
			// console.log(typeOfSearch);
			$scope.page_num++;
			// console.log('page: ' + $scope.page_num);
			
			flckrKey = 'b30f2299fbe2a166e4beb4da659c792d';
			var userInput = "", newJSON;
			userInput = $('#inputBox').val();
			if (userInput == null || userInput == '')
			userInput="Computer";

			// Do different types of searches based on button selected
			switch (typeOfSearch) {
				case "place":
					var apiUrl = encodeURI('http://maps.googleapis.com/maps/api/geocode/json?address=' + userInput);
					
					// If Place search, first get lat and long for location from Google API
					$http.get(apiUrl).success(function(data) {
						lat = data.results[0]['geometry']['location']['lat'];
						lon = data.results[0]['geometry']['location']['lng'];
						apiUrl2 = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&per_page='+$scope.per_page+'&page='+$scope.page_num+'&extras=url_m,description&api_key=' + flckrKey + '&lat=' + lat + '&lon=' + lon;
					});
					break;
				case "person":
					apiUrl2 = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&per_page='+$scope.per_page+'&page='+$scope.page_num+'&extras=url_m,description&api_key=' + flckrKey + '&tags=' + userInput;
					break;
				default:
					apiUrl2 = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&per_page='+$scope.per_page+'&page='+$scope.page_num+'&extras=url_m,description&api_key=' + flckrKey + '&text=' + userInput;
			}
			
			// console.log(apiUrl2);
				
				//Get data FLICKR API
				$http.get(apiUrl2).success(function(response){
					$(response).find('photo').each(function() {
						
						var thisImg = $(this).attr('url_m');

						// remove quotes and carriage returns from inside of description
						var thisTitle = $(this).attr('title')
							.replace(/"/g, "")
							.replace(/[\n\r]/g, '');
						
						// remove quotes and carriage returns from inside of description and limit to 140 characters
						var thisDesc = $(this).find('description').text()
							.replace(/"/g, "") 
							.replace(/[\n\r]/g, '')
							.slice(0,139);

						if(thisImg=='undefined'){
							thisImg="images/thumbs/01.jpg";
						}
						$scope.newJSON += '{"imgSrc":"' + thisImg + '",';
						$scope.newJSON += '"title":"' + thisTitle + '",';
						$scope.newJSON += '"description":"' + thisDesc + '"},';
					});
					// console.log ($scope.newJSON);
					
					let jsonObject = JSON.parse($scope.newJSON.substr(0, $scope.newJSON.length-1) + "]");
					
					
					$scope.thumbs = jsonObject;

					//scroll down to view newly retrieved data
					$('html, body').animate({scrollTop:$(document).height()}, 1000);
					
			});

		};
		$scope.goGet = function() {
			var promise = myService.getImages();
			promise.then(function(data) {
		    	// console.log(data);
		    	let jsonObject = JSON.parse(data.substr(0, data.length-1) + "]");
		    	$scope.thumbs = jsonObject;
		    	$scope.newJSON = data;
			});
		};
		$scope.goGet();
	}]);




angular
	.module('ngGallery')
	.controller('gallCtrl', ['$scope', '$http', function ($scope, $http) {
		var location = 'York';
    	var apiUrl = encodeURI('http://maps.googleapis.com/maps/api/geocode/json?address=' + location);
    	var imgArray = new Array(),
			titleArray = new Array(),
			descriptionArray = new Array(), i = 0, newJSON;

    	$http.get(apiUrl).success(function(response){
    		
    		
    		// $filter('filter')(lat.results, {})
    		lat = response.results[0]['geometry']['location']['lat'];
    		lon = response.results[0]['geometry']['location']['lng'];
    		// console.log(lat);
    		// console.log(lon);

    		newJSON = '[';
    		flckrKey = 'b30f2299fbe2a166e4beb4da659c792d';
    		apiUrl2 = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&per_page=12&extras=url_m,description&api_key=' + flckrKey + '&lat=' + lat + '&lon=' + lon;
    		$http.get(apiUrl2).success(function(response){
    			$(response).find('photo').each(function() {
    				imgArray[i] = $(this).attr('url_m');
    				titleArray[i] = $(this).attr('title');
    				var thisDesc = $(this).find('description').text();
    				thisDesc = thisDesc.replace(/[\n\r]/g, '');                   
    				descriptionArray[i] = thisDesc.slice(0,139);
    				//console.log(descriptionArray[i]);
    				newJSON += '{"imgFull":"' + imgArray[i] + '",';
    				// newJSON += '{"imgFull":"#",';
    				newJSON += '"imgSrc":"' + imgArray[i] + '",';
    				newJSON += '"title":"' + titleArray[i] + '",';
    				newJSON += '"description":"' + descriptionArray[i] + '"},';
    				
    				i++;
    				
    			});
    			newJSON = newJSON.substr(0, newJSON.length-1);
    			newJSON += "]";
    			//console.log(newJSON);
    			let jsonObject = JSON.parse(newJSON);
    			// console.log(jsonObject);
    			
    			$scope.thumbs = jsonObject;
    			//updateMain();
    		});
    	});
	
	// $scope.thumbs = [
	// 	{
	// 		"imgFull": "images/fulls/01.jpg",
	// 		"imgSrc": "images/thumbs/01.jpg",
	// 		"title": "",
	// 		"description": ""
	// 	},
	// 	{
	// 		"imgFull": "images/fulls/02.jpg",
	// 		"imgSrc": "images/thumbs/02.jpg",
	// 		"title": "",
	// 		"description": ""
	// 	},
	// 	{
	// 		"imgFull": "images/fulls/03.jpg",
	// 		"imgSrc": "images/thumbs/03.jpg",
	// 		"title": "",
	// 		"description": ""
	// 	},
	// 	{
	// 		"imgFull": "images/fulls/04.jpg",
	// 		"imgSrc": "images/thumbs/04.jpg",
	// 		"title": "",
	// 		"description": ""
	// 	},
	// 	{
	// 		"imgFull": "images/fulls/05.jpg",
	// 		"imgSrc": "images/thumbs/05.jpg",
	// 		"title": "",
	// 		"description": ""
	// 	},
	// 	{
	// 		"imgFull": "images/fulls/06.jpg",
	// 		"imgSrc": "images/thumbs/06.jpg",
	// 		"title": "",
	// 		"description": ""
	// 	},
	// 	{
	// 		"imgFull": "images/fulls/07.jpg",
	// 		"imgSrc": "images/thumbs/07.jpg",
	// 		"title": "",
	// 		"description": ""
	// 	},
	// 	{
	// 		"imgFull": "images/fulls/08.jpg",
	// 		"imgSrc": "images/thumbs/08.jpg",
	// 		"title": "",
	// 		"description": ""
	// 	},
	// 	{
	// 		"imgFull": "images/fulls/09.jpg",
	// 		"imgSrc": "images/thumbs/09.jpg",
	// 		"title": "",
	// 		"description": ""
	// 	},
	// 	{
	// 		"imgFull": "images/fulls/10.jpg",
	// 		"imgSrc": "images/thumbs/10.jpg",
	// 		"title": "",
	// 		"description": ""
	// 	},
	// 	{
	// 			"imgFull": "images/fulls/11.jpg",
	// 			"imgSrc": "images/thumbs/11.jpg",
	// 			"title": "",
	// 			"description": ""
	// 	},
	// 	{
	// 			"imgFull": "images/fulls/12.jpg",
	// 			"imgSrc": "images/thumbs/12.jpg",
	// 			"title": "",
	// 			"description": ""
	// 	}

	// ];		
}]);