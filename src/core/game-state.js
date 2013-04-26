

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(["./../core/player", './../core/pool'], 

function(Player, Pool) {
  'use strict';  
  
  function GameState() {
    this.h = 500;
    this.w = 400;
    this.players = new Pool();
  }

  GameState.prototype = {

    add_players: function(d){

      var players_data = [];
      var new_players = [];
      
      // if just 1 player, pretend it's an array
      if(d.hasOwnProperty("length") === false){
        players_data.push(d);
      }

      for(var i = 0; i < players_data.length; i++){         

        var player = this._create_player(players_data[i]);

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
       player.inputs.push({inputs:inputs, time:input_time, seq:input_seq});
    },

    _create_player: function(data){
      var player = new Player(data.id);   

      
      player.pos.x = data.pos.x;
      player.pos.y = data.pos.y;

      return player;
    }

  };

  return GameState;
 
});


 