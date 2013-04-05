/*jshint node:true */
/*global define: true */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
  ['./../server/web-server', 'socket.io', 'node-uuid', './../core/pool', './../server/game-server'], 
  function ( webserver, socketio, UUID, Pool, GameServer) {

  'use strict'; 
  
  var server, io;

  function GameLobby(port){   
    this.games = new Pool(); 
    server = webserver(port);
    this.setupSocket();    
  }

  GameLobby.prototype = {

    setupSocket : function(){
      var self = this;

      io = socketio.listen(server);

      io.configure(function (){

        io.set('log level', 0);

        io.set('authorization', function (handshakeData, callback) {
          callback(null, true); // error first callback style
        });

      });

      io.sockets.on('connection', function(socket){
        socket.clientid = UUID();

        var game = self.find_server_with_capacity();
        
        if(game === null){
          game = self.createGame(socket);
        }    

        self.addPlayer(game, socket.clientid);
      });
    },

    createGame : function(socket){
      var game = new GameServer(io);
      game.id = UUID();  

      this.games.add(game, game.id);

      return game;
    },

    addPlayer : function(game, playerid){
       game.state.addPlayer(playerid);       
      
    },

    find_server_with_capacity : function(){
      var gameId, games = this.games.all();
      var match = null;

      for(gameId in games){
        var game = games[gameId];
        if(games.hasOwnProperty(gameId) === false) continue;
     
        if(game.state.players.count() < 2){
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





