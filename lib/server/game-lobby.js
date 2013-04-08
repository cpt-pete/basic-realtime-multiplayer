/*jshint node:true */
/*global define: true */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
  [ 'node-uuid', './../core/pool', './../server/game-server'], 
  function (  UUID, Pool, GameServer) {

  'use strict'; 
  
  function GameLobby(io){   
    this.io = io;
    this.games = new Pool(); 
  }  

  GameLobby.prototype = {

    find_game: function(socket){
      var game = this.find_server_with_capacity();
      
      if(game === null){
        game = this.create_game();
        this.games.add(game, game.id);
      }    

      game.add_player(socket);        
    },

    

    create_game : function(){
      var game = new GameServer(this.io);
      game.id = UUID();      
      return game;
    },

    find_server_with_capacity : function(){
      var gameId, games = this.games.all();
      var match = null;

      for(gameId in games){
        var game = games[gameId];

        if(games.hasOwnProperty(gameId) === false){ continue; }
     
        if(game.state.players.count() < game.max_players){
          match = game;
          break;
        }
      }

      return match;
    }

  };

 

 /* var onMessage = function(client,message) {

    //Cut the message up into sub components
    var message_parts = message.split('.');
    //The first is always the type of message
    var message_type = message_parts[0];

    if(message_type == 'i') {
        //Input handler will forward this
      onInput(client, message_parts);
    } else if(message_type == 'p') {
      client.send('s.p.' + message_parts[1]);
    } 

  }; //game_server.onMessage

  var onInput = function(client, parts) {
    //The input commands come in like u-l,
    //so we split them up into separate commands,
    //and then update the players
    var input_commands = parts[1].split('-');
    var input_time = parts[2].replace('-','.');
    var input_seq = parts[3];

    //the client should be in a game, so
    //we can tell that game to handle the input
    if(client && client.game && client.game.gamecore) {
      client.game.gamecore.handle_server_input(client, input_commands, input_time, input_seq);
    }

  }; //game_server.onInput*/

 
   
 
  return GameLobby;

});





