/*jshint -W079 */
/*global define, module, require: true */

if (typeof define !== 'function') {  var define = require('amdefine')(module); }

define(
["./move-store", "./point", "./player-controller"],
function( MoveStore, Point, PlayerController ) {
  'use strict';  

  function Player(data) { 
    this.id = data.id; 
    this.pos = new Point(data.pos.x, data.pos.y);
    this.vel = new Point();
    this.accel = new Point();
    this.moves = new MoveStore();
    this.speed = 100;
    this.colour = data.colour;
    this.controller = new PlayerController(this);
  }  

  Player.prototype = {

    toObject : function() {
      return { 
        id : this.id, 
        pos : this.pos.toObject(),
        colour: this.colour
      };
    }
  };  

  return Player;
 
});