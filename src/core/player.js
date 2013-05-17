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
  //  this.old_state = this.pos.clone();
  //  this.cur_state = this.pos.clone();
   // this.state_time = new Date().getTime();
    this.moves = new MoveStore();
    this.updated = false;
  }  

  Player.prototype = {

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