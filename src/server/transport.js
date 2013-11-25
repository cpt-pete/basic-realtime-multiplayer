/*jshint node:true */
/*jshint -W079 */
/*global define */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['socket.io', 'events'], function (socketio, events) {

  'use strict'; 
  
  function Transport(webserver){  
    
    this.no_of_connections = 0; 
    this.sockets = {};

    var io = this.io = socketio.listen(webserver);

    io.configure(function (){ 

      io.set('transports', ['websocket']);
      io.set('heartbeats', true);
      io.set('heartbeat timeout', 20);
      io.set('heartbeat interval', 10);
      io.set('log level', 0);
      io.set('authorization', function (handshakeData, callback) {
        callback(null, true); // error first callback style
      });
      
    });

    io.sockets.on('connection', function(socket){
      this.no_of_connections++; 

      socket.client_id = this.no_of_connections;        
      this.sockets[socket.client_id] = socket;
      this.emit('connection', socket.client_id);

      socket.on('disconnect', function(){
        delete this.sockets[socket.client_id];
        this.emit('disconnect', socket.client_id);
      }.bind(this));

    }.bind(this));

  }

  var proto = Transport.prototype = new events.EventEmitter();

  proto.client_left = function(server_id, client_id){
    this.io.sockets['in'](server_id).emit('event', { name:'player-left', data: client_id } );
  };

  proto.client_joined = function(server_id, client_id, player_snapshot){
    var socket = this.sockets[client_id];
    socket.broadcast.to(this.room_id).emit('event', { name:'player-joined', data: player_snapshot } );    
  };

  proto.join_server = function(server_id, client_id, initial_state){
    var socket = this.sockets[client_id];
    socket.join(server_id);

    socket.on('move', function(data){
      this.emit('move', {client_id: socket.client_id, data: data });      
    }.bind(this));

    socket.emit('event', {name:"joined", data:{state:initial_state, id:client_id}});
  };

  proto.update_room = function(server_id, update){
    this.io.sockets['in'](server_id).emit('onserverupdate', update);
  };

  proto.good_move = function(client_id, time){
    var socket = this.sockets[client_id];
    socket.emit('good_move', time );
  };

  proto.ajust_move = function(client_id, ajustment){
    var socket = this.sockets[client_id];
    socket.emit('ajust_move', ajustment );
  };
  
  return Transport;

});

