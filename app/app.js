'use strict';

// Declare app level module which depends on views, and components
var musicApp = angular.module('myApp', [
  //'myApp.search'
]);

// The playlist Controller is a super scope that other controllers will need access to
musicApp.controller('playlistCtrl', ['$scope', function($scope){
  $scope.playlist = [];
  $scope.songDB = {};

  /**
   * Append a song to the end of the playlist
   * @param songID
   */
  $scope.appendSong = function (songID) {
    $scope.playlist.push($scope.songDB[songID]);
  };

  $scope.removeSong = function (songIndex) {
    $scope.playlist.splice(songIndex, 1);
  }

}]);

musicApp.controller('playerCtrl', ['$scope', '$interval', function ($scope, $interval) {
  $scope.currentSong = null;
  $scope.currentSongIndex = -1;
  $scope.currentTrackTime = 0; // How much has been played
  $scope.currentTrackPercent = 0;

  $scope.$watch('currentTrackTime', calcTrackPercent);

  $scope.playerState = 'stopped';

  var durationIndicatorTimeout = undefined;

  $scope.setCurrentTrack = function(playlistIndex) {
    if (playlistIndex >= $scope.playlist.length || playlistIndex < 0) {
      return;
    }
    $scope.currentSong =  $scope.playlist[playlistIndex];
    $scope.currentSongIndex = playlistIndex;
    $scope.currentTrackTime= 0;
  };



  $scope.onPlaylistClick = function($event){
    var songIndex;

    if ($event.target.className.match('playSong')) {
      songIndex = parseInt($event.target.dataset.songIndex, 10);
      $scope.setCurrentTrack(songIndex);
      $scope.play();
    }
    else if ($event.target.className.match('playlistRemoveTrack')) {
      songIndex = parseInt($event.target.dataset.songIndex, 10);

      // Keep the view in sync with the changes to the playlist
      if (songIndex === $scope.currentSongIndex) {
        $scope.next();
      }
      if (songIndex <= $scope.currentSongIndex) {
        $scope.currentSongIndex--;
      }

      $scope.removeSong(songIndex);
    }
  };

  $scope.play = function(){

    if ($scope.playlist.length <= 0) {
      return;
    }

    if (!$scope.currentSong) {
      $scope.setCurrentTrack(0);
    }
    playMusic();
  };

  $scope.pause = function(){
    pauseMusic();
  };
  $scope.stop = function(){
    stopMusic();
  };
  $scope.prev = function(){
    $scope.setCurrentTrack($scope.currentSongIndex - 1);

  };
  $scope.next = function(){
    $scope.setCurrentTrack($scope.currentSongIndex + 1);
  };


  function playMusic(){
    // This would play the actual music file
    // instead it just moves the duration indicator

    if (angular.isDefined(durationIndicatorTimeout)) {
      return;
    }

    durationIndicatorTimeout = $interval(function(){
      if ($scope.currentTrackTime >= $scope.currentSong.duration) {
        if ($scope.currentSongIndex >= $scope.playlist.length) {
          stopMusic();
        }
        else {
          return $scope.next();
        }
      }
      $scope.currentTrackTime += 1; // simulate adding a second to the play duration
      calcTrackPercent();

      //console.info('TrackTime: ', $scope.currentTrackTime);
    }, 1000);

    $scope.playerState = 'playing';
  }

  function pauseMusic(){
    if (angular.isDefined(durationIndicatorTimeout)) {
      $interval.cancel(durationIndicatorTimeout);
      durationIndicatorTimeout = undefined;
    }

    $scope.playerState = 'paused';
  }

  function stopMusic(){
    if (angular.isDefined(durationIndicatorTimeout)) {
      $interval.cancel(durationIndicatorTimeout);
      durationIndicatorTimeout = undefined;
    }
    $scope.currentTrackTime = 0;
    $scope.playerState = 'stopped';
  }

  function calcTrackPercent() {
    $scope.currentTrackPercent = Math.round($scope.currentTrackTime / $scope.currentSong.duration * 100);
  }

}]);

musicApp.controller('musicSearchCtrl', ['$scope', '$http', function($scope, $http){
  $http.get('/private/songs.json').success(function(data){
    $scope.availableSongs = data;
    _.forEach(data, function(song){
      $scope.songDB[song.id] = song;
    });
  });

  $scope.searchResultsClick = function($event) {
    console.info('Broser event: ', $event);

    if ($event.target.className.match('addSong')) {
      $scope.appendSong($event.target.dataset.songId);
    }
  };

  $scope.availableSongs = [];
  $scope.searchQuery = '';
  $scope.searchOrderBy = 'artist';
}]);
