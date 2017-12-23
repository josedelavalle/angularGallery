var app = angular
	.module('ngGallery', ['ngMap', 'ui.bootstrap'])
	.factory("galleryFactory", ['$http', '$window', '$q', function($http, $window, $q) {
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
	                    }, {maximumAge:60000,timeout:5000});
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
	        getImagesByLoc: function(page_num, lat, lon) {
	            var flckrKey = 'b30f2299fbe2a166e4beb4da659c792d';
	            return $http.get('https://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&nojsoncallback=1&per_page=12&page='+page_num+'&extras=url_m,description&api_key=' + flckrKey + '&lat=' + lat + '&lon=' + lon);
	        },
	        getImagesByTerm: function(page_num, searchTerm) {
	            var flckrKey = 'b30f2299fbe2a166e4beb4da659c792d';
	            return $http.get('https://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&nojsoncallback=1&per_page=12&page='+page_num+'&extras=url_m,description&api_key=' + flckrKey + '&text=' + searchTerm);
	        }
	    };
	}])
	.controller('modalController', ['$scope', '$uibModalInstance', 'items', 'currentIndex', function($scope, $uibModalInstance, items, currentIndex) {
		console.log('modal controller', items);
		$scope.items = items;
		$scope.currentIndex = currentIndex;

		$scope.cancel = function () {
			$uibModalInstance.dismiss();
		};

		$scope.goNext = function(e) {
			e.stopPropagation();
			$scope.currentIndex++;
			if ($scope.currentIndex >= $scope.items.length) {
				$scope.currentIndex = 0;
			}
			console.log(e, $scope.currentIndex);
		};
		$scope.goPrev = function(e) {
			e.stopPropagation();
			$scope.currentIndex--;
			if ($scope.currentIndex < 0) {
				$scope.currentIndex = $scope.items.length - 1;
			}
			console.log(e, $scope.currentIndex);
		};

		$scope.$on('more-clicked', function() {
			console.log('more clicked event heard')
			$scope.cancel();
		});
	}])
	.controller('galleryController', ['$scope', '$http', 'galleryFactory', 'NgMap', '$uibModal', '$window', function($scope, $http, galleryFactory, NgMap, $uibModal, $window) {
		
		// $scope.thumbs = {};
		$scope.defaultSearch = "technology";
		$scope.page_num = 1;
		$scope.per_page = 12;
		$scope.newJSON = '[';
		$scope.userLocation = {};
		$scope.thumbs = [];
		
		angular.element($window).bind("scroll", function() {
		    var windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
		    var body = document.body, html = document.documentElement;
		    var docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight,  html.scrollHeight, html.offsetHeight);
		    windowBottom = windowHeight + window.pageYOffset;
		    if (windowBottom >= docHeight) {
		        $scope.go(true);
		    }
		});

		$('#inputBox').bind("enterKey",function(e){
		   $scope.go('person');
		});
		$('#inputBox').keyup(function(e){
		    if(e.keyCode == 13)
		    {
		        $(this).trigger("enterKey");
		    }
		});

		$scope.openModal = function (ndx) {
			
			var modalInstance = $uibModal.open({
      		  templateUrl: '/modal.html',
		      controller: 'modalController',
		      windowClass: 'large-Modal',
		      resolve: {
		        items: function () {
		          return $scope.thumbs;
		        },
		        currentIndex: function () {
		        	return ndx;
		        }
		      }
			});
		};
		$scope.searching = false;

		$scope.goGetUserLocation = function() {
			galleryFactory.getUserLocation().then(function(res) {
				console.log('got user location', res);
				var usercoords = res.coords.latitude + "," + res.coords.longitude;
				$scope.userLocation.lat = res.coords.latitude;
				$scope.userLocation.lon = res.coords.longitude;
				$scope.searching = false;
				doReverseGeocode(usercoords);
				getImagesByLoc($scope.page_num, res.coords.latitude, res.coords.longitude);
			}).catch(function(e) {
				console.log('error getting user location', e);
				galleryFactory.getUserLocationBackup().then(function(res) {
					console.log('got user location backup', res);
					var usercoords = res.data.loc;
					$scope.userCoords = usercoords;
					$scope.searching = false;
					doReverseGeocode(usercoords);
					var x = usercoords.split(',');
					$scope.userLocation.lat = x[0];
					$scope.userLocation.lon = x[1];
					getImagesByLoc($scope.page_num, x[0], x[1]);
				}).catch(function(e) {
					console.log('error getting user location backup', e);
				});
			});
		}
		$scope.goGetUserLocation();

		function doReverseGeocode(data) {
			galleryFactory.reverseGecode(data).then(function(res) {
				console.log('reversegeocode', res);
				var ret = parseGeocode(res);
				return ret;
				//var loc = $scope.userCoords.split(',');
				
			}).catch(function(e) {
				console.log('error reverse geocoding', e);
			});
		}

		function parseGeocode(res) {
			for (var i = 0; i < res.data.results[0].address_components.length; i++) {
	            var component = res.data.results[0].address_components[i];
	            if (component.types[0] == "locality") {
	                var usercity = component.long_name;
	            }
	            if (component.types[0] == "administrative_area_level_1") {
	                var userstate = component.long_name;
	            }
	            
	        }
	        if (usercity) {
	            $scope.userLocation.address = usercity;
	        } else {
	            $scope.userLocation.address = "";
	        }
	        if (userstate) {
	            if (usercity) {
	                $scope.userLocation.address += ", ";
	            }
	            $scope.userLocation.address += userstate;
	        }

	        return $scope.userLocation.address;
		}

		$scope.$watch('userLocation.address', function(data) {
			console.log('new loc: ', data);
			$scope.searchTerm = data;
		});

		var getImagesByTerm = function (page_num, searchTerm) {
			console.log('search for ', searchTerm);
			galleryFactory.getImagesByTerm(page_num, searchTerm).then(function(res) {
				console.log('got images', res.data.photos.photo.length);
				if (res.data.photos.photo.length == 0) {
					alert('nothing found');
				} else {
					for (var i = 0; i < res.data.photos.photo.length; i++) {
						var item = res.data.photos.photo[i];
						$scope.thumbs.push(item);	
					}
				}
				$scope.searching = false;

			}).catch(function (e) {
				console.log('error getting images, e');
			});
		};

		var getImagesByLoc = function (page_num, lat, lon) {
			console.log('getting images', Date());
			galleryFactory.getImagesByLoc(page_num, lat, lon).then(function(res) {
				console.log('got images', res.data.photos.photo.length);
				if (res.data.photos.photo.length == 0) {
					alert('nothing found');
				} else {
					for (var i = 0; i < res.data.photos.photo.length; i++) {
						var item = res.data.photos.photo[i];
						$scope.thumbs.push(item);	
					}
				}
				$scope.searching = false;

			}).catch(function (e) {
				console.log('error getting images, e');
			});
		};

		$scope.clear = function() {
			$scope.thumbs = [];
			$scope.page_num = 1;
		};

		$scope.go = function (ismore) {
			$scope.$emit('more-clicked');
			console.log($scope);
			if (!ismore) $scope.clear();
			$('#closer').click();
			$scope.searching = true;
			console.log($scope.searchTerm, $scope.userLocation.address);
			if ($scope.searchTerm !== $scope.userLocation.address) {
				getImagesByTerm(++$scope.page_num, $scope.searchTerm);
			} else {
				var lat = $scope.userLocation.lat;
				var lon = $scope.userLocation.lon;
				getImagesByLoc(++$scope.page_num, lat, lon);
			}
			
			//scroll down to view newly retrieved data
			if (ismore) $('html, body').animate({scrollTop:$(document).height()}, 1000);
		};

		NgMap.getMap().then(function(map) {
			$scope.map = map;
			console.log(map);
	    	console.log(map.getCenter());
		    console.log('markers', map.markers);
		    console.log('shapes', map.shapes);
		});

		$scope.getCurrentLocation = function(e) {
			$scope.pos = this.getPosition();
     		console.log($scope.pos.lat(),$scope.pos.lng());
		    $scope.userLocation.lat = e.latLng.lat();
		    $scope.userLocation.lon = e.latLng.lng();
		    $scope.searchTerm = doReverseGeocode($scope.pos.lat() + ',' + $scope.pos.lng());
		    
		};

		$scope.goold = function(typeOfSearch) {
			console.log(typeOfSearch);
			$scope.page_num++;
			// console.log('page: ' + $scope.page_num);
			
			flckrKey = 'b30f2299fbe2a166e4beb4da659c792d';
			var userInput = "", newJSON;
			userInput = $('#inputBox').val();
			if (!userInput) {
				userInput = $scope.defaultSearch;
			}
			

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
					//console.log('got images', response);
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
		// $scope.goGet = function(search) {
		// 	var promise = myService.getImages(search);
		// 	promise.then(function(data) {
		    	
		//     	let jsonObject = JSON.parse(data.substr(0, data.length-1) + "]");
		//     	$scope.thumbs = jsonObject;
		//     	console.log('thumbs', $scope.thumbs);
		//     	$scope.newJSON = data;
		// 	});
		// };
		
	}]);



