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
							.replace(/[\n\r]/g, '')
							.slice(0,69);
						
						// remove quotes and carriage returns from inside of description and limit to 140 characters
						var thisDesc = $(this).find('description').text()
							.replace(/"/g, "") 
							.replace(/[\n\r]/g, '')
							.slice(0,139);

						// if (!thisDesc) thisDesc = thisTitle;

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



