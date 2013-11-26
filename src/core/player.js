/*jshint -W079 */
/*global define, module, require: true */

if (typeof define !== 'function') {  var define = require('amdefine')(module); }

define(
["./move-store", "./utils/point", "./player-controller"],
function( MoveStore, Point, PlayerController ) {
  'use strict';  

  function Player(data) { 
    this.id = data.id;

    this.pos = new Point(data.pos.x, data.pos.y);
    this.colour = data.colour;

    this.vel = new Point();
    this.accel = new Point();

    this.speed = 100;
    
    this.moves = new MoveStore();    
    this.controller = new PlayerController(this);
  }  

  Player.prototype = {
  
    snapshot : function(){
      return Player.snapshot(this);
    },

    render: function(c){
      c.fillStyle = this.colour;
      c.fillRect( this.pos.x - 5, this.pos.y - 5, 10, 10 );          
    }
  };  

  Player.from_snapshot = function(snapshot){
    return new Player({
      id: snapshot.id,
      pos: {x: snapshot.pos.x, y:snapshot.pos.y},
      colour: snapshot.colour
    });
  };

  Player.snapshot = function(player){
    return{
      id: player.id,
      pos: player.pos.toObject(),
      colour: player.colour
    };
  };

  return Player;
 
});