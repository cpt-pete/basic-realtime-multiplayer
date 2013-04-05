/*jshint node:true */
/*global define: true */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
  ["./server/game-lobby"], 
  function (GameLobby) {

  'use strict';

  var lobby = new GameLobby(4004);
    
});
