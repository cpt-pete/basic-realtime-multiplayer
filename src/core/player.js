if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
  'use strict';  

  function Player(playerid) {
    this.id = playerid;
    this.pos = {x:0, y:0};
    this.inputs = [];
    this.last_input_time = null;
    this.last_input_seq = null;
  }  

  Player.prototype.properties = function(){
    return { 
      id : this.id, 
      pos : this.pos 
    }
  }

  return Player;
 
});