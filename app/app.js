'use strict';

// Declare app level module which depends on views, and components
var musicApp = angular.module('myApp', [
  //'myApp.search'
]);

musicApp.controller('musicSearchCtrl', ['$scope', '$http', function($scope, $http){
  $http.get('/private/songs.json').success(function(data){
    $scope.availableSongs = data;
  });

  $scope.searchQuery = '';
  $scope.searchOrderBy = 'artist';
}]);
