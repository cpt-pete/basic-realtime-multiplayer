/*jshint -W079 */
/*global define, module, require: true */

if (typeof define !== 'function') {  var define = require('amdefine')(module); }

define(
["./move-store", "./point", "./vector-functions", "./math-functions"],
function(MoveStore, Point, vectors, math) {
  'use strict';  

  function Player(data) { 
    this.id = data.id; 
    this.pos = new Point(data.pos.x, data.pos.y);
    this.vel = new Point();
    this.accel = new Point();
    this.moves = new MoveStore();
    this.speed = 100;
    this.colour = data.colour;
  }  

  Player.prototype = {

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

  
    apply_move : function( move ){
      var c = move.length;    

      this.accel.nill();

      for(var i = 0; i < c; ++i) {
        var key = move[i];
        if(key === 'l') {
          this.accel.x -= this.speed;
        }
        if(key === 'r') {
          this.accel.x += this.speed;
        }
        if(key === 'd') {
          this.accel.y += this.speed;
        }
        if(key === 'u') {
          this.accel.y -= this.speed;
        }
      } 
    },


    update :function(delta){

      var tick_result = this.simulate_tick(delta);
  
      this.pos = tick_result.pos;
      this.vel = tick_result.vel;     
    },

    simulate_tick: function( delta ){

      var friction = 0.88;

      var new_pos = this.pos.clone();
      var new_vel = this.vel.clone();

      new_pos.x += this.vel.x * delta; 
      new_pos.y += this.vel.y * delta; 

      new_pos.toFixed();  

      new_vel.x += this.accel.x;
      new_vel.y += this.accel.y;
      
      new_vel.toFixed(); 

      var speed = Math.sqrt(new_vel.x*new_vel.x + new_vel.y*new_vel.y)   ;  

      if(speed > friction){
        new_vel.x *= friction;
        new_vel.y *= friction;
      }
      else{
        new_vel.nill();
      } 

      new_vel.toFixed();      
      new_pos.toFixed();   

      this.constrain_to_world( new_pos, new_vel );  
      
      return{pos:new_pos, vel:new_vel, accel:this.accel};     
    },

    process_update : function(target, target_time, past, past_time, delta, time){

      var difference = target_time - time;
      var max_difference = target_time - past_time;
      var time_point = math.toFixed(difference/max_difference, 3);

      var past_pos = new Point(past.pos.x, past.pos.y);
      var target_pos = new Point(target.pos.x, target.pos.y);

      var pos = Point.lerp(target_pos, past_pos, time_point);  
      var smoothed = Point.lerp(this.pos, pos, delta*20);

      this.pos = smoothed;             
    },

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