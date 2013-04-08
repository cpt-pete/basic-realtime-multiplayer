/*jshint node:true */
/*global define: true */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
  ['./server/web-server', 'socket.io', "./server/game-lobby", 'node-uuid'], 
  function (webserver, socketio, GameLobby, UUID) {

  'use strict';

  var io, server = webserver(4004);
  var lobby;

  io = socketio.listen(server);

  io.configure(function (){

    io.set('log level', 0);
    io.set('authorization', function (handshakeData, callback) {
      callback(null, true); // error first callback style
    });

  });

  io.sockets.on('connection', function(socket){
    socket.clientid = UUID();

 
    lobby.find_game(socket);    
  });

  lobby = new GameLobby(io);
    
});
