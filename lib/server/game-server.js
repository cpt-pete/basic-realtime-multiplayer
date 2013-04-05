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
    this.id = null;
    this.io = io;
    this.state = new GameState();
  }

  GameServer.prototype = {
    
  };

  return GameServer;

});





