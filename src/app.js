/*jshint node:true */
/*jshint -W079 */
/*global define */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
  ['./server/web-server', 'socket.io', "./server/game-lobby"], 
  function (webserver, socketio, GameLobby) {

  'use strict';

  var io, server = webserver(process.env.PORT || 5000);
  var lobby;
  var no_of_connections = 0;

  io = socketio.listen(server);

  io.configure(function (){ 

    io.set('log level', 0);
    io.set('authorization', function (handshakeData, callback) {
      callback(null, true); // error first callback style
    });

  });

  io.sockets.on('connection', function(socket){
    no_of_connections++; 
    socket.clientid = no_of_connections; 
    lobby.find_game(socket);    
  });

  lobby = new GameLobby(io);
    
});
