/*jshint node:true */
/*global define: true */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function () {
  'use strict'; 

  var games = [];

  function GamePool(){
  }

  var proto = GamePool.prototype;

  proto.add = function(game){
    games.push(game);
  };

  proto.remove = function(gameId){
    var game = this.findById(gameId);
    var index = games.indexOf(game);

    if(index === -1) {
      throw "Game not found " + gameId;
    }

    games.splice(index, 1);
  };

  proto.findById = function(gameId){
     for(var i = 0; i < games.length; i++){
      if(games[i].id === gameId) {
        return games[i];
      }
    }
    return null;
  };

  proto.findWithCapacity = function(){
    for(var i = 0; i < games.length; i++){
      if(games[i].players.length < 2) {
        return games[i];
      }
    }
    return null;
  };

  return GamePool;

});