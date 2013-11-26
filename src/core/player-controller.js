/*jshint -W079 */
/*global define, module, require: true */

if (typeof define !== 'function') {  var define = require('amdefine')(module); }

define(
["./utils/point"],
function(Point) {
  'use strict';  

  function PlayerController(player) { 
    this.player = player;
  }  

  PlayerController.prototype = {

     constrain_to_world : function( pos, vel ) {

        //Left wall.
        if(pos.x < 0) {
            pos.x = 0;
            vel.x = 0;
        }

        //Right wall
        if(pos.x > 400 ) {
            pos.x = 400;
            vel.x = 0;
        }
        
        //Roof wall.
        if(pos.y < 0) {
            pos.y = 0;
            vel.y = 0;
        }

        //Floor wall
        if(pos.y > 500 ) {
            pos.y = 500;
            vel.y = 0;
        }      
    },
  
    apply_move : function( move, delta ){
      this.update_forces(move, this.player);
      this.update(delta, this.player);      
      this.constrain_to_world( this.player.pos, this.player.vel );  
    },

    update_forces: function(move, player){
      var c = move.length;    

      player.accel.nill();

      for(var i = 0; i < c; ++i) {
        var key = move[i];
        if(key === 'l') {
          player.accel.x -= player.speed;
        }
        if(key === 'r') {
          player.accel.x += player.speed;
        }
        if(key === 'd') {
          player.accel.y += player.speed;
        }
        if(key === 'u') {
          player.accel.y -= player.speed;
        }
      } 
    },

    update :function(delta, player){
    
      var friction = 0.88;

      player.pos.x += player.vel.x * delta; 
      player.pos.y += player.vel.y * delta; 

      player.pos.toFixed();  

      player.vel.x += player.accel.x;
      player.vel.y += player.accel.y;
      
      player.vel.toFixed(); 

      var speed = Math.sqrt(player.vel.x*player.vel.x + player.vel.y*player.vel.y);  

      if(speed > friction){
        player.vel.x *= friction;
        player.vel.y *= friction;
        player.vel.toFixed();
      }
      else{
        player.vel.nill();
      } 
         
    }
  };  

  return PlayerController;
 
});