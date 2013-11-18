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

      var friction = 0.8;

      var new_pos = this.pos.clone();
      var new_vel = this.vel.clone();

      new_pos.x += this.vel.x * delta; 
      new_pos.y += this.vel.y * delta; 

      new_pos.toFixed();  

      new_vel.x += this.accel.x;
      new_vel.y += this.accel.y;
      
      new_vel.toFixed(); 

      var speed = Math.sqrt(new_vel.x*new_vel.x + new_vel.y*new_vel.y)

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