/*jshint -W079 */
/*global define, module, require: true */

if (typeof define !== 'function') {  var define = require('amdefine')(module); }

define(["./../core/player", './../core/pool', './../core/math-functions', './../core/vector-functions', './../core/point'], 

function(Player, Pool, math, vectors, Point) {
  'use strict';  

  var ENV;
  
  function GameState(env) {  
    ENV = env;
    this.h = 500;
    this.w = 400;
    this.players = new Pool();

  }

  GameState.prototype = {


    start: function(){
      this.start_time = new Date().getTime();
      console.log(this.start_time);
    },

    stop: function(){

    },

    time: function(){
      return new Date().getTime() - this.start_time;
    },

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

   
   
    client_update: function(delta, me){
      /*var players = this.players.as_array();
      var l = players.length;

      for(var i = 0; i < l; i++){
        var player = players[i];
        if(player.id !== me.id){
          player.update(delta);
        }
      }*/
    },

    server_update: function(delta){
      
    }

    /*,

    direction_vector_for_moves_array : function( moves_array ) {
       
        var total_vector = new Point();      
        var ic = moves_array.length;

        for(var j = 0; j < ic; ++j) {
           
            var moves = moves_array[j].moves;
            var v = this.direction_vector(moves);

            total_vector.add(v);            
        } 
        
        return total_vector;    
    }*/
  };

  return GameState;
 
});


 