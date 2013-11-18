/*jshint -W079 */
/*global define, module, require: true */

if (typeof define !== 'function') {  var define = require('amdefine')(module); }

define(["./../core/player", './../core/pool', './../core/math-functions'], 

function(Player, Pool, math) {
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

    store_input : function(playerid, inputs, input_time, input_seq) {
       var player = this.find_player(playerid);
       player.input_store.add(inputs, input_time, input_seq);
    },

    physics_movement_vector_from_direction : function(x,y) {

        //Must be fixed step, at physics sync speed.
        return {
            x : math.toFixed(x * (this.playerspeed * 0.015), 3),
            y : math.toFixed(y * (this.playerspeed * 0.015), 3)
        };

    },

    constrain_to_world : function( item ) {

            //Left wall.
        if(item.pos.x <= 0) {
            item.pos.x = 0;
        }

            //Right wall
        if(item.pos.x >= this.w ) {
            item.pos.x = this.w;
        }
        
            //Roof wall.
        if(item.pos.y <= 0) {
            item.pos.y = 0;
        }

            //Floor wall
        if(item.pos.y >= this.h ) {
            item.pos.y = this.h;
        }

            //Fixed point helps be more deterministic
        item.pos.x = math.toFixed(item.pos.x, 4);
        item.pos.y = math.toFixed(item.pos.y, 4);
        
    },

    calculate_direction_vector : function( inputs ) {
       
        var x_dir = 0;
        var y_dir = 0;
        var ic = inputs.length;

        for(var j = 0; j < ic; ++j) {
           
            var input = inputs[j].inputs;
            var c = input.length;

            for(var i = 0; i < c; ++i) {
                var key = input[i];
                if(key === 'l') {
                    x_dir -= 1;
                }
                if(key === 'r') {
                    x_dir += 1;
                }
                if(key === 'd') {
                    y_dir += 1;
                }
                if(key === 'u') {
                    y_dir -= 1;
                }
            } 

        } 
        
        return {x_dir: x_dir, y_dir:y_dir};       
    }
  };

  return GameState;
 
});


 