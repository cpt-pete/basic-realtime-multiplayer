/*jshint node:true */
/*jshint -W079 */
/*global define */

if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(
  ['./../core/game-state', "underscore", './../core/vector-functions', './../core/point', './../core/delta-timer'], 
  function ( GameState, _, vectors, Point, DeltaTimer) {

  'use strict';

  var defaults = {
    physics_rate: 15,
    physics_delta: 15 / 1000,
    broadcast_rate: 100
  }; 

  function GameServer(io, id, options){     

    this.data = _.extend(defaults, options);

    this.state = new GameState();
    this.max_players = 3;
    this.id = id;
    this.room_id = "g" + this.id;
    this.io = io;

    this.moves = {};
    this.sockets = {};
  }

  GameServer.prototype = {

    start: function(){
      this.state.start();
      this.update_loop = new DeltaTimer(this.data.physics_rate, this.update.bind(this));
      this.broadcast_loop = new DeltaTimer(this.data.broadcast_rate, this.broadcast_state.bind(this));
    },

    stop: function(){
      this.state.stop();
      this.update_loop.stop();
      this.broadcast_loop.stop();
    },

    add_player : function(socket){ 
      
      this.state.add_players([{
        id:socket.clientid, 
        pos:{
          x:Math.random() * this.state.w,
          y:Math.random() * this.state.h
        },
        colour: '#' + (0x1000000 + Math.random() * 0xFFFFFF).toString(16).substr(1,6)
      }]);

      var player = this.state.find_player(socket.clientid);

      this.sockets[player.id] = socket;

      this.moves[player.id] = [];

      this._join_room(socket, player);      
      this._broadcast_initial_state(socket, player);      
      this._broadcast_player_joined(socket, player);
    },     

    server_move: function(socket, player, time, move, client_accel, client_pos){     
      player.apply_move(move);
      player.update(this.data.physics_delta);
      this.send_client_ajustment(socket, player.pos, player.vel, time, client_pos);       
    },
  
    update : function() {
      this.state.server_update(this.data.physics_delta);   
    },

    send_client_ajustment : function(socket, server_pos, server_vel, time, client_pos){ 
    //console.log(arguments);     
      if(server_pos.equals(client_pos)){

        this.send_client_message( socket, "good_move", time );
      }
      else{
   //     console.log("ajust", time, server_pos.toObject(),  client_pos);
        this.send_client_message(
          socket, 
          "ajust_move", 
          {
            t: time,
            p: server_pos.toObject(),
            v: server_vel.toObject()
          }
        );
      }
    },

    send_client_message : function(socket, message, data){    
      setTimeout(function(){
        socket.emit( message, data );
      }, 0);      
    },

    broadcast_state : function(delta, time){

      var players = this.state.players.as_array() ;       
      var state = {};
      var count = players.length;
   
      for(var i = 0; i < count; i++){
        var player = players[i];  

        state[player.id] = { 
          pos: player.pos.toObject(),
          vel: player.vel.toObject()
        };
      }
      
      var update = {
        s: state,
        t: time
      };

      this.io.sockets['in'](this.room_id).emit('onserverupdate', update);

    },    

    // note: we're reliying on clients update loop to determine speed of server moves
    // possible for user to send more requests than are possible, resulting in a speed hack
    // need to add detection to ensure updates aren't too frequent
    _on_server_move_received : function(socket, move_data){      
      var player = this.state.find_player(socket.clientid);  

     // this.moves[player.id].push({socket:socket, move_data:move_data});

      this.server_move(socket, player, move_data.t, move_data.m, move_data.a, move_data.p);
    },

    _on_player_disconnected : function(clientid){

      var player = this.state.find_player(clientid);

      this.state.remove_player(player.id);
      
      this.io.sockets['in'](this.room_id).emit('player-left', { playerid: player.id } );  
      
    },    
    
    _join_room: function(socket, player){
      
      socket.join(this.room_id);   

      socket.on("disconnect", function(){        
        this._on_player_disconnected(socket.clientid);
      }.bind(this));

      socket.on("server_move", function(data){
        this._on_server_move_received(socket, data);
      }.bind(this));     

    },

    _broadcast_initial_state: function(socket, player){

      var others = this.state.players.as_array()
        .filter(
          function(p){ return (p.id !== player.id); }
        )
        .map(
          function(p){ return p.toObject(); }
        );
      socket.emit('entered-game', {room_id:this.room_id, me:player.toObject(), others: others});  
    },

    _broadcast_player_joined: function(socket, player){
      socket.broadcast.to(this.room_id).emit('player-joined', { player: player.toObject() } );  
    }

  };

  return GameServer;

});





