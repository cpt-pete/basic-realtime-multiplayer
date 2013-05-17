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
    this.playerspeed = 400;
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
        if(pos.x < 0) {
            pos.x = 0;
            vel.x = 0;
        }

            //Right wall
        if(pos.x > this.w ) {
            pos.x = this.w;
            vel.x = 0;
        }
        
            //Roof wall.
        if(pos.y < 0) {
            pos.y = 0;
            vel.y = 0;
        }

            //Floor wall
        if(pos.y > this.h ) {
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

        player.accel.nill();
        player.pos = a.pos;
        player.vel = a.vel;     
      }

    },

    move_tick: function(pos, vel, accel, delta){
     
      var new_vel = vel.clone();
      var new_pos = pos.clone();

      new_pos.x += vel.x * delta; 
      new_pos.y += vel.y * delta; 
      new_vel.x += accel.x * delta;
      new_vel.y += accel.y * delta;
/*
      
      new_vel.x = delta * accel.x + vel.x;
      new_vel.y = delta * accel.y + vel.y;

      new_vel.x = new_vel.x * friction;
      new_vel.y = new_vel.y * friction;

      console.log(new_vel.toString(), accel.toString());

      
      new_pos.x = delta * new_vel.x + pos.x;
      new_pos.y = delta * new_vel.y + pos.y;*/

      new_vel.toFixed();      
      new_pos.toFixed();   

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


 