/*jshint -W079 */
/*global define, module, require: true */

if (typeof define !== 'function') {  var define = require('amdefine')(module); }

define(["./../core/player", './../core/pool', './../core/math-functions', './../core/vector-functions', './../core/point'], 

function(Player, Pool, math, vectors, Point) {
  'use strict';  
  
  function GameState() {
    this.h = 500;
    this.w = 400;
    this.players = new Pool();
    this.playerspeed = 200;
  }

  GameState.prototype = {

    add_players: function(players_data){

      var new_players = [];
      
      for(var i = 0; i < players_data.length; i++){         
        var player = new Player(players_data[i]);
        this.players.add(player, player.id);
        new_players.push(player);
      }
     
      return new_players;   
    },

    find_player: function(playerid){
      return this.players.find_by_id(playerid);
    },

    remove_player: function(playerid){
      this.players.remove(playerid);    
    },   

    constrain_to_world : function( pos, vel ) {

            //Left wall.
        if(pos.x <= 0) {
            pos.x = 0;
            vel.x = 0;
        }

            //Right wall
        if(pos.x >= this.w ) {
            pos.x = this.w;
            vel.x = 0;
        }
        
            //Roof wall.
        if(pos.y <= 0) {
            pos.y = 0;
            vel.y = 0;
        }

            //Floor wall
        if(pos.y >= this.h ) {
            pos.y = this.h;
            vel.y = 0;
        }      
    },

    calculate_move: function( pos, vel, move, delta ){
      var accel = this.calculate_acceleration( move );

      var a = this.move_tick(pos, vel, accel, delta);

      return {pos:a.pos, vel: a.vel, accel:accel };
    },

    tick: function(delta){
      var players = this.players.as_array();
      var l = players.length;

      for(var i = 0; i < l; i++){
        var player = players[i];
        var a = this.move_tick(player.pos, player.vel, player.accel, delta);

        
        player.pos = a.pos;
        player.vel = a.vel;     
      }

    },

    move_tick: function(pos, vel, accel, delta){
     
      var friction = 0.9;
      
      var new_vel = new Point();
      new_vel.x = delta * accel.x;
      new_vel.y = delta * accel.y;

      new_vel.x = math.toFixed(new_vel.x, 3);
      new_vel.y = math.toFixed(new_vel.y, 3);

      var new_pos = new Point();
      new_pos.x = delta * vel.x + pos.x;
      new_pos.y = delta * vel.y + pos.y;

      new_pos.x = math.toFixed(new_pos.x, 3);
      new_pos.y = math.toFixed(new_pos.y, 3);

      this.constrain_to_world( new_pos, new_vel );  
      
      return{pos:new_pos, vel:new_vel};     
    },

    calculate_acceleration : function( moves ){
      var c = moves.length;
      var v = new Point();      

      for(var i = 0; i < c; ++i) {
        var key = moves[i];
        if(key === 'l') {
          v.x -= this.playerspeed;
        }
        if(key === 'r') {
          v.x += this.playerspeed;
        }
        if(key === 'd') {
          v.y += this.playerspeed;
        }
        if(key === 'u') {
          v.y -= this.playerspeed;
        }
      } 

      return v;
    },

    direction_vector_for_moves_array : function( moves_array ) {
       
        var total_vector = new Point();      
        var ic = moves_array.length;

        for(var j = 0; j < ic; ++j) {
           
            var moves = moves_array[j].moves;
            var v = this.direction_vector(moves);

            total_vector.add(v);            
        } 
        
        return total_vector;    
    }
  };

  return GameState;
 
});


 