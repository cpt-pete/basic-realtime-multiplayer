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
      
    apply_move : function( move, delta ){
      // calculate acceleration based on the the input provided
      this.update_forces(move, this.player);
      // update the position and velocity
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
     
      // updated position based on our current velocity
      player.pos.x += player.vel.x * delta; 
      player.pos.y += player.vel.y * delta; 

      // fix result to X decimal places, defaults to 3 decimal places. More than what we need for accuracy.
      // this is important as it makes our result smaller which cuts down amount of data which needs to be transfered
      // also helps make floating point accuracy more deterministic.  Not all processors calculate floating point results the same 
      player.pos.toFixed();  

      // update velocity based on acceleration
      player.vel.x += player.accel.x;
      player.vel.y += player.accel.y;
      
      player.vel.toFixed(); 

      // work out how fast we're moving
      var speed = Math.sqrt(player.vel.x*player.vel.x + player.vel.y*player.vel.y);  
      var friction = 0.88;

      // if we're moving faster than friction then let our movement by affected by friction
      if(speed > friction){
        player.vel.x *= friction;
        player.vel.y *= friction;
        player.vel.toFixed();
      }
      // if we're not moving very fast just kill the velocity to stop us dead. 
      else{
        player.vel.nill();
      } 
         
    },

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
    }
  };  

  return PlayerController;
 
});