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
      this.update_loop = new DeltaTimer(this.data.physics_rate, this.update.bind(this));
      this.broadcast_loop = new DeltaTimer(this.data.broadcast_rate, this.broadcast_state.bind(this));
    },

    stop: function(){
      this.update_loop.stop();
      this.broadcast_loop.stop();
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

      this.sockets[player.id] = socket;

      this.moves[player.id] = [];

      this._join_room(socket, player);      
      this._broadcast_initial_state(socket, player);      
      this._broadcast_player_joined(socket, player);
    },     

    server_move: function(socket, player, time, move, accel, pos){     
      player.apply_move(move);
      var move_result = player.simulate_tick(this.data.physics_delta);
      this.send_client_ajustment(socket, move_result, time, pos);       
    },
  
    update : function() {

      var players = this.state.players.as_array();
      var count = players.length;

      for (var i = 0; i < count; i++) {  

        var player = players[i];

        if(this.moves[player.id].length){      

          var icount = this.moves[player.id].length;

          var move_data, move, time, pos, move_result;   
          var socket = this.sockets[player.id];

          for(var j = 0; j < icount; j++){    
            
            move_data = this.moves[player.id][j].move_data;
            move = move_data.m;      
            time = move_data.t;   
            pos = move_data.p;   

            player.apply_move( move );
            
           // move_result = player.simulate_tick( this.data.physics_delta );            
          }

          /*if(icount){
            this.send_client_ajustment(socket, move_result, time, pos);                 
          }*/
        }

        this.moves[player.id] = [];
      }
        

      this.state.update(this.data.physics_delta);
     /* var players = this.state.players.as_array();
      var count = players.length;

      for (var i = 0; i < count; i++) {        

        var player = players[i];

        if(player.moves.any() === false){
          continue;
        }

        var new_dir = this.state.direction_vector_for_moves_array( player.moves.all() );
        var resulting_vector = this.state.movement_vector( new_dir.x_dir, new_dir.y_dir );
        var pos = vectors.v_add(player.pos, resulting_vector);

        player.pos.fromObject(pos);  

        this.state.constrain_to_world(player);

        player.moves.mark_all_processed();        
        player.moves.clear();
      }*/
    },

    send_client_ajustment : function(socket, move_result, time, pos){      
      if(move_result.pos.equals(pos)){
        this.send_client_message( socket, "good_move", time );
      }
      else{
        console.log("ajust", time, move_result.pos.toObject(),  pos);
        this.send_client_message(
          socket, 
          "ajust_move", 
          {
            t: time,
            p: move_result.pos.toObject(),
            v: move_result.vel.toObject()
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

      var players = this.state.players
        .as_array()
        .filter(
          function(p){ return (p.updated === true); }
        );

      var state = {};
      var count = players.length;

      if(count === 0){
        return;
      }

      for(var i = 0; i < count; i++){
        var player = players[i];        
        player.updated = false;

        state[player.id] = { 
          pos: player.pos.toObject(),
          is: player.moves.processed_seq
        };
      }
      
      var update = {
        s: state,
        t: time
      };

     // this.io.sockets['in'](this.room_id).emit('onserverupdate', update);

    },    

    // note: we're reliying on clients update loop to determine speed of server moves
    // possible for user to send more requests than are possible, resulting in a speed hack
    // need to add detection to ensure updates aren't too frequent
    _on_server_move_received : function(socket, move_data){      
      var player = this.state.find_player(socket.clientid);  

      this.moves[player.id].push({socket:socket, move_data:move_data});

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





