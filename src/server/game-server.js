/*jshint node:true */
/*jshint -W079 */
/*global define */

if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(
  ['./../core/state', "underscore", './../core/utils/delta-timer', './../core/player', "./../core/world", "./../core/utils/math-functions"],
  function ( State, _, DeltaTimer, Player, World, math) {

  'use strict';

  var defaults = {
    physics_rate: 15,
    physics_delta: 15 / 1000,
    broadcast_rate: 100
  };

  function GameServer(transport, id, options){

    this.data = _.extend(defaults, options);

    this.player_count = 0;
    this.max_players = 3;
    this.id = id;
    this.room_id = "g" + this.id;
    this.transport = transport;

    this.transport.on("disconnect", function(client_id){
      this._on_player_disconnected(client_id);
    }.bind(this));

    this.transport.on("move", function(data){
      this._on_server_move_received(data.client_id, data.data);
    }.bind(this));

  }

  GameServer.prototype = {

    start: function(){
      this.update_loop = new DeltaTimer(this.data.physics_rate, function(){});
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

    add_player : function(clientId){

      var player = new Player({
        id: clientId,
        pos:{
          x: math.toFixed( Math.random() * this.world.w, 3 ),
          y: math.toFixed( Math.random() * this.world.h, 3 )
        },
        colour: '#' + (0x1000000 + Math.random() * 0xFFFFFF).toString(16).substr(1,6)
      });

      this.state.add ( player );
      this.player_count++;

      this.join(clientId, player);
    },

    server_move: function(client_id, player, time, move, client_accel, client_pos){
      player.controller.apply_move(move, this.data.physics_delta);

      if(player.pos.equals(client_pos)){
        this.transport.good_move( client_id, time );
      }
      else{
        this.transport.ajust_move(
          client_id,
          {
            t: time,
            p: player.pos.toObject(),
            v: player.vel.toObject()
          }
        );
      }
    },

    broadcast_state : function(){

      // get player state, compare with master - broadcast difference
      var time = this.time();

      var update = {
        s: this.state.snapshot(),
        t: time
      };

      this.transport.update_room(this.room_id, update);

    },

    // note: we're reliying on clients update loop to determine speed of server moves
    // possible for user to send more requests than are possible, resulting in a speed hack
    // need to add detection to ensure updates aren't too frequent
    _on_server_move_received : function(client_id, move_data){
      var player = this.state.find(client_id);

      // possible to receive this event after the player has disconnected
      if(player === null){
        return;
      }

      this.server_move(client_id, player, move_data.t, move_data.m, move_data.a, move_data.p);
    },

    _on_player_disconnected : function(client_id){

      var player = this.state.find(client_id);
      this.state.remove(player.id);
      this.player_count--;

      this.transport.client_left(this.room_id, client_id);
    },

    join: function(client_id, player){

      var initial_state = this.state.snapshot();
      this.transport.join_server(this.room_id, client_id, initial_state);

      var player_snapshot = player.snapshot();
      this.transport.client_joined(this.room_id, client_id, player_snapshot);
    }

  };

  return GameServer;

});





