
/*global define: true */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
["./input-store", "./point"],
function(InputStore, Point) {
  'use strict';  

  function Player(data) { 
    this.id = data.id; 
    this.pos = new Point(data.pos.x, data.pos.y);
    this.old_state = this.pos.clone();
    this.cur_state = this.pos.clone();
    this.state_time = new Date().getTime();
    this.input_store = new InputStore();
  }  

  Player.prototype.toObject = function() {
    return { 
      id : this.id, 
      pos : this.pos.toObject() 
    };
  };  

  return Player;
 
});