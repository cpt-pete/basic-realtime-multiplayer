/*jshint node:true */
/*jshint -W079 */
/*global define */

if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(
  ['./../core/game-state', './../core/vector-functions', './../core/point', './../core/delta-timer'], 
  function ( GameState, vector_utils, Point, DeltaTimer) {

  'use strict'; 

  function GameServer(io, id){        
    this.state = new GameState();
    this.max_players = 3;
    this.id = id;
    this.room_id = "g" + this.id;
    this.io = io;
  }

  GameServer.prototype = {

    start: function(){
      this.physics_loop = new DeltaTimer(15, this.update_physics.bind(this));
      this.broadcast_loop = new DeltaTimer(45, this.broadcast_state.bind(this));
    },

    stop: function(){
      this.physics_loop.stop();
      this.update_loop.stop();
    },

    add_player : function(socket){ 

      this.state.add_players([{
        id:socket.clientid, 
        pos:{
          x:Math.random() * this.state.w,
          y:Math.random() * this.state.h
        }
      }]);

      var player = this.state.find_player(socket.clientid);

      this._join_room(socket, player);      
      this._broadcast_initial_state(socket, player);      
      this._broadcast_player_joined(socket, player);
    },  

    update_physics : function() {

      var players = this.state.players.as_array();
      var count = players.length;

      for (var i = 0; i < count; i++) {        

        var player = players[i];

        if(player.input_store.inputs.length === 0){
          continue;
        }

        var new_dir = this.state.calculate_direction_vector(player.input_store.inputs);
        var resulting_vector = this.state.physics_movement_vector_from_direction(new_dir.x_dir, new_dir.y_dir);
        var pos = vector_utils.v_add(player.pos, resulting_vector);

        player.pos.x = pos.x;
        player.pos.y = pos.y;

        player.input_store.mark_all_processed();

        this.state.constrain_to_world(player);

        player.input_store.clear();
      }
    },

    broadcast_state : function(delta, time){

      var players = this.state.players.as_array();

      var state = {};
      var count = players.length;

      for(var i = 0; i < count; i++){
        var player = players[i];

        state[player.id] = { 
          pos: player.pos.toObject(),
          is: player.input_store.processed_input_seq
        };
      }
          console.log(time);
      var update = {
        s: state,
        t: time
      };

      this.io.sockets['in'](this.room_id).emit('onserverupdate', update);

    },    

    _on_message : function(client,message) {

          //Cut the message up into sub components
      var message_parts = message.split('.');
          //The first is always the type of message
      var message_type = message_parts[0];

      if(message_type === 'i') {
              //Input handler will forward this
        this._on_input(client, message_parts);
      }
      else if(message_type === 'p') {
        client.send('s.p.' + message_parts[1]);
      }

    },

    _on_input : function(client, parts) {
      //The input commands come in like u-l,
      //so we split them up into separate commands,
      //and then update the players
      var input_commands = parts[1].split('-');
      var input_time = parts[2].replace('-','.');
      var input_seq = parseInt(parts[3], 10);

      this.state.store_input(client.clientid, input_commands, input_time, input_seq);
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

      socket.on("message", function(m){
        this._on_message(socket, m);
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





