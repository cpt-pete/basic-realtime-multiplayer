/*jshint node:true */
/*global define: true */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
  ['./../core/game-state'], 
  function ( GameState) {

  'use strict'; 

  function GameServer(sio){    
    this.id = null;
    this.sio = sio;
    this.state = new GameState();
  }

  GameServer.prototype = {
    addPlayer : function(client){
      this.state.addPlayer(client);
      sio.emit("onconnected", {bob:"HELLO"});
    }
  };

  return GameServer;

});





