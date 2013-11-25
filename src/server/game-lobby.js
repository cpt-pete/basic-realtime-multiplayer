/*jshint node:true */
/*jshint -W079 */
/*global define */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
  [ './../core/utils/pool', './../server/game-server'], 
  function ( Pool, GameServer) {

  'use strict'; 
  
  function GameLobby(transport){   
    this.transport = transport;
    this.games = new Pool(); 
    this.total_games = 0;

    transport.on('connection', this.find_game.bind(this));
  }  

  GameLobby.prototype = {

    find_game: function(client_id){
      var game = this._find_server_with_capacity();
      
      if(game === null){
        game = this._create_game();        
        this.games.add(game, game.id);
        game.start();
      }

      game.add_player(client_id);        
    },

    _create_game : function(){
      this.total_games++;
      var id = this.total_games;
      var game = new GameServer(this.transport, id);   
      return game;
    },

    _find_server_with_capacity : function(){
      var i, gameId, games = this.games.as_array();
      var match = null;
      var count = games.length;

      for(i = 0; i < count; i++){
      
        var game = games[i];
       
        if(game.has_capacity()){
          match = game;
          break;
        }
      }

      return match;
    }

  };
 
  return GameLobby;

});





