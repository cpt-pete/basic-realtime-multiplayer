if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
  'use strict';  

  function Player(playerid) {
    this.id = playerid;
    this.cheese = "bob";
  }

  var proto = Player.prototype;

  proto.draw = function () {
  
     
  };

  return Player;
 
});