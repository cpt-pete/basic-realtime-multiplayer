

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(["./../core/player", './../core/pool'], function(Player, Pool) {
  'use strict';  
  
  function GameState() {
    this.h = 500;
    this.w = 400;
    this.players = new Pool();
  }

  GameState.prototype = {

    add_player: function(playerid){
      var player = new Player(playerid);    

      player.pos.x = Math.round( Math.random() * this.h );  
      player.pos.y = Math.round( Math.random() * this.w );

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


 