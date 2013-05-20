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
    this.speed = 400;
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

    apply_move: function(  move, delta ){
      this.accel = this.calculate_acceleration( move );
      var result = this.tick_result(delta);     

      return {pos:result.pos, vel: result.vel, accel:this.accel };
    },
   
    calculate_acceleration : function( moves ){
      var c = moves.length;
      var v = new Point();      

      for(var i = 0; i < c; ++i) {
        var key = moves[i];
        if(key === 'l') {
          v.x -= this.speed;
        }
        if(key === 'r') {
          v.x += this.speed;
        }
        if(key === 'd') {
          v.y += this.speed;
        }
        if(key === 'u') {
          v.y -= this.speed;
        }
      } 

      return v;
    },


    tick_and_apply :function(delta){

      var result = this.tick_result(delta);

      this.accel.nill();
      this.pos = result.pos;
      this.vel = result.vel;     
    },

    tick_result: function( delta ){
      var new_pos = this.pos.clone();
      var new_vel = this.vel.clone();

      new_pos.x += this.vel.x * delta; 
      new_pos.y += this.vel.y * delta; 
      new_vel.x += this.accel.x * delta;
      new_vel.y += this.accel.y * delta;
      
      new_vel.toFixed();      
      new_pos.toFixed();   

      this.constrain_to_world( new_pos, new_vel );  
      
      return{pos:new_pos, vel:new_vel};     
    },

    process_update : function(target, past, delta, time, smooth){
      
      var distance = vectors.v_distance(target.pos, this.pos);     

     // var target_pos = target.pos;
     // var past_pos = past.pos;    
     // var ago = math.toFixed(target.t - time, 3);
      var time_point = 0.1;

      if ( distance > 20.0 ){
         time_point = 0.7;
      }
      else if ( distance > 10.0 ){
         time_point = 0.5;
      }
      else if ( distance > 0.1 ){
        time_point = 0.3;   
      }
           
      var lerped_pos = vectors.v_lerp( past.pos, target.pos, time_point );
      var actual_pos = vectors.v_lerp( this.pos, lerped_pos, delta * smooth);   

      this.pos.fromObject(actual_pos);
     

      
    },

    toObject : function() {
      return { 
        id : this.id, 
        pos : this.pos.toObject() 
      };
    }
  };  

  return Player;
 
});