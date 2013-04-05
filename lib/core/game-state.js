

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(["./../core/player", './../core/pool'], function(Player, Pool) {
  'use strict';  
  
  function GameState() {
    this.players = new Pool();
  }

  GameState.prototype = {
    addPlayer: function(playerid){
      var player = new Player(playerid);
      this.players.add(player, player.id);
    },

    removePlayer: function(playerid){
      this.players.remove(playerid);    
    }

  };

  return GameState;
 
});


 