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

      var others = this.state.players.to_array();
      var player = this.state.add_player(socket.clientid);

      socket.join(this.id);   

      socket.on("disconnect", function(){        
        this.on_player_disconnected(socket.clientid);
      }.bind(this));
      
      socket.emit('entered-game', {roomid:this.id, me:player, others: others});  

      socket.broadcast.to(this.id).emit('player-joined', { player: player } );  
    },  

    on_player_disconnected : function(clientid){

      var player = this.state.find_player(clientid);

      this.state.remove_player(player.id);
      
      this.io.sockets.in(this.id).emit('player-left', { player: player } );  
      
    }
    
  };

  return GameServer;

});





