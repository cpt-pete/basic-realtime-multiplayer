/*jshint node:true */
/*global define: true */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
  ['./../core/game-state'], 
  function ( GameState) {

  'use strict'; 

 
  function GameServer(io){        
    this.state = new GameState();
    this.max_players = 3;
    this.id = null;
    this.io = io;
  }

  GameServer.prototype = {

    add_player : function(socket){ 

      this.state.add_players({
        id:socket.clientid, 
        pos:{
          x:Math.random() * this.state.w,
          y:Math.random() * this.state.h
        }
      });

      var player = this.state.find_player(socket.clientid);

      this._join_room(socket, player);

      //game.player_client.send('s.r.'+ String(game.gamecore.local_time).replace('.','-'));

    },  

    on_player_disconnected : function(clientid){

      var player = this.state.find_player(clientid);

      this.state.remove_player(player.id);
      
      this.io.sockets.in(this.id).emit('player-left', { playerid: player.id } );  
      
    },

    onMessage : function(client,message) {

          //Cut the message up into sub components
      var message_parts = message.split('.');
          //The first is always the type of message
      var message_type = message_parts[0];

      if(message_type === 'i') {
              //Input handler will forward this
        this.onInput(client, message_parts);
      } else if(message_type === 'p') {
        client.send('s.p.' + message_parts[1]);
      } 

    },

    onInput : function(client, parts) {
      //The input commands come in like u-l,
      //so we split them up into separate commands,
      //and then update the players
      var input_commands = parts[1].split('-');
      var input_time = parts[2].replace('-','.');
      var input_seq = parts[3];

      this.store_input(client.id, input_commands, input_time, input_seq);
    },

    _join_room: function(socket, player){
      
      socket.join(this.id);   

      socket.on("disconnect", function(){        
        this.on_player_disconnected(socket.clientid);
      }.bind(this));

      this._send_initial_state(socket, player);      
      this._inform_players_of_new_player(socket, player);
    },

    _send_initial_state: function(socket, player){
      var others = this.state.players.to_array()
        .filter(
          function(p){ return (p.id !== player.id); }
        )
        .map(
          function(p){ return p.properties(); }
        );
      socket.emit('entered-game', {room_id:this.id, me:player.properties(), others: others});  
    },

    _inform_players_of_new_player: function(socket, player){
      socket.broadcast.to(this.id).emit('player-joined', { player: player.properties() } );  
    }

    
  };

  return GameServer;

});





