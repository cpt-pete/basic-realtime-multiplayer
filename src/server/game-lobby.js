/*jshint node:true */
/*global define: true */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
  [ './../core/pool', './../server/game-server'], 
  function ( Pool, GameServer) {

  'use strict'; 
  
  function GameLobby(io){   
    this.io = io;
    this.games = new Pool(); 
    this.total_games = 0;
  }  

  GameLobby.prototype = {

    find_game: function(socket){
      var game = this.find_server_with_capacity();
      
      if(game === null){
        game = this.create_game();        
        this.games.add(game, game.id);
        game.start();
      }

      game.add_player(socket);        
    },

    create_game : function(){
      this.total_games++;
      var id = this.total_games;
      var game = new GameServer(this.io, id);   
      return game;
    },

    find_server_with_capacity : function(){
      var i, gameId, games = this.games.as_array();
      var match = null;
      var count = games.length;

      for(i = 0; i < count; i++){
      
        var game = games[i];
       
        if(game.state.players.as_array().length < game.max_players){
          match = game;
          break;
        }
      }

      return match;
    }

  };
 
  return GameLobby;

});





