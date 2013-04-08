

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(["./../core/player", './../core/pool'], function(Player, Pool) {
  'use strict';  
  
  function GameState() {
    this.players = new Pool();
  }

  GameState.prototype = {

    add_player: function(playerid){
      var player = new Player(playerid);      
      this.players.add(player, player.id); 
      return player;   
    },

    find_player: function(playerid){
      return this.players.find_by_id(playerid);
    },

    remove_player: function(playerid){
      this.players.remove(playerid);    
    }

  };

  return GameState;
 
});


 