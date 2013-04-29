

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(["./../core/player", './../core/pool', './../core/math-functions'], 

function(Player, Pool, math_functions) {
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
            x : math_functions.toFixed(x * (this.playerspeed * 0.015), 3),
            y : math_functions.toFixed(y * (this.playerspeed * 0.015), 3)
        };

    },


    calculate_direction_vector : function( inputs ) {

        //It's possible to have recieved multiple inputs by now,
        //so we process each one
        var x_dir = 0;
        var y_dir = 0;
        var ic = inputs.length;
        if(ic) {
          console.log(ic);
            for(var j = 0; j < ic; ++j) {
               
                var input = inputs[j].inputs;
                var c = input.length;
                for(var i = 0; i < c; ++i) {
                    var key = input[i];
                    if(key == 'l') {
                        x_dir -= 1;
                    }
                    if(key == 'r') {
                        x_dir += 1;
                    }
                    if(key == 'd') {
                        y_dir += 1;
                    }
                    if(key == 'u') {
                        y_dir -= 1;
                    }
                } //for all input values

            } //for each input command
        } //if we have inputs

        return {x_dir: x_dir, y_dir:y_dir};       
    }

    
  };

  return GameState;
 
});


 