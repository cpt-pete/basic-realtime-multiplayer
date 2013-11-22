/*jshint node:true */
/*jshint -W079 */
/*global define */

if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(
  ['./../core/state', "underscore", './../core/delta-timer', './../core/player', "./../core/world", "./../core/math-functions"],
  function ( State, _,  DeltaTimer, Player, World, math) {

  'use strict';

  var defaults = {
    physics_rate: 15,
    physics_delta: 15 / 1000,
    broadcast_rate: 100
  };

  function GameServer(io, id, options){

    this.data = _.extend(defaults, options);

    this.player_count = 0;
    this.max_players = 3;
    this.id = id;
    this.room_id = "g" + this.id;
    this.io = io;

    io.set('transports', ['websocket']);
    io.set('heartbeats', true);
    io.set('heartbeat timeout', 20);
    io.set('heartbeat interval', 10);

  }

  GameServer.prototype = {

    start: function(){
      this.update_loop = new DeltaTimer(this.data.physics_rate, this.update.bind(this));
      this.broadcast_loop = new DeltaTimer(this.data.broadcast_rate, this.broadcast_state.bind(this));

      this.state = new State();
      this.world = new World(400, 500);

      this.start_time = new Date().getTime();
    },

    stop: function(){
      this.update_loop.stop();
      this.broadcast_loop.stop();

      delete this.state;
    },

    has_capacity: function(){
      return this.player_count < this.max_players;
    },

    time: function(){
      return new Date().getTime() - this.start_time;
    },

    add_player : function(socket){

      var player = new Player({
        id: socket.clientid,
        pos:{
          x: math.toFixed( Math.random() * this.world.w, 3 ),
          y: math.toFixed( Math.random() * this.world.h, 3)
        },
        colour: '#' + (0x1000000 + Math.random() * 0xFFFFFF).toString(16).substr(1,6)
      });

      this.state.add ( player );
      this.player_count++;
      //this.state._default.add( Player.default_snapshot( player ) );

      this.join_room(socket, player);
    },

    server_move: function(socket, player, time, move, client_accel, client_pos){
      player.controller.apply_move(move, this.data.physics_delta);

      this.send_client_ajustment(socket, player.pos, player.vel, time, client_pos);
    },

    update : function() {
     // this.state.server_update(this.data.physics_delta);
    },

    send_client_ajustment : function(socket, server_pos, server_vel, time, client_pos){
      if(server_pos.equals(client_pos)){
        this.send_client_message( socket, "good_move", time );
      }
      else{
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

    broadcast_state : function(){

      // get player state, compare with master - broadcast difference
      var time = this.time();

      var update = {
        s: this.state.snapshot(),
        t: time
      };

      this.io.sockets['in'](this.room_id).emit('onserverupdate', update);

    },

    // note: we're reliying on clients update loop to determine speed of server moves
    // possible for user to send more requests than are possible, resulting in a speed hack
    // need to add detection to ensure updates aren't too frequent
    _on_server_move_received : function(socket, move_data){
      var player = this.state.find(socket.clientid);

      // possible to receive this event after the player has disconnected
      if(player === null){
        return;
      }

      this.server_move(socket, player, move_data.t, move_data.m, move_data.a, move_data.p);
    },

    _on_player_disconnected : function(clientid){
      console.log('disconnect', clientid);
      var player = this.state.find(clientid);
      this.state.remove(player.id);
      this.player_count--;
      console.log('disconnected', player.id, this.player_count);

      this.io.sockets['in'](this.room_id).emit('event', { name:"player-left", data: player.id } );
    },

    join_room: function(socket, player){
      console.log('joined', player.id);
      socket.on("disconnect", function(){
        this._on_player_disconnected(socket.clientid);
      }.bind(this));

      socket.on("server_move", function(data){
        this._on_server_move_received(socket, data);
      }.bind(this));

      socket.join(this.room_id);

      var snapshot = player.snapshot();

      socket.emit('event', {name:"joined", data:{state:this.state.snapshot(), id:player.id}});
      socket.broadcast.to(this.room_id).emit('event', { name:"player-joined", data: snapshot } );

      // need to broadcast existing state to person who joined
    }

  };

  return GameServer;

});





