if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
  'use strict';  

  function Player(playerid) {
    this.id = playerid;
    this.pos = {x:0, y:0};
  }
  

  return Player;
 
});